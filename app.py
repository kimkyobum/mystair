import base64
import os
import streamlit as st

# 1. 페이지 설정
st.set_page_config(
    page_title="MyStair - 세상으로 나아가는 너의 첫 번째 계단",
    page_icon="📈",
    layout="wide",
)


# 이미지 깨짐 방지 및 안전한 로딩을 위한 함수
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

# 2. 디자인 및 UI 스타일 주입 (코드 노출 방지를 위해 따옴표 구조 최적화)
st.markdown(
    f"""
    <style>
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        
        body, [class*="css"] {{
            font-family: 'Pretendard', -apple-system, sans-serif !important;
        }}

        .stApp {{
            background: linear-gradient(180deg, #fdfdfe 0%, #f4f5fa 100%);
            color: #111;
        }}

        .block-container {{
            padding-top: 1.5rem;
            padding-bottom: 2rem;
            max-width: 1200px;
        }}

        /* 로고 스타일 */
        .logo {{
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(90deg, #3bb2b8, #7e57c2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            cursor: pointer;
            letter-spacing: -0.5px;
        }}

        /* 히어로 섹션 */
        .hero-section {{
            text-align: center;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        
        .hero-graphic {{
            width: 320px;
            height: auto;
            margin-bottom: 25px;
            object-fit: contain;
            background: transparent !important;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
        }}

        .hero-title {{
            font-size: 52px;
            font-weight: 900;
            margin: 0 0 15px 0;
            line-height: 1.25;
            letter-spacing: -1.5px;
            color: #111;
            text-align: center;
        }}
        
        .hero-subtitle {{
            font-size: 18px;
            color: #333;
            margin: 0 0 35px 0;
            font-weight: 500;
            text-align: center;
        }}

        /* 하단 벤토 위젯 영역 */
        .bottom-widgets {{
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-top: 40px;
            padding-bottom: 30px;
        }}
        
        .widget-group {{
            display: flex;
            gap: 15px;
            align-items: flex-end;
        }}
        
        .icon-pillar {{
            background: #fff;
            border-radius: 20px;
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
            height: fit-content;
        }}
        .icon-pillar div {{
            font-size: 24px;
            text-align: center;
        }}

        .info-card {{
            background: #fff;
            border-radius: 20px;
            padding: 25px 30px;
            width: 320px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
        }}
        .info-card h3 {{
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 800;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .tag-row {{
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }}
        .tag-light {{
            background: #e0f7fa;
            color: #00838f;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 700;
        }}
        .tag-blue {{
            background: #e3f2fd;
            color: #1565c0;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 700;
        }}
        
        .job-item {{
            display: flex;
            gap: 15px;
            align-items: center;
        }}
        .company-logo {{
            width: 40px;
            height: 40px;
            border: 1px solid #eee;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            background: #fafafa;
        }}
        .job-text h4 {{
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 800;
        }}
        .job-text p {{
            margin: 0;
            font-size: 12px;
            color: #777;
        }}

        .mentor-item {{
            display: flex;
            gap: 12px;
            align-items: center;
            margin-bottom: 15px;
        }}
        .avatar {{
            width: 36px;
            height: 36px;
            background: #ffe0b2;
            border-radius: 50%;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }}
        .mentor-text h4 {{
            margin: 0 0 2px 0;
            font-size: 14px;
            font-weight: 700;
        }}
        .mentor-text p {{
            margin: 0;
            font-size: 12px;
            color: #777;
        }}

        .scroll-down {{
            width: 40px;
            height: 40px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            color: #888;
            font-weight: bold;
            cursor: pointer;
            border: 1px solid #eaeaea;
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
            background: #fff;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            border: 1px solid #eaeaea;
        }}
        .bento-box h3 {{
            margin-top: 0;
            font-size: 20px;
            font-weight: 800;
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
# 상단 헤더 GNB 구현
# =========================================================
h_cols = st.columns([2.5, 1.2, 1.2, 1.2, 1.2, 1.2])
with h_cols[0]:
  if st.button("mystair", key="logo_btn", use_container_width=True):
    navigate_to("landing")
with h_cols[1]:
  if st.button("진로 로드맵", key="nav_roadmap", use_container_width=True):
    navigate_to("dashboard")
with h_cols[2]:
  if st.button("취업 정보", key="nav_job", use_container_width=True):
    st.toast("취업 정보 페이지입니다.")
with h_cols[3]:
  if st.button("커뮤니티", key="nav_comm", use_container_width=True):
    st.toast("커뮤니티 페이지입니다.")
with h_cols[4]:
  if st.button("마이 페이지", key="nav_my", use_container_width=True):
    st.toast("마이 페이지입니다.")
with h_cols[5]:
  if st.button("로그인", key="login_btn", use_container_width=True):
    st.toast("로그인 창이 열립니다.")

st.markdown(
    "<hr style='margin: 10px 0 30px 0; border: none; border-top: 1px solid"
    " #eaeaea;'>",
    unsafe_allow_html=True,
)

# =========================================================
# [PAGE 1] 랜딩 페이지
# =========================================================
if st.session_state.page == "landing":
  # 히어로 섹션 (이미지 + 타이틀 + 서브타이틀)
  st.markdown(
      f"""
        <div class="landing-container">
            <div class="hero-section">
                <img src="{img_src}" alt="3D 계단 그래픽" class="hero-graphic">
                <h1 class="hero-title">세상으로 나아가는<br>너의 첫 번째 계단</h1>
                <p class="hero-subtitle">마이스터고 학생들의 꿈을 현실로 만드는 맞춤형 진로 로드맵 파트너</p>
            </div>
        </div>
        """,
      unsafe_allow_html=True,
  )

  # 중앙 그라데이션 CTA 버튼
  col_c1, col_c2, col_c3 = st.columns([2, 1.5, 2])
  with col_c2:
    st.markdown(
        """
        <style>
        div.stButton > button[kind="primary"] {
            background: linear-gradient(135deg, #a4ded9 0%, #b8aee4 100%) !important;
            color: #fff !important;
            border: none !important;
            padding: 18px 40px !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            border-radius: 50px !important;
            box-shadow: 0 10px 20px rgba(175, 180, 220, 0.4) !important;
            width: 100%;
        }
        div.stButton > button[kind="primary"]:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(175, 180, 220, 0.6) !important;
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

  # 하단 위젯 영역 (채용공고, 멘토링 카드)
  st.markdown(
      """
        <div style="max-width: 1200px; margin: 0 auto; width: 100%;">
            <div class="bottom-widgets">
                <div class="widget-group">
                    <div class="icon-pillar">
                        <div>🚀</div>
                        <div>⚙️</div>
                    </div>
                    <div class="info-card">
                        <h3>오늘의 채용 공고 <span style="font-size:24px;">📄</span></h3>
                        <div class="tag-row">
                            <span class="tag-light">T-1828U</span>
                            <span class="tag-blue">Meister Grad preferred</span>
                        </div>
                        <div class="job-item">
                            <div class="company-logo">SAMSUNG</div>
                            <div class="job-text">
                                <h4>Full-time Meister Engineer</h4>
                                <p>Meister Grad preferred • celiabis to...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; align-items: flex-end; padding-bottom: 20px;">
                    <div class="scroll-down">⌄</div>
                </div>
                
                <div class="widget-group">
                    <div class="info-card">
                        <h3>선배 멘토링 <span style="font-size:24px;">💬</span></h3>
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
                    <div class="icon-pillar">
                        <div>🌐</div>
                        <div>🤝</div>
                    </div>
                </div>
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
            <h2 style="font-size: 28px; margin: 0;">나의 진로 대시보드</h2>
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
            <div style="background:#f8f9fa; padding:20px; border-radius:12px; margin-bottom: 20px; border: 1px solid #eaeaea;">
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
      with st.spinner("AI가 캘린더 데이터를 시맨틱 분석 중입니다..."):
        import time

        time.sleep(1)
      st.success("자소서 추출 완료!")
      st.info("""
        * **[Situation]** 7월 설비 실습 중 예기치 않은 회로 단락 오류 발생
        * **[Task]** 팀 내 트러블슈팅 담당으로서 2시간 내 원인 분석 및 복구 임무 수행
        * **[Action]** 테스터기를 이용해 단락 구간을 정밀 진단하고 도면을 재검토하여 배선 재배치
        * **[Result]** 제한 시간 내 완전 복구 성공 및 현장 실무 역량 인증 획득
        """)
