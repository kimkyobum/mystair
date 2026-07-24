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

# 세션 상태 관리 (초기 화면을 'main' 포털 대시보드로 설정)
if "page" not in st.session_state:
    st.session_state.page = "main"

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

# =========================================================
# [PAGE 1] 진짜 메인 대시보드 (잡코리아 스타일 포털 UI)
# =========================================================
if st.session_state.page == "main":
    
    # 상단 메뉴 이동을 위한 Streamlit 버튼 (우측 상단 배치)
    col_nav_1, col_nav_2 = st.columns([8.5, 1.5])
    with col_nav_2:
        st.markdown("<div style='margin-top: 10px;'></div>", unsafe_allow_html=True)
        if st.button("👉 서비스 소개(홍보) 가기", use_container_width=True):
            navigate_to("intro")

    # 메인 포털 전용 CSS 주입 (들여쓰기 방지)
    css_string = """
<style>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css');

.block-container {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    font-family: 'SUIT', -apple-system, sans-serif !important;
}

header[data-testid="stHeader"] {
    display: none !important;
}

.top-banner {
    width: 100%;
    background-color: #3b82f6;
    color: #ffffff;
    text-align: center;
    padding: 12px 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}
.top-banner-badge {
    border: 1px solid rgba(255,255,255,0.4);
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 12px;
}

.jk-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.jk-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 0;
}
.jk-logo {
    font-size: 32px;
    font-weight: 900;
    color: #1d4ed8;
    letter-spacing: -1.5px;
    cursor: pointer;
}
.jk-search-box {
    display: flex;
    align-items: center;
    border: 2px solid #3b82f6;
    border-radius: 50px;
    padding: 5px 10px 5px 20px;
    width: 500px;
    background: #ffffff;
}
.jk-search-loc {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    padding-right: 15px;
    border-right: 1px solid #e2e8f0;
    cursor: pointer;
}
.jk-search-input {
    border: none;
    outline: none;
    padding: 10px 15px;
    width: 100%;
    font-size: 15px;
    font-family: 'SUIT';
}
.jk-search-btn {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
}
.jk-auth-group {
    display: flex;
    gap: 10px;
}
.jk-btn-outline {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
}

.jk-nav {
    display: flex;
    gap: 35px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 18px;
    font-weight: 800;
    color: #1e293b;
}
.jk-nav span { cursor: pointer; }
.jk-nav span:hover { color: #3b82f6; }

.jk-main-grid {
    display: grid;
    grid-template-columns: 2fr 1.1fr;
    gap: 24px;
    margin-top: 30px;
}

.jk-glow-box {
    position: relative;
    background: #ffffff;
    border-radius: 16px;
    padding: 30px;
    z-index: 1;
}
.jk-glow-box::before {
    content: "";
    position: absolute;
    top: -2px; left: -2px; right: -2px; bottom: -2px;
    background: linear-gradient(135deg, #ff9a9e, #fecfef, #a1c4fd, #c2e9fb);
    z-index: -1;
    border-radius: 18px;
    opacity: 0.7;
}
.jk-glow-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}
.jk-blue-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
}

.blur-card-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
    filter: blur(4px);
    opacity: 0.6;
    user-select: none;
    pointer-events: none;
}
.blur-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    height: 140px;
    background: #f8fafc;
}
.blur-line {
    height: 12px;
    background: #cbd5e1;
    border-radius: 10px;
    margin-bottom: 10px;
}

.jk-right-box {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 30px 24px;
    background: #ffffff;
}
.jk-yellow-banner {
    background: #fef9c3;
    color: #854d0e;
    padding: 16px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    margin-bottom: 20px;
}
.jk-quick-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.jk-quick-item {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 90px;
    cursor: pointer;
}
.jk-quick-item:hover { border-color: #cbd5e1; background: #f8fafc; }

.jk-mid-banner {
    background: #f8fafc;
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    margin: 40px 0;
}
.jk-mid-btns {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
}
.jk-mid-btn {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    color: #1e293b;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.jk-job-section { margin-bottom: 80px; }
.jk-section-title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 20px; }

.jk-chip-group {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    overflow-x: auto;
    padding-bottom: 5px;
}
.jk-chip {
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 14px;
    color: #64748b;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
    cursor: pointer;
    background: #ffffff;
}
.jk-chip.active {
    background: #eff6ff;
    color: #2563eb;
    border-color: #2563eb;
    font-weight: 700;
}

.jk-job-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
.jk-job-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
}
.jk-job-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
.job-card-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.4; }
.job-card-comp { font-size: 13px; color: #64748b; margin-bottom: 16px; display: flex; justify-content: space-between;}
.d-day { color: #ef4444; font-weight: 700; }
.job-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.job-tag { font-size: 12px; padding: 4px 8px; background: #f1f5f9; color: #475569; border-radius: 4px; }
</style>
"""
    st.markdown(css_string, unsafe_allow_html=True)
    
    # 🌟 HTML 구조 주입 (들여쓰기 없이 좌측에 바짝 붙여 작성해야 에러가 안 납니다)
    html_string = """
<div class="top-banner">
    <span class="top-banner-badge">실습 후 커리어 토크</span>
    <span>커리어 고민 있다면? 마이스터고 출신 현직자 3인에게 물어보세요!</span>
</div>

<div class="jk-container">
    <div class="jk-header">
        <div class="jk-logo">MyStair</div>
        <div class="jk-search-box">
            <div class="jk-search-loc">📍 지역 전체 ⌄</div>
            <input type="text" class="jk-search-input" placeholder="MBTI, 추천 직무, 자격증 검색">
            <button class="jk-search-btn">🔍</button>
        </div>
        <div class="jk-auth-group">
            <button class="jk-btn-outline">회원가입/로그인</button>
            <button class="jk-btn-outline">선생님 서비스 ⌄</button>
        </div>
    </div>
    
    <div class="jk-nav">
        <span style="color: #3b82f6;">MBTI</span>
        <span>홀랜드직무검사</span>
        <span>진로추천</span>
        <span>실습 JOB 찾기</span>
        <span>합격 자소서</span>
        <span>공채·기업정보</span>
        <span>선배 톡톡</span>
    </div>
    
    <div class="jk-main-grid">
        <div class="jk-glow-box">
            <div class="jk-glow-header">
                <div>
                    <div style="color: #3b82f6; font-weight: 800; font-size: 16px;">✨ 오늘의 AI 추천</div>
                    <p style="margin:0; font-size: 14px; color: #64748b; margin-top: 6px;">나의 MBTI와 홀랜드 결과에 맞는 맞춤 기회를 찾아드려요!</p>
                </div>
                <button class="jk-blue-btn">나만의 맞춤 정보 받기</button>
            </div>
            <div class="blur-card-container">
                <div class="blur-card">
                    <div class="blur-line" style="width: 80%;"></div>
                    <div class="blur-line" style="width: 60%;"></div>
                    <div class="blur-line" style="width: 90%; margin-top: 20px;"></div>
                </div>
                <div class="blur-card">
                    <div class="blur-line" style="width: 70%;"></div>
                    <div class="blur-line" style="width: 50%;"></div>
                    <div class="blur-line" style="width: 85%; margin-top: 20px;"></div>
                </div>
                <div class="blur-card">
                    <div class="blur-line" style="width: 90%;"></div>
                    <div class="blur-line" style="width: 40%;"></div>
                    <div class="blur-line" style="width: 75%; margin-top: 20px;"></div>
                </div>
            </div>
        </div>
        
        <div class="jk-right-box">
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom:15px;">
                미래의 명장님을 위한 맞춤 정보를 제공해드릴게요!
            </div>
            <div class="jk-yellow-banner">
                <span>⚡ 커리어 취향 설정하고 맞춤 공고 받아보기</span>
                <span>></span>
            </div>
            <div class="jk-quick-grid">
                <div class="jk-quick-item">
                    <span>이번 달<br>실습 일정</span>
                    <span style="font-size: 20px; text-align: right;">🗂️</span>
                </div>
                <div class="jk-quick-item">
                    <span>나의 진로<br>추천 정보</span>
                    <span style="font-size: 20px; text-align: right;">🎯</span>
                </div>
                <div class="jk-quick-item">
                    <span>요즘 실무<br>기술 트렌드</span>
                    <span style="font-size: 20px; text-align: right;">📈</span>
                </div>
                <div class="jk-quick-item">
                    <span>AI 자소서<br>완성도 분석</span>
                    <span style="font-size: 20px; text-align: right;">✨</span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="jk-mid-banner">
        <div style="font-size: 18px; font-weight: 800; color: #0f172a;">⚡ 10초 컷! 나만의 공고 추천 받기</div>
        <div class="jk-mid-btns">
            <button class="jk-mid-btn">🛠️ 현장 실습이 최고예요</button>
            <button class="jk-mid-btn">📖 이론/설계가 더 좋아요</button>
        </div>
    </div>
    
    <div class="jk-job-section">
        <div class="jk-section-title">인기 실습 JOB</div>
        <div class="jk-chip-group">
            <div class="jk-chip active">기계·설비</div>
            <div class="jk-chip">전기·전자</div>
            <div class="jk-chip">소프트웨어</div>
            <div class="jk-chip">자동화·로봇</div>
            <div class="jk-chip">화학·신소재</div>
            <div class="jk-chip">건축·토목</div>
            <div class="jk-chip">디자인·설계</div>
            <div class="jk-chip">품질관리</div>
        </div>
        
        <div class="jk-job-grid">
            <div class="jk-job-card">
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
            <div class="jk-job-card">
                <div class="job-card-title">2026 하반기 공개채용 [생산기술/보전 직무]</div>
                <div class="job-card-comp">
                    <span>현대자동차</span>
                    <span class="d-day">D-12</span>
                </div>
                <div class="job-tags">
                    <span class="job-tag">신입</span>
                    <span class="job-tag">장기근속 포상</span>
                </div>
            </div>
            <div class="jk-job-card">
                <div class="job-card-title">(주)포스코 '26년 하반기 제철설비 현장 실습생 모집</div>
                <div class="job-card-comp">
                    <span>(주)포스코</span>
                    <span class="d-day">D-38</span>
                </div>
                <div class="job-tags">
                    <span class="job-tag">실습생</span>
                    <span class="job-tag">인센티브</span>
                </div>
            </div>
            <div class="jk-job-card">
                <div class="job-card-title">[LG에너지솔루션] 배터리 생산/품질 관리 신입 채용</div>
                <div class="job-card-comp">
                    <span>LG에너지솔루션</span>
                    <span class="d-day">D-51</span>
                </div>
                <div class="job-tags">
                    <span class="job-tag">품질관리</span>
                    <span class="job-tag">기숙사</span>
                </div>
            </div>
        </div>
    </div>
</div>
"""
    st.markdown(html_string, unsafe_allow_html=True)


# =========================================================
# [PAGE 2] 서비스 소개 페이지 (토스/스픽 스타일 랜딩)
# =========================================================
elif st.session_state.page == "intro":

    # 홍보 페이지 전용 CSS 주입
    intro_css = """
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

/* 알약 네비게이션 */
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
    padding: 14px 40px;
    width: 100%;
    max-width: 1350px;
}
.nav-left { display: flex; align-items: center; cursor: pointer; }
.nav-logo-text {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(90deg, #0f172a, #334155);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
}
.nav-right { display: flex; align-items: center; gap: 32px; }
.nav-link { font-size: 15px; font-weight: 600; color: #475569; }
.lang-btn-wrapper {
    background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 18px;
    border-radius: 50px; font-size: 14px; font-weight: 600; color: #334155;
    display: inline-flex; align-items: center; gap: 8px;
}

/* 히어로 섹션 */
.hero-section-left { text-align: left; padding: 30px 0; }
.hero-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;
    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
    color: #475569; border-radius: 50px; font-size: 14px; font-weight: 600;
    margin-bottom: 24px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}
.hero-title {
    font-size: 60px; font-weight: 800; margin: 0 0 24px 0;
    line-height: 1.2; letter-spacing: -2px; color: #0f172a;
}
.hero-title span {
    background: linear-gradient(90deg, #3bb2b8, #7e57c2);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-subtitle {
    font-size: 20px; color: #64748b; margin: 0 0 40px 0;
    font-weight: 400; line-height: 1.6; letter-spacing: -0.3px;
}

/* 3D 이미지 */
.hero-graphic-container { display: flex; justify-content: center; align-items: center; animation: floatAnimation 4s ease-in-out infinite; }
.hero-graphic { width: 100%; max-width: 480px; height: auto; object-fit: contain; filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.1)); }

/* 섹션 */
.scroll-section { padding-top: 280px; }
.section-tag { font-size: 13px; font-weight: 700; color: #3bb2b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1.5px; }
.section-heading { font-size: 38px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -1px; line-height: 1.3; }
.section-desc { font-size: 18px; color: #64748b; line-height: 1.6; margin-bottom: 30px; }

/* 카드 */
.modern-card {
    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-radius: 24px;
    padding: 36px 32px; border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); height: 100%; display: flex; flex-direction: column;
}
.modern-card:hover {
    transform: translateY(-8px); background: rgba(255, 255, 255, 1);
    box-shadow: 0 30px 60px rgba(126, 87, 194, 0.12); border-color: rgba(126, 87, 194, 0.4);
}
.modern-card h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; letter-spacing: -0.5px; }
.modern-card p { font-size: 16px; color: #64748b; line-height: 1.7; margin: 0; word-break: keep-all; }

/* FAQ */
.faq-box {
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-radius: 20px;
    padding: 32px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 25px rgba(0,0,0,0.02);
    margin-bottom: 20px; transition: all 0.3s ease;
}
.faq-box:hover { border-color: rgba(59, 178, 184, 0.4); box-shadow: 0 15px 35px rgba(59, 178, 184, 0.06); }
.faq-q { font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
.faq-a { font-size: 17px; color: #64748b; line-height: 1.6; margin: 0; }

/* 푸터 */
.footer-container { margin-top: 250px; padding: 60px 0; border-top: 1px solid rgba(226, 232, 240, 0.8); display: flex; flex-direction: column; gap: 20px; color: #64748b; font-size: 15px; }
.footer-top { display: flex; justify-content: space-between; align-items: center; }
.footer-logo { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.8px; }
.footer-links { display: flex; gap: 28px; font-weight: 600; }
</style>
"""
    st.markdown(intro_css, unsafe_allow_html=True)

    # 🌟 상단 알약 네비게이션 바
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

    # 🌟 히어로 섹션
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
                background: #0f172a !important; color: #ffffff !important; border: none !important;
                padding: 18px 36px !important; font-size: 17px !important; font-weight: 700 !important;
                border-radius: 50px !important; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15) !important;
                width: fit-content !important; transition: all 0.3s ease !important;
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

    # 🌟 서비스 기획 배경
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

    # 🌟 핵심 기능 안내
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

    # 🌟 FAQ
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

    # 🌟 푸터
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
