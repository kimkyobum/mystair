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

# 2. 첫 화면 몰입도를 높이는 앰비언트 그라데이션 및 스타일 CSS 주입
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
    50% { transform: translateY(-12px); }
    100% { transform: translateY(0px); }
}

/* 🌟 와이드 화면의 빈 공간을 채워주는 은은한 앰비언트 그라데이션 배경 */
.stApp {
    background: 
        radial-gradient(circle at 10% 12%, rgba(59, 178, 184, 0.1) 0px, transparent 40%),
        radial-gradient(circle at 90% 15%, rgba(126, 87, 194, 0.08) 0px, transparent 40%),
        radial-gradient(circle at 50% 90%, rgba(56, 189, 248, 0.06) 0px, transparent 50%),
        #ffffff !important;
    background-attachment: fixed;
    color: #1e293b;
}

.block-container {
    padding-top: 2rem;
    padding-bottom: 10rem;
    max-width: 1050px !important;
    margin: 0 auto;
    animation: smoothFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 첫 화면 히어로 섹션 */
.hero-section {
    text-align: center;
    padding: 20px 0 20px 0;
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
    margin: 0 0 20px 0;
    line-height: 1.25;
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
    margin: 0 0 35px 0;
    font-weight: 400;
    letter-spacing: -0.5px;
}

/* 3D 이미지 플로팅 컨테이너 */
.hero-graphic-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0 40px 0;
    animation: floatAnimation 4s ease-in-out infinite;
}

.hero-graphic {
    width: 340px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 25px 35px rgba(0, 0, 0, 0.08));
}

/* 롱 스크롤 섹션 */
.scroll-section {
    padding: 140px 0 40px 0;
    animation: smoothFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.section-tag {
    font-size: 14px;
    font-weight: 700;
    color: #3bb2b8;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.section-heading {
    font-size: 40px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 16px;
    letter-spacing: -1px;
    line-height: 1.3;
}

.section-desc {
    font-size: 18px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 50px;
}

/* 모던 카드 스타일 */
.modern-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-radius: 24px;
    padding: 40px 32px;
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
    margin: 0 0 16px 0;
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
# [PAGE 1] 메인 랜딩 페이지 (시작하자마자 히어로 화면 노출)
# =========================================================
if st.session_state.page == "landing":

  # --- [섹션 1] 첫 화면 (히어로) ---
  st.markdown(
      """
<div class="hero-section">
    <div class="hero-badge">✨ 마이스터고 학생을 위한 단 하나의 진로 파트너</div>
    <h1 class="hero-title">세상으로 나아가는<br><span>너의 첫 번째 계단</span></h1>
    <p class="hero-subtitle">실습 기록부터 AI 자소서까지, 꿈을 현실로 만드는 혁신적인 커리어 플랫폼</p>
</div>
""",
      unsafe_allow_html=True,
  )

  # 3D 메인 이미지
  img_col1, img_col2, img_col3 = st.columns([1, 1.4, 1])
  with img_col2:
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

  # CTA 버튼
  st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
  col_c1, col_c2, col_c3 = st.columns([2, 1.6, 2])
  with col_c2:
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
    width: 100%;
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
    if st.button("나의 진로 탐색 시작하기", type="primary", use_container_width=True):
      navigate_to("dashboard")

  # --- [섹션 2] 핵심 기능 소개 (아래로 스크롤 시 등장) ---
  st.markdown(
      """
<div class="scroll-section">
    <div class="section-tag">Core Features</div>
    <div class="section-heading">성장을 기록하고,<br>커리어를 완성하세요</div>
    <div class="section-desc">마이스터고 생활에 꼭 필요한 기능들만 엄선해 담았습니다.</div>
</div>
""",
      unsafe_allow_html=True,
  )

  f_col1, f_col2, f_col3 = st.columns(3, gap="large")
  with f_col1:
    st.markdown(
        '<div class="modern-card"><h3>🎯 맞춤형 진로 로드맵</h3><p>전공과 역량에 딱 맞춘 단계별 성장 경로를 지능적으로 설계하고 관리합니다.</p></div>',
        unsafe_allow_html=True,
    )
  with f_col2:
    st.markdown(
        '<div class="modern-card"><h3>📅 실습 및 경험 기록</h3><p>학교 생활과 현장 실습 활동을 스마트하게 기록하여 나만의 커리어 자산을 구축합니다.</p></div>',
        unsafe_allow_html=True,
    )
  with f_col3:
    st.markdown(
        '<div class="modern-card"><h3>✨ AI STAR 자소서 변환</h3><p>축적된 활동 데이터를 바탕으로 기업 맞춤형 STAR 자기소개서를 1초 만에 완성합니다.</p></div>',
        unsafe_allow_html=True,
    )

  # --- [섹션 3] 만든 사람들 (아래로 스크롤 시 등장) ---
  st.markdown(
      """
<div class="scroll-section" style="padding-top: 160px;">
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
        '<div class="modern-card"><h3>💡 왜 MyStair를 만들었나요?</h3><p>일반 인문계 고등학교와는 다른 마이스터고만의 특수한 실습 경험과 기술 역량이 입사 지원서나 포트폴리오에 온전히 녹아들지 못하는 안타까움에서 출발했습니다. 학생들이 흘린 땀방울이 가장 가치 있는 취업 무기가 되도록 돕고 싶었습니다.</p></div>',
        unsafe_allow_html=True,
    )
  with t_col2:
    st.markdown(
        '<div class="modern-card"><h3>🚀 우리의 목표와 비전</h3><p>단순한 자소서 작성 툴을 넘어, 마이스터고 학생들이 자신만의 확신을 가지고 세상이라는 더 큰 무대로 나아갈 수 있는 가장 믿음직하고 혁신적인 첫 번째 계단이 되는 것입니다.</p></div>',
        unsafe_allow_html=True,
    )

  st.markdown("<div style='height: 80px;'></div>", unsafe_allow_html=True)

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
