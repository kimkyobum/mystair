import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp, Sparkles, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Check, RefreshCw, Trash2, MessageSquare, ArrowRight, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { useChat, Message } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function ChatInterface() {
  const { language, t } = useLanguage();
  const { isLightMode } = useTheme();
  const { userProfile: firestoreProfile, fetchDiaries, saveDiary, user } = useAuth();
  const {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    initialMessage,
    clearChat
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const initialSentRef = useRef(false);

  // Initial call on mount
  useEffect(() => {
    if (initialMessage && !initialSentRef.current && messages.length === 0) {
      initialSentRef.current = true;
      const initialMsg: Message = { id: '1', role: 'user', content: initialMessage };
      setMessages([initialMsg]);
      sendMessageToAI(initialMessage, []);
    }
  }, [initialMessage]);

  const getCombinedProfileData = () => {
    let profile = {
      name: firestoreProfile?.name || '',
      highSchool: firestoreProfile?.highSchool || '',
      major: firestoreProfile?.major || '',
      mbti: firestoreProfile?.mbti || '',
      hollandCode: firestoreProfile?.hollandCode || '',
      targetCompanies: firestoreProfile?.targetCompanies || []
    };

    try {
      const savedMyPage = localStorage.getItem('mystair_mypage_data');
      if (savedMyPage) {
        const parsed = JSON.parse(savedMyPage);
        if (parsed.name) profile.name = parsed.name;
        if (parsed.highSchool) profile.highSchool = parsed.highSchool;
        if (parsed.major) profile.major = parsed.major;
        if (parsed.mbti) profile.mbti = parsed.mbti;
        if (parsed.hollandCode) profile.hollandCode = parsed.hollandCode;
        if (parsed.targetCompanies && Array.isArray(parsed.targetCompanies)) profile.targetCompanies = parsed.targetCompanies;
      }
    } catch (e) {
      console.error('Error parsing local mypage data:', e);
    }

    try {
      const currentUid = firestoreProfile?.uid || user?.uid || 'local-user';
      const savedLocal = localStorage.getItem(`mystair_local_user_profile_${currentUid}`);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (!profile.name && parsed.name) profile.name = parsed.name;
        if (!profile.highSchool && parsed.highSchool) profile.highSchool = parsed.highSchool;
        if (!profile.major && parsed.major) profile.major = parsed.major;
        if (!profile.mbti && parsed.mbti) profile.mbti = parsed.mbti;
        if (!profile.hollandCode && parsed.hollandCode) profile.hollandCode = parsed.hollandCode;
        if ((!profile.targetCompanies || profile.targetCompanies.length === 0) && Array.isArray(parsed.targetCompanies)) {
          profile.targetCompanies = parsed.targetCompanies;
        }
      }
    } catch (e) {
      console.error('Error parsing local user profile:', e);
    }

    return profile;
  };

  const getCombinedDiariesData = async () => {
    let diariesList: any[] = [];
    try {
      const dbDiaries = await fetchDiaries();
      if (dbDiaries && dbDiaries.length > 0) {
        diariesList = dbDiaries;
      }
    } catch (e) {
      console.error('Error fetching db diaries:', e);
    }

    if (diariesList.length === 0) {
      try {
        const currentUid = firestoreProfile?.uid || user?.uid || 'local-user';
        const savedDiaries = localStorage.getItem(`mystair_local_diaries_${currentUid}`) || localStorage.getItem('mystair_diaries');
        if (savedDiaries) {
          diariesList = JSON.parse(savedDiaries);
        }
      } catch (e) {
        console.error('Error parsing local diaries:', e);
      }
    }
    return diariesList;
  };

  const generateClientGemini = async (text: string, profile: any, diaries: any, historyMessages: Message[] = []) => {
    const keys = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY2,
      import.meta.env.VITE_GEMINI_API_KEY3,
      import.meta.env.VITE_GEMINI_API_KEY4,
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY2 : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY3 : ''),
      (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY4 : '')
    ].filter((key): key is string => {
      if (!key) return false;
      const trimmed = key.trim();
      const lower = trimmed.toLowerCase();
      return trimmed !== "" && 
             lower !== "my_gemini_api_key" && 
             lower !== "your_api_key" && 
             lower !== "your_gemini_api_key" && 
             lower !== "null" && 
             lower !== "undefined" &&
             lower !== "placeholder";
    });

    if (keys.length === 0) {
      throw new Error('Vercel/Render 환경변수 설정에서 VITE_GEMINI_API_KEY 또는 GEMINI_API_KEY를 올바르게 설정해주셔야 AI 응답이 가능합니다.');
    }

    const profileText = profile
      ? `
[사용자 프로필 데이터]
- 이름: ${profile.name || "미입력"}
- 학교 및 전공: ${profile.highSchool || "미입력"} / ${profile.major || "미입력"}
- MBTI 성격유형: ${profile.mbti || "미진단 (MBTI 미입력)"}
- 홀랜드 진로적성: ${profile.hollandCode || "미진단 (홀랜드 코드 미입력)"}
- 희망/관심 기업: ${
          Array.isArray(profile.targetCompanies) && profile.targetCompanies.length > 0
            ? profile.targetCompanies.join(", ")
            : "미선택 (희망 기업 미지정)"
        }
`
      : "[사용자 프로필 미입력 - 마이페이지 미작성 상태]";

    const diariesText =
      Array.isArray(diaries) && diaries.length > 0
        ? `
[사용자가 작성한 성장 다이어리 데이터 (${diaries.length}건)]
${diaries
  .slice(0, 10)
  .map(
    (d: any, i: number) => `
[다이어리 #${i + 1}]
- 작성일: ${d.date || "날짜미상"}
- 제목: ${d.title || "제목없음"}
- 태그: ${Array.isArray(d.tags) ? d.tags.join(", ") : "없음"}
- 기분/상태: ${d.mood || "보통"}
- 기록 내용:
${d.content || ""}
`
  )
  .join("\n-------------------\n")}
`
        : "[성장 다이어리 기록 없음]";

    // Helper for accurate Korea Standard Time (KST, UTC+9) date & time calculations
    const getKoreaDateTimeInfo = () => {
      const now = new Date();
      
      const fullFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const isoFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const parts = isoFormatter.formatToParts(now);
      const year = parts.find(p => p.type === 'year')?.value || String(now.getFullYear());
      const month = parts.find(p => p.type === 'month')?.value || String(now.getMonth() + 1).padStart(2, '0');
      const day = parts.find(p => p.type === 'day')?.value || String(now.getDate()).padStart(2, '0');
      
      const currentDateISO = `${year}-${month}-${day}`;
      const currentDateString = fullFormatter.format(now);
      const currentTimeString = timeFormatter.format(now);
      
      const enFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      const currentDateEn = enFormatter.format(now);

      return { currentDateISO, currentDateString, currentTimeString, currentDateEn, year, month, day };
    };

    const { currentDateISO, currentDateString, currentTimeString, currentDateEn } = getKoreaDateTimeInfo();

    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
[현재 실시간 시스템 날짜 및 시간 정보 (절대적 기준)]
- 오늘 날짜(한국어): ${currentDateString}
- 오늘 날짜(YYYY-MM-DD): ${currentDateISO}
- 현재 시각: ${currentTimeString} (한국 표준시 KST 기준)
- 오늘 날짜(영문): ${currentDateEn}

[💡 오늘 날짜 / 요일 / 시간 질문에 대한 답변 지침 (필수 준수!)]
- 사용자가 "오늘 몇 일이야?", "오늘 며칠이야?", "오늘 몇칠인지 알아?", "오늘 날짜 알려줘", "오늘 무슨 요일이야?", "지금 몇 년도야?", "오늘 날짜가 어떻게 돼?", "today's date" 등 오늘 날짜나 요일, 시각에 대해 질문하는 경우:
  - 반드시 위의 실시간 오늘 날짜(${currentDateString}, ${currentDateISO})를 기준으로 정확하고 명쾌하게 알려줘라!
  - 예시 답변: "오늘은 **${currentDateString}**입니다! 📅 활기차고 뜻깊은 하루 보내세요!"
  - 절대로 날짜를 모른다고 하거나 엉뚱한 과거/미래 날짜를 지어내지 마라!

- 사용자가 '오늘' 다이어리/일기를 작성해달라고 하면, 무조건 이 오늘 날짜(${currentDateISO})를 다이어리의 date 필드로 사용해라. 사용자가 기존에 같은 날짜의 일기를 이미 작성했더라도, 추가 일기 작성 요청이라면 똑같이 이 오늘 날짜(${currentDateISO})를 사용하여 여러 개를 추가할 수 있게 해라. 절대로 과거 날짜나 임의의 미래 날짜를 지어내지 마라!

사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.

[중요: 사용자의 프로필 미입력/미진단 상태 처리 지침]
- 사용자의 MBTI, 홀랜드 적성검사, 전공, 학교 등이 '미진단' 또는 '미입력'으로 되어 있다면, 이전 데이터나 기본값을 임의로 지어내며 MBTI(예: ISTJ 등)나 적성 코드가 원래 적혀있었다고 아는 척하지 마라.
- 만약 사용자가 "나 MBTI/홀랜드 안 적어놨는데 뭐야?", "마이페이지 안 적었는데 알고 있네?" 하고 묻는다면:
  "아 미안해! 사용자님의 마이페이지 프로필이 아직 작성되지 않은 미진단/미입력 상태네요! 😅 마이페이지에서 MBTI와 진로 적성검사, 전공을 입력해 주시면 딱 맞는 기업과 자격증을 추천해 드릴게요!" 하고 아는 척했던 오류를 정정하고 솔직하며 친절하게 대답해줘.

[오늘의 성장 다이어리 작성 및 스마트 하위 질문 기능 (절대적 준수 규칙)]
- 🚫 **일반 대화, 단순 질문, 진로/자격증 상담 시 다이어리 저장 및 하위질문 절대 금지 (최우선 원칙!)**:
  사용자가 단순 질문(자격증, 취업, 기업 정보, 학과 생활, 날씨 등), 일반 대화, 안부, 고민 상담, 기업 추천 등을 한 경우, **절대로 성장 다이어리 양식으로 작성하거나 [[DIARY_SAVE:...]] 마커를 출력하지 마라!** 질문 의도에 맞춰 일반적이고 전문적인 진로/취업 상담 답변만 제공해라.

- 🎯 **성장 다이어리 인터랙션이 시작되는 조건 (오직 아래 조건 중 하나에 해당할 때만 시작!)**:
  1) 사용자가 다이어리 작성을 명시했을 때:
     - "오늘의 다이어리에 넣어줘", "다이어리에 넣어줘", "다이어리에 적어줘", "다이어리에 써줘", "다이어리에 저장해줘", "다이어리에 기록해줘", "다이어리에 추가해줘", "오늘의 다이어리 작성", "오늘의 다이어리 작성해줘", "오늘의 다이어리 써줘", "오늘 다이어리 작성" 등
  2) 사용자가 오늘의 경험/활동임을 명시했을 때:
     - "나 오늘의 경험이나 활동이야: ...", "오늘의 경험이나 활동이야", "나 오늘 활동이야", "오늘 활동이야", "오늘의 경험이야", "나 오늘의 경험이야" 등
  3) 사용자가 오늘 한 일임을 명시했을 때:
     - "오늘 한거야", "오늘 한 거야", "오늘 한 일이야", "나 오늘 한 거야: ..." 등
  4) 이전 대화에서 AI가 다이어리 작성 안내 또는 하위 질문을 하여 사용자가 그에 대해 답변하고 있을 때.

  ⚠️ 위 4가지 조건 중 어느 것에도 해당하지 않는 일반 대화, 단순 질문, 상담 등에서는 절대로 다이어리를 작성하거나 저장하지 않는다.

- 🛡️ **[AI 대필 방지 및 사실 기반 작성 원칙 (최우선 철칙 - 반드시 준수!)]**:
  1. **절대 없는 경험이나 스펙을 '더 있어 보이게' 지어내지 마라!**:
     - 실제 많은 기업들이 **'자기소개서 AI 사용 불가' 및 표절/대필 엄격 검증**을 시행하고 있습니다.
     - AI가 허위 사실이나 없는 경험, 가상의 갈등 해결, 조작된 수치나 기술 스택을 멋대로 지어내면 학생에게 심각한 불이익이 발생합니다.
     - **AI는 학생을 대신해 소설을 쓰는 창작자가 아니라, 단지 학생의 실제 경험을 기록하도록 돕는 '보조 도구'여야 합니다.**
  2. **AI의 유일한 역할은 '사용자가 대답한 실제 내용을 매끄럽게 이어붙이기'**:
     - AI가 창작해서 살을 붙이는 비중을 철저히 배제해라!
     - 사용자가 처음에 말한 경험 내용과, 하위 질문에 대해 **사용자가 실제로 답변한 내용만을 사실 그대로(Fact-only)** 유기적으로 연결하고 비문·오탈자만 자연스럽게 교정해라.
     - 사용자가 말하지 않은 내용은 절대 추가하지 말고, 짧더라도 학생의 실제 답변 범위 내에서 솔직하고 담백하게 1인칭 일기로 완성해라.

- 💬 **2단계 스마트 다이어리 작성 프로세스**:

  ⭐ **[1단계: 스마트 하위 질문 (누구나 쉽게 답변할 수 있는 직관적인 질문 딱 1~2개)]**:
  - 사용자가 위 조건과 함께 오늘 있었던 경험을 전달했을 때, 즉시 성급하게 다이어리를 저장하지 마라!
  - MyStair로서 학생의 성취나 노력에 따뜻한 축하/공감(1줄)을 먼저 전해라.
  - 그런 다음, **학생이 부담 없이 편하게 툭 대답할 수 있는 '아주 쉬운 질문 1~2개'만** 제시해라!
  - ⚠️ **질문 난이도 규칙 (학생 눈높이에 맞춘 쉽고 명확한 일상적 질문)**:
    - ❌ 거창하거나 딱딱한 질문 금지: "갈등 해결 및 문제 해결 방안", "NCS 직무 역량 지표", "기술적 기여도" 같은 어려운 질문은 절대로 하지 마라!
    - ⭕ **답변하기 쉬우면서도 다이어리에 핵심 뼈대를 완벽히 담아낼 수 있는 질문 2개**:
      - **Q1 (내가 직접 한 일)**: **Q1. 오늘 어떤 작업이나 역할을 직접 해보셨나요? 한 가지만 편하게 말씀해 주세요!**
      - **Q2 (느낀 점/기억에 남는 점)**: **Q2. 하면서 가장 뿌듯했거나 기억에 남는 점(혹은 새로 알게 된 점)이 있나요?**
  - 🎨 **질문 시각적 강조 규칙 (반드시 가장 두꺼운 볼드체로 눈에 확 띄게 출력!)**:
    - 질문 텍스트는 질문임을 즉시 인지할 수 있도록 반드시 **Q1. 질문 내용**, **Q2. 질문 내용** 처럼 번호와 함께 **가장 두꺼운 굵은 폰트(**...**)**로 줄바꿈하여 작성해라.
  - ⚠️ **1단계 안내 문구**:
    - 질문 바로 아래에 "(편하게 한두 줄로 간단히 말씀해 주셔도, 학생님이 직접 하신 실제 경험을 바탕으로 사실 그대로 깔끔한 성장 다이어리로 완성해 드릴게요! 🌿)"라고 따뜻하게 안내한다.
    - **1단계 하위 질문 턴에서는 절대로 [[DIARY_SAVE:...]] 마커를 출력하지 마라!**
    - 예외: 사용자가 첫 메시지에서 이미 역할, 과정, 배운 점까지 모두 명시했거나 "질문 없이 바로 저장해줘"라고 한 경우에만 1단계를 건너뛰고 바로 2단계로 진행한다.

  ⭐ **[2단계: 하위 질문 답변을 바탕으로 한 최종 성장 다이어리 완성 및 자동 저장]**:
  - 사용자가 하위 질문에 답변하면, 사용자가 쉬운 질문에 편하게 대답한 실제 사실들만 빠짐없이 엮어서 문맥을 깔끔하고 완성도 높은 1인칭 단일 줄글로 이어붙여라.
  - **성장 다이어리 채팅 출력 양식**:
    🗓 **${currentDateISO} 오늘의 성장 다이어리: [다이어리 제목 규칙 준수]**

    • **오늘의 성장 기록**: [사용자가 직접 답변한 실제 내용들만 100% 기반으로 하여, 왜곡이나 지어냄 없이 문맥을 매끄럽게 정돈한 1인칭 줄글(~했다, ~을 배웠다)]
    • **핵심 역량**: #태그1 #태그2
    💬 **MyStair의 조언**: [학생의 실제 노력에 대한 따뜻한 격려 1줄]
    ⚠️ **자소서 대비 필수 검토**: 실제 기업 채용 시 AI 대필은 금지되며 진위 검증이 이루어집니다. 본 다이어리를 **반드시 직접 읽어보시고, 본인이 실제로 하지 않은 경험이나 과장된 내용이 없는지 꼭 검토**해 주세요!

- 📌 **다이어리 제목(Title) 규칙 (절대적 준수!)**:
  - **수상/상장 관련 경험인 경우**:
    - 만약 '~~상을 받았다', '은상 탔다', '다독상 수상' 등 상을 받은 경험이면:
    - **반드시 '[대회/활동명] [상 종류] 수상'** 형태로 간결하고 명확하게 작성해라!
    - 예: "경운대 대회 은상 수상", "교내 다독상 수상", "전국기능경기대회 동상 수상", "캡스톤 디자인 대상 수상"
  - **일반 경험/실습/활동인 경우**:
    - 만약 '~경험을 했다', '~실습했다', '~활동을 했다' 등 일반 활동이면:
    - **불필요한 조사/서술어를 없애고 최소한으로 줄여서 명사형으로 작성해라! 봤을 때 이상하지 않고 매우 깔끔해야 한다.**
    - 예: "전기기능사 회로 실습", "PLC 시퀀스 제어 실습", "학생회 등교 질서 지도", "한화오션 기업 연수", "축제 체험 부스 운영"
  - ❌ 금지: "지혜의 깊이를 더하다", "오늘의 다이어리", "다독상을 받았다", "회로 실습을 한 경험" 같은 추상적이거나 어색한 문장형 제목 절대 금지!

- 📝 **다이어리 내용(content) 규칙 (사용자 요구사항)**:
  - JSON 마커의 "content" 필드 안에는 절대로 항목을 분할하지 말고, **사용자가 직접 입력하고 답변한 실제 사실들만 매끄럽게 연결한 단일 줄글**로 작성해라.
  - 사용자가 말하지 않은 거짓 경험이나 과장된 기술/성과를 덧붙이지 말고, 오직 학생의 실제 경험에 충실할 것.

- 💾 **자동 저장 JSON 마커 (오직 2단계 완료 시점에만 출력)**:
  - 반드시 2단계 답변 제일 마지막 줄에 아래 형태의 단일 라인 JSON 마커를 정확히 출력해야 해!
  [[DIARY_SAVE: {"date": "${currentDateISO}", "title": "경운대 대회 은상 수상", "content": "오늘 경운대 대회에 출전하여 은상을 수상했다. 팀에서 모터 제어 코딩을 맡았는데 필터 알고리즘을 보정하여 센서 오작동을 해결했다. 이번 대회를 통해 임베디드 제어에 대한 자신감을 얻었다.", "tags": ["경운대대회", "은상수상", "모터제어"], "mood": "뿌듯함"}]]

[중요 응답 규칙 - 질문 유형별 답변 분량 및 스타일]
1. 💬 **일상 대화 / 인사 / 단순 질문 / 가벼운 소통** ("안녕?", "반가워", "너 누구야?", "고마워", "오늘 어때?" 등):
   - **반드시 2줄 이내로 매우 짧고 간결하게 대답해!**
   - 길게 설명하지 말고, 친근하게 인사하며 도움이 필요한 점이 있는지 물어봐.

2. 🌿 **단일 주제 질문 및 가벼운 진로 질문** (예: "전기기능사 시험 난이도 어때?", "자소서 작성 팁 알려줘"):
   - **2~3줄 이내로 핵심만 짧고 명쾌하게 가이드를 제공해.**

3. 🎯 **진로와 관련된 진지하고 많은 내용이 필요한 종합 컨설팅 질문** (예: "내 프로필과 다이어리 기반 종합 진로 리포트 써줘", "나한테 맞는 기업, 자격증, 액션플랜 전체 분석해줘"):
   - **5줄에서 10줄 정도로 상세하게 답변해줘.**
   - 가독성을 위해 마크다운과 이모지를 적절히 사용하되, 너무 길어지지 않게 10줄을 넘기지 않도록 요약해서 답변해줘. 특히 사용자에게 적합한 '나만의 추천 기업 리스트'와 추천 이유를 명확하게 짚어줘.

위 규칙을 엄격하게 지켜서 답변 길이를 조절해줘.
`;

    let finalSystemInstruction = systemInstruction;
    if (language === 'en') {
      finalSystemInstruction += `

[LANGUAGE REQUIREMENT]
CRITICAL: The current user interface language is English ('en'). You MUST reply entirely in English! 
- Translate all insights, guidance, recommendations, greetings, and notes to English naturally.
- Use supportive, professional, and clear English appropriate for high school students.
- Keep the response structured, clear, and highly professional.
- Do NOT use Korean unless explaining a very specific Korean term (which should also be accompanied by its English translation/explanation).
- If the user asks in Korean, still reply in English because the site language is set to English.
`;
    } else {
      finalSystemInstruction += `

[LANGUAGE REQUIREMENT]
CRITICAL: 현재 사용자의 인터페이스 언어 설정은 한국어('ko')입니다. 반드시 한국어로 대답해주세요.
`;
    }

    const recentHistory = historyMessages
      .filter((m) => m.content && !m.content.includes("⏳ **API 사용량이") && !m.content.includes("⚠️ AI 설정 안내"))
      .slice(-6);

    const contents: any[] = [];
    if (recentHistory.length > 0) {
      for (const hist of recentHistory) {
        contents.push({
          role: hist.role === "user" ? "user" : "model",
          parts: [{ text: hist.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${text}`,
        },
      ],
    });

    // Client-side Key Rotation & Fallback Loop
    const startIndex = Math.floor(Math.random() * keys.length);
    let lastError: any = null;

    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash"
    ];

    for (const modelName of fallbackModels) {
      for (let i = 0; i < keys.length; i++) {
        const keyIndex = (startIndex + i) % keys.length;
        const apiKey = keys[keyIndex];

        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: finalSystemInstruction,
              temperature: 0.7,
            },
          });

          console.log(`Client direct direct API call succeeded using key index ${keyIndex} with model ${modelName}`);
          return response.text || (language === 'en' ? "Failed to generate a response. Please try again." : "답변을 생성하지 못했습니다. 다시 시도해주세요.");
        } catch (err: any) {
          console.warn(`Client direct API key index ${keyIndex} failed with model ${modelName}:`, err?.message || err);
          lastError = err;
        }
      }
    }

    throw lastError || new Error("All client-side Gemini API keys and model calls failed.");
  };

  // Helper function for smooth character-by-character typewriter animation
  const animateTyping = (msgId: string, fullText: string): Promise<void> => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      // Step size: 1 character for short texts, 2~3 characters for longer responses for smooth pace
      const stepSize = fullText.length > 500 ? 3 : (fullText.length > 200 ? 2 : 1);
      
      const timer = setInterval(() => {
        currentIndex += stepSize;
        if (currentIndex >= fullText.length) {
          clearInterval(timer);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, content: fullText, isStreaming: false }
                : m
            )
          );
          resolve();
        } else {
          const currentChunk = fullText.slice(0, currentIndex);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, content: currentChunk, isStreaming: true }
                : m
            )
          );
        }
      }, 15);
    });
  };

  const sendMessageToAI = async (text: string, existingMessages: Message[]) => {
    setIsLoading(true);

    const tempAiMsgId = (Date.now() + 1).toString();
    
    // Add placeholder AI loading state
    setMessages((prev) => [
      ...prev,
      { id: tempAiMsgId, role: 'ai', content: '', isStreaming: true }
    ]);

    let profile: any = null;
    let diaries: any[] = [];

    try {
      profile = getCombinedProfileData();
      diaries = await getCombinedDiariesData();

      // Format history for server
      const chatHistory = existingMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      let responseText = '';
      let fetchSuccess = false;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            chatHistory: chatHistory,
            userProfile: profile,
            diaries: diaries,
            language: language
          })
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.response) {
              responseText = data.response;
              fetchSuccess = true;
            }
          }
        }
      } catch (e) {
        console.warn('Server endpoint /api/chat unavailable, switching to client direct API...', e);
      }

      // If server endpoint failed or returned non-JSON, fallback to direct client-side Gemini API
      if (!fetchSuccess) {
        try {
          responseText = await generateClientGemini(text, profile, diaries, messages);
        } catch (clientErr: any) {
          console.error('Client Gemini fallback error:', clientErr);
          const errStr = String(clientErr?.message || clientErr);
          if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
            responseText = language === 'en'
              ? "⏳ **The API usage has temporarily reached its limit due to high traffic.**\n\nGoogle Gemini free tier's requests per minute limit has been exceeded. **Please try again in about 30 seconds to 1 minute**, and we will be happy to answer you! 😊"
              : "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 바로 답변해 드릴게요! 😊";
          } else {
            responseText = language === 'en'
              ? `⚠️ AI Configuration Notice:\n\nPlease register **VITE_GEMINI_API_KEY** or **GEMINI_API_KEY** in the environment variables to activate AI responses.\n\n(Details: ${errStr})`
              : `⚠️ AI 설정 안내:\n\nVercel 또는 Render 환경 변수(Environment Variables)에 **VITE_GEMINI_API_KEY** 또는 **GEMINI_API_KEY**를 추가 등록해주시면 AI 응답이 작동합니다.\n\n(상세 원인: ${errStr})`;
          }
        }
      }

      // Check if user request is a bare/empty diary request without activity details
      const isBareDiaryRequest = (userText: string): boolean => {
        const trimmed = userText.trim().replace(/[?!.~]/g, '');
        const barePhrases = [
          "오늘의 다이어리 작성",
          "오늘의 다이어리 작성해줘",
          "오늘의 다이어리 써줘",
          "오늘 다이어리 써줘",
          "오늘 다이어리 작성",
          "오늘 다이어리 작성해줘",
          "다이어리 써줘",
          "다이어리 작성",
          "다이어리 작성해줘",
          "오늘 일기 적어줘",
          "일기 적어줘",
          "일기 써줘",
          "오늘 일기 써줘",
          "성장 다이어리 써줘",
          "일기 작성해줘",
          "다이어리 써줘라",
          "일기 써주세요",
          "오늘 다이어리 적어줘"
        ];
        if (barePhrases.includes(trimmed)) return true;

        const hasDiaryKeyword = /다이어리|일기/i.test(trimmed);
        const hasWriteKeyword = /써줘|적어줘|작성|만들어/i.test(trimmed);
        const hasActivityDetail = /했어|갔어|땄어|배웠어|공부|실습|수상|완료|합격|정리|취득|저 내용|이 내용|아까|위 내용|내용|경험|활동|대회|은상|금상|대상|동상|다독상|사진|첨부/i.test(trimmed);

        if (hasDiaryKeyword && hasWriteKeyword && !hasActivityDetail && trimmed.length < 22) {
          return true;
        }
        return false;
      };

      const bareRequest = isBareDiaryRequest(text);

      if (bareRequest) {
        // Strip any JSON marker AI might have accidentally generated
        responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();

        // Ensure response asks user for experience details politely
        const isAiAskingQuestions = /어떤 일이나 배운 내용|무슨 내용을|말씀해주시면|어떤 경험|어떤 활동/i.test(responseText);
        if (!isAiAskingQuestions) {
          responseText = language === 'en'
            ? "Did you have any achievements or learning experiences today? 🌿\n\nIf you share what happened, like 'I won silver at Kyungwoon Univ contest today' or 'I practiced electrical technician skills today', MyStair will ask 1-2 core questions to craft an accurate, neat Growth Diary for you! 😊"
            : "오늘 어떤 경험이나 활동을 하셨나요? 🌿\n\n'오늘 경운대 대회 나가서 은상 탔어', '오늘 전기기능사 실습했어' 처럼 오늘 있었던 일을 들려주시면, 더 정확하고 객관적인 다이어리를 위해 꼭 필요한 질문을 드린 뒤 멋진 오늘의 성장 다이어리로 등록해 드릴게요! 😊";
        }
      } else {
        // Dual-Stage Automatic Diary Saver (Multi-Date & Specific Date Support)
        let diarySaved = false;
        let savedDiaryEntries: Array<{
          title: string;
          content: string;
          date: string;
          mood: string;
          tags: string[];
        }> = [];

        const parseNormalizedDate = (rawDate?: string): string => {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const kst = new Date(utc + (9 * 3600000));
          const currentYear = String(kst.getFullYear());
          const currentMonth = String(kst.getMonth() + 1).padStart(2, '0');
          const currentDay = String(kst.getDate()).padStart(2, '0');
          const currentDateISO = `${currentYear}-${currentMonth}-${currentDay}`;
          const defaultToday = currentDateISO;

          if (!rawDate || typeof rawDate !== 'string') return defaultToday;
          const cleaned = rawDate.trim();

          // If raw date has XX or wildcard, replace with defaultToday
          if (cleaned.includes('XX') || cleaned.includes('xx') || cleaned.includes('undefined')) {
            return defaultToday;
          }

          // Full date YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
          const fullMatch = cleaned.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
          if (fullMatch) {
            const y = fullMatch[1];
            let mNum = parseInt(fullMatch[2], 10);
            let dNum = parseInt(fullMatch[3], 10);

            // If month and day are reversed like 2026-26-09 (mNum=26, dNum=9)
            if (mNum > 12 && dNum <= 12) {
              const temp = mNum;
              mNum = dNum;
              dNum = temp;
            }

            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);

            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${y}-${m}-${d}`;
          }

          // Korean format: 2026년 9월 7일
          const korFullMatch = cleaned.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
          if (korFullMatch) {
            const y = korFullMatch[1];
            let mNum = parseInt(korFullMatch[2], 10);
            let dNum = parseInt(korFullMatch[3], 10);
            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);
            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${y}-${m}-${d}`;
          }

          // Short date MM/DD or MM-DD or M월 D일 or M/D
          const shortMatch = cleaned.match(/(\d{1,2})[월.\/-]\s*(\d{1,2})[일]?/);
          if (shortMatch) {
            let mNum = parseInt(shortMatch[1], 10);
            let dNum = parseInt(shortMatch[2], 10);
            if (mNum > 12 && dNum <= 12) {
              const temp = mNum;
              mNum = dNum;
              dNum = temp;
            }
            if (mNum < 1 || mNum > 12) mNum = parseInt(currentMonth, 10);
            if (dNum < 1 || dNum > 31) dNum = parseInt(currentDay, 10);

            const m = String(mNum).padStart(2, '0');
            const d = String(dNum).padStart(2, '0');
            return `${currentYear}-${m}-${d}`;
          }

          return defaultToday;
        };

        const getKSTDateISO = () => {
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const kst = new Date(utc + (9 * 3600000));
          const y = kst.getFullYear();
          const m = String(kst.getMonth() + 1).padStart(2, '0');
          const d = String(kst.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

        const currentDateISO = getKSTDateISO();
        // Clean any placeholder anomalies in responseText
        responseText = responseText.replace(/\d{4}-\d{2}-XX/g, currentDateISO);
        responseText = responseText.replace(/2026-26-09/g, currentDateISO);

        const prevAiMsg = existingMessages.filter(m => m.role === 'ai').slice(-1)[0] || messages.filter(m => m.role === 'ai').slice(-1)[0];

        // Refined title formatter strictly adhering to user requirements:
        // 1. Award experiences -> '[대회/활동명] [상 종류] 수상' (e.g. '경운대 대회 은상 수상', '교내 다독상 수상')
        // 2. General activities/practice -> minimal concise noun (e.g. '전기기능사 회로 실습', '축제 부스 운영')
        const cleanDiaryTitle = (rawTitle: string): string => {
          if (!rawTitle) return language === 'en' ? "Growth Diary" : "성장 다이어리";
          let t = rawTitle.replace(/[*_#\[\]]/g, '').trim();
          t = t.replace(/^(오늘의|나만의)\s*/, '').replace(/성장\s*다이어리/g, '').replace(/[:\-]/g, '').trim();

          // 1. Award pattern matching: e.g. "경운대 대회를 나가서 은상을 탔어" -> "경운대 대회 은상 수상", "다독상을 받았다" -> "다독상 수상"
          const awardPattern = /([가-힣a-zA-Z0-9\s]+?)(?:에서|대회)?\s*([가-힣a-zA-Z0-9]+상|은상|금상|대상|동상|최우수상|우수상|장려상|다독상)(?:\s*(?:을|를)?\s*(?:받았다|탔다|수여|수상)?)?/;
          const matchAward = t.match(awardPattern);
          if (matchAward) {
            const prefix = matchAward[1].replace(/(에서|나가서|참가하여|출전하여)$/, '').trim();
            const awardName = matchAward[2].trim();
            if (prefix && prefix !== awardName) {
              return `${prefix} ${awardName} 수상`.replace(/\s+/g, ' ');
            }
            return `${awardName} 수상`;
          }
          if (/[가-힣a-zA-Z0-9]+상(?:\s*수여|\s*받음|\s*획득|\s*받았다|\s*탔다)/.test(t)) {
            return t.replace(/(?:수여|받음|획득|받았다|탔다)$/, '수상').trim();
          }

          // 2. Activity/Practice concise noun conversion
          t = t.replace(/을?\s*(?:진행)?(?:했음|했다|하다)$/, '')
               .replace(/의?\s*경험(?:을\s*했다)?$/, '')
               .replace(/을?\s*경험함$/, '')
               .replace(/을?\s*(?:배웠다|배움)$/, ' 학습')
               .replace(/을?\s*(?:완료했다|마쳤다)$/, ' 완료')
               .replace(/(?:에\s*대한|에\s*관한)\s*/g, ' ')
               .trim();

          if (t.length > 20) {
            t = t.slice(0, 20).trim();
          }
          return t || (language === 'en' ? "Growth Diary" : "성장 다이어리");
        };

        // Format diary content into a natural single first-person paragraph without separate labels like "활동:", "성취:", "메시지:"
        const cleanDiaryContent = (rawContent: string): string => {
          if (!rawContent) return '';
          let c = rawContent.replace(/\[\[DIARY_SAVE:[\s\S]*?\]\]/g, '').trim();
          // Remove category headers/bullet headers e.g. "활동:", "성취:", "메시지:", "조언:"
          c = c.replace(/(?:•|\*|-)?\s*(?:활동|성취|성과|메시지|메세지|조언|MyStair의 조언|성장 기록|오늘의 성장 기록)\s*[:\-]\s*/gi, '');
          c = c.replace(/^[•*-]\s+/gm, '');
          const lines = c.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !l.startsWith('💬') && !l.startsWith('🗓') && !l.startsWith('#') && !l.startsWith('📌') && !l.startsWith('기분:'));
          return lines.join(' ').replace(/\s+/g, ' ').trim();
        };

        // Strict verification: Check whether the user explicitly intended to create/save a growth diary
        const isDiarySaveIntent = (userText: string): boolean => {
          const trimmed = userText.trim();

          // 1. Explicit requests to write or save into diary / growth diary
          const explicitSavePhrases = [
            /(?:다이어리|일기|성장\s*다이어리)에\s*(?:넣어|적어|써|저장|기록|등록|추가)/i,
            /(?:오늘의\s*)?(?:다이어리|일기|성장\s*다이어리)\s*(?:작성|써줘|적어줘|만들어줘|등록해줘|저장해줘)/i,
            /저\s*내용.*(?:다이어리|일기)에/i,
            /내용.*(?:다이어리|일기)에\s*(?:넣어|적어|써|저장|추가)/i,
            /각\s*날짜(?:별로|에)?\s*(?:다이어리|일기)/i,
          ];
          const hasExplicitSave = explicitSavePhrases.some(regex => regex.test(trimmed));

          // Exclude read-only/analysis requests like "내 성장 다이어리를 분석해서 자소서 경험 뽑아줘", "다이어리 보여줘"
          const isAnalysisOrViewOnly = /(?:다이어리|일기)를?\s*(?:분석|조회|검색|보여|확인|삭제|읽어)/i.test(trimmed) &&
            !/(?:넣어|적어|써|저장|기록|등록|작성|추가)/i.test(trimmed);

          if (hasExplicitSave && !isAnalysisOrViewOnly) {
            return true;
          }

          // 2. User explicitly declares today's experience, activity, competition, award, practice
          // EXACTLY matching user words: "오늘의 다이어리에 넣어줘", "나 오늘의 경험이나 활동이야", "오늘 한거야"
          const explicitActivityDeclaration = [
            /(?:나\s*)?오늘의?\s*(?:경험|활동)(?:이나\s*(?:활동|경험))?(?:이야|야|입니다|예요|임)?/i,
            /(?:나\s*)?오늘\s*(?:한\s*거|한거|한\s*일|한일)(?:이야|야|입니다|예요|임)?/i,
            /오늘의?\s*(?:하루\s*기록|성장\s*기록)(?:이야|야|입니다|예요|임)?/i,
          ];
          if (explicitActivityDeclaration.some(regex => regex.test(trimmed))) {
            return true;
          }

          // 3. User answering AI's diary prompt or follow-up sub-questions in ongoing diary dialogue
          const prevWasDiaryPrompt = prevAiMsg && /(?:오늘 어떤 경험이나 활동|어떤 일이나 배운 내용|무슨 내용을|말씀해주시면.*다이어리|어떤 경험이 있으셨나요|learning experiences today|neat Growth Diary|다이어리로 멋지게|다이어리로 완성|성장 다이어리로|하위 질문|생생한 오늘의 다이어리|MyStair가.*여쭤볼게요|어떤 구체적인 역할|어떤 역할|어떤 활동|어떤 갈등|어떤 어려움|어떻게 해결|여쭤볼게요|답변해 주시면.*성장 다이어리)/i.test(prevAiMsg.content);
          if (prevWasDiaryPrompt) {
            return true;
          }

          return false;
        };

        const hasDiarySaveIntent = isDiarySaveIntent(text);

        // Check if AI is asking the 1-2 interactive sub-questions (Step 1)
        const isAiAskingQuestions = /(?:오늘 어떤 경험이나 활동|어떤 일이나 배운 내용|무슨 내용을|말씀해주시면|어떤 경험이 있으셨나요|어떤 역할|어떤 활동|어떤 갈등|어떤 어려움|어떤 걸 배웠|어떻게 해결|들려주세요|들려주실래요|여쭤볼게요|하위 질문|답변해 주시면.*다이어리)/i.test(responseText) ||
          /(?:1\..*\?|2\..*\?)/.test(responseText);

        if (isAiAskingQuestions) {
          // AI is actively asking the 1-2 sub-questions (Step 1)
          // Strip any accidental [[DIARY_SAVE:...]] marker and wait for user's answers
          responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
        } else if (!hasDiarySaveIntent) {
          // Normal chat or question! Do NOT save to diary under any circumstances.
          // Strip any marker AI might have accidentally generated
          responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
        } else {
          // User genuinely intended to write/save today's diary (Step 2 Completion)
          // Stage 1: Check for [[DIARY_SAVE: ...]] JSON marker (Object or Array)
          if (responseText && responseText.includes('[[DIARY_SAVE:')) {
            const diaryMatch = responseText.match(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/);
            if (diaryMatch) {
              try {
                const rawJson = diaryMatch[1];
                const parsedData = JSON.parse(rawJson);
                const items = Array.isArray(parsedData) ? parsedData : [parsedData];

                for (const item of items) {
                  if (item && (item.content || item.title)) {
                    let dTitle = cleanDiaryTitle(item.title || '');
                    let dContent = cleanDiaryContent(item.content || '');
                    let dTags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ['성장기록', '경험일기'];
                    let dMood = item.mood || '보람참';
                    let dDate = parseNormalizedDate(item.date);

                    savedDiaryEntries.push({
                      title: dTitle,
                      content: dContent,
                      date: dDate,
                      mood: dMood,
                      tags: dTags
                    });
                  }
                }

                if (savedDiaryEntries.length > 0) {
                  diarySaved = true;
                }
                responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
              } catch (e) {
                console.error("Failed to parse diary JSON from AI response:", e);
                responseText = responseText.replace(/\[\[DIARY_SAVE:\s*({[\s\S]*?}|\[[\s\S]*?\])\s*\]\]/g, '').trim();
              }
            }
          }

          // Stage 2: Fallback parser if JSON marker was omitted, but response has date items
          if (!diarySaved && !isAiAskingQuestions && responseText) {
            // Check if AI output contains date blocks e.g. "📅 7/20: ..." or "📅 7/21: ..." or "7/20:"
            const dateBlockRegex = /(?:📅|🗓️)?\s*(\d{1,2}[\/.-]\d{1,2}|\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)\s*[:\-]\s*([^\n]+(?:\n(?! (?:📅|🗓️)?\s*\d{1,2}[\/.-]\d{1,2}|\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)[^\n]+)*)/g;
            let match;
            let foundBlocks = false;

            while ((match = dateBlockRegex.exec(responseText)) !== null) {
              foundBlocks = true;
              const rawDate = match[1];
              const contentText = match[2].trim();
              const normDate = parseNormalizedDate(rawDate);

              let blockTitle = cleanDiaryTitle(contentText.split(/[:\-.]/)[0].slice(0, 15).trim());
              let blockContent = cleanDiaryContent(contentText);

              savedDiaryEntries.push({
                title: blockTitle,
                content: blockContent,
                date: normDate,
                mood: '보람참',
                tags: ['성장일기', '각날짜별기록']
              });
            }

            if (foundBlocks && savedDiaryEntries.length > 0) {
              diarySaved = true;
            } else {
              // Single entry fallback
              const titleMatch = responseText.match(/(?:🗓️?|📅)?\s*(?:\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일|\d{4}-\d{2}-XX)?\s*(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\n]+)/i) ||
                                 responseText.match(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/) ||
                                 responseText.match(/(?:제목|Title)\s*[:\-]\s*([^\n]+)/i) ||
                                 responseText.match(/\[오늘의\s*성장\s*다이어리\]\s*[:\-]?\s*([^\n]+)/);

              let dTitle = cleanDiaryTitle(titleMatch && titleMatch[1] ? titleMatch[1] : '');

              let dTags = ['성장일기', 'AI자동작성'];
              const tagMatches = responseText.match(/#[가-힣a-zA-Z0-9_]+/g);
              if (tagMatches && tagMatches.length > 0) dTags = tagMatches.map(t => t.replace('#', ''));

              let dMood = '보람참';
              const moodMatch = responseText.match(/(?:기분|Mood)\s*[:\-]\s*([^\n📌🗓️🔥!]+)/i);
              if (moodMatch && moodMatch[1]) dMood = moodMatch[1].trim();

              const userDateMatch = text.match(/(\d{4}[-.\/]\d{1,2}[-.\/]\d{1,2}|\d{1,2}[-.\/]\d{1,2}|\d{1,2}월\s*\d{1,2}일)/);
              const dDate = parseNormalizedDate(userDateMatch ? userDateMatch[1] : undefined);

              let cleanedContent = cleanDiaryContent(
                responseText
                  .split('\n')
                  .filter(line => !line.startsWith('📌') && !line.includes('날짜:') && !line.includes('태그:'))
                  .join('\n')
                  .replace(/\[(?:오늘의\s*)?성장\s*다이어리\s*[:\-]?\s*([^\]]+)\]/g, '')
                  .replace(/\[오늘의\s*성장\s*다이어리\]/g, '')
              );

              if (cleanedContent.length > 5) {
                savedDiaryEntries.push({
                  title: dTitle,
                  content: cleanedContent,
                  date: dDate,
                  mood: dMood,
                  tags: dTags
                });
                diarySaved = true;
              }
            }
          }
        }

        // Execute Save Action if valid diary entries obtained
        if (diarySaved && savedDiaryEntries.length > 0) {
          const savedDates: string[] = [];

          for (const entry of savedDiaryEntries) {
            await saveDiary({
              title: entry.title,
              content: entry.content,
              date: entry.date,
              mood: entry.mood,
              tags: entry.tags
            });
            if (!savedDates.includes(entry.date)) {
              savedDates.push(entry.date);
            }
          }

          const datesStr = savedDates.sort().join(', ');
          const todayDate = parseNormalizedDate();
          const isTodayOnly = savedDates.length === 1 && savedDates[0] === todayDate;

          const banner = language === 'en'
            ? `\n\n---\n✅ **Growth Diary (${datesStr}) has been saved!** You can view it in the 'Growth Diary' menu.\n💡 **Verification Reminder**: Many companies prohibit AI in cover letters. Please review the entry directly to ensure no unexperienced details or exaggerations exist.`
            : isTodayOnly
              ? `\n\n---\n✅ **오늘의 성장 다이어리 (${datesStr})에 등록되었습니다!** '성장 다이어리' 페이지에서 확인하실 수 있습니다.\n💡 **필수 검토 안내**: 자소서 AI 사용 불가 기업 대비를 위해, AI가 이어붙인 내용 중 **내가 실제로 하지 않은 경험이나 과장된 부분이 있는지 반드시 직접 읽고 검토**해 주세요!`
              : `\n\n---\n✅ **요청하신 각 날짜별 성장 다이어리 (${datesStr})에 각각 등록되었습니다!** '성장 다이어리' 페이지에서 확인하실 수 있습니다.\n💡 **필수 검토 안내**: 자소서 AI 사용 불가 기업 대비를 위해, AI가 이어붙인 내용 중 **내가 실제로 하지 않은 경험이나 과장된 부분이 있는지 반드시 직접 읽고 검토**해 주세요!`;

          if (!responseText.includes('성장 다이어리') || !responseText.includes('등록되었습니다')) {
            responseText += banner;
          }

          window.dispatchEvent(new Event('diaryUpdated'));
        }
      }

      // Animate the text character by character (typewriter effect)
      await animateTyping(tempAiMsgId, responseText);
    } catch (err: any) {
      console.error('Chat API request failed:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAiMsgId
            ? {
                ...m,
                content: language === 'en'
                  ? `⚠️ An error occurred: ${err?.message || String(err)}`
                  : `⚠️ 오류가 발생했습니다: ${err?.message || String(err)}`,
                isStreaming: false
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');

    sendMessageToAI(userText, updatedMessages);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToMessage = (id: string) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-white/10');
      setTimeout(() => {
        element.classList.remove('bg-white/10');
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col relative z-20">
      {/* 1. Sliding History Drawer Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showHistory && (
            <div className="fixed inset-0 z-[9999] flex justify-start select-none" onClick={() => setShowHistory(false)}>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />
              
              {/* Drawer Panel */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-80 max-w-[85vw] bg-slate-900/95 border-r border-white/10 h-full p-6 flex flex-col z-10 shadow-2xl backdrop-blur-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-teal-400" />
                    <span className="text-white text-[15px] font-bold">{t('이전 질문 기록', 'Previous Questions')}</span>
                    <span className="bg-teal-400/10 text-teal-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-500/10">
                      {messages.filter(m => m.role === 'user').length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 w-8 h-8 rounded-full text-[12px] font-bold cursor-pointer flex items-center justify-center transition-all active:scale-90"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {messages.filter(m => m.role === 'user').length === 0 ? (
                    <div className={`h-full flex flex-col items-center justify-center text-center ${isLightMode ? "text-slate-400" : "text-white/40"} text-[13px] p-4 gap-2`}>
                      <Sparkles size={28} className={`${isLightMode ? "text-slate-300" : "text-white/20"} animate-pulse`} />
                      <span>{t('아직 질문 기록이 없습니다.', 'No question history yet.')}</span>
                      <span className={`text-[11px] ${isLightMode ? "text-slate-400" : "text-white/30"}`}>{t('AI에게 질문을 시작해보세요!', 'Start asking questions to AI!')}</span>
                    </div>
                  ) : (
                    messages.filter(m => m.role === 'user').map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          scrollToMessage(msg.id);
                          setShowHistory(false);
                        }}
                        className="w-full text-left group flex items-start gap-2.5 p-3 rounded-xl hover:bg-white/10 active:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-white/70 group-hover:text-white line-clamp-2 leading-relaxed break-all font-medium transition-colors">
                            {msg.content}
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-white/20 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                      </button>
                    ))
                  )}
                </div>

                <div className={`mt-4 pt-4 border-t border-white/10 text-center text-[11px] ${isLightMode ? "text-slate-400" : "text-white/30"}`}>
                  {t('기록을 클릭하면 해당 대화로 이동합니다.', 'Click on history to jump to that conversation.')}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. MAIN CHAT PANEL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
        className={`flex-1 h-full flex flex-col p-3 sm:p-6 md:p-8 relative z-20 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border min-w-0 transition-all duration-300 ${
          isLightMode 
            ? "bg-white border-slate-200/90 shadow-xl ring-1 ring-slate-900/5" 
            : "bg-black/20 border-white/10 backdrop-blur-sm"
        }`}
      >
        {/* Chat header with control buttons */}
        <div className="flex flex-wrap sm:flex-row gap-2.5 items-center justify-between mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4 select-none shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-teal-500 animate-pulse shrink-0" />
            <span className={`text-xs sm:text-[14px] font-semibold ${isLightMode ? "text-slate-900" : "text-white/80"}`}>{t('MyStair AI 대화 분석', 'MyStair AI Chat Analysis')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className={`flex items-center justify-center gap-1.5 ${isLightMode ? "text-slate-700 bg-white hover:bg-teal-50 hover:text-indigo-700 border-slate-300 hover:border-teal-300" : "text-white/90 bg-teal-500/15 hover:bg-teal-500/25 border-teal-500/30 hover:border-teal-500/50 hover:text-white"} text-xs sm:text-[13px] font-semibold px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-full border cursor-pointer transition-all active:scale-95 shadow-sm min-h-[44px] sm:min-h-[38px]`}
              title={t('이전 질문 기록 보기', 'View previous question history')}
            >
              <History size={14} className="text-teal-400 animate-pulse shrink-0" />
              <span>{t('이전 기록', 'History')} ({messages.filter(m => m.role === 'user').length})</span>
            </button>
            <button 
              onClick={clearChat}
              className={`flex items-center justify-center gap-1.5 ${isLightMode ? "text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200" : "text-white/60 hover:text-white"} text-xs sm:text-[13px] font-medium bg-white/5 hover:bg-white/10 px-3.5 py-2.5 sm:py-2 rounded-xl sm:rounded-full border border-white/10 hover:border-white/25 cursor-pointer transition-all active:scale-95 shadow-sm min-h-[44px] sm:min-h-[38px]`}
              title={t('새로운 대화 시작하기', 'Start a new conversation')}
            >
              <Trash2 size={14} className="shrink-0" />
              <span>{t('새 대화 시작', 'New Chat')}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 sm:space-y-8 pb-4 sm:pb-6 pr-1 sm:pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              key={msg.id} 
              id={`msg-${msg.id}`}
              className="flex w-full transition-all duration-500 rounded-3xl p-1"
            >
              <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className={`px-4 py-3 sm:px-6 sm:py-3.5 rounded-[20px] sm:rounded-[24px] rounded-tr-sm text-sm sm:text-[16px] shadow-sm max-w-[90%] sm:max-w-[80%] tracking-wide leading-relaxed font-medium ${isLightMode ? "bg-teal-600 text-white" : "bg-teal-600/90 text-white"}`}>
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 max-w-[95%] sm:max-w-[85%]">
                    <div className={`${isLightMode ? "text-slate-900" : "text-white"} text-sm sm:text-[16px] px-1 sm:px-2 py-1 leading-relaxed tracking-wide min-h-[44px]`}>
                      {msg.isStreaming && !msg.content ? (
                        <div className={`flex items-center gap-2 font-medium text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis ${isLightMode ? "text-teal-600" : "text-teal-300"}`}>
                          <RefreshCw size={16} className={`animate-spin shrink-0 ${isLightMode ? "text-teal-600" : "text-teal-400"}`} />
                          <span className="truncate">{t('🔍 사용자님의 자격증, 성장 다이어리, MBTI, 진로 적성검사(Holland) 데이터를 분석하여 맞춤형 인사이트를 준비 중입니다...', '🔍 Analyzing your certificates, growth diaries, MBTI, Holland test data to prepare customized insights...')}</span>
                        </div>
                      ) : (
                        <div className={`space-y-2 text-sm sm:text-base ${isLightMode ? "markdown-body-light text-slate-900 font-medium" : "markdown-body text-white"}`}>
                          <ReactMarkdown
                            components={{
                              strong: ({ node, children, ...props }) => {
                                const textContent = Array.isArray(children)
                                  ? children.join('')
                                  : String(children || '');
                                const isQuestion = /(?:^|\s|\*)(?:Q[1-9]|질문\s*[1-9]|하위\s*질문|Q:)/i.test(textContent.trim());

                                if (isQuestion) {
                                  return (
                                    <strong
                                      className={`font-black block my-2 p-3 rounded-2xl border text-[15px] sm:text-[16px] tracking-tight leading-snug shadow-xs ${
                                        isLightMode
                                          ? "bg-teal-50/90 border-teal-300/80 text-teal-950 font-black shadow-teal-500/5"
                                          : "bg-teal-950/50 border-teal-500/40 text-teal-100 font-black shadow-black/20"
                                      }`}
                                      style={{ fontWeight: 900 }}
                                      {...props}
                                    >
                                      <span className="flex items-start gap-2">
                                        <span className="shrink-0 text-teal-500 font-black text-base mt-0.5">💬</span>
                                        <span className="font-black break-keep">{children}</span>
                                      </span>
                                    </strong>
                                  );
                                }

                                return (
                                  <strong
                                    className={`font-black ${isLightMode ? "text-slate-950" : "text-white"}`}
                                    style={{ fontWeight: 900 }}
                                    {...props}
                                  >
                                    {children}
                                  </strong>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!msg.isStreaming && msg.content && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-3 px-1 sm:px-2 text-sm ${isLightMode ? "text-slate-500" : "text-white/40"}`}>
                        <button className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="좋아요">
                          <ThumbsUp size={16} />
                        </button>
                        <button className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="싫어요">
                          <ThumbsDown size={16} />
                        </button>
                        <button onClick={() => handleCopyText(msg.id, msg.content)} className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer ${isLightMode ? "hover:bg-slate-100 text-slate-500 hover:text-slate-800" : "hover:bg-white/10 text-white/50 hover:text-white"}`} aria-label="텍스트 복사">
                          {copiedId === msg.id ? <Check size={16} className="text-teal-500" /> : <Copy size={16} />}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Quick Question Suggestions - Mobile Responsive 48px touch targets */}
          {messages.length <= 2 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-3 px-1 sm:px-2">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isLightMode ? "text-slate-700" : "text-white/70"}`}>
                <Sparkles size={14} className="text-teal-400" />
                {t('추천 질의 예시', 'Suggested Questions')}
              </span>
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2.5">
                <button 
                  onClick={() => setInputValue(t('오늘 며칠이야?', 'What is today\'s date?'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs font-semibold px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer flex items-center justify-start sm:justify-center gap-2 shadow-sm min-h-[48px] text-left sm:text-center ${isLightMode ? "text-teal-800 bg-teal-50 hover:bg-teal-100 border-teal-300" : "text-teal-300 bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40"}`}
                >
                  <span className="text-sm">📅</span> 
                  <span>"{t('오늘 며칠이야?', 'What is today\'s date?')}"</span>
                </button>
                <button 
                  onClick={() => setInputValue(t('오늘의 다이어리 작성', 'Write today\'s diary'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs font-semibold px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer flex items-center justify-start sm:justify-center gap-2 shadow-sm min-h-[48px] text-left sm:text-center ${isLightMode ? "text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border-indigo-300" : "text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/40"}`}
                >
                  <span className="text-sm">✍️</span> 
                  <span>"{t('오늘의 다이어리 작성', 'Write today\'s diary')}"</span>
                </button>
                <button 
                  onClick={() => setInputValue(t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'What are the employment strategies and required certifications for Meister high school graduates to enter large companies?'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('마이스터고 졸업 후 대기업 취업 전략 및 필수 자격증은?', 'Employment strategy for large companies after graduating high school?')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Analyze my growth diary and extract cover letter experiences'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('내 성장 다이어리를 분석해서 자소서 경험 뽑아줘', 'Extract cover letter experiences from growth diary')}"
                </button>
                <button 
                  onClick={() => setInputValue(t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Tell me recommended job roles and companies matching my major and MBTI'))} 
                  className={`w-full sm:w-auto text-xs sm:text-xs ${isLightMode ? "text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-300" : "text-white/90 bg-black/40 hover:bg-white/10 border-white/15 backdrop-blur-md"} px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full transition-all active:scale-98 border cursor-pointer text-left sm:text-center leading-relaxed min-h-[48px]`}
                >
                  "{t('내 전공과 MBTI에 맞는 추천 직무와 기업 알려줘', 'Recommended job roles and companies matching major and MBTI')}"
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="pt-3 sm:pt-4 mt-auto shrink-0">
          <form onSubmit={handleSubmit} className="w-full rounded-2xl sm:rounded-[32px] p-1.5 sm:p-2 shadow-lg border border-slate-200 bg-white flex items-center focus-within:ring-2 focus-within:ring-slate-300/60 focus-within:border-slate-300 transition-all duration-300 min-h-[52px]">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? t("AI 답변을 준비 중입니다...", "AI is preparing your answer...") : t("추가로 궁금한 점을 물어보세요", "Ask any other questions you have")}
              className="w-full bg-transparent px-3 sm:px-6 py-2 sm:py-3 outline-none text-sm sm:text-[16px] min-h-[44px] text-slate-900 placeholder-slate-400"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              aria-label="질문 제출"
              className="p-3 sm:p-3.5 rounded-xl sm:rounded-full transition-colors shadow-md flex items-center justify-center shrink-0 ml-1.5 sm:ml-2 group cursor-pointer disabled:opacity-40 min-h-[48px] min-w-[48px] active:scale-95 bg-slate-900 hover:bg-teal-600 text-white"
            >
              <ArrowUp size={20} strokeWidth={2.5} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

