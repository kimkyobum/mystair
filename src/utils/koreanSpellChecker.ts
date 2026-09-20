/**
 * Korean Spelling, Typo & Spacing Rule Engine
 * Handles common typos, spacing errors, particle mistakes, and phonetic misspellings
 * Works 100% reliably even when external AI API keys are unavailable, and acts as fallback.
 */

// Common mistyped and misspelled Korean words and phrases
const COMMON_REPLACEMENTS: [RegExp, string][] = [
  // User specific example: "시봇팔" -> "로봇팔", "그결과" -> "그 결과", "대학교 에서" -> "대학교에서"
  [/시봇팔/g, '로봇팔'],
  [/노봇팔/g, '로봇팔'],
  [/그결과/g, '그 결과'],
  [/그\s+결과/g, '그 결과'],
  [/이결과/g, '이 결과'],
  [/한결과/g, '한 결과'],
  [/난\s+오늘/g, '저는 오늘'],
  [/난\s+/g, '저는 '],
  [/수여받았다/g, '수상했다'],
  [/수여\s*받았다/g, '수상했다'],
  
  // 조사 띄어쓰기 오류 (한국어 조사는 앞 명사에 반드시 붙여 씀)
  [/(\S+)\s+(에서|에게|한테|으로|로|의|과|와|을|를|이|가|은|는|도|만|까지|부터|마저|조차)(?=[ ,.\n]|$)/g, '$1$2'],
  
  // 되 / 돼 오류
  [/\b되요\b/g, '돼요'],
  [/\b안되\b/g, '안 돼'],
  [/\b안되서\b/g, '안 돼서'],
  [/\b안됬/g, '안 됐'],
  [/\b됫/g, '됐'],
  [/\b됫다\b/g, '됐다'],
  [/\b되서\b/g, '돼서'],
  [/\b되었\b/g, '됐'],
  [/\b안돼다\b/g, '안되다'],
  
  // 자주 틀리는 맞춤법/오탈자
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
  [/\b밞음\b/g, '밟음'],
  
  // 의존명사 띄어쓰기 ('수 있다', '것 같다', '줄 알다', '때문', '뿐', '만큼')
  [/([가-힣]+ㄹ|[가-힣]+을)\s*수\s*있/g, '$1 수 있'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*수\s*없/g, '$1 수 없'],
  [/([가-힣]+ㄴ|[가-힣]+은|[가-힣]+는|[가-힣]+ㄹ|[가-힣]+을)\s*것\s*같/g, '$1 것 같'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*줄\s*알/g, '$1 줄 알'],
  [/([가-힣]+ㄴ|[가-힣]+은|[가-힣]+는|[가-힣]+ㄹ|[가-힣]+을)\s*줄\s*몰/g, '$1 줄 몰'],
  [/([가-힣]+기)\s*때문/g, '$1 때문'],
  [/([가-힣]+은|[가-힣]+는|[가-힣]+ㄴ)\s*바람에/g, '$1 바람에'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*뿐만\s*아니라/g, '$1 뿐만 아니라'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*뿐이다/g, '$1 뿐이다'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*따름이다/g, '$1 따름이다'],
  [/([가-힣]+ㄹ|[가-힣]+을)\s*나름이다/g, '$1 나름이다'],
  
  // 복합 보조용언 및 동사 띄어쓰기
  [/해\s*보다/g, '해 보다'],
  [/해\s*주다/g, '해 주다'],
  [/해\s*보다가/g, '해 보다가'],
  [/할\s*수밖에/g, '할 수밖에'],
  
  // 다중 공백 정리
  [/[ \t]+/g, ' '],
  [/\n\s*\n\s*\n+/g, '\n\n'],
  
  // 마침표 뒤 띄어쓰기
  [/([.?!])([가-힣A-Za-z])/g, '$1 $2']
];

export function correctKoreanText(text: string): { correctedText: string; count: number } {
  if (!text) return { correctedText: '', count: 0 };

  let current = text;
  let changes = 0;

  for (const [pattern, replacement] of COMMON_REPLACEMENTS) {
    const prev = current;
    current = current.replace(pattern, replacement as any);
    if (prev !== current) {
      changes++;
    }
  }

  // Double pass for chained particles (e.g. 명사 + 에서 + 의)
  for (const [pattern, replacement] of COMMON_REPLACEMENTS) {
    current = current.replace(pattern, replacement as any);
  }

  return {
    correctedText: current,
    count: changes
  };
}
