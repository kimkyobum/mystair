import fs from 'fs';
import path from 'path';

function loadJson(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'Data', filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error loading ${filename}:`, e);
  }
  return [];
}

let parsedCompanies = loadJson('companies.json');
let parsedLinks = loadJson('link.json');

function findCompanyUrl(companyObj: any, links: any[]): string {
  const companyName = companyObj.company;
  if (!companyName) return '';
  const cleanName = companyName.replace(/\s*\(.*?\)/g, '').trim();

  let linkObj = links.find((l: any) => l.company === companyName || l.company === cleanName);
  if (!linkObj) {
    linkObj = links.find((l: any) => l.company && (l.company.includes(cleanName) || cleanName.includes(l.company)));
  }

  if (linkObj) {
    return linkObj.recruitment_page_url || linkObj.official_website || linkObj.job_korea_url || linkObj.saramin_url || '';
  }
  return '';
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (!parsedCompanies || parsedCompanies.length === 0) {
      parsedCompanies = loadJson('companies.json');
      parsedLinks = loadJson('link.json');
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { mbti, hollandCode, major } = body;

    const allCompanies = parsedCompanies || [];
    const mbtiUpper = (mbti || '').toUpperCase();
    const hollandUpper = (hollandCode || '').toUpperCase();

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

      score += Math.random();
      const url = findCompanyUrl(c, parsedLinks);

      return {
        ...c,
        score,
        reason,
        url
      };
    });

    const validCompanies = scoredCompanies.filter((c: any) => c && c.company);

    const allLargeCompanies = validCompanies
      .filter((c: any) => c.company_size && typeof c.company_size === 'string' && c.company_size.includes("대기업"))
      .sort((a: any, b: any) => b.score - a.score);

    const largeCompaniesTop10 = allLargeCompanies.slice(0, 10);
    const otherLargeCompanies = allLargeCompanies.slice(10);
      
    let publicCompanies = validCompanies
      .filter((c: any) => c.company_size && typeof c.company_size === 'string' && (c.company_size.includes("공공기관") || c.company_size.includes("공기업") || c.company_size.includes("공공") || c.company_size.includes("공사") || c.company_size.includes("공단")))
      .sort((a: any, b: any) => b.score - a.score);

    if (publicCompanies.length < 10) {
      const defaultPublicList = [
        { company: '한국전력공사 (한전)', sector: '전력자원 개발 및 발전, 송배전' },
        { company: '한국수력원자력 (한수원)', sector: '원자력 및 수력 발전' },
        { company: '한국철도공사 (코레일)', sector: '철도 여객/화물 수송 및 역세권 개발' },
        { company: '인천국제공항공사', sector: '인천국제공항 건설, 관리 및 운영' },
        { company: '한국도로공사', sector: '고속도로 건설, 유지관리 및 부대시설' },
        { company: '한국수자원공사 (K-water)', sector: '수자원의 종합적 개발 및 관리' },
        { company: '한국가스공사', sector: '천연가스 도입, 제조 및 공급' },
        { company: '한국토지주택공사 (LH)', sector: '주택 건설, 도시 개발 및 주거 복지' },
        { company: '한국지역난방공사', sector: '집단에너지 사업, 지역 냉·난방 공급' },
        { company: '한전KDN', sector: '전력 IT, 에너지 ICT 솔루션' },
        { company: '한국남동발전', sector: '화력, 신재생 발전 및 전력 생산' },
        { company: '한국환경공단', sector: '환경 오염 방지, 자원순환' }
      ];

      const existingNames = new Set(publicCompanies.map((c: any) => c.company));
      for (const defC of defaultPublicList) {
        if (!existingNames.has(defC.company)) {
          let score = Math.random() * 20 + 50;
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

          publicCompanies.push({
            ...defC,
            score,
            reason,
            url: findCompanyUrl(defC, parsedLinks)
          });
        }
      }
      publicCompanies.sort((a: any, b: any) => b.score - a.score);
    }

    const publicCompaniesTop10 = publicCompanies.slice(0, 10);
    const otherPublicCompanies = publicCompanies.slice(10);

    return res.status(200).json({ 
      largeCompanies: largeCompaniesTop10, 
      publicCompanies: publicCompaniesTop10,
      otherLargeCompanies,
      otherPublicCompanies
    });
  } catch (error: any) {
    console.error("Error recommending companies:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
