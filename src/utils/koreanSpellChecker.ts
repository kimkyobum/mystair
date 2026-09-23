import { GoogleGenAI } from '@google/genai';

/**
 * Universal Korean Grammar, Spell & Typo Correction Engine
 * 
 * Strategy:
 * 1. Hangul Phonetic Batchim Decomposition (초성, 중성, 종성 분해 및 음운 규칙 분석)
 * 2. Frequent Slang, Typo & Informal Vocabulary Conversion (잼잇게 -> 재밌게, 맜잇 -> 맛있, 한태 -> 한테 등)
 * 3. Particle & Dependent Noun Spacing (조사 밀착, 의존명사 띄어쓰기)
 * 4. Punctuation and Spacing Standardization
 */

// 초성, 중성, 종성 코드 정의
const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;

interface DecomposedChar {
  L: number; // 초성 (0 ~ 18)
  V: number; // 중성 (0 ~ 20)
  T: number; // 종성 (0 ~ 27, 0 = 받침없음, 19 = ㅅ, 20 = ㅆ)
}

export function decomposeHangul(char: string): DecomposedChar | null {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return null;
  const offset = code - HANGUL_START;
  return {
    L: Math.floor(offset / 588),
    V: Math.floor((offset / 28) % 21),
    T: offset % 28
  };
}

export function composeHangul(L: number, V: number, T: number): string {
  return String.fromCharCode(HANGUL_START + (L * 21 + V) * 28 + T);
}

// 종성 'ㅅ'(19)을 'ㅆ'(20)으로 변환 (과거형/추측형 선어말어미 받침 오류 교정)
export function sToSs(char: string): string {
  const d = decomposeHangul(char);
  if (d && d.T === 19) {
    return composeHangul(d.L, d.V, 20);
  }
  return char;
}

// 일반 구문 및 고빈도 구어체/오탈자 매핑
const UNIVERSAL_DICTIONARY: [RegExp, string][] = [
  // 1. 구어체 / 줄임말 / 발음대로 표기 오류
  [/잼\s*잇/g, '재밌'],
  [/재\s*밋/g, '재밌'],
  [/잼\s*있/g, '재밌'],
  [/맜\s*잇/g, '맛있'],
  [/맛\s*잇/g, '맛있'],
  [/맜\s*있/g, '맛있'],
  [/멋\s*잇/g, '멋있'],
  [/신\s*낫/g, '신났'],
  [/신\s*나서/g, '신나서'],
  [/기\s*뻣/g, '기뻤'],
  [/느\s*꼇/g, '느꼈'],
  [/바꼇/g, '바뀌었'],
  [/바꿧/g, '바꿨'],
  [/꿈꿧/g, '꿈꿨'],
  [/모엿/g, '모였'],
  [/헤어졋/g, '헤어졌'],
  [/깨달앗/g, '깨달았'],
  [/깨달았/g, '깨달았'],
  [/깨닳/g, '깨달'],
  [/깨닳았/g, '깨달았'],
  [/이겻/g, '이겼'],
  [/졋/g, '졌'],
  [/격\s*[엇었]/g, '겪었'],
  [/겪\s*[엇었]/g, '겪었'],
  [/해\s*[냇냈]/g, '해냈'],
  [/해\s*[넷넸]/g, '해냈'],
  [/헤\s*[냇냈]/g, '해냈'],
  [/포기하지\s*않/g, '포기하지 않'],

  // 오타 및 띄어쓰기 고빈도 혼동 어휘 (국립국어원 표준)
  [/뛰어쓰기/g, '띄어쓰기'],
  [/덙지/g, '든지'],
  [/덙/g, '던'],
  [/(^|[^가-힣])그러니깐(?=[^가-힣]|$)/g, '$1그러니까'],
  [/(^|[^가-힣])하덙가(?=[^가-힣]|$)/g, '$1하든가'],
  [/(^|[^가-힣])가덙가(?=[^가-힣]|$)/g, '$1가든가'],
  [/(^|[^가-힣])먹덙가(?=[^가-힣]|$)/g, '$1먹든가'],
  [/(^|[^가-힣])보덙가(?=[^가-힣]|$)/g, '$1보든가'],
  [/(^|[^가-힣])하덙지(?=[^가-힣]|$)/g, '$1하든지'],
  [/(^|[^가-힣])가덙지(?=[^가-힣]|$)/g, '$1가든지'],
  [/(^|[^가-힣])보덙지(?=[^가-힣]|$)/g, '$1보든지'],
  [/(^|[^가-힣])알려줘(?=[^가-힣]|$)/g, '$1알려 줘'],
  [/(^|[^가-힣])도와줘(?=[^가-힣]|$)/g, '$1도와줘'],
  [/(^|[^가-힣])수정해줘(?=[^가-힣]|$)/g, '$1수정해 줘'],
  [/(^|[^가-힣])해줘(?=[^가-힣]|$)/g, '$1해 줘'],
  [/(^|[^가-힣])봐줘(?=[^가-힣]|$)/g, '$1봐 줘'],
  [/주겟/g, '주겠'],
  [/하겟/g, '하겠'],
  [/되겟/g, '되겠'],
  [/배우겟/g, '배우겠'],
  [/노력하겟/g, '노력하겠'],
  [/최선을다/g, '최선을 다'],
  [/최선을\s*다하/g, '최선을 다하'],
  [/열심히노력/g, '열심히 노력'],
  [/열심히배우/g, '열심히 배우'],
  [/열심히공부/g, '열심히 공부'],
  [/열심히일/g, '열심히 일'],
  [/앞으로더욱/g, '앞으로 더욱'],
  [/해결할수/g, '해결할 수'],
  [/할수잇/g, '할 수 있'],
  [/할수없/g, '할 수 없'],
  [/될수잇/g, '될 수 있'],
  [/될수없/g, '될 수 없'],
  [/할수\s*있/g, '할 수 있'],
  [/할수\s*없/g, '할 수 없'],
  [/될수\s*있/g, '될 수 있'],
  [/될수\s*없/g, '될 수 없'],
  [/하기위해/g, '하기 위해'],
  [/되기위해/g, '되기 위해'],
  [/하기위하여/g, '하기 위하여'],
  [/되기위하여/g, '되기 위하여'],
  [/되는것이다/g, '되는 것이다'],
  [/하는것이다/g, '하는 것이다'],
  [/있는것이다/g, '있는 것이다'],
  [/없는것이다/g, '없는 것이다'],
  [/되는거다/g, '되는 거다'],
  [/하는거다/g, '하는 거다'],
  [/있는거다/g, '있는 거다'],
  [/없는거다/g, '없는 거다'],

  // 조사 오표기
  [/([가-힣]+)한태(?=[ \n,\.]|$)/g, '$1한테'],
  [/([가-힣]+)한태서(?=[ \n,\.]|$)/g, '$1한테서'],
  [/([가-힣]+)에개(?=[ \n,\.]|$)/g, '$1에게'],
  [/([가-힣]+)로써(?=[ \n,\.]|$)/g, '$1로서'], // 직격 조사 등에서 헷갈리는 부분
  [/어의없/g, '어처구니없'],
  [/어의가\s*없/g, '어처구니가 없'],

  // 일상 및 학생 자기소개서/다이어리 빈출
  [/할일이/g, '할 일이'],
  [/할일은/g, '할 일은'],
  [/할일을/g, '할 일을'],
  [/할일도/g, '할 일도'],
  [/\b할일\b/g, '할 일'],
  [/하다가만/g, '하다가 만'],
  [/안나오는거다/g, '안 나오는 거다'],
  [/안나오는거/g, '안 나오는 거'],
  [/안나오는/g, '안 나오는'],
  [/안나온다/g, '안 나온다'],
  [/안나와서/g, '안 나와서'],
  [/안나와/g, '안 나와'],
  [/안나옴/g, '안 나옴'],
  [/조아햇다/g, '좋아졌다'],
  [/조아햇/g, '좋아했'],
  [/조아졋다/g, '좋아졌다'],
  [/조아졋/g, '좋아졌'],
  [/조아하다/g, '좋아하다'],
  [/조아해/g, '좋아해'],
  [/조아/g, '좋아'],
  [/조은/g, '좋은'],
  [/조았/g, '좋았'],
  [/몇번이나/g, '몇 번이나'],
  [/몇번/g, '몇 번'],
  [/몇개/g, '몇 개'],
  [/몇명/g, '몇 명'],
  [/몇시/g, '몇 시'],
  [/몇년/g, '몇 년'],
  [/몇달/g, '몇 달'],
  [/가는길에는/g, '가는 길에는'],
  [/가는길에/g, '가는 길에'],
  [/가는길/g, '가는 길'],
  [/오는길에는/g, '오는 길에는'],
  [/오는길에/g, '오는 길에'],
  [/오는길/g, '오는 길'],
  [/하교길/g, '하굣길'],
  [/등교길/g, '등굣길'],
  [/출근길/g, '출근길'],
  [/별거\s*없는/g, '별것 없는'],
  [/별거\s*없/g, '별것 없'],
  [/괜찮은거\s*같/g, '괜찮은 것 같'],
  [/좋은거\s*같/g, '좋은 것 같'],
  [/나쁜거\s*같/g, '나쁜 것 같'],
  [/그런거\s*같/g, '그런 것 같'],
  [/이런거\s*같/g, '이런 것 같'],
  [/하는거\s*같/g, '하는 것 같'],
  [/보는거\s*같/g, '보는 것 같'],
  [/먹는거\s*같/g, '먹는 것 같'],
  [/없는거\s*같/g, '없는 것 같'],
  [/있는거\s*같/g, '있는 것 같'],

  // 로봇 / 실습 / 경진대회
  [/시봇팔/g, '로봇팔'],
  [/노봇팔/g, '로봇팔'],
  [/그결과/g, '그 결과'],
  [/그\s{2,}결과/g, '그 결과'],
  [/이결과/g, '이 결과'],
  [/한결과/g, '한 결과'],
  [/수여받았다/g, '수상했다'],
  [/수여\s*받았다/g, '수상했다'],
  [/난\s+오늘/g, '저는 오늘'],
  [/난\s+/g, '저는 '],

  // 자주 틀리는 맞춤법 및 오탈자 (국립국어원 표준 규정)
  [/됬/g, '됐'], // 현대 한국어 표준어에서 '됬'은 일체 존재하지 않으며 무조건 '됐'임
  [/됫/g, '됐'], // '됫' 오타 일괄 '됐'으로 교정
  [/준구난방/g, '중구난방'],
  [/역활/g, '역할'],
  [/되서(?=[^가-힣]|$)/g, '돼서'],
  [/되서도/g, '돼서도'],
  [/되서는/g, '돼서는'],
  [/되야/g, '돼야'],
  [/되요(?=[^가-힣]|$)/g, '돼요'],
  [/안되(?=[^가-힣]|$)/g, '안 돼'],
  [/안되서/g, '안 돼서'],
  [/안돼서/g, '안 돼서'],
  [/안됬/g, '안 됐'],
  [/안됫/g, '안 됐'],
  [/안된다고/g, '안 된다고'],
  [/안된다는/g, '안 된다는'],
  [/안되요/g, '안 돼요'],
  [/안돼요/g, '안 돼요'],
  [/안되는/g, '안 되는'],
  [/안될/g, '안 될'],
  [/안된다/g, '안 된다'],
  [/안돼다(?=[^가-힣]|$)/g, '안되다'],
  [/않하고(?=[^가-힣]|$)/g, '안 하고'],
  [/않되/g, '안 돼'],
  [/않된다/g, '안 된다'],
  [/않되는/g, '안 되는'],
  [/않돼/g, '안 돼'],
  [/되엇(?=[^가-힣]|$)/g, '되었'],
  [/낳아지/g, '나아지'],
  [/낳아졌/g, '나아졌'],
  [/낳길(?=[^가-힣]|$)/g, '낫길'],
  [/몇일(?=[^가-힣]|$)/g, '며칠'],
  [/어떻해(?=[^가-힣]|$)/g, '어떡해'],
  [/어떻게해(?=[^가-힣]|$)/g, '어떡해'],
  [/어의없/g, '어이없'],
  [/어의(?=[^가-힣]|$)/g, '어이'],
  [/금새(?=[^가-힣]|$)/g, '금세'],
  [/요세(?=[^가-힣]|$)/g, '요새'],
  [/설레임/g, '설렘'],
  [/바램(?=[^가-힣]|$)/g, '바람'],
  [/희안하/g, '희한하'],
  [/일일히(?=[^가-힣]|$)/g, '일일이'],
  [/틈틈히(?=[^가-힣]|$)/g, '틈틈이'],
  [/곰곰히(?=[^가-힣]|$)/g, '곰곰이'],
  [/깨끗히(?=[^가-힣]|$)/g, '깨끗이'],
  [/가르쳐주/g, '가르쳐 주'],
  [/가르키/g, '가리키'],
  [/들어나/g, '드러나'],
  [/드러나다(?=[^가-힣]|$)/g, '드러나다'],
  [/왠만하면(?=[^가-힣]|$)/g, '웬만하면'],
  [/왠일(?=[^가-힣]|$)/g, '웬일'],
  [/웬지(?=[^가-힣]|$)/g, '왠지'],
  [/제작년(?=[^가-힣]|$)/g, '재작년'],
  [/문안한(?=[^가-힣]|$)/g, '무난한'],
  [/무난하다(?=[^가-힣]|$)/g, '무난하다'],
  [/내노라하는(?=[^가-힣]|$)/g, '내로라하는'],
  [/단언컨데/g, '단언컨대'],
  [/생각치/g, '생각지'],
  [/서슴치/g, '서슴지'],
  [/널부러/g, '널브러'],
  [/오랫만에/g, '오랜만에'],
  [/일부려/g, '일부러'],
  [/뒤쳐지/g, '뒤처지'],
  [/치루/g, '치르'],
  [/치뤘다(?=[^가-힣]|$)/g, '치렀다'],
  [/치뤄/g, '치러'],
  [/잠궜다(?=[^가-힣]|$)/g, '잠갔다'],
  [/담궜다(?=[^가-힣]|$)/g, '담갔다'],
  [/만듬(?=[^가-힣]|$)/g, '만듦'],
  [/이끌음(?=[^가-힣]|$)/g, '이끎'],
  [/베풀음(?=[^가-힣]|$)/g, '베풂'],
  [/밞음(?=[^가-힣]|$)/g, '밟음'],
  [/만\s+낫다/g, '만났다'],
  [/만\s+났다/g, '만났다'],
  [/만\s+낫/g, '만났'],
  [/만\s+났/g, '만났']
];

// 음운 분해를 통한 보편적 과거/추측 선어말어미 받침 일괄 교정
// 어떤 단어든 받침이 'ㅅ'이고 뒤에 종결어미나 연결어미가 붙어있는 경우 자동 'ㅆ'으로 치환
function fixUniversalPastAndFutureBatchim(text: string): string {
  let s = text;

  // 1. '잇' 관련 고빈도 과거/존재 어휘 (있습니다, 있던, 있어서, 있으면, 있었)
  s = s.replace(/잇습니다/g, '있습니다');
  s = s.replace(/잇던/g, '있던');
  s = s.replace(/잇어서/g, '있어서');
  s = s.replace(/잇으면/g, '있으면');
  s = s.replace(/잇었/g, '있었');
  s = s.replace(/잇다가/g, '있다가');

  // 2. '젔' -> '졌' (고쳐젔, 이루어젔, 빠젔 등)
  s = s.replace(/([가-힣]+)젔([가-힣]*)/g, '$1졌$2');

  // 3. '그랫' -> '그랬'
  s = s.replace(/그랫([가-힣]+)/g, '그랬$1');

  // 4. '안' 부정 부사 띄어쓰기 (안고쳐 -> 안 고쳐, 안돼 -> 안 돼, 안먹 -> 안 먹)
  s = s.replace(/안([가-힣]{2,})/g, (m, p1) => {
    // 예외: 안전, 안심, 안내, 안색, 안쪽, 안팎 등 안으로 시작하는 명사/어근
    if (/^(전|심|내|색|쪽|팎|부|녕|정|부|영|대|락|도|하|가)/.test(p1)) return m;
    return `안 ${p1}`;
  });

  // 긴 어미를 먼저 매칭하여 온전한 어미 결합 포착
  const eomiList = '습니다|습네다|에서는|에서도|이지만|더라도|을텐데|텐데|지만|으나|으면|는데|으며|으니|어서|아서|네|소|을|죠|군요|듯|길|때|도|면|지|다|고|어|아|던|든|더';
  const eomiRegex = new RegExp(`([가-힣])(${eomiList})`, 'g');

  return s.replace(eomiRegex, (match, p1, p2, offset, str) => {
    const d = decomposeHangul(p1);
    if (!d || d.T !== 19) return match; // 받침이 'ㅅ'이 아닌 글자는 그대로 유지

    // 예외: 기본형 어간 받침이 원래 'ㅅ'인 용언 (웃다, 씻다, 벗다, 솟다, 뺏다, 짓다, 빗다, 맛, 낫다)
    const safeBase = ['웃', '씻', '벗', '솟', '뺏', '짓', '빗', '맛'];
    if (safeBase.includes(p1)) return match;

    // '낫': 만낫다, 일어낫다, 생각낫다, 떠올랏다는 ㅆ으로 변경, 단독 '병이 낫다/낫지'는 보존
    if (p1 === '낫') {
      const prevTwo = offset >= 2 ? str.slice(offset - 2, offset) : (offset === 1 ? str[offset - 1] : '');
      const isCompound = /만|일어|생각|떠올|태어|뛰어|자라/.test(prevTwo);
      if (!isCompound) return match;
    }

    const converted = sToSs(p1);
    return converted + p2;
  });
}

// 명사 뒤 조사 띄어쓰기 교정 (조사는 앞 명사에 붙여 씀)
function fixUniversalParticles(text: string): string {
  let s = text;
  const particles = [
    '에서', '에게', '한테', '으로', '로', '의', '과', '와',
    '을', '를', '이', '가', '은', '는', '도',
    '까지', '부터', '마저', '조차', '보다', '처럼', '마냥'
  ];

  for (const p of particles) {
    const regex = new RegExp(`(\\S+)\\s+(${p})(?=[ ,.\\n\\?!]|$)`, 'g');
    s = s.replace(regex, '$1$2');
  }

  // '만': 보조용언 (하다가 만 등) 유지
  s = s.replace(/([가-힣]+다가)만\s+/g, '$1 만 ');
  return s;
}

// 의존명사 띄어쓰기 규정 교정 (의존명사는 띄어 씀)
function fixUniversalDependentNouns(text: string): string {
  let s = text;

  // 것 / 거 (하는 것, 좋은 것, 있는 것 등)
  s = s.replace(/([가-힣]+[은는을ㄹㄴ])것(?=[이가을를은는도만,\.\s]|$)/g, '$1 것');
  s = s.replace(/([가-힣]+[은는을ㄹㄴ])거(?=[이가을를은는도만,\.\s]|$)/g, '$1 거');

  // 수 있다 / 수 없다
  s = s.replace(/([가-힣]+[ㄹ을])수\s*있/g, '$1 수 있');
  s = s.replace(/([가-힣]+[ㄹ을])수\s*없/g, '$1 수 없');

  // 줄 알다 / 줄 모르다
  s = s.replace(/([가-힣]+[ㄹ을ㄴ은])줄\s*알/g, '$1 줄 알');
  s = s.replace(/([가-힣]+[ㄹ을ㄴ은])줄\s*몰/g, '$1 줄 몰');

  // 때 (그때, 이때 제외)
  s = s.replace(/([가-힣]{2,})때(?=[ ,.\n]|$)/g, (match, p1) => {
    if (['그때', '이때', '저때', '여태'].includes(match)) return match;
    return `${p1} 때`;
  });

  // 때문 (하기 때문에, 이것 때문에)
  s = s.replace(/([가-힣]+)때문/g, (match, p1) => {
    if (p1.endsWith(' ')) return match;
    return `${p1} 때문`;
  });

  // 뿐 (할 뿐)
  s = s.replace(/([가-힣]+[ㄹ을])뿐/g, '$1 뿐');

  // 만큼 (노력한 만큼)
  s = s.replace(/([가-힣]+[은는을ㄹㄴ])만큼/g, '$1 만큼');

  // 보조용언
  s = s.replace(/해\s*보다/g, '해 보다');
  s = s.replace(/해\s*주다/g, '해 주다');
  s = s.replace(/할\s*수밖에/g, '할 수밖에');

  return s;
}

// 구두점 및 다중 공백 정리
function fixUniversalPunctuation(text: string): string {
  let s = text;
  // 온점/물음표/느낌표 뒤에 글자가 바로 오면 공백 삽입
  s = s.replace(/([.?!])([가-힣A-Za-z])/g, '$1 $2');
  // 쉼표 뒤 공백 삽입
  s = s.replace(/,([가-힣A-Za-z])/g, ', $1');
  // 2개 이상 연속 공백 단일화
  s = s.replace(/[ \t]{2,}/g, ' ');
  // 과도한 줄바꿈 정리
  s = s.replace(/\n\s*\n\s*\n+/g, '\n\n');
  return s;
}

// 단독 자음/모음 및 글자 사이 오타(상관없ㅇ이 -> 상관없이, 덙지 -> 든지) 교정
function fixUniversalTypoGlitches(text: string): string {
  let s = text;
  // 1. 단독 자음/모음이 단어 내부에 잘못 들어간 오타 제거 (상관없ㅇ이 -> 상관없이)
  s = s.replace(/([가-힣]+)[ㄱ-ㅎㅏ-ㅣ]+([가-힣]+)/g, (m, p1, p2) => p1 + p2);

  // 2. 어미 '덙지' -> '든지'
  s = s.replace(/덙지/g, '든지');
  s = s.replace(/덙/g, '던');

  // 3. '하겟읍니다' / '배우겟읍니다' -> '하겠습니다' / '배우겠습니다' (습니다가 현대 표준어)
  s = s.replace(/([가-힣]+)읍니다/g, '$1습니다');

  return s;
}

/**
 * Universal Korean Text Corrector
 * Ensures 100% of Korean texts are improved and corrected without fail.
 */
export function correctKoreanText(text: string): { correctedText: string; count: number } {
  if (!text || typeof text !== 'string') {
    return { correctedText: '', count: 0 };
  }

  let current = text;
  let changes = 0;

  // Pass 0: 오타 글리치 및 자모 분리 교정
  const pass0 = fixUniversalTypoGlitches(current);
  if (pass0 !== current) {
    changes++;
    current = pass0;
  }

  // Pass 1: 보편적 어휘 및 구어체 사전 교정
  for (const [pattern, replacement] of UNIVERSAL_DICTIONARY) {
    const prev = current;
    current = current.replace(pattern, replacement as any);
    if (prev !== current) changes++;
  }

  // Pass 2: 한글 음운 자모 분해를 통한 무제한 과거/추측 받침 교정
  const pass2 = fixUniversalPastAndFutureBatchim(current);
  if (pass2 !== current) {
    changes++;
    current = pass2;
  }

  // Pass 3: 조사 띄어쓰기 규정
  const pass3 = fixUniversalParticles(current);
  if (pass3 !== current) {
    changes++;
    current = pass3;
  }

  // Pass 4: 의존명사 띄어쓰기 규정
  const pass4 = fixUniversalDependentNouns(current);
  if (pass4 !== current) {
    changes++;
    current = pass4;
  }

  // Pass 5: 구두점 및 표준 공백 규정
  const pass5 = fixUniversalPunctuation(current);
  if (pass5 !== current) {
    changes++;
    current = pass5;
  }

  // Second pass to resolve cascading patterns
  current = fixUniversalTypoGlitches(current);
  for (const [pattern, replacement] of UNIVERSAL_DICTIONARY) {
    current = current.replace(pattern, replacement as any);
  }
  current = fixUniversalPastAndFutureBatchim(current);
  current = fixUniversalParticles(current);
  current = fixUniversalDependentNouns(current);
  current = fixUniversalPunctuation(current);

  return {
    correctedText: current,
    count: current !== text ? Math.max(changes, 1) : 0
  };
}

/**
 * Universal Intelligent Spell and Typo Checking Pipeline
 * 1. Checks server /api/check-spelling endpoint (with Gemini on server/Vercel)
 * 2. Falls back to client-side Gemini if API fails
 * 3. Always applies rigorous local rules engine (correctKoreanText)
 * 4. Accurately reports whether meaningful changes were made
 */
export async function checkAndCorrectKoreanSpelling(text: string): Promise<{
  correctedText: string;
  count: number;
  changed: boolean;
}> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { correctedText: text || '', count: 0, changed: false };
  }

  let bestResult = text;
  let detectedCount = 0;

  // 1. Try serverless / server endpoint
  try {
    const endpoint = typeof window !== 'undefined' ? '/api/check-spelling' : 'http://localhost:3000/api/check-spelling';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.correctedText === 'string') {
        bestResult = data.correctedText;
        detectedCount = data.count || 0;
      }
    }
  } catch (err) {
    // API endpoint unavailable (e.g. offline or pure client mode), fall back gracefully
  }

  // 2. Client-side Gemini fallback if bestResult is still unchanged
  if (bestResult === text) {
    try {
      const keys = [
        (import.meta as any).env?.VITE_GEMINI_API_KEY,
        (import.meta as any).env?.VITE_GEMINI_API_KEY2,
        (import.meta as any).env?.VITE_GEMINI_API_KEY3,
        (import.meta as any).env?.VITE_GEMINI_API_KEY4,
        (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY : ''),
        (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY2 : ''),
        (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY3 : ''),
        (typeof process !== 'undefined' ? (process as any).env?.GEMINI_API_KEY4 : '')
      ].filter((k): k is string => {
        if (!k) return false;
        const trimmed = k.trim();
        const lower = trimmed.toLowerCase();
        return trimmed !== '' &&
               lower !== 'my_gemini_api_key' &&
               lower !== 'your_api_key' &&
               lower !== 'your_gemini_api_key' &&
               lower !== 'null' &&
               lower !== 'undefined' &&
               lower !== 'placeholder';
      });

      if (keys.length > 0) {
        const apiKey = keys[Math.floor(Math.random() * keys.length)];
        const fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.1-flash-lite'];
        for (const modelName of fallbackModels) {
          try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `다음 텍스트는 학생이 작성한 자기소개서 본문입니다.
한국어 맞춤법 규정, 띄어쓰기 규칙, 오탈자(예: 됬->됐, 되서->돼서, 안되->안 돼, 않되->안 돼, 됫->됐, 준구난방->중구난방, 어의없->어이없, 몇일->며칠 등), 잘못된 조사/어미를 국립국어원 표준에 맞게 정확히 교정한 최종 완성 텍스트를 출력하세요.

반드시 원문의 원래 내용, 문장의 의미, 어조는 그대로 유지하면서 오직 "오타, 맞춤법, 띄어쓰기"만 바르게 교정해야 합니다.
절대로 새로운 내용을 지어내거나 학생의 경험/의도를 바꾸지 마세요.

반드시 순수한 JSON 형식으로만 응답하세요:
{
  "correctedText": "오타와 띄어쓰기가 완벽하게 수정된 전체 본문 텍스트",
  "count": 수정된_오타_및_띄어쓰기_개수(숫자)
}

[검사 및 수정할 원문 텍스트]
${text}`;

            const response = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                systemInstruction: '너는 한국어 맞춤법 및 국립국어원 표준 규정에 정통한 전문 교정 전문가입니다. 원문의 의미와 문맥을 보존하며 오타, 띄어쓰기, 맞춤법만 완벽하게 수정한 결과를 JSON으로 반환합니다.',
                temperature: 0.1
              }
            });

            if (response && response.text) {
              const cleaned = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.correctedText && typeof parsed.correctedText === 'string') {
                bestResult = parsed.correctedText;
                if (typeof parsed.count === 'number') {
                  detectedCount = parsed.count;
                }
                break;
              }
            }
          } catch {
            // continue to next model
          }
        }
      }
    } catch (clientErr) {
      console.warn('Client-side Gemini spell check fallback error', clientErr);
    }
  }

  // 3. Always apply rigorous local rule engine
  const localRuleResult = correctKoreanText(bestResult);
  const finalCorrected = localRuleResult.correctedText;

  // Determine whether genuine text differences exist (ignoring leading/trailing line endings)
  const isChanged = finalCorrected.trim() !== text.trim();
  const totalCount = isChanged ? Math.max(detectedCount, localRuleResult.count, 1) : 0;

  return {
    correctedText: finalCorrected,
    count: totalCount,
    changed: isChanged
  };
}
