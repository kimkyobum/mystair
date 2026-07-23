import streamlit as st
import os

# 1. 페이지 설정 (넓은 레이아웃 및 탭 타이틀)
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide"
)

# 2. 원본 HTML/CSS 디자인을 그대로 녹여낸 스타일 주입
st.markdown("""
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body, [class*="css"] {
            font-family: 'Pretendard', -apple-system, sans-serif !important;
        }

        .stApp {
            background: linear-gradient(180deg, #fdfdfe 0%, #f4f5fa 100%);
            color: #111;
        }

        /* 여백 최소화 및 중앙 맞춤 */
        .block-container {
            padding-top: 1.5rem;
            padding-bottom: 2rem;
            max-width: 1200px;
        }

        /* 히어로 섹션 */
        .hero-title {
            font-size: 52px;
            font-weight: 900;
            margin: 0 0 15px 0;
            line-height: 1.25;
            letter-spacing: -1.5px;
            color: #111;
            text-align: center;
        }
        .hero-subtitle {
            font-size: 18px;
            color: #333;
            margin: 0 0 35px 0;
            font-weight: 500;
            text-align: center;
        }

        /* 카드 UI 디자인 */
        .info-card {
            background: #fff;
            border-radius: 20px;
            padding: 25px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
            height: 100%;
        }
        .info-card h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .tag-row { display: flex; gap: 8px; margin-bottom: 20px; }
        .tag-light { background: #e0f7fa; color: #00838f; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
        .tag-blue { background: #e3f2fd; color: #1565c0; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
        
        .job-item { display: flex; gap: 15px; align-items: center; }
        .company-logo { width: 40px; height: 40px; border: 1px solid #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; background: #fafafa; }
        .job-text h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 800; }
        .job-text p { margin: 0; font-size: 12px; color: #777; }

        .mentor-item { display: flex; gap: 12px; align-items: center; margin-bottom: 15px; }
        .avatar { width: 36px; height: 36px; background: #ffe0b2; border-radius: 50%; font-size: 18px; display: flex; align-items: center; justify-content: center; }
        .mentor-text h4 { margin: 0 0 2px 0; font-size: 14px; font-weight: 700; }
        .mentor-text p { margin: 0; font-size: 12px; color: #777; }

        .icon-pillar {
            background: #fff; border-radius: 20px; padding: 20px 15px; 
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #eaeaea;
            align-items: center; justify-content: center; height: 100%;
        }

        .bento-box {
            background: #fff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
        }
    </style>
""", unsafe_allow_html=True)

# 3. 세션 상태를 통한 화면 전환 관리 (SPA)
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# =========================================================
# 상단 헤더 (GNB) 구현
# =========================================================
h_col1, h_col2, h_col3, h_col4, h_col5, h_col6 = st.columns([2.5, 1.2, 1.2, 1.2, 1.2, 1.2])

with h_col1:
    if st.button("mystair", key="logo_click", use_container_width=True):
        navigate_to('landing')

with h_col2:
    if st.button("진로 로드맵", key="nav_rd", use_container_width=True):
        navigate_to('dashboard')
with h_col3:
    if st.button("취업 정보", key="nav_job", use_container_width=True):
        st.toast("취업 정보 페이지입니다.")
with h_col4:
    if st.button("커뮤니티", key="nav_com", use_container_width=True):
        st.toast("커뮤니티 페이지입니다.")
with h_col5:
    if st.button("마이 페이지", key="nav_my", use_container_width=True):
        st.toast("마이 페이지입니다.")
with h_col6:
    if st.button("로그인", key="login_btn", use_container_width=True):
        st.toast("로그인 창이 열립니다.")

st.markdown("<hr style='margin: 10px 0 30px 0; border: none; border-top: 1px solid #eaeaea;'>", unsafe_allow_html=True)


# =========================================================
# [PAGE 1] 랜딩 페이지
# =========================================================
if st.session_state.page == 'landing':
    
    # 히어로 이미지 및 타이틀 섹션
    img_c1, img_c2, img_c3 = st.columns([1, 1.5, 1])
    with img_c2:
        if os.path.exists("main_image.png"):
            st.image("main_image.png", use_container_width=True)
        else:
            st.info("💡 깃허브 폴더에 'main_image.png' 파일이 없습니다.")

    st.markdown("<h1 class='hero-title'>세상으로 나아가는<br>너의 첫 번째 계단</h1>", unsafe_allow_html=True)
    st.markdown("<p class='hero-subtitle'>마이스터고 학생들의 꿈을 현실로 만드는 맞춤형 진로 로드맵 파트너</p>", unsafe_allow_html=True)

    # CTA 버튼
    cta_1, cta_2, cta_3 = st.columns([2, 1.5, 2])
    with cta_2:
        if st.button("나의 진로 탐색 시작하기", type="primary", use_container_width=True):
            navigate_to('dashboard')

    st.markdown("<div style='height: 50px;'></div>", unsafe_allow_html=True)

    # 하단 위젯 레이아웃 (원본 HTML 구조와 완벽 동기화)
    w_col1, w_col2, w_col3, w_col4, w_col5 = st.columns([0.8, 2.2, 0.5, 2.2, 0.8])

    with w_col1:
        st.markdown("""
            <div class="icon-pillar">
                <div>🚀</div>
                <div>⚙️</div>
            </div>
        """, unsafe_allow_html=True)

    with w_col2:
        st.markdown("""
            <div class="info-card">
                <h3>오늘의 채용 공고 <span style="font-size:20px;">📄</span></h3>
                <div class="tag-row">
                    <span class="tag-light">T-1828U</span>
                    <span class="tag-blue">Meister Grad preferred</span>
                </div>
                <div class="job-item">
                    <div class="company-logo">SAMSUNG</div>
                    <div class="job-text">
                        <h4>Full-time Meister Engineer</h4>
                        <p>Meister Grad preferred...</p>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    with w_col3:
        # 스크롤 다운 상징 버튼
        st.markdown("<div style='display: flex; justify-content: center; align-items: center; height: 100%;'>", unsafe_allow_html=True)
        if st.button("⌄", key="scroll_btn", help="대시보드로 이동"):
            navigate_to('dashboard')
        st.markdown("</div>", unsafe_allow_html=True)

    with w_col4:
        st.markdown("""
            <div class="info-card">
                <h3>선배 멘토링 <span style="font-size:20px;">💬</span></h3>
                <div class="mentor-item">
                    <div class="avatar">👨‍💼</div>
                    <div class="mentor-text">
                        <h4>Kim Sun-bae, Samsung Senior</h4>
                        <p>선배 mentor specialization</p>
                    </div>
                </div>
                <div class="mentor-item" style="margin-bottom:0;">
                    <div class="avatar">👨‍💻</div>
                    <div class="mentor-text">
                        <h4>Kim Sun-bae, AI Engineer</h4>
                        <p>AI mentor specialization</p>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    with w_col5:
        st.markdown("""
            <div class="icon-pillar">
                <div>🌐</div>
                <div>🤝</div>
            </div>
        """, unsafe_allow_html=True)


# =========================================================
# [PAGE 2] 앱 대시보드 페이지
# =========================================================
elif st.session_state.page == 'dashboard':
    
    if st.button("⬅️ 홈 화면으로 돌아가기"):
        navigate_to('landing')

    st.markdown("<h2 style='font-size: 28px; margin: 20px 0;'>나의 진로 대시보드</h2>", unsafe_allow_html=True)
    
    dash_c1, dash_c2 = st.columns([1, 1.5])

    with dash_c1:
        st.markdown("""
            <div class="bento-box">
                <h3>📝 오늘의 과제</h3>
            </div>
        """, unsafe_allow_html=True)
        st.checkbox("오늘 PLC 도면 해석 완료하기", value=True)
        st.checkbox("기출문제 오답 노트 정리")

    with dash_c2:
        st.markdown("""
            <div class="bento-box">
                <h3>📅 경험 캘린더 & AI 자소서</h3>
                <div style="background:#f8f9fa; padding:15px; border-radius:12px; margin: 15px 0; border: 1px solid #eaeaea;">
                    <b>[2026년 7월]</b> 실습 캘린더 데이터 적재 완료
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        if st.button("✨ AI STAR 자소서 자동 추출하기", type="primary", use_container_width=True):
            with st.spinner("AI가 캘린더 데이터를 분석 중입니다..."):
                import time
                time.sleep(1)
            st.success("자소서 추출 완료!")
            st.info("""
            * **[Situation]** 7월 설비 실습 중 예기치 않은 회로 단락 오류 발생
            * **[Task]** 트러블슈팅 담당으로서 2시간 내 원인 분석 및 복구 임무 수행
            * **[Action]** 테스터기를 이용해 단락 구간을 정밀 진단하고 도면을 재검토하여 배선 재배치
            * **[Result]** 제한 시간 내 완전 복구 성공 및 실무 역량 인증 획득
            """)
