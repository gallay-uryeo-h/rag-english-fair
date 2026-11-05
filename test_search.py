import os
import sys
from dotenv import load_dotenv
from google import genai
import chromadb

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
chroma = chromadb.PersistentClient(path="./chroma_db")
col = chroma.get_collection("english_textbooks")

q = "의령여고에서 개설되는 영어 선택과목들의 평가 방식과 특징을 알려주세요."
emb = client.models.embed_content(
    model="gemini-embedding-2",
    contents=f"task: question answering | query: {q}"
).embeddings[0].values

res = col.query(query_embeddings=[emb], n_results=3)

print("=== 검색된 상위 3개 문서 ===")
for d, m in zip(res["documents"][0], res["metadatas"][0]):
    print(f"[{m['subject_name']} / {m.get('topic', '교과서')}] (p.{m['page']})")
    print(d)
    print("-" * 50)

