import os
import sys
import numpy as np
from dotenv import load_dotenv
from google import genai

# Windows 콘솔 utf-8 인코딩 설정
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# 1. .env 파일에서 GEMINI_API_KEY 불러오기
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(".env 파일에 GEMINI_API_KEY를 설정해주세요!")

client = genai.Client(api_key=api_key)

# 2. RAG 대상이 될 테스트 문서 (미니 지식베이스)
documents = [
    "태양계에서 가장 큰 행성은 목성입니다. 목성은 주로 수소와 헬륨으로 이루어져 있습니다.",
    "사과는 장미과에 속하는 식물의 열매로, 비타민 C와 식이섬유가 풍부합니다.",
    "Antigravity는 차세대 에이전트 코딩 어시스턴트 플랫폼입니다.",
    "파이썬은 1991년 귀도 반 로섬이 발표한 고급 프로그래밍 언어입니다."
]

# 3. 문서 임베딩 함수 (gemini-embedding-2 사용)
def get_embedding(text: str, is_query: bool = False):
    # 비대칭 검색(Asymmetric retrieval) 태스크 접두사 적용
    if is_query:
        content = f"task: question answering | query: {text}"
    else:
        content = f"title: none | text: {text}"

    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=content
    )
    # 응답에서 벡터 추출
    return np.array(response.embeddings[0].values)

# 4. 코사인 유사도 계산 함수
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def main():
    print("=== 1. 문서들을 임베딩(벡터화)하는 중... ===")
    doc_embeddings = [get_embedding(doc, is_query=False) for doc in documents]
    print(f"총 {len(doc_embeddings)}개 문서 벡터 생성 완료! (차원 크기: {len(doc_embeddings[0])})\n")

    # 5. 사용자 질문
    query = "우주에서 목성은 어떤 기체로 구성되어 있나요?"
    print(f"사용자 질문: '{query}'")

    print("\n=== 2. 질문 임베딩 및 가장 유사한 문서 검색 (Retrieval) ===")
    query_embedding = get_embedding(query, is_query=True)

    # 모든 문서와 유사도 비교
    similarities = [cosine_similarity(query_embedding, doc_emb) for doc_emb in doc_embeddings]

    for i, sim in enumerate(similarities):
        print(f"[{i+1}번 문서 유사도: {sim:.4f}] {documents[i]}")

    # 가장 유사한 문서 선택
    best_idx = int(np.argmax(similarities))
    retrieved_doc = documents[best_idx]
    print(f"\n[선택된 참고 문서]: {retrieved_doc}")

    # 6. LLM에게 참고 문서와 함께 최종 답변 생성 요청 (Generation)
    print("\n=== 3. LLM에게 답변 생성 요청 (Augmented Generation) ===")
    prompt = f"""아래 [참고 문서]를 바탕으로 [질문]에 답변해주세요.

[참고 문서]
{retrieved_doc}

[질문]
{query}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    print("\n[최종 AI 답변]:")
    print(response.text)

if __name__ == "__main__":
    main()

