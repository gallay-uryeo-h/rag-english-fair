"""
tag_sections.py
────────────────────────────────────────────────────────────────────────────
ChromaDB에 저장된 모든 청크에 'section' 메타데이터 필드를 추가합니다.

섹션 분류 기준:
  faq       — subject_name == '선택과목 FAQ'
  listening — Listen & Speak / Listen and Answer / A: B: 대화 패턴
  grammar   — Language Focus / Language in Use / Structures / Grammar
  vocab     — Words & Expressions / Word Study / 발음기호 패턴
  writing   — Write & Share / Project / Wrap Up / Plan & Present / My Writing
  reading   — 길이 있는 영어 산문체 (위 패턴 없음, >200자)
  other     — 그 외 (목차, 표지, 정답, 별책 부록 등)
"""

import re
import sys
import chromadb

# Windows 콘솔 UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# ── ChromaDB 연결 ────────────────────────────────────────────────────────
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_collection("english_textbooks")
print(f"총 청크 수: {collection.count()}")


# ── 섹션 분류 함수 ───────────────────────────────────────────────────────
def classify_section(doc: str, metadata: dict) -> str:
    """텍스트와 메타데이터를 보고 섹션을 반환한다."""

    subject = metadata.get("subject_name", "")

    # 1) FAQ
    if "FAQ" in subject or "선택과목 FAQ" in subject:
        return "faq"

    text = doc or ""
    text_lower = text.lower()

    # 2) 듣기 (Listening) ─ 대화 스크립트 / Listen 섹션
    listening_patterns = [
        r"listen\s*&\s*speak",
        r"listen\s*and\s*answer",
        r"listen\s*and\s*check",
        r"listen\s*and\s*repeat",
        r"\bscript\b",
        r"^A:\s+",           # 대화 A: B: 패턴
        r"^B:\s+",
        r"^W:\s+",
        r"^M:\s+",
        r"^G:\s+",
        r"^Boy:\s+",
        r"^Girl:\s+",
        r"^Woman:\s+",
        r"^Man:\s+",
        r"\[대본\]",
        r"listen\s*carefully",
    ]
    for pat in listening_patterns:
        if re.search(pat, text, re.IGNORECASE | re.MULTILINE):
            return "listening"

    # 3) 문법 (Grammar)
    grammar_patterns = [
        r"language\s*(focus|in\s*use)",
        r"language\s*use",
        r"\bstructures?\b",
        r"grammar\s*(point|focus|check)",
        r"key\s*expression",
        r"key\s*grammar",
        r"\bsubjunctive\b",
        r"\bparticiple\b",
        r"\bgerund\b",
        r"\binfinitive\b",
        r"\bclause\b",
        r"\bpassive voice\b",
    ]
    for pat in grammar_patterns:
        if re.search(pat, text_lower):
            return "grammar"

    # 4) 어휘 (Vocab)
    vocab_patterns = [
        r"words?\s*&\s*expressions?",
        r"word\s*study",
        r"words?\s*in\s*use",
        r"vocabulary",
        r"\[.+\]",           # 발음기호 패턴 (예: [træˈdɪʃn])
        r":\s+[a-z].+\n[a-z].+\n[a-z]",   # 단어 나열
    ]
    # 발음기호: [ ] 안에 IPA 문자 포함 → vocab 가능성 높음
    phonetic_matches = re.findall(r'\[([^\]]{2,30})\]', text)
    ipa_chars = "æəɪʊɛɔʌɑɒɜːˈˌðθŋʃʒ"
    has_phonetic = any(any(c in m for c in ipa_chars) for m in phonetic_matches)
    if has_phonetic:
        return "vocab"

    for pat in vocab_patterns:
        if re.search(pat, text_lower):
            return "vocab"

    # 5) 쓰기 (Writing)
    writing_patterns = [
        r"write\s*&\s*share",
        r"my\s*writing",
        r"\bwrap\s*up\b",
        r"\bplan\s*&\s*present\b",
        r"\bproject\b",
        r"\bwrite\s*it\s*out\b",
        r"\bdraft\b",
        r"\bpeer\s*review\b",
        r"writing\s*(tip|guide|skill)",
    ]
    for pat in writing_patterns:
        if re.search(pat, text_lower):
            return "writing"

    # 6) 본문 읽기 (Reading) ─ 영어 비중이 있고 길이가 충분한 산문
    # 한글 비율 계산
    korean_chars = len(re.findall(r'[가-힣]', text))
    english_chars = len(re.findall(r'[a-zA-Z]', text))
    total_alpha = korean_chars + english_chars

    if total_alpha > 0:
        english_ratio = english_chars / total_alpha
    else:
        english_ratio = 0

    # 영어 비율 30% 이상, 전체 길이 200자 이상이면 reading 후보
    if english_ratio >= 0.30 and len(text) >= 200:
        # 그런데 short 단어 나열 형태는 vocab일 가능성 → 줄 수 대비 평균 길이 체크
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        avg_line_len = sum(len(l) for l in lines) / max(len(lines), 1)
        # 평균 줄 길이 30자 이상이면 reading (산문), 미만이면 other
        if avg_line_len >= 30:
            return "reading"

    # 7) 그 외
    return "other"


# ── 전체 청크 순회 및 태깅 ───────────────────────────────────────────────
BATCH = 500   # ChromaDB 한 번에 가져올 수
offset = 0
total = collection.count()

section_counts = {
    "faq": 0, "listening": 0, "grammar": 0,
    "vocab": 0, "writing": 0, "reading": 0, "other": 0
}

print(f"\n섹션 분류 시작 (총 {total}개 청크) ...")

while offset < total:
    result = collection.get(
        limit=BATCH,
        offset=offset,
        include=["documents", "metadatas"]
    )
    ids = result["ids"]
    docs = result["documents"]
    metas = result["metadatas"]

    if not ids:
        break

    update_ids = []
    update_metas = []

    for chunk_id, doc, meta in zip(ids, docs, metas):
        section = classify_section(doc, meta)
        section_counts[section] = section_counts.get(section, 0) + 1

        new_meta = dict(meta)
        new_meta["section"] = section
        update_ids.append(chunk_id)
        update_metas.append(new_meta)

    # ChromaDB update
    collection.update(ids=update_ids, metadatas=update_metas)
    print(f"  [{offset + 1} ~ {offset + len(ids)}] 처리 완료")
    offset += BATCH

# ── 결과 출력 ───────────────────────────────────────────────────────────
print("\n=== 섹션 분류 결과 ===")
for sec, cnt in sorted(section_counts.items(), key=lambda x: -x[1]):
    print(f"  {sec:12s}: {cnt:4d}개")

print(f"\n전체: {sum(section_counts.values())}개")

# 샘플 확인 (reading 섹션 3개)
print("\n── reading 섹션 샘플 ──")
samples = collection.get(
    where={"section": "reading"},
    limit=3,
    include=["documents", "metadatas"]
)
for doc, meta in zip(samples["documents"], samples["metadatas"]):
    print(f"  [{meta.get('subject_name','')} p.{meta.get('page','')}] {doc[:80]}...")

print("\n태깅 완료!")
