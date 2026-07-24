import base64
import os
import time
import streamlit as st

# =========================================================
# 1. 페이지 기본 설정 (Wide 모드 고정)
# =========================================================
st.set_page_config(
    page_title="MyStair - 마이스터고 진로 파트너",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 세션 상태 관리
if "page" not in st.session_state:
    st.session_state.page = "main"

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# 글로벌 CSS (앰비언트 그라데이션 배경)
st.markdown(
    """
<style>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css');

body, [class*="css"] {
    font-family: 'SUIT', -apple-system, sans-serif !important;
}

.stApp {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 178, 184, 0.12) 0px, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(126, 87, 194, 0.1) 0px, transparent 45%),
        radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
        #ffffff !important;
    background-attachment: fixed;
    color: #1e293b;
}

header[data-testid="stHeader"] {
    display: none !important;
}
</style>
""",
    unsafe_allow_html=True,
)

# =========================================================
# [PAGE 1] 메인 포털 대시보드 (기획서 맞춤형 고도화)
# =========================================================
if st.session_state.page == "main":
    
    css_string = """
<style>
.block-container {
max-width: 1350px !important;
padding-top: 0 !important;
padding-bottom: 10rem !important;
padding-left: 40px !important;
padding-right: 40px !important;
}

/* 🌟 상단 풀와이드 배너 */
.ms-top-banner {
width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; background: linear-gradient(90deg, #0f172a, #1e293b); color: #ffffff; text-align: center; padding: 14px 0; font-size: 15px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 20px;
}
.ms-top-banner-badge { background: linear-gradient(90deg, #3bb2b8, #7e57c2); padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 800; }

/* 🌟 로고 및 검색창 */
.ms-logo { font-size: 36px; font-weight: 900; background: linear-gradient(90deg, #0f172a, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1.5px; cursor: pointer; padding-top: 12px; }
.ms-search-box-wrapper { display: flex; justify-content: center; width: 100%; padding-top: 10px; }
.ms-search-box { display: flex; align-items: center; border: 1px solid rgba(226, 232, 240, 0.8); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 100px; padding: 8px 8px 8px 24px; width: 100%; max-width: 600px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.ms-search-box:focus-within { border-color: rgba(59, 178, 184, 0.4); box-shadow: 0 15px 40px rgba(59, 178, 184, 0.12); background: #ffffff; transform: translateY(-2px); }
.ms-search-input { border: none; outline: none; width: 100%; font-size: 16px; font-family: 'SUIT'; color: #1e293b; background: transparent; }
.ms-search-input::placeholder { color: #94a3b8; font-weight: 500; }
.ms-search-btn { background: linear-gradient(90deg, #3bb2b8, #7e57c2); border: none; width: 46px; height: 46px; border-radius: 50%; color: white; font-size: 18px; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 15px rgba(126,87,194,0.3); transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.ms-search-btn:hover { transform: scale(1.08); }

/* 🌟 우측 홍보 버튼 */
div.stButton > button[kind="secondary"] { background: #ffffff !important; border: 1px solid #e2e8f0 !important; color: #1e293b !important; font-weight: 700 !important; border-radius: 50px !important; padding: 12px 24px !important; box-shadow: 0 4px 10px rgba(0,0,0,0.02) !important; transition: all 0.3s ease !important; float: right; margin-top: 12px; }
div.stButton > button[kind="secondary"]:hover { border-color: #cbd5e1 !important; box-shadow: 0 8px 20px rgba(0,0,0,0.06) !important; transform: translateY(-2px) !important; color: #3bb2b8 !important; }

/* 🌟 중앙 네비게이션 탭 */
.ms-nav { display: flex; justify-content: center; gap: 14px; padding-top: 35px; padding-bottom: 45px; flex-wrap: wrap; }
.ms-nav span { padding: 12px 24px; border-radius: 50px; background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(226, 232, 240, 0.6); font-size: 16px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); backdrop-filter: blur(10px); }
.ms-nav span:hover { background: rgba(255, 255, 255, 0.95); color: #0f172a; box-shadow: 0 5px 15px rgba(0,0,0,0.04); transform: translateY(-2px); border-color: #cbd5e1; }
.ms-nav span.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15); }

/* 🌟 2단 메인 그리드 */
.ms-main-grid { display: grid; grid-template-columns: 1.8fr 1.1fr; gap: 30px; }
.glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border-radius: 28px; padding: 40px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.glass-panel:hover { background: rgba(255, 255, 255, 1); box-shadow: 0 30px 60px rgba(126, 87, 194, 0.08); border-color: rgba(126, 87, 194, 0.2); transform: translateY(-4px); }

/* 좌측: AI 추천 */
.ms-ai-title { font-size: 24px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.ms-ai-title span { background: linear-gradient(90deg, #3bb2b8, #7e57c2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ms-ai-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
.ms-ai-btn { background: #0f172a; color: white; border: none; padding: 12px 28px; border-radius: 50px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.ms-ai-btn:hover { background: #334155; transform: scale(1.05); }

.blur-card-container { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; filter: blur(4.5px); opacity: 0.8; pointer-events: none; }
.blur-card { background: #ffffff; border-radius: 16px; padding: 24px; height: 160px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
.blur-line { height: 14px; background: #cbd5e1; border-radius: 10px; margin-bottom: 14px; }

/* 우측: 핵심 기획 퀵 메뉴 */
.ms-gradient-banner { background: linear-gradient(135deg, rgba(59,178,184,0.15), rgba(126,87,194,0.15)); color: #0f172a; padding: 20px 24px; border-radius: 20px; font-weight: 800; font-size: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 24px; border: 1px solid rgba(126,87,194,0.15); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.ms-gradient-banner:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(126,87,194,0.15); }
.ms-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ms-quick-item { background: rgba(255,255,255,0.6); border: 1px solid rgba(226,232,240,0.8); border-radius: 20px; padding: 24px; font-size: 16px; font-weight: 800; color: #1e293b; display: flex; flex-direction: column; justify-content: space-between; height: 125px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); line-height: 1.4; }
.ms-quick-item:hover { background: #ffffff; border-color: #3bb2b8; box-shadow: 0 15px 30px rgba(59,178,184,0.08); color: #0f172a; transform: translateY(-4px); }

/* 🌟 중간 10초 컷 배너 */
.ms-mid-banner { background: linear-gradient(135deg, rgba(59,178,184,0.1), rgba(126,87,194,0.1)); border: 1px solid rgba(126,87,194,0.2); border-radius: 28px; padding: 40px 50px; display: flex; justify-content: space-between; align-items: center; margin: 60px 0; backdrop-filter: blur(10px); }
.ms-mid-banner-title { font-size: 24px; font-weight: 800; color: #0f172a; }
.ms-mid-btns { display: flex; gap: 16px; }
.ms-mid-btn { background: #ffffff; border: 1px solid rgba(226,232,240,0.8); padding: 16px 32px; border-radius: 50px; font-weight: 700; font-size: 16px; color: #0f172a; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
.ms-mid-btn:hover { border-color: #7e57c2; box-shadow: 0 15px 30px rgba(126,87,194,0.15); transform: translateY(-4px); }

/* 🌟 하단 그리드 섹션 */
.ms-job-section { margin-bottom: 100px; }
.ms-section-title { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 24px; letter-spacing: -1px; }

.ms-chip-group { display: flex; gap: 12px; margin-bottom: 35px; overflow-x: auto; padding-bottom: 10px; }
.ms-chip { padding: 12px 28px; border-radius: 50px; font-size: 15px; font-weight: 600; color: #64748b; background: rgba(255,255,255,0.7); backdrop-filter: blur(5px); cursor: pointer; border: 1px solid rgba(226,232,240,0.8); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.ms-chip.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 8px 20px rgba(15,23,42,0.15); }
.ms-chip:hover:not(.active) { background: #ffffff; color: #0f172a; box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); }

.ms-job-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.ms-job-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 24px; padding: 32px 28px; cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
.ms-job-card:hover { transform: translateY(-8px); background: #ffffff; box-shadow: 0 25px 50px rgba(126,87,194,0.08); border-color: rgba(126,87,194,0.3); }
.job-card-title { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 14px; line-height: 1.4; letter-spacing: -0.5px; }
.job-card-comp { font-size: 15px; color: #64748b; margin-bottom: 24px; display: flex; justify-content: space-between;}
.d-day { color: #3bb2b8; font-weight: 800; }
.job-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.job-tag { font-size: 13px; font-weight: 600; padding: 8px 14px; background: rgba(241,245,249,0.8); color: #475569; border-radius: 8px; border: 1px solid #e2e8f0;}
</style>
"""
    st.markdown(css_string, unsafe_allow_html=True)
    
    # 🌟 1. 최상단 배너
    st.markdown("""<div class="ms-top-banner">
<span class="ms-top-banner-badge">HOT</span>
<span>실습 후 커리어 고민이 있다면? 마이스터고 출신 현직자 3인에게 물어보세요!</span>
</div>""", unsafe_allow_html=True)

    # 🌟 2. 헤더 영역 (스트림릿 컬럼을 이용해 '홍보 가기' 버튼을 우측에 매립)
    h_col1, h_col2, h_col3 = st.columns([1.5, 6, 2.5])
    
    with h_col1:
        st.markdown('<div class="ms-logo">MyStair</div>', unsafe_allow_html=True)
        
    with h_col2:
        st.markdown("""<div class="ms-search-box-wrapper">
<div class="ms-search-box">
<input type="text" class="ms-search-input" placeholder="관심 직무, 실습 기업, 자격증을 검색해보세요">
<button class="ms-search-btn">🔍</button>
</div>
</div>""", unsafe_allow_html=True)
        
    with h_col3:
        if st.button("👉 서비스 소개(홍보) 가기", use_container_width=True):
            navigate_to("intro")

    # 🌟 3. 메인 레이아웃 (들여쓰기 절대 금지)
    html_string = """<div class="ms-nav">
<span class="active">진로추천</span>
<span>다이어리</span>
<span>자격증 검색</span>
<span>실습 JOB 찾기</span>
<span>공채·기업정보</span>
<span>MBTI</span>
<span>홀랜드직무검사</span>
</div>

<div class="ms-main-grid">
<div class="glass-panel">
<div class="ms-ai-header">
<div>
<div class="ms-ai-title">✨ 오늘의 <span>AI 맞춤 추천</span></div>
<p style="margin:0; font-size: 16px; color: #64748b; margin-top: 8px;">나의 다이어리 기록과 MBTI에 맞춘 완벽한 기회!</p>
</div>
<button class="ms-ai-btn">맞춤 공고 열람하기</button>
</div>
<div class="blur-card-container">
<div class="blur-card">
<div class="blur-line" style="width: 80%;"></div>
<div class="blur-line" style="width: 60%;"></div>
<div class="blur-line" style="width: 90%; margin-top: 30px;"></div>
</div>
<div class="blur-card">
<div class="blur-line" style="width: 70%;"></div>
<div class="blur-line" style="width: 50%;"></div>
<div class="blur-line" style="width: 85%; margin-top: 30px;"></div>
</div>
<div class="blur-card">
<div class="blur-line" style="width: 90%;"></div>
<div class="blur-line" style="width: 40%;"></div>
<div class="blur-line" style="width: 75%; margin-top: 30px;"></div>
</div>
</div>
</div>
<div class="glass-panel" style="padding: 40px 35px;">
<div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom:24px; line-height: 1.4; letter-spacing: -0.5px;">
미래의 기술 명장님을 위한<br>핵심 진로 워크스페이스
</div>
<div class="ms-gradient-banner">
<span>⚡ 나의 커리어 취향 설정하기</span>
<span>></span>
</div>
<div class="ms-quick-grid">
<div class="ms-quick-item">
<span>나의 실습<br>다이어리</span>
<span style="font-size: 26px; text-align: right;">📝</span>
</div>
<div class="ms-quick-item">
<span>AI STAR<br>자소서 추출</span>
<span style="font-size: 26px; text-align: right;">✨</span>
</div>
<div class="ms-quick-item">
<span>국가기술<br>자격증 일정</span>
<span style="font-size: 26px; text-align: right;">🏅</span>
</div>
<div class="ms-quick-item">
<span>선배들의<br>합격 포트폴리오</span>
<span style="font-size: 26px; text-align: right;">💼</span>
</div>
</div>
</div>
</div>
<div class="ms-mid-banner">
<div class="ms-mid-banner-title">⚡ 10초 컷! 나의 성향 기반 실습 공고 추천 받기</div>
<div class="ms-mid-btns">
<button class="ms-mid-btn">🛠️ 현장 실무형 (S/T)</button>
<button class="ms-mid-btn">📖 이론 설계형 (N/F)</button>
</div>
</div>
<div class="ms-job-section">
<div class="ms-section-title">주목받는 우수 실습 JOB</div>
<div class="ms-chip-group">
<div class="ms-chip active">기계·설비</div>
<div class="ms-chip">전기·전자</div>
<div class="ms-chip">소프트웨어</div>
<div class="ms-chip">자동화·로봇</div>
<div class="ms-chip">화학·신소재</div>
<div class="ms-chip">건축·토목</div>
<div class="ms-chip">디자인·설계</div>
</div>
<div class="ms-job-grid">
<div class="ms-job-card">
<div class="job-card-title">[삼성전자] 2026년 하반기 DS부문 5급 신입사원 채용</div>
<div class="job-card-comp">
<span>삼성전자(주)</span>
<span class="d-day">D-7</span>
</div>
<div class="job-tags">
<span class="job-tag">신입·현장실습</span>
<span class="job-tag">기숙사 제공</span>
</div>
</div>
<div class="ms-job-card">
<div class="job-card-title">2026 하반기 공개채용 [생산기술/보전 직무]</div>
<div class="job-card-comp">
<span>현대자동차</span>
<span class="d-day">D-12</span>
</div>
<div class="job-tags">
<span class="job-tag">신입 채용</span>
<span class="job-tag">장기근속 포상</span>
</div>
</div>
<div class="ms-job-card">
<div class="job-card-title">(주)포스코 '26년 하반기 제철설비 현장 실습생 모집</div>
<div class="job-card-comp">
<span>(주)포스코</span>
<span class="d-day">D-38</span>
</div>
<div class="job-tags">
<span class="job-tag">실습 연계</span>
<span class="job-tag">우수자 채용</span>
</div>
</div>
<div class="ms-job-card">
<div class="job-card-title">[LG에너지솔루션] 배터리 생산/품질 관리 신입 채용</div>
<div class="job-card-comp">
<span>LG에너지솔루션</span>
<span class="d-day">D-51</span>
</div>
<div class="job-tags">
<span class="job-tag">품질관리</span>
<span class="job-tag">기숙사 지원</span>
</div>
</div>
</div>
</div>"""
    st.markdown(html_string, unsafe_allow_html=True)


# =========================================================
# [PAGE 2] 서비스 소개 페이지 (홍보 랜딩)
# =========================================================
elif st.session_state.page == "intro":

    intro_css = """
<style>
.block-container {
padding-top: 2rem;
padding-bottom: 10rem;
max-width: 1350px !important;
margin: 0 auto !important;
padding-left: 4rem !important;
padding-right: 4rem !important;
animation: smoothFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

.speak-navbar-container { display: flex; justify-content: center; width: 100%; margin-bottom: 70px; }
.speak-navbar { display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); border-radius: 100px; padding: 14px 40px; width: 100%; max-width: 1350px; }
.nav-left { display: flex; align-items: center; cursor: pointer; }
.nav-logo-text { font-size: 22px; font-weight: 800; background: linear-gradient(90deg, #0f172a, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; }
.nav-right { display: flex; align-items: center; gap: 32px; }
.nav-link { font-size: 15px; font-weight: 600; color: #475569; }
.lang-btn-wrapper { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 18px; border-radius: 50px; font-size: 14px; font-weight: 600; color: #334155; display: inline-flex; align-items: center; gap: 8px; }

.hero-section-left { text-align: left; padding: 30px 0; }
.hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); color: #475569; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
.hero-title { font-size: 60px; font-weight: 800; margin: 0 0 24px 0; line-height: 1.2; letter-spacing: -2px; color: #0f172a; }
.hero-title span { background: linear-gradient(90deg, #3bb2b8, #7e57c2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 20px; color: #64748b; margin: 0 0 40px 0; font-weight: 400; line-height: 1.6; letter-spacing: -0.3px; }

.hero-graphic-container { display: flex; justify-content: center; align-items: center; animation: floatAnimation 4s ease-in-out infinite; }
.hero-graphic { width: 100%; max-width: 480px; height: auto; object-fit: contain; filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.1)); }

.scroll-section { padding-top: 280px; }
.section-tag { font-size: 13px; font-weight: 700; color: #3bb2b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1.5px; }
.section-heading { font-size: 38px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -1px; line-height: 1.3; }
.section-desc { font-size: 18px; color: #64748b; line-height: 1.6; margin-bottom: 30px; }

.modern-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-radius: 24px; padding: 36px 32px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); height: 100%; display: flex; flex-direction: column; }
.modern-card:hover { transform: translateY(-8px); background: rgba(255, 255, 255, 1); box-shadow: 0 30px 60px rgba(126, 87, 194, 0.12); border-color: rgba(126, 87, 194, 0.4); }
.modern-card h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; letter-spacing: -0.5px; }
.modern-card p { font-size: 16px; color: #64748b; line-height: 1.7; margin: 0; word-break: keep-all; }

.faq-box { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 20px; padding: 32px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 25px rgba(0,0,0,0.02); margin-bottom: 20px; transition: all 0.3s ease; }
.faq-box:hover { border-color: rgba(59, 178, 184, 0.4); box-shadow: 0 15px 35px rgba(59, 178, 184, 0.06); }
.faq-q { font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
.faq-a { font-size: 17px; color: #64748b; line-height: 1.6; margin: 0; }

.footer-container { margin-top: 250px; padding: 60px 0; border-top: 1px solid rgba(226, 232, 240, 0.8); display: flex; flex-direction: column; gap: 20px; color: #64748b; font-size: 15px; }
.footer-top { display: flex; justify-content: space-between; align-items: center; }
.footer-logo { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.8px; }
.footer-links { display: flex; gap: 28px; font-weight: 600; }
</style>
"""
    st.markdown(intro_css, unsafe_allow_html=True)

    nav_html = """
<div class="speak-navbar-container">
<div class="speak-navbar">
<div class="nav-left">
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
"""
    st.markdown(nav_html, unsafe_allow_html=True)

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
                background: #0f172a !important; color: #ffffff !important; border: none !important; padding: 18px 36px !important; font-size: 17px !important; font-weight: 700 !important; border-radius: 50px !important; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15) !important; width: fit-content !important; transition: all 0.3s ease !important;
            }
            div.stButton > button[kind="primary"]:hover {
                background: #334155 !important; transform: translateY(-2px);
            }
            </style>
            """,
            unsafe_allow_html=True,
        )
        if st.button("포털 대시보드로 가기", type="primary"):
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
        st.markdown('<div class="modern-card"><h3>📝 파편화된 실습 기록의 한계</h3><p>학교 생활 중 겪은 수많은 기술 실습과 트러블슈팅 경험들이 체계적으로 관리되지 못하고 흩어져 있어, 취업 시 포트폴리오나 자소서에 효과적으로 녹여내기 어렵다는 문제점에서 출발했습니다.</p></div>', unsafe_allow_html=True)
    with bg_col2:
        st.markdown('<div class="modern-card"><h3>🚀 맞춤형 커리어 빌딩</h3><p>학생들이 흘린 실습의 땀방울을 데이터로 누적하고, 기업이 요구하는 핵심 직무 역량과 STAR 기법 자소서로 곧바로 전환하여 자신감 있게 취업 시장에 뛰어들도록 돕습니다.</p></div>', unsafe_allow_html=True)

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
        st.markdown('<div class="modern-card"><h3>🎯 맞춤형 진로 로드맵</h3><p>전공과 학년별 역량에 맞춘 단계별 성장 경로를 설계하고 취업 목표를 체계적으로 관리합니다.</p></div>', unsafe_allow_html=True)
    with f_col2:
        st.markdown('<div class="modern-card"><h3>📅 실습 및 경험 캘린더</h3><p>학교 정규 수업 및 현장 실습 활동, 자격증 취득 과정을 스마트하게 기록하고 자산화합니다.</p></div>', unsafe_allow_html=True)
    with f_col3:
        st.markdown('<div class="modern-card"><h3>✨ AI STAR 자소서 변환</h3><p>기록된 경험 데이터를 바탕으로 기업 맞춤형 STAR(상황-과제-행동-결과) 자기소개서를 자동 완성합니다.</p></div>', unsafe_allow_html=True)

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
            <div style="color: #94a3b8; font-size: 14px;">
                © 2026 MyStair Inc. All rights reserved. 마이스터고 학생들의 빛나는 내일을 응원합니다.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
