import streamlit as st
import os

# 1. 페이지 기본 설정
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide"
)

# 2. 원본 디자인과 100% 일치하는 CSS 스타일 주입
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

        /* Streamlit 기본 여백 제거 및 커스텀 */
        .block-container {
            padding-top: 1rem;
            padding-bottom: 2rem;
            max-width: 1200px;
        }

        /* Hero 섹션 스타일 */
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

        /* 카드 컴포넌트 디자인 */
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

        /* 대시보드 박스 */
        .bento-box {
            background: #fff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
        }
    </style>
""", unsafe_allow_html=True)

# 3. 세션 스테이트를 활용한 페이지 전환 관리 (SPA 구현)
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# =========================================================
# 상단 고정 헤더 (GNB)
# =========================================================
col_logo, col_nav1, col_nav2, col_nav3, col_nav4, col_login = st.columns([2.5, 1.2, 1.2, 1.2, 1.2, 1.2])

with col_logo:
    if st.button("mystair", key="logo_btn", use_container_width=True):
        navigate_to('landing')

with col_nav1:
    if st.button("진로 로드맵", key="nav_roadmap", use_container_width=True):
        navigate_to('dashboard')
with col_nav2:
    if st.button("취업 정보", key="nav_job", use_container_width=True):
        st.toast("취업 정보 페이지 준비 중입니다.")
with col_nav3:
    if st.button("커뮤니티", key="nav_comm", use_container_width=True):
        st.toast("커뮤니티 페이지 준비 중입니다.")
with col_nav4:
    if st.button("마이 페이지", key="nav_my", use_container_width=True):
        st.toast("마이 페이지 준비 중입니다.")

with col_login:
    if st.button("로그인", key="login_btn", use_container_width=True):
        st.toast("로그인 모달이 열립니다.")

st.markdown("<hr style='margin: 10px 0 30px 0; border: none; border-top: 1px solid #eaeaea;'>", unsafe_allow_html=True)


# =========================================================
# [PAGE 1] 랜딩 페이지
# =========================================================
if st.session_state.page == 'landing':
    
    # 히어로 그래픽 및 문구 섹션
    col_img1, col_img2, col_img3 = st.columns([1, 1.5, 1])
    with col_img2:
        if os.path.exists("main_image.png"):
            st.image("main_image.png", use_container_width=True)
        else:
            st.info("💡 'main_image.png' 파일이 깃허브에 없습니다.")

    st.markdown("<h1 class='hero-title'>세상으로 나아가는<br>너의 첫 번째 계단</h1>", unsafe_allow_html=True)
    st.markdown("<p class='hero-subtitle'>마이스터고 학생들의 꿈을 현실로 만드는 맞춤형 진로 로드맵 파트너</p>", unsafe_allow_html=True)

    # 중앙 CTA 버튼
    col_cta1, col_cta2, col_cta3 = st.columns([2, 1.5, 2])
    with col_cta2:
        if st.button("나의 진로 탐색 시작하기", key="main_cta", type="primary", use_container_width=True):
            navigate_to('dashboard')

    st.markdown("<div style='height: 40px;'></div>", unsafe_allow_html=True)

    # 하단 Bento UI 위젯 영역
    w_col1, w_col2, w_col3, w_col4 = st.columns([1.2, 0.4, 2.2, 1.2])

    with w_col1:
        st.markdown("""
            <div style="display: flex; gap: 10px; align-items: flex-end;">
                <div style="background: #fff; border-radius: 20px; padding: 20px 15px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #eaeaea;">
                    <div style="font-size: 24px; text-align: center;">🚀</div>
                    <div style="font-size: 24px; text-align: center;">⚙️</div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    with w_col2:
        # 채용공고 카드
        pass

    with w_col2: # 레이아웃 정돈을 위한 컬럼 분할 재조정
        pass

    # 위젯 배치를 정확한 3분할 그리드로 정렬
    widget_c1, widget_c2, widget_c3 = st.columns(3)

    with widget_c1:
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

    with widget_c2:
        # 중앙 스크롤 다운 버튼 역할의 인터랙션 카드
        st.markdown("<div style='text-align: center; padding-top: 50px;'>", unsafe_allow_html=True)
        if st.button("⌄", key="scroll_down_btn", help="대시보드로 이동"):
            navigate_to('dashboard')
        st.markdown("</div>", unsafe_allow_html=True)

    with widget_c3:
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


# =========================================================
# [PAGE 2] 앱 대시보드 페이지
# =========================================================
elif st.session_state.page == 'dashboard':
    
    if st.button("⬅️ 메인 홈으로 돌아가기", key="back_home"):
        navigate_to('landing')

    st.markdown("<h2 style='font-size: 28px; margin: 20px 0;'>나의 진로 대시보드</h2>", unsafe_allow_html=True)
    
    grid_c1, grid_c2 = st.columns([1, 1.5])

    with grid_c1:
        st.markdown("""
            <div class="bento-box">
                <h3>📝 오늘의 과제</h3>
            </div>
        """, unsafe_allow_html=True)
        # Streamlit 체크박스 컴포넌트로 인터랙션 구현
        st.checkbox("오늘 PLC 도면 해석 완료하기", value=True)
        st.checkbox("기출문제 오답 노트 정리")
        st.checkbox("설비보전 실습 일지 작성")

    with grid_c2:
        st.markdown("""
            <div class="bento-box">
                <h3>📅 경험 캘린더 & AI 자소서</h3>
                <div style="background:#f8f9fa; padding:15px; border-radius:12px; margin: 15px 0; border: 1px solid #eaeaea;">
                    <b>[2026년 7월]</b> 실습 캘린더 데이터 적재 완료
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        if st.button("✨ AI STAR 자소서 자동 추출하기", key="ai_extract", type="primary", use_container_width=True):
            with st.spinner("캘린더 데이터를 시맨틱 분석하여 자소서를 추출 중입니다..."):
                import time
                time.sleep(1)
            st.success("자소서 추출 완료!")
            st.info("""
            * **[Situation]** 7월 설비 실습 중 예기치 않은 회로 단락 오류 발생
            * **[Task]** 팀 내 트러블슈팅 담당으로서 2시간 내 원인 분석 및 복구 임무 수행
            * **[Action]** 테스터기를 이용해 단락 구간을 정밀 진단하고 도면을 재검토하여 배선 재배치
            * **[Result]** 제한 시간 내 완전 복구 성공 및 현장 실무 역량 인증 획득
            """)
