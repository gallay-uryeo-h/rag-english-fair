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

# ── RAG 검색 ─────────────────────────────────────────────────
def search_similar_docs(query_text: str, target_db: str = "all", n_results: int = 4):
    formatted_query = f"task: question answering | query: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values

    where_filter = None
    if target_db == "textbook":
        where_filter = {"subject_name": {"$ne": "선택과목 FAQ"}}
    elif target_db == "faq":
        where_filter = {"subject_name": "선택과목 FAQ"}

    query_kwargs = {
        "query_embeddings": [query_vector],
        "n_results": n_results
    }
    if where_filter:
        query_kwargs["where"] = where_filter

    results = collection.query(**query_kwargs)
    return results

def search_recommended_passages(query_text: str, grade_filter: str = "전체", n_results: int = 3):
    formatted_query = f"task: question answering | query: 영어 교과서 본문 독해 지문 주제: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values

    if grade_filter in ["1학년", "2학년", "3학년"]:
        where_cond = {"grade": grade_filter}
    else:
        where_cond = {"grade": {"$in": ["1학년", "2학년", "3학년"]}}

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        where=where_cond
    )
    return results

SYSTEM_INSTRUCTION = """당신은 고등학교 선택과목 박람회 영어과의 공식 모바일 챗봇입니다.

[작성 원칙]
1. 모바일 메신저 환경에 맞게 미사여구와 불필요한 서론/결론을 일절 배제하고 핵심 내용만 간결하게 설명하십시오.
2. 어조는 정중한 격식체 존댓말('~합니다', '~입니다')을 사용하십시오.
3. 반드시 제공된 [참고 자료]에 근거하여 작성하십시오.
4. 문장이나 사실 진술 뒤에 근거 번호를 반드시 `[1]`, `[2]` 형태로 표기하십시오.
5. 참고 자료에 없는 내용은 임의로 추측하지 말고, "해당 내용은 제공된 자료에 포함되어 있지 않으므로 현장 담당 교사에게 문의하시기 바랍니다."라고 간결히 안내하십시오.
"""

# ── API 모델 ─────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str
    target_db: str = "all"  # "all", "textbook", "faq"

class RecommendRequest(BaseModel):
    interest: str
    grade: str = "전체"  # "전체", "1학년", "2학년", "3학년"

# ── 라우트 ───────────────────────────────────────────────────
@app.get("/")
def root():
    return FileResponse("static/index.html")

@app.get("/pages_cache/{filename}")
def get_page_image(filename: str):
    path = os.path.join("pages_cache", filename)
    if os.path.exists(path):
        media_type = "image/jpeg" if filename.lower().endswith((".jpg", ".jpeg")) else "image/png"
        return FileResponse(path, media_type=media_type)
    return JSONResponse({"error": "not found"}, status_code=404)

@app.post("/api/chat")
def chat(req: ChatRequest):
    if not gemini_client:
        return JSONResponse({"error": "GEMINI_API_KEY가 설정되지 않았습니다."}, status_code=500)

    query = req.query.strip()
    if not query:
        return JSONResponse({"error": "질문이 비어있습니다."}, status_code=400)

    target_db = req.target_db if req.target_db in ["all", "textbook", "faq"] else "all"

    # 1. 검색
    try:
        search_res = search_similar_docs(query, target_db=target_db, n_results=4)
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
            # pages_cache\공통영어1_p5.png → /pages_cache/공통영어1_p5.png
            filename = os.path.basename(ip)
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
            ip = m.get("image_path", "")
            img_url = f"/pages_cache/{os.path.basename(ip)}" if ip else ""
            candidates.append({
                "subject": m.get("subject_name", "영어 교과서"),
                "grade": m.get("grade", ""),
                "semester": m.get("semester", ""),
                "page": m.get("page", "?"),
                "publisher": m.get("publisher", ""),
                "topic": m.get("topic", ""),
                "text": d,
                "image_url": img_url
            })

    if not candidates:
        return {"report": "관련된 교과서 본문을 찾지 못했습니다. 다른 관심사 키워드로 검색해 보세요.", "candidates": []}

    prompt_for_ai = f"""당신은 고등학교 영어과 진로 연계 교육과정 전문가입니다.
학생의 관심사를 바탕으로, 교과서 검색 결과 중 가장 잘 어울리는 지문들을 분석하여 친절하게 추천 리포트를 마크다운 형식으로 작성해 주세요.

[학생의 관심사/진로]:
{interest}

[검색된 교과서 후보 지문들]:
"""
    for idx, c in enumerate(candidates):
        prompt_for_ai += f"""
--- 지문 {idx+1} ---
- 교과서: {c['subject']} (p.{c['page']})
- 내용 발췌: {c['text'][:300]}
"""

    prompt_for_ai += """
[작성 가이드라인]:
1. 학생의 관심사와 각 지문이 어떻게 연결되는지 따뜻하고 친절한 격려 어조('~해요', '~해 보세요')로 작성하세요.
2. 각 후보 지문별로:
   - 🌟 **[추천 지문 주제]**: 지문의 핵심 테마와 소재
   - 💡 **[추천 이유]**: 학생의 관심사/진로와 어떻게 이어지는지 설명
   - 📝 **[학생부 세특 탐구 연계 팁]**: 이 본문을 읽고 심화 발표나 보고서로 확장할 수 있는 구체적인 탐구 활동 아이디어 1가지 제안
3. 마지막에 해당 교과서 과목(공통영어/영어Ⅰ/독해와작문/세계문화와영어 등)의 학습 조언을 1~2줄로 덧붙여 주세요.
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


# ── 정적 파일 (index.html 이후에 마운트) ─────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

