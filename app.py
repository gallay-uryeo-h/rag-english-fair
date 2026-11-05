import os
import re
import base64
import streamlit as st
from dotenv import load_dotenv
from google import genai
import chromadb
from PIL import Image

# 1. 페이지 기본 설정
st.set_page_config(
    page_title="영어과 선택과목 상담",
    page_icon="💬",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# 2. 미니멀 메신저 + 인터랙티브 출처 팝오버 CSS
st.markdown("""
<style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    
    html, body, [class*="css"] {
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        background-color: #ffffff;
        color: #191f28;
    }

    /* 기본 Streamlit 아바타 및 헤더 여백 숨기기 */
    [data-testid="stChatMessageAvatarUser"],
    [data-testid="stChatMessageAvatarAssistant"] {
        display: none !important;
    }
    .stChatMessage {
        background-color: transparent !important;
        padding: 0 !important;
        margin-bottom: 0.8rem !important;
    }

    /* 메신저 상단 프로필 헤더 바 */
    .messenger-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 4px;
        border-bottom: 1px solid #f2f4f6;
        margin-bottom: 16px;
    }
    .status-dot {
        width: 8px;
        height: 8px;
        background-color: #3182f6;
        border-radius: 50%;
    }
    .bot-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: #191f28;
        letter-spacing: -0.02em;
    }
    .bot-status {
        font-size: 0.76rem;
        color: #8b95a1;
        margin-left: 4px;
    }

    /* 말풍선 공통 */
    .bubble-wrapper {
        display: flex;
        width: 100%;
        margin-bottom: 4px;
    }
    .bubble-user-wrap {
        justify-content: flex-end;
    }
    .bubble-bot-wrap {
        justify-content: flex-start;
    }

    /* 사용자 말풍선 */
    .bubble-user {
        background-color: #3182f6;
        color: #ffffff;
        padding: 10px 14px;
        border-radius: 18px 18px 4px 18px;
        max-width: 82%;
        font-size: 0.92rem;
        line-height: 1.45;
        letter-spacing: -0.01em;
        word-break: break-word;
    }

    /* 봇 말풍선 */
    .bubble-bot {
        background-color: #f2f4f6;
        color: #191f28;
        padding: 12px 16px;
        border-radius: 18px 18px 18px 4px;
        max-width: 90%;
        font-size: 0.92rem;
        line-height: 1.6;
        letter-spacing: -0.01em;
        word-break: break-word;
    }

    /* HTML 인터랙티브 출처 각주 칩 (Details/Summary 기반 경량 팝업) */
    .cite-wrap {
        display: inline-block;
        position: relative;
        vertical-align: 4px;
        margin: 0 1px;
    }
    .cite-details {
        display: inline;
    }
    .cite-summary {
        list-style: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 15px;
        height: 15px;
        background-color: #e5e8eb;
        color: #3182f6;
        border-radius: 3px;
        font-size: 0.58rem;
        font-weight: 700;
        padding: 0 3px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.15s ease;
    }
    .cite-summary::-webkit-details-marker {
        display: none;
    }
    .cite-summary:hover {
        background-color: #d1d6db;
    }
    /* 팝오버 카드 */
    .cite-popover {
        position: absolute;
        bottom: 22px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 260px;
        max-width: 80vw;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 10px;
        padding: 10px 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        font-size: 0.8rem;
        color: #333d4b;
        line-height: 1.45;
        text-align: left;
        white-space: normal;
    }
    .cite-popover-title {
        font-weight: 700;
        color: #191f28;
        font-size: 0.78rem;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f2f4f6;
        padding-bottom: 4px;
    }
    .cite-popover img {
        width: 100%;
        border-radius: 6px;
        margin-top: 6px;
        border: 1px solid #f2f4f6;
    }

    /* 빠른 질문 버튼 */
    .quick-title {
        font-size: 0.74rem;
        font-weight: 600;
        color: #8b95a1;
        margin-bottom: 6px;
        padding-left: 2px;
    }
    div.stButton > button {
        background-color: #ffffff !important;
        color: #4e5968 !important;
        border: 1px solid #e5e8eb !important;
        border-radius: 16px !important;
        font-size: 0.8rem !important;
        font-weight: 500 !important;
        padding: 4px 10px !important;
        min-height: 32px !important;
        box-shadow: none !important;
        transition: all 0.1s ease !important;
    }
    div.stButton > button:hover {
        background-color: #f9fafb !important;
        border-color: #b0b8c1 !important;
        color: #191f28 !important;
    }

    /* 입력창 하단 고정 느낌 */
    .stChatInputContainer {
        border-radius: 20px !important;
        border: 1px solid #e5e8eb !important;
        background-color: #f9fafb !important;
    }
</style>

<script>
    // 팝오버 외부 클릭 시 자동 닫기 핸들러 (Streamlit iframe 및 부모 DOM 모두 대응)
    (function setupClickOutside() {
        function closeAllPopovers(target) {
            const openDetails = (window.parent || window).document.querySelectorAll('.cite-details[open]');
            openDetails.forEach(function(el) {
                if (!target || !el.contains(target)) {
                    el.removeAttribute('open');
                }
            });
            // 현재 프레임 내 처리
            document.querySelectorAll('.cite-details[open]').forEach(function(el) {
                if (!target || !el.contains(target)) {
                    el.removeAttribute('open');
                }
            });
        }

        window.addEventListener('click', function(e) {
            if (!e.target.closest('.cite-details')) {
                closeAllPopovers(null);
            } else {
                closeAllPopovers(e.target);
            }
        }, true);

        try {
            if (window.parent && window.parent !== window) {
                window.parent.addEventListener('click', function(e) {
                    if (!e.target.closest('.cite-details')) {
                        closeAllPopovers(null);
                    } else {
                        closeAllPopovers(e.target);
                    }
                }, true);
            }
        } catch(err) {}
    })();
</script>

""", unsafe_allow_html=True)

# 3. 서비스 초기화
@st.cache_resource
def init_services():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        st.error(".env 파일에 GEMINI_API_KEY가 없습니다.")
        st.stop()
    
    gemini_client = genai.Client(api_key=api_key)
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection(
        name="english_textbooks",
        metadata={"hnsw:space": "cosine"}
    )
    return gemini_client, collection

gemini_client, collection = init_services()

# 4. 검색 함수
def search_similar_docs(query_text: str, n_results: int = 4):
    formatted_query = f"task: question answering | query: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-2",
        contents=formatted_query
    )
    query_vector = response.embeddings[0].values

    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )
    return results

def get_image_base64(image_path: str) -> str:
    """이미지를 base64로 인코딩하여 HTML 팝오버에 직접 삽입"""
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
    return ""

def format_citations_to_interactive_popovers(text: str, sources: list) -> str:
    """
    [1], [2] 각주 번호를 클릭 시 즉시 말풍선 위에 열리는 
    경량 HTML 팝오버(Popover)로 변환!
    """
    source_map = {str(s["id"]): s for s in sources}

    def replace_citation(match):
        cid = match.group(1)
        src = source_map.get(cid)
        if not src:
            return f'<span class="cite-summary">{cid}</span>'

        if src["subject_name"] == "선택과목 FAQ":
            pop_header = f"💡 FAQ · Q{src['page']}"
            pop_body = f"<div style='font-size:0.75rem; color:#4e5968;'>{src['text']}</div>"
        else:
            pop_header = f"📘 {src['subject_name']} · p.{src['page']}"
            img_b64 = get_image_base64(src.get("image_path", ""))
            if img_b64:
                pop_body = f"<div style='font-size:0.75rem; color:#8b95a1;'>교과서 원본 사진:</div><img src='{img_b64}' alt='교과서 원본' />"
            else:
                pop_body = f"<div style='font-size:0.75rem; color:#4e5968;'>{src['text'][:100]}...</div>"

        # HTML <details>/<summary> 기반 팝오버
        return f"""<span class="cite-wrap">
            <details class="cite-details">
                <summary class="cite-summary">{cid}</summary>
                <div class="cite-popover">
                    <div class="cite-popover-title"><span>{pop_header}</span></div>
                    {pop_body}
                </div>
            </details>
        </span>"""

    return re.sub(r'\[(\d+)\]', replace_citation, text)

# 5. 상단 메신저 프로필 바
st.markdown("""
<div class="messenger-header">
    <div class="status-dot"></div>
    <div>
        <span class="bot-name">영어과 선택과목 상담</span>
        <span class="bot-status">상담 가능</span>
    </div>
</div>
""", unsafe_allow_html=True)

# 6. 빠른 질문 버튼
st.markdown("<div class='quick-title'>자주 묻는 질문</div>", unsafe_allow_html=True)
col1, col2 = st.columns(2)
with col1:
    q1 = st.button("내신 5등급제 산출 방식", use_container_width=True)
    q2 = st.button("의령여고 영어 선택과목 체계", use_container_width=True)
with col2:
    q3 = st.button("학생부 세특 기록 연계 방안", use_container_width=True)
    q4 = st.button("공통영어1 주요 단원 구성", use_container_width=True)

# 7. 세션 메시지 관리
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "안녕하십니까. 영어과 선택과목 안내 챗봇입니다. 교육과정 규정이나 교과서에 대해 궁금한 점을 남겨주시면 안내해 드립니다.",
            "sources": []
        }
    ]

# 이전 대화 렌더링
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.markdown(f"""
        <div class="bubble-wrapper bubble-user-wrap">
            <div class="bubble-user">{msg["content"]}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        html_content = format_citations_to_interactive_popovers(msg["content"], msg.get("sources", []))
        st.markdown(f"""
        <div class="bubble-wrapper bubble-bot-wrap">
            <div class="bubble-bot">{html_content}</div>
        </div>
        """, unsafe_allow_html=True)

# 추천 질문 바인딩
selected_prompt = None
if q1: selected_prompt = "2028 대입 개편에 따른 고등학교 영어 내신 5등급제 산출 방식에 대해 알려주세요."
elif q2: selected_prompt = "의령여고에서 개설되는 영어 선택과목들의 평가 방식과 특징을 알려주세요."
elif q3: selected_prompt = "영어과 선택과목 수업을 통해 학생부 세특에 어떤 내용을 기록할 수 있나요?"
elif q4: selected_prompt = "공통영어1 교과서의 주요 단원 구성과 주제는 무엇인가요?"

user_input = st.chat_input("메시지를 입력하세요")
prompt = user_input or selected_prompt

# 8. 질문 처리 및 실시간 응답
if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt, "sources": []})
    st.markdown(f"""
    <div class="bubble-wrapper bubble-user-wrap">
        <div class="bubble-user">{prompt}</div>
    </div>
    """, unsafe_allow_html=True)

    loading_placeholder = st.empty()
    loading_placeholder.markdown("<div style='color: #8b95a1; font-size: 0.82rem; padding: 4px 6px;'>답변을 생성하고 있습니다...</div>", unsafe_allow_html=True)

    # 검색
    search_res = search_similar_docs(prompt, n_results=4)

    context_blocks = []
    sources = []

    if search_res and search_res["documents"] and search_res["documents"][0]:
        docs = search_res["documents"][0]
        metas = search_res["metadatas"][0]

        for i, (d, m) in enumerate(zip(docs, metas)):
            citation_id = i + 1
            subject = m.get("subject_name", "영어교과서")
            page = m.get("page", "?")
            topic = m.get("topic", "")
            
            context_blocks.append(f"[{citation_id}] 출처: {subject} ({'Q' + str(page) if subject == '선택과목 FAQ' else 'p.' + str(page)})\n내용: {d}")
            
            sources.append({
                "id": citation_id,
                "subject_name": subject,
                "page": page,
                "topic": topic,
                "text": d,
                "image_path": m.get("image_path", "")
            })

    context_str = "\n\n".join(context_blocks) if context_blocks else "관련된 내용을 찾지 못했습니다."

    system_instruction = """당신은 고등학교 선택과목 박람회 영어과의 공식 모바일 챗봇입니다.

[작성 원칙]
1. 모바일 메신저 환경에 맞게 미사여구와 불필요한 서론/결론을 일절 배제하고 핵심 내용만 간결하게 설명하십시오.
2. 어조는 정중한 격식체 존댓말('~합니다', '~입니다')을 사용하십시오.
3. 반드시 제공된 [참고 자료]에 근거하여 작성하십시오.
4. 문장이나 사실 진술 뒤에 근거 번호를 반드시 `[1]`, `[2]` 형태로 표기하십시오.
5. 참고 자료에 없는 내용은 임의로 추측하지 말고, "해당 내용은 제공된 자료에 포함되어 있지 않으므로 현장 담당 교사에게 문의하시기 바랍니다."라고 간결히 안내하십시오.
"""

    rag_prompt = f"""{system_instruction}

[참고 자료]:
{context_str}

[질문]:
{prompt}
"""

    # 실시간 스트리밍 답변 생성 (Streaming Response)
    stream_placeholder = st.empty()
    full_text = ""

    try:
        response_stream = gemini_client.models.generate_content_stream(
            model="gemini-3.5-flash-lite",
            contents=rag_prompt
        )

        loading_placeholder.empty()

        for chunk in response_stream:
            if chunk.text:
                full_text += chunk.text
                # 실시간으로 타이핑 효과 렌더링
                stream_placeholder.markdown(f"""
                <div class="bubble-wrapper bubble-bot-wrap">
                    <div class="bubble-bot">{full_text}▌</div>
                </div>
                """, unsafe_allow_html=True)

        # 스트리밍 완료 후 커서(▌)를 제거하고 최종 인터랙티브 팝오버로 치환
        final_html = format_citations_to_interactive_popovers(full_text, sources)
        stream_placeholder.markdown(f"""
        <div class="bubble-wrapper bubble-bot-wrap">
            <div class="bubble-bot">{final_html}</div>
        </div>
        """, unsafe_allow_html=True)

        ai_answer = full_text

    except Exception as e:
        loading_placeholder.empty()
        ai_answer = f"답변 생성 중 오류가 발생했습니다: {e}"
        stream_placeholder.markdown(f"""
        <div class="bubble-wrapper bubble-bot-wrap">
            <div class="bubble-bot">{ai_answer}</div>
        </div>
        """, unsafe_allow_html=True)

    st.session_state.messages.append({
        "role": "assistant",
        "content": ai_answer,
        "sources": sources
    })
