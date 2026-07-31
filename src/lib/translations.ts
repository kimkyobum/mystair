import { certEligibilityMap, certDescMap } from './certMaps';

export { certEligibilityMap, certDescMap };

export const certNameMap: Record<string, string> = {
  "전기기능사": "Craftsman Electrician",
  "전산응용기계제도기능사": "Craftsman Computer Aided Mechanical Drawing",
  "컴퓨터응용밀링기능사": "Craftsman Computer Aided Milling",
  "컴퓨터응용선반기능사": "Craftsman Computer Aided Lathing",
  "설비보전기능사": "Craftsman Equipment Maintenance",
  "위험물기능사": "Craftsman Hazardous Materials",
  "화학분석기능사": "Craftsman Chemical Analysis",
  "정보처리기능사": "Craftsman Information Processing",
  "자동차정비기능사": "Craftsman Motor Vehicle Maintenance",
  "지게차운전기능사": "Craftsman Forklift Truck Driving",
  "공조냉동기계기능사": "Craftsman Air-Conditioning & Refrigerating Machinery",
  "에너지관리기능사": "Craftsman Energy Management",
  "승강기기능사": "Craftsman Elevator",
  "피복아크용접기능사": "Craftsman Shielded Metal Arc Welding",
  "전자기능사": "Craftsman Electronics",
  "한국사능력검정시험 (심화)": "Korean History Proficiency Test (Advanced)",
  "컴퓨터활용능력 1급": "Computer Literacy Level 1",
  "컴퓨터활용능력 2급": "Computer Literacy Level 2",
  "SQLD (SQL 개발자)": "SQL Developer (SQLD)",
  "전기공사산업기사 (과정평가형)": "Industrial Engineer Electrical Construction (Course-Evaluation)",
  "기계설계산업기사 (과정평가형)": "Industrial Engineer Mechanical Design (Course-Evaluation)",
  "바이오화학제품제조기능사": "Craftsman Biochemical Product Manufacturing",
  "항공기체정비기능사": "Craftsman Aircraft Airframe Maintenance",
  "굴착기운전기능사": "Craftsman Excavator Driving",
  "초경량비행장치 조종자 (드론 1종)": "Ultra-light Flying Device Pilot (Drone Class 1)",
  "가스기능사": "Craftsman Gas",
  "가스티그용접기능사": "Craftsman Gas Tungsten Arc Welding",
  "공유압기능사": "Craftsman Pneumatics & Hydraulics",
  "기계정비기능사": "Craftsman Mechanical Maintenance",
  "전자캐드기능사": "Craftsman Electronic CAD",
  "신재생에너지발전설비기능사(태양광)": "Craftsman Renewable Energy Power Generation (Solar)",
  "3D프린터운용기능사": "Craftsman 3D Printer Operation",
  "웹디자인기능사": "Craftsman Web Design",
  "컴퓨터그래픽스운용기능사": "Craftsman Computer Graphics",
  "환경기능사": "Craftsman Environmental",
  "측량기능사": "Craftsman Surveying",
  "지적기능사": "Craftsman Cadastral",
  "무선설비기능사": "Craftsman Wireless Communication Equipment",
  "정보통신기능사": "Craftsman Information Telecommunications",
  "네트워크관리사 2급": "Network Administrator Class 2",
  "항공기관정비기능사": "Craftsman Aircraft Engine Maintenance",
  "자동차보수도장기능사": "Craftsman Motor Vehicle Painting",
  "자동차차체수리기능사": "Craftsman Motor Vehicle Body Repair",
  "이산화탄소가스아크용접기능사": "Craftsman CO2 Gas Arc Welding",
  "로더운전기능사": "Craftsman Loader Driving",
  "롤러운전기능사": "Craftsman Roller Driving",
  "천장크레인운전기능사": "Craftsman Overhead Crane Driving",
  "컨테이너크레인운전기능사": "Craftsman Container Crane Driving",
  "정밀측정기능사": "Craftsman Precision Measurement",
  "전자계산기기능사": "Craftsman Computer",
  "생산자동화기능사": "Craftsman Production Automation",
  "배전전공": "Power Distribution Electrician",
  "소방안전관리자 2급": "Fire Safety Manager Level 2",
  "소방안전관리자 1급": "Fire Safety Manager Level 1",
  "ADsP (데이터분석 준전문가)": "ADsP (Advanced Data Analytics Semi-Professional)",
  "리눅스마스터 2급": "Linux Master Level 2",
  "ITQ 한글": "ITQ Hangul",
  "ITQ 엑셀": "ITQ Excel",
  "ITQ 파워포인트": "ITQ PowerPoint",
  "ITQ OA Master": "ITQ OA Master",
  "MOS Master": "MOS Master",
  "워드프로세서": "Word Processor",
  "전산회계 1급": "Computerized Accounting Level 1",
  "전산회계 2급": "Computerized Accounting Level 2",
  "전산세무 2급": "Computerized Tax Accounting Level 2",
  "전산세무 1급": "Computerized Tax Accounting Level 1",
  "전산회계운용사 2급": "Computerized Accounting Practitioner Level 2",
  "전산회계운용사 3급": "Computerized Accounting Practitioner Level 3",
  "매경TEST (우수/최우수)": "MK Test (Outstanding/Superior)",
  "TESAT (S급/1급/2급)": "TESAT (S/Grade 1/Grade 2)",
  "물류관리사": "Logistics Manager",
  "유통관리사 2급": "Distribution Manager Level 2",
  "무역영어 1급": "Trade English Level 1",
  "KBS한국어능력시험": "KBS Korean Test",
  "ToKL (국어능력인증시험)": "ToKL (Korean Language Test)",
  "TOEIC": "TOEIC",
  "TOEIC Listening & Reading": "TOEIC Listening & Reading",
  "TOEIC Speaking": "TOEIC Speaking",
  "OPIc": "OPIc",
  "OPIc (오픽)": "OPIc",
  "JPT": "JPT",
  "HSK 4급": "HSK Level 4",
  "HSK 5급": "HSK Level 5",
  "JLPT N2": "JLPT N2",
  "GTQ 1급 (그래픽기술자격 1급)": "GTQ Level 1 (Graphic Tech Cert)",
  "전기산업기사 (과정평가형)": "Industrial Engineer Electrical (Course-Evaluation)",
  "전자산업기사 (과정평가형)": "Industrial Engineer Electronics (Course-Evaluation)",
  "컴퓨터응용가공산업기사 (과정평가형)": "Industrial Engineer Computer Aided Machining (Course-Evaluation)",
  "자동화설비산업기사 (과정평가형)": "Industrial Engineer Automation Equipment (Course-Evaluation)",
  "설비보전산업기사 (과정평가형)": "Industrial Engineer Equipment Maintenance (Course-Evaluation)",
  "자동차정비산업기사 (과정평가형)": "Industrial Engineer Motor Vehicle Maintenance (Course-Evaluation)",
  "정보처리산업기사 (과정평가형)": "Industrial Engineer Information Processing (Course-Evaluation)",
  "위험물산업기사 (과정평가형)": "Industrial Engineer Hazardous Materials (Course-Evaluation)",
  "바이오화학제품제조산업기사 (과정평가형)": "Industrial Engineer Biochemical Product Mfg (Course-Evaluation)",
  "산업안전산업기사 (과정평가형)": "Industrial Engineer Industrial Safety (Course-Evaluation)",
  "항공장비정비기능사": "Craftsman Aircraft Equipment Maintenance",
  "항공전자정비기능사": "Craftsman Avionics Maintenance",
  "철도차량정비기능사": "Craftsman Railway Rolling Stock Maintenance",
  "철도전기신호기능사": "Craftsman Railway Electrical Signaling",
  "선박건조기능사": "Craftsman Shipbuilding",
  "배관기능사": "Craftsman Plumbing",
  "보일러시공기능사": "Craftsman Boiler Installation",
  "식품가공기능사": "Craftsman Food Processing",
  "종자기능사": "Craftsman Seed",
  "버섯종균기능사": "Craftsman Mushroom Spawns",
  "정보기기운용기능사": "Craftsman Information Equipment Operation",
  "정보처리기사": "Engineer Information Processing",
  "전기기사": "Engineer Electricity",
  "산업안전기사": "Industrial Safety Engineer",
  "건설안전기사": "Construction Safety Engineer",
  "사무자동화산업기사": "Industrial Engineer Office Automation",
  "빅데이터분석기사": "Big Data Analytics Engineer",
  "개인정보관리사 (CPPG)": "Personal Information Manager (CPPG)",
  "AWS Certified Solutions Architect - Associate": "AWS Certified Solutions Architect - Associate",
  "FAT 1급 (회계실무 1급)": "FAT Level 1 (Accounting Practice)",
  "TAT 2급 (세무실무 2급)": "TAT Level 2 (Tax Practice)",
  "ERP정보관리사 회계 1급": "ERP Info Manager Accounting Level 1",
  "ERP정보관리사 인사 1급": "ERP Info Manager HR Level 1",
  "ERP정보관리사 물류 1급": "ERP Info Manager Logistics Level 1",
  "ERP정보관리사 생산 1급": "ERP Info Manager Production Level 1",
  "원산지관리사": "Origin Manager",
  "보세사": "Bonded Goods Caretaker",
  "사회조사분석사 2급": "Social Survey Analyst Level 2",
  "직업상담사 2급": "Vocational Counselor Level 2",
  "사회복지사 1급": "Social Worker Level 1",
  "청소년상담사 3급": "Youth Counselor Level 3",
  "임상심리사 2급": "Clinical Psychologist Level 2",
  "경비지도사": "Security Guard Instructor",
  "주택관리사(보)": "Housing Manager (Assistant)",
  "공인중개사": "Licensed Real Estate Agent",
  "행정사 (일반)": "Administrative Attorney (General)",
  "손해사정사 (손해배상/신체)": "Claims Adjuster (Injury)",
  "자산관리사(FP)": "Financial Planner (FP)",
  "AFPK (재무설계사)": "AFPK (Financial Planner)",
  "증권투자권유대행인": "Securities Investment Solicitor",
  "펀드투자권유대행인": "Fund Investment Solicitor",
  "CS리더스관리사": "CS Leaders Manager",
  "SMAT (서비스경영자격) A모듈": "SMAT Module A",
  "텔레마케팅관리사": "Telemarketing Manager",
  "컨벤션기획사 2급": "Convention Planner Level 2",
  "한식조리기능사": "Craftsman Korean Cookery",
  "양식조리기능사": "Craftsman Western Cookery",
  "일식조리기능사": "Craftsman Japanese Cookery",
  "중식조리기능사": "Craftsman Chinese Cookery",
  "제과기능사": "Craftsman Confectionery",
  "제빵기능사": "Craftsman Bakery",
  "미용사 (일반)": "Beautician (General)",
  "미용사 (피부)": "Beautician (Skin)",
  "미용사 (네일)": "Beautician (Nail)",
  "미용사 (메이크업)": "Beautician (Make-up)",
  "바리스타 2급": "Barista Level 2",
  "조경기능사": "Craftsman Landscape Architecture",
  "화훼장식기능사": "Craftsman Flower Arrangement",
  "축산기능사": "Craftsman Livestock",
  "산림기능사": "Craftsman Forestry",
  "유기농업기능사": "Craftsman Organic Agriculture",
  "타일기능사": "Craftsman Tiling",
  "방수기능사": "Craftsman Waterproofing",
  "건축목공기능사": "Craftsman Building Carpentry",
  "도배기능사": "Craftsman Paperhanging",
  "미장기능사": "Craftsman Plastering",
  "온수온돌기능사": "Craftsman Hot Water Ondol",
  "비계기능사": "Craftsman Scaffolding",
  "기계조립기능사": "Craftsman Machine Assembly",
  "사출금형기능사": "Craftsman Injection Mold",
  "프레스금형기능사": "Craftsman Press Die",
  "열처리기능사": "Craftsman Heat Treatment",
  "표면처리기능사": "Craftsman Surface Treatment",
  "전자기기기능사": "Craftsman Electronic Apparatus",
  "무대예술전문인 (무대음향 3급)": "Stage Art Professional (Sound Level 3)",
  "박물관및미술관 준학예사": "Assistant Curator of Museum/Art Gallery",
  "잠수기능사": "Craftsman Diving",
  "수산양식기능사": "Craftsman Aquaculture",
  "동력수상레저기구조종면허 1급": "Motorized Water Leisure Equipment License Class 1",
  "소형선박조종사": "Small Vessel Operator",
  "요트조종면허": "Yacht License",
  "아마추어무선기사 4급": "Amateur Radio Operator Class 4",
  "육상무선통신사": "Land Wireless Operator",
  "위생사": "Hygienist",
  "영양사": "Dietitian",
  "보건의료정보관리사 (구 의무기록사)": "Health Information Manager",
  "간호조무사": "Nursing Assistant",
  "요양보호사": "Caregiver",
  "평생교육사 2급": "Lifelong Educator Level 2",
  "한국실용글쓰기검정": "Korean Practical Writing Test"
};

export const companyBrandMap: Record<string, string> = {
  "삼성": "Samsung",
  "SK": "SK",
  "현대": "Hyundai",
  "LG": "LG",
  "포스코": "POSCO",
  "한화": "Hanwha",
  "LS": "LS",
  "두산": "Doosan",
  "롯데": "Lotte",
  "HD현대": "HD Hyundai",
  "에코프로": "Ecopro",
  "GS": "GS",
  "효성": "Hyosung",
  "CJ": "CJ",
  "LIG넥스원": "LIG Nex1",
  "한국항공우주산업 (KAI)": "Korea Aerospace Industries (KAI)",
  "한국항공우주산업": "Korea Aerospace Industries",
  "풍산": "Poongsan",
  "한전KPS": "KEPCO KPS",
  "한국가스기술공사": "KOGAS Tech",
  "기아": "Kia",
  "에스원": "S-1",
  "DN솔루션즈": "DN Solutions",
  "한국전력공사 (한전)": "KEPCO",
  "한국전력공사": "KEPCO",
  "한국수력원자력 (한수원)": "KHNP",
  "한국수력원자력": "KHNP",
  "한국철도공사 (코레일)": "KORAIL",
  "한국철도공사": "KORAIL",
  "인천국제공항공사": "Incheon Int'l Airport Corp.",
  "한국도로공사": "Korea Expressway Corp.",
  "한국수자원공사 (K-water)": "K-water",
  "한국수자원공사": "K-water",
  "한국가스공사": "KOGAS",
  "한국토지주택공사 (LH)": "LH Corporation",
  "한국토지주택공사": "LH Corporation",
  "한국지역난방공사": "Korea District Heating Corp.",
  "한전KDN": "KEPCO KDN",
  "한국남동발전": "KOEN",
  "한국서부발전": "KOWEPO",
  "한국동서발전": "EWP",
  "한국남부발전": "KOSPO",
  "한국중부발전": "KOMIPO",
  "한국환경공단": "Korea Environment Corp."
};

export const qualTypeMap: Record<string, string> = {
  "국가기술자격": "National Technical Qualification",
  "국가관련자격": "National Related Qualification",
  "국가공인민간자격": "National Authorized Private Qualification",
  "과정평가형 산업기사": "Course-Evaluation Industrial Engineer",
  "국가자격증": "National Qualification",
  "국가전문자격": "National Professional Qualification",
  "국제공인자격": "International Qualification",
  "어학시험": "Language Test",
  "민간자격": "Private Qualification"
};

export const categoryMap: Record<string, string> = {
  "전기/전자/에너지": "Electrical / Electronics / Energy",
  "기계/메카트로닉스": "Machinery / Mechatronics",
  "기계/메카/모빌리티": "Machinery / Mechatronics / Mobility",
  "화학/바이오/환경": "Chemical / Bio / Environment",
  "IT/소프트웨어": "IT / Software",
  "IT/소프트웨어/OA": "IT / Software / OA",
  "모빌리티/자동차/항공": "Mobility / Automotive / Aviation",
  "중장비/물류/안전": "Heavy Machinery / Logistics / Safety",
  "건설/중장비/안전": "Construction / Heavy Equip / Safety",
  "공통/어학/한국사": "General / Language / Korean History",
  "공통/어학/사무": "General / Language / Office",
  "공통/OA/데이터": "General / OA / Data",
  "공통/경영/사무": "General / Management / Office",
  "공통/어학/무역": "General / Language / Trade",
  "복지/보건": "Welfare / Healthcare",
  "건설/부동산": "Construction / Real Estate",
  "금융/보험": "Finance / Insurance",
  "조리/식품": "Culinary / Food",
  "미용/패션": "Beauty / Fashion",
  "농림/환경": "Agriculture / Environment",
  "건설/기계": "Construction / Machinery",
  "건설/건축": "Construction / Architecture",
  "공통/어학": "General / Language"
};

export function autoTranslateDynamicText(text: string): string {
  if (!text) return '';
  let str = text.replace(/\[cite[\s\S]*?\]/gi, '').trim();

  if (certDescMap[str]) return certDescMap[str];
  if (certEligibilityMap[str]) return certEligibilityMap[str];
  if (certNameMap[str]) return certNameMap[str];
  if (companyBrandMap[str]) return companyBrandMap[str];
  if (qualTypeMap[str]) return qualTypeMap[str];
  if (categoryMap[str]) return categoryMap[str];

  // Company Brand Replacements
  str = str
    .replace(/두산밥캣/g, 'Doosan Bobcat')
    .replace(/\(주\)두산 Electronic BG|두산 Electronic BG|\(주\)두산 전자BG|두산 전자BG/g, 'Doosan Corp. Electronic BG')
    .replace(/\(주\)두산/g, 'Doosan Corp.')
    .replace(/두산에너빌리티/g, 'Doosan Enerbility')
    .replace(/두산테스나/g, 'Doosan Tesna')
    .replace(/두산퓨얼셀/g, 'Doosan Fuel Cell')
    .replace(/두산로보틱스/g, 'Doosan Robotics')
    .replace(/두산모트롤/g, 'Doosan Mottrol')
    .replace(/두산 로지스틱스 솔루션/g, 'Doosan Logistics Solutions')
    .replace(/롯데웰푸드/g, 'Lotte Wellfood')
    .replace(/롯데칠성음료/g, 'Lotte Chilsung Beverage')
    .replace(/롯데케미칼/g, 'Lotte Chemical')
    .replace(/롯데정밀화학/g, 'Lotte Fine Chemical')
    .replace(/롯데에너지머티리얼즈/g, 'Lotte Energy Materials')
    .replace(/롯데이노베이트/g, 'Lotte Innovate')
    .replace(/롯데글로벌로지스/g, 'Lotte Global Logistics')
    .replace(/롯데건설/g, 'Lotte E&C')
    .replace(/롯데쇼핑/g, 'Lotte Shopping')
    .replace(/롯데GRS/g, 'Lotte GRS')
    .replace(/현대자동차/g, 'Hyundai Motor')
    .replace(/현대모비스/g, 'Hyundai Mobis')
    .replace(/현대제철/g, 'Hyundai Steel')
    .replace(/현대위아/g, 'Hyundai Wia')
    .replace(/현대트랜시스/g, 'Hyundai Transys')
    .replace(/현대로템/g, 'Hyundai Rotem')
    .replace(/현대글로비스/g, 'Hyundai Glovis')
    .replace(/현대건설/g, 'Hyundai E&C')
    .replace(/현대엔지니어링/g, 'Hyundai Engineering')
    .replace(/현대케피코/g, 'Hyundai KEFICO')
    .replace(/현대오토에버/g, 'Hyundai AutoEver')
    .replace(/HS효성첨단소재/g, 'HS Hyosung Advanced Materials')
    .replace(/효성티앤씨/g, 'Hyosung TNC')
    .replace(/효성화학/g, 'Hyosung Chemical')
    .replace(/효성중공업/g, 'Hyosung Heavy Industries')
    .replace(/효성굿스프링스/g, 'Hyosung Goodsprings')
    .replace(/효성ITX/g, 'Hyosung ITX')
    .replace(/삼성전자/g, 'Samsung Electronics')
    .replace(/DS부문/g, 'DS Division')
    .replace(/DX부문/g, 'DX Division')
    .replace(/삼성디스플레이/g, 'Samsung Display')
    .replace(/삼성SDI/g, 'Samsung SDI')
    .replace(/삼성전기/g, 'Samsung Electro-Mechanics')
    .replace(/삼성바이오로직스/g, 'Samsung Biologics')
    .replace(/삼성물산/g, 'Samsung C&T')
    .replace(/삼성중공업/g, 'Samsung Heavy Industries')
    .replace(/삼성웰스토리/g, 'Samsung Welstory')
    .replace(/삼성화재/g, 'Samsung Fire & Marine Insurance')
    .replace(/SK하이닉스/g, 'SK Hynix')
    .replace(/SK온/g, 'SK On')
    .replace(/SK실트론/g, 'SK Siltron')
    .replace(/SK이노베이션/g, 'SK Innovation')
    .replace(/SK에코플랜트/g, 'SK Ecoplant')
    .replace(/SK텔레콤/g, 'SK Telecom')
    .replace(/SK브로드밴드/g, 'SK Broadband')
    .replace(/SK바이오사이언스/g, 'SK Bioscience')
    .replace(/SK가스/g, 'SK Gas')
    .replace(/SK스피드메이트/g, 'SK Speedmate')
    .replace(/SK렌터카/g, 'SK Rent-a-car')
    .replace(/SK스페셜티/g, 'SK Specialty')
    .replace(/SK넥실리스/g, 'SK Nexilis')
    .replace(/LG전자/g, 'LG Electronics')
    .replace(/VS사업본부/g, 'VS Business Unit')
    .replace(/LG디스플레이/g, 'LG Display')
    .replace(/LG에너지솔루션/g, 'LG Energy Solution')
    .replace(/LG화학/g, 'LG Chem')
    .replace(/LG이노텍/g, 'LG Innotek')
    .replace(/LG유플러스/g, 'LG Uplus')
    .replace(/LG생활건강/g, 'LG Household & Health Care')
    .replace(/포스코퓨처엠/g, 'POSCO Future M')
    .replace(/포스코인터내셔널/g, 'POSCO International')
    .replace(/포스코DX/g, 'POSCO DX')
    .replace(/포스코이앤씨/g, 'POSCO E&C')
    .replace(/한화에어로스페이스/g, 'Hanwha Aerospace')
    .replace(/한화솔루션/g, 'Hanwha Solutions')
    .replace(/한화시스템/g, 'Hanwha Systems')
    .replace(/한화오션/g, 'Hanwha Ocean')
    .replace(/한화모멘텀/g, 'Hanwha Momentum')
    .replace(/HD현대중공업/g, 'HD Hyundai Heavy Industries')
    .replace(/HD현대일렉트릭/g, 'HD Hyundai Electric')
    .replace(/HD현대마린솔루션/g, 'HD Hyundai Marine Solution')
    .replace(/HD현대사이트솔루션/g, 'HD Hyundai XiteSolution')
    .replace(/HD현대오일뱅크/g, 'HD Hyundai Oilbank')
    .replace(/HD현대삼호/g, 'HD Hyundai Samho')
    .replace(/HD현대미포/g, 'HD Hyundai Mipo')
    .replace(/에코프로비엠/g, 'Ecopro BM')
    .replace(/에코프로머티리얼즈/g, 'Ecopro Materials')
    .replace(/에코프로에이치엔/g, 'Ecopro HN')
    .replace(/GS칼텍스/g, 'GS Caltex')
    .replace(/GS건설/g, 'GS E&C')
    .replace(/GS리테일/g, 'GS Retail')
    .replace(/CJ제일제당/g, 'CJ CheilJedang')
    .replace(/CJ대한통운/g, 'CJ Logistics')
    .replace(/CJ ENM/g, 'CJ ENM')
    .replace(/CJ올리브영/g, 'CJ Olive Young');

  // Terms & phrases
  str = str
    .replace(/소형 건설장비, 지게차 및 농업\/조경용 장비 조립·메인테넌스/g, 'Small Construction Equip, Forklifts & Agriculture/Landscaping Equip Assembly & Maintenance')
    .replace(/동박적층판\(CCL\) 및 첨단 전자\/반도체 기판 소재 제조/g, 'Copper Clad Laminate (CCL) & Advanced Electronic/Semiconductor Substrate Materials Mfg')
    .replace(/제과, 제빵, 육가공, 빙과 제조 및 설비 메인테넌스/g, 'Confectionery, Bakery, Meat Processing, Ice Cream Mfg & Equipment Maintenance')
    .replace(/완성차 제조 및 생산기술/g, 'Vehicle Manufacturing & Production Engineering')
    .replace(/타이어코드, 탄소섬유, 아라미드 최첨단 신소재 제조/g, 'Tire Cord, Carbon Fiber, Aramid Advanced Materials Mfg')
    .replace(/타이어코드, 탄소섬유, 아라미드 취첨단 신소재 제조/g, 'Tire Cord, Carbon Fiber, Aramid Advanced Materials Mfg')
    .replace(/반도체 제조 및 설비 유지보수/g, 'Semiconductor Mfg & Equipment Maintenance')
    .replace(/전기차용 2차전지 배터리/g, 'EV Secondary Batteries')
    .replace(/반도체 웨이퍼 소재/g, 'Semiconductor Wafer Materials')
    .replace(/반도체\/디스플레이 특수가스/g, 'Semiconductor/Display Special Gases')
    .replace(/통신 네트워크 인프라/g, 'Telecom Network Infrastructure')
    .replace(/건설 및 친환경 플랜트/g, 'Construction & Eco-friendly Plant')
    .replace(/바이오 및 백신 제조/g, 'Bio & Vaccine Mfg')
    .replace(/가스 유통 및 발전 인프라/g, 'Gas Distribution & Power Infrastructure')
    .replace(/모빌리티 및 차량 정비/g, 'Mobility & Vehicle Maintenance')
    .replace(/IT 인프라 운용 및 사무지원/g, 'IT Infrastructure Operation & Office Support')
    .replace(/R&D 기술 및 남양\/의왕 연구소 시험 지원/g, 'R&D Tech & Namyang/Uiwang Lab Testing Support')
    .replace(/완성차 제조 및 생산 설비 메인테넌스/g, 'Vehicle Mfg & Production Equipment Maintenance')
    .replace(/자동차 핵심 모듈 및 전장부품 제조/g, 'Auto Core Modules & Electronic Components Mfg')
    .replace(/자동차용 강판, 봉형강, 제철 설비 보전/g, 'Auto Steel Sheets, Bars, Steelmaking Equipment Maintenance')
    .replace(/자동차 파워트레인, 공작기계, 방산 설비/g, 'Auto Powertrain, Machine Tools, Defense Equip')
    .replace(/자동차 변속기, 휠드라이브, 시트 시스템/g, 'Auto Transmissions, Wheel Drives, Seat Systems')
    .replace(/스마트 팩토리 설비/g, 'Smart Factory Equipment')
    .replace(/완성차\/부품 물류 인프라/g, 'Vehicle/Parts Logistics Infrastructure')
    .replace(/하이테크 플랜트, 건축 및 전기\/설비 시공/g, 'Hi-tech Plant, Architecture & Electrical/Equip Construction')
    .replace(/프리미엄 가전 제조 및 설비 보전/g, 'Premium Home Appliances Mfg & Equipment Maintenance')
    .replace(/차량용 전장부품 및 모빌리티 소재/g, 'Automotive Electronics & Mobility Materials')
    .replace(/2차전지 배터리 셀 및 모듈\/팩 제조/g, 'Secondary Battery Cell & Module/Pack Mfg')
    .replace(/OLED 패널 제조 및 설비 메인테넌스/g, 'OLED Panel Mfg & Equipment Maintenance')
    .replace(/석유화학, 양극재\/배터리 소재, 첨단소재 플랜트/g, 'Petrochemicals, Cathode/Battery Materials & Advanced Materials Plant')
    .replace(/카메라모듈 및 반도체 기판 소재 제조/g, 'Camera Modules & Semiconductor Substrate Materials Mfg')
    .replace(/철강 제조, 제선·제강·압연 생산 및 공정 운전/g, 'Steel Mfg, Ironmaking, Steelmaking, Rolling Production & Process Ops')
    .replace(/제철소 기계 및 전기 설비 정비·예방 보전/g, 'Steel Mill Mechanical & Electrical Maintenance')
    .replace(/2차전지 양극재·음극재 소재 제조 및 설비/g, 'Battery Cathode & Anode Materials Mfg')
    .replace(/스마트팩토리 제어, PLC, EIC 및 IT 인프라/g, 'Smart Factory Control, PLC, EIC & IT Infrastructure')
    .replace(/구동모터코아 및 친환경 모빌리티 부품 제조/g, 'Drive Motor Cores & Eco Mobility Parts Mfg')
    .replace(/표면처리 강판 및 컬러강판 제조/g, 'Surface Treated Steel & Color Steel Mfg')
    .replace(/플랜트 건설, 전기\/설비 시공 및 현장 안전/g, 'Plant Construction, Electrical/Equip Construction & Safety')
    .replace(/철강·원자재 수송, 물류 인프라 및 창고 관리/g, 'Steel & Raw Material Transport, Logistics & Warehouse Mgmt')
    .replace(/항공우주 및 정밀 방산 무기 체계/g, 'Aerospace & Precision Defense Weapon Systems')
    .replace(/조선, 해양 플랜트 및 방산 함정 건조/g, 'Shipbuilding, Offshore Plants & Naval Vessel Construction')
    .replace(/태양광 셀\/모듈 및 재생에너지 설비/g, 'Solar Cells/Modules & Renewable Energy Equip')
    .replace(/방산 전자, 레이다 및 ICT 센서 시스템/g, 'Defense Electronics, Radar & ICT Sensor Systems')
    .replace(/2차전지 및 반도체 공정 자동화 장비 제조/g, 'Secondary Battery & Semiconductor Process Automation Equip Mfg')
    .replace(/산업용 화약 및 특수 케미칼 제조/g, 'Industrial Explosives & Specialty Chemicals Mfg')
    .replace(/초고압 전선, 해저케이블 제조 및 설비 메인테넌스/g, 'Extra-high Voltage Cable & Subsea Cable Mfg & Maintenance')
    .replace(/전력기기, 스마트배전반 및 PLC\/자동화 설비/g, 'Power Devices, Smart Switchboards & PLC/Automation Equip')
    .replace(/트랙터, 사출성형기 및 정밀 산업기계/g, 'Tractors, Injection Molding Machines & Precision Industrial Machinery')
    .replace(/원자력·가스타빈·수소·해상풍력 발전 설비 제조/g, 'Nuclear, Gas Turbine, Hydrogen & Offshore Wind Power Equip Mfg')
    .replace(/발전용 수소 연료전지 제조/g, 'Hydrogen Fuel Cells Mfg for Power Gen')
    .replace(/스마트 물류 자동화 설비/g, 'Smart Logistics Automation Equip')
    .replace(/2차전지 양극재 제조 및 공정 관리/g, 'Secondary Battery Cathode Mfg & Process Mgmt')
    .replace(/초고압 변압기·차단기 제조/g, 'Extra-high Voltage Transformer & Circuit Breaker Mfg')
    .replace(/식품 제조, HMR\/가공식품 생산/g, 'Food Mfg, HMR & Processed Food Production')
    .replace(/전력자원 개발 및 발전, 송배전/g, 'Power Resource Dev, Generation, Transmission & Distribution')
    .replace(/원자력 및 수력 발전/g, 'Nuclear & Hydroelectric Power Gen')
    .replace(/철도 여객\/화물 수송 및 역세권 개발/g, 'Railway Passenger/Freight Transport & Station Area Dev')
    .replace(/인천국제공항 건설, 관리 및 운영/g, 'Incheon Int\'l Airport Construction, Mgmt & Ops')
    .replace(/고속도로 건설, 유지관리 및 부대시설/g, 'Expressway Construction, Maintenance & Facilities')
    .replace(/수자원의 종합적 개발 및 관리/g, 'Comprehensive Water Resources Dev & Mgmt')
    .replace(/천연가스 도입, 제조 및 공급/g, 'Natural Gas Import, Mfg & Supply')
    .replace(/주택 건설, 도시 개발 및 주거 복지/g, 'Housing Construction, Urban Dev & Housing Welfare')
    .replace(/집단에너지 사업, 지역 냉·난방 공급/g, 'District Energy Business, Regional Heating & Cooling')
    .replace(/전력 IT, 에너지 ICT 솔루션/g, 'Power IT, Energy ICT Solutions')
    .replace(/화력, 신재생 발전 및 전력 생산/g, 'Thermal, Renewable Power Gen & Electricity Production')
    .replace(/환경 오염 방지, 자원순환/g, 'Environmental Pollution Prevention & Resource Circulation');

  // Descriptions & Common Sentences
  str = str
    .replace(/제한 없음 \(연령, 학력, 경력 무관\)/g, 'No Restrictions (Age, Academic, Experience)')
    .replace(/제한 없음/g, 'No Restrictions')
    .replace(/제한없음/g, 'No Restrictions')
    .replace(/전기 설비의 시공, 정비, 운용 및 관련 기기의 유지보수 작업을 수행하는 마이스터고 전기 계열 핵심 필수 자격증입니다\./g, 'Core essential electrical certification for installation, maintenance, and operation of electrical equipment.')
    .replace(/CAD 시스템을 활용해 기계 도면을 규격에 맞게 작성, 검토, 수정하는 정밀 기계 설계 대표 자격증입니다\./g, 'Representative precision mechanical design certification for drafting and editing CAD drawings.')
    .replace(/CNC 밀링 머신 절삭 프로그램을 작성하고 부품을 정밀 가공하는 대표적인 금속 가공 자격입니다\./g, 'Representative metal machining certification for programming and machining CNC milling parts.')
    .replace(/CNC 선반 머신을 제어하여 회전체 부품을 정밀 가공 및 측정하는 정밀 공작 자격입니다\./g, 'Precision machining certification for controlling CNC lathe machines to process and measure rotary parts.')
    .replace(/익산, 증평, 용인 사업장 중심의 정밀 도포 및 열처리 설비 기술 중심, 미세 불량 관리 철저/g, 'Precision coating & heat treatment tech focused at Iksan, Jeungpyeong, Yongin; strict defect management')
    .replace(/글로벌 IT\/반도체 기판 소재 분야의 알짜 사업군\. 화학 반응 제어 및 자동화 코팅 라인 보전 역량 필요\./g, 'Prime business in global IT & semiconductor substrate materials. Chemical reaction control & automated coating line maintenance skills required.')
    .replace(/소형 건설장비, 지게차, 농업 및 조경용 컴팩트 장비 제조, 엔진 및 특수 설비 기술/g, 'Mfg of compact construction equipment, forklifts, agriculture & landscaping equip; engine & special machinery tech')
    .replace(/설비 보전 및 생산기술 분야 테크니션 -> 5년차 이상 조장\/반장 승진 기회 -> 기능장 취득 지원/g, 'Equipment maintenance & production technician -> Promotion opportunity to team leader after 5 yrs -> Support for Master Craftsman')
    .replace(/전공\((.*?)\)을 우대하며, 성향과 일치하는 키워드\('(.*?)'\) 중심의 문화를 갖추고 있습니다\./g, 'Prefers your major ($1) and has a culture centered on traits ($2).')
    .replace(/사용자님의 전공\((.*?)\)을 강력히 우대하는 기업입니다\./g, 'Strongly prefers your major ($1).')
    .replace(/사용자님의 성향과 잘 맞는 조직 문화\('(.*?)'\)를 보유하고 있습니다\./g, 'Has an organizational culture matching your traits ($1).')
    .replace(/기업의 핵심 가치와 사용자님의 전반적인 성향이 부합합니다\./g, 'Company core values align with your overall profile.')
    .replace(/사용자님의 전공\((.*?)\)을 우대하는 맞춤형 대표 공공기관\/공기업입니다\./g, 'Representative public enterprise preferring your major ($1).')
    .replace(/사용자님의 적성과 직무 역량에 부합하는 대표 공공기관\/공기업입니다\./g, 'Representative public enterprise matching your aptitude & skills.');

  // Regions
  str = str
    .replace(/경기/g, 'Gyeonggi')
    .replace(/충남/g, 'Chungnam')
    .replace(/서울/g, 'Seoul')
    .replace(/인천/g, 'Incheon')
    .replace(/울산/g, 'Ulsan')
    .replace(/경남/g, 'Gyeongnam')
    .replace(/전남/g, 'Jeonnam')
    .replace(/경북/g, 'Gyeongbuk')
    .replace(/충북/g, 'Chungbuk')
    .replace(/전북/g, 'Jeonbuk')
    .replace(/대구/g, 'Daegu')
    .replace(/대전/g, 'Daejeon')
    .replace(/부산/g, 'Busan')
    .replace(/광주/g, 'Gwangju');

  // Work terms
  str = str
    .replace(/기숙사 지원/g, 'Dormitory Support')
    .replace(/통근버스 운영/g, 'Shuttle Bus Operation')
    .replace(/의료비 지원/g, 'Medical Expense Support')
    .replace(/학자금 지원/g, 'Tuition Support')
    .replace(/식사 제공/g, 'Meals Provided')
    .replace(/경조사 지원/g, 'Family Event Support')
    .replace(/건강검진 지원/g, 'Health Checkup Support')
    .replace(/주 40시간 \(교대근무\)/g, '40 hrs/week (Shift Work)')
    .replace(/주 40시간/g, '40 hrs/week')
    .replace(/교대근무/g, 'Shift Work')
    .replace(/서류전형/g, 'Document Screening')
    .replace(/GSAT\(직무적성검사\)/g, 'GSAT (Aptitude Test)')
    .replace(/종합면접\(직무\/인성\)/g, 'Comprehensive Interview')
    .replace(/1차 면접/g, '1st Interview')
    .replace(/2차 면접/g, '2nd Interview')
    .replace(/채용검진/g, 'Health Checkup')
    .replace(/최종합격/g, 'Final Selection');

  // Departments
  str = str
    .replace(/반도체과/g, 'Semiconductor Dept.')
    .replace(/전자과/g, 'Electronics Dept.')
    .replace(/전기과/g, 'Electrical Dept.')
    .replace(/메카트로닉스과/g, 'Mechatronics Dept.')
    .replace(/기계과/g, 'Mechanical Dept.')
    .replace(/화학공업과/g, 'Chemical Engineering Dept.')
    .replace(/소프트웨어과/g, 'Software Dept.');

  // Currency & Pass rate
  if (str.endsWith('원')) {
    const numStr = str.slice(0, -1);
    if (/^[0-9,]+$/.test(numStr)) {
      str = numStr + ' KRW';
    } else if (numStr.endsWith('만')) {
      const val = numStr.slice(0, -1);
      str = val + '0,000 KRW';
    }
  }

  str = str
    .replace(/필기 약 /g, 'Written approx. ')
    .replace(/실기 약 /g, 'Practical approx. ')
    .replace(/필기/g, 'Written')
    .replace(/실기/g, 'Practical')
    .replace(/약 /g, 'approx. ');

  return str;
}
