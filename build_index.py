import os
import sys
import glob
import time
import re
import shutil
import pymupdf
from dotenv import load_dotenv
from google import genai
from google.genai import types
import chromadb

# Windows 콘솔 UTF-8 설정
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError(".env 파일에 GEMINI_API_KEY가 없습니다!")

client = genai.Client(api_key=api_key)

# ── 1. ChromaDB 초기화 ───────────────────────────────────────
os.makedirs("./pages_cache", exist_ok=True)
os.makedirs("./chroma_db", exist_ok=True)

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="english_textbooks",
    metadata={"hnsw:space": "cosine"}
)
print(f"현재 ChromaDB 등록 청크 수: {collection.count()}", flush=True)

# ── 2. 배치 임베딩 함수 (안정적인 재시도 및 Rate Limit 제어) ──
def get_batch_embeddings(contents_list: list, max_retries: int = 8) -> list:
    """
    contents_list: list of strings
    returns: list of embedding vectors
    """
    if not contents_list:
        return []

    formatted_contents = [
        types.Content(parts=[types.Part.from_text(text=txt)])
        for txt in contents_list
    ]

    for attempt in range(max_retries):
        try:
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=formatted_contents
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                wait_sec = 25 * (attempt + 1)
                print(f"    ⏳ API Rate Limit 도달, {wait_sec}초 대기 후 재시도... (시도 {attempt+1}/{max_retries})", flush=True)
                time.sleep(wait_sec)
            else:
                print(f"    ❌ 오류 발생: {e}, 10초 대기...", flush=True)
                time.sleep(10)

    raise RuntimeError(f"배치 임베딩 재시도 초과 ({len(contents_list)}건)")

def add_batch_to_chroma(batch_ids, batch_embeddings, batch_docs, batch_metas):
    if batch_ids:
        collection.add(
            ids=batch_ids,
            embeddings=batch_embeddings,
            documents=batch_docs,
            metadatas=batch_metas
        )

# ── 3. 파일명 파서 ───────────────────────────────────────────
def parse_pdf_info(filename: str):
    name = os.path.splitext(filename)[0]
    # 패턴: 22개정 교과서 (학년) (학기) (교과명) (출판사) (저자)
    m = re.match(r'22개정\s*교과서\s*(\d학년)\s*(\d학기)\s*(.+?)\s+([가-힣a-zA-Z]+)\s+([가-힣a-zA-Z]+)$', name)
    if m:
        grade, sem, subj, pub, author = m.groups()
        if subj == "세계 문화와":
            subj = "세계 문화와 영어"
        display_title = f"{subj} ({grade} {sem} · {pub} {author})"
        short_id = f"{grade}_{sem}_{subj}_{pub}".replace(" ", "_")
        return {
            "display_title": display_title,
            "short_id": short_id,
            "subject": subj,
            "grade": grade,
            "semester": sem,
            "publisher": pub,
            "author": author
        }
    else:
        clean_name = name.replace("22개정 교과서 ", "").strip()
        return {
            "display_title": clean_name,
            "short_id": clean_name.replace(" ", "_"),
            "subject": clean_name,
            "grade": "",
            "semester": "",
            "publisher": "",
            "author": ""
        }

# ── 4. 교과서 PDF 처리 및 인덱싱 ──────────────────────────────
def index_all_textbooks():
    pdf_files = sorted(glob.glob("data/*.pdf"))
    print(f"\n📚 총 {len(pdf_files)}권의 교과서 PDF 인덱싱 준비 완료.", flush=True)

    for pdf_path in pdf_files:
        file_name = os.path.basename(pdf_path)
        meta_info = parse_pdf_info(file_name)
        display_title = meta_info["display_title"]
        short_id = meta_info["short_id"]

        print(f"\n📘 [{display_title}] 검사 중...", flush=True)
        doc = pymupdf.open(pdf_path)
        total_pages = len(doc)

        pending_items = []

        for page_num in range(total_pages):
            actual_page_no = page_num + 1

            # 1. 페이지 이미지 저장 (없을 때만 저장)
            img_filename = f"{short_id}_p{actual_page_no}.jpg"
            img_rel_path = os.path.join("pages_cache", img_filename)
            if not os.path.exists(img_rel_path):
                page = doc[page_num]
                mat = pymupdf.Matrix(1.3, 1.3)
                pix = page.get_pixmap(matrix=mat)
                pix.save(img_rel_path, jpg_quality=82)

            # 2. 텍스트 추출 및 청크 생성
            page = doc[page_num]
            text = page.get_text("text").strip()
            if not text or len(text) < 15:
                continue

            paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
            if not paragraphs:
                paragraphs = [text]

            for chunk_idx, chunk_text in enumerate(paragraphs):
                chunk_id = f"{short_id}_p{actual_page_no}_c{chunk_idx}"

                # 이미 인덱싱된 청크인지 확인 (이어하기 지원)
                existing = collection.get(ids=[chunk_id])
                if existing and existing["ids"]:
                    continue

                embed_text = f"title: {display_title} (p.{actual_page_no}) | text: {chunk_text}"
                pending_items.append({
                    "id": chunk_id,
                    "embed_text": embed_text,
                    "doc": chunk_text,
                    "metadata": {
                        "subject_name": display_title,
                        "file_name": file_name,
                        "page": actual_page_no,
                        "image_path": img_rel_path,
                        "topic": meta_info["subject"],
                        "grade": meta_info["grade"],
                        "semester": meta_info["semester"],
                        "publisher": meta_info["publisher"],
                        "author": meta_info["author"]
                    }
                })

        doc.close()

        if not pending_items:
            print(f"  -> 이미 모든 청크가 인덱싱되어 있습니다. 건너뜁니다.", flush=True)
            continue

        print(f"  -> 신규 {len(pending_items)}개 청크 생성. 배치 임베딩 시작...", flush=True)

        # 50개씩 배치 전송
        batch_size = 50
        for i in range(0, len(pending_items), batch_size):
            batch = pending_items[i:i + batch_size]
            embed_texts = [item["embed_text"] for item in batch]

            embeddings = get_batch_embeddings(embed_texts)

            add_batch_to_chroma(
                batch_ids=[item["id"] for item in batch],
                batch_embeddings=embeddings,
                batch_docs=[item["doc"] for item in batch],
                batch_metas=[item["metadata"] for item in batch]
            )
            print(f"    진행: {min(i + batch_size, len(pending_items))}/{len(pending_items)} 청크 완료", flush=True)
            time.sleep(2.0)  # Rate Limit 방지를 위한 2초 딜레이

# ── 5. FAQ.txt 처리 및 인덱싱 ─────────────────────────────────
def index_faq():
    faq_path = "data/FAQ.txt"
    if not os.path.exists(faq_path):
        print("⚠️ FAQ.txt 파일이 없습니다.", flush=True)
        return

    print("\n💡 [선택과목 FAQ.txt] 검사 중...", flush=True)
    with open(faq_path, "r", encoding="utf-8-sig") as f:
        lines = [l.strip() for l in f if l.strip()]

    pending_faq = []
    for line in lines[1:]:
        parts = line.split("\t")
        if len(parts) >= 6:
            q_num, target, main_topic, sub_topic, question, answer = parts[:6]
            chunk_id = f"FAQ_{q_num}"

            # 중복 체크
            existing = collection.get(ids=[chunk_id])
            if existing and existing["ids"]:
                continue

            doc_text = f"[{main_topic} > {sub_topic}] (대상: {target})\n질문: {question}\n답변: {answer}"
            embed_text = f"title: 선택과목 FAQ | text: 과목안내 및 교육과정 질의응답: {question} {answer}"

            pending_faq.append({
                "id": chunk_id,
                "embed_text": embed_text,
                "doc": doc_text,
                "metadata": {
                    "subject_name": "선택과목 FAQ",
                    "file_name": "FAQ.txt",
                    "page": int(q_num),
                    "image_path": "",
                    "topic": f"{main_topic} - {sub_topic}",
                    "target": target
                }
            })

    if not pending_faq:
        print("  -> FAQ 청크가 이미 모두 등록되어 있습니다.", flush=True)
        return

    print(f"  -> FAQ 신규 {len(pending_faq)}개 질문 배치 임베딩 시작...", flush=True)

    batch_size = 50
    for i in range(0, len(pending_faq), batch_size):
        batch = pending_faq[i:i + batch_size]
        embed_texts = [item["embed_text"] for item in batch]

        embeddings = get_batch_embeddings(embed_texts)

        add_batch_to_chroma(
            batch_ids=[item["id"] for item in batch],
            batch_embeddings=embeddings,
            batch_docs=[item["doc"] for item in batch],
            batch_metas=[item["metadata"] for item in batch]
        )
        print(f"    FAQ 진행: {min(i + batch_size, len(pending_faq))}/{len(pending_faq)} 완료", flush=True)
        time.sleep(2.0)

# ── 실행 메인 ────────────────────────────────────────────────
if __name__ == "__main__":
    start_time = time.time()

    index_all_textbooks()
    index_faq()

    elapsed = round(time.time() - start_time, 1)
    total_count = collection.count()
    print(f"\n🎉 전체 인덱싱 완료! 총 {total_count}개 청크가 ChromaDB에 저장되었습니다. (소요시간: {elapsed}초)", flush=True)
