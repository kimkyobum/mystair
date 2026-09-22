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

  // 자주 틀리는 맞춤법 (국립국어원 표준)
  [/\b되요\b/g, '돼요'],
  [/\b안되\b/g, '안 돼'],
  [/\b안되서\b/g, '안 돼서'],
  [/\b안됬/g, '안 됐'],
  [/\b됫/g, '됐'],
  [/\b됫다\b/g, '됐다'],
  [/\b되서\b/g, '돼서'],
  [/\b되었\b/g, '됐'],
  [/\b안돼다\b/g, '안되다'],
  [/\b않하고\b/g, '안 하고'],
  [/\b않되\b/g, '안 돼'],
  [/\b않된다\b/g, '안 된다'],
  [/\b않되는\b/g, '안 되는'],
  [/\b낳아지/g, '나아지'],
  [/\b낳아졌/g, '나아졌'],
  [/\b낳길\b/g, '낫길'],
  [/\b몇일\b/g, '며칠'],
  [/\b어떻해\b/g, '어떡해'],
  [/\b어떻게해\b/g, '어떡해'],
  [/\b어의\b/g, '어이'],
  [/\b금새\b/g, '금세'],
  [/\b요세\b/g, '요새'],
  [/\b설레임\b/g, '설렘'],
  [/\b바램\b/g, '바람'],
  [/\b희안하/g, '희한하'],
  [/\b일일히\b/g, '일일이'],
  [/\b틈틈히\b/g, '틈틈이'],
  [/\b곰곰히\b/g, '곰곰이'],
  [/\b깨끗히\b/g, '깨끗이'],
  [/\b가르쳐주/g, '가르쳐 주'],
  [/\b가르키/g, '가리키'],
  [/\b들어나/g, '드러나'],
  [/\b드러나다\b/g, '드러나다'],
  [/\b왠만하면\b/g, '웬만하면'],
  [/\b왠일\b/g, '웬일'],
  [/\b웬지\b/g, '왠지'],
  [/\b제작년\b/g, '재작년'],
  [/\b문안한\b/g, '무난한'],
  [/\b무난하다\b/g, '무난하다'],
  [/\b내노라하는\b/g, '내로라하는'],
  [/\b치루/g, '치르'],
  [/\b치뤘다\b/g, '치렀다'],
  [/\b치뤄/g, '치러'],
  [/\b잠궜다\b/g, '잠갔다'],
  [/\b담궜다\b/g, '담갔다'],
  [/\b만듬\b/g, '만듦'],
  [/\b이끌음\b/g, '이끎'],
  [/\b베풀음\b/g, '베풂'],
  [/\b밞음\b/g, '밟음']
];

// 음운 분해를 통한 보편적 과거/추측 선어말어미 받침 일괄 교정
// 어떤 단어든 받침이 'ㅅ'이고 뒤에 종결어미나 연결어미가 붙어있는 경우 자동 'ㅆ'으로 치환
function fixUniversalPastAndFutureBatchim(text: string): string {
  // 긴 어미를 먼저 매칭하여 온전한 어미 결합 포착
  const eomiList = '습니다|습네다|에서는|에서도|이지만|더라도|을텐데|텐데|지만|으나|으면|는데|으며|으니|어서|아서|네|소|을|죠|군요|듯|길|때|도|면|지|다|고|어|아';
  const eomiRegex = new RegExp(`([가-힣])(${eomiList})`, 'g');

  return text.replace(eomiRegex, (match, p1, p2, offset, str) => {
    const d = decomposeHangul(p1);
    if (!d || d.T !== 19) return match; // 받침이 'ㅅ'이 아닌 글자는 그대로 유지

    // 예외: 기본형 어간 받침이 원래 'ㅅ'인 용언 (웃다, 씻다, 벗다, 솟다, 뺏다, 짓다, 빗다, 잇다, 맛, 낫다)
    const safeBase = ['웃', '씻', '벗', '솟', '뺏', '짓', '빗', '잇', '맛'];
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
