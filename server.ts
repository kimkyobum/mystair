import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Pool } from "pg";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Load companies and link data globally
let companiesDataJson = "";
let linkDataJson = "";
let parsedCompanies: any[] = [];
let parsedLinks: any[] = [];

try {
  const companiesPath = path.join(process.cwd(), "Data", "companies.json");
  if (fs.existsSync(companiesPath)) {
    companiesDataJson = fs.readFileSync(companiesPath, "utf-8");
    let rawParsed = JSON.parse(companiesDataJson);
    parsedCompanies = cleanCitations(rawParsed);
  }
} catch (err) {
  console.error("Error reading companies.json", err);
}

function cleanCitations(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/\[cite[\s\S]*?\]/gi, '')
      .replace(/\[[^\]]*cite[^\]]*\]/gi, '')
      .trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanCitations);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = cleanCitations(obj[key]);
    }
    return newObj;
  }
  return obj;
}

try {
  const linkPath = path.join(process.cwd(), "Data", "link.json");
  if (fs.existsSync(linkPath)) {
    linkDataJson = fs.readFileSync(linkPath, "utf-8");
    parsedLinks = JSON.parse(linkDataJson);
  }
} catch (err) {
  console.error("Error reading link.json", err);
}

function findCompanyUrl(company: any, links: any[]): string | undefined {
  const sector = (company.sector || "").toLowerCase().replace(/\s+/g, "");
  const compName = (company.company || "").toLowerCase().replace(/\s+/g, "");

  for (const l of links) {
    const lComp = (l.company || "").toLowerCase().replace(/\s+/g, "");
    if (sector.includes(lComp) || lComp.includes(sector)) {
      if (l.url && l.url.startsWith("http")) return l.url;
    }
  }

  for (const l of links) {
    const lGroup = (l.group || "").toLowerCase().replace(/\s+/g, "");
    const lComp = (l.company || "").toLowerCase().replace(/\s+/g, "");
    if (compName.includes(lGroup) || lGroup.includes(compName)) {
      if ((sector.includes("전자") && lComp.includes("전자")) ||
          (sector.includes("건설") && lComp.includes("건설")) ||
          (sector.includes("화학") && lComp.includes("화학")) ||
          (sector.includes("중공업") && lComp.includes("중공업")) ||
          (sector.includes("바이오") && lComp.includes("바이오"))) {
        if (l.url && l.url.startsWith("http")) return l.url;
      }
    }
  }

  for (const l of links) {
    const lGroup = (l.group || "").toLowerCase().replace(/\s+/g, "");
    if (compName.includes(lGroup) || lGroup.includes(compName)) {
      if (l.url && l.url.startsWith("http")) return l.url;
    }
  }

  return undefined;
}

app.use(express.json({ limit: "10mb" }));

// Initialize PostgreSQL connection if DATABASE_URL is available
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com") 
    ? { rejectUnauthorized: false } 
    : undefined
});

if (process.env.DATABASE_URL) {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      uid VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      uid VARCHAR(255) PRIMARY KEY,
      profile_data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS user_diaries (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      date VARCHAR(20) NOT NULL,
      mood VARCHAR(50),
      tags JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).then(() => {
    console.log("PostgreSQL Database tables verified/created.");
  }).catch(err => {
    console.error("Error creating PostgreSQL tables:", err);
  });
}

// Robust Gemini content generation with key rotation & fallback
async function generateContentWithFallback(contents: any[], systemInstruction: string): Promise<any> {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
    process.env.VITE_GEMINI_API_KEY
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
    throw new Error("Gemini API 키가 설정되지 않았거나 올바르지 않습니다. AI Studio Settings > Secrets 또는 환경 변수를 설정해주세요.");
  }

  // Choose a random starting key to distribute traffic, then rotate through the rest as fallback on error (like 429)
  const startIndex = Math.floor(Math.random() * keys.length);
  let lastError: any = null;

  // We rotate through multiple valid Gemini models to avoid single-model free-tier limits (e.g. 20 req/day for 3.6-flash)
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
      const keyName = apiKey === process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" :
                      apiKey === process.env.GEMINI_API_KEY2 ? "GEMINI_API_KEY2" :
                      apiKey === process.env.GEMINI_API_KEY3 ? "GEMINI_API_KEY3" :
                      apiKey === process.env.GEMINI_API_KEY4 ? "GEMINI_API_KEY4" : "VITE_GEMINI_API_KEY";

      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        console.log(`Successfully generated content using ${keyName} with model ${modelName}`);
        return response;
      } catch (error: any) {
        console.warn(`[Gemini API Warning] ${keyName} failed with model ${modelName}. Error: ${error?.message || error}. Trying next...`);
        lastError = error;
      }
    }
  }

  throw lastError || new Error("모든 설정된 Gemini API 키와 모델이 응답 생성에 실패했습니다.");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MyStair AI Assistant Server" });
});

// In-Memory Database Storage for Profiles & Diaries (Syncable with external Render DB)
const usersDb: Record<string, any> = {};
const userProfilesDb: Record<string, any> = {};
const userDiariesDb: Record<string, any[]> = {};

// Helper to proxy requests to Render Backend if RENDER_BACKEND_URL is set
const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || process.env.RENDER_API_URL;

// Certificates API Endpoint
app.get("/api/certificates", (req, res) => {
  try {
    const certPath = path.join(process.cwd(), "Data", "certificates.json");
    if (fs.existsSync(certPath)) {
      const data = fs.readFileSync(certPath, "utf-8");
      res.json(JSON.parse(data));
    } else {
      res.status(404).json({ error: "certificates.json not found" });
    }
  } catch (error) {
    console.error("Error reading certificates.json", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Company Recommendation API Endpoint
app.post("/api/recommend-companies", (req, res) => {
  try {
    const { mbti, hollandCode, major } = req.body;
    
    if (!parsedCompanies || parsedCompanies.length === 0) {
      return res.status(500).json({ error: "Companies data not loaded." });
    }
    
    const allCompanies = parsedCompanies;
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
    userKeywords = [...new Set(userKeywords)]; // Deduplicate

    const scoredCompanies = allCompanies.map((c: any) => {
      let score = 0;
      let matchReasons: string[] = [];
      let isMajorMatch = false;

      // Major matching
      if (major && c.preferred_majors && Array.isArray(c.preferred_majors)) {
        if (c.preferred_majors.some((m: string) => major.includes(m) || m.includes(major) || major === m)) {
          score += 50; // High priority for major
          isMajorMatch = true;
        }
      }

      // Keyword matching
      const companyText = `${(c.core_talent_keywords || []).join(' ')} ${c.organizational_culture || ''} ${c.employee_review_summary || ''}`;
      let matchedTraits = [];
      for (const keyword of userKeywords) {
        if (companyText.includes(keyword)) {
          score += 5;
          matchedTraits.push(keyword);
        }
      }

      // Format matched traits for display
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

      // Random jitter for tie-breaking
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

      const existingNames = new Set(publicCompanies.map((c: any) => c.company));
      for (const defC of defaultPublicList) {
        if (!existingNames.has(defC.company)) {
          let score = Math.random() * 20 + 50;
          let isMajorMatch = false;
          if (major && defC.preferred_majors && Array.isArray(defC.preferred_majors)) {
            if (defC.preferred_majors.some((m: string) => major.includes(m) || m.includes(major) || major === m)) {
              score += 30;
              isMajorMatch = true;
            }
          }
          let reason = isMajorMatch
            ? `사용자님의 전공(${major})을 우대하는 맞춤형 대표 공공기관/공기업입니다.`
            : defC.reason || `사용자님의 적성과 직무 역량에 부합하는 대표 공공기관/공기업입니다.`;

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

    res.json({ 
      largeCompanies: largeCompaniesTop10, 
      publicCompanies: publicCompaniesTop10,
      otherLargeCompanies,
      otherPublicCompanies
    });
  } catch (error) {
    console.error("Error recommending companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Local Authentication Endpoints
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const uid = "user_" + Math.random().toString(36).substring(2, 11);

  if (process.env.DATABASE_URL) {
    try {
      const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ message: "이미 가입된 이메일입니다." });
      }
      await pool.query('INSERT INTO users (email, password, uid, display_name) VALUES ($1, $2, $3, $4)', [
        normalizedEmail,
        password,
        uid,
        normalizedEmail.split('@')[0]
      ]);
      return res.json({ status: "success", uid, email: normalizedEmail });
    } catch (e) {
      console.error("PG signup error, falling back to memory:", e);
    }
  }

  if (usersDb[normalizedEmail]) {
    return res.status(400).json({ message: "이미 가입된 이메일입니다." });
  }
  usersDb[normalizedEmail] = { email: normalizedEmail, password, uid, displayName: normalizedEmail.split('@')[0] };
  return res.json({ status: "success", uid, email: normalizedEmail });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [normalizedEmail, password]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        return res.json({ status: "success", uid: user.uid, email: user.email, displayName: user.display_name });
      }
    } catch (e) {
      console.error("PG login error, falling back to memory:", e);
    }
  }

  const user = usersDb[normalizedEmail];
  if (user && user.password === password) {
    return res.json({ status: "success", uid: user.uid, email: user.email, displayName: user.displayName });
  }
  return res.status(400).json({ message: "이메일 또는 비밀번호가 틀렸습니다." });
});

// 1. User Profile API Endpoints
app.get("/api/profile", async (req, res) => {
  const userId = (req.query.userId as string) || "default_user";

  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query('SELECT profile_data FROM user_profiles WHERE uid = $1', [userId]);
      if (result.rows.length > 0) {
        return res.json({ status: "success", userId, profile: result.rows[0].profile_data });
      } else {
        return res.json({ status: "success", userId, profile: null });
      }
    } catch (e) {
      console.warn("PostgreSQL profile fetch error, using fallback DB:", e);
    }
  }

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/profile?userId=${encodeURIComponent(userId)}`);
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for profile, using fallback DB:", e);
    }
  }

  const profile = userProfilesDb[userId] || null;
  return res.json({ status: "success", userId, profile });
});

app.post("/api/profile", async (req, res) => {
  const { userId, profile } = req.body;
  const targetUid = userId || profile?.uid || "default_user";

  if (process.env.DATABASE_URL) {
    try {
      const profileData = { ...profile, uid: targetUid };
      await pool.query(
        `INSERT INTO user_profiles (uid, profile_data, updated_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (uid) DO UPDATE 
         SET profile_data = EXCLUDED.profile_data, updated_at = CURRENT_TIMESTAMP`,
        [targetUid, JSON.stringify(profileData)]
      );
      return res.json({ status: "success", userId: targetUid, profile: profileData });
    } catch (e) {
      console.warn("PostgreSQL profile save error, using fallback DB:", e);
    }
  }

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUid, profile })
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for saving profile, using fallback DB:", e);
    }
  }

  userProfilesDb[targetUid] = {
    ...profile,
    uid: targetUid,
    updatedAt: new Date().toISOString()
  };

  return res.json({ status: "success", userId: targetUid, profile: userProfilesDb[targetUid] });
});

// 2. User Growth Diary API Endpoints
app.get("/api/diaries", async (req, res) => {
  const userId = (req.query.userId as string) || "default_user";

  if (process.env.DATABASE_URL) {
    try {
      const result = await pool.query('SELECT * FROM user_diaries WHERE user_id = $1 ORDER BY date DESC, created_at DESC', [userId]);
      const diaries = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        content: row.content,
        date: row.date,
        mood: row.mood,
        tags: row.tags,
        createdAt: row.created_at
      }));
      return res.json({ status: "success", userId, diaries });
    } catch (e) {
      console.warn("PostgreSQL diaries fetch error, using fallback DB:", e);
    }
  }

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries?userId=${encodeURIComponent(userId)}`);
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for fetching diaries, using fallback DB:", e);
    }
  }

  const diaries = userDiariesDb[userId] || [];
  return res.json({ status: "success", userId, diaries });
});

app.post("/api/diaries", async (req, res) => {
  const { userId, diary } = req.body;
  const targetUid = userId || diary?.userId || "default_user";

  if (process.env.DATABASE_URL) {
    try {
      await pool.query(
        `INSERT INTO user_diaries (id, user_id, title, content, date, mood, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, content = EXCLUDED.content, date = EXCLUDED.date, mood = EXCLUDED.mood, tags = EXCLUDED.tags`,
        [diary.id, targetUid, diary.title, diary.content, diary.date, diary.mood, JSON.stringify(diary.tags || [])]
      );
      return res.json({ status: "success", userId: targetUid, diary });
    } catch (e) {
      console.warn("PostgreSQL diary save error, using fallback DB:", e);
    }
  }

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUid, diary })
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for adding diary, using fallback DB:", e);
    }
  }

  if (!userDiariesDb[targetUid]) {
    userDiariesDb[targetUid] = [];
  }

  const existingIndex = userDiariesDb[targetUid].findIndex(d => d.id === diary.id);
  if (existingIndex >= 0) {
    userDiariesDb[targetUid][existingIndex] = diary;
  } else {
    userDiariesDb[targetUid].unshift(diary);
  }

  return res.json({ status: "success", userId: targetUid, diary });
});

app.delete("/api/diaries/:id", async (req, res) => {
  const diaryId = req.params.id;
  const userId = (req.query.userId as string) || "default_user";

  if (process.env.DATABASE_URL) {
    try {
      await pool.query('DELETE FROM user_diaries WHERE id = $1 AND user_id = $2', [diaryId, userId]);
      return res.json({ status: "success", message: "Diary deleted successfully" });
    } catch (e) {
      console.warn("PostgreSQL diary delete error, using fallback DB:", e);
    }
  }

  if (RENDER_BACKEND_URL) {
    try {
      const renderRes = await fetch(`${RENDER_BACKEND_URL}/api/diaries/${encodeURIComponent(diaryId)}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE"
      });
      if (renderRes.ok) {
        const data = await renderRes.json();
        return res.json(data);
      }
    } catch (e) {
      console.warn("Render backend proxy error for deleting diary:", e);
    }
  }

  if (userDiariesDb[userId]) {
    userDiariesDb[userId] = userDiariesDb[userId].filter(d => d.id !== diaryId);
  }

  return res.json({ status: "success", message: "Diary deleted successfully" });
});

// Main AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory, userProfile, diaries, language } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: language === "en" ? "There is no question content." : "질문 내용이 없습니다." });
    }

    // Format student's user profile
    const profileText = userProfile
      ? `
[사용자 프로필 데이터]
- 이름: ${userProfile.name || "미입력"}
- 학교 및 전공: ${userProfile.highSchool || "미입력"} / ${userProfile.major || "미입력"}
- MBTI 성격유형: ${userProfile.mbti || "미진단 (MBTI 미입력)"}
- 홀랜드 진로적성: ${userProfile.hollandCode || "미진단 (홀랜드 코드 미입력)"}
- 희망/관심 기업: ${
          Array.isArray(userProfile.targetCompanies) && userProfile.targetCompanies.length > 0
            ? userProfile.targetCompanies.join(", ")
            : "미선택 (희망 기업 미지정)"
        }
`
      : "[사용자 프로필 미입력 - 마이페이지 미작성 상태]";

    // Format student's growth diary entries
    const diariesText =
      Array.isArray(diaries) && diaries.length > 0
        ? `
[사용자가 작성한 성장 다이어리 데이터 (${diaries.length}건)]
${diaries.map((d: any, idx: number) => `일기 ${idx + 1}. 날짜: ${d.date}, 기분: ${d.mood}, 제목: ${d.title}\n내용: ${d.content}\n태그: ${d.tags ? d.tags.join(', ') : ''}`).join('\n\n')}
`
        : "[성장 다이어리 기록 없음]";

    // System instruction embedding portal domain knowledge & smart conversational handling
    const systemInstruction = `
너는 마이스터고 및 특성화고 학생들을 위한 '나만의 기업찾기' 및 AI 진로·취업 수석 컨설턴트 'MyStair AI'야.
사용자의 학과, MBTI, 홀랜드 적성검사 코드, 그리고 작성해온 성장 다이어리(기록)를 분석하여 학생 개개인에게 가장 잘 어울리고 적합한 맞춤형 추천 기업(대기업, 공공기관, 유망 중견/강소기업 등)을 찾아주고 분석해주는 역할을 담당해.

[중요: 사용자의 프로필 미입력/미진단 상태 처리 지침]
- 사용자의 MBTI, 홀랜드 적성검사, 전공, 학교 등이 '미진단' 또는 '미입력'으로 되어 있다면, 이전 데이터나 기본값을 임의로 지어내며 MBTI(예: ISTJ 등)나 적성 코드가 원래 적혀있었다고 아는 척하지 마라.
- 만약 사용자가 "나 MBTI/홀랜드 안 적어놨는데 뭐야?", "마이페이지 안 적었는데 알고 있네?" 하고 묻는다면:
  "아 미안해! 사용자님의 마이페이지 프로필이 아직 작성되지 않은 미진단/미입력 상태네요! 😅 마이페이지에서 MBTI와 진로 적성검사, 전공을 입력해 주시면 딱 맞는 기업과 자격증을 추천해 드릴게요!" 하고 아는 척했던 오류를 정정하고 솔직하며 친절하게 대답해줘.

[오늘의 성장 다이어리 자동 작성 및 저장 기능]
- 사용자가 "오늘의 다이어리 써줘", "오늘 일기 적어줘", "다이어리에 ~내용 적어줘"라고 요청하거나 하루 동안의 경험/학습을 다이어리에 작성해 달라고 한 경우:
  1) 사용자가 오늘 있었던 일의 내용을 구체적으로 알려주지 않고 단지 "오늘의 다이어리 써줘" 하고 내용 없이 질문한 경우:
     - **절대 다이어리를 가상으로 지어내어 작성하지 마라! [[DIARY_SAVE:...]] 마커도 절대 생성하지 마라!**
     - 반드시 친근하게 무슨 일이 있었는지 어떤 내용을 적을지 먼저 물어봐라:
       "오늘 어떤 일이나 배운 내용이 있으셨나요? 🌿\n\n'오늘 전기기능사 실습했어', '다독상 땄어' 처럼 있었던 일을 간단히 말씀해주시면, 깔끔한 성장 다이어리로 다듬어서 오늘 자 일기에 자동으로 작성해 드릴게요! 😊"
  2) 사용자가 오늘 있었던 내용/경험/활동을 입력해주었거나 이전 대화/경험을 다이어리에 적어달라고 한 경우:
     - **제목 작성 규칙 (매우 중요)**: 제목을 장황한 문장으로 적지 말고 핵심 명사/키워드 포인트만 1~3단어로 매우 간결하게 적어줘! (예: "다독상 땄어" -> "다독상", "전기기능사 실습했어" -> "전기기능사 실습", "독후감 제출 완료" -> "독후감 제출")
     - **본문 작성 규칙 (매우 중요)**: 전달받은 내용을 너무 길고 과하게 부풀리지 마라! 부담스럽지 않게 사용자의 경험을 자연스럽고 깔끔하게 **살짝만 가다듬은 2~3문장 이내**의 편안한 어조로 작성해줘.
     - 그리고 **답변 제일 마지막 줄에 반드시 아래 형태의 JSON 마커**를 정확히 포함시켜줘 (시스템이 사용자의 오늘 다이어리 저장소에 자동으로 등록함):
     [[DIARY_SAVE: {"title": "핵심포인트제목", "content": "부담없이 2~3문장으로 깔끔히 작성된 다이어리 본문", "tags": ["태그1", "태그2"], "mood": "보람참"}]]

[회사 및 공식 링크 데이터]
아래 회사 데이터(companies.json)와 공식 링크 데이터(link.json)를 바탕으로 사용자에게 기업을 추천해주고 공식 홈페이지 링크 안내 및 관련 질문에 답해줘:

[회사 데이터]:
${companiesDataJson}

[공식 링크 데이터]:
${linkDataJson}

[중요 응답 규칙 - 질문 유형별 답변 분량 및 스타일]
1. 💬 **일상 대화 / 인사 / 단순 질문 / 가벼운 소통** ("안녕?", "반가워", "너 누구야?", "고마워", "오늘 어때?" 등):
   - **반드시 2줄 이내로 매우 짧고 간결하게 대답해!**
   - 길게 설명하지 말고, 친근하게 인사하며 도움이 필요한 점이 있는지 물어봐.

2. 🌿 **단일 주제 질문 및 가벼운 진로 질문** (예: "전기기능사 시험 난이도 어때?", "자소서 작성 팁 알려줘"):
   - **2~3줄 이내로 핵심만 짧고 명쾌하게 가이드를 제공해.**

3. 🎯 **진로와 관련된 진지하고 많은 내용이 필요한 종합 컨설팅 질문** (예: "내 프로필과 다이어리 기반 종합 진로 리포트 써줘", "나한테 맞는 기업, 자격증, 액션플랜 전체 분석해줘"):
   - **5줄에서 10줄 정도로 상세하게 답변해줘.**
   - 가독성을 위해 마크다운과 이모지를 적절히 사용하되, 너무 길어지지 않게 10줄을 넘기지 않도록 요약해서 답변해줘. 특히 사용자에게 적합한 '나만의 추천 기업 리스트'와 추천 이유를 명확하게 짚어줘.

4. 🏢 **기업 추천 질문** (예: "내 전공과 성향에 맞는 기업 추천해줘" 또는 "나만의 기업찾기를 누르면..."):
   - 사용자의 MBTI, 홀랜드 진로적성검사, 전공 등을 깊이 있게 분석하여 회사 데이터를 바탕으로 **대기업 10곳**과 **공기업 10곳**을 반드시 차례대로 나누어 추천해줘.
   - 각 추천 기업에 대해 간략한 추천 이유와 공식 홈페이지 링크(가능한 경우)를 함께 안내해줘.

위 규칙을 엄격하게 지켜서 답변 길이를 조절해줘.
`;

    // Prepare chat history if present
    let contents: any[] = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      contents = chatHistory.map((item: any) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.content || item.parts?.[0]?.text || "" }],
      }));
      contents.push({
        role: "user",
        parts: [
          {
            text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${message}`,
          },
        ],
      });
    } else {
      contents = [
        {
          role: "user",
          parts: [
            {
              text: `${profileText}\n\n${diariesText}\n\n[사용자의 현재 질문]\n${message}`,
            },
          ],
        },
      ];
    }

    let finalSystemInstruction = systemInstruction;
    if (language === "en") {
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

    const response = await generateContentWithFallback(contents, finalSystemInstruction);

    const replyText = response.text || (language === "en" ? "Failed to generate a response. Please try again." : "답변을 생성하지 못했습니다. 다시 시도해주세요.");
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    const errStr = String(error?.message || error);
    const isEn = req.body?.language === "en";
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      return res.json({
        response: isEn
          ? "⏳ **The API usage has temporarily reached its limit due to high traffic.**\n\nGoogle Gemini free tier's requests per minute limit has been exceeded. **Please try again in about 30 seconds to 1 minute**, and we will be happy to answer you! 😊"
          : "⏳ **API 사용량이 한꺼번에 몰려 잠시 재충전 중입니다.**\n\nGoogle Gemini 무료 플랜의 분당 답변 수가 초과되었습니다. **약 30초~1분 후에** 다시 질문해 주시면 친절하게 답변해 드릴게요! 😊"
      });
    }
    return res.status(500).json({
      error: isEn ? "An error occurred during AI conversation." : "AI 대화 도중 오류가 발생했습니다.",
      details: error?.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MyStair Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
