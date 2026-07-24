import base64
import os
import time
import streamlit as st

# 1. 페이지 설정 (넓은 레이아웃 고정)
st.set_page_config(
    page_title="MyStair - 마이스터고 진로 파트너",
    page_icon="📈",
    layout="wide",
)

# 2. 세션 상태 관리 (초기 화면을 'main' 대시보드로 설정)
if "page" not in st.session_state:
    st.session_state.page = "main"

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# 3. 글로벌 CSS 주입 (디자인 및 네비게이션 버튼 스타일링)
st.markdown(
    """
<style>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css');

body, [class*="css"] {
    font-family: 'SUIT', -apple-system, sans-serif !important;
}

@keyframes smoothFadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes floatAnimation {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-14px); }
    100% { transform: translateY(0px); }
}

/* 🌟 화면 전체를 아우르는 앰비언트 배경 */
.stApp {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 178, 184, 0.12) 0px, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(126, 87, 194, 0.1) 0px, transparent 45%),
        radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
        #ffffff !important;
    background-attachment: fixed;
    color: #1e293b;
}

/* 🌟 와이드 화면 최적화 (1350px) */
.block-container {
    padding-top: 1.5rem;
    padding-bottom: 12rem;
    max-width: 1350px !important;
    margin: 0 auto !important;
    padding-left: 4rem !important;
    padding-right: 4rem !important;
    animation: smoothFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 🌟 상단 네비게이션 바 레이아웃 스타일 */
.speak-navbar-container {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    border-radius: 100px;
    padding: 8px 30px;
    margin-bottom: 50px;
    width: 100%;
}

/* 네비게이션 바 내부 스트림릿 버튼 커스텀 */
div[data-testid="column"] > div > div > div > div.stButton > button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #475569 !important;
    font-weight: 600 !important;
    font-size: 15px !important;
    transition: all 0.2s ease !important;
}

div[data-testid="column"] > div > div > div > div.stButton > button:hover {
    color: #0f172a !important;
    background: rgba(241, 245, 249, 0.5) !important;
}

/* 로고 버튼 특별 커스텀 */
div[data-testid="column"]:nth-child(1) div.stButton > button {
    font-size: 22px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    letter-spacing: -1px;
}

/* 한국어 선택 버튼 스타일 */
.lang-btn-wrapper {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 8px 18px;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
}

/* 🌟 대시보드 벤토박스 (메인 페이지용) */
.bento-box {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 35px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.03);
    border: 1px solid rgba(226, 232, 240, 0.8);
    height: 100%;
}

.log-item {
    padding: 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    transition: all 0.2s ease;
}
.log-item:hover {
    background: #ffffff;
    border-color: #3bb2b8;
    box-shadow: 0 5px 15px rgba(59, 178, 184, 0.1);
}

/* =========================================
   서비스 소개 페이지(홍보) 전용 CSS
========================================= */
.hero-section-left {
    text-align: left;
    padding: 30px 0;
}
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    color: #334155;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 28px;
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}
.hero-title {
    font-size: 70px;
    font-weight: 800;
    margin: 0 0 28px 0;
    line-height: 1.15;
    letter-spacing: -2.5px;
    color: #0f172a;
}
.hero-title span {
    background: linear-gradient(90deg, #3bb2b8, #7e57c2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hero-subtitle {
    font-size: 22px;
    color: #64748b;
    margin: 0 0 45px 0;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: -0.5px;
}
.hero-graphic-container {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: floatAnimation 4s ease-in-out infinite;
}
.hero-graphic {
    width: 100%;
    max-width: 520px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.1));
}
.scroll-section {
    padding-top: 260px;
}
.section-tag {
    font-size: 14px;
    font-weight: 700;
    color: #3bb2b8;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}
.section-heading {
    font-size: 44px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 16px;
    letter-spacing: -1.2px;
    line-height: 1.3;
}
.section-desc {
    font-size: 20px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 35px;
}
.modern-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-radius: 28px;
    padding: 44px 40px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    height: 100%;
    display: flex;
    flex-direction: column;
}
.modern-card:hover {
    transform: translateY(-8px);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 30px 60px rgba(126, 87, 194, 0.12);
    border-color: rgba(126, 87, 194, 0.4);
}
.modern-card h3 {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 16px 0;
    letter-spacing: -0.5px;
}
.modern-card p {
    font-size: 18px;
    color: #64748b;
    line-height: 1.75;
    margin: 0;
    word-break: keep-all;
}
.faq-box {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 36px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 10px 25px rgba(0,0,0,0.02);
    margin-bottom: 20px;
    transition: all 0.3s ease;
}
.faq-box:hover {
    border-color: rgba(59, 178, 184, 0.4);
    box-shadow: 0 15px 35px rgba(59, 178, 184, 0.06);
}
.faq-q {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 12px;
}
.faq-a {
    font-size: 18px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
}
.footer-container {
    margin-top: 240px;
    padding: 60px 0;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: #64748b;
    font-size: 16px;
}
.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.footer-logo {
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
}
</style>
""",
    unsafe_allow_html=True,
)


# =========================================================
# 🌟 상단 알약 네비게이션 바 (버튼 클릭 기반 라우팅)
# =========================================================
st.markdown('<div class="speak-navbar-container">', unsafe_allow_html=True)
nav_col1, nav_col2, nav_col3, nav_col4, nav_col5 = st.columns([2, 5, 1, 1, 1.2])

with nav_col1:
    if st.button("MyStair", use_container_width=True):
        navigate_to("main")

with nav_col3:
    if st.button("서비스 소개", use_container_width=True):
        navigate_to("intro")

with nav_col4:
    if st.button("팀 소개", use_container_width=True):
        st.toast("팀 소개 페이지는 준비 중입니다!")

with nav_col5:
    st.markdown(
        """
        <div class="lang-btn-wrapper" style="float: right;">
            <span>한국어</span>
            <span style="font-size: 10px;">▼</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
st.markdown('</div>', unsafe_allow_html=True)


# =========================================================
# [PAGE 1] 진짜 메인 대시보드 (학생용 워크스페이스)
# =========================================================
if st.session_state.page == "main":
    
    st.markdown(
        """
        <div style="margin-bottom: 30px;">
            <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin-bottom: 5px;">환영합니다, 미래의 기술 명장님! 👋</h1>
            <p style="font-size: 18px; color: #64748b;">현장 실습 42일차, 오늘도 안전하게 실무 경험을 쌓아볼까요?</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    
    # 상단 요약 지표
    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    col_m1.metric("이번 달 실습 기록", "12 건", "+3 건 (이번 주)")
    col_m2.metric("산업기사 취득 D-Day", "D-28", "원서 접수 완료")
    col_m3.metric("AI 자소서 완성도", "85 %", "+15% 상승")
    col_m4.metric("트러블슈팅 해결", "4 건", "우수")

    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    # 메인 컨텐츠 영역
    dash_col1, dash_col2 = st.columns([1.8, 1], gap="large")

    with dash_col1:
        st.markdown(
            """
            <div class="bento-box">
                <h3 style="margin: 0 0 20px 0; color: #0f172a; font-size: 22px;">📚 최근 실습 및 경험 일지</h3>
                <div class="log-item">
                    <div style="font-size: 13px; font-weight: 700; color: #3bb2b8; margin-bottom: 5px;">2026.07.23 (목) • PLC 제어 실습</div>
                    <div style="font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 5px;">컨베이어 벨트 모터 회로 단락 트러블슈팅</div>
                    <div style="font-size: 15px; color: #64748b;">예기치 않은 회로 단락 오류 발생 시 테스터기를 이용해 2시간 내 원인 분석 및 복구를 완료함.</div>
                </div>
                <div class="log-item">
                    <div style="font-size: 13px; font-weight: 700; color: #7e57c2; margin-bottom: 5px;">2026.07.21 (화) • 정규 교육 과정</div>
                    <div style="font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 5px;">시퀀스 회로 설계 및 도면 해독 완료</div>
                    <div style="font-size: 15px; color: #64748b;">공압 실린더 제어를 위한 기초 시퀀스 회로를 설계하고 동작 테스트를 100% 성공함.</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with dash_col2:
        st.markdown(
            """
            <div class="bento-box">
                <h3 style="margin: 0 0 20px 0; color: #0f172a; font-size: 22px;">📝 오늘의 목표</h3>
            """,
            unsafe_allow_html=True,
        )
        st.checkbox("실습 일지 1건 기록하기", value=True)
        st.checkbox("설비보전기사 기출 1회 풀기")
        st.checkbox("안전 교육 이수증 업로드")
        
        st.markdown("<hr style='margin: 25px 0; border-color: #e2e8f0;'>", unsafe_allow_html=True)
        
        st.markdown("<h3 style='margin: 0 0 15px 0; color: #0f172a; font-size: 20px;'>✨ AI STAR 자소서 추출</h3>", unsafe_allow_html=True)
        if st.button("기록 바탕으로 자소서 생성하기", type="primary", use_container_width=True):
            with st.spinner("최근 실습 기록을 분석하여 자소서를 작성 중입니다..."):
                time.sleep(1.5)
            st.success("자소서 초안이 완성되었습니다!")
        
        st.markdown("</div>", unsafe_allow_html=True)


# =========================================================
# [PAGE 2] 서비스 소개 페이지 (홍보/랜딩 페이지)
# =========================================================
elif st.session_state.page == "intro":

    # --- [섹션 1] 첫 화면 (히어로) ---
    hero_col1, hero_col2 = st.columns([1, 1], gap="large")

    with hero_col1:
        st.markdown(
            """
        <div class="hero-section-left">
            <div class="hero-badge">✨ 마이스터고 학생을 위한 단 하나의 진로 파트너</div>
            <h1 class="hero-title">세상으로 나아가는<br><span>너의 첫 번째 계단</span></h1>
            <p class="hero-subtitle">실습 기록부터 AI 자소서까지, 꿈을 현실로 만드는 혁신적인 커리어 플랫폼</p>
        </div>
        """,
            unsafe_allow_html=True,
        )

        st.markdown(
            """
        <style>
        div.stButton > button[kind="primary"] {
            background: #0f172a !important;
            color: #ffffff !important;
            border: none !important;
            padding: 20px 42px !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            border-radius: 50px !important;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2) !important;
            width: fit-content !important;
            transition: all 0.3s ease !important;
        }
        div.stButton > button[kind="primary"]:hover {
            background: #334155 !important;
            transform: translateY(-2px);
        }
        </style>
        """,
            unsafe_allow_html=True,
        )
        if st.button("대시보드로 돌아가기", type="primary"):
            navigate_to("main")

    with hero_col2:
        if os.path.exists("main_image.png"):
            with open("main_image.png", "rb") as f:
                encoded_img = base64.b64encode(f.read()).decode("utf-8")
            st.markdown(
                f"""
        <div class="hero-graphic-container">
            <img src="data:image/png;base64,{encoded_img}" class="hero-graphic" alt="3D 계단 이미지">
        </div>
        """,
                unsafe_allow_html=True,
            )
        else:
            st.warning("⚠️ 'main_image.png' 파일이 없습니다.")

    # --- [섹션 2] 서비스 기획 배경 ---
    st.markdown(
        """
    <div class="scroll-section">
        <div class="section-tag">Project Background</div>
        <div class="section-heading">왜 MyStair가 필요할까요?</div>
        <div class="section-desc">일반고와 다른 마이스터고만의 특수한 현장 실습과 기술 중심 교육 과정을 온전히 담아내기 위해 기획되었습니다.</div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    bg_col1, bg_col2 = st.columns(2, gap="large")
    with bg_col1:
        st.markdown(
            '<div class="modern-card"><h3>📝 파편화된 실습 기록의 한계</h3><p>학교 생활 중 겪은 수많은 기술 실습과 트러블슈팅 경험들이 체계적으로 관리되지 못하고 흩어져 있어, 취업 시 포트폴리오나 자소서에 효과적으로 녹여내기 어렵다는 문제점에서 출발했습니다.</p></div>',
            unsafe_allow_html=True,
        )
    with bg_col2:
        st.markdown(
            '<div class="modern-card"><h3>🚀 맞춤형 커리어 빌딩</h3><p>학생들이 흘린 실습의 땀방울을 데이터로 누적하고, 기업이 요구하는 핵심 직무 역량과 STAR 기법 자소서로 곧바로 전환하여 자신감 있게 취업 시장에 뛰어들도록 돕습니다.</p></div>',
            unsafe_allow_html=True,
        )

    # --- [섹션 3] 핵심 기능 안내 ---
    st.markdown(
        """
    <div class="scroll-section">
        <div class="section-tag">Core Features</div>
        <div class="section-heading">핵심 기능 안내</div>
        <div class="section-desc">마이스터고 학생들의 취업 성공을 위한 3가지 핵심 솔루션입니다.</div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    f_col1, f_col2, f_col3 = st.columns(3, gap="large")
    with f_col1:
        st.markdown(
            '<div class="modern-card"><h3>🎯 맞춤형 진로 로드맵</h3><p>전공과 학년별 역량에 맞춘 단계별 성장 경로를 설계하고 취업 목표를 체계적으로 관리합니다.</p></div>',
            unsafe_allow_html=True,
        )
    with f_col2:
        st.markdown(
            '<div class="modern-card"><h3>📅 실습 및 경험 캘린더</h3><p>학교 정규 수업 및 현장 실습 활동, 자격증 취득 과정을 스마트하게 기록하고 자산화합니다.</p></div>',
            unsafe_allow_html=True,
        )
    with f_col3:
        st.markdown(
            '<div class="modern-card"><h3>✨ AI STAR 자소서 변환</h3><p>기록된 경험 데이터를 바탕으로 기업 맞춤형 STAR(상황-과제-행동-결과) 자기소개서를 자동 완성합니다.</p></div>',
            unsafe_allow_html=True,
        )

    # --- [섹션 4] 자주 묻는 질문 (FAQ) ---
    st.markdown(
        """
    <div class="scroll-section">
        <div class="section-tag">FAQ</div>
        <div class="section-heading">자주 묻는 질문</div>
        <div class="section-desc">MyStair에 대해 자주 궁금해하시는 내용들을 정리했습니다.</div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
    <div class="faq-box">
        <div class="faq-q">Q. 일반 고등학교 학생도 사용할 수 있나요?</div>
        <div class="faq-a">A. MyStair는 마이스터고 및 직업계고 학생들의 특수한 기술 실습 내역과 자격증, 현장 실습 경험 관리에 특화되어 설계되었습니다.</div>
    </div>
    <div class="faq-box">
        <div class="faq-q">Q. AI 자소서는 어떻게 작성되나요?</div>
        <div class="faq-a">A. 사용자가 캘린더에 기록한 실습 및 트러블슈팅 경험 데이터를 기반으로, 기업 채용 담당자들이 선호하는 STAR 기법(상황-과제-행동-결과)에 맞춰 자동으로 문장을 재구성해 줍니다.</div>
    </div>
    <div class="faq-box">
        <div class="faq-q">Q. 데이터는 안전하게 보관되나요?</div>
        <div class="faq-a">A. 학생들이 작성한 소중한 커리어 기록과 포트폴리오 데이터는 안전하게 관리되며, 언제든지 대시보드에서 확인하고 수정할 수 있습니다.</div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    # --- [섹션 5] 프로페셔널 푸터 ---
    st.markdown(
        """
    <div class="footer-container">
        <div class="footer-top">
            <div class="footer-logo">MyStair</div>
            <div class="footer-links">
                <span>이용약관</span>
                <span>개인정보처리방침</span>
                <span>고객센터</span>
            </div>
        </div>
        <div style="color: #94a3b8; font-size: 15px; margin-top: 10px;">
            © 2026 MyStair Inc. All rights reserved. 마이스터고 학생들의 빛나는 내일을 응원합니다.
        </div>
    </div>
    """,
        unsafe_allow_html=True,
    )
