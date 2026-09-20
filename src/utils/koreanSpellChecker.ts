/**
 * Master Korean Spelling, Typo, Spacing & Grammar Correction Engine
 * Designed for High School / Meister School cover letters & essays.
 * Accurately detects and fixes phonetic typos, missing final consonants (받침 오류),
 * past-tense typos (햇->했, 봣->봤, 갓->갔, 졋->졌, 엿->였, 엇->었), spacing errors (조사, 의존명사),
 * and common informal/colloquial mistakes.
 */

// 1. Phrasal, Vocabulary & Collocation Replacements
const VOCABULARY_REPLACEMENTS: [RegExp, string][] = [
  // 일상 및 학교 생활 빈출 표현
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
  [/\b어의없/g, '어처구니없'],
  [/\b어의가\s*없/g, '어처구니가 없'],
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

// 2. 과거 시제 받침 오류 전면 교정 (햇->했, 봣->봤, 갓->갔, 졋->졌, 엿->였, 엇->었 등)
function fixPastTenseErrors(text: string): string {
  let s = text;

  // 햇 -> 했
  s = s.replace(/햇다/g, '했다');
  s = s.replace(/햇지만/g, '했지만');
  s = s.replace(/햇고/g, '했고');
  s = s.replace(/햇으니/g, '했으니');
  s = s.replace(/햇어서/g, '했어서');
  s = s.replace(/햇으면/g, '했으면');
  s = s.replace(/햇던/g, '했던');
  s = s.replace(/햇을/g, '했을');
  s = s.replace(/햇는/g, '했는');
  s = s.replace(/햇네/g, '했네');
  s = s.replace(/햇어/g, '했어');
  s = s.replace(/햇음/g, '했음');

  // 봣 -> 봤
  s = s.replace(/봣다/g, '봤다');
  s = s.replace(/봣지만/g, '봤지만');
  s = s.replace(/봣고/g, '봤고');
  s = s.replace(/봣으니/g, '봤으니');
  s = s.replace(/봣어서/g, '봤어서');
  s = s.replace(/봣으면/g, '봤으면');
  s = s.replace(/봣는데/g, '봤는데');
  s = s.replace(/봣던/g, '봤던');
  s = s.replace(/봣을/g, '봤을');
  s = s.replace(/봣어/g, '봤어');
  s = s.replace(/봣네/g, '봤네');
  s = s.replace(/봣음/g, '봤음');

  // 갓 -> 갔
  s = s.replace(/갓다/g, '갔다');
  s = s.replace(/갓지만/g, '갔지만');
  s = s.replace(/갓고/g, '갔고');
  s = s.replace(/갓으니/g, '갔으니');
  s = s.replace(/갓어서/g, '갔어서');
  s = s.replace(/갓으면/g, '갔으면');
  s = s.replace(/갓는데/g, '갔는데');
  s = s.replace(/갓던/g, '갔던');
  s = s.replace(/갓을/g, '갔을');
  s = s.replace(/갓어/g, '갔어');
  s = s.replace(/갓네/g, '갔네');
  s = s.replace(/갓음/g, '갔음');

  // 졋 -> 졌
  s = s.replace(/졋다/g, '졌다');
  s = s.replace(/졋는데/g, '졌는데');
  s = s.replace(/졋지만/g, '졌지만');
  s = s.replace(/졋고/g, '졌고');
  s = s.replace(/졋으니/g, '졌으니');
  s = s.replace(/졋어서/g, '졌어서');
  s = s.replace(/졋으면/g, '졌으면');
  s = s.replace(/졋던/g, '졌던');
  s = s.replace(/졋을/g, '졌을');
  s = s.replace(/졋어/g, '졌어');
  s = s.replace(/졋네/g, '졌네');
  s = s.replace(/졋음/g, '졌음');

  // 엿 -> 였
  s = s.replace(/엿다/g, '였다');
  s = s.replace(/엿지만/g, '였지만');
  s = s.replace(/엿고/g, '였고');
  s = s.replace(/엿으나/g, '였으나');
  s = s.replace(/엿다면/g, '였다면');
  s = s.replace(/엿던/g, '였던');
  s = s.replace(/엿을/g, '였을');
  s = s.replace(/엿어/g, '였어');
  s = s.replace(/엿네/g, '였네');
  s = s.replace(/엿음/g, '였음');

  // 됫 -> 됐
  s = s.replace(/됫다/g, '됐다');
  s = s.replace(/됫어/g, '됐어');
  s = s.replace(/됫네/g, '됐네');
  s = s.replace(/됫고/g, '됐고');
  s = s.replace(/됫지만/g, '됐지만');
  s = s.replace(/됫으니/g, '됐으니');

  // 왓 -> 왔
  s = s.replace(/왓다/g, '왔다');
  s = s.replace(/왓지만/g, '왔지만');
  s = s.replace(/왓고/g, '왔고');
  s = s.replace(/왓으니/g, '왔으니');
  s = s.replace(/왓는데/g, '왔는데');
  s = s.replace(/왓어/g, '왔어');
  s = s.replace(/왓네/g, '왔네');

  // 낫 -> 났
  s = s.replace(/낫다/g, '났다');
  s = s.replace(/낫지만/g, '났지만');
  s = s.replace(/낫고/g, '났고');
  s = s.replace(/낫으니/g, '났으니');
  s = s.replace(/낫는데/g, '났는데');

  // 빈출 동사 및 형용사 과거형 (엇/앗 -> 었/았)
  s = s.replace(/먹엇/g, '먹었');
  s = s.replace(/들엇/g, '들었');
  s = s.replace(/흐렷/g, '흐렸');
  s = s.replace(/잡앗/g, '잡았');
  s = s.replace(/놓앗/g, '놓았');
  s = s.replace(/찾앗/g, '찾았');
  s = s.replace(/맞앗/g, '맞았');
  s = s.replace(/배웟/g, '배웠');
  s = s.replace(/키웟/g, '키웠');
  s = s.replace(/남겻/g, '남겼');
  s = s.replace(/넘겻/g, '넘겼');
  s = s.replace(/맡겻/g, '맡겼');
  s = s.replace(/살렷/g, '살렸');
  s = s.replace(/웃엇/g, '웃었');
  s = s.replace(/울엇/g, '울었');
  s = s.replace(/풀엇/g, '풀었');
  s = s.replace(/겪엇/g, '겪었');

  return s;
}

// 3. 한국어 조사 띄어쓰기 교정 (조사는 무조건 앞 명사에 붙여 씀)
function fixParticlesSpacing(text: string): string {
  let s = text;
  // 단어 뒤의 불필요한 공백 + 조사 결합 ('만'은 보조동사 '하다가 만' 등과 충돌하지 않도록 명사 뒤 패턴만)
  const particles = [
    '에서', '에게', '한테', '으로', '로', '의', '과', '와',
    '을', '를', '이', '가', '은', '는', '도',
    '까지', '부터', '마저', '조차', '보다', '처럼', '마냥'
  ];

  for (const p of particles) {
    const regex = new RegExp(`(\\S+)\\s+(${p})(?=[ ,.\\n\\?!]|$)`, 'g');
    s = s.replace(regex, '$1$2');
  }

  // 조립 완료 후 하다가 만, 먹다가 만 등 보조용언 띄어쓰기 복원/유지
  s = s.replace(/([가-힣]+다가)만\s+/g, '$1 만 ');

  return s;
}

// 4. 의존명사 띄어쓰기 교정 (의존명사는 띄어 씀)
function fixDependentNounSpacing(text: string): string {
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

  // 보조용언 (해 보다, 해 주다)
  s = s.replace(/해\s*보다/g, '해 보다');
  s = s.replace(/해\s*주다/g, '해 주다');
  s = s.replace(/할\s*수밖에/g, '할 수밖에');

  return s;
}

// 5. 구두점 및 다중 공백 정리
function fixPunctuationSpacing(text: string): string {
  let s = text;

  // 온점/물음표/느낌표 뒤에 공백 누락된 경우 한 칸 띄움
  s = s.replace(/([.?!])([가-힣A-Za-z])/g, '$1 $2');

  // 쉼표 뒤 띄어쓰기 누락 보정
  s = s.replace(/,([가-힣A-Za-z])/g, ', $1');

  // 불필요한 연속 공백(스페이스 2개 이상) 1개로 정리
  s = s.replace(/[ \t]{2,}/g, ' ');

  // 줄바꿈 3개 이상 2개로 정리
  s = s.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return s;
}

/**
 * Main Korean Text Corrector Function
 */
export function correctKoreanText(text: string): { correctedText: string; count: number } {
  if (!text || typeof text !== 'string') {
    return { correctedText: '', count: 0 };
  }

  let current = text;
  let changes = 0;

  // Pass 1: 사전 기반 단어/구문 오타 수정 (복합 오타 먼저 교정)
  for (const [pattern, replacement] of VOCABULARY_REPLACEMENTS) {
    const prev = current;
    current = current.replace(pattern, replacement as any);
    if (prev !== current) {
      changes++;
    }
  }

  // Pass 2: 과거 시제 및 받침 탈락 오타 (햇다->했다, 봣다->봤다, 졋->졌, 엿->였, 엇->었 등)
  const pass2 = fixPastTenseErrors(current);
  if (pass2 !== current) {
    changes++;
    current = pass2;
  }

  // Pass 3: 조사 띄어쓰기 교정 (명사 에 -> 명사에)
  const pass3 = fixParticlesSpacing(current);
  if (pass3 !== current) {
    changes++;
    current = pass3;
  }

  // Pass 4: 의존명사 띄어쓰기 (할 일, 하는 것, 수 있다 등)
  const pass4 = fixDependentNounSpacing(current);
  if (pass4 !== current) {
    changes++;
    current = pass4;
  }

  // Pass 5: 구두점 및 띄어쓰기 규정 정리
  const pass5 = fixPunctuationSpacing(current);
  if (pass5 !== current) {
    changes++;
    current = pass5;
  }

  // Double pass for chained replacements
  current = fixPastTenseErrors(current);
  for (const [pattern, replacement] of VOCABULARY_REPLACEMENTS) {
    current = current.replace(pattern, replacement as any);
  }
  current = fixParticlesSpacing(current);
  current = fixDependentNounSpacing(current);
  current = fixPunctuationSpacing(current);

  return {
    correctedText: current,
    count: current !== text ? Math.max(changes, 1) : 0
  };
}
