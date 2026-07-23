import base64
import os
import time
import streamlit as st

# 1. 페이지 설정 (넓은 레이아웃 고정)
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide",
)

# 2. 토스·스픽·삼성 벤치마킹 스타일 전면 적용 CSS 주입
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

/* 🌟 화면 전체를 아우르는 삼성·토스 스타일의 감각적인 앰비언트 그라데이션 배경 */
.stApp {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 178, 184, 0.12) 0px, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(126, 87, 194, 0.1) 0px, transparent 45%),
        radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
        #ffffff !important;
    background-attachment: fixed;
    color: #1e293b;
}

/* 🌟 와이드 컨테이너 폭 (1200px) 및 여유로운 패딩 */
.block-container {
    padding-top: 2rem;
    padding-bottom: 15rem;
    max-width: 1200px !important;
    margin: 0 auto !important;
    padding-left: 3rem !important;
    padding-right: 3rem !important;
    animation: smoothFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 🌟 스픽 스타일 둥근 알약 네비게이션 바 */
.speak-navbar-container {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 70px;
}

.speak-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    border-radius: 100px;
    padding: 14px 36px;
    width: 100%;
    max-width: 1200px;
}

.nav-left {
    display: flex;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
}

.nav-logo-text {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(90deg, #0f172a, #334155);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 28px;
}

.nav-link {
    font-size: 15px;
    font-weight: 600;
    color: #475569;
}

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
}

/* 🌟 삼성·토스 스타일의 웅장하고 몰입감 있는 히어로 섹션 */
.hero-section-left {
    text-align: left;
    padding: 30px 0;
    animation: smoothFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    color: #475569;
    border-radius: 50px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 24px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.hero-title {
    font-size: 60px;
    font-weight: 800;
    margin: 0 0 24px 0;
    line-height: 1.2;
    letter-spacing: -2px;
    color: #0f172a;
}

.hero-title span {
    background: linear-gradient(90deg, #3bb2b8, #7e57c2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-subtitle {
    font-size: 20px;
    color: #64748b;
    margin: 0 0 40px 0;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: -0.3px;
}

/* 3D 이미지 플로팅 컨테이너 */
.hero-graphic-container {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: floatAnimation 4s ease-in-out infinite;
}

.hero-graphic {
    width: 100%;
    max-width: 480px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.1));
}

/* 🌟 대단원 간의 시원한 여백 (토스 스타일 롱 스크롤) */
.scroll-section {
    padding-top: 280px;
    animation: smoothFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.section-tag {
    font-size: 13px;
    font-weight: 700;
    color: #3bb2b8;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.section-heading {
    font-size: 38px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 12px;
    letter-spacing: -1px;
    line-height: 1.3;
}

.section-desc {
    font-size: 18px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 30px;
}

/* 모던 글래스 카드 스타일 */
.modern-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 36px 32px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.modern-card:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 25px 50px rgba(126, 87, 194, 0.08);
    border-color: rgba(126, 87, 194, 0.3);
}

.modern-card h3 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 14px 0;
    letter-spacing: -0.5px;
}

.modern-card p {
    font-size: 16px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
    word-break: keep-all;
}

/* 대시보드 */
.app-container {
    width: 100%;
    margin: 0 auto;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.bento-box {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 35px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.03);
    border: 1px solid rgba(226, 232, 240, 0.8);
}
</style>
""",
    unsafe_allow_html=True,
)

# 3. 세션 상태 관리
if "page" not in st.session_state:
  st.session_state.page = "landing"


def navigate_to(page_name):
  st.session_state.page = page_name
  st.rerun()


# =========================================================
# 상단 알약 네비게이션 바 (한국어 선택 포함)
# =========================================================
st.markdown(
    """
<div class="speak-navbar-container">
    <div class="speak-navbar">
        <div class="nav-left" onclick="window.location.reload();">
            <span class="nav-logo-text">MyStair</span>
        </div>
        <div class="nav-right">
            <span class="nav-link">서비스 소개</span>
            <span class="nav-link">팀 소개</span>
            <div class="lang-btn-wrapper">
                <span>한국어</span>
                <span style="font-size: 12px;">▼</span>
            </div>
        </div>
    </div>
</div>
""",
    unsafe_allow_html=True,
)

# =========================================================
# [PAGE 1] 메인 랜딩 페이지
# =========================================================
if st.session_state.page == "landing":

  # --- [섹션 1] 첫 화면 (히어로) ---
  hero_col1, hero_col2 = st.columns([1.05, 0.95], gap="large")

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
        padding: 18px 36px !important;
        font-size: 17px !important;
        font-weight: 700 !important;
        border-radius: 50px !important;
        box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15) !important;
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
    if st.button("나의 진로 탐색 시작하기", type="primary"):
      navigate_to("dashboard")

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

  # --- [섹션 4] 만든 사람들 ---
  st.markdown(
      """
<div class="scroll-section">
    <div class="section-tag">About Us</div>
    <div class="section-heading">만든 사람들</div>
    <div class="section-desc">학생들의 빛나는 도전과 가능성을 믿는 팀원들이 함께 만들었습니다.</div>
</div>
""",
      unsafe_allow_html=True,
  )

  t_col1, t_col2 = st.columns(2, gap="large")
  with t_col1:
    st.markdown(
        '<div class="modern-card"><h3>💡 기획 의도</h3><p>마이스터고 학생들이 기술 명장으로 성장하는 과정에서 겪는 진로 고민과 포트폴리오 작성의 어려움을 해소하고자 뜻을 모았습니다. 작은 실습 기록 하나도 놓치지 않는 든든한 파트너가 되고자 합니다.</p></div>',
        unsafe_allow_html=True,
    )
  with t_col2:
    st.markdown(
        '<div class="modern-card"><h3>🚀 우리의 비전</h3><p>단순한 기록용 웹사이트를 넘어, 학생들이 자신만의 확신을 가지고 세상이라는 더 큰 무대로 나아갈 수 있는 가장 믿음직하고 혁신적인 첫 번째 계단이 되는 것입니다.</p></div>',
        unsafe_allow_html=True,
    )

  st.markdown("<div style='height: 100px;'></div>", unsafe_allow_html=True)

# =========================================================
# [PAGE 2] 앱 대시보드 페이지
# =========================================================
elif st.session_state.page == "dashboard":
  if st.button("⬅️ 홈 화면으로 돌아가기", key="back_to_home_dash"):
    navigate_to("landing")

  st.markdown(
      """
<div class="app-container">
    <h2 style="font-size: 30px; font-weight: 800; margin: 0; color: #0f172a;">나의 진로 대시보드</h2>
</div>
""",
      unsafe_allow_html=True,
  )

  col_d1, col_d2 = st.columns([1, 1.5], gap="large")

  with col_d1:
    st.markdown(
        """
<div class="bento-box">
    <h3 style="margin: 0 0 15px 0;">📝 오늘의 과제</h3>
</div>
""",
        unsafe_allow_html=True,
    )
    st.checkbox("오늘 PLC 제어 도면 1개 해석하기 (15분)", value=True)
    st.checkbox("오답노트 3개 정리 (20분)")
    st.checkbox("설비보전기사 기출문제 1회 풀이 (30분)")

  with col_d2:
    st.markdown(
        """
<div class="bento-box">
    <h3 style="margin: 0 0 15px 0;">📅 경험 캘린더 & AI 자소서</h3>
    <div style="background:rgba(248,250,252,0.8); padding:20px; border-radius:16px; margin-bottom: 20px; border: 1px solid #e2e8f0; color: #334155;">
        <b>[2026년 7월]</b> 실습 캘린더 데이터 적재 완료
    </div>
</div>
""",
        unsafe_allow_html=True,
    )

    if st.button("✨ AI STAR 자소서 자동 추출하기", type="primary", use_container_width=True):
      with st.spinner("AI가 캘린더 데이터를 심층 분석 중입니다..."):
        time.sleep(1)
      st.success("자소서 추출 완료!")
      st.info("""
* **[Situation]** 7월 설비 실습 중 예기치 않은 회로 단락 오류 발생
* **[Task]** 팀 내 트러블슈팅 담당으로서 2시간 내 원인 분석 및 복구 임무 수행
* **[Action]** 테스터기를 이용해 단락 구간을 정밀 진단하고 도면을 재검토하여 배선 재배치
* **[Result]** 제한 시간 내 완전 복구 성공 및 현장 실무 역량 인증 획득
""")
