import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  X, 
  RotateCcw, 
  ArrowUp, 
  Copy, 
  Check, 
  ThumbsUp, 
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Bot
} from 'lucide-react';
import { AlienUFOSvg } from './FloatingAliens';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import { useAuth, UserProfileData, DiaryEntry } from '../context/AuthContext';

// Client-side Direct Gemini Engine for Cover Letter Coach
export const generateClientCoachAnswer = async (
  query: string, 
  profile: any, 
  diaries: any[],
  currentAnswer: string,
  companyName: string,
  sectionTitle: string,
  recommendedChars: number
): Promise<string> => {
  const storedUserKey = typeof window !== 'undefined' ? (localStorage.getItem('gemini_api_key') || localStorage.getItem('VITE_GEMINI_API_KEY') || '') : '';
  const rawCandidateKeys = [
    storedUserKey,
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY2,
    import.meta.env.VITE_GEMINI_API_KEY3,
    import.meta.env.VITE_GEMINI_API_KEY4,
  ];

  const expandedKeys: string[] = [];
  for (const item of rawCandidateKeys) {
    if (typeof item === 'string' && item.trim()) {
      const split = item.split(/[\s,;\n]+/).filter(Boolean);
      expandedKeys.push(...split);
    }
  }

  const keys = Array.from(new Set(expandedKeys)).filter((key): key is string => {
    if (!key) return false;
    const trimmed = key.trim();
    const lower = trimmed.toLowerCase();
    return trimmed !== "" && 
           trimmed.length > 5 &&
           lower !== "my_gemini_api_key" && 
           lower !== "your_api_key" && 
           lower !== "your_gemini_api_key" && 
           lower !== "null" && 
           lower !== "undefined" && 
           lower !== "placeholder";
  });

  if (keys.length === 0) {
    throw new Error('NO_API_KEY_CONFIGURED');
  }

  const answer = (currentAnswer || "").trim();
  const studentName = profile?.name || "학생";
  const studentMajor = profile?.major || "전공";
  const studentSchool = profile?.highSchool || "마이스터·특성화고";
  const studentMbti = profile?.mbti || "";
  const studentHolland = profile?.hollandCode || "";
  const targetCompanies = profile?.targetCompanies && profile.targetCompanies.length > 0 
    ? profile.targetCompanies.join(", ") 
    : (companyName || "지원 기업");

  let diaryContext = "등록된 다이어리 없음";
  if (Array.isArray(diaries) && diaries.length > 0) {
    diaryContext = diaries.slice(0, 5).map((d: any, idx: number) => {
      const title = d.title || `활동 ${idx + 1}`;
      const content = d.content ? d.content.slice(0, 200) : "";
      const tags = Array.isArray(d.tags) && d.tags.length > 0 ? ` (태그: ${d.tags.join(', ')})` : "";
      return `[기록 ${idx + 1}] ${title}${tags}\n내용: ${content}`;
    }).join("\n\n");
  }

  const systemInstruction = `너는 마이스터고 및 특성화고 학생의 자기소개서 실시간 작성을 돕는 전문 취업·진로 멘토 'MyStair AI 코치'입니다.
[필수 원칙]:
1. 절대 이모지나 이모티콘(외계인, 새싹, 박수, 로켓 등 특수 기호 일체)을 사용하지 마세요. 깔끔하고 신뢰감 있는 표준 한국어 문장으로 답변하세요.
2. 학생의 마이페이지 프로필(이름, 학교, 전공, MBTI, 적성)과 성장 다이어리에 기록된 실제 실습 과제, 기능사 자격증, 프로젝트 일화를 적극적으로 파악하고 있어야 합니다.
3. 질문을 받거나 조언을 할 때, 학생이 다이어리에 적어둔 실제 경험을 구체적으로 인용하며 [${companyName || targetCompanies}]의 직무와 연결해 주세요.
4. 절대 학생 대신 글을 통째로 써주는 대필을 하지 말고, 학생 본인의 경험을 스스로 구체화할 수 있도록 키워드, 구조(STAR 기법), 구체적인 방향성을 제시하세요.
5. 어조는 차분하고 정중한 존댓말로, 1~3문단 내외로 간결하고 핵심만 전달하세요.`;

  const prompt = `[지원자 프로필 (MyPage)]:
- 이름: ${studentName}
- 학교 및 전공: ${studentSchool} ${studentMajor}
- 직업적성: MBTI ${studentMbti || '미설정'}, Holland ${studentHolland || '미설정'}
- 희망 지원 기업: ${targetCompanies}

[지원자의 성장 다이어리 (실제 경험 기록)]:
${diaryContext}

[현재 지원 기업]: ${companyName || targetCompanies}
[작성 중인 자기소개서 문항]: ${sectionTitle || '문항'} (권장 분량: ${recommendedChars || 500}자)
[현재 학생이 작성 중인 내용]:
"""
${answer || '(작성 시작 전)'}
"""

[학생의 질문]: "${query}"

[답변 요청]:
1. 이모지/이모티콘을 절대 넣지 마세요.
2. 학생의 질문에 대해, 학생의 전공(${studentMajor})과 다이어리에 적힌 실습 경험을 고려하여 구체적이고 현실적인 수정 방향을 2~4문장으로 명확히 제시하세요.
3. 지원 기업(${companyName || targetCompanies})의 현장 직무와 연결할 수 있는 힌트를 주세요.`;

  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite"
  ];

  for (const modelName of fallbackModels) {
    for (let i = 0; i < keys.length; i++) {
      const keyIndex = (startIndex + i) % keys.length;
      const apiKey = keys[keyIndex];

      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        console.log(`Client direct Coach API call succeeded using key index ${keyIndex} with model ${modelName}`);
        return response.text || "";
      } catch (err: any) {
        console.warn(`Client direct Coach API key index ${keyIndex} failed with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }
  }

  throw lastError || new Error("All client-side Gemini model calls failed.");
};

// Client-side Highly Intelligent Heuristic Rule Fallback Engine
export function generateLocalFallbackAnswer(
  userQuestion: string, 
  companyName: string, 
  sectionTitle: string, 
  currentAnswer: string,
  userProfile?: any,
  diaries?: any[]
): string {
  const q = (userQuestion || '').trim().toLowerCase();
  const trimmedAnswer = (currentAnswer || '').trim();
  const answerLen = trimmedAnswer.length;
  const targetCompany = companyName || '지원 기업';
  const cleanSection = sectionTitle || '자기소개서 문항';
  const studentName = userProfile?.name || '학생';
  const studentMajor = userProfile?.major || '전공';

  const userDiaries = Array.isArray(diaries) && diaries.length > 0 ? diaries : [];
  const topDiary = userDiaries.length > 0 ? userDiaries[0] : null;

  // 1. Identity / Greeting / Confirmation
  if (q.includes("너 누구") || q.includes("누구야") || q.includes("mystair") || q.includes("마이스테어") || q.includes("맞아") || q.includes("외계인")) {
    return `네, 저는 마이스터고·특성화고 학생들을 위해 만들어진 취업 멘토 MyStair AI 코치입니다. 학생 대신 글을 지어내는 대필 대신, ${studentName}님이 마이페이지와 다이어리에 기록해둔 진짜 실습과 프로젝트 경험을 바탕으로 합격 자기소개서를 완성할 수 있도록 실시간으로 코칭해 드립니다. 작성 중에 고민되는 부분이 있다면 편하게 질문해 주세요.`;
  }
  if (q.includes("안녕") || q.includes("반가워") || q.includes("하이") || q.includes("hello")) {
    return `안녕하세요, ${studentName}님. [${targetCompany}] 취업을 위해 지금 [${cleanSection}] 문항을 작성 중이시군요. 전공 실습이나 다이어리 경험을 어떻게 녹여낼지 고민되는 점이 있다면 편하게 물어보세요.`;
  }
  if (q.includes("고마워") || q.includes("감사")) {
    return `도움이 되었다니 기쁩니다. 한 문장씩 진솔하게 써내려가다 보면 분명 좋은 자기소개서가 완성될 것입니다. 계속해서 힘내서 작성해 보세요.`;
  }

  // 2. 다이어리/경험/마이페이지 관련 질문 ("다이어리 알아?", "내 경험", "마이페이지", "나에 대해 알아?")
  if (q.includes("다이어리") || q.includes("경험") || q.includes("마이페이지") || q.includes("기록") || q.includes("알고있어") || q.includes("알고 있어")) {
    if (topDiary) {
      return `${studentName}님의 마이페이지 프로필(${studentMajor})과 성장 다이어리 기록을 모두 파악하고 있습니다. 특히 다이어리에 기록해 두신 '${topDiary.title}' 일화는 ${targetCompany} 자기소개서에 아주 훌륭한 소재입니다. 이 경험을 자기소개서 문맥에 맞게 어떻게 연결하면 좋을지 말씀해 드릴까요?`;
    }
    return `${studentName}님의 마이페이지 프로필 정보(${studentMajor})를 바탕으로 코칭하고 있습니다. 작성 중이신 내용이나 학교 실습 일화에 대해 말씀해 주시면 맞춤 조언을 드리겠습니다.`;
  }

  // 2-1. 오타/맞춤법/띄어쓰기 질문
  if (q.includes("오타") || q.includes("맞춤법") || q.includes("띄어쓰기") || q.includes("교정") || q.includes("고쳐")) {
    return `[${cleanSection}] 문항의 맞춤법과 띄어쓰기를 정밀 교정하시려면 문항 툴바 우측의 [AI 오타·맞춤법 수정] 버튼을 클릭해 보세요. 본문에 원클릭으로 완벽하게 반영됩니다.`;
  }

  // 3. 고민/어떻게 바꿔/수정 ("고민", "어케 바꿔", "어떻게 바꿔", "수정", "바꿔야")
  if (q.includes("어케") || q.includes("어떻게") || q.includes("고민") || q.includes("바꿔") || q.includes("수정") || q.includes("고치") || q.includes("뭐적") || q.includes("뭐 적") || q.includes("적어")) {
    if (answerLen === 0) {
      if (topDiary) {
        return `첫 문장 작성이 고민이시라면, 다이어리에 적어두신 '${topDiary.title}' 경험으로 시작해 보세요. '저는 ${studentMajor} 실습 중 ~한 문제를 해결하며 책임감을 배웠습니다'처럼 첫 문장을 두괄식으로 던지면 좋습니다.`;
      }
      return `어떤 내용으로 시작할지 고민되신다면, 학교 실습 중 가장 기억에 남거나 어려움을 극복했던 한 가지 일화를 떠올려 보세요. 편하게 첫 문장을 적어주시면 흐름에 맞게 다듬어 드리겠습니다.`;
    }
    
    let advice = `현재 작성 중이신 문장은 전공 실습에 대한 주도적인 노력이 잘 드러나 있습니다.`;
    if (topDiary) {
      advice += `\n여기에 다이어리에 기록된 '${topDiary.title}'처럼, 당시 구체적으로 다루었던 설비나 공구 명칭, 그리고 직면했던 오류를 해결한 구체적인 행동(Action)을 1~2문장 더 보강해 보세요.`;
    } else {
      advice += `\n여기에 단순히 열심히 했다는 서술보다, 당시 겪었던 구체적인 문제 상황과 이를 해결하기 위해 취했던 조치(Action)를 1~2문장 더 보강해 보세요.`;
    }
    if (targetCompany !== '지원 기업' && !trimmedAnswer.includes(targetCompany)) {
      advice += `\n마무리에는 이 경험을 통해 배운 안전 의식이 [${targetCompany}]의 현장 품질에 어떻게 기여할지 1문장으로 연결하시면 완벽합니다.`;
    }
    return advice;
  }

  // 4. "지금 어때", "평가해줘", "어때?", "봐줘", "피드백"
  if (q.includes("어때") || q.includes("어떠") || q.includes("평가") || q.includes("봐줘") || q.includes("피드백") || q.includes("진단")) {
    if (answerLen === 0) {
      return `아직 본문이 비어 있습니다. 머릿속에 떠오르는 생각을 다듬지 말고 일단 1~2문장만 편하게 적어보세요. 적어주시는 즉시 읽고 방향을 함께 잡아드리겠습니다.`;
    }
    if (answerLen < 50) {
      return `지금 "${trimmedAnswer}"라고 첫 운을 떼셨군요. 시작이 좋습니다. 아직은 분량이 짧아 전체 구성을 진단하기는 이르지만, 문장 전달력은 깔끔합니다. 이어서 당시 구체적인 계기나 본인이 맡았던 역할을 1~2문장 더 덧붙여주세요.`;
    }
    const hasNum = /[0-9]+%?|일간|개월|시간|개|차|회/.test(trimmedAnswer);
    const hasCompany = targetCompany !== '지원 기업' && trimmedAnswer.includes(targetCompany);
    let advice = `문맥의 흐름이 탄탄하고 전달하고자 하는 메시지가 뚜렷합니다. `;
    if (!hasNum) {
      advice += `팁을 드리자면, '많은 시간', '열심히' 같은 추상적인 표현 대신 '3주 동안', '팀원 3명과 함께', '오류율 15% 감소'처럼 숫자로 구체화하면 신뢰도가 크게 높아집니다.`;
    } else if (!hasCompany && targetCompany !== '지원 기업') {
      advice += `마무리 부분에 이 경험에서 얻은 직무 역량이 [${targetCompany}]의 현장에서 어떻게 쓰일 수 있을지 한 줄로 연결하면 아주 좋습니다.`;
    } else {
      advice += `문장의 종결어미를 단정형('~했습니다', '~를 배웠습니다')으로 통일하여 자신감 있는 기술 인재의 인상을 주면 더 좋습니다.`;
    }
    return advice;
  }

  // 5. 소재 추천 ("뭐써", "소재", "아이디어", "쓸게 없어")
  if (q.includes("뭐써") || q.includes("뭐 써") || q.includes("소재") || q.includes("아이디어") || q.includes("모르겠") || q.includes("쓸게") || q.includes("주제") || q.includes("추천")) {
    if (userDiaries.length > 0) {
      const titles = userDiaries.slice(0, 2).map(d => `'${d.title}'`).join(', ');
      return `${studentName}님의 성장 다이어리에 있는 ${titles} 기록을 적극 추천합니다. 실습실에서 직접 겪은 문제와 해결 과정이 담겨 있어, [${targetCompany}] 면접관에게 가장 매력적인 진짜 직무 경험으로 인정받을 수 있습니다. 이 중 어떤 경험으로 작성해 보시겠습니까?`;
    }
    if (cleanSection.includes("성장과정")) {
      return `[성장과정]은 어릴 적 이야기보다 ${studentMajor}를 선택하게 된 계기나, 실습실에서 처음 공구와 장비를 다루며 끈기를 발휘했던 순간을 소재로 잡는 것이 가장 효과적입니다.`;
    }
    if (cleanSection.includes("지원동기")) {
      return `[지원동기]는 학교에서 가장 자신 있게 다뤘던 장비나 실습 기술과, [${targetCompany}]의 생산·설비 직무에서 내가 바로 기여할 수 있는 부분을 연결하는 것이 핵심입니다.`;
    }
    return `학교 전공 실습 과제, 기능사 실기 연습 중 막혔던 순간, 동아리 제작물 발표 등 '작은 문제에 부딪혔다가 노력으로 해결해 낸 순간'이 가장 매력적인 자소서 소재입니다. 가장 기억에 남는 실습을 한 가지만 말씀해 주세요.`;
  }

  // 6. 첫 문장 팁
  if (q.includes("첫 문장") || q.includes("첫문장") || q.includes("도입부") || q.includes("시작")) {
    return `첫 문장은 무조건 '두괄식'으로 핵심 역량을 먼저 제시하는 것이 좋습니다.\n\n예시:\n- "저는 [전공 실습에서 증명한 꼼꼼한 안전 의식]을 바탕으로, [${targetCompany}]의 믿음직한 기술 인재가 되기 위해 지원했습니다."\n- "3년간 ${studentMajor}를 공부하며 쌓은 실습 경험은 제 가장 큰 경쟁력입니다."\n\n수식어구로 길게 끌지 말고, 내가 보여주고 싶은 나의 강점을 첫 문장에 선언해 보세요.`;
  }

  return `[${cleanSection}] 문항은 지원자의 진정성과 실무 잠재력을 보여주는 중요한 문항입니다. 작성 중인 내용에서 본인의 솔직한 실습 경험과 구체적인 행동(Action)을 한 문장 더 강조해 보세요. 구체적으로 어떤 문장을 다듬고 싶으신지 질문해 주시면 꼼꼼히 조언해 드리겠습니다.`;
}

export interface CoverLetterAiCoachProps {
  companyName: string;
  sectionTitle: string;
  recommendedChars: number;
  currentAnswer: string;
  userProfile?: UserProfileData | null;
  diaries?: DiaryEntry[];
  forceOpenTrigger?: { open: boolean; speak: boolean; customMessage?: string; timestamp: number };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export default function CoverLetterAiCoach({
  companyName,
  sectionTitle,
  recommendedChars,
  currentAnswer,
  userProfile: propUserProfile,
  diaries: propDiaries,
  forceOpenTrigger
}: CoverLetterAiCoachProps) {
  const { isLightMode } = useTheme();
  const { t } = useLanguage();
  const { user, userProfile: authProfile } = useAuth();

  // 대화창 열림 여부
  const [isOpenChat, setIsOpenChat] = useState<boolean>(false);
  // 외부 말풍선 표시 여부
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(true);

  // 실시간 외계인 조언 텍스트 (이모지 없음)
  const [feedbackSpeech, setFeedbackSpeech] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);

  // 노션 AI 스타일 채팅 메시지 목록
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 음성 재생 (TTS) 및 마이크 음성인식 (STT) 상태
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mystair_cover_letter_voice_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedVoice, setSelectedVoice] = useState<'sunhi' | 'injoon' | 'seohyeon'>('sunhi');
  const [isMicListening, setIsMicListening] = useState<boolean>(false);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalyzedTextRef = useRef<string>('');

  // 유저 프로필 및 다이어리 통합 (prop -> authContext -> localStorage 순서로 철저히 복구)
  const getEffectiveUserData = () => {
    const uid = user?.uid || 'local-user';
    let profile: any = propUserProfile || authProfile || {};

    if (!profile.name || !profile.major) {
      try {
        const savedMyPage = localStorage.getItem(`mystair_mypage_data_${uid}`);
        if (savedMyPage) {
          const parsed = JSON.parse(savedMyPage);
          profile = { ...profile, ...parsed };
        }
      } catch {}
      try {
        const savedMock = localStorage.getItem('mystair_mock_user');
        if (savedMock) {
          const parsedMock = JSON.parse(savedMock);
          if (!profile.name && parsedMock.displayName) profile.name = parsedMock.displayName;
        }
      } catch {}
    }

    let diariesList: DiaryEntry[] = propDiaries || [];
    if (diariesList.length === 0) {
      try {
        const savedDiaries = localStorage.getItem(`mystair_local_diaries_${uid}`);
        if (savedDiaries) {
          diariesList = JSON.parse(savedDiaries);
        }
      } catch {}
    }

    return { profile, diariesList };
  };

  const { profile: effectiveProfile, diariesList: effectiveDiaries } = getEffectiveUserData();
  const studentName = effectiveProfile?.name || '지원자';

  // 시간 포맷 (오전/오후 H:MM)
  const getCurrentTimeStr = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${period} ${displayHours}:${minutes}`;
  };

  // AI 음성 (TTS) 재생 중단
  const stopAiVoice = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  // AI 음성 발화 (Edge-TTS 서버 API 우선 사용, 실패 시 브라우저 내장 Web Speech synthesis 폴백)
  const speakAiVoice = async (text: string, msgId: string = 'general') => {
    if (typeof window === 'undefined') return;

    // 만약 현재 재생 중인 발화와 동일한 버튼을 누르면 정지(토글)
    if (isSpeaking && speakingMsgId === msgId) {
      stopAiVoice();
      return;
    }

    stopAiVoice();

    const cleanText = (text || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) return;

    setIsSpeaking(true);
    setSpeakingMsgId(msgId);

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${selectedVoice}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        speakWithClientFallback(cleanText, msgId);
      };

      await audio.play();
    } catch {
      speakWithClientFallback(cleanText, msgId);
    }
  };

  // 클라이언트 브라우저 Web Speech 폴백
  const speakWithClientFallback = (text: string, msgId: string = 'general') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = selectedVoice === 'injoon' ? 0.95 : 1.05;

      const voices = window.speechSynthesis.getVoices();
      const koVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KO'));
      if (koVoices.length > 0) {
        if (selectedVoice === 'injoon') {
          const male = koVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('남성'));
          utterance.voice = male || koVoices[0];
        } else {
          const female = koVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('여성'));
          utterance.voice = female || koVoices[0];
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
  };

  // 음성 안내 ON/OFF 토글
  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mystair_cover_letter_voice_enabled', String(next));
      } catch {}
      if (!next) {
        stopAiVoice();
      }
      return next;
    });
  };

  // 마이크 음성인식 (STT) 시작/중지
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('현재 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome 환경을 권장합니다.'));
      return;
    }

    if (isMicListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsMicListening(false);
      return;
    }

    stopAiVoice();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsMicListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuestion(transcript);
        }
      };

      recognition.onerror = () => {
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // 언마운트 시 오디오 및 음성인식 리소스 해제
  useEffect(() => {
    return () => {
      stopAiVoice();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // 외부(상위 컴포넌트)에서 AI 조언 및 음성 발화 트리거 시 작동
  useEffect(() => {
    if (forceOpenTrigger && forceOpenTrigger.timestamp > 0) {
      if (forceOpenTrigger.open) {
        setIsOpenChat(true);
      }
      if (forceOpenTrigger.customMessage) {
        const msgId = `msg-trigger-${forceOpenTrigger.timestamp}`;
        setMessages(prev => [
          ...prev,
          {
            id: msgId,
            sender: 'ai',
            text: forceOpenTrigger.customMessage || '',
            time: getCurrentTimeStr()
          }
        ]);
        if (forceOpenTrigger.speak) {
          setTimeout(() => {
            speakAiVoice(forceOpenTrigger.customMessage || '', msgId);
          }, 350);
        }
      } else {
        const targetText = feedbackSpeech || defaultSpeech;
        if (forceOpenTrigger.speak && targetText) {
          setTimeout(() => {
            speakAiVoice(targetText, 'speech-bubble');
          }, 300);
        }
      }
    }
  }, [forceOpenTrigger]);

  // 초기 웰컴 메시지 (노션 AI 스타일)
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = studentName && studentName !== '지원자'
        ? `안녕하세요, ${studentName}님! MyStair AI 코치입니다.\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 무엇이든 질문해 주세요. 음성 듣기 버튼으로 편하게 들으실 수도 있습니다.`
        : `안녕하세요! MyStair AI 코치입니다.\n지금 작성 중인 [${sectionTitle || '자기소개서'}]에 대해 무엇이든 편하게 물어보세요.`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: greeting,
          time: getCurrentTimeStr()
        }
      ]);
    }
  }, [sectionTitle, studentName]);

  // 스크롤 최하단 자동 이동
  useEffect(() => {
    if (isOpenChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpenChat, isAnswering]);

  // 실시간 외계인 말풍선 피드백 자동 조회
  const fetchFeedback = async (force: boolean = false) => {
    const trimmed = (currentAnswer || '').trim();
    if (!force && trimmed === lastAnalyzedTextRef.current) return;

    lastAnalyzedTextRef.current = trimmed;
    setIsLoadingFeedback(true);

    try {
      const res = await fetch('/api/cover-letter/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          sectionTitle,
          recommendedChars,
          currentAnswer: trimmed,
          actionType: 'realtime_feedback',
          userProfile: effectiveProfile,
          diaries: effectiveDiaries
        })
      });

      if (res.ok) {
        const data = await res.json();
        const speech = data?.feedback?.speech || data?.feedback?.summary || (data?.feedback?.tips && data.feedback.tips[0]) || '';
        if (speech) {
          const cleaned = speech.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
          setFeedbackSpeech(cleaned);
          // 음성 자동 안내가 켜져 있으면 실시간으로 음성 발화
          if (isVoiceEnabled && cleaned) {
            speakAiVoice(cleaned, 'speech-bubble');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI coaching:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchFeedback();
    }, 1200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentAnswer, sectionTitle, companyName]);

  useEffect(() => {
    lastAnalyzedTextRef.current = '';
    fetchFeedback(true);
  }, [sectionTitle, companyName]);

  // 질문 전송 처리 (마이페이지 및 다이어리 정보 함께 전송)
  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuestion).trim();
    if (!query || isAnswering) return;

    stopAiVoice();
    if (isMicListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsMicListening(false);
    }

    const timeStr = getCurrentTimeStr();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsAnswering(true);

    let responseText = '';
    let fetchSuccess = false;

    // 1. Try to fetch from server-side coach endpoint
    try {
      const res = await fetch('/api/cover-letter/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          sectionTitle,
          recommendedChars,
          currentAnswer,
          actionType: 'ask_question',
          userQuestion: query,
          userProfile: effectiveProfile,
          diaries: effectiveDiaries
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawAns = data.answer || data.response || data.feedback?.speech || data.feedback?.summary || data.text || '';
        if (rawAns) {
          responseText = rawAns;
          fetchSuccess = true;
        }
      }
    } catch (serverErr) {
      console.warn('Server endpoint /api/cover-letter/coach failed, trying client fallback...', serverErr);
    }

    // 2. If server API failed or was empty, fallback to client-side direct GoogleGenAI (matching MyStair AI)
    if (!fetchSuccess) {
      try {
        responseText = await generateClientCoachAnswer(
          query,
          effectiveProfile,
          effectiveDiaries,
          currentAnswer,
          companyName,
          sectionTitle,
          recommendedChars
        );
        fetchSuccess = true;
      } catch (clientErr) {
        console.warn('Client-side direct Gemini failed, using high-fidelity heuristic rule engine:', clientErr);
      }
    }

    // 3. If direct Gemini also failed (e.g. key disabled), fallback to the highly customized local rule engine!
    if (!fetchSuccess || !responseText) {
      responseText = generateLocalFallbackAnswer(
        query,
        companyName,
        sectionTitle,
        currentAnswer,
        effectiveProfile,
        effectiveDiaries
      );
    }

    // Clean any unwanted emojis/special characters and trim
    let cleanedAnswer = (responseText || t('실천 가능한 문장으로 구체적인 살을 붙여보세요.')).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const aiMsgId = `ai-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: cleanedAnswer,
      time: getCurrentTimeStr()
    };
    setMessages(prev => [...prev, aiMsg]);

    // Speak if voice enabled or speak button triggered
    if (isVoiceEnabled) {
      speakAiVoice(cleanedAnswer, aiMsgId);
    }
    setIsAnswering(false);
  };

  // 대화 초기화
  const handleResetChat = () => {
    stopAiVoice();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `대화가 초기화되었습니다. [${sectionTitle || '자기소개서'}] 작성 중 고민되는 점을 편하게 질문해 주세요.`,
        time: getCurrentTimeStr()
      }
    ]);
  };

  // 복사 기능
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // 외계인 말풍선 텍스트 (이모지 없음)
  const defaultSpeech = currentAnswer.trim().length === 0
    ? t(`머릿속에 떠오르는 생각을 다듬지 말고 편하게 적어보세요. 실시간으로 읽고 보완할 점을 음성과 텍스트로 바로 짚어드리겠습니다.`)
    : t(`작성하신 내용을 살펴보고 있습니다. 잠시만 기다려주세요.`);
  const speechText = feedbackSpeech || defaultSpeech;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
      
      {/* ========================================================================= */}
      {/* 1. 노션 AI 스타일 미니멀 대화창 (클릭 시 열림)                              */}
      {/* ========================================================================= */}
      {isOpenChat && (
        <div 
          className={`pointer-events-auto relative mb-3 w-[360px] sm:w-[400px] md:w-[430px] h-[540px] max-h-[82vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-400/25" 
              : "bg-slate-900 text-slate-100 border-slate-800 shadow-black/70"
          }`}
        >
          {/* 노션 AI 스타일 초간결 헤더 및 음성 컨트롤 */}
          <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isLightMode ? "border-slate-100 bg-white" : "border-slate-800 bg-slate-900/90"
          }`}>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-bold flex items-center gap-1 ${isLightMode ? "text-slate-800" : "text-white"}`}>
                <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                MyStair AI 코치
              </span>
              <span className={isLightMode ? "text-slate-400" : "text-slate-500"}>·</span>
              <span className={`text-[11px] font-semibold truncate max-w-[120px] ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                {sectionTitle || '실시간 코칭'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={handleResetChat}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                }`}
                title={t('대화 초기화')}
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopAiVoice();
                  setIsOpenChat(false);
                }}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                }`}
                title={t('닫기')}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* 노션 AI 스타일 메시지 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-[13.5px]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                {msg.sender === 'user' ? (
                  /* 사용자 메시지: 우측 알약 버블 */
                  <div className="flex justify-end">
                    <div className={`px-3.5 py-2 rounded-2xl rounded-tr-xs text-[13px] leading-relaxed max-w-[85%] font-medium ${
                      isLightMode 
                        ? "bg-indigo-600 text-white shadow-xs" 
                        : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  /* AI 메시지: 박스 없이 배경 위에 직접 자연스럽게 배치되는 타이포그래피 */
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center justify-between">
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                        <Sparkles size={11} className="text-indigo-500" />
                        <span>MyStair AI · {msg.time}</span>
                      </div>

                      {/* 실시간 음성 읽어주기 버튼 */}
                      <button
                        type="button"
                        onClick={() => speakAiVoice(msg.text, msg.id)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isSpeaking && speakingMsgId === msg.id
                            ? "bg-rose-500 text-white animate-pulse shadow-xs"
                            : isLightMode
                              ? "bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600"
                              : "bg-slate-800 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300"
                        }`}
                        title={isSpeaking && speakingMsgId === msg.id ? t('음성 정지') : t('AI 음성으로 듣기')}
                      >
                        {isSpeaking && speakingMsgId === msg.id ? (
                          <>
                            <Square size={10} className="fill-current" />
                            <span>{t('정지')}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} className="text-indigo-500" />
                            <span>{t('듣기')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className={`leading-relaxed whitespace-pre-line font-medium ${
                      isLightMode ? "text-slate-900" : "text-slate-100"
                    }`}>
                      {msg.text}
                    </p>

                    {/* 노션 AI 하단 아이콘 (복사, 좋아요) */}
                    <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                        }`}
                        title={t('복사')}
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                      <button
                        type="button"
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isLightMode ? "hover:text-slate-800 hover:bg-slate-100" : "hover:text-white hover:bg-slate-800"
                        }`}
                        title={t('좋아요')}
                      >
                        <ThumbsUp size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 생각 중 인디케이터 */}
            {isAnswering && (
              <div className="space-y-1 pr-2">
                <div className={`text-[11px] font-bold ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  MyStair AI · {t('답변 생성 중...')}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 빠른 질문 추천 칩 (다이어리 및 소재 추천) */}
          <div className="px-3 py-1 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage('지금 쓴 내용 어때?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('지금 어때?')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('내 다이어리 기록 중 어떤 소재를 쓰면 좋을까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('다이어리 소재 추천')}
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('첫 문장 어떻게 시작할까?')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1 ${
                isLightMode 
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
            >
              <Plus size={10} className="text-slate-400" />
              {t('첫 문장 팁')}
            </button>
          </div>

          {/* 노션 AI 스타일 하단 인풋 박스 (마이크 음성 입력 지원) */}
          <div className="p-3 pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`rounded-2xl border p-2 flex flex-col gap-1.5 transition-all focus-within:ring-1 focus-within:ring-indigo-500 ${
                isLightMode 
                  ? "bg-slate-50/90 border-slate-200" 
                  : "bg-slate-800/80 border-slate-700"
              }`}
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={isMicListening ? t('🎙️ 마이크로 말씀하세요...') : t('MyStair AI에게 질문하기... (음성 마이크 지원)')}
                className={`w-full px-1.5 py-1 bg-transparent text-[13px] outline-none font-medium ${
                  isLightMode ? "text-slate-900 placeholder:text-slate-400" : "text-white placeholder:text-slate-400"
                }`}
              />

              <div className="flex items-center justify-between pt-0.5">
                <span className={`text-[10px] font-bold px-1 ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>
                  {sectionTitle ? `[${sectionTitle}]` : '실시간 코치'}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* 마이크 음성 질문 버튼 */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isMicListening
                        ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/40"
                        : (isLightMode ? "text-slate-400 hover:text-indigo-600 hover:bg-slate-200" : "text-slate-400 hover:text-indigo-400 hover:bg-slate-700")
                    }`}
                    title={isMicListening ? t('음성 듣는 중... (클릭하여 중지)') : t('마이크 음성으로 질문하기')}
                  >
                    {isMicListening ? <MicOff size={13} /> : <Mic size={13} />}
                  </button>

                  {/* 전송 버튼 */}
                  <button
                    type="submit"
                    disabled={isAnswering || !inputQuestion.trim()}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inputQuestion.trim() && !isAnswering
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        : (isLightMode ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-50" : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50")
                    }`}
                    title={t('전송')}
                  >
                    <ArrowUp size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 외계인 실시간 피드백 말풍선 (채팅창이 닫혀 있을 때 표시)                   */}
      {/* ========================================================================= */}
      {!isOpenChat && showSpeechBubble && (
        <div 
          onClick={() => setIsOpenChat(true)}
          className={`pointer-events-auto group relative mb-3 p-4 sm:p-4.5 rounded-2xl rounded-br-xs shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-[320px] sm:max-w-[370px] cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${
            isLightMode 
              ? "bg-white text-slate-800 border-slate-200/90 shadow-slate-300/40 hover:border-slate-400/60" 
              : "bg-slate-900 text-slate-100 border-slate-700/90 shadow-black/60 hover:border-slate-500/60"
          }`}
          title={t('클릭하여 대화창 열기')}
        >
          {/* 말풍선 꼬리 */}
          <div 
            className={`absolute -bottom-1.5 right-6 w-3.5 h-3.5 transform rotate-45 border-r border-b ${
              isLightMode 
                ? "bg-white border-slate-200/90" 
                : "bg-slate-900 border-slate-700/90"
            }`} 
          />

          {isLoadingFeedback ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-0.5">
              <RefreshCw size={12} className="animate-spin text-slate-400 shrink-0" />
              <span>{t('작성 내용을 읽고 있습니다...')}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={12} />
                  MyStair 실시간 AI 코칭
                </span>
                <span className="text-[10px] text-slate-400">
                  {sectionTitle ? `[${sectionTitle}]` : ''}
                </span>
              </div>

              <p className="text-[13px] sm:text-[13.5px] leading-relaxed font-medium whitespace-pre-line tracking-tight">
                {speechText}
              </p>

              {/* 음성으로 듣기 버튼 및 액션 바 */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakAiVoice(speechText, 'speech-bubble');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isSpeaking && speakingMsgId === 'speech-bubble'
                      ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                      : isLightMode
                        ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800"
                  }`}
                  title={isSpeaking && speakingMsgId === 'speech-bubble' ? t('음성 정지') : t('AI 음성으로 조언 듣기')}
                >
                  {isSpeaking && speakingMsgId === 'speech-bubble' ? (
                    <>
                      <Square size={11} className="fill-current" />
                      <span>{t('음성 정지')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} className="text-indigo-500 dark:text-indigo-400" />
                      <span>{t('AI 음성 듣기')}</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {t('클릭하여 질문하기 →')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 우측 하단 외계인 캐릭터 (클릭 시 노션 AI 스타일 대화창 토글)              */}
      {/* ========================================================================= */}
      <div className="relative">
        {/* 음성 말하는 중일 때 외계인 주변 음파 링 이펙트 */}
        {isSpeaking && (
          <span className="absolute -inset-2 rounded-full border-2 border-indigo-400/80 animate-ping pointer-events-none" />
        )}

        <button
          type="button"
          onClick={() => {
            if (isOpenChat) {
              stopAiVoice();
              setIsOpenChat(false);
            } else {
              setIsOpenChat(true);
            }
          }}
          className={`pointer-events-auto p-0 bg-transparent border-0 outline-none cursor-pointer group transition-transform duration-300 hover:scale-115 active:scale-95 animate-float-alien ${
            isSpeaking ? "scale-110" : ""
          }`}
          title={isOpenChat ? t('대화창 닫기') : t('MyStair AI 대화하기')}
        >
          <AlienUFOSvg className={`w-14 h-14 sm:w-16 sm:h-16 transition-all ${
            isSpeaking 
              ? "drop-shadow-[0_10px_25px_rgba(99,102,241,0.9)] scale-105" 
              : "drop-shadow-[0_8px_18px_rgba(56,189,248,0.55)] group-hover:drop-shadow-[0_10px_24px_rgba(56,189,248,0.8)]"
          }`} />
        </button>
      </div>

    </div>
  );
}

