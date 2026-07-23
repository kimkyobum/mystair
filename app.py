import base64
import os
import streamlit as st

# 1. 페이지 설정 (넓은 레이아웃 고정)
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide",
)

# 2. 토스 스타일 라이트톤 디자인 및 애니메이션 CSS 주입
st.markdown(
    """
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body, [class*="css"] {
            font-family: 'Pretendard', -apple-system, sans-serif !important;
        }

        /* 페이드 인 애니메이션 */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(12px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* 3D 스튜디오 플로팅 애니메이션 */
        @keyframes studioFloat {
            0% {
                transform: translateY(0px) rotateX(0deg);
            }
            50% {
                transform: translateY(-8px) rotateX(2deg);
            }
            100% {
                transform: translateY(0px) rotateX(0deg);
            }
        }

        .stApp {
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
            color: #1e293b;
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .block-container {
            padding-top: 1.5rem;
            padding-bottom: 5rem;
            max-width: 100% !important;
            padding-left: 6rem !important;
            padding-right: 6rem !important;
        }

        /* 상단 헤더 커스텀 스타일 */
        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 30px;
        }

        /* 히어로 섹션 */
        .hero-section {
            text-align: center;
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 18px;
            background: linear-gradient(135deg, rgba(59, 178, 184, 0.1), rgba(126, 87, 194, 0.1));
            color: #7e57c2;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 24px;
            border: 1px solid rgba(126, 87, 194, 0.2);
            box-shadow: 0 4px 15px rgba(126, 87, 194, 0.05);
        }

        .studio-podium-wrapper {
            position: relative;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 40px 60px;
            background: radial-gradient(circle at 50% 20%, rgba(59, 178, 184, 0.15) 0%, rgba(126, 87, 194, 0.06) 50%, rgba(255, 255, 255, 0.9) 100%);
            border-radius: 48px;
            box-shadow: 0 35px 70px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1);
            border: 1px solid rgba(226, 232, 240, 0.8);
            backdrop-filter: blur(16px);
            margin-bottom: 35px;
            animation: studioFloat 5s ease-in-out infinite;
            perspective: 1000px;
        }

        .studio-podium-wrapper::after {
            content: '';
            position: absolute;
            bottom: -25px;
            left: 15%;
            width: 70%;
            height: 30px;
            background: radial-gradient(ellipse at center, rgba(62, 178, 184, 0.3) 0%, rgba(0, 0, 0, 0) 75%);
            z-index: -1;
            filter: blur(10px);
        }
        
        .hero-graphic {
            width: 340px;
            height: auto;
            object-fit: contain;
            background: transparent !important;
            border-radius: 20px;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1));
            transition: transform 0.4s ease;
        }
        
        .studio-podium-wrapper:hover .hero-graphic {
            transform: scale(1.03);
        }

        .hero-title {
            font-size: 62px;
            font-weight: 800;
            margin: 0 0 20px 0;
            line-height: 1.18;
            letter-spacing: -2.5px;
            color: #0f172a;
            text-align: center;
        }

        .hero-title span {
            background: linear-gradient(90deg, #3bb2b8, #7e57c2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero-subtitle {
            font-size: 20px;
            color: #64748b;
            margin: 0 0 45px 0;
            font-weight: 400;
            text-align: center;
            letter-spacing: -0.5px;
        }

        /* 프리미엄 기능 카드 섹션 */
        .feature-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 60px;
            width: 100%;
            animation: fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feature-card {
            background: #ffffff;
            border-radius: 28px;
            padding: 45px 36px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
            border: 1px solid #e2e8f0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: left;
            cursor: pointer;
        }

        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px rgba(126, 87, 194, 0.1);
            border-color: #7e57c2;
        }

        .feature-icon {
            font-size: 32px;
            margin-bottom: 24px;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            width: 68px;
            height: 68px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            transition: transform 0.3s ease, background 0.3s ease;
        }

        .feature-card:hover .feature-icon {
            transform: scale(1.1) rotate(5deg);
            background: linear-gradient(135deg, #e0f7fa, #ede7f6);
            border-color: #b3e5fc;
        }

        .feature-card h3 {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 14px 0;
            letter-spacing: -0.5px;
        }

        .feature-card p {
            font-size: 16px;
            color: #64748b;
            margin: 0;
            line-height: 1.65;
        }

        /* 대시보드 및 소개 페이지 스타일 */
        .app-container {
            width: 100%;
            margin: 0 auto;
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 30px;
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .bento-box {
            background: #ffffff;
            border-radius: 24px;
            padding: 35px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        .bento-box:hover {
            box-shadow: 0 15px 35px rgba(0,0,0,0.06);
        }
        .bento-box h3 {
            margin-top: 0;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# 3. 세션 상태 관리 (SPA 화면 전환)
if "page" not in st.session_state:
  st.session_state.page = "landing"


def navigate_to(page_name):
  st.session_state.page = page_name
  st.rerun()


# =========================================================
# 상단 헤더 구현 (MyStair 로고 + 서비스 소개 버튼 + 로그인 버튼)
# =========================================================
header_col1, header_col2, header_col3, header_col4 = st.columns(
    [2.5, 1.2, 6.3, 1.2]
)

with header_col1:
  if st.button("📈 MyStair", key="logo_text_btn", use_container_width=False):
    navigate_to("landing")
  st.markdown(
      """
        <style>
        div[data-testid="column"] button[key="logo_text_btn"] {
            background: transparent !important;
            border: none !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            background: linear-gradient(90deg, #3bb2b8, #7e57c2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            padding: 0 !important;
            letter-spacing: -1px;
            box-shadow: none !important;
        }
        </style>
        """,
      unsafe_allow_html=True,
  )

with header_col2:
  # 서비스 소개 버튼 스타일
  st.markdown(
      """
        <style>
        div[data-testid="column"] button[key="intro_nav_btn"] {
            background: transparent !important;
            color: #475569 !important;
            border: none !important;
            padding: 8px 12px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            box-shadow: none !important;
            transition: color 0.2s ease !important;
        }
        div[data-testid="column"] button[key="intro_nav_btn"]:hover {
            color: #3bb2b8 !important;
        }
        </style>
        """,
      unsafe_allow_html=True,
  )
  if st.button("서비스 소개", key="intro_nav_btn", use_container_width=True):
    navigate_to("intro")

with header_col4:
  # 로그인 버튼 스타일
  st.markdown(
      """
        <style>
        div[data-testid="column"] button[key="login_custom_btn"] {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            padding: 8px 20px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            border-radius: 30px !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        div[data-testid="column"] button[key="login_custom_btn"]:hover {
            background: #0f172a !important;
            color: #ffffff !important;
            border-color: #0f172a !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(15, 23, 42, 0.15);
        }
        </style>
        """,
      unsafe_allow_html=True,
  )
  if st.button("로그인", key="login_custom_btn", use_container_width=True):
    st.toast("로그인 창이 열립니다.")

st.markdown(
    "<hr style='margin: 5px 0 30px 0; border: none; border-top: 1px solid"
    " #e2e8f0;'>",
    unsafe_allow_html=True,
)

# =========================================================
# [PAGE 1] 랜딩 페이지
# =========================================================
if st.session_state.page == "landing":
  # 히어로 섹션
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

  # 3D 스튜디오 포디움 이미지
  img_col1, img_col2, img_col3 = st.columns([1, 1.4, 1])
  with img_col2:
    if os.path.exists("main_image.png"):
      with open("main_image.png", "rb") as f:
        encoded_img = base64.b64encode(f.read()).decode("utf-8")

      st.markdown(
          f"""
            <div style="text-align: center; width: 100%;">
                <div class="studio-podium-wrapper">
                    <img src="data:image/png;base64,{encoded_img}" class="hero-graphic" alt="3D 렌더링 계단">
                </div>
            </div>
            """,
          unsafe_allow_html=True,
      )
    else:
      st.warning("⚠️ 'main_image.png' 파일이 없습니다.")

  # 중앙 CTA 버튼
  col_c1, col_c2, col_c3 = st.columns([2, 1.5, 2])
  with col_c2:
    st.markdown(
        """
        <style>
        div.stButton > button[kind="primary"] {
            background: linear-gradient(135deg, #3bb2b8 0%, #7e57c2 100%) !important;
            color: #ffffff !important;
            border: none !important;
            padding: 18px 40px !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            border-radius: 50px !important;
            box-shadow: 0 12px 30px rgba(62, 178, 184, 0.35) !important;
            width: 100%;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        div.stButton > button[kind="primary"]:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(126, 87, 194, 0.5) !important;
            filter: brightness(1.05);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
    if st.button(
        "나의 진로 탐색 시작하기", type="primary", use_container_width=True
    ):
      navigate_to("dashboard")

  st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

  # 하단 기능 소개 카드 3가지
  st.markdown(
      """
        <div class="feature-container">
            <div class="feature-card">
                <div class="feature-icon">🎯</div>
                <h3>맞춤형 진로 로드맵</h3>
                <p>마이스터고 전공과 역량에 딱 맞춘 단계별 성장 경로를 지능적으로 설계하고 관리합니다.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📅</div>
                <h3>실습 및 경험 기록</h3>
                <p>학교 생활과 현장 실습 활동을 스마트하게 기록하여 나만의 커리어 자산을 구축합니다.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>AI STAR 자소서 변환</h3>
                <p>축적된 활동 데이터를 바탕으로 기업 맞춤형 STAR 자기소개서를 1초 만에 완성합니다.</p>
            </div>
        </div>
        """,
      unsafe_allow_html=True,
  )

# =========================================================
# [PAGE 2] 서비스 소개 페이지 (새로 추가됨)
# =========================================================
elif st.session_state.page == "intro":
  if st.button("⬅️ 홈으로 돌아가기"):
    navigate_to("landing")

  st.markdown(
      """
        <div class="app-container">
            <h2 style="font-size: 36px; font-weight: 800; margin: 0 0 10px 0; color: #0f172a;">서비스 소개</h2>
            <p style="font-size: 18px; color: #64748b; margin-bottom: 40px;">마이스터고 학생들의 더 나은 내일을 위한 똑똑한 커리어 파트너, MyStair를 소개합니다.</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px;">
                <div class="bento-box">
                    <h3>💡 왜 MyStair인가요?</h3>
                    <p style="color: #64748b; line-height: 1.6; margin-top: 15px;">
                        일반 인문계 고등학교와는 다른, 마이스터고만의 특수한 현장 실습과 기술 중심 커리큘럼. 
                        MyStair는 여러분이 흘린 실습의 땀방울을 체계적인 데이터로 탈바꿈시켜 최고의 취업 무기로 만들어 줍니다.
                    </p>
                </div>
                <div class="bento-box">
                    <h3>🚀 핵심 가치</h3>
                    <p style="color: #64748b; line-height: 1.6; margin-top: 15px;">
                        복잡하고 어려운 자소서 작성과 진로 고민을 AI 기술로 해결합니다. 
                        작은 실습 기록 하나도 놓치지 않고 기업이 원하는 STAR(Situation, Task, Action, Result) 구조로 자동 변환해 드립니다.
                    </p>
                </div>
            </div>
        </div>
        """,
      unsafe_allow_html=True,
  )

# =========================================================
# [PAGE 3] 앱 대시보드 페이지
# =========================================================
elif st.session_state.page == "dashboard":
  if st.button("⬅️ 홈 화면으로 돌아가기"):
    navigate_to("landing")

  st.markdown(
      """
        <div class="app-container">
            <h2 style="font-size: 32px; margin: 0; color: #0f172a;">나의 진로 대시보드</h2>
        </div>
        """,
      unsafe_allow_html=True,
  )

  col_d1, col_d2 = st.columns([1, 1.5])

  with col_d1:
    st.markdown(
        """
        <div class="bento-box">
            <h3>📝 오늘의 과제</h3>
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
            <h3>📅 경험 캘린더 & AI 자소서</h3>
            <div style="background:#f8fafc; padding:20px; border-radius:16px; margin-bottom: 20px; border: 1px solid #e2e8f0; color: #334155;">
                <b>[2026년 7월]</b> 실습 캘린더 데이터 적재 완료
            </div>
        </div>
        """,
      unsafe_allow_html=True,
    )

    if st.button(
        "✨ AI STAR 자소서 자동 추출하기",
        type="primary",
        use_container_width=True,
    ):
      with st.spinner("AI가 캘린더 데이터를 심층 분석 중입니다..."):
        import time

        time.sleep(1)
      st.success("자소서 추출 완료!")
      st.info("""
        * **[Situation]** 7월 설비 실습 중 예기치 않은 회로 단락 오류 발생
        * **[Task]** 팀 내 트러블슈팅 담당으로서 2시간 내 원인 분석 및 복구 임무 수행
        * **[Action]** 테스터기를 이용해 단락 구간을 정밀 진단하고 도면을 재검토하여 배선 재배치
        * **[Result]** 제한 시간 내 완전 복구 성공 및 현장 실무 역량 인증 획득
        """)
