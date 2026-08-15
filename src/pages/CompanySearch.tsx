import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Brain, Briefcase, Award, GraduationCap, ChevronRight, Sparkles, Building, CheckCircle2, X, Banknote, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import companiesJson from '../../Data/companies.json';
import linkJson from '../../Data/link.json';

export default function CompanySearch() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const [largeCompanies, setLargeCompanies] = useState<any[]>([]);
  const [publicCompanies, setPublicCompanies] = useState<any[]>([]);
  const [otherLargeCompanies, setOtherLargeCompanies] = useState<any[]>([]);
  const [otherPublicCompanies, setOtherPublicCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showOtherModal, setShowOtherModal] = useState(false);

  // Client-side fallback logic
  const calculateRecommendationsClientSide = () => {
    const allCompanies = companiesJson || [];
    const parsedLinks = linkJson || [];
    const major = userProfile?.major || '';
    const mbti = userProfile?.mbti || '';
    const hollandCode = userProfile?.hollandCode || '';

    const mbtiUpper = mbti.toUpperCase();
    const hollandUpper = hollandCode.toUpperCase();

    const mbtiTraits: Record<string, string[]> = {
      'I': ['분석', '전문성', '독립', '집중', '연구'],
      'E': ['소통', '협력', '팀워크', '리더십', '글로벌'],
      'S': ['현실', '현장', '품질', '실용', '안전', '원칙'],
      'N': ['혁신', '창의', '비전', '도전', '미래'],
      'T': ['논리', '기술', '원칙', '효율', '합리'],
      'F': ['인간미', '고객', '소통', '공감', '협력'],
      'J': ['계획', '체계', '안전', '철저', '책임'],
      'P': ['유연', '변화', '도전', '자율', '적응']
    };

    const hollandTraits: Record<string, string[]> = {
      'R': ['현장', '기계', '안전', '설비', '품질', '제조', '생산'],
      'I': ['연구', '분석', '기술', '설계', '개발', '전문성', '혁신'],
      'A': ['창의', '디자인', '혁신', '독창', '아이디어', '자율'],
      'S': ['고객', '소통', '협력', '인간미', '서비스', '지원'],
      'E': ['리더십', '글로벌', '도전', '성장', '열정', '경쟁력'],
      'C': ['체계', '안전', '원칙', '품질', '책임', '효율', '관리']
    };

    let userKeywords: string[] = [];
    if (mbtiUpper) {
      for (const char of mbtiUpper) {
        if (mbtiTraits[char]) userKeywords = userKeywords.concat(mbtiTraits[char]);
      }
    }
    if (hollandUpper) {
      for (const char of hollandUpper) {
        if (hollandTraits[char]) userKeywords = userKeywords.concat(hollandTraits[char]);
      }
    }
    userKeywords = [...new Set(userKeywords)];

    const findCompanyUrl = (companyObj: any, links: any[]): string => {
      const companyName = companyObj.company;
      if (!companyName) return '';
      if (companyName.includes('LIG넥스원')) return 'https://www.lignex1.com/';
      const cleanName = companyName.replace(/\s*\(.*?\)/g, '').trim();
      let linkObj = links.find((l: any) => l.company === companyName || l.company === cleanName);
      if (!linkObj) linkObj = links.find((l: any) => l.company && (l.company.includes(cleanName) || cleanName.includes(l.company)));
      const rawUrl = linkObj ? (linkObj.url || linkObj.recruitment_page_url || linkObj.official_website || linkObj.job_korea_url || linkObj.saramin_url || '') : '';
      if (rawUrl && rawUrl.startsWith('http')) return rawUrl;
      return '';
    };

    const scoredCompanies = allCompanies.map((c: any) => {
      let score = 0;
      let matchedTraits = [];
      let isMajorMatch = false;

      if (major && c.preferred_majors && Array.isArray(c.preferred_majors)) {
        if (c.preferred_majors.some((m: string) => major.includes(m) || m.includes(major) || major === m)) {
          score += 50;
          isMajorMatch = true;
        }
      }

      const companyText = `${(c.core_talent_keywords || []).join(' ')} ${c.organizational_culture || ''} ${c.employee_review_summary || ''}`;
      for (const keyword of userKeywords) {
        if (companyText.includes(keyword)) {
          score += 5;
          matchedTraits.push(keyword);
        }
      }

      const topTraits = [...new Set(matchedTraits)].slice(0, 3).join(', ');
      
      let reason = '';
      if (isMajorMatch && topTraits) {
        reason = `전공(${major})을 우대하며, 성향과 일치하는 키워드('${topTraits}') 중심의 문화를 갖추고 있습니다.`;
      } else if (isMajorMatch) {
        reason = `사용자님의 전공(${major})을 강력히 우대하는 기업입니다.`;
      } else if (topTraits) {
        reason = `사용자님의 성향과 잘 맞는 조직 문화('${topTraits}')를 보유하고 있습니다.`;
      } else {
        reason = `기업의 핵심 가치와 사용자님의 전반적인 성향이 부합합니다.`;
      }

      return { ...c, score, reason, url: findCompanyUrl(c, parsedLinks) };
    });

    const validCompanies = scoredCompanies.filter((c: any) => c && c.company);

    const allLargeCompanies = validCompanies
      .filter((c: any) => c.company_size && typeof c.company_size === 'string' && c.company_size.includes("대기업"))
      .sort((a: any, b: any) => b.score - a.score || a.company.localeCompare(b.company));

    const largeCompaniesTop10 = allLargeCompanies.slice(0, 10);
    const otherLargeCompaniesList = allLargeCompanies.slice(10);
      
    let publicCompaniesList = validCompanies
      .filter((c: any) => c.company_size && typeof c.company_size === 'string' && (c.company_size.includes("공공기관") || c.company_size.includes("공기업") || c.company_size.includes("공공") || c.company_size.includes("공사") || c.company_size.includes("공단")))
      .sort((a: any, b: any) => b.score - a.score || a.company.localeCompare(b.company));

    if (publicCompaniesList.length < 10) {
      const defaultPublicList = [
        {
          company: '한국전력공사 (한전)',
          sector: '전력 송배전, 스마트그리드 구축 및 전력망 운영',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '전기/전력', '발전/에너지', '전국'],
          main_business_products: '전국 전력 공급망 관리, 변전소 및 송배전 설비 건설/유지보수, 지능형 전력망(AMI)',
          preferred_majors: ['전기과', '전자과', '정보통신과', '소프트웨어과'],
          required_competencies_certifications: ['전기기사/전기산업기사', '전기기능사', '컴퓨터활용능력'],
          core_talent_keywords: ['책임감', '안전제일', '국가 에너지', '협력'],
          organizational_culture: '전국 각 지역본부 및 지사 중심의 안정적이고 체계적인 공기업 문화. 안전수칙 준수와 철저한 현장 점검 중시.',
          employee_review_summary: '국내 최대 에너지 공기업. 워라밸이 보장되며 전국 단위 순환근무 및 연고지 근무의 기회가 있음.',
          meister_average_salary: {
            starting_salary_base: '약 3,500만 원 ~ 3,800만 원',
            annual_salary_with_incentives: '약 4,500만 원 ~ 5,500만 원 수준'
          },
          work_locations: ['전남 나주(본사)', '전국 지역본부 및 지사'],
          expected_work_hours: '주간 상주 (현장 출동 및 교대근무 일부 발생)',
          recruitment_process: ['서류전형', 'NCS 및 전공필기', '직무면접', '최종합격'],
          welfare_benefits: ['사택 지원', '자녀 학자금', '의료비 지원', '복지포인트'],
          meister_career_path: '전력 계통 및 송배전 설비 운용 전문가로 성장.',
          reason: '사용자님의 전공과 성향에 부합하는 국내 최고 에너지 공기업입니다.'
        },
        {
          company: '한국수력원자력 (한수원)',
          sector: '원자력, 수력 및 신재생 발전 설비 운영',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '발전/에너지', '기계/설비', '전국'],
          main_business_products: '원자력 발전소, 수력 및 양수 발전소 운영, 원전 설비 정비 및 안전 점검',
          preferred_majors: ['기계과', '전기과', '전자과', '원자력/화학 관련과'],
          required_competencies_certifications: ['기계정비기능사', '전기기능사', '에너지관리기사/산업기사'],
          core_talent_keywords: ['원자력 안전', '신뢰', '도전', '전문성'],
          organizational_culture: '원전 본부(경주, 영광, 울주, 기장 등) 중심의 철저한 안전 보장 및 보수적이지만 가족적인 분위기.',
          employee_review_summary: '국내 전력 공급의 핵심을 담당하는 시장형 공기업. 높은 연봉 수준과 최고 수준의 복지.',
          meister_average_salary: {
            starting_salary_base: '약 3,600만 원 ~ 3,900만 원',
            annual_salary_with_incentives: '약 4,800만 원 ~ 5,800만 원 수준'
          },
          work_locations: ['경북 경주(본사)', '전국 원자력/수력 발전소 본부'],
          expected_work_hours: '주간 상주 또는 교대 근무',
          recruitment_process: ['서류전형', '직업기초능력평가 및 직무전공', '면접', '신원조회 및 건강검진'],
          welfare_benefits: ['사택 및 합숙소 제공', '자녀 학자금 전액', '종합건강검진', '선택적 복지'],
          meister_career_path: '원전 및 발전 설비 기계/전기 오퍼레이터 및 정비 전문가.',
          reason: '국가 전력 생산의 중추이자 최고의 근무 환경을 자랑하는 발전 공기업입니다.'
        },
        {
          company: '한국철도공사 (코레일)',
          sector: '철도 운송, 열차 운행 관리 및 차량 정비',
          company_size: '공공기관 (준시장형 공기업)',
          search_categories: ['공기업', '기계/설비', '교통/물류', '전국'],
          main_business_products: 'KTX 및 일반 열차 운행, 철도 차량 중정비 및 유지보수, 역무 및 선로 시설 관리',
          preferred_majors: ['기계과', '전기과', '전자과', '철도차량과', '메카트로닉스과'],
          required_competencies_certifications: ['철도차량기사/산업기사', '기계정비기능사', '전기기능사', '용접기능사'],
          core_talent_keywords: ['안전운행', '고객만족', '신뢰', '소통'],
          organizational_culture: '대전 본사 및 전국 차량기지/역사 중심. 철저한 안전 규정과 교대 근무 체계 운영.',
          employee_review_summary: '국민의 발을 책임지는 대표 공기업. 기술직(차량, 전기, 토목) 마이스터고 인재 채용 규모가 매우 큼.',
          meister_average_salary: {
            starting_salary_base: '약 3,200만 원 ~ 3,500만 원',
            annual_salary_with_incentives: '약 4,000만 원 ~ 4,900만 원 수준'
          },
          work_locations: ['대전광역시(본사)', '전국 철도 차량기지 및 사업소'],
          expected_work_hours: '교대 근무 (3교대 또는 4교대)',
          recruitment_process: ['서류전형', '필기시험(NCS)', '면접시험', '철도적성검사 및 체력검사'],
          welfare_benefits: ['철도 승차권 할인 혜택', '사택 제공', '학자금 지원', '복지포인트'],
          meister_career_path: '고속열차(KTX) 및 일반 열차 차량 정비 기술 명장으로 성장.',
          reason: '마이스터고 기술 인재를 적극 우대하며 철도 차량 정비 분야의 전문성을 쌓을 수 있습니다.'
        },
        {
          company: '인천국제공항공사',
          sector: '공항 운영, 항공 안전 및 공항 시설물 유지보수',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '기계/설비', 'IT/네트워크', '수도권'],
          main_business_products: '인천공항 시설 운영, 수하물 처리 시스템(BHS) 유지보수, 항행안전시설 관리',
          preferred_majors: ['기계과', '전기과', '전자과', '정보통신과', '설비과'],
          required_competencies_certifications: ['공조냉동기계기사/산업기사', '전기기사', '정보처리기사', '기계정비기능사'],
          core_talent_keywords: ['세계 최고 공항', '안전', '소통', '혁신'],
          organizational_culture: '인천 영종도 본사 중심의 스마트하고 글로벌한 공기업 문화. 최첨단 공항 인프라 유지.',
          employee_review_summary: '최고의 복지와 급여 수준을 자랑하는 꿈의 공기업. 영종도 근무 환경이 쾌적함.',
          meister_average_salary: {
            starting_salary_base: '약 4,000만 원 ~ 4,300만 원',
            annual_salary_with_incentives: '약 5,200만 원 ~ 6,500만 원 수준'
          },
          work_locations: ['인천국제공항 (영종도)'],
          expected_work_hours: '주간 상주 또는 교대 근무',
          recruitment_process: ['서류전형', 'NCS 및 직무필기', '심층면접', '신체검사'],
          welfare_benefits: ['직장 어린이집', '의료비 지원', '주택자금 대출', '자기계발비'],
          meister_career_path: '세계 최고 수준의 공항 특수 설비 및 자동화 시스템 운영 전문가.',
          reason: '최고 수준의 연봉과 복지를 자랑하며 첨단 공항 설비 기술을 다룰 수 있습니다.'
        },
        {
          company: '한국도로공사',
          sector: '고속도로 건설, 유지관리 및 교통 관리',
          company_size: '공공기관 (준시장형 공기업)',
          search_categories: ['공기업', '건축/토목', '전기/전력', '전국'],
          main_business_products: '고속도로 및 교량/터널 건설, 요금소(Tollgate) 및 지능형 교통체계(ITS) 운영',
          preferred_majors: ['토목과', '건축과', '전기과', '전자과', '정보통신과'],
          required_competencies_certifications: ['토목기사/산업기사', '전기기사', '측량기능사', '정보통신기능사'],
          core_talent_keywords: ['안전한 길', '행복한 국민', '전문성', '상생'],
          organizational_culture: '김천 본사 및 전국 지역본부/지사 중심. 도로 인프라 안전 관리 및 현장 중심 문화.',
          employee_review_summary: '국가 간선도로망을 책임지는 공기업. 안정성과 탄탄한 복리후생.',
          meister_average_salary: {
            starting_salary_base: '약 3,300만 원 ~ 3,600만 원',
            annual_salary_with_incentives: '약 4,200만 원 ~ 5,200만 원 수준'
          },
          work_locations: ['경북 김천(본사)', '전국 고속도로 지사 및 현장'],
          expected_work_hours: '주간 상주 및 교대 근무',
          recruitment_process: ['서류전형', '필기전형(NCS/전공)', '면접전형', '채용검진'],
          welfare_benefits: ['사택 제공', '학자금 지원', '의료비 보조', '복지포인트'],
          meister_career_path: '국가 도로 인프라 시설 관리 및 스마트 교통망 운영 전문가.',
          reason: '국가 기반 시설인 고속도로의 유지보수 및 스마트 교통 시스템을 선도합니다.'
        },
        {
          company: '한국수자원공사 (K-water)',
          sector: '수자원 종합 개발, 댐 및 상하수도 관리',
          company_size: '공공기관 (준시장형 공기업)',
          search_categories: ['공기업', '건축/토목', '기계/설비', '전국'],
          main_business_products: '다목적댐 및 용수 전용댐 건설·관리, 지방 및 광역 상수도 공급, 수력발전 및 신재생에너지',
          preferred_majors: ['토목과', '기계과', '전기과', '환경과', '설비과'],
          required_competencies_certifications: ['토목기사', '상하수도기술사/기사', '기계정비기능사', '전기기사'],
          core_talent_keywords: ['물 안심', '가치 창조', '상생', '전문성'],
          organizational_culture: '대전 본사 및 전국 댐/수도 관리단 중심. 물 복지 실현을 위한 전문적이고 친환경적인 업무 문화.',
          employee_review_summary: '국내 물 관리 전담 공기업. 수자원 및 에너지 분야에서 전문성을 키우기 좋음.',
          meister_average_salary: {
            starting_salary_base: '약 3,400만 원 ~ 3,700만 원',
            annual_salary_with_incentives: '약 4,400만 원 ~ 5,400만 원 수준'
          },
          work_locations: ['대전광역시(본사)', '전국 댐 및 정수장 사업소'],
          expected_work_hours: '주간 상주 (당직 근무 포함)',
          recruitment_process: ['서류전형', '직업기초능력 및 직무전문시험', '면접', '신원조사'],
          welfare_benefits: ['주택자금 융자', '사택 제공', '의료비 지원', '자녀 학자금'],
          meister_career_path: '국가 수자원 인프라 및 친환경 에너지 설비 운영·유지보수 전문가.',
          reason: '대한민국 물 관리와 친환경 에너지를 이끄는 핵심 공기업입니다.'
        },
        {
          company: '한국가스공사',
          sector: '천연가스 도입, 공급 및 LNG 인수기지 운영',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '가스/에너지', '기계/설비', '전국'],
          main_business_products: '해외 LNG 도입 및 국내 공급, 전국 주배관망 및 LNG 생산기지(평택, 인천, 통영, 삼척) 운영',
          preferred_majors: ['기계과', '전기과', '화공과', '가스과', '설비과'],
          required_competencies_certifications: ['가스기사/산업기사', '배관기능사', '에너지관리기사', '위험물기능사'],
          core_talent_keywords: ['청정에너지', '안정 공급', '소통', '기술 혁신'],
          organizational_culture: '대구 본사 및 전국 LNG 생산기지 중심. 가스 안전 관리와 고압 배관망 운영의 엄격함 중시.',
          employee_review_summary: '국가 에너지를 책임지는 시장형 공기업으로 급여와 복리후생이 매우 우수함.',
          meister_average_salary: {
            starting_salary_base: '약 3,500만 원 ~ 3,800만 원',
            annual_salary_with_incentives: '약 4,700만 원 ~ 5,700만 원 수준'
          },
          work_locations: ['대구광역시(본사)', '전국 LNG 생산기지 및 지사'],
          expected_work_hours: '주간 상주 또는 교대 근무',
          recruitment_process: ['서류전형', '필기전형(NCS/전공)', '면접전형', '건강검진'],
          welfare_benefits: ['사택 지원', '자녀 학자금', '의료비 지원', '복지포인트'],
          meister_career_path: '초저온 LNG 생산 설비 및 고압 가스 배관망 운영·안전 관리 전문가.',
          reason: '국가 청정에너지 인프라를 지탱하는 핵심 에너지 공기업입니다.'
        },
        {
          company: '한국토지주택공사 (LH)',
          sector: '주택 건설, 도시 개발 및 주거 복지 사업',
          company_size: '공공기관 (준시장형 공기업)',
          search_categories: ['공기업', '건축/토목', '전기/설비', '전국'],
          main_business_products: '공공주택 건설 및 공급, 도시재생 및 토지 개발, 주거복지 및 단지 조성',
          preferred_majors: ['건축과', '토목과', '전기과', '설비과', '경영/사무과'],
          required_competencies_certifications: ['건축기사/산업기사', '토목기사', '전기기사', 'CAD기능사'],
          core_talent_keywords: ['주거복지', '상생', '안전', '투명성'],
          organizational_culture: '경남 진주 본사 및 전국 지역본부 중심. 국민 주거안정을 위한 현장 지향적 공기업.',
          employee_review_summary: '국내 최대 규모의 주택/도시개발 공기업. 안정적인 복리후생과 전문 기술 습득 기회.',
          meister_average_salary: {
            starting_salary_base: '약 3,400만 원 ~ 3,700만 원',
            annual_salary_with_incentives: '약 4,300만 원 ~ 5,300만 원 수준'
          },
          work_locations: ['경남 진주(본사)', '전국 지역본부 및 사업단'],
          expected_work_hours: '주간 상주 근무',
          recruitment_process: ['서류전형', '필기전형(NCS/전공)', '면접전형', '채용검진'],
          welfare_benefits: ['사택 및 숙소 지원', '자녀 학자금', '의료비 지원', '선택적 복지'],
          meister_career_path: '건축/토목/전기 단지 조성 및 공공주택 기술 전문가.',
          reason: '국민 주거복지를 선도하며 건축·토목·전기 분야의 전문성을 발휘할 수 있습니다.'
        },
        {
          company: '한국지역난방공사',
          sector: '집단에너지 사업, 지역 냉·난방 공급 및 발전',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '에너지/설비', '기계/전기', '수도권/전국'],
          main_business_products: '열병합발전소 운영, 지역 냉난방 열수송관 시설 관리 및 효율적인 에너지 공급',
          preferred_majors: ['기계과', '전기과', '화공과', '에너지/설비과'],
          required_competencies_certifications: ['에너지관리기사/산업기사', '공조냉동기계기사', '전기기사', '배관기능사'],
          core_talent_keywords: ['친환경', '에너지 효율', '안전', '고객 행복'],
          organizational_culture: '경기 성남(분당) 본사 및 전국 지사 중심. 친환경 집단에너지 전문 기업 문화.',
          employee_review_summary: '탄탄한 재무구조와 높은 연봉 수준을 갖춘 알짜 친환경 에너지 공기업.',
          meister_average_salary: {
            starting_salary_base: '약 3,600만 원 ~ 3,900만 원',
            annual_salary_with_incentives: '약 4,600만 원 ~ 5,600만 원 수준'
          },
          work_locations: ['경기 성남(본사)', '전국 지사 및 사업소'],
          expected_work_hours: '주간 상주 또는 교대 근무',
          recruitment_process: ['서류전형', 'NCS 및 전공필기', '면접전형', '신체검사'],
          welfare_benefits: ['사택 지원', '학자금 지원', '의료 보조금', '복지포인트'],
          meister_career_path: '열병합발전 설비 및 지역난방 열수송관 운용·정비 전문가.',
          reason: '친환경 집단에너지 분야를 선도하며 뛰어난 복리와 기술 성장 환경을 제공합니다.'
        },
        {
          company: '한전KDN',
          sector: '전력 IT, 에너지 ICT 솔루션 및 스마트그리드',
          company_size: '공공기관 (준기업형 공기업)',
          search_categories: ['공기업', 'IT/소프트웨어', '전기/전자', '전국'],
          main_business_products: '전력계통 ICT 시스템 구축·운영, 전력 제어망 보안, 스마트그리드 및 에너지 데이터 관리',
          preferred_majors: ['소프트웨어과', '정보통신과', '컴퓨터과', '전기/전자과'],
          required_competencies_certifications: ['정보처리기사/산업기사', '정보통신기사', '전기기사', '네트워크관리사'],
          core_talent_keywords: ['에너지 ICT', '보안', '혁신', '전문성'],
          organizational_culture: '전남 나주 본사 중심. 전력 IT 융합 기술 연구 및 안정적인 스마트그리드 운용 문화.',
          employee_review_summary: '국내 유일의 전력 ICT 전문 공기업. IT 및 전기전자 기술직 채용 우수.',
          meister_average_salary: {
            starting_salary_base: '약 3,400만 원 ~ 3,700만 원',
            annual_salary_with_incentives: '약 4,300만 원 ~ 5,200만 원 수준'
          },
          work_locations: ['전남 나주(본사)', '전국 지역본부 및 사업처'],
          expected_work_hours: '주간 상주 근무',
          recruitment_process: ['서류전형', 'NCS 및 IT전공필기', '면접전형', '채용검진'],
          welfare_benefits: ['사택 제공', '학자금 지원', '종합건강검진', '복지포인트'],
          meister_career_path: '전력 계통 ICT 및 네트워크/보안 시스템 운영 전문가.',
          reason: '전력과 IT가 융합된 첨단 스마트그리드 기술을 다루는 ICT 전문 공기업입니다.'
        },
        {
          company: '한국남동발전',
          sector: '화력, 신재생 발전 및 전력 생산',
          company_size: '공공기관 (시장형 공기업)',
          search_categories: ['공기업', '발전/에너지', '기계/전기', '전국'],
          main_business_products: '삼천포, 영흥, 여수, 분당 발전소 등 기저 전력 생산 및 신재생에너지 발전',
          preferred_majors: ['기계과', '전기과', '전자과', '화공과'],
          required_competencies_certifications: ['기계정비기능사', '전기기능사', '에너지관리기사', '위험물기능사'],
          core_talent_keywords: ['친환경 발전', '안전', '도전', '청렴'],
          organizational_culture: '경남 진주 본사 및 대형 발전본부 중심. 철저한 설비 안전관리 및 원팀 문화.',
          employee_review_summary: '한전 자회사 중 높은 연봉과 뛰어난 복지를 자랑하는 발전 공기업.',
          meister_average_salary: {
            starting_salary_base: '약 3,600만 원 ~ 3,900만 원',
            annual_salary_with_incentives: '약 4,700만 원 ~ 5,700만 원 수준'
          },
          work_locations: ['경남 진주(본사)', '인천 영흥, 경남 삼천포, 전남 여수 등 발전본부'],
          expected_work_hours: '주간 상주 또는 4교대 근무',
          recruitment_process: ['서류전형', '필기전형(NCS/전공)', '면접전형', '신원조회'],
          welfare_benefits: ['사택 및 합숙소', '자녀 학자금', '의료비 지원', '선택적 복지'],
          meister_career_path: '대형 발전 설비 운용 및 정비 관리 기술 전문가.',
          reason: '안정적인 발전 인프라 운용 경험과 우수한 처우를 제공하는 발전 공기업입니다.'
        },
        {
          company: '한국환경공단',
          sector: '환경 오염 방지, 자원순환 및 기후변화 대응',
          company_size: '공공기관 (위탁집행형 준정부기관)',
          search_categories: ['공기업', '환경/바이오', '화학/설비', '전국'],
          main_business_products: '대기/수질 측정망 운영, 폐기물 자원순환 관리, 대기환경 및 수질개선 시설 운영',
          preferred_majors: ['환경과', '화학/화공과', '기계과', '전기과'],
          required_competencies_certifications: ['수질환경기사', '대기환경기사', '위험물기능사', '환경기능사'],
          core_talent_keywords: ['친환경', '탄소중립', '전문성', '공공성'],
          organizational_culture: '인천 서구 본사 및 전국 지역본부 중심. 쾌적한 환경 조성을 위한 전문 기술 문화.',
          employee_review_summary: '기후변화와 환경보호를 선도하는 대표 환경 전문 공공기관.',
          meister_average_salary: {
            starting_salary_base: '약 3,300만 원 ~ 3,600만 원',
            annual_salary_with_incentives: '약 4,100만 원 ~ 5,000만 원 수준'
          },
          work_locations: ['인천광역시(본사)', '전국 지역본부 및 환경 측정소'],
          expected_work_hours: '주간 상주 근무',
          recruitment_process: ['서류전형', 'NCS 및 전공필기', '면접전형', '채용검진'],
          welfare_benefits: ['주택자금 지원', '자녀 학자금', '의료비 보조', '복지포인트'],
          meister_career_path: '국가 대기/수질 환경 측정 및 오염 방지 시설 기술 전문가.',
          reason: '국가 친환경 인프라와 자원순환을 책임지는 미래 가치 중심 공기관입니다.'
        }
      ];

      const existingNames = new Set(publicCompaniesList.map((c: any) => c.company));
      for (const defC of defaultPublicList) {
        if (!existingNames.has(defC.company)) {
          let score = 50;
          let isMajorMatch = false;
          if (major && (defC as any).preferred_majors && Array.isArray((defC as any).preferred_majors)) {
            if ((defC as any).preferred_majors.some((m: string) => major.includes(m) || m.includes(major) || major === m)) {
              score += 30;
              isMajorMatch = true;
            }
          }
          let reason = isMajorMatch
            ? `사용자님의 전공(${major})을 우대하는 맞춤형 대표 공공기관/공기업입니다.`
            : (defC as any).reason || `사용자님의 적성과 직무 역량에 부합하는 대표 공공기관/공기업입니다.`;

          publicCompaniesList.push({
            ...defC,
            score,
            reason,
            url: findCompanyUrl(defC, parsedLinks)
          });
        }
      }
      publicCompaniesList.sort((a: any, b: any) => b.score - a.score || a.company.localeCompare(b.company));
    }

    const publicCompaniesTop10 = publicCompaniesList.slice(0, 10);
    const otherPublicCompaniesList = publicCompaniesList.slice(10);

    setLargeCompanies(largeCompaniesTop10);
    setPublicCompanies(publicCompaniesTop10);
    setOtherLargeCompanies(otherLargeCompaniesList);
    setOtherPublicCompanies(otherPublicCompaniesList);
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      const isProfileComplete = userProfile?.major || userProfile?.mbti || userProfile?.hollandCode;
      
      if (!isProfileComplete) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/recommend-companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            major: userProfile?.major || '',
            mbti: userProfile?.mbti || '',
            hollandCode: userProfile?.hollandCode || ''
          })
        });
        
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        
        const data = await res.json();
        
        if (data && data.largeCompanies && data.largeCompanies.length > 0) {
          setLargeCompanies(data.largeCompanies || []);
          setPublicCompanies(data.publicCompanies || []);
          setOtherLargeCompanies(data.otherLargeCompanies || []);
          setOtherPublicCompanies(data.otherPublicCompanies || []);
        } else {
          calculateRecommendationsClientSide();
        }
      } catch (error) {
        console.warn('API error, falling back to client-side data:', error);
        calculateRecommendationsClientSide();
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userProfile]);

  const cleanText = (val: any): string => {
    if (!val) return '';
    if (typeof val !== 'string') return String(val);
    return val
      .replace(/\[cite[\s\S]*?\]/gi, '')
      .replace(/\[[^\]]*cite[^\]]*\]/gi, '')
      .trim();
  };

  const getCompanyTypeBadge = (company: any) => {
    if (company.isPublic || (company.company_size && (company.company_size.includes('공기업') || company.company_size.includes('공공기관')))) {
      return '공기업';
    }
    return '대기업';
  };

  const hasProfileData = userProfile?.major || userProfile?.mbti || userProfile?.hollandCode;

  const CompanyModal = ({ company, onClose }: { company: any, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'business' | 'culture' | 'talent' | 'majors_certs' | 'salary_welfare' | 'work_recruitment' | 'career' | 'reason' | null>(null);

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 backdrop-blur-md ${isLightMode ? "bg-white/85" : "bg-[#0F172A]/85"}`}
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col z-10 border ${isLightMode ? "bg-white border-slate-200 text-slate-900" : "bg-[#111827] border-white/10 text-white"}`}>
          <button 
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-10 cursor-pointer ${isLightMode ? "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
          >
            <X size={24} />
          </button>

          <div className={`flex flex-col md:flex-row items-start justify-between mb-6 pb-6 border-b gap-6 pr-12 ${isLightMode ? "border-slate-200" : "border-white/10"}`}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-[13px] font-semibold rounded-lg border ${
                  getCompanyTypeBadge(company) === '공기업' 
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35'
                }`}>
                  {t(getCompanyTypeBadge(company))}
                </span>
                <span className={`text-[13px] font-medium tracking-wide ${isLightMode ? "text-slate-500" : "text-white/50"}`}>{t(cleanText(company.sector))}</span>
              </div>
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>{t(cleanText(company.company))}</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Building2 size={28} />
            </div>
          </div>

          {/* Interactive Category Buttons / Tabs (Wrapped to prevent cutoff) */}
          <div className={`flex flex-wrap gap-2.5 pb-6 mb-6 border-b ${isLightMode ? "border-slate-200" : "border-white/10"}`}>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'business' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Briefcase size={16} className="text-blue-400" />{t('주요 사업/제품')}</button>
            <button
              onClick={() => setActiveTab('culture')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'culture' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <User size={16} className="text-indigo-400" />{t('조직 문화')}</button>
            <button
              onClick={() => setActiveTab('talent')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'talent' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Sparkles size={16} className="text-amber-400" />{t('핵심 역량 및 가치')}</button>
            <button
              onClick={() => setActiveTab('majors_certs')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'majors_certs' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <GraduationCap size={16} className="text-purple-400" />{t('우대 전공 & 자격증')}</button>
            <button
              onClick={() => setActiveTab('salary_welfare')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'salary_welfare' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Banknote size={16} className="text-indigo-400" />{t('연봉 & 복리후생')}</button>
            <button
              onClick={() => setActiveTab('work_recruitment')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'work_recruitment' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Building size={16} className="text-pink-400" />{t('근무 & 채용절차')}</button>
            <button
              onClick={() => setActiveTab('career')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'career' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <ChevronRight size={16} className="text-cyan-400" />{t('커리어 패스')}</button>
            <button
              onClick={() => setActiveTab('reason')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'reason' ? (isLightMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') : isLightMode ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <Brain size={16} className="text-indigo-300" />{t('AI 추천 사유')}</button>
          </div>
          
          {/* Active Tab Content */}
          <div className={`flex-1 rounded-2xl p-6 md:p-8 border min-h-[240px] max-h-[420px] overflow-y-auto flex flex-col justify-between ${isLightMode ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-white/5 border-white/5"}`}>
            <div>
              {activeTab === null && (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
                    <Sparkles size={28} />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>{t('원하시는 정보 카테고리를 선택해주세요')}</h3>
                  <p className={`text-sm max-w-md ${isLightMode ? "text-slate-500" : "text-white/60"}`}>{t('상단의 버튼(주요 사업, 조직 문화, 연봉 및 복지, 우대 자격증 등)을 누르면 해당 상세 내용이 표시됩니다.')}</p>
                </div>
              )}

              {activeTab === 'business' && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    <Briefcase size={20} className="text-blue-400" />{t('주요 사업 및 제품')}</h3>
                  <p className={`leading-relaxed text-base ${isLightMode ? "text-slate-700" : "text-white/80"}`}>
                    {t(company.main_business_products || '등록된 주요 사업 정보가 없습니다.')}
                  </p>
                </div>
              )}

              {activeTab === 'culture' && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    <User size={20} className="text-indigo-400" />{t('조직 문화 및 근무 분위기')}</h3>
                  <p className={`leading-relaxed text-base mb-4 ${isLightMode ? "text-slate-700" : "text-white/80"}`}>
                    {t(company.organizational_culture || '등록된 조직 문화 정보가 없습니다.')}
                  </p>
                  {company.employee_review_summary && (
                    <div className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}>
                      <span className="text-xs font-semibold text-indigo-400 block mb-1">{t('💡 현직자 리뷰 / 특징 요약')}</span>
                      <p className="text-white/70 text-sm leading-relaxed">{t(company.employee_review_summary)}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'talent' && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    <Sparkles size={20} className="text-amber-400" />{t('핵심 역량 및 가치 (인재상)')}</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {company.core_talent_keywords?.map((kw: string, i: number) => (
                       <span key={i} className="px-4 py-2 bg-white/10 text-white/90 text-sm font-medium rounded-xl border border-white/10 flex items-center gap-2.5">
                         <CheckCircle2 size={16} className="text-amber-400" /> {t(kw)}
                       </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'majors_certs' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                      <GraduationCap size={18} className="text-purple-400" />{t('우대 전공')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.preferred_majors?.map((mj: string, i: number) => (
                         <span key={i} className="px-3.5 py-1.5 bg-purple-500/15 text-purple-200 text-sm font-medium rounded-xl border border-purple-500/30">
                           {t(mj)}
                         </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                      <Award size={18} className="text-pink-400" />{t('필요 역량 및 자격증 (하나씩 확인)')}</h3>
                    <div className="flex flex-col gap-2">
                      {company.required_competencies_certifications?.map((cert: string, i: number) => (
                         <div key={i} className="px-4 py-2.5 bg-pink-500/10 text-pink-200 text-sm font-medium rounded-xl border border-pink-500/20 flex items-center gap-3">
                           <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                           <span>{t(cert)}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'salary_welfare' && (
                <div className="space-y-6">
                  {company.meister_average_salary && (
                    <div>
                      <h3 className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        <Banknote size={18} className="text-indigo-400" />{t('마이스터고 출신 평균 연봉 기준')}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}>
                          <span className="text-white/50 text-xs font-medium block mb-1">{t('기본급 기준')}</span>
                          <span className={`text-white ${isLightMode ? "text-slate-900" : ""} font-semibold text-sm`}>{t(company.meister_average_salary.starting_salary_base)}</span>
                        </div>
                        <div className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}>
                          <span className="text-indigo-400/85 text-xs font-medium block mb-1">{t('성과급 및 수당 포함')}</span>
                          <span className="text-indigo-300 font-bold text-sm">{t(company.meister_average_salary.annual_salary_with_incentives)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {company.welfare_benefits && (
                    <div>
                      <h3 className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        <Sparkles size={18} className="text-amber-400" />{t('복리후생 및 복지 제도')}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {company.welfare_benefits.map((wb: string, i: number) => (
                          <div key={i} className="px-3.5 py-2 bg-white/10 text-white/90 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                            <span>{t(wb)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'work_recruitment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {company.work_locations && (
                      <div className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}>
                        <span className="text-white/50 text-xs font-medium block mb-1">{t('근무 지역')}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {company.work_locations.map((loc: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white/10 text-white text-xs rounded-md">{t(loc)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.expected_work_hours && (
                      <div className={`p-4 rounded-xl border ${isLightMode ? "bg-white border-slate-200" : "bg-black/20 border-white/5"}`}>
                        <span className="text-white/50 text-xs font-medium block mb-1">{t('근무 형태')}</span>
                        <span className={`text-white ${isLightMode ? "text-slate-900" : ""} text-sm font-medium`}>{t(company.expected_work_hours)}</span>
                      </div>
                    )}
                  </div>

                  {company.recruitment_process && (
                    <div>
                      <h3 className={`text-md font-bold mb-3 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                        <Building size={18} className="text-pink-400" />{t('채용 절차')}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {company.recruitment_process.map((step: string, i: number) => (
                          <React.Fragment key={i}>
                            <span className="px-3 py-1.5 bg-pink-500/10 text-pink-200 text-xs font-semibold rounded-xl border border-pink-500/20">
                              {t(step)}
                            </span>
                            {i < company.recruitment_process.length - 1 && (
                              <ChevronRight size={14} className="text-white/30" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'career' && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isLightMode ? "text-slate-900" : "text-white"}`}>
                    <ChevronRight size={20} className="text-cyan-400" />{t('마이스터고 졸업생 커리어 패스')}</h3>
                  <p className="text-white/80 leading-relaxed text-base bg-black/20 p-5 rounded-2xl border border-white/5">
                    {t(company.meister_career_path || '등록된 커리어 패스 정보가 없습니다.')}
                  </p>
                </div>
              )}

              {activeTab === 'reason' && (
                <div>
                  <h3 className="text-lg font-bold text-indigo-300 mb-4 flex items-center gap-2">
                    <Brain size={20} />{t('MyStair AI 맞춤 추천 사유')}</h3>
                  <p className="text-indigo-100/90 leading-relaxed text-base bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
                    {t(company.reason || '등록된 추천 사유가 없습니다.')}
                  </p>
                </div>
              )}
            </div>

            {/* Official Website Link at bottom */}
            {company.url && company.url.startsWith('http') && (
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-xs">{t('공식 채용 및 기업 홈페이지에서 상세 채용 공고를 확인하세요.')}</span>
                <a 
                  href={company.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>{t('🔗 공식 홈페이지 방문하기')}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const OtherCompaniesModal = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'ALL' | 'LARGE' | 'PUBLIC'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    let combinedList: any[] = [];
    if (activeTab === 'ALL') {
      combinedList = [
        ...otherLargeCompanies.map(c => ({ ...c, isPublic: false })),
        ...otherPublicCompanies.map(c => ({ ...c, isPublic: true }))
      ];
    } else if (activeTab === 'LARGE') {
      combinedList = otherLargeCompanies.map(c => ({ ...c, isPublic: false }));
    } else {
      combinedList = otherPublicCompanies.map(c => ({ ...c, isPublic: true }));
    }

    const filtered = combinedList.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.sector && c.sector.toLowerCase().includes(q)) ||
        (c.company_size && c.company_size.toLowerCase().includes(q))
      );
    });

    const totalCount = otherLargeCompanies.length + otherPublicCompanies.length;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <div 
          className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col z-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="mb-6 pb-4 border-b border-white/10 pr-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30">{t('나머지 기업 목록')}</span>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}` }>{t('TOP 10 이외의 전체 기업')} ({totalCount}{t('개')})</h2>
            <p className={`text-xs sm:text-sm mt-1 ${isLightMode ? "text-slate-500" : "text-white/50"}` }>{t('상위 TOP 10 이외의 모든 추천 대기업 및 공기업 리스트입니다. 클릭 시 상세 정보를 볼 수 있습니다.')}</p>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLightMode ? "text-slate-400" : "text-white/40"}` } />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('기업명 또는 업종 검색...')}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors ${isLightMode ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400" : "bg-white/5 border-white/10 text-white placeholder-white/30"}` }
              />
            </div>
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                {t('전체')} ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('LARGE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'LARGE' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                {t('대기업')} ({otherLargeCompanies.length})
              </button>
              <button
                onClick={() => setActiveTab('PUBLIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'PUBLIC' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                {t('공기업')} ({otherPublicCompanies.length})
              </button>
            </div>
          </div>

          {/* Companies List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className={`py-12 text-center text-sm ${isLightMode ? "text-slate-400" : "text-white/40"}` }>
                {t('검색 조건에 일치하는 기업이 없습니다.')}
              </div>
            ) : (
              filtered.map((company, idx) => (
                <div
                  key={`other-${idx}-${company.company}`}
                  onClick={() => setSelectedCompany(company)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                      getCompanyTypeBadge(company) === '공기업' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white'
                    }`}>
                      {idx + 11}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-base transition-colors ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}` }>
                          {t(cleanText(company.company))}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded border shrink-0 ${
                          getCompanyTypeBadge(company) === '공기업'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}>
                          {t(getCompanyTypeBadge(company))}
                        </span>
                      </div>
                      {company.sector && (
                        <p className={`text-xs mt-0.5 truncate max-w-lg ${isLightMode ? "text-slate-500" : "text-white/50"}` }>
                          {t(cleanText(company.sector))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    {company.url && company.url.startsWith('http') && (
                      <a
                        href={company.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('공식 홈페이지 방문')}
                        className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <ExternalLink size={13} />
                        <span className="hidden sm:inline">{t('홈페이지')}</span>
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCompany(company)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"}` }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-transparent flex flex-col relative z-10 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className={`backdrop-blur-md border-b sticky top-0 z-50 shrink-0 ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${isLightMode ? "text-slate-900" : "text-white"}`}>{t("나만의 기업찾기")}</h1>
              <p className={`text-[13px] font-medium mt-0.5 ${isLightMode ? "text-slate-500" : "text-white/60"}`}>{t("다이어리 성장기록 & 프로필 종합 AI 맞춤 기업 추천")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowOtherModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-2 border border-indigo-500/30 shrink-0"
            >
              <Building2 size={16} />
              <span>{t('나머지 기업 보기')}</span>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full font-bold">
                {otherLargeCompanies.length + otherPublicCompanies.length}
              </span>
            </button>

            {!hasProfileData && (
              <button 
                onClick={() => navigate('/mypage')}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 border ${isLightMode ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm" : "bg-white/10 hover:bg-white/20 text-white border-white/5 hover:border-white/10"}` }
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{t('프로필 완성')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className={`font-medium text-lg ${isLightMode ? "text-slate-500" : "text-white/60"}` }>{t('사용자님의 프로필을 분석 중입니다...')}</p>
          </div>
        ) : !hasProfileData ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/30 mb-6">
              <User size={32} />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isLightMode ? "text-slate-900" : "text-white"}` }>{t('프로필 정보가 필요합니다')}</h2>
            <p className={`text-lg mb-8 max-w-md leading-relaxed ${isLightMode ? "text-slate-500" : "text-white/60"}` }>
              {t('나만의 맞춤 기업을 추천받기 위해 마이페이지에서')}<br/>
              <span className="text-indigo-500 font-semibold">{t('전공, MBTI, 홀랜드 적성검사')}</span> {t('중 하나 이상의 정보를 입력해주세요.')}</p>
            <button
              onClick={() => navigate('/mypage')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              {t('마이페이지로 이동하기')}
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {/* 대기업 리스트 */}
            <section>
              <div className="flex flex-col items-center justify-center mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 mb-4">
                  <Building2 size={24} />
                </div>
                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isLightMode ? "text-slate-900" : "text-white"}` }>{t('AI 맞춤 추천 대기업')}</h2>
                <p className={`text-sm ${isLightMode ? "text-slate-500" : "text-white/50"}` }>{t('사용자님의 다이어리 성장기록과 학과, MBTI, 적성검사 결과를 AI가 종합 분석하여 선별한 최적의 대기업입니다.')}</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {largeCompanies.map((company, index) => (
                  <div 
                    key={`large-${index}`}
                    onClick={() => setSelectedCompany(company)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left group cursor-pointer ${isLightMode ? "bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}` }
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold text-lg transition-colors ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}` }>
                            {t(cleanText(company.company))}
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-300 text-xs font-medium rounded-md border border-blue-500/30 shrink-0">
                            {t('대기업')}
                          </span>
                        </div>
                        {company.sector && (
                          <p className={`text-xs mt-1 truncate max-w-md sm:max-w-xl ${isLightMode ? "text-slate-500" : "text-white/60"}` }>
                            {t(cleanText(company.sector))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                      {company.url && company.url.startsWith('http') && (
                        <a
                          href={company.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('공식 홈페이지 방문')}
                          className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ExternalLink size={14} />
                          <span className="hidden sm:inline">{t('홈페이지')}</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"}` }
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 공기업 리스트 */}
            <section>
              <div className="flex flex-col items-center justify-center mb-8 text-center mt-16">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 mb-4">
                  <Building size={24} />
                </div>
                <h2 className={`text-2xl font-bold tracking-tight mb-2 ${isLightMode ? "text-slate-900" : "text-white"}` }>{t('AI 맞춤 추천 공기업·공공기관')}</h2>
                <p className={`text-sm ${isLightMode ? "text-slate-500" : "text-white/50"}` }>{t('사용자님의 다이어리 성장기록과 학과, 적성검사 결과를 AI가 종합 분석하여 선별한 최적의 공기업·공공기관입니다.')}</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {publicCompanies.map((company, index) => (
                  <div 
                    key={`public-${index}`}
                    onClick={() => setSelectedCompany(company)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left group cursor-pointer ${isLightMode ? "bg-white border-slate-200 hover:border-indigo-500 hover:shadow-md" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"}` }
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold text-lg transition-colors ${isLightMode ? "text-slate-900 group-hover:text-indigo-600" : "text-white group-hover:text-indigo-300"}` }>
                            {t(cleanText(company.company))}
                          </span>
                          <span className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-300 text-xs font-medium rounded-md border border-indigo-500/30 shrink-0">
                            {t('공기업')}
                          </span>
                        </div>
                        {company.sector && (
                          <p className={`text-xs mt-1 truncate max-w-md sm:max-w-xl ${isLightMode ? "text-slate-500" : "text-white/60"}` }>
                            {t(cleanText(company.sector))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                      {company.url && company.url.startsWith('http') && (
                        <a
                          href={company.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t('공식 홈페이지 방문')}
                          className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ExternalLink size={14} />
                          <span className="hidden sm:inline">{t('홈페이지')}</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${isLightMode ? "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700" : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"}` }
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Other Companies Modal */}
      {showOtherModal && (
        <OtherCompaniesModal onClose={() => setShowOtherModal(false)} />
      )}

      {/* Selected Company Modal */}
      {selectedCompany && (
        <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
      
      {/* Hide scrollbar globally for this layout */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
