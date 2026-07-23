import base64
import os
import streamlit as st

# 1. 페이지 설정
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="🚀",
    layout="wide",
)


# 이미지 깨짐 방지 및 안전한 로딩 함수
def get_img_base64(file_path):
  if os.path.exists(file_path):
    with open(file_path, "rb") as f:
      return base64.b64encode(f.read()).decode("utf-8")
  return ""


img_b64 = get_img_base64("main_image.png")
img_src = (
    f"data:image/png;base64,{img_b64}"
    if img_b64
    else "https://via.placeholder.com/320x200/f4f5fa/a7e0e2?text=Image+Not+Found"
)

# 2. 토스 스타일의 미래지향적 UI/UX CSS 주입
st.markdown(
    f"""
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body, [class*="css"] {{
            font-family: 'Pretendard', -apple-system, sans-serif !important;
        }}

        /* 미래지향적 딥토스 배경 그라데이션 및 홀로그램 무드 */
        .stApp {{
            background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0f172a 50%, #090d16 100%);
            color: #f8fafc;
        }}

        .block-container {{
            padding-top: 1.5rem;
            padding-bottom: 4rem;
            max-width: 1200px;
        }}

        /* 히어로 섹션 */
        .hero-section {{
            text-align: center;
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        
        /* 3D 계단 이미지 홀로그램 글래스 효과 */
        .hero-graphic {{
            width: 340px;
            height: auto;
            margin-bottom: 30px;
            object-fit: contain;
            background: rgba(255, 255, 255, 0.03) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.25);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }}
        .hero-graphic:hover {{
            transform: translateY(-8px) scale(1.02);
        }}

        /* 타이틀 타이포그래피 (토스 특유의 굵고 시원한 폰트) */
        .hero-title {{
            font-size: 56px;
            font-weight: 800;
            margin: 0 0 20px 0;
            line-height: 1.2;
            letter-spacing: -2px;
            color: #ffffff;
            text-align: center;
        }}
        
        .hero-subtitle {{
            font-size: 19px;
            color: #94a3b8;
            margin: 0 0 45px 0;
            font-weight: 400;
            text-align: center;
            letter-spacing: -0.5px;
        }}

        /* 미래형 글래스모피즘 기능 카드 섹션 */
        .feature-container {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 70px;
            padding: 0 10px;
        }}

        .feature-card {{
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 35px 28px;
            box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.06);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            text-align: left;
            position: relative;
            overflow: hidden;
        }}

        .feature-card::before {{
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.5), transparent);
            opacity: 0;
            transition: opacity 0.4s ease;
        }}

        .feature-card:hover {{
            transform: translateY(-6px);
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(129, 140, 248, 0.3);
            box-shadow: 0 20px 40px -15px rgba(129, 140, 248, 0.2);
        }}

        .feature-card:hover::before {{
            opacity: 1;
        }}

        .feature-icon {{
            font-size: 28px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }}

        .feature-card h3 {{
            font-size: 18px;
            font-weight: 700;
            color: #f1f5f9;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
        }}

        .feature-card p {{
            font-size: 14px;
            color: #94a3b8;
            margin: 0;
            line-height: 1.6;
        }}

        /* 대시보드 화면 스타일 */
        .app-container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 0;
            width: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }}
        .bento-box {{
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }}
        .bento-box h3 {{
            margin-top: 0;
            font-size: 20px;
            font-weight: 700;
            color: #f8fafc;
        }}
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
# 상단 헤더 (토스 스타일의 심플한 로고 및 미래지향적 로그인 버튼)
# =========================================================
header_col1, header_col2 = st.columns([6, 1])

with header_col1:
  if st.button("mystair", key="logo_text_btn", use_container_width=False):
    navigate_to("landing")
  st.markdown(
      """
        <style>
        div[data-testid="column"] button[key="logo_text_btn"] {
            background: transparent !important;
            border: none !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            background: linear-gradient(90deg, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            padding: 0 !important;
            letter-spacing: -1px;
        }
        </style>
        """,
      unsafe_allow_html=True,
  )

with header_col2:
  st.markdown(
      """
        <style>
        div[data-testid="column"] button[key="login_custom_btn"] {
            background: rgba(255, 255, 255, 0.06) !important;
            color: #f1f5f9 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 8px 20px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            border-radius: 30px !important;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease !important;
        }
        div[data-testid="column"] button[key="login_custom_btn"]:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(129, 140, 248, 0.5) !important;
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(129, 140, 248, 0.3);
        }
        </style>
        """,
      unsafe_allow_html=True,
  )
  if st.button("로그인", key="login_custom_btn", use_container_width=True):
    st.toast("로그인 창이 열립니다.")

st.markdown(
    "<hr style='margin: 5px 0 30px 0; border: none; border-top: 1px solid"
    " rgba(255, 255, 255, 0.06);'>",
    unsafe_allow_html=True,
)

# =========================================================
# [PAGE 1] 랜딩 페이지
# =========================================================
if st.session_state.page == "landing":
  # 히어로 섹션
  st.markdown(
      f"""
        <div class="hero-section">
            <img src="{img_src}" alt="3D 계단 그래픽" class="hero-graphic">
            <h1 class="hero-title">세상으로 나아가는<br>너의 첫 번째 계단</h1>
            <p class="hero-subtitle">마이스터고 학생들의 꿈을 현실로 만드는 혁신적인 진로 로드맵 파트너</p>
        </div>
        """,
      unsafe_allow_html=True,
  )

  # 중앙 네온 그라데이션 CTA 버튼 (토스 피니시 스타일)
  col_c1, col_c2, col_c3 = st.columns([2, 1.6, 2])
  with col_c2:
    st.markdown(
        """
        <style>
        div.stButton > button[kind="primary"] {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
            color: #ffffff !important;
            border: none !important;
            padding: 18px 40px !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            border-radius: 50px !important;
            box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.5) !important;
            width: 100%;
            transition: all 0.3s ease !important;
        }
        div.stButton > button[kind="primary"]:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px -5px rgba(168, 85, 247, 0.7) !important;
            filter: brightness(1.1);
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
    if st.button(
        "나의 진로 탐색 시작하기", type="primary", use_container_width=True
    ):
      navigate_to("dashboard")

  st.markdown("<div style='height: 40px;'></div>", unsafe_allow_html=True)

  # 하단 미래형 기능 소개 카드 3가지
  st.markdown(
      """
        <div class="feature-container">
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>맞춤형 진로 로드맵</h3>
                <p>마이스터고 전공과 역량에 딱 맞춘 단계별 성장 경로를 지능적으로 설계합니다.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔮</div>
                <h3>실습 및 경험 기록</h3>
                <p>학교 생활과 실습 활동을 스마트하게 기록하여 나만의 커리어 자산을 구축합니다.</p>
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
# [PAGE 2] 앱 대시보드 페이지
# =========================================================
elif st.session_state.page == "dashboard":
  if st.button("⬅️ 홈 화면으로 돌아가기"):
    navigate_to("landing")

  st.markdown(
      """
        <div class="app-container">
            <h2 style="font-size: 28px; margin: 0; color: #f8fafc;">나의 진로 대시보드</h2>
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
    st.checkbox("오늘 PLC 도면 해석 완료하기", value=True)
    st.checkbox("기출문제 오답 노트 정리")
    st.checkbox("설비보전 실습 일지 작성")

  with col_d2:
    st.markdown(
        """
        <div class="bento-box">
            <h3>📅 경험 캘린더 & AI 자소서</h3>
            <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); color: #cbd5e1;">
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
