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

# 클라우드 배포 시 DB가 비어있으면 FAQ.txt 자동 인덱싱
if collection.count() == 0 and os.path.exists("data/FAQ.txt") and gemini_client:
    print("ChromaDB가 비어있습니다. FAQ.txt를 자동 인덱싱합니다...")
    with open("data/FAQ.txt", "r", encoding="utf-8-sig") as f:
        lines = [l.strip() for l in f if l.strip()]
    for line in lines[1:]:
        parts = line.split("\t")
        if len(parts) >= 6:
            q_num, target, main_topic, sub_topic, question, answer = parts[:6]
            doc_text = f"[{main_topic} > {sub_topic}] (대상: {target})\n질문: {question}\n답변: {answer}"
            embed_text = f"과목안내 및 교육과정 질의응답: {question} {answer}"
            try:
                resp = gemini_client.models.embed_content(
                    model="gemini-embedding-001",
                    contents=f"title: 선택과목 FAQ | text: {embed_text}"
                )
                collection.add(
                    ids=[f"FAQ_{q_num}"],
                    embeddings=[resp.embeddings[0].values],
                    documents=[doc_text],
                    metadatas=[{
                        "subject_name": "선택과목 FAQ",
                        "file_name": "FAQ.txt",
                        "page": int(q_num),
                        "image_path": "",
                        "topic": f"{main_topic} - {sub_topic}",
                        "target": target
                    }]
                )
            except Exception as e:
                print(f"FAQ 인덱싱 오류 (Q{q_num}): {e}")
    print(f"FAQ 인덱싱 완료. 총 {collection.count()}개 청크.")

# ── RAG 검색 ─────────────────────────────────────────────────
def search_similar_docs(query_text: str, n_results: int = 4):
    formatted_query = f"task: question answering | query: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-001",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
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

    # 1. 검색
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

            context_blocks.append(
                f"[{cid}] 출처: {subject} ({'Q' + str(page) if subject == '선택과목 FAQ' else 'p.' + str(page)})\n내용: {d}"
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


# ── 정적 파일 (index.html 이후에 마운트) ─────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

