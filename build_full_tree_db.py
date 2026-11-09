"""
build_full_tree_db.py
────────────────────────────────────────────────────────────────────────────
교과서 전체 청크(1,137개)에 대해 체계적인 트리 구조 메타데이터를 정밀 구축합니다.

계층 트리 구조:
  [교과서 (subject_name)]
    └─ [단원 (unit_number, unit_title)]
         └─ [영역 (section: reading / listening / speaking / grammar / vocab / writing / faq / other)]
              └─ [지문/활동 단위 (passage_id)]
                   └─ [페이지 및 청크 (page, chunk_id)]
"""

import re
import sys
from collections import defaultdict
import chromadb

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

chroma_client = chromadb.PersistentClient(path="./chroma_db")
col = chroma_client.get_collection("english_textbooks")
total_chunks = col.count()
print(f"ChromaDB 연결 완료. 총 청크 수: {total_chunks}")

# ── 1. 교과서별 단원(Unit/Lesson) 페이지 매핑 테이블 ──
TEXTBOOK_UNITS = {
    "공통영어1 (1학년 1학기 · 미래엔 김선영)": [
        (10, 31, 1, "Lesson 1: You and I Become 'We'"),
        (32, 53, 2, "Lesson 2: Open a Book, Open the World"),
        (54, 75, 3, "Lesson 3: Free Yourself with Science"),
        (76, 97, 4, "Lesson 4: Let It Be Green"),
        (98, 128, 99, "Appendix & Supplementary"),
    ],
    "공통영어2 (1학년 2학기 · 미래엔 김선영)": [
        (10, 31, 1, "Lesson 1: We Share, We Care"),
        (32, 53, 2, "Lesson 2: Be a Wise Consumer"),
        (54, 75, 3, "Lesson 3: The True Art Lovers"),
        (76, 97, 4, "Lesson 4: Sink or Swim in the Digital Ocean"),
        (98, 128, 99, "Appendix & Supplementary"),
    ],
    "영어Ⅰ (2학년 1학기 · 엔이능률 오선영)": [
        (8, 33, 1, "Lesson 1: Journey to the Future"),
        (34, 59, 2, "Lesson 2: The Power of Good Habits"),
        (60, 85, 3, "Lesson 3: Let's Live in Harmony"),
        (86, 111, 4, "Lesson 4: Spark Your Creativity"),
        (112, 137, 5, "Lesson 5: Rise Above Challenges"),
        (138, 149, 6, "Special Lesson: The Open Window"),
        (150, 164, 99, "Appendix & Supplementary"),
    ],
    "영어Ⅱ (3학년 1학기 · 능률 오선영)": [
        (8, 33, 1, "Lesson 1: Build a Better World"),
        (34, 59, 2, "Lesson 2: The World of Scientific Discovery"),
        (60, 85, 3, "Lesson 3: Life Is a Sum of Choices"),
        (86, 111, 4, "Lesson 4: Create a Greener Tomorrow"),
        (112, 137, 5, "Lesson 5: Open Your Mind, Defeat Your Biases"),
        (138, 151, 6, "Special Lesson: The Model Millionaire"),
        (152, 168, 99, "Appendix & Supplementary"),
    ],
    "영어독해와작문 (2학년 2학기 · 미래엔 김대진)": [
        (10, 33, 1, "Lesson 1: Discover Who You Are"),
        (34, 57, 2, "Lesson 2: Embrace the Earth"),
        (58, 81, 3, "Lesson 3: Think Critically"),
        (82, 105, 4, "Lesson 4: Appreciate Art"),
        (106, 129, 5, "Lesson 5: Money in Our Lives"),
        (130, 157, 6, "Lesson 6: Explore the Future"),
        (158, 192, 99, "Appendix & Supplementary"),
    ],
    "세계 문화와 영어 (3학년 1학기 · 비상 권혁승)": [
        (8, 17, 0, "Prologue: Intercultural Communication & World Englishes"),
        (18, 39, 1, "Lesson 1: Asia & Middle East"),
        (40, 59, 2, "Lesson 2: Africa: Unlocking Its Potential"),
        (60, 81, 3, "Lesson 3: Europe: Classical Art and Sports"),
        (82, 105, 4, "Lesson 4: North America: High School & Startup"),
        (106, 127, 5, "Lesson 5: South America: Flags & Carnival"),
        (128, 153, 6, "Lesson 6: Oceania: Nature & Marine"),
        (154, 172, 99, "Culture Spectrum & Appendix"),
    ],
}

def determine_unit(subject_name: str, page: int):
    """교과서명과 페이지로부터 (unit_number, unit_title) 반환"""
    if "FAQ" in subject_name:
        return 0, "선택과목 FAQ"
    
    ranges = TEXTBOOK_UNITS.get(subject_name)
    if not ranges:
        return 0, "기본 단원"
    
    for start_p, end_p, u_num, u_title in ranges:
        if start_p <= page <= end_p:
            return u_num, u_title
    
    if page < ranges[0][0]:
        return 0, "Front Matter / 목차"
    return 99, "Appendix & Supplementary"

# ── 2. 정밀 섹션(영역) 분류 함수 ──
def refine_section(doc: str, meta: dict, page: int) -> str:
    subject = meta.get("subject_name", "")
    if "FAQ" in subject:
        return "faq"
    
    text = doc or ""
    text_lower = text.lower()
    
    # 정답/부록/출처/포트폴리오 등은 other로 엄격 분리
    junk_patterns = [
        r"^sources\b", r"^\s*answer keys?\b", r"^\s*answers\b",
        r"^\s*achievement test\b", r"^\s*words\s*&\s*phrases\b",
        r"learning portfolio", r"^\s*contents\b", r"^\s*목차\b",
        r"^\s*self-check\b"
    ]
    for pat in junk_patterns:
        if re.search(pat, text_lower):
            return "other"
    
    # 1) 말하기 (Speaking) 탐지
    speaking_patterns = [
        r"listen\s*&\s*speak", r"search\s*&\s*speak", r"speak\s*&\s*do",
        r"think\s*and\s*talk", r"talk\s*to\s*your\s*partner",
        r"prepare\s*a\s*(short\s*)?speech", r"role-play",
        r"share\s*it\s*with\s*your\s*class", r"discuss\s*with\s*your\s*partner",
        r"talk\s*about", r"view\s*&\s*learn"
    ]
    for pat in speaking_patterns:
        if re.search(pat, text_lower):
            # Listen and answer 같은 대본 중심 청크는 listening 우선
            if not re.search(r"listen\s*(and|&)\s*(answer|check|repeat)|대본|\[대본\]", text_lower):
                return "speaking"

    # 2) 듣기 (Listening)
    listening_patterns = [
        r"listen\s*&\s*speak", r"listen\s*and\s*answer", r"listen\s*and\s*check",
        r"listen\s*and\s*repeat", r"\bscript\b", r"\[대본\]",
        r"^w:\s+", r"^m:\s+", r"^a:\s+", r"^b:\s+", r"^boy:\s+", r"^girl:\s+",
        r"^woman:\s+", r"^man:\s+", r"listen\s*carefully"
    ]
    for pat in listening_patterns:
        if re.search(pat, text, re.IGNORECASE | re.MULTILINE):
            return "listening"

    # 3) 문법 (Grammar)
    grammar_patterns = [
        r"language\s*(focus|in\s*use)", r"structures?", r"grammar\s*(point|focus|check)",
        r"key\s*expression", r"key\s*grammar"
    ]
    for pat in grammar_patterns:
        if re.search(pat, text_lower):
            return "grammar"

    # 4) 어휘 (Vocab)
    vocab_patterns = [
        r"words?\s*&\s*expressions?", r"word\s*study", r"words?\s*in\s*use", r"vocabulary"
    ]
    for pat in vocab_patterns:
        if re.search(pat, text_lower):
            return "vocab"
    # 발음기호 포함 어휘 목록
    phonetic_matches = re.findall(r'\[([^\]]{2,30})\]', text)
    ipa_chars = "æəɪʊɛɔʌɑɒɜːˈˌðθŋʃʒ"
    if any(any(c in m for c in ipa_chars) for m in phonetic_matches):
        return "vocab"

    # 5) 쓰기 (Writing)
    writing_patterns = [
        r"write\s*&\s*share", r"my\s*writing", r"write\s*it\s*out",
        r"\bproject\b", r"\bwrap\s*up\b", r"\bplan\s*&\s*present\b",
        r"analyzing\s*the\s*sample", r"argumentative\s*paragraph"
    ]
    for pat in writing_patterns:
        if re.search(pat, text_lower):
            return "writing"

    # 6) 본문 읽기 (Reading)
    korean_chars = len(re.findall(r'[가-힣]', text))
    english_chars = len(re.findall(r'[a-zA-Z]', text))
    total_alpha = korean_chars + english_chars
    eng_ratio = (english_chars / total_alpha) if total_alpha > 0 else 0

    if eng_ratio >= 0.35 and len(text) >= 180:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        avg_len = sum(len(l) for l in lines) / max(len(lines), 1)
        if avg_len >= 28:
            return "reading"

    return "other"

# ── 3. 모든 청크 순회 및 1차 메타데이터(단원, 섹션) 산출 ──
print("\n1단계: 전 청크 단원(unit) 및 섹션(section) 정밀 분류 진행...")
data = col.get(include=["documents", "metadatas"])
ids = data["ids"]
docs = data["documents"]
metas = data["metadatas"]

temp_items = []
section_counts = defaultdict(int)

for cid, doc, meta in zip(ids, docs, metas):
    subj = meta.get("subject_name", "")
    page = int(meta.get("page", 0))
    
    u_num, u_title = determine_unit(subj, page)
    sec = refine_section(doc, meta, page)
    section_counts[sec] += 1
    
    temp_items.append({
        "id": cid,
        "doc": doc,
        "meta": meta,
        "subject": subj,
        "page": page,
        "unit_number": u_num,
        "unit_title": u_title,
        "section": sec
    })

print("\n=== 재분류된 섹션별 통계 ===")
for s, c in sorted(section_counts.items(), key=lambda x: -x[1]):
    print(f"  {s:12s}: {c:4d}개")

# ── 4. 전 섹션 passage_id 부여 (동일 교과서, 단원, 섹션 내 연속 페이지 클러스터링) ──
print("\n2단계: 전 섹션 대상 지문/활동 단위(passage_id) 생성...")
by_group = defaultdict(list)
for item in temp_items:
    # FAQ나 other는 passage_id 단순화
    if item["section"] in ["faq", "other"]:
        item["passage_id"] = f"{item['section']}_{item['page']}"
        continue
    
    # 교과서 + 단원 + 섹션별로 묶음
    group_key = (item["subject"], item["unit_number"], item["section"])
    by_group[group_key].append(item)

passage_counts = defaultdict(int)

for (subj, u_num, sec), group_items in by_group.items():
    group_items.sort(key=lambda x: x["page"])
    short_subj = re.sub(r'[\s()·ⅠⅡ]', '_', subj).strip('_')
    
    # 페이지 간격 3 이하이면 동일 활동/지문으로 간주
    cluster_start_p = group_items[0]["page"]
    prev_p = group_items[0]["page"]
    current_cluster = [group_items[0]]
    
    def apply_cluster(c_items, sp):
        pid = f"{short_subj}_U{u_num}_{sec}_p{sp}"
        for itm in c_items:
            itm["passage_id"] = pid
        passage_counts[sec] += 1

    for itm in group_items[1:]:
        if itm["page"] - prev_p <= 3:
            current_cluster.append(itm)
        else:
            apply_cluster(current_cluster, cluster_start_p)
            cluster_start_p = itm["page"]
            current_cluster = [itm]
        prev_p = itm["page"]
        
    apply_cluster(current_cluster, cluster_start_p)

print("\n=== 섹션별 독립 passage(지문/활동) 개수 ===")
for s, c in sorted(passage_counts.items(), key=lambda x: -x[1]):
    print(f"  {s:12s}: {c:4d}개 단위 지문/활동")

# ── 5. ChromaDB 전체 업데이트 ──
print("\n3단계: ChromaDB에 체계적인 메타데이터 기록...")
BATCH = 200
for i in range(0, len(temp_items), BATCH):
    batch = temp_items[i:i+BATCH]
    b_ids = [b["id"] for b in batch]
    b_metas = []
    for b in batch:
        m = dict(b["meta"])
        m["unit_number"] = b["unit_number"]
        m["unit_title"] = b["unit_title"]
        m["section"] = b["section"]
        m["passage_id"] = b["passage_id"]
        b_metas.append(m)
        
    col.update(ids=b_ids, metadatas=b_metas)
    print(f"  [{min(i+BATCH, len(temp_items))}/{len(temp_items)}] 업데이트 완료")

print("\n🎉 모든 교과서 데이터의 체계적인 트리 구조 메타데이터 구축이 완료되었습니다!")
