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
    page_title="영어과 선택과목 상담 & 맞춤 본문 찾기",
    page_icon="📚",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# 2. 미니멀 메신저 + 탭 + 본문 추천 카드 CSS
st.markdown("""
<style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    
    html, body, [class*="css"] {
        font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        background-color: #ffffff;
        color: #191f28;
    }

    /* 탭 헤더 스타일링 */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        border-bottom: 2px solid #f2f4f6;
        padding-bottom: 4px;
        margin-bottom: 18px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 42px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #8b95a1;
        border-radius: 10px;
        padding: 0 16px;
        background-color: transparent;
        border: none !important;
    }
    .stTabs [aria-selected="true"] {
        color: #3182f6 !important;
        background-color: #e8f3ff !important;
    }

    /* 기본 Streamlit 아바타 숨기기 */
    [data-testid="stChatMessageAvatarUser"],
    [data-testid="stChatMessageAvatarAssistant"] {
        display: none !important;
    }
    .stChatMessage {
        background-color: transparent !important;
        padding: 0 !important;
        margin-bottom: 0.8rem !important;
    }

    /* 메신저 상단 바 */
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

    /* 바깥 클릭 시 100% 자동 닫히는 CSS 포커스 팝오버 */
    .cite-popover-container {
        display: inline-block;
        position: relative;
        vertical-align: 4px;
        margin: 0 1px;
        outline: none;
    }
    .cite-trigger-btn {
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
        border: none;
        outline: none;
        transition: background-color 0.15s ease;
    }
    .cite-trigger-btn:hover {
        background-color: #d1d6db;
    }
    .cite-content-box {
        display: none;
        position: absolute;
        bottom: 22px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 270px;
        max-width: 82vw;
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 10px;
        padding: 10px 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
        font-size: 0.8rem;
        color: #333d4b;
        line-height: 1.45;
        text-align: left;
        white-space: normal;
    }
    .cite-popover-container:focus-within .cite-content-box {
        display: block;
    }
    .cite-popover-title {
        font-weight: 700;
        color: #191f28;
        font-size: 0.78rem;
        margin-bottom: 6px;
        border-bottom: 1px solid #f2f4f6;
        padding-bottom: 4px;
    }
    .cite-content-box img {
        width: 100%;
        border-radius: 6px;
        margin-top: 6px;
        border: 1px solid #f2f4f6;
    }

    /* 버튼 스타일 */
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
        border-radius: 14px !important;
        font-size: 0.82rem !important;
        font-weight: 500 !important;
        padding: 6px 12px !important;
        min-height: 36px !important;
        box-shadow: none !important;
        transition: all 0.12s ease !important;
    }
    div.stButton > button:hover {
        background-color: #f9fafb !important;
        border-color: #3182f6 !important;
        color: #3182f6 !important;
    }

    /* 본문 추천 탭 전용 카드 스타일 */
    .rec-intro-box {
        background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
        border: 1px solid #d4e7fe;
        border-radius: 14px;
        padding: 16px 18px;
        margin-bottom: 20px;
    }
    .rec-card {
        background-color: #ffffff;
        border: 1px solid #e5e8eb;
        border-radius: 14px;
        padding: 18px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }
    .rec-badge {
        display: inline-block;
        background-color: #e8f3ff;
        color: #3182f6;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        margin-bottom: 8px;
    }
    .rec-title {
        font-size: 1.02rem;
        font-weight: 700;
        color: #191f28;
        margin-bottom: 6px;
    }
    .rec-meta {
        font-size: 0.8rem;
        color: #8b95a1;
        margin-bottom: 12px;
    }
    .rec-reason {
        background-color: #f9fafb;
        border-left: 3px solid #3182f6;
        padding: 8px 12px;
        border-radius: 0 8px 8px 0;
        font-size: 0.86rem;
        color: #333d4b;
        line-height: 1.5;
        margin-bottom: 12px;
    }
    .rec-quote {
        font-size: 0.82rem;
        color: #4e5968;
        line-height: 1.5;
        background-color: #fafafb;
        padding: 10px 12px;
        border-radius: 8px;
        font-style: italic;
    }

    /* 입력창 */
    .stChatInputContainer {
        border-radius: 20px !important;
        border: 1px solid #e5e8eb !important;
        background-color: #f9fafb !important;
    }
</style>
""", unsafe_allow_html=True)

# 3. 서비스 초기화
@st.cache_resource
def init_services():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key and hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
        api_key = st.secrets["GEMINI_API_KEY"]

    if not api_key:
        st.error("GEMINI_API_KEY가 설정되지 않았습니다.")
        st.stop()
    
    gemini_client = genai.Client(api_key=api_key)
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    collection = chroma_client.get_or_create_collection(
        name="english_textbooks",
        metadata={"hnsw:space": "cosine"}
    )

    # 클라우드 배포 시 DB가 비어있다면 data/FAQ.txt 자동 인덱싱
    if collection.count() == 0 and os.path.exists("data/FAQ.txt"):
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
                        model="gemini-embedding-2",
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
                except Exception:
                    pass

    return gemini_client, collection

gemini_client, collection = init_services()

# 4. 공통 헬퍼 함수
def get_image_base64(image_path: str) -> str:
    """이미지를 base64로 인코딩하여 HTML 팝오버에 직접 삽입"""
    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
    return ""

def format_citations_to_interactive_popovers(text: str, sources: list) -> str:
    source_map = {str(s["id"]): s for s in sources}

    def replace_citation(match):
        cid = match.group(1)
        src = source_map.get(cid)
        if not src:
            return f'<span class="cite-trigger-btn">{cid}</span>'

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

        return f"""<span class="cite-popover-container" tabindex="0">
            <span class="cite-trigger-btn">{cid}</span>
            <div class="cite-content-box">
                <div class="cite-popover-title">{pop_header}</div>
                {pop_body}
            </div>
        </span>"""

    return re.sub(r'\[(\d+)\]', replace_citation, text)

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

def search_recommended_passages(query_text: str, grade_filter: str = "전체", n_results: int = 4):
    """교과서 본문 지문만 검색 (FAQ 제외, 학년 필터 지원)"""
    formatted_query = f"task: question answering | query: 영어 교과서 본문 독해 지문 주제: {query_text}"
    response = gemini_client.models.embed_content(
        model="gemini-embedding-2",
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

# ==============================================================================
# 메인 화면: 탭 분기 (상담 챗봇 vs 맞춤 본문 찾기)
# ==============================================================================
tab_chat, tab_recommend = st.tabs(["💬 선택과목 상담 챗봇", "📖 나에게 맞는 본문 찾기"])

# ── [TAB 1] 선택과목 상담 챗봇 ──────────────────────────────────────────
with tab_chat:
    st.markdown("""
    <div class="messenger-header">
        <div class="status-dot"></div>
        <div>
            <span class="bot-name">영어과 선택과목 상담</span>
            <span class="bot-status">상담 가능</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div class='quick-title'>자주 묻는 질문</div>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        q1 = st.button("내신 5등급제 산출 방식", key="btn_q1", use_container_width=True)
        q2 = st.button("의령여고 영어 선택과목 체계", key="btn_q2", use_container_width=True)
    with col2:
        q3 = st.button("학생부 세특 기록 연계 방안", key="btn_q3", use_container_width=True)
        q4 = st.button("공통영어1 주요 단원 구성", key="btn_q4", use_container_width=True)

    if "messages" not in st.session_state:
        st.session_state.messages = [
            {
                "role": "assistant",
                "content": "안녕하십니까. 영어과 선택과목 안내 챗봇입니다. 교육과정 규정이나 교과서에 대해 궁금한 점을 남겨주시면 안내해 드립니다.",
                "sources": []
            }
        ]

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

    selected_prompt = None
    if q1: selected_prompt = "2028 대입 개편에 따른 고등학교 영어 내신 5등급제 산출 방식에 대해 알려주세요."
    elif q2: selected_prompt = "의령여고에서 개설되는 영어 선택과목들의 평가 방식과 특징을 알려주세요."
    elif q3: selected_prompt = "영어과 선택과목 수업을 통해 학생부 세특에 어떤 내용을 기록할 수 있나요?"
    elif q4: selected_prompt = "공통영어1 교과서의 주요 단원 구성과 주제는 무엇인가요?"

    user_input = st.chat_input("메시지를 입력하세요 (예: 2학년 영어 선택과목 추천해줘)")
    prompt = user_input or selected_prompt

    if prompt:
        st.session_state.messages.append({"role": "user", "content": prompt, "sources": []})
        st.markdown(f"""
        <div class="bubble-wrapper bubble-user-wrap">
            <div class="bubble-user">{prompt}</div>
        </div>
        """, unsafe_allow_html=True)

        loading_placeholder = st.empty()
        loading_placeholder.markdown("<div style='color: #8b95a1; font-size: 0.82rem; padding: 4px 6px;'>답변을 생성하고 있습니다...</div>", unsafe_allow_html=True)

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

        response_placeholder = st.empty()

        try:
            response = gemini_client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=rag_prompt
            )
            ai_answer = response.text
        except Exception as e:
            ai_answer = f"답변 생성 중 오류가 발생했습니다: {e}"

        loading_placeholder.empty()

        final_html = format_citations_to_interactive_popovers(ai_answer, sources)
        response_placeholder.markdown(f"""
        <div class="bubble-wrapper bubble-bot-wrap">
            <div class="bubble-bot">{final_html}</div>
        </div>
        """, unsafe_allow_html=True)

        st.session_state.messages.append({
            "role": "assistant",
            "content": ai_answer,
            "sources": sources
        })

# ── [TAB 2] 나에게 맞는 교과서 본문 찾기 ────────────────────────────────
with tab_recommend:
    st.markdown("""
    <div class="rec-intro-box">
        <div style="font-weight: 700; font-size: 1.05rem; color: #1e3a8a; margin-bottom: 4px;">
            🎯 내 진로 & 관심사에 맞는 영어 교과서 본문 찾기
        </div>
        <div style="font-size: 0.85rem; color: #475569; line-height: 1.5;">
            평소 관심 있는 학문 분야, 취미, 진로 희망을 입력해 보세요.<br>
            고등학교 6권의 영어 교과서(1,137개 지문) 중 <b>가장 잘 어울리는 본문 지문</b>과 <b>학생부(세특) 연계 탐구 주제</b>를 찾아드립니다!
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 관심 키워드 프리셋 버튼
    st.markdown("<div class='quick-title'>💡 관심 분야 빠른 선택</div>", unsafe_allow_html=True)
    chip_col1, chip_col2, chip_col3 = st.columns(3)
    
    preset_query = ""
    with chip_col1:
        if st.button("🤖 AI · 과학기술", key="chip_ai", use_container_width=True):
            preset_query = "인공지능(AI), 미래 첨단 기술, 컴퓨터 공학과 윤리적 딜레마에 관심이 많습니다."
        if chip_col1.button("🧠 심리학 · 대인관계", key="chip_psy", use_container_width=True):
            preset_query = "친구 관계, 청소년 심리, 갈등 해결과 공감 능력 소통에 대해 배우고 싶습니다."
    with chip_col2:
        if st.button("🌱 기후위기 · 환경", key="chip_env", use_container_width=True):
            preset_query = "기후 변화, 제로 웨이스트, 환경 보호 및 지속 가능한 생태계에 관심이 있습니다."
        if chip_col2.button("⚖️ 사회정의 · 인권", key="chip_law", use_container_width=True):
            preset_query = "사회적 약자 배려, 인권 신장, 공정함과 공동체 규범에 대해 탐구하고 싶습니다."
    with chip_col3:
        if st.button("🌍 세계문화 · 여행", key="chip_cult", use_container_width=True):
            preset_query = "다양한 국가의 전통문화, 글로벌 에티켓, 세계 건축과 음식 문화에 흥미가 있습니다."
        if chip_col3.button("📈 경영 · 미래사회", key="chip_biz", use_container_width=True):
            preset_query = "기업의 사회적 책임(CSR), 글로벌 경제 트렌드 및 미래 직업의 변화에 관심이 있습니다."

    if "rec_query_input" not in st.session_state:
        st.session_state.rec_query_input = ""

    if preset_query:
        st.session_state.rec_query_input = preset_query

    # 입력 폼
    rec_text = st.text_area(
        "나의 진로 희망이나 관심사, 탐구하고 싶은 주제를 자유롭게 적어주세요:",
        value=st.session_state.rec_query_input,
        placeholder="예: 생명과학이나 의학 분야로 진학하고 싶고, 뇌과학이나 질병 극복에 대한 영문 지문을 읽어보고 싶어요.",
        height=90,
        key="rec_area"
    )

    col_grade, col_btn = st.columns([1, 1])
    with col_grade:
        grade_choice = st.selectbox(
            "탐색할 학년 범위",
            options=["전체", "1학년", "2학년", "3학년"],
            index=0,
            help="특정 학년의 교과서만 집중 탐색하고 싶을 때 선택하세요."
        )
    with col_btn:
        st.write("")
        st.write("")
        run_rec = st.button("🔍 맞춤 본문 지문 찾기", key="btn_run_rec", use_container_width=True)

    if run_rec and rec_text.strip():
        with st.spinner("📚 교과서 속 최적의 본문 지문과 학생부 연계 아이디어를 분석 중입니다..."):
            # 1. 벡터 검색
            rec_results = search_recommended_passages(rec_text, grade_filter=grade_choice, n_results=3)

            candidates = []
            if rec_results and rec_results["documents"] and rec_results["documents"][0]:
                for d, m in zip(rec_results["documents"][0], rec_results["metadatas"][0]):
                    candidates.append({
                        "subject": m.get("subject_name", "영어 교과서"),
                        "grade": m.get("grade", ""),
                        "semester": m.get("semester", ""),
                        "page": m.get("page", "?"),
                        "publisher": m.get("publisher", ""),
                        "topic": m.get("topic", ""),
                        "text": d,
                        "image_path": m.get("image_path", "")
                    })

            if not candidates:
                st.warning("관련 교과서 본문을 찾지 못했습니다. 다른 관심사 키워드로 검색해 보세요.")
            else:
                # 2. LLM 맞춤 추천 분석 생성
                prompt_for_ai = f"""당신은 고등학교 영어과 진로 연계 교육과정 장학사 및 교과 전문가입니다.
학생의 관심사를 바탕으로, 교과서 검색 결과 중 가장 적합한 본문 지문들을 분석하여 미니멀하고 단정한 큐레이션 리포트를 마크다운 형식으로 작성하십시오.

[학생의 관심사/진로]:
{rec_text}

[검색된 교과서 후보 지문들]:
"""
                for idx, c in enumerate(candidates):
                    prompt_for_ai += f"""
--- 후보 {idx+1} ---
- 교과서: {c['subject']} (p.{c['page']})
- 내용 발췌: {c['text'][:300]}
"""

                prompt_for_ai += """
[작성 원칙 및 형식]:
1. 감탄사, 불필요한 서두 인사말, 이모지(🌟, 🤖, 💡, 📝 등)를 일절 사용하지 마십시오. 군더더기 없는 매우 깔끔하고 담백한 전문 리포트 양식을 유지하십시오.
2. 문장은 정중하고 차분한 격식체('~합니다', '~를 추천합니다')로 작성하십시오.
3. 각 후보 지문마다 아래 구조를 명확히 지켜 작성하십시오:

### 1. [지문 주제 및 핵심 테마]
* **추천 교과**: {해당 교과서명 및 페이지}
* **추천 배경**: 학생의 관심 분야(진로)와 지문의 연계성을 2~3문장으로 간결하게 설명
* **세특 탐구 연계안**: 본문 내용을 심화하여 학교생활기록부(세특)에 기록할 수 있는 구체적인 탐구 과제/보고서 주제 제안 (1가지)

4. 보고서 말미에 전체적인 교과 이수 권장 사항이나 학습 방향을 '교과 이수 가이드'로 2줄 이내로 간결히 요약하십시오.
"""

                try:
                    rec_response = gemini_client.models.generate_content(
                        model="gemini-3.5-flash-lite",
                        contents=prompt_for_ai
                    )
                    rec_report = rec_response.text
                except Exception as e:
                    rec_report = f"분석 리포트 생성 중 오류가 발생했습니다: {e}"

                # 3. 결과 화면 렌더링
                st.markdown("### 📋 AI 맞춤 본문 추천 리포트")
                st.markdown(rec_report)

                st.markdown("---")
                st.markdown("### 📖 추천된 교과서 실제 페이지 확인")
                for idx, c in enumerate(candidates):
                    with st.expander(f"📄 [{c['subject']}] p.{c['page']} 원본 및 본문 발췌 보기", expanded=(idx == 0)):
                        st.markdown(f"**과목/단원:** {c['subject']} (페이지: p.{c['page']})")
                        st.markdown(f"**지문 발췌:**\n> {c['text']}")
                        
                        # 교과서 원본 사진 표시
                        img_path = c.get("image_path", "")
                        if img_path and os.path.exists(img_path):
                            st.image(img_path, caption=f"{c['subject']} p.{c['page']} 교과서 원본", use_container_width=True)
                        else:
                            st.info("교과서 페이지 이미지가 준비 중입니다.")
