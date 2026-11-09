"""
tag_passages.py
────────────────────────────────────────────────────────────────────────────
section: reading 청크들을 "연속 페이지 그룹" 단위로 묶어 passage_id 메타데이터를 부여합니다.

규칙:
  - 같은 교과서(subject_name) 내에서 페이지 오름차순으로 정렬
  - 연속 청크 간 페이지 간격이 GAP_THRESHOLD 이하이면 같은 본문(passage)으로 간주
  - passage_id 형식: "{short_subject}__pass_p{start_page}"
    예) "공통영어2__pass_p87"  → p.87, p.88, p.89 세 청크가 같은 passage
"""

import re
import sys
import chromadb

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# ── 설정 ────────────────────────────────────────────────────────────────────
GAP_THRESHOLD = 4   # 이 페이지 차이 이하면 같은 본문으로 묶음

# ── ChromaDB 연결 ────────────────────────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_collection("english_textbooks")
print(f"총 청크 수: {collection.count()}")

# ── reading 청크만 가져오기 ───────────────────────────────────────────────────
result = collection.get(
    where={"section": "reading"},
    include=["metadatas"]
)
ids    = result["ids"]
metas  = result["metadatas"]
print(f"reading 청크 수: {len(ids)}")

# ── 교과서별로 그룹화 ─────────────────────────────────────────────────────────
from collections import defaultdict

subject_chunks = defaultdict(list)   # subject_name → [(page, chunk_id), ...]
for cid, meta in zip(ids, metas):
    subj = meta.get("subject_name", "")
    page = int(meta.get("page", 0))
    subject_chunks[subj].append((page, cid))

# ── passage_id 할당 ───────────────────────────────────────────────────────────
# subject_name → 짧은 키 (공백/특수문자 제거)
def make_short_key(subject_name: str) -> str:
    return re.sub(r'[\s()·ⅠⅡ]', '_', subject_name).strip('_')

passage_map: dict[str, str] = {}  # chunk_id → passage_id
passage_stats = []

for subj, chunk_list in subject_chunks.items():
    # 페이지 오름차순 정렬
    chunk_list.sort(key=lambda x: x[0])
    short_key = make_short_key(subj)

    # 연속 페이지 그루핑
    group_start_page = chunk_list[0][0]
    prev_page = chunk_list[0][0]
    current_group = [chunk_list[0][1]]

    def flush_group(group, start_page, sk):
        pid = f"{sk}__pass_p{start_page}"
        for cid in group:
            passage_map[cid] = pid
        passage_stats.append((pid, len(group), start_page, start_page + (group.__len__() * 2)))

    for page, cid in chunk_list[1:]:
        if page - prev_page <= GAP_THRESHOLD:
            # 같은 본문
            current_group.append(cid)
        else:
            # 새 본문 시작 → 이전 그룹 flush
            flush_group(current_group, group_start_page, short_key)
            group_start_page = page
            current_group = [cid]
        prev_page = page

    # 마지막 그룹 flush
    flush_group(current_group, group_start_page, short_key)

print(f"\n생성된 passage 수: {len(passage_stats)}")
print("\n── passage 목록 ──")
for pid, cnt, sp, _ in sorted(passage_stats, key=lambda x: x[0]):
    print(f"  {pid:50s}  ({cnt}개 청크, 시작 p.{sp})")

# ── ChromaDB 메타데이터 업데이트 ───────────────────────────────────────────────
print("\npassage_id 메타데이터 업데이트 중...")

# 배치로 업데이트
BATCH = 200
chunk_ids_to_update = list(passage_map.keys())

for i in range(0, len(chunk_ids_to_update), BATCH):
    batch_ids = chunk_ids_to_update[i:i+BATCH]
    # 현재 메타데이터 가져오기
    current = collection.get(ids=batch_ids, include=["metadatas"])
    new_metas = []
    for meta, cid in zip(current["metadatas"], current["ids"]):
        new_meta = dict(meta)
        new_meta["passage_id"] = passage_map[cid]
        new_metas.append(new_meta)
    collection.update(ids=batch_ids, metadatas=new_metas)
    print(f"  {min(i+BATCH, len(chunk_ids_to_update))}/{len(chunk_ids_to_update)} 완료")

print("\n── 최종 확인: passage_id별 청크 수 ──")
# 샘플 확인
sample = collection.get(
    where={"section": "reading"},
    limit=10,
    include=["metadatas"]
)
for meta in sample["metadatas"]:
    print(f"  p.{meta.get('page','?'):>3} | {meta.get('passage_id','(없음)'):50s} | {meta.get('subject_name','')[:30]}")

print("\npassage_id 태깅 완료!")
print(f"총 {len(passage_map)}개 reading 청크에 passage_id 부여됨")

