"""
reindex_pure_reading.py
────────────────────────────────────────────────────────────────────────────
교과서 6권의 순수 Reading 본문 범위(시작 페이지 ~ 끝 페이지)를 엄격히 정의하고,
ChromaDB의 메타데이터를 정밀 갱신합니다.

핵심 원칙:
1. Before Reading, After You Read, Graphic Organizer, Vocabulary, 정답지, 부록 등 제외
2. 각 본문의 [시작 페이지(start_page)]와 [대표 이미지(cover_image_path)]를 메타데이터에 명시
3. 추천 검색 시 본문 내 어느 청크가 검색되든 사용자에겐 항상 '본문 원문 시작 페이지(start_page)'의 이미지와 정보를 제공!
"""

import sys
import chromadb

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = chromadb.PersistentClient(path="./chroma_db")
col = client.get_collection("english_textbooks")
print("ChromaDB 연결 성공. 총 청크:", col.count())

# ── 6권 교과서의 엄격한 순수 Reading 본문 목록 정의 ──
# (subject_name, unit_num, unit_title, passage_title, start_page, end_page)
PURE_READING_PASSAGES = [
    # 1. 공통영어1 (미래엔 김선영)
    ("공통영어1 (1학년 1학기 · 미래엔 김선영)", 1, "Lesson 1: You and I Become 'We'", "The Power of Friendliness: Soft but Strong", 19, 23),
    ("공통영어1 (1학년 1학기 · 미래엔 김선영)", 2, "Lesson 2: Open a Book, Open the World", "Gathering of the Whakapapa", 41, 45),
    ("공통영어1 (1학년 1학기 · 미래엔 김선영)", 3, "Lesson 3: Free Yourself with Science", "Noise-Cancelling Headphones / Sound Technology", 63, 67),
    ("공통영어1 (1학년 1학기 · 미래엔 김선영)", 4, "Lesson 4: Let It Be Green", "A Better Future for Coffee Waste", 85, 89),

    # 2. 공통영어2 (미래엔 김선영)
    ("공통영어2 (1학년 2학기 · 미래엔 김선영)", 1, "Lesson 1: We Share, We Care", "Caring for Animals / Elephant Rescue Camp", 19, 23),
    ("공통영어2 (1학년 2학기 · 미래엔 김선영)", 2, "Lesson 2: Be a Wise Consumer", "Light Up the Truth Behind Dark Patterns", 41, 45),
    ("공통영어2 (1학년 2학기 · 미래엔 김선영)", 3, "Lesson 3: The True Art Lovers", "Folk Artists: Bill Traylor & Maud Lewis", 63, 67),
    ("공통영어2 (1학년 2학기 · 미래엔 김선영)", 4, "Lesson 4: Sink or Swim in the Digital Ocean", "Will AI-Powered Neural Implants Make Us Super-Humans?", 85, 89),

    # 3. 영어Ⅰ (엔이능률 오선영)
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 1, "Lesson 1: Journey to the Future", "Who Is Your Role Model? (Jacques Cousteau, Joan Procter, Kim Sang-jin)", 16, 21),
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 2, "Lesson 2: The Power of Good Habits", "Science Report: Animal Habits and Tool Use", 42, 47),
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 3, "Lesson 3: Let's Live in Harmony", "Humanitas: Intergenerational Living Program", 68, 73),
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 4, "Lesson 4: Spark Your Creativity", "Edible Art: Helga Stentzel & Giuseppe Arcimboldo", 94, 99),
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 5, "Lesson 5: Rise Above Challenges", "Yusra Mardini: An Olympic Refugee Swimmer's Journey", 120, 125),
    ("영어Ⅰ (2학년 1학기 · 엔이능률 오선영)", 6, "Special Lesson: The Open Window", "The Open Window (by Saki)", 139, 146),

    # 4. 영어Ⅱ (능률 오선영)
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 1, "Lesson 1: Build a Better World", "Two Heroes Who Fought a Deadly Disease (Pertussis Vaccine)", 15, 21),
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 2, "Lesson 2: The World of Scientific Discovery", "Science Is for Everyone: Citizen Science & Galaxy Zoo", 41, 47),
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 3, "Lesson 3: Life Is a Sum of Choices", "There's More than One Way to Vote", 67, 73),
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 4, "Lesson 4: Create a Greener Tomorrow", "Breaking the Cycle: The Urgent Need to Manage E-Waste", 93, 99),
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 5, "Lesson 5: Open Your Mind, Defeat Your Biases", "The Colorful Truth of Ancient Statues", 119, 125),
    ("영어Ⅱ (3학년 1학기 · 능률 오선영)", 6, "Special Lesson: The Model Millionaire", "The Model Millionaire (by Oscar Wilde)", 139, 148),

    # 5. 영어독해와작문 (미래엔 김대진) - 본문 원문은 Building Vocabulary 다음 페이지(짝수 페이지)부터 시작
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 1, "Lesson 1: Discover Who You Are", "Embrace Failure, Unlock Success (Maya Angelou)", 16, 21),
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 2, "Lesson 2: Embrace the Earth", "Upcycling for a Sustainable Future", 40, 45),
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 3, "Lesson 3: Think Critically", "The Decoy Effect in Everyday Decisions", 64, 69),
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 4, "Lesson 4: Appreciate Art", "Astronomy: How Science Solved an Art Mystery (Monet)", 88, 93),
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 5, "Lesson 5: Money in Our Lives", "The Diderot Effect: Why We Buy Things We Don't Need", 112, 117),
    ("영어독해와작문 (2학년 2학기 · 미래엔 김대진)", 6, "Lesson 6: Explore the Future", "Imagine Living with AI: Robotics, Asimov & Klara and the Sun", 136, 141),

    # 6. 세계 문화와 영어 (비상 권혁승)
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 0, "Prologue: Intercultural Communication", "History of English & World Englishes", 10, 15),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 1, "Lesson 1: Asia & Middle East", "Traditional Sports (Camel Racing) & East Asian Architecture", 26, 31),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 2, "Lesson 2: Africa: Unlocking Its Potential", "Wildlife Protection in Zimbabwe & Africa's Innovation", 48, 53),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 3, "Lesson 3: Europe: Classical Art and Sports", "A Duel between Two Painters & European Football Culture", 68, 75),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 4, "Lesson 4: North America: High School & Startup", "Ice Hockey & Curling, American Garage Startups", 90, 97),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 5, "Lesson 5: South America: Flags & Carnival", "Graffiti in Latin America & Rio Carnival Celebration", 114, 121),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 6, "Lesson 6: Oceania: Nature & Marine", "Working Holiday in Australia & New Zealand in Avatar", 136, 143),
    ("세계 문화와 영어 (3학년 1학기 · 비상 권혁승)", 99, "Culture Spectrum", "The World Unites over Coffee: A Cultural Journey", 148, 153),

    # 7. 심화영어 (YBM 김명희)
    ("심화영어 (3학년 3학기 · YBM 김명희)", 1, "Lesson 1: Embracing Diversity", "My Journey in Singapore", 16, 21),
    ("심화영어 (3학년 3학기 · YBM 김명희)", 2, "Lesson 2: Why We Do What We Do", "The Neuroscience of Procrastination", 42, 47),
    ("심화영어 (3학년 3학기 · YBM 김명희)", 3, "Lesson 3: Paint the Future with AI", "Collaboration between Humans and AI", 68, 73),
    ("심화영어 (3학년 3학기 · YBM 김명희)", 4, "Lesson 4: Save the Planet, Save Humans", "A New Economic Paradigm: Doughnut Economics", 94, 99),
    ("심화영어 (3학년 3학기 · YBM 김명희)", 5, "Lesson 5: Global Efforts, One Step at a Time", "A Long Walk to Water (Salva & Nya in Sudan)", 120, 126),
    ("심화영어 (3학년 3학기 · YBM 김명희)", 6, "Further Reading: Neuroplasticity & AI", "Neuroplasticity: The Adaptable Brain", 145, 149),
]

print(f"\n정의된 총 순수 본문 수: {len(PURE_READING_PASSAGES)}편")

# ── 전체 청크 데이터 가져오기 ──
all_data = col.get(include=["metadatas", "documents"])
ids = all_data["ids"]
metas = all_data["metadatas"]
docs = all_data["documents"]

# 1) 교과서별/페이지별 시작 페이지 이미지 경로 맵 구축
page_images = {}
for m in metas:
    s = m.get("subject_name")
    p = m.get("page")
    ip = m.get("image_path")
    if s and p and ip:
        page_images[(s, int(p))] = ip

# 2) 청크별 메타데이터 갱신
updated_metas = []
reading_chunk_count = 0
passage_found_counts = {p[3]: 0 for p in PURE_READING_PASSAGES}

for cid, meta, doc in zip(ids, metas, docs):
    new_meta = dict(meta)
    subj = new_meta.get("subject_name", "")
    page = int(new_meta.get("page", 0))

    # FAQ는 유지
    if "FAQ" in subj:
        updated_metas.append(new_meta)
        continue

    # 해당 페이지가 정의된 PURE_READING_PASSAGES에 속하는지 판별
    matched_passage = None
    for p_subj, u_num, u_title, pass_title, sp, ep in PURE_READING_PASSAGES:
        if p_subj == subj and sp <= page <= ep:
            matched_passage = (p_subj, u_num, u_title, pass_title, sp, ep)
            break

    if matched_passage:
        p_subj, u_num, u_title, pass_title, sp, ep = matched_passage
        start_img = page_images.get((subj, sp), new_meta.get("image_path", ""))

        new_meta["section"] = "reading"
        new_meta["is_pure_reading"] = True
        new_meta["unit_number"] = u_num
        new_meta["unit_title"] = u_title
        new_meta["passage_title"] = pass_title
        new_meta["passage_start_page"] = sp
        new_meta["passage_end_page"] = ep
        new_meta["passage_cover_image"] = start_img
        new_meta["passage_id"] = f"{subj}__U{u_num}__p{sp}"
        reading_chunk_count += 1
        passage_found_counts[pass_title] += 1
    else:
        # reading 범위가 아니면 기존 reading이었더라도 other/기존영역 유지
        new_meta["is_pure_reading"] = False
        new_meta.pop("passage_start_page", None)
        new_meta.pop("passage_end_page", None)
        new_meta.pop("passage_cover_image", None)
        new_meta.pop("passage_title", None)
        if new_meta.get("section") == "reading":
            new_meta["section"] = "other"

    updated_metas.append(new_meta)

print(f"\n최종 판별된 순수 reading 청크 수: {reading_chunk_count}개")
print("\n── 본문별 수집된 청크 현황 ──")
for title, cnt in passage_found_counts.items():
    print(f"  [{cnt:2d}청크] {title}")

# ── ChromaDB 배치 업데이트 ──
print("\nChromaDB 메타데이터 업데이트 실행...")
BATCH = 200
for i in range(0, len(ids), BATCH):
    col.update(
        ids=ids[i:i+BATCH],
        metadatas=updated_metas[i:i+BATCH]
    )
    print(f"  [{min(i+BATCH, len(ids))}/{len(ids)}] 업데이트 완료")

print("\n🎉 모든 교과서의 순수 본문(Reading) 및 원문 시작 페이지 매핑 완료!")

