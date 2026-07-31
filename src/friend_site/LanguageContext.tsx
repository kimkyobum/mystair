import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyOrKo: string, fallbackEn?: string) => string;
}

const koToEnMap: Record<string, string> = {
  // Navigation & General
  '마이스터고 지도': 'Meister High Map',
  '만든 사람들': 'Creators',
  '트래픽 리포트': 'Traffic Report',
  '설정': 'Settings',
  '로그인': 'Login',
  '회원가입': 'Sign Up',
  '로그아웃': 'Logout',
  '마이페이지': 'My Page',
  '나의 성장의 계단 & 진로 프로필': 'My Career Growth & Profile',
  '홈': 'Home',
  '성장다이어리': 'Growth Diary',
  '자격증 가이드': 'Certificate Guide',
  '나만의 기업찾기': 'Find My Company',
  '나만의 기업 찾기': 'Find My Company',
  'MBTI검사': 'MBTI Test',
  'MBTI 검사': 'MBTI Test',
  '홀랜드 진로적성 검사': 'Holland Career Test',
  '홀랜드 검사': 'Holland Test',

  // Promo / Landing (Dashboard)
  '내 손으로 만들어가는': 'Building with my own hands',
  '당신만의 멋진 계단': 'Your Own Amazing Stairs',
  '당신의 노력의 땀방울이 꿈을 이루는': 'Every drop of your effort will become',
  '가장 단단한 다리가 되어줄 거에요.': 'the solid bridge to achieve your dreams.',
  '무료로 시작하기': 'Start for Free',
  '왜 MyStair가 필요할까요?': 'Why do you need MyStair?',
  '마이스터고 학생들의 교육 및 취업 준비 과정에서 발생하는 핵심 고민들입니다.': 'Core challenges faced by vocational students during career & job preparation.',
  '목표 달성의 막막함': 'Uncertainty in Goal Achievement',
  '경험의 빠른 휘발': 'Rapid Loss of Experiences',
  '맞춤 소재 연결의 어려움': 'Difficulty Connecting Tailored Experiences',
  '커리어 코칭 계단, MyStair': 'Career Coaching Staircase, MyStair',
  '매일 쌓인 실습 기록을 지원 기업 맞춤형 자소서 소재로 정밀 추출해 드립니다.': 'We precisely extract your daily practice records into tailored cover letter topics for target companies.',
  '나의 맞춤 기업 찾기': 'Find My Tailored Company',
  '경험 기록 & 노력 일수 시각화': 'Record Experience & Visualize Effort Days',
  '나의 전공학과, 성향(MBTI/홀랜드), 성장 기록을 바탕으로 나에게 가장 잘 어울리는 꿈의 기업을 AI가 매칭해 줍니다.': 'AI matches the best dream company for you based on your major, personality (MBTI/Holland), and growth records.',
  '교내외 실습, 대회 경험을 기록하세요. 매일 기록할 때마다 캘린더에 완수 스탬프가 적재되어 성취감을 높입니다.': 'Record internal/external lab practice and competition experiences. A completion stamp is placed on your calendar every day.',
  '맞춤 추천 기업 탐색': 'Explore Recommended Companies',
  '실습 일지 기록': 'Record Practice Journal',
  '연속 달성 스탬프': 'Streak Achievement Stamps',
  '실시간 AI 커리어 코칭 상담': 'Real-time AI Career Coaching',
  '어디서나 간편하고 신속하게 나만의 AI 진로 상담사와 대화하며 취업 방향성을 정립하세요.': 'Easily and quickly consult with your own AI career advisor anytime to establish your employment direction.',
  '실시간 Q&A': 'Real-time Q&A',
  '대기업/공기업 맞춤 자소서 원클릭 가공': 'One-click Cover Letter Processing for Large/Public Corps',
  '캘린더와 다이어리에 적어둔 경험들이 지원서 문항별 입체적인 STAR 자소서 문장으로 자동 변환됩니다.': 'Experiences in your calendar & diary are automatically converted into 3D STAR cover letter sentences for application prompts.',
  'NCS 기반 자동 매칭': 'NCS-based Auto Matching',
  'AI 문장 가공': 'AI Sentence Processing',
  '자격증 & 진로 로드맵': 'Certificates & Career Roadmap',
  '직무별 필수 국가기술자격증과 시험 일정, 우대 기업 정보를 한눈에 파악하세요.': 'Check required national technical certifications, exam schedules, and preferred companies by job at a glance.',
  '우대 자격증 조회': 'View Preferred Certificates',
  '자주 묻는 질문 (FAQ)': 'Frequently Asked Questions (FAQ)',
  '서비스에 대해 가장 자주 문의하시는 질문들을 모았습니다.': 'We gathered the most frequently asked questions about our service.',

  // Top Banner
  '빛나는 기술인으로 성장하는 여정, MyStair가 당신의 든든한 날개가 되어줄게요': 'A journey to grow into a shining skilled professional, MyStair will be your strong wings',
  '마이스터고 학생들을 위한 맞춤형 진로 로드맵': 'Customized career roadmap for vocational high school students',
  'AI 컨설턴트와 함께하는 스마트한 취업 준비': 'Smart job preparation with an AI consultant',
  '나의 잠재력을 발견하고 내일의 명장으로 거듭나는 첫걸음': 'The first step to discover your potential and become tomorrow master',
  '자격증부터 취업까지, 당신만의 특별한 커리어 스토리': 'From certification to employment, your own special career story',
  '현업 전문가의 인사이트와 맞춤형 진로 추천': 'Industry expert insights and customized career recommendations',

  // ChatInput & Header
  '성장의 계단': 'Stairs of Growth',
  '나의 전공, 적성, 관심 분야에 맞는 기업을 검색하거나 추천받아보세요!': 'Search or get recommendations for companies matching your major, aptitude, and interest!',
  '나만의 기업찾기 (대기업/공기업 TOP 10)': 'Find My Company (Large/Public Corps TOP 10)',
  '대표 대기업 & 공기업 리스트': 'Top Large & Public Companies List',
  '성장기록 기반 우수 기업 매칭': 'Growth Record-Based Top Company Matching',
  '이전 대화 이어하기': 'Continue Previous Chat',

  // MyPage
  '전체 편집 모드입니다. 정보를 수정한 후 [전체 저장] 버튼을 눌러주세요.': 'You are in full edit mode. After modifying information, please click [Save All].',
  '저장 완료': 'Save Complete',
  '전체 저장': 'Save All',
  '기본 프로필 정보': 'Basic Profile Info',
  '기본 정보': 'Basic Info',
  '이름': 'Name',
  '학교': 'High School',
  '전공/학과': 'Major/Department',
  '목표 희망 기업': 'Target Companies',
  '나의 진로 적성 분석': 'My Career Aptitude Analysis',
  '수정': 'Edit',
  '완료': 'Done',
  '취소': 'Cancel',
  '희망 기업 추가': 'Add Target Company',
  '회사명을 입력하세요': 'Enter company name',
  '추가': 'Add',

  // Login
  '비밀번호를 입력하세요': 'Enter your password',
  '비밀번호': 'Password',
  '비밀번호 확인': 'Confirm Password',
  '새비밀번호입력': 'Enter new password',
  '가입하고 시작해보세요.': 'Sign up and get started.',
  '이메일을 입력하고 시작하세요.': 'Enter your email to get started.',
  '이메일': 'Email',
  '다음으로': 'Let\'s go',
  '처리 중...': 'Processing...',
  '계정이 없으신가요?': 'Don\'t have an account?',
  '이미 계정이 있으신가요?': 'Already have an account?',
  '돌아가기': 'Back',
  '유효한 이메일을 입력해주세요.': 'Please enter a valid email.',
  '비밀번호를 입력해주세요.': 'Please enter your password.',
  '이메일 또는 비밀번호가 올바르지 않습니다.': 'Invalid email or password.',
  '로그인 중 오류가 발생했습니다.': 'An error occurred during login.',
  '8글자 이상이여야 합니다': 'Must be at least 8 characters.',
  '비밀번호가 일치하지 않습니다': 'Passwords do not match.',
  '이미 가입된 이메일입니다.': 'This email is already registered.',
  '회원가입이 완료되었습니다. 로그인해주세요.': 'Registration complete. Please log in.',

  // Company Search page
  '나에게 꼭 맞는 기업 찾기': 'Find the Right Company for You',
  '전공과 진로 적성을 분석하여 AI가 추천하는 기업 리스트입니다': 'List of companies recommended by AI analyzing your major and career aptitude',
  '나의 매칭 추천 기업 (TOP 10)': 'My Top Matched Companies (TOP 10)',
  '대기업 TOP 10': 'Large Corps TOP 10',
  '공기업 TOP 10': 'Public Corps TOP 10',
  '추천 대기업 TOP 10': 'Recommended Large Corps TOP 10',
  '추천 공기업 TOP 10': 'Recommended Public Corps TOP 10',
  '내 성향과 전공에 맞춘 가장 적합한 대기업 리스트입니다.': 'Top matched large companies tailored to your major & aptitude.',
  '내 성향과 전공에 맞춘 가장 적합한 공기업/공공기관 리스트입니다.': 'Top matched public companies/agencies tailored to your major & aptitude.',
  '나머지 기업 찾기': 'Find Other Companies',
  '전체 기업': 'All Companies',
  '기업명을 검색하세요': 'Search company name...',
  '검색 조건에 일치하는 기업이 없습니다.': 'No companies match your search query.',
  '기업 정보': 'Company Information',
  '기업 상세 정보': 'Company Details',
  '주요 사업 분야': 'Key Business Sector',
  '기업 규모': 'Company Size',
  '대기업': 'Large Corp',
  '공기업': 'Public Corp',
  '닫기': 'Close',

  // Certificates page
  '자격증 NAVI': 'Certificate NAVI',
  '우리가 원하는 자격증을 한눈에!': 'Check Target Certifications at a Glance!',
  '마이스터고 자격증 정밀 검색': 'Vocational High Certificate Search',
  '자격증명, 전공 분야, 가산점 적용 기업(삼성, 한전, 코레일 등)을 입력해보세요.': 'Search by certificate name, major, or preferred companies (Samsung, KEPCO, Korail, etc.).',
  '자격증명, 우대기업, 카테고리 검색...': 'Search certificate, preferred company, category...',
  '전체보기': 'View All',
  '전기/전자/에너지': 'Electrical/Electronics/Energy',
  '기계/메카/모빌리티': 'Mechanical/Mechatronics/Mobility',
  '화학/바이오/환경': 'Chemical/Bio/Environment',
  'IT/소프트웨어/OA': 'IT/Software/OA',
  '건설/중장비/안전': 'Construction/Heavy Machinery/Safety',
  '공통/어학/사무': 'General/Language/Office',
  '자격증 데이터를 불러오는 중입니다...': 'Loading certification data...',
  '⚠️ \'Data/certificates.json\' 데이터를 불러올 수 없습니다.': '⚠️ Unable to load certification data.',
  '🔍 검색 조건과 일치하는 자격증이 없습니다.': '🔍 No certificates match your search criteria.',
  '평균 합격률': 'Avg. Pass Rate',
  '실기 응시료': 'Practical Exam Fee',
  '필기 응시료': 'Written Exam Fee',
  '자세히 보기 & 접수하기 ➔': 'View Details & Apply ➔',
  '📝 자격증 개요': '📝 Overview',
  '📋 응시 자격 조건': '📋 Eligibility Criteria',
  '⭐ 난이도': '⭐ Difficulty',
  '📊 평균 합격률': '📊 Avg. Pass Rate',
  '💰 필기 응시료': '💰 Written Exam Fee',
  '🛠️ 실기 응시료': '🛠️ Practical Exam Fee',
  '🏢 우대 및 가산점 반영 기업': '🏢 Preferred & Bonus Point Companies',
  '🔗 연계 / 관련 자격증': '🔗 Related Certifications',
  '👉 공식 접수 사이트 바로가기': '👉 Go to Official Application Site',
  '마이스터고 추천 자격증 가이드': 'Recommended Certificates Guide',
  '전공 분야별 핵심 자격증 정보와 취득 로드맵을 확인하세요': 'Check core certification info and roadmap by major field',
  '전체 전공': 'All Majors',
  '자격증 상세 정보': 'Certificate Details',
  '시험 일정': 'Exam Schedule',
  '우대 기업': 'Preferred Companies',

  // MBTI & Holland pages
  '마이스터고 학생을 위한 MBTI 성격유형 검사': 'MBTI Personality Test for Vocational High Students',
  'MBTI 성격 유형 검사': 'MBTI Personality Type Test',
  '32가지 MBTI': '32 MBTI',
  '32가지 MBTI 진로 적성 검사': '32 MBTI Career Aptitude Test',
  '32가지 MBTI\n진로 적성 검사': '32 MBTI Career Aptitude Test',
  '전국 마이스터고 맞춤형 MBTI 진로 적성 검사': 'Tailored MBTI Career Test for Vocational High Students',
  '나의 성격 유형(E/I, S/N, T/F, J/P)과 자아 지표(A/T)를 정밀 분석하여 나에게 꼭 맞는 맞춤형 직무를 추천해 드립니다.': 'Analyze your personality type (E/I, S/N, T/F, J/P) and self-indicator (A/T) to recommend tailored job roles.',
  '나의 성격 유형(E/I, S/N, T/F, J/P)과 자아 지표(A/T)를 정밀 분석하여\n나에게 꼭 맞는 맞춤형 직무를 추천해 드립니다.': 'Analyze your personality type (E/I, S/N, T/F, J/P) and self-indicator (A/T) to recommend tailored job roles.',
  '⏱ 소요시간 약 7분': '⏱ Approx. 7 mins',
  '소요시간 약 7분': 'Approx. 7 mins',
  '📝 총 60문항': '📝 60 Questions Total',
  '총 60문항': '60 Questions Total',
  '🎯 32가지 정밀 성격 분석': '🎯 32 Detailed Personality Analyses',
  '32가지 정밀 성격 분석': '32 Detailed Personality Analyses',
  '검사 시작하기': 'Start Test',
  '문항': 'Question',
  '1. 전혀 그렇지 않다': '1. Strongly Disagree',
  '2. 그렇지 않은 편이다': '2. Disagree',
  '3. 보통이다': '3. Neutral',
  '4. 그런 편이다': '4. Agree',
  '5. 매우 그렇다': '5. Strongly Agree',
  '전혀 그렇지 않다': 'Strongly Disagree',
  '그렇지 않은 편이다': 'Disagree',
  '보통이다': 'Neutral',
  '그런 편이다': 'Agree',
  '매우 그렇다': 'Strongly Agree',
  '← 이전 문항': '← Previous Question',
  '진로 적성 진단 결과': 'Career Aptitude Diagnosis Result',
  '선호도': 'Preference',
  '선호도 비율': 'Preference Ratio',
  '외향형 (E)': 'Extraversion (E)',
  '내향형 (I)': 'Introversion (I)',
  '직관형 (N)': 'Intuition (N)',
  '감각형 (S)': 'Sensing (S)',
  '사고형 (T)': 'Thinking (T)',
  '감정형 (F)': 'Feeling (F)',
  '판단형 (J)': 'Judging (J)',
  '인식형 (P)': 'Perceiving (P)',
  '자기확신형 (-A)': 'Assertive (-A)',
  '신중형 (-T)': 'Turbulent (-T)',
  '💡 성격 핵심 특성': '💡 Key Personality Traits',
  '🎯 추천 적성 직무 및 분야': '🎯 Recommended Aptitude Jobs & Fields',
  '👤 마이페이지로 이동하여 결과 확인하기': '👤 Go to My Page to Check Results',
  '📋 검사 결과 복사하기': '📋 Copy Test Results',
  '🔄 다시 검사하기': '🔄 Retest',
  '🏠 메인으로 돌아가기': '🏠 Return to Home',
  '검사 결과가 클립보드에 복사되었습니다!': 'Test results copied to clipboard!',
  '나의 성향과 어울리는 마이스터고 전공 및 직무를 알아봅니다.': 'Discover majors and jobs matching your personality.',

  // Holland Page
  'Holland\n직업적성검사': 'Holland Career Aptitude Test',
  'Holland 직업적성검사': 'Holland Career Aptitude Test',
  '전국 마이스터고 맞춤형 직업적성검사': 'Tailored Holland Career Test for Vocational High Students',
  '나의 흥미와 적성 유형(RIASEC)을 분석하여\n나에게 꼭 맞는 직업군과 직무를 추천해 드립니다.': 'Analyze your interest & aptitude type (RIASEC) to recommend tailored job fields.',
  '나의 흥미와 적성 유형(RIASEC)을 분석하여 나에게 꼭 맞는 직업군과 직무를 추천해 드립니다.': 'Analyze your interest & aptitude type (RIASEC) to recommend tailored job fields.',
  '🎯 6가지 흥미 유형 진단': '🎯 6 Interest Types Diagnosis',
  '6가지 흥미 유형 진단': '6 Interest Types Diagnosis',
  'Holland 진로 진단 결과': 'Holland Career Diagnosis Result',
  '적합도': 'Suitability',
  '💡 1순위: ': '💡 1st Priority: ',
  '💡 2순위: ': '💡 2nd Priority: ',
  '🎯 추천 맞춤 직무': '🎯 Recommended Custom Jobs',
  '홀랜드 진로 적성 검사': 'Holland Career Aptitude Test',
  '나의 진로 적성 코드 (RIASEC) 분석': 'Analyze My Career Aptitude Code (RIASEC)',

  // Growth Diary page
  '성장 다이어리': 'Growth Diary',
  '시험 일정 설정': 'Exam Schedule Settings',
  '달력 보기': 'Calendar View',
  '자소서 요약': 'Resume Summary',
  '1·2학기 중간 / 기말고사 시험 일정 설정': '1st & 2nd Semester Midterm/Final Exam Schedule Settings',
  '시험 기간을 설정하시면 성장 다이어리 달력에 📝 시험 그림 아이콘이 자동으로 표시됩니다.': 'When you set exam dates, 📝 exam icons will automatically appear on your Growth Diary calendar.',
  '📝 1학기 중간고사': '📝 1st Semester Midterm Exam',
  '💯 1학기 기말고사': '💯 1st Semester Final Exam',
  '📝 2학기 중간고사': '📝 2nd Semester Midterm Exam',
  '🎓 2학기 기말고사': '🎓 2nd Semester Final Exam',
  '1학기 중간고사': '1st Semester Midterm Exam',
  '1학기 기말고사': '1st Semester Final Exam',
  '2학기 중간고사': '2nd Semester Midterm Exam',
  '2학기 기말고사': '2nd Semester Final Exam',
  '일정 모두 비우기': 'Clear All Schedules',
  '샘플 일정 채우기': 'Fill Sample Schedule',
  '시험 일정 저장': 'Save Exam Schedule',
  '일기 쓰기': 'Write Diary',
  '+ 일기 쓰기': '+ Write Diary',
  '이전 달': 'Previous Month',
  '다음 달': 'Next Month',
  '성장 다이어리 작성': 'Create Growth Diary Entry',
  '성장 다이어리 수정': 'Edit Growth Diary Entry',
  '날짜 선택': 'Select Date',
  '오늘의 기분 / 태그': 'Today\'s Mood / Tags',
  '열정적': 'Passionate',
  '성취감': 'Accomplished',
  '깨달음': 'Enlightened',
  '성장중': 'Growing',
  '평온함': 'Peaceful',
  '제목': 'Title',
  '다이어리 제목을 입력하세요...': 'Enter diary title...',
  '태그 (엔터로 추가)': 'Tags (press enter to add)',
  '내용': 'Content',
  '오늘의 실습, 공부, 성취 경험이나 느낀 점을 자유롭게 적어보세요...': 'Feel free to write today\'s lab practice, study, achievements, or reflections...',
  '삭제': 'Delete',
  '저장하기': 'Save',
  'AI 자소서 경험 요약 (STAR 공법 분석)': 'AI Resume Experience Summary (STAR Analysis)',
  '다이어리 기록을 분석하여 자소서 소재를 추출하고 있습니다...': 'Analyzing diary records to extract resume materials...',
  '각 경험을 탭과 타임라인 날짜별 STAR 공법으로 완벽히 분류 중입니다.': 'Classifying each experience with STAR method by tabs and dates.',
  '자격증 노력': 'Certification Efforts',
  '대내외 활동': 'Activities',
  '수상 및 성과': 'Awards & Achievements',
  '기타 성장경험': 'Other Growth Experiences',
  'Situation (상황 배경)': 'Situation (Background Context)',
  'Task (목표와 과제)': 'Task (Goals & Challenges)',
  'Action (내가 취한 구체적 행동)': 'Action (Specific Actions Taken)',
  'Result (최종 성과 및 내적 성장)': 'Result (Outcomes & Internal Growth)',
  '추출된 경험이 아직 없습니다': 'No extracted experiences yet',
  '해당 카테고리(자격증, 대내외활동 등) 관련 키워드가 다이어리나 프로필에 충분하지 않은 것 같아요. 일기에 관련 내용(시험, 실습, 성과, 대회 등)을 더 자세히 기록하면 AI가 정확히 분류해서 보여줍니다!': 'It seems keywords related to this category are insufficient in your diary or profile. Write more detailed entries to get automatic AI extraction!',
  '마이스터고 성장 다이어리': 'Vocational Growth Diary',
  '나의 하루 실습, 공부, 성장의 흔적을 기록하고 되돌아보세요': 'Record and reflect on your daily practice, study, and growth',
  '새 다이어리 작성': 'Write New Diary Entry',
  '제목을 입력하세요': 'Enter title',
  '오늘의 실습 내용과 깨달은 점을 작성해 보세요': 'Write about today\'s practice and insights',
  '작성 완료': 'Complete Entry',
  '오늘의 완수 스탬프': 'Today\'s Completion Stamp',
  '기록이 없습니다. 첫 번째 다이어리를 작성해 보세요!': 'No records found. Write your first diary entry!',

  // Creators Page
  '메인으로 돌아가기': 'Return to Home',
  'Mystair를 만든 사람들': 'The People Who Created MyStair',
  '전국 마이스터고 및 특성화고 학생들의 더 높은 꿈과 내일을 응원하며': 'Cheering for the higher dreams and tomorrow of vocational high school students nationwide,',
  '더 직관적이고 완성도 높은 취업·진로 솔루션을 만들기 위해 기획하고 개발한 팀입니다.': 'a team that planned and developed an intuitive and complete employment & career solution.',
  '전국 마이스터고 및 특성화고 학생들의 더 높은 꿈과 내일을 응원하며 더 직관적이고 완성도 높은 취업·진로 솔루션을 만들기 위해 기획하고 개발한 팀입니다.': 'A team dedicated to creating an intuitive and complete career & employment platform for vocational students nationwide.',
  '마이스터고 커리큘럼 및 진로 데이터 분석, AI 프롬프트 엔지니어링 및 전체 웹 플랫폼 총괄 개발.': 'Curriculum & career data analysis, AI prompt engineering, and full platform development.',
  '학생들이 부담 없이 쉽게 마이페이지, 성장 일기, MBTI 및 홀랜드 검사를 이용할 수 있는 다크 글래스모피즘 인터페이스 설계.': 'Designed dark glassmorphism interface for easy access to My Page, Growth Diary, MBTI & Holland tests.',
  '전국 마이스터고 위치 데이터, 전공별 필수 자격증 추천 정보, 주요 대기업/공기업 가이드라인 수집 및 검증.': 'Location data of vocational schools, recommended certifications, and major company guidelines research.',
};

const translations = {
  ko: {
    'nav.map': '마이스터고 지도',
    'nav.creators': '만든 사람들',
    'nav.traffic': '트래픽 리포트',
    'nav.settings': '설정',
    'nav.login': '로그인',
    'dashboard.welcome': '환영합니다',
    'login.title.signup': '회원가입',
    'login.title.login': '환영합니다',
    'login.subtitle.signup': '가입하고 시작해보세요.',
    'login.subtitle.login': '이메일을 입력하고 시작하세요.',
    'login.email': '이메일',
    'login.password': '비밀번호',
    'login.password.confirm': '비밀번호 확인',
    'login.password.enter': '비밀번호를 입력하세요',
    'login.button.signup': '회원가입',
    'login.button.login': '로그인',
    'login.button.processing': '처리 중...',
    'login.button.letsgo': '다음으로',
    'login.no_account': '계정이 없으신가요?',
    'login.has_account': '이미 계정이 있으신가요?',
    'login.back': '돌아가기',
    'login.placeholder.email': 'you@example.com',
    'login.placeholder.password.create': '비밀번호 생성',
    'login.placeholder.password.confirm': '비밀번호 확인',
    'login.placeholder.password.enter': '비밀번호 입력',
    'login.password.for': '비밀번호',
    'login.error.email': '유효한 이메일을 입력해주세요.',
  },
  en: {
    'nav.map': 'Meister High School Map',
    'nav.creators': 'Creators',
    'nav.traffic': 'Traffic Report',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'dashboard.welcome': 'Welcome',
    'login.title.signup': 'Create an account',
    'login.title.login': 'Welcome',
    'login.subtitle.signup': 'Join us and get started.',
    'login.subtitle.login': 'Enter your email to get started.',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.password.confirm': 'Confirm Password',
    'login.password.enter': 'Enter your password',
    'login.button.signup': 'Sign up',
    'login.button.login': 'Log in',
    'login.button.processing': 'Processing...',
    'login.button.letsgo': 'Let\'s go',
    'login.no_account': 'Don\'t have an account?',
    'login.has_account': 'Already have an account?',
    'login.back': 'Back',
    'login.placeholder.email': 'you@example.com',
    'login.placeholder.password.create': 'Create a password',
    'login.placeholder.password.confirm': 'Confirm your password',
    'login.placeholder.password.enter': 'Enter your password',
    'login.password.for': 'Password for',
    'login.error.email': 'Please enter a valid email',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ko') ? saved : 'ko';
  });

  useEffect(() => {
    const handleLangChange = () => {
      const saved = localStorage.getItem('language');
      if (saved === 'en' || saved === 'ko') {
        setLanguageState(saved);
      }
    };
    window.addEventListener('languageChanged', handleLangChange);
    window.addEventListener('storage', handleLangChange);
    return () => {
      window.removeEventListener('languageChanged', handleLangChange);
      window.removeEventListener('storage', handleLangChange);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = (keyOrKo: string, fallbackEn?: string): string => {
    if (!keyOrKo) return '';
    if (language === 'ko') {
      if ((translations.ko as any)[keyOrKo]) {
        return (translations.ko as any)[keyOrKo];
      }
      return keyOrKo;
    }
    // English mode
    if ((translations.en as any)[keyOrKo]) {
      return (translations.en as any)[keyOrKo];
    }
    if (fallbackEn) {
      return fallbackEn;
    }
    if (koToEnMap[keyOrKo]) {
      return koToEnMap[keyOrKo];
    }
    return keyOrKo;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
