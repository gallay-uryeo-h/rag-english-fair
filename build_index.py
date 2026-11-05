import os
import sys
import glob
import time
import pymupdf  # 최신 PyMuPDF
from dotenv import load_dotenv
from google import genai
import chromadb

# Windows 콘솔 utf-8 설정
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError(".env 파일에 GEMINI_API_KEY가 없습니다!")

# 1. Gemini 클라이언트 및 ChromaDB 영구 저장 클라이언트 초기화
client = genai.Client(api_key=api_key)
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# 컬렉션 생성 (코사인 유사도 적용)
collection = chroma_client.get_or_create_collection(
    name="english_textbooks",
    metadata={"hnsw:space": "cosine"}
)

def get_embedding(subject_name: str, text: str) -> list:
    """gemini-embedding-2를 이용한 문서 임베딩 함수 (Rate Limit 자동 재시도)"""
    content = f"title: {subject_name} | text: {text}"
    for attempt in range(5):
        try:
            response = client.models.embed_content(
                model="gemini-embedding-2",
                contents=content
            )
            return response.embeddings[0].values
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                print(f"    ⏳ Rate limit 도달, 15초 대기 후 재시도 중... (시도 {attempt+1}/5)")
                time.sleep(15)
            else:
                raise e
    raise RuntimeError("임베딩 최대 재시도 횟수 초과")

def render_page_image(page, output_path: str):
    """PDF 페이지를 고화질 이미지(PNG)로 저장 (스마트폰 뷰어용)"""
    zoom = 2.0
    mat = pymupdf.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    pix.save(output_path)

def process_pdf(pdf_path: str):
    file_name = os.path.basename(pdf_path)
    subject_name = os.path.splitext(file_name)[0]  # 예: "공통영어1"
    
    print(f"\n📂 [과목명: {subject_name}] ({file_name}) 분석 시작...")

    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)
    print(f"총 {total_pages} 페이지 발견")

    for page_num in range(total_pages):
        page = doc[page_num]
        actual_page_no = page_num + 1

        # 1. 페이지 텍스트 추출
        text = page.get_text("text").strip()
        if not text:
            continue

        # 2. 해당 페이지를 스마트폰에서 볼 수 있도록 이미지로 저장
        img_filename = f"{subject_name}_p{actual_page_no}.png"
        img_rel_path = os.path.join("pages_cache", img_filename)
        if not os.path.exists(img_rel_path):
            render_page_image(page, img_rel_path)

        # 3. 텍스트 분할 (단락 단위 또는 일정 길이 단위)
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        if not paragraphs:
            paragraphs = [text]

        for chunk_idx, chunk_text in enumerate(paragraphs):
            chunk_id = f"{subject_name}_p{actual_page_no}_c{chunk_idx}"

            # 중복 체크
            existing = collection.get(ids=[chunk_id])
            if existing and existing["ids"]:
                continue

            print(f" -> 임베딩 중: [{subject_name}] (p.{actual_page_no}, 조각 {chunk_idx + 1}/{len(paragraphs)})")
            
            try:
                emb = get_embedding(subject_name, chunk_text)
                
                collection.add(
                    ids=[chunk_id],
                    embeddings=[emb],
                    documents=[chunk_text],
                    metadatas=[{
                        "subject_name": subject_name,
                        "file_name": file_name,
                        "page": actual_page_no,
                        "image_path": img_rel_path
                    }]
                )
            except Exception as e:
                print(f"  [에러 발생] {chunk_id}: {e}")

    doc.close()
    print(f"✅ [{subject_name}] 인덱싱 완료!")

def process_faq(faq_path: str):
    """FAQ.txt 파일을 UTF-8로 읽어 각 Q&A를 독립 청크로 ChromaDB에 저장"""
    if not os.path.exists(faq_path):
        return

    print(f"\n📂 [FAQ 데이터 분석 시작] ({faq_path})...")
    with open(faq_path, "r", encoding="utf-8-sig") as f:
        lines = [line.strip() for line in f if line.strip()]

    header = lines[0].split("\t")
    count = 0

    for line in lines[1:]:
        parts = line.split("\t")
        if len(parts) < 6:
            continue

        q_num, target, main_topic, sub_topic, question, answer = parts[:6]
        chunk_id = f"FAQ_{q_num}"

        # 중복 체크
        existing = collection.get(ids=[chunk_id])
        if existing and existing["ids"]:
            continue

        # 검색 텍스트 (질문과 핵심 내용을 명확히 구조화)
        doc_text = f"[{main_topic} > {sub_topic}] (대상: {target})\n질문: {question}\n답변: {answer}"
        embed_text = f"과목안내 및 교육과정 질의응답: {question} {answer}"

        try:
            emb = get_embedding("선택과목 FAQ", embed_text)

            collection.add(
                ids=[chunk_id],
                embeddings=[emb],
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
            count += 1
            if count % 20 == 0:
                print(f" -> FAQ {count}개 정상 저장 완료...")
        except Exception as e:
            print(f"  [에러 발생] {chunk_id}: {e}")

    print(f"✅ [선택과목 FAQ] 총 {count}개 항목 인덱싱 완료!")

def main():
    # 1. FAQ 텍스트 처리
    faq_file = os.path.join("data", "FAQ.txt")
    if os.path.exists(faq_file):
        process_faq(faq_file)

    # 2. PDF 교과서 처리
    pdf_files = glob.glob("data/*.pdf")
    if not pdf_files:
        print("⚠️ 'data' 폴더에 분석할 PDF 파일이 없습니다.")
    else:
        print(f"\n총 {len(pdf_files)}개의 교과서 PDF를 인덱싱합니다.")
        for pdf_path in pdf_files:
            process_pdf(pdf_path)

    print("\n🎉 모든 교과서 및 FAQ 문서의 벡터 DB 저장이 완료되었습니다!")
    print(f"저장된 총 청크 수: {collection.count()}개")

if __name__ == "__main__":
    main()
