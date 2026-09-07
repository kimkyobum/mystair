export interface MeisterSchool {
  id: number;
  region: string;
  name: string;
  field: string;
  aliases: string[];
}

export const MEISTER_HIGHSCHOOLS: MeisterSchool[] = [
  {
    id: 1,
    region: "서울",
    name: "수도전기공업고등학교",
    field: "에너지",
    aliases: ["수도전기공고", "수도공고", "수도전기"]
  },
  {
    id: 2,
    region: "서울",
    name: "미림여자정보과학고등학교",
    field: "뉴미디어콘텐츠",
    aliases: ["미림여고", "미림여자정보과학고", "미림마이스터고"]
  },
  {
    id: 3,
    region: "서울",
    name: "서울로봇고등학교",
    field: "로봇",
    aliases: ["서울로봇고", "로봇고"]
  },
  {
    id: 4,
    region: "서울",
    name: "서울도시과학기술고등학교",
    field: "해외건설플랜트",
    aliases: ["서울도시과학기술고", "서울도기고", "도시과학고"]
  },
  {
    id: 5,
    region: "서울",
    name: "용산철도고등학교",
    field: "철도",
    aliases: ["용산철도고", "철도고", "용산철고"]
  },
  {
    id: 6,
    region: "부산",
    name: "부산기계공업고등학교",
    field: "기계",
    aliases: ["부산기계공고", "부산기공"]
  },
  {
    id: 7,
    region: "부산",
    name: "부산자동차고등학교",
    field: "자동차",
    aliases: ["부산자동차고", "부산자고"]
  },
  {
    id: 8,
    region: "부산",
    name: "부산해사고등학교",
    field: "해운",
    aliases: ["부산해사고"]
  },
  {
    id: 9,
    region: "부산",
    name: "부산소프트웨어마이스터고등학교",
    field: "소프트웨어",
    aliases: ["부산소마고", "부산소프트웨어마이스터고", "부산SW마이스터고"]
  },
  {
    id: 10,
    region: "대구",
    name: "경북기계공업고등학교",
    field: "기계",
    aliases: ["경북기계공고", "경북기공"]
  },
  {
    id: 11,
    region: "대구",
    name: "대구일마이스터고등학교",
    field: "자동차산업",
    aliases: ["대구일마이스터고", "대구일마고"]
  },
  {
    id: 12,
    region: "대구",
    name: "대구소프트웨어마이스터고등학교",
    field: "소프트웨어",
    aliases: ["대구소마고", "대구소프트웨어마이스터고", "대구SW마이스터고"]
  },
  {
    id: 13,
    region: "대구",
    name: "대구농업마이스터고등학교",
    field: "도시농업",
    aliases: ["대구농업마이스터고", "대구농마고"]
  },
  {
    id: 14,
    region: "대구",
    name: "대구전자공업고등학교",
    field: "반도체",
    aliases: ["대구전자공고", "대구전자공업고"]
  },
  {
    id: 15,
    region: "인천",
    name: "인천해사고등학교",
    field: "해운",
    aliases: ["인천해사고"]
  },
  {
    id: 16,
    region: "인천",
    name: "인천전자마이스터고등학교",
    field: "전자",
    aliases: ["인천전자마이스터고", "인천전자마고"]
  },
  {
    id: 17,
    region: "광주",
    name: "광주자동화설비공업고등학교",
    field: "자동화설비",
    aliases: ["광주자동화설비공고", "광주설비공고"]
  },
  {
    id: 18,
    region: "광주",
    name: "광주소프트웨어마이스터고등학교",
    field: "소프트웨어",
    aliases: ["광주소마고", "광주소프트웨어마이스터고", "광주SW마이스터고"]
  },
  {
    id: 19,
    region: "대전",
    name: "동아마이스터고등학교",
    field: "기계·전자",
    aliases: ["동아마이스터고", "동아마고"]
  },
  {
    id: 20,
    region: "대전",
    name: "대덕소프트웨어마이스터고등학교",
    field: "소프트웨어",
    aliases: ["대덕소마고", "대덕소프트웨어마이스터고", "대덕SW마이스터고"]
  },
  {
    id: 21,
    region: "울산",
    name: "울산마이스터고등학교",
    field: "기계·자동화",
    aliases: ["울산마이스터고", "울산마고"]
  },
  {
    id: 22,
    region: "울산",
    name: "현대공업고등학교",
    field: "조선해양",
    aliases: ["현대공고"]
  },
  {
    id: 23,
    region: "울산",
    name: "울산에너지고등학교",
    field: "에너지",
    aliases: ["울산에너지고"]
  },
  {
    id: 24,
    region: "경기",
    name: "수원하이텍고등학교",
    field: "메카트로닉스",
    aliases: ["수원하이텍고", "수원하이텍"]
  },
  {
    id: 25,
    region: "경기",
    name: "평택기계공업고등학교",
    field: "기계·자동차",
    aliases: ["평택기계공고", "평택기공"]
  },
  {
    id: 26,
    region: "경기",
    name: "경기게임마이스터고등학교",
    field: "게임기획·개발",
    aliases: ["경기게임마이스터고", "게임마이스터고", "게임마고"]
  },
  {
    id: 27,
    region: "강원",
    name: "삼척마이스터고등학교",
    field: "발전산업",
    aliases: ["삼척마이스터고", "삼척마고"]
  },
  {
    id: 28,
    region: "강원",
    name: "한국소방마이스터고등학교",
    field: "소방방재",
    aliases: ["한국소방마이스터고", "소방마이스터고", "소방마고"]
  },
  {
    id: 29,
    region: "강원",
    name: "한국항공고등학교",
    field: "항공기계",
    aliases: ["한국항공고", "항공고"]
  },
  {
    id: 30,
    region: "충북",
    name: "충북반도체고등학교",
    field: "반도체",
    aliases: ["충북반도체고", "반도체고"]
  },
  {
    id: 31,
    region: "충북",
    name: "한국바이오마이스터고등학교",
    field: "바이오",
    aliases: ["한국바이오마이스터고", "바이오마이스터고", "바이오마고"]
  },
  {
    id: 32,
    region: "충북",
    name: "충북에너지고등학교",
    field: "이차전지·에너지",
    aliases: ["충북에너지고"]
  },
  {
    id: 33,
    region: "충남",
    name: "합덕제철고등학교",
    field: "철강",
    aliases: ["합덕제철고"]
  },
  {
    id: 34,
    region: "충남",
    name: "공주마이스터고등학교",
    field: "표면처리",
    aliases: ["공주마이스터고", "공주마고"]
  },
  {
    id: 35,
    region: "충남",
    name: "연무대기계공업고등학교",
    field: "자동차소재부품",
    aliases: ["연무대기계공고", "연무대기공"]
  },
  {
    id: 36,
    region: "충남",
    name: "한국식품마이스터고등학교",
    field: "식품제조",
    aliases: ["한국식품마이스터고", "식품마이스터고", "식품마고"]
  },
  {
    id: 37,
    region: "충남",
    name: "아산스마트팩토리마이스터고등학교",
    field: "스마트팩토리",
    aliases: ["아산스마트팩토리마이스터고", "아산스마트팩토리고", "스마트팩토리마이스터고"]
  },
  {
    id: 38,
    region: "전북",
    name: "전북기계공업고등학교",
    field: "기계",
    aliases: ["전북기계공고", "전북기공"]
  },
  {
    id: 39,
    region: "전북",
    name: "군산기계공업고등학교",
    field: "기계",
    aliases: ["군산기계공고", "군산기공"]
  },
  {
    id: 40,
    region: "전북",
    name: "한국경마축산고등학교",
    field: "말산업",
    aliases: ["한국경마축산고", "경마축산고"]
  },
  {
    id: 41,
    region: "전북",
    name: "김제농생명마이스터고등학교",
    field: "종자생명",
    aliases: ["김제농생명마이스터고", "김제농마고"]
  },
  {
    id: 42,
    region: "전남",
    name: "한국항만물류고등학교",
    field: "항만물류",
    aliases: ["한국항만물류고", "항만물류고"]
  },
  {
    id: 43,
    region: "전남",
    name: "여수석유화학고등학교",
    field: "석유화학",
    aliases: ["여수석유화학고"]
  },
  {
    id: 44,
    region: "전남",
    name: "전남생명과학고등학교",
    field: "친환경농업",
    aliases: ["전남생명과학고"]
  },
  {
    id: 45,
    region: "전남",
    name: "완도수산고등학교",
    field: "수산물가공·양식",
    aliases: ["완도수산고"]
  },
  {
    id: 46,
    region: "전남",
    name: "한국에너지마이스터고등학교",
    field: "에너지",
    aliases: ["한국에너지마이스터고", "에너지마이스터고"]
  },
  {
    id: 47,
    region: "경북",
    name: "구미전자공업고등학교",
    field: "전자",
    aliases: ["구미전자공고", "구미전자공업고", "구미전공"]
  },
  {
    id: 48,
    region: "경북",
    name: "금오공업고등학교",
    field: "기계·전자",
    aliases: ["금오공고", "금오공업고"]
  },
  {
    id: 49,
    region: "경북",
    name: "포항제철공업고등학교",
    field: "철강",
    aliases: ["포항제철공고", "포철공고"]
  },
  {
    id: 50,
    region: "경북",
    name: "한국원자력마이스터고등학교",
    field: "원자력",
    aliases: ["한국원자력마이스터고", "원자력마이스터고", "원자력마고"]
  },
  {
    id: 51,
    region: "경북",
    name: "한국국제통상마이스터고등학교",
    field: "국제통상",
    aliases: ["한국국제통상마이스터고", "국제통상마이스터고", "통상마이스터고"]
  },
  {
    id: 52,
    region: "경북",
    name: "경북식품과학마이스터고등학교",
    field: "식품품질관리",
    aliases: ["경북식품과학마이스터고", "경북식품마이스터고"]
  },
  {
    id: 53,
    region: "경북",
    name: "경북소프트웨어마이스터고등학교",
    field: "소프트웨어",
    aliases: ["경북소마고", "경북소프트웨어마이스터고", "경북SW마이스터고"]
  },
  {
    id: 54,
    region: "경북",
    name: "한국해양마이스터고등학교",
    field: "스마트해양",
    aliases: ["한국해양마이스터고", "해양마이스터고"]
  },
  {
    id: 55,
    region: "경남",
    name: "삼천포공업고등학교",
    field: "항공산업",
    aliases: ["삼천포공고"]
  },
  {
    id: 56,
    region: "경남",
    name: "거제공업고등학교",
    field: "조선해양",
    aliases: ["거제공고"]
  },
  {
    id: 57,
    region: "경남",
    name: "한국나노마이스터고등학교",
    field: "나노반도체",
    aliases: ["한국나노마이스터고", "나노마이스터고"]
  },
  {
    id: 58,
    region: "경남",
    name: "공군항공과학고등학교",
    field: "항공·전자",
    aliases: ["공군항공과학고", "항공과학고", "항과고"]
  }
];

/**
 * 사용자가 입력한 검색어에 따라 마이스터고를 정렬 및 필터링합니다.
 * '구' 입력 시: '구'로 시작하는 학교가 최우선 정렬됨 (예: 구미전자공업고등학교, 군산기계공업고등학교 등)
 */
export function searchMeisterSchools(query: string): MeisterSchool[] {
  const cleanQuery = query.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleanQuery) return MEISTER_HIGHSCHOOLS.slice(0, 10); // 기본 상위 10개

  const startsWithName: MeisterSchool[] = [];
  const startsWithAlias: MeisterSchool[] = [];
  const includesName: MeisterSchool[] = [];
  const includesAlias: MeisterSchool[] = [];
  const includesOther: MeisterSchool[] = [];

  for (const school of MEISTER_HIGHSCHOOLS) {
    const normName = school.name.toLowerCase().replace(/\s+/g, '');
    const normAliases = school.aliases.map(a => a.toLowerCase().replace(/\s+/g, ''));
    const normRegion = school.region.toLowerCase();
    const normField = school.field.toLowerCase();

    if (normName.startsWith(cleanQuery)) {
      startsWithName.push(school);
    } else if (normAliases.some(a => a.startsWith(cleanQuery))) {
      startsWithAlias.push(school);
    } else if (normName.includes(cleanQuery)) {
      includesName.push(school);
    } else if (normAliases.some(a => a.includes(cleanQuery))) {
      includesAlias.push(school);
    } else if (normRegion.includes(cleanQuery) || normField.includes(cleanQuery)) {
      includesOther.push(school);
    }
  }

  // 중복 없이 정렬된 결과 반환
  const combined = [
    ...startsWithName,
    ...startsWithAlias,
    ...includesName,
    ...includesAlias,
    ...includesOther
  ];

  const seen = new Set<number>();
  return combined.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
