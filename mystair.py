import base64
import os
import time
import json
import hashlib
import streamlit as st

# =========================================================
# 1. 페이지 기본 설정 (Wide 모드 고정, 초기 사이드바 닫힘)
# =========================================================
st.set_page_config(
    page_title="MyStair - 마이스터고 진로 파트너",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# =========================================================
# 2. 로컬 데이터베이스 (JSON) 세팅 및 함수
# =========================================================
DB_FILE = "users_data.json"

def init_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

def load_db():
    init_db()
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def hash_pw(password):
    return hashlib.sha256(password.encode()).hexdigest()

def sync_to_db():
    if st.session_state.get("logged_in") and st.session_state.get("current_user"):
        db = load_db()
        user = st.session_state.current_user
        db[user]["chk_1"] = st.session_state.chk_1
        db[user]["chk_2"] = st.session_state.chk_2
        db[user]["chk_4"] = st.session_state.chk_4
        db[user]["chk_5"] = st.session_state.chk_5
        db[user]["diary_data"] = st.session_state.diary_data
        db[user]["profile"] = st.session_state.profile
        save_db(db)

# =========================================================
# 3. 세션 상태 관리 (초기화)
# =========================================================
if "logged_in" not in st.session_state: st.session_state.logged_in = False
if "current_user" not in st.session_state: st.session_state.current_user = None
if "page" not in st.session_state: st.session_state.page = "main"

if "chk_1" not in st.session_state: st.session_state.chk_1 = True
if "chk_2" not in st.session_state: st.session_state.chk_2 = False
if "chk_4" not in st.session_state: st.session_state.chk_4 = False
if "chk_5" not in st.session_state: st.session_state.chk_5 = False
if "diary_data" not in st.session_state: st.session_state.diary_data = {"10": "PLC 도면 해석 복습 완료"} 
if "profile" not in st.session_state: st.session_state.profile = {"name": "", "school": "", "major": "", "mbti": "", "holland": "", "target": ""}

def navigate_to(page_name):
    st.session_state.page = page_name
    st.rerun()

def logout():
    st.session_state.logged_in = False
    st.session_state.current_user = None
    st.session_state.chk_1 = True
    st.session_state.chk_2 = False
    st.session_state.chk_4 = False
    st.session_state.chk_5 = False
    st.session_state.diary_data = {"10": "PLC 도면 해석 복습 완료"}
    st.session_state.profile = {"name": "", "school": "", "major": "", "mbti": "", "holland": "", "target": ""}
    navigate_to("main")

@st.dialog("📝 실습 다이어리 기록")
def write_diary(day):
    st.markdown(f"<div style='font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 10px;'>📅 2026년 7월 {day}일</div>", unsafe_allow_html=True)
    current_text = st.session_state.diary_data.get(str(day), "")
    diary_input = st.text_area("다이어리 내용", value=current_text, placeholder="오늘의 실습 내용, 트러블슈팅 경험, 새로 배운 기술을 적어보세요!", label_visibility="collapsed", height=180)
    st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
    if st.button("✨ 저장 및 연동", type="primary", use_container_width=True):
        if diary_input.strip():
            st.session_state.diary_data[str(day)] = diary_input
            st.toast(f"✅ 7월 {day}일 다이어리가 저장되었습니다!")
        else:
            if str(day) in st.session_state.diary_data: del st.session_state.diary_data[str(day)]
        sync_to_db()
        st.rerun()

# =========================================================
# 4. 글로벌 CSS (깨짐 방지 및 우측 사이드바 설정)
# =========================================================
st.markdown(
    """
<style>
@import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css');
html { scroll-behavior: smooth; }
body, [class*="css"] { font-family: 'SUIT', -apple-system, sans-serif !important; line-height: 1.5; }
.stApp {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 178, 184, 0.08) 0px, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(126, 87, 194, 0.05) 0px, transparent 45%),
        radial-gradient(circle at 50% 85%, rgba(56, 189, 248, 0.05) 0px, transparent 50%),
        #ffffff !important;
    background-attachment: fixed;
    color: #1e293b;
}

/* 🌟 스트림릿 기본 사이드바를 오른쪽으로 이동 */
[data-testid="stSidebar"] {
    left: auto !important;
    right: 0 !important;
    border-left: 1px solid rgba(226, 232, 240, 0.8) !important;
    border-right: none !important;
    background-color: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px) !important;
}

/* 🌟 사이드바 여닫기 토글 화살표도 우측 상단으로 이동 */
button[kind="header"] {
    left: auto !important;
    right: 15px !important;
    z-index: 99999 !important;
    background-color: rgba(255, 255, 255, 0.8) !important;
    border-radius: 50% !important;
}

/* 🌟 메인 컨테이너 비율 안정화 및 둥근 여백 */
.block-container { max-width: 1200px !important; padding-top: 0 !important; padding-bottom: 8rem !important; }
div[data-testid="stVerticalBlockBorderWrapper"] {
    background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(16px) !important; border-radius: 24px !important; padding: 30px 35px !important; border: 1px solid rgba(226, 232, 240, 0.8) !important; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03) !important;
}
div[data-testid="stCheckbox"] { background: rgba(255, 255, 255, 0.8); border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 18px; margin-bottom: 12px !important; transition: all 0.2s ease; }
div[data-testid="stCheckbox"]:hover { background: #ffffff; border-color: #3bb2b8; box-shadow: 0 4px 10px rgba(59, 178, 184, 0.05); }

/* 네비게이션 및 공통 UI 부드럽게 */
.ms-nav { display: flex; justify-content: center; gap: 16px; padding-top: 30px; padding-bottom: 45px; flex-wrap: wrap; }
.ms-nav span, .ms-nav a.nav-anchor { padding: 10px 24px; border-radius: 50px; background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(226, 232, 240, 0.6); font-size: 15px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
.ms-nav span:hover, .ms-nav a.nav-anchor:hover { background: #ffffff; color: #0f172a; box-shadow: 0 6px 15px rgba(0,0,0,0.04); transform: translateY(-2px); border-color: #cbd5e1; }
.ms-nav span.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.15); }
.ms-nav a.link-btn { background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%) !important; color: white !important; border: none !important; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important; }

/* 메인 배너 및 상단 버튼들 */
.ms-top-banner { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; background: linear-gradient(90deg, #0f172a, #1e293b); color: #ffffff; text-align: center; padding: 12px 0; font-size: 14px; font-weight: 600; display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 30px; }
.ms-logo { font-size: 32px; font-weight: 900; background: linear-gradient(90deg, #0f172a, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; padding-top: 8px; }
.ms-search-box { display: flex; align-items: center; border: 1px solid rgba(226, 232, 240, 0.8); background: #ffffff; border-radius: 100px; padding: 8px 10px 8px 24px; width: 100%; box-shadow: 0 8px 20px rgba(0,0,0,0.03); transition: all 0.3s ease; }
.ms-search-input { border: none; outline: none; width: 100%; font-size: 15px; font-family: 'SUIT'; }
.ms-search-btn { background: linear-gradient(90deg, #3bb2b8, #7e57c2); border: none; width: 40px; height: 40px; border-radius: 50%; color: white; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 12px rgba(126,87,194,0.25); }

/* 그리드 및 간격 안정화 */
.ms-main-grid { display: grid; grid-template-columns: 1.8fr 1.1fr; gap: 30px; margin-bottom: 60px; }
.ms-ai-title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 24px;}
.ms-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex-grow: 1; }
.ms-quick-item { background: rgba(255,255,255,0.7); border: 1px solid rgba(226,232,240,0.8); border-radius: 20px; padding: 20px; font-size: 15px; font-weight: 800; color: #1e293b; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.3s ease; height: 110px;}
.ms-quick-item:hover { background: #ffffff; border-color: #3bb2b8; box-shadow: 0 10px 20px rgba(59,178,184,0.08); transform: translateY(-3px); }

.ms-job-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.ms-job-card { background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 24px; padding: 26px 22px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.02); }
.ms-job-card:hover { transform: translateY(-6px); background: #ffffff; box-shadow: 0 15px 35px rgba(126,87,194,0.08); border-color: rgba(126,87,194,0.3); }

@keyframes floatTree { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }
</style>
""",
    unsafe_allow_html=True,
)

# =========================================================
# 🌟 우측 슬라이딩 사이드바 구현 (아이콘 메뉴)
# =========================================================
with st.sidebar:
    st.markdown("<h3 style='text-align: center; color: #0f172a; font-weight: 800; margin-bottom: 30px; letter-spacing: -1px;'>📱 빠른 메뉴</h3>", unsafe_allow_html=True)
    
    # 둥글고 세련된 아이콘 버튼들
    if st.button("🏠 홈으로", use_container_width=True): navigate_to("main")
    if st.button("🔍 채용 검색", use_container_width=True): pass
    if st.button("♥️ 나의 스크랩", use_container_width=True): pass
    
    st.markdown("<div style='margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 30px;'></div>", unsafe_allow_html=True)
    
    # 🌟 팝오버를 활용한 확장 프로필 아이콘 기능
    if st.session_state.logged_in:
        display_name = st.session_state.profile.get("name", "") or st.session_state.current_user
        
        with st.popover(f"👤 {display_name} 설정", use_container_width=True):
            st.markdown(f"<div style='font-size:14px; font-weight: 700; color:#475569; margin-bottom:10px;'>내 계정 관리</div>", unsafe_allow_html=True)
            if st.button("📝 마이페이지", use_container_width=True):
                navigate_to("profile")
            if st.button("🚪 로그아웃", use_container_width=True):
                logout()
    else:
        st.markdown("<div style='text-align: center; font-size:14px; color:#64748b; margin-bottom:10px;'>로그인이 필요합니다</div>", unsafe_allow_html=True)
        if st.button("🔑 로그인 하기", type="primary", use_container_width=True):
            navigate_to("login")


# =========================================================
# [PAGE 0] 로그인 & 회원가입 화면
# =========================================================
if st.session_state.page == "login":
    st.markdown("<div style='margin-top: 100px;'></div>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1, 1.2, 1])
    with col2:
        with st.container(border=True):
            st.markdown("<div class='login-title'>MyStair</div>", unsafe_allow_html=True)
            st.markdown("<div class='login-subtitle'>마이스터고 학생을 위한 단 하나의 진로 파트너</div>", unsafe_allow_html=True)
            tab1, tab2 = st.tabs(["🔒 로그인", "📝 회원가입"])
            
            with tab1:
                login_id = st.text_input("아이디", key="login_id").strip()
                login_pw = st.text_input("비밀번호", type="password", key="login_pw").strip()
                if st.button("로그인", type="primary", use_container_width=True):
                    if not login_id or not login_pw: st.warning("아이디와 비밀번호를 모두 입력해주세요.")
                    else:
                        db = load_db()
                        if login_id in db and db[login_id]["password"] == hash_pw(login_pw):
                            user_data = db[login_id]
                            st.session_state.logged_in = True
                            st.session_state.current_user = login_id
                            st.session_state.chk_1 = user_data.get("chk_1", False)
                            st.session_state.chk_2 = user_data.get("chk_2", False)
                            st.session_state.chk_4 = user_data.get("chk_4", False)
                            st.session_state.chk_5 = user_data.get("chk_5", False)
                            st.session_state.diary_data = user_data.get("diary_data", {})
                            st.session_state.profile = user_data.get("profile", {"name": "", "school": "", "major": "", "mbti": "", "holland": "", "target": ""})
                            st.success(f"환영합니다, {login_id}님!")
                            time.sleep(0.5)
                            navigate_to("main")
                        else:
                            st.error("아이디나 비밀번호를 확인해주세요.")
                if st.button("메인으로 돌아가기", use_container_width=True): navigate_to("main")
            
            with tab2:
                reg_id = st.text_input("새 아이디", key="reg_id").strip()
                reg_pw = st.text_input("새 비밀번호", type="password", key="reg_pw").strip()
                reg_pw_confirm = st.text_input("비밀번호 확인", type="password", key="reg_pw_confirm").strip()
                if st.button("회원가입 완료", type="primary", use_container_width=True):
                    if not reg_id or not reg_pw: st.error("모두 입력해주세요.")
                    elif reg_pw != reg_pw_confirm: st.error("비밀번호 불일치.")
                    else:
                        db = load_db()
                        if reg_id in db: st.error("이미 존재하는 아이디입니다.")
                        else:
                            db[reg_id] = {
                                "password": hash_pw(reg_pw), "chk_1": False, "chk_2": False, "chk_4": False, "chk_5": False,
                                "diary_data": {}, "profile": {"name": "", "school": "", "major": "", "mbti": "", "holland": "", "target": ""}
                            }
                            save_db(db)
                            st.success("🎉 회원가입 완료! 로그인 탭을 이용하세요.")


# =========================================================
# [PAGE 1] 메인 포털 대시보드
# =========================================================
elif st.session_state.page == "main":
    
    st.markdown("""<div class="ms-top-banner"><span class="ms-top-banner-badge">HOT</span><span>실습 후 커리어 고민이 있다면? 마이스터고 출신 현직자 3인에게 물어보세요!</span></div>""", unsafe_allow_html=True)

    # 🌟 메인 헤더 (복구된 우측 상단 로그인/소개 버튼)
    h_col1, h_col2, h_col3 = st.columns([1.5, 6, 2.5], gap="small")
    with h_col1:
        st.markdown('<div class="ms-logo">MyStair</div>', unsafe_allow_html=True)
    with h_col2:
        st.markdown("""<div class="ms-search-box-wrapper"><div class="ms-search-box"><input type="text" class="ms-search-input" placeholder="관심 직무, 실습 기업, 자격증을 검색해보세요"><button class="ms-search-btn">🔍</button></div></div>""", unsafe_allow_html=True)
    with h_col3:
        st.markdown("<div style='margin-top: 8px;'></div>", unsafe_allow_html=True)
        # 상단 버튼 컨테이너
        c1, c2 = st.columns([1, 1])
        with c1:
            if not st.session_state.logged_in:
                if st.button("🔑 로그인", use_container_width=True): navigate_to("login")
            else:
                display_name = st.session_state.profile.get("name", "") or st.session_state.current_user
                st.markdown(f"<div style='text-align:center; padding-top:8px; font-weight:700; color:#475569;'>{display_name}님</div>", unsafe_allow_html=True)
        with c2:
            if st.button("👉 서비스 소개", use_container_width=True): navigate_to("intro")

    # 네비게이션
    holland_github_url = "https://kimkyobum.github.io/mystair/holland.html"
    mbti_github_url = "https://kimkyobum.github.io/mystair/MBTI.html"

    st.markdown(f"""<div class="ms-nav">
<span class="active">진로추천</span>
<a href="#diary-section" class="nav-anchor" tabindex="-1">다이어리</a>
<span>자격증 검색</span>
<span>실습 JOB 찾기</span>
<span>공채·기업정보</span>
<a href="{mbti_github_url}" target="_self" class="nav-anchor link-btn" tabindex="-1">🧠 MBTI</a>
<a href="{holland_github_url}" target="_self" class="nav-anchor link-btn" tabindex="-1">✨ 홀랜드직무검사</a>
</div>""", unsafe_allow_html=True)

    # 상단 AI 박스
    st.markdown("""<div class="ms-main-grid">
<div class="glass-panel">
<div class="ms-ai-header">
<div>
<div class="ms-ai-title">✨ 오늘의 <span>AI 맞춤 추천</span></div>
<p style="margin:0; font-size: 15px; color: #64748b; margin-top: 8px;">나의 다이어리 기록과 MBTI에 맞춘 완벽한 기회!</p>
</div>
<button style="background: #0f172a; color: white; border: none; padding: 10px 24px; border-radius: 50px; font-weight: 700; font-size: 14px; cursor: pointer;">맞춤 공고 보기</button>
</div>
<div class="blur-card-container">
<div class="blur-card"><div class="blur-line" style="width: 80%;"></div><div class="blur-line" style="width: 60%;"></div></div>
<div class="blur-card"><div class="blur-line" style="width: 70%;"></div><div class="blur-line" style="width: 50%;"></div></div>
<div class="blur-card"><div class="blur-line" style="width: 90%;"></div><div class="blur-line" style="width: 40%;"></div></div>
</div>
</div>
<div class="glass-panel">
<div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom:22px; line-height: 1.4; letter-spacing: -0.5px;">
미래의 기술 명장님을 위한<br>핵심 진로 워크스페이스
</div>
<div class="ms-quick-grid">
<div class="ms-quick-item"><span>나의 실습<br>다이어리</span><span style="font-size: 24px; text-align: right;">📝</span></div>
<div class="ms-quick-item"><span>AI STAR<br>자소서 추출</span><span style="font-size: 24px; text-align: right;">✨</span></div>
<div class="ms-quick-item"><span>국가기술<br>자격증 일정</span><span style="font-size: 24px; text-align: right;">🏅</span></div>
<div class="ms-quick-item"><span>선배들의<br>합격 포트폴리오</span><span style="font-size: 24px; text-align: right;">💼</span></div>
</div>
</div>
</div>""", unsafe_allow_html=True)

    # 🌟 5. 안정화된 캘린더 (다이어리) & 체크리스트
    st.markdown("<div id='diary-section' tabindex='-1' style='font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 20px; margin-top: 60px;'>📅 나의 실습 다이어리 & 체크리스트</div>", unsafe_allow_html=True)
    cal_col, chk_col = st.columns([1.6, 1], gap="large")

    with cal_col:
        with st.container(border=True):
            st.markdown("""
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 22px; font-weight: 800; color: #0f172a;">2026년 7월</span>
                <div>
                    <button style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 32px; height: 32px; font-size: 14px; cursor: pointer; margin-right: 6px; color: #475569;">&lt;</button>
                    <button style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 32px; height: 32px; font-size: 14px; cursor: pointer; color: #475569;">&gt;</button>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            wk_cols = st.columns(7)
            for i, wd in enumerate(["일", "월", "화", "수", "목", "금", "토"]):
                color = "#ef4444" if i == 0 else "#3b82f6" if i == 6 else "#64748b"
                wk_cols[i].markdown(f"<div style='text-align:center; font-weight:800; font-size:15px; color:{color}; padding-bottom:12px;'>{wd}</div>", unsafe_allow_html=True)
            
            weeks = [
                ["", "", "", "1", "2", "3", "4"],
                ["5", "6", "7", "8", "9", "10", "11"],
                ["12", "13", "14", "15", "16", "17", "18"],
                ["19", "20", "21", "22", "23", "24", "25"],
                ["26", "27", "28", "29", "30", "31", ""]
            ]
            
            for row in weeks:
                cols = st.columns(7)
                for i, day in enumerate(row):
                    with cols[i]:
                        if day:
                            is_today = (day == "24")
                            has_log = bool(st.session_state.diary_data.get(str(day), ""))
                            btn_label = f"{day}"
                            if has_log: btn_label += " 📝" 
                            elif is_today: btn_label += " 📍"
                            btn_type = "primary" if (has_log or is_today) else "secondary"
                            
                            if st.button(btn_label, key=f"day_{day}", type=btn_type, use_container_width=True):
                                if st.session_state.logged_in: write_diary(day)
                                else: st.warning("다이어리 작성은 로그인이 필요합니다.")
                        else:
                            st.markdown("<div style='height: 38px;'></div>", unsafe_allow_html=True)

    with chk_col:
        with st.container(border=True):
            has_diary_today = bool(st.session_state.diary_data.get("24", ""))
            st.markdown("""
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #f1f5f9;">
                <div style="font-size: 20px; font-weight: 800; color: #0f172a;">✅ 오늘의 할 일</div>
            </div>
            """, unsafe_allow_html=True)
            st.checkbox("안전교육 이수증 업로드", key="chk_1", on_change=sync_to_db, disabled=not st.session_state.logged_in)
            st.checkbox("PLC 제어 도면 해석 복습", key="chk_2", on_change=sync_to_db, disabled=not st.session_state.logged_in)
            st.checkbox("실습 다이어리 작성 (24일 📍)", value=has_diary_today, disabled=True)
            st.checkbox("설비보전기사 기출 1회 풀이", key="chk_4", on_change=sync_to_db, disabled=not st.session_state.logged_in)
            st.checkbox("이력서 자격증 항목 업데이트", key="chk_5", on_change=sync_to_db, disabled=not st.session_state.logged_in)
            if not st.session_state.logged_in:
                st.markdown("<div style='font-size: 13px; color: #ef4444; margin-top: 10px;'>※ 로그인 후 진행 상황을 저장할 수 있습니다.</div>", unsafe_allow_html=True)


    # 🌟 6. 성장 나무 섹션
    completed_count = sum([
        bool(st.session_state.chk_1), bool(st.session_state.chk_2), 
        bool(has_diary_today), bool(st.session_state.chk_4), bool(st.session_state.chk_5)
    ])
    progress_pct = int((completed_count / 5) * 100)
    tree_stages = {
        0: ("🌱", "씨앗을 심었어요! 시작해볼까요?", "#64748b", "다음: 새싹 🌿"),
        1: ("🌿", "새싹이 돋아났어요!", "#10b981", "다음: 성장하는 화분 🪴"),
        2: ("🪴", "무럭무럭 자라고 있어요!", "#059669", "다음: 튼튼한 나무 🌳"),
        3: ("🌳", "제법 나무의 모습을 갖췄어요!", "#047857", "다음: 꽃 피는 나무 🌸"),
        4: ("🌸", "예쁜 꽃이 피었어요! 조금만 더!", "#ec4899", "다음: 탐스러운 열매 🍎"),
        5: ("🍎", "탐스러운 열매가 열렸어요! (달성🎉)", "#ef4444", "완벽해요! 모든 미션을 완료했습니다 🏆")
    }
    emoji, text, color, next_step = tree_stages[completed_count]

    html_tree = f"""<div style="background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border-radius: 28px; padding: 50px 40px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02); text-align: center; margin-top: 60px; margin-bottom: 60px;">
<div style="font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 5px;">나의 커리어 성장 나무</div>
<div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 30px;">상단의 '✅ 오늘의 할 일' 체크리스트를 하나씩 달성할 때마다 나무가 성장해요!</div>
<div style="font-size: 80px; animation: floatTree 3s ease-in-out infinite;">{emoji}</div>
<div style="font-size: 22px; font-weight: 800; color: {color}; margin-top: 15px;">{text}</div>
<div style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 8px; background: #f8fafc; display: inline-block; padding: 6px 16px; border-radius: 50px;">{next_step}</div>
<div style="margin-top: 40px; max-width: 600px; margin-left: auto; margin-right: auto;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
<div style="font-size: 16px; font-weight: 700; color: #64748b;">오늘의 체크리스트 달성률</div>
<div style="font-size: 18px; font-weight: 800; color: #3bb2b8;">{completed_count} / 5</div>
</div>
<div style="width: 100%; background: #e2e8f0; height: 10px; border-radius: 10px; overflow: hidden;">
<div style="width: {progress_pct}%; background: linear-gradient(90deg, #3bb2b8, #7e57c2); height: 100%; transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);"></div>
</div>
</div>
</div>"""
    st.markdown(html_tree, unsafe_allow_html=True)

    # 🌟 7. 하단 JOB 섹션
    st.markdown("""
<div style="margin-bottom: 100px;">
<div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 20px;">주목받는 우수 실습 JOB</div>
<div class="ms-job-grid">
<div class="ms-job-card"><div class="job-card-title">[삼성전자] 2026년 하반기 DS부문 5급 신입사원 채용</div><div class="job-card-comp"><span>삼성전자(주)</span><span class="d-day">D-7</span></div><div class="job-tags"><span class="job-tag">신입·현장실습</span></div></div>
<div class="ms-job-card"><div class="job-card-title">2026 하반기 공개채용 [생산기술/보전 직무]</div><div class="job-card-comp"><span>현대자동차</span><span class="d-day">D-12</span></div><div class="job-tags"><span class="job-tag">신입 채용</span></div></div>
<div class="ms-job-card"><div class="job-card-title">(주)포스코 '26년 하반기 제철설비 현장 실습생 모집</div><div class="job-card-comp"><span>(주)포스코</span><span class="d-day">D-38</span></div><div class="job-tags"><span class="job-tag">실습 연계</span></div></div>
<div class="ms-job-card"><div class="job-card-title">[LG에너지솔루션] 배터리 생산/품질 관리 신입 채용</div><div class="job-card-comp"><span>LG에너지솔루션</span><span class="d-day">D-51</span></div><div class="job-tags"><span class="job-tag">품질관리</span></div></div>
</div>
</div>""", unsafe_allow_html=True)


# =========================================================
# [PAGE 3] 마이페이지 (프로필 설정)
# =========================================================
elif st.session_state.page == "profile":
    if not st.session_state.logged_in:
        navigate_to("login")
        st.stop()
        
    st.markdown("""
    <style>
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background: rgba(255, 255, 255, 0.9) !important; backdrop-filter: blur(16px) !important; border-radius: 24px !important; padding: 40px !important; border: 1px solid rgba(226, 232, 240, 0.8) !important; box-shadow: 0 10px 35px rgba(0, 0, 0, 0.02) !important;
    }
    .profile-title { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 20px; text-align: center; letter-spacing:-1px;}
    .profile-subtitle { font-size: 16px; color: #64748b; margin-bottom: 40px; text-align: center;}
    </style>
    """, unsafe_allow_html=True)
    
    st.markdown("<div style='margin-top: 80px;'></div>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1.5, 1])
    with col2:
        with st.container(border=True):
            st.markdown("<div class='profile-title'>👤 내 프로필 설정</div>", unsafe_allow_html=True)
            st.markdown("<div class='profile-subtitle'>나의 기본 정보와 커리어 성향을 기록해두세요!</div>", unsafe_allow_html=True)
            
            p_name = st.text_input("이름", value=st.session_state.profile.get("name", ""))
            p_school = st.text_input("학교 및 전공", value=st.session_state.profile.get("school", ""), placeholder="예: 한국마이스터고 자동화기계과")
            p_mbti = st.text_input("나의 MBTI", value=st.session_state.profile.get("mbti", ""), placeholder="예: ESTJ")
            p_holland = st.text_input("홀랜드 흥미 유형", value=st.session_state.profile.get("holland", ""), placeholder="예: 실재형(R) + 탐구형(I)")
            p_target = st.text_input("목표 직무 및 기업", value=st.session_state.profile.get("target", ""), placeholder="예: 삼성전자 설비 엔지니어")
            
            st.markdown("<div style='margin-top: 30px;'></div>", unsafe_allow_html=True)
            
            btn1, btn2 = st.columns([1, 1], gap="large")
            with btn1:
                if st.button("💾 정보 저장하기", type="primary", use_container_width=True):
                    st.session_state.profile["name"] = p_name
                    st.session_state.profile["school"] = p_school
                    st.session_state.profile["mbti"] = p_mbti
                    st.session_state.profile["holland"] = p_holland
                    st.session_state.profile["target"] = p_target
                    sync_to_db()
                    st.success("프로필이 성공적으로 저장되었습니다!")
            with btn2:
                if st.button("돌아가기", use_container_width=True):
                    navigate_to("main")

# =========================================================
# [PAGE 2] 서비스 소개 페이지 (홍보 랜딩)
# =========================================================
elif st.session_state.page == "intro":

    intro_css = """
<style>
.block-container { padding-top: 2rem; padding-bottom: 10rem; max-width: 1280px !important; margin: 0 auto !important; padding-left: 30px !important; padding-right: 30px !important; }
.speak-navbar-container { display: flex; justify-content: center; width: 100%; margin-bottom: 70px; }
.speak-navbar { display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); border-radius: 100px; padding: 14px 40px; width: 100%; max-width: 1280px; }
.nav-logo-text { font-size: 22px; font-weight: 800; background: linear-gradient(90deg, #0f172a, #334155); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-section-left { text-align: left; padding: 30px 0; }
.hero-title { font-size: 54px; font-weight: 800; margin: 0 0 24px 0; line-height: 1.2; letter-spacing: -2px; color: #0f172a; }
.hero-title span { background: linear-gradient(90deg, #3bb2b8, #7e57c2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
</style>
"""
    st.markdown(intro_css, unsafe_allow_html=True)

    nav_html = """
<div class="speak-navbar-container">
<div class="speak-navbar">
<div class="nav-left"><span class="nav-logo-text">MyStair</span></div>
<div class="nav-right"><span style="font-size:15px; font-weight:600; color:#475569;">서비스 소개</span></div>
</div>
</div>
"""
    st.markdown(nav_html, unsafe_allow_html=True)

    hero_col1, hero_col2 = st.columns([1.05, 0.95], gap="large")
    with hero_col1:
        st.markdown("""<div class="hero-section-left"><h1 class="hero-title">세상으로 나아가는<br><span>너의 첫 번째 계단</span></h1><p style="font-size:19px; color:#64748b;">실습 기록부터 AI 자소서까지, 꿈을 현실로 만드는 혁신적인 커리어 플랫폼</p></div>""", unsafe_allow_html=True)
        if st.button("포털 대시보드로 가기", type="primary"): navigate_to("main")
