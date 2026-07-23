import streamlit as st
import os

# 1. 페이지 설정
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide"
)

# 2. 이미지와 완벽히 일치하는 커스텀 CSS 스타일 주입
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

        .block-container {
            padding-top: 1.5rem;
            padding-bottom: 2rem;
            max-width: 1250px;
        }

        /* 로고 디자인 */
        .logo {
            font-size: 32px;
            font-weight: 900;
            background: linear-gradient(90deg, #3bb2b8, #7e57c2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -1px;
            line-height: 1;
        }

        /* 히어로 타이틀 */
        .hero-title {
            font-size: 52px;
            font-weight: 900;
            margin: 10px 0 15px 0;
            line-height: 1.25;
            letter-spacing: -1.5px;
            color: #111;
            text-align: center;
        }
        .hero-subtitle {
            font-size: 18px;
            color: #444;
            margin: 0 0 35px 0;
            font-weight: 500;
            text-align: center;
        }

        /* 벤토 카드 디자인 */
        .custom-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            border: 1px solid #eaeaea;
            height: 100%;
        }
        .card-title {
            margin: 0 0 18px 0;
            font-size: 18px;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #111;
        }
        .tag-light { background: #e0f7fa; color: #00838f; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
        .tag-blue { background: #e3f2fd; color: #1565c0; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
        
        .job-item { display: flex; gap: 15px; align-items: center; margin-top: 15px; }
        .company-logo { width: 42px; height: 42px; border: 1px solid #eee; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; background: #fafafa; color: #111; }
        .job-text h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #111; }
        .job-text p { margin: 0; font-size: 12px; color: #777; }

        .mentor-item { display: flex; gap: 12px; align-items: center; margin-bottom: 15px; }
        .avatar { width: 40px; height: 40px; background: #ffe0b2; border-radius: 50%; font-size: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mentor-text h4 { margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #111; }
        .mentor-text p { margin: 0; font-size: 11px; color: #777; }

        /* 양옆 아이콘 필러 박스 */
        .icon-pillar {
            background: #ffffff;
            border-radius: 20px;
            padding: 20px 12px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            border: 1px solid #eaeaea;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        .icon-pillar div { font-size: 24px; }
    </style>
""", unsafe_allow_html=True)

# 3. 화면 상태 관리 (SPA)
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# ================= PAGE 1: 랜딩 페이지 (이미지와 100% 일치) =================
if st.session_state.page == 'landing':
    
    # 상단 네비게이션바
    h_col1, h_col2 = st.columns([2, 5])
    with h_col1:
        st.markdown("<div class='logo'>mystair</div>", unsafe_allow_html=True)
    with h_col2:
        nav_c1, nav_c2, nav_c3, nav_c4, nav_c5 = st.columns([1.2, 1.2, 1.2, 1.2, 1])
        with nav_c1:
            if st.button("진로 로드맵", key="nav_rd"): navigate_to('dashboard')
        with nav_c2:
            if st.button("취업 정보", key="nav_job"): st.toast("취업 정보 페이지")
        with nav_c3:
            if st.button("커뮤니티", key="nav_comm"): st.toast("커뮤니티 페이지")
        with nav_c4:
            if st.button("마이 페이지", key="nav_my"): st.toast("마이 페이지")
        with nav_c5:
            if st.button("로그인", key="nav_login"): st.toast("로그인 창")

    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # 중앙 3D 계단 이미지
    img_c1, img_c2, img_c3 = st.columns([1, 1.3, 1])
    with img_c2:
        if os.path.exists("main_image.png"):
            st.image("main_image.png", use_container_width=True)
        else:
            st.info("💡 깃허브 폴더에 'main_image.png' 파일을 업로드해주세요.")

    # 타이틀 & 서브타이틀
    st.markdown("<h1 class='hero-title'>세상으로 나아가는<br>너의 첫 번째 계단</h1>", unsafe_allow_html=True)
    st.markdown("<p class='hero-subtitle'>마이스터고 학생들의 꿈을 현실로 만드는 맞춤형 진로 로드맵 파트너</p>", unsafe_allow_html=True)

    # CTA 그라데이션 버튼 디자인 주입
    st.markdown("""
        <style>
            div.stButton > button[kind="primary"] {
                background: linear-gradient(135deg, #a4ded9 0%, #b8aee4 100%) !important;
                color: white !important;
                border: none !important;
                padding: 16px 45px !important;
                font-size: 18px !important;
                font-weight: 700 !important;
                border-radius: 50px !important;
                box-shadow: 0 10px 20px rgba(175, 180, 220, 0.4) !important;
                display: block;
                margin: 0 auto;
            }
            div.stButton > button[kind="primary"]:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 25px rgba(175, 180, 220, 0.6) !important;
            }
        </style>
    """, unsafe_allow_html=True)

    col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
    with col_btn2:
        if st.button("나의 진로 탐색 시작하기", type="primary", use_container_width=True):
            navigate_to('dashboard')

    st.markdown("<div style='height: 40px;'></div>", unsafe_allow_html=True)

    # 하단 벤토 그리드 위젯 (이미지 레이아웃과 정확히 일치하는 5열 배치)
    w1, w2, w3, w4, w5 = st.columns([0.7, 2.6, 0.4, 2.6, 0.7])

    with w1:
        st.markdown("""
            <div class="icon-pillar">
                <div>🚀</div>
                <div>⚙️</div>
            </div>
        """, unsafe_allow_html=True)

    with w2:
        st.markdown("""
            <div class="custom-card">
                <div class="card-title">오늘의 채용 공고 <span style="font-size:20px;">📄</span></div>
                <div class="tag-row" style="display:flex; gap:8px; margin-bottom:15px;">
                    <span class="tag-light">T-1828U</span>
                    <span class="tag-blue">Meister Grad preferred</span>
                </div>
                <div class="job-item">
                    <div class="company-logo">SAMSUNG</div>
                    <div class="job-text">
                        <h4>Full-time Meister Engineer</h4>
                        <p>Meister Grad preferred • celiabis...</p>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    with w3:
        st.markdown("<div style='display: flex; justify-content: center; align-items: center; height: 100%; padding-top: 30px;'>", unsafe_allow_html=True)
        if st.button("⌄", key="scroll_down"):
            navigate_to('dashboard')
        st.markdown("</div>", unsafe_allow_html=True)

    with w4:
        st.markdown("""
            <div class="custom-card">
                <div class="card-title">선배 멘토링 <span style="font-size:20px;">💬</span></div>
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
                        <h4>Kim Sun-bae, Samsung Senior</h4>
                        <p>AI mentor specialization</p>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    with w5:
        st.markdown("""
            <div class="icon-pillar">
                <div>🌐</div>
                <div>🤝</div>
            </div>
        """, unsafe_allow_html=True)

# ================= PAGE 2: 대시보드 화면 =================
elif st.session_state.page == 'dashboard':
    if st.button("⬅️ 홈 화면으로 돌아가기"):
        navigate_to('landing')

    st.title("📊 나의 진로 대시보드 & AI 자소서 스튜디오")
    
    tab1, tab2 = st.tabs(["📝 데일리 과제 & 캘린더", "✨ AI STAR 자소서 변환기"])
    
    with tab1:
        st.subheader("오늘의 미니 체크리스트")
        st.checkbox("오늘 PLC 제어 도면 1개 해석하기 (15분)")
        st.checkbox("오답노트 3개 정리 (20분)")
        st.checkbox("설비보전기사 기출문제 1회 풀이 (30분)")
    
    with tab2:
        st.subheader("AI 기반 STAR 자소서 자동 추출 엔진")
        job = st.text_input("지원 희망 직무", "삼성전자 설비보전직")
        if st.button("🚀 AI 자소서 추출하기", type="primary"):
            st.success(f"'{job}' 맞춤형 STAR 자소서가 성공적으로 추출되었습니다!")
            st.markdown("""
            * **[Situation]**: 실습 중 예기치 않은 회로 단락 문제 발생
            * **[Task]**: 팀장으로서 2시간 내 원인 규명 및 정상 복구 임무
            * **[Action]**: 트러블슈팅 기법 활용 도면 재해석 및 테스터기 구간 탐색
            * **[Result]**: 제한 시간 내 복구 완료 및 과목 A+ 달성
            """)
