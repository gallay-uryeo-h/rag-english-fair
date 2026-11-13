import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from google import genai
import chromadb

# ── 앱 초기화 ───────────────────────────────────────────────
app = FastAPI(title="영어과 선택과목 RAG 챗봇")

# static 디렉토리가 없으면 생성
os.makedirs("static", exist_ok=True)

# pages_cache 디렉토리가 없으면 생성
os.makedirs("pages_cache", exist_ok=True)

# ── Gemini + ChromaDB 초기화 ─────────────────────────────────
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("⚠️  GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")

gemini_client = genai.Client(api_key=api_key) if api_key else None

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="english_textbooks",
    metadata={"hnsw:space": "cosine"}
)

# ── RAG 검색 (선택과목 FAQ 전용) ──────────────────────────────
def search_similar_docs(query_text: str, n_results: int = 4):
    formatted_query = f"task: question answering | query: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values

    # 선택과목 상담 챗봇은 항상 FAQ 데이터베이스만 참조
    where_filter = {"subject_name": "선택과목 FAQ"}

    query_kwargs = {
        "query_embeddings": [query_vector],
        "n_results": n_results,
        "where": where_filter
    }

    results = collection.query(**query_kwargs)
    return results

def search_recommended_passages(query_text: str, grade_filter: str = "전체", n_results: int = 3):
    formatted_query = f"task: question answering | query: 영어 교과서 본문 독해 지문 주제: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values

    # 1. 1차 시도: is_pure_reading: True 로 순수 본문 34편 대상 정밀 검색
    if grade_filter in ["1학년", "2학년", "3학년"]:
        where_cond = {"$and": [
            {"is_pure_reading": True},
            {"grade": grade_filter}
        ]}
    else:
        where_cond = {"$and": [
            {"is_pure_reading": True},
            {"grade": {"$in": ["1학년", "2학년", "3학년"]}}
        ]}

    fetch_n = max(n_results * 6, 20)
    try:
        raw = collection.query(
            query_embeddings=[query_vector],
            n_results=fetch_n,
            where=where_cond
        )
    except Exception:
        raw = None

    # 만약 결과가 없으면 기존 section: reading 으로 폴백
    if not raw or not raw.get("ids") or not raw["ids"][0]:
        if grade_filter in ["1학년", "2학년", "3학년"]:
            where_fallback = {"$and": [{"section": "reading"}, {"grade": grade_filter}]}
        else:
            where_fallback = {"$and": [{"section": "reading"}, {"grade": {"$in": ["1학년", "2학년", "3학년"]}}]}
        raw = collection.query(
            query_embeddings=[query_vector],
            n_results=fetch_n,
            where=where_fallback
        )


    # ── 중복 제거: passage_id 기준 (같은 본문 단위는 최고 유사도 청크 1개만) ──
    seen_passages: set[str] = set()
    dedup_ids, dedup_docs, dedup_metas, dedup_dists = [], [], [], []

    ids    = raw["ids"][0] if raw["ids"] else []
    docs   = raw["documents"][0] if raw["documents"] else []
    metas  = raw["metadatas"][0] if raw["metadatas"] else []
    dists  = raw["distances"][0] if raw.get("distances") else [0.0] * len(ids)

    for cid, doc, meta, dist in zip(ids, docs, metas, dists):
        # passage_id가 있으면 그것으로, 없으면 "subject_name__p{page}" 폴백
        passage_id = meta.get("passage_id") or \
                     f"{meta.get('subject_name','')}__p{meta.get('page', 0)}"

        if passage_id in seen_passages:
            continue   # 같은 본문에서 이미 더 유사한 청크를 선택했으므로 skip

        seen_passages.add(passage_id)
        dedup_ids.append(cid)
        dedup_docs.append(doc)
        dedup_metas.append(meta)
        dedup_dists.append(dist)

        if len(dedup_ids) >= n_results:
            break

    # ChromaDB query 반환 형태로 맞춰서 반환
    return {
        "ids": [dedup_ids],
        "documents": [dedup_docs],
        "metadatas": [dedup_metas],
        "distances": [dedup_dists],
    }

SYSTEM_INSTRUCTION = """당신은 2026 고교학점제 박람회 영어과 부스 'My English Future'의 공식 Q&A AI 도우미(@uryeo_qa_bot)입니다.
중학교 3학년 예비 고1 학생과 학부모님을 대상으로 2022 개정 고교 영어 교육과정, 선택과목(일반·진로·융합), 2028 대입 내신 5등급제, 교과서 및 세특 학습 전략을 안내합니다.

[답변 작성 원칙 - 필수 준수]:
1. [간단명료한 분량]: 모바일 인스타그램 DM 화면에 맞추어 절대 길게 늘어놓지 마십시오. 불필요한 서론/인사말을 최소화하고, 전체 길이를 10~15줄 내외(2~3개 핵심 요약)로 간단명료하게 작성하십시오.
2. [표준 마크다운 구조화]:
   - 장문의 줄글 대신 글머리 기호(- 또는 •)나 번호 목록(1., 2.)을 사용하여 핵심 요점을 깔끔하게 정리하십시오.
   - 과목명, 핵심 개념, 중요 수치는 **굵은 글씨**로 강조하십시오.
3. [친절하고 따뜻한 어조]: 중3 학생과 학부모님이 기분 좋게 이해할 수 있도록 따뜻하고 친절한 어조('~해요', '~합니다', '~해 보세요! ✨')를 사용하십시오.
4. [공통 기준 안내 1줄]: 본 챗봇 안내는 2022 개정 국가 교육과정과 일반적 공통 기준이며, 실제 개설 과목이나 세부 평가는 진학 고등학교 편제표에 따라 달라질 수 있다는 점을 답변 끝에 작게 1줄로만 덧붙이십시오.
5. [사실 기반 안내]: 반드시 제공된 [참고 자료]에 근거하여 답변하고, 모르는 학교별 세부 사항은 "부스에 계신 영어과 선생님께 문의하시면 맞춤형 상담을 받으실 수 있어요!"라고 덧붙이십시오.
"""

# ── API 모델 ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str
    target_db: str = "faq"  # 선택과목 상담은 FAQ 전용

class RecommendRequest(BaseModel):
    interest: str
    grade: str = "전체"  # "전체", "1학년", "2학년", "3학년"

# ── 라우트 ───────────────────────────────────────────────────
@app.get("/bot_avatar.jpg")
def get_bot_avatar():
    for p in ["static/bot_avatar.jpg", "frontend/public/bot_avatar.jpg"]:
        if os.path.exists(p):
            return FileResponse(p, media_type="image/jpeg")
    return JSONResponse({"error": "Avatar not found"}, status_code=404)

@app.get("/")
def root():
    response = FileResponse("static/index.html")
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

from grammar_roadmap_data import GRAMMAR_ROADMAP_DATA, NOTICE_MESSAGE

from urllib.parse import unquote

@app.get("/pages_cache/{filename:path}")
def get_page_image(filename: str):
    clean_name = unquote(filename).strip()
    direct_path = os.path.join("pages_cache", clean_name)
    if os.path.exists(direct_path):
        media_type = "image/jpeg" if clean_name.lower().endswith((".jpg", ".jpeg")) else "image/png"
        return FileResponse(direct_path, media_type=media_type)

    # 스마트 매칭: 약식 이름(예: 공통영어1_p23.jpg, 영어독해와작문_p25.jpg 등)을 실제 정규 파일명과 매칭
    norm_query = clean_name.replace(" ", "").replace("_", "").lower()
    if os.path.exists("pages_cache"):
        for real_file in os.listdir("pages_cache"):
            norm_real = real_file.replace(" ", "").replace("_", "").lower()
            # 페이지 번호 매칭 검사
            import re
            p_match_query = re.search(r'p\d+', norm_query)
            p_match_real = re.search(r'p\d+', norm_real)
            if p_match_query and p_match_real and p_match_query.group() == p_match_real.group():
                # 과목명 키워드 검사
                keywords = ["공통영어1", "공통영어2", "영어i", "영어1", "영어ii", "영어2", "영어독해와작문", "독해와작문", "세계문화와영어", "세계문화", "심화영어", "advancedenglish"]
                for kw in keywords:
                    if kw in norm_query and (kw in norm_real or (kw == "영어i" and "영어ⅰ" in norm_real) or (kw == "영어ii" and "영어ⅱ" in norm_real)):
                        matched_path = os.path.join("pages_cache", real_file)
                        media_type = "image/jpeg" if real_file.lower().endswith((".jpg", ".jpeg")) else "image/png"
                        return FileResponse(matched_path, media_type=media_type)

    return JSONResponse({"error": f"Image '{clean_name}' not found"}, status_code=404)


@app.get("/api/grammar-roadmap")
def get_grammar_roadmap():
    return {
        "notice": NOTICE_MESSAGE,
        "subjects": GRAMMAR_ROADMAP_DATA
    }

@app.post("/api/chat")
def chat(req: ChatRequest):
    query = req.query.strip()
    if not query:
        return JSONResponse({"error": "질문이 비어있습니다."}, status_code=400)

    if not gemini_client:
        # 로컬 테스트용 모의 답변 (배포 환경에서는 실제 Gemini AI + ChromaDB RAG 작동)
        return {
            "answer": f"안녕하세요! 영어과 부스 AI 도우미입니다. 🤖✨\n\n문의하신 **'{query}'**의 핵심 내용을 정리해 드릴게요!\n\n- 📚 **교과 편제**: 고1은 **공통영어1·2**, 고2~3은 진로에 따라 **일반선택(영어Ⅰ·Ⅱ)**, **진로선택(심화 영어)**, **융합선택**을 이수해요.\n- 🎯 **내신 5등급제**: 1등급은 상위 10%이며, 성취평가제(A~E)와 함께 지필·수행평가가 균형 있게 반영돼요.\n- 💡 **학습 팁**: 학생의 희망 진로와 관심 주제를 교과서 지문과 연결하여 **학생부 세특**을 준비하면 유리해요!\n\n> ℹ️ *참고: 실제 과목 개설은 진학 예정 고등학교의 교육과정 편제표를 확인해 주세요. 부스 영어과 선생님께 문의하시면 더 자세히 상담받으실 수 있어요!*",
            "sources": [{"title": "2022 개정 고교학점제 영어과 가이드", "subject_name": "선택과목 FAQ"}]
        }

    # 1. FAQ 검색 (선택과목 상담 전용)
    try:
        search_res = search_similar_docs(query, n_results=4)
    except Exception as e:
        return JSONResponse({"error": f"검색 오류: {e}"}, status_code=500)

    context_blocks = []
    sources = []

    if search_res and search_res["documents"] and search_res["documents"][0]:
        docs = search_res["documents"][0]
        metas = search_res["metadatas"][0]

        for i, (d, m) in enumerate(zip(docs, metas)):
            cid = i + 1
            subject = m.get("subject_name", "영어교과서")
            page = m.get("page", "?")
            topic = m.get("topic", "")
            image_path = m.get("image_path", "")

            label = f"Q{page}" if subject == "선택과목 FAQ" else f"p.{page}"
            context_blocks.append(
                f"[{cid}] 출처: {subject} ({label})\n내용: {d}"
            )
            sources.append({
                "id": cid,
                "subject_name": subject,
                "page": page,
                "topic": topic,
                "text": d,
                "image_path": image_path
            })

    context_str = "\n\n".join(context_blocks) if context_blocks else "관련된 내용을 찾지 못했습니다."

    rag_prompt = f"""{SYSTEM_INSTRUCTION}

[참고 자료]:
{context_str}

[질문]:
{query}
"""

    # 2. 답변 생성
    try:
        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=rag_prompt
        )
        answer = response.text
    except Exception as e:
        return JSONResponse({"error": f"답변 생성 오류: {e}"}, status_code=500)

    # 3. image_path → URL 변환 (pages_cache/파일명 → /pages_cache/파일명)
    for src in sources:
        ip = src.get("image_path", "")
        if ip:
            filename = os.path.basename(ip.replace("\\", "/"))
            src["image_url"] = f"/pages_cache/{filename}"
        else:
            src["image_url"] = ""

    return {"answer": answer, "sources": sources}


@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    if not gemini_client:
        return JSONResponse({"error": "GEMINI_API_KEY가 설정되지 않았습니다."}, status_code=500)

    interest = req.interest.strip()
    if not interest:
        return JSONResponse({"error": "관심사 내용이 비어있습니다."}, status_code=400)

    grade_choice = req.grade if req.grade in ["전체", "1학년", "2학년", "3학년"] else "전체"

    try:
        rec_results = search_recommended_passages(interest, grade_filter=grade_choice, n_results=3)
    except Exception as e:
        return JSONResponse({"error": f"추천 검색 오류: {e}"}, status_code=500)

    candidates = []
    if rec_results and rec_results["documents"] and rec_results["documents"][0]:
        for d, m in zip(rec_results["documents"][0], rec_results["metadatas"][0]):
            # 본문 원문 시작 페이지 및 대표 이미지 우선 적용
            start_page = m.get("passage_start_page") or m.get("page", "?")
            end_page = m.get("passage_end_page")
            page_label = f"p.{start_page}~{end_page}" if end_page and end_page != start_page else f"p.{start_page}"

            cover_img = m.get("passage_cover_image") or m.get("image_path", "")
            filename = os.path.basename(cover_img.replace("\\", "/")) if cover_img else ""
            img_url = f"/pages_cache/{filename}" if filename else ""

            candidates.append({
                "subject": m.get("subject_name", "영어 교과서"),
                "unit_number": m.get("unit_number", 0),
                "unit_title": m.get("unit_title", ""),
                "passage_title": m.get("passage_title", ""),
                "grade": m.get("grade", ""),
                "semester": m.get("semester", ""),
                "page": start_page,
                "page_label": page_label,
                "publisher": m.get("publisher", ""),
                "topic": m.get("topic", ""),
                "text": d,
                "image_url": img_url
            })

    if not candidates:
        return {"report": "관련된 교과서 본문을 찾지 못했습니다. 다른 관심사 키워드로 검색해 보세요.", "candidates": []}

    prompt_for_ai = f"""당신은 의령여자고등학교 선택과목 박람회 'My English Future'의 영어과 진로 연계 교과 전문가입니다.
중학교 3학년 학생이 인생 네컷에서 선택한 미래 진로/관심사를 바탕으로, 의령여고 3년 동안 배울 교과서 지문 중 가장 적합한 본문들을 분석하여 미니멀하고 단정한 맞춤 큐레이션 리포트를 마크다운 형식으로 작성하십시오.

[학생의 관심사/진로]:
{interest}

[검색된 의령여고 교과서 후보 지문들]:
"""
    for idx, c in enumerate(candidates):
        u_info = f"[{c['unit_title']}]" if c.get('unit_title') else ""
        p_title = f" <{c['passage_title']}>" if c.get('passage_title') else ""
        prompt_for_ai += f"""
--- 후보 {idx+1} ---
- 교과서: {c['subject']} {u_info}{p_title} ({c['page_label']})
- 내용 발췌: {c['text'][:300]}
"""

    prompt_for_ai += """
[작성 원칙 및 형식]:
1. 감탄사, 불필요한 서두 인사말, 과도한 이모지를 배제하고, 깔끔하고 단정한 전문 큐레이션 리포트 양식을 유지하십시오.
2. 문장은 정중하고 따뜻한 격식체('~합니다', '~를 추천합니다')로 작성하십시오.
3. 각 후보 지문마다 아래 구조를 명확히 지켜 작성하십시오:

### 1. [지문 주제 및 핵심 테마]
* **의령여고 교과 및 단원**: {해당 교과서명 및 페이지}
* **진로 연계 배경**: 학생의 관심 진로/꿈과 본문 지문의 연계성을 2문장으로 간결하게 설명
* **의령여고 학생부(세특) 탐구 제안**: 의령여고 입학 후 교과 수업 및 학생부(세특)에 돋보이게 기록할 수 있는 구체적인 탐구 과제/보고서 주제 제안 (1가지)

4. 보고서 말미에 의령여고 입학을 준비하는 학생에게 전하는 2줄 이내의 격려 및 3개년 영어 학습 방향을 '의령여고 영어과 한마디'로 요약하십시오.
"""

    try:
        rec_response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt_for_ai
        )
        report = rec_response.text
    except Exception as e:
        report = f"리포트 생성 중 오류가 발생했습니다: {e}"

    return {"report": report, "candidates": candidates}


@app.get("/api/recommend-passages")
@app.get("/api/recommend")
def recommend_get(career: str = "", interest: str = "", grade: str = "전체"):
    q = (career or interest).strip()
    return recommend(RecommendRequest(interest=q, grade=grade))


# ── 정적 파일 (index.html 이후에 마운트) ─────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")
if os.path.exists("static/assets"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


