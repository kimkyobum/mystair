import base64
import os
import time
import streamlit as st

# 1. 페이지 설정 (넓은 레이아웃 고정)
st.set_page_config(
    page_title="MySpeak - AI 영어 스피킹 코치", page_icon="🗣️", layout="wide"
)

# 2. 스픽 스타일의 모던하고 직관적인 디자인 CSS 주입
st.markdown(
    """
<style>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css');

body, [class*="css"] {
    font-family: 'SUIT', -apple-system, sans-serif !important;
}

@keyframes smoothFadeIn {
    0% { opacity: 0; transform: translateY(15px); }
    100% { opacity: 1; transform: translateY(0); }
}

@keyframes pulseGlow {
    0% { box-shadow: 0 0 0 0 rgba(59, 178, 184, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(59, 178, 184, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 178, 184, 0); }
}

/* 전체 배경 및 폰트 설정 */
.stApp {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 178, 184, 0.06) 0px, transparent 40%),
        radial-gradient(circle at 90% 90%, rgba(126, 87, 194, 0.05) 0px, transparent 40%),
        #ffffff !important;
    color: #0f172a;
}

.block-container {
    padding-top: 2rem;
    padding-bottom: 8rem;
    max-width: 900px !important;
    margin: 0 auto;
    animation: smoothFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 상단 네비게이션 */
.speak-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.speak-logo {
    font-size: 24px;
    font-weight: 800;
    background: linear-gradient(90deg, #3bb2b8, #7e57c2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
}

/* 레슨 카드 */
.lesson-card {
    background: #f8fafc;
    border-radius: 24px;
    padding: 30px;
    border: 1px solid #e2e8f0;
    margin-bottom: 25px;
    transition: all 0.3s ease;
}

.lesson-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.lesson-badge {
    display: inline-block;
    padding: 5px 12px;
    background: #e0f2fe;
    color: #0369a1;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 12px;
}

/* 대화형 프롬프트 박스 */
.speak-chat-box {
    background: #0f172a;
    color: #ffffff;
    border-radius: 28px;
    padding: 36px;
    margin-bottom: 30px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.ai-speech-bubble {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 20px 24px;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 마이크 버튼 스타일링 커스텀 */
.mic-btn-container {
    display: flex;
    justify-content: center;
    margin: 30px 0;
}
</style>
""",
    unsafe_allow_html=True,
)

# 3. 세션 상태 관리 (스픽 앱 화면 네비게이션)
if "speak_page" not in st.session_state:
  st.session_state.speak_page = "home"
if "selected_lesson" not in st.session_state:
  st.session_state.selected_lesson = None


def go_to(page, lesson=None):
  st.session_state.speak_page = page
  if lesson:
    st.session_state.selected_lesson = lesson
  st.rerun()


# =========================================================
# [PAGE 1] 스픽 메인 홈 화면 (과제 및 코스 선택)
# =========================================================
if st.session_state.speak_page == "home":

  # 상단 로고 및 프로필 영역
  col_l, col_r = st.columns([8, 2])
  with col_l:
    st.markdown(
        '<div class="speak-logo">⚡ MySpeak</div>', unsafe_allow_html=True
    )
  with col_r:
    st.markdown(
        '<div style="text-align: right; font-weight: 700; color: #64748b; padding-top: 6px;">🔥 5일 연속 학습</div>',
        unsafe_allow_html=True,
    )

  st.markdown(
      """
    <div style="margin: 30px 0 20px 0;">
        <h1 style="font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1px;">오늘의 스피킹 미션</h1>
        <p style="font-size: 17px; color: #64748b; margin: 0;">원어민이 매일 쓰는 진짜 영어 표현을 입으로 소리 내어 익혀보세요.</p>
    </div>
    """,
      unsafe_allow_html=True,
  )

  # 코스 선택 카드들
  lessons = [
      {
          "title": "카페에서 자연스럽게 주문하기",
          "desc": "원하지 않는 옵션을 빼고 커스텀 음료를 주문하는 필수 패턴",
          "level": "초급반",
          "tag": "☕ 일상 회화",
      },
      {
          "title": "외국인 동료와 스몰토크 나누기",
          "desc": "어색한 공백을 깨고 날씨, 주말 계획으로 대화를 이어가는 법",
          "level": "중급반",
          "tag": "💼 비즈니스",
      },
      {
          "title": "공항 입국 심사 완벽 대비",
          "desc": "까다로운 질문에도 당황하지 않고 3초 안에 답변하는 실전 훈련",
          "level": "실전반",
          "tag": "✈️ 여행 영어",
      },
  ]

  for idx, lesson in enumerate(lessons):
    st.markdown(f"""<div class="lesson-card">""", unsafe_allow_html=True)
    st.markdown(
        f'<span class="lesson-badge">{lesson["tag"]} • {lesson["level"]}</span>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f'<h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">{lesson["title"]}</h3>',
        unsafe_allow_html=True,
    )
    st.markdown(
        f'<p style="font-size: 15px; color: #64748b; margin: 0 0 20px 0;">{lesson["desc"]}</p>',
        unsafe_allow_html=True,
    )

    if st.button("스피킹 연습 시작하기 ➔", key=f"lesson_btn_{idx}", use_container_width=False):
      go_to("practice", lesson)
    st.markdown("</div>", unsafe_allow_html=True)


# =========================================================
# [PAGE 2] 스픽 실전 스피킹 및 AI 피드백 세션
# =========================================================
elif st.session_state.speak_page == "practice":
  lesson = st.session_state.selected_lesson

  # 뒤로 가기 버튼
  if st.button("⬅️ 코스 목록으로"):
    go_to("home")

  st.markdown(
      f"""
    <div style="margin: 20px 0 30px 0;">
        <span style="color: #3bb2b8; font-weight: 700; font-size: 14px;">LIVE SPEAKING SESSION</span>
        <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 5px 0 0 0;">{lesson['title'] if lesson else '스피킹 트레이닝'}</h2>
    </div>
    """,
      unsafe_allow_html=True,
  )

  # AI 대화 시뮬레이션 박스 (스픽 앱 다크 UI 컨셉)
  st.markdown(
      """
    <div class="speak-chat-box">
        <div style="font-size: 13px; color: #3bb2b8; font-weight: 700; margin-bottom: 8px; letter-spacing: 1px;">AI TUTOR SPEAKING</div>
        <div class="ai-speech-bubble">
            "Hi there! Welcome to the café. What can I get started for you today?"<br>
            <span style="font-size: 14px; color: #94a3b8; font-weight: 400;">(어서오세요! 오늘 어떤 음료로 준비해 드릴까요?)</span>
        </div>
        <p style="font-size: 14px; color: #cbd5e1; margin: 0; text-align: center;">👇 마이크 버튼을 누르고 아래 문장을 영어로 크게 말해보세요!</p>
    </div>
    """,
      unsafe_allow_html=True,
  )

  # 목표 문장 제시 카드
  st.markdown(
      """
    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 25px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 8px;">TARGET EXPRESSION (목표 표현)</div>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">"I'd like aniced americano, but with half the ice, please."</div>
        <div style="font-size: 15px; color: #64748b;">(아이스 아메리카노 주세요, 얼음은 절반만 넣어주세요.)</div>
    </div>
    """,
      unsafe_allow_html=True,
  )

  # 음성 인식 시뮬레이션 버튼 영역
  col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
  with col_btn2:
    if st.button("🎙️ 마이크 켜고 말하기 (음성 녹음)", type="primary", use_container_width=True):
      with st.spinner("AI가 발음과 억양을 분석 중입니다..."):
        time.sleep(1.5)
      st.success("음성 인식 완료!")
      st.balloons()

      # 스픽 스타일 AI 분석 리포트 카드
      st.markdown(
          """
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; padding: 25px; margin-top: 25px;">
            <h4 style="color: #166534; margin-top: 0; font-size: 18px; font-weight: 800;">✨ AI 스피킹 피드백 리포트</h4>
            <p style="color: #15803d; font-size: 15px; margin-bottom: 10px;"><b>발음 정확도:</b> 95점 (매우 훌륭합니다! 원어민 발음과 거의 일치해요)</p>
            <p style="color: #15803d; font-size: 15px; margin-bottom: 0;"><b>칭찬 포인트:</b> 'half the ice' 연음 처리가 아주 자연스러웠습니다.</p>
        </div>
        """,
          unsafe_allow_html=True,
      )
