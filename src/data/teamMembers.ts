import { Terminal, Layers, Cpu } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  school: string;
  grade: string;
  role: string;
  codeName: string;
  description: string;
  tags: string[];
  accent: string;
  accentText: string;
  accentTextLight: string;
  borderHover: string;
  glow: string;
  icon: typeof Terminal;
  bgAccent: string;
  badge: string;
  email?: string;
  github?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "dev-01",
    name: "김교범",
    school: "구미전자공업고등학교",
    grade: "2학년",
    role: "GitHub & Main Page Design",
    codeName: "DEV // 01",
    description: "프로젝트 깃허브(GitHub) 레포지토리 관리 및 협업 파이프라인 구축, Mystair 메인페이지 UI/UX 디자인 및 전체 프론트엔드 통합 설계를 담당했습니다.",
    tags: ["GitHub CI/CD", "Main Page Design", "UI/UX Architecture", "React", "Frontend"],
    accent: "from-cyan-500 to-blue-600",
    accentText: "text-cyan-400",
    accentTextLight: "text-cyan-600",
    borderHover: "hover:border-cyan-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(6,182,212,0.22)]",
    icon: Terminal,
    bgAccent: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    badge: "Core Developer"
  },
  {
    id: "backend-02",
    name: "박영진",
    school: "구미전자공업고등학교",
    grade: "2학년",
    role: "Backend & Data Collection",
    codeName: "BACKEND // 02",
    description: "서비스 백엔드 서버 및 API 통신 설계, 전국 마이스터고 및 기업 채용 데이터 수집·분석, 자격증·포트폴리오 데이터베이스 최적화를 담당했습니다.",
    tags: ["Backend Dev", "Data Pipeline", "Database Arch", "AI Matching", "Cloud API"],
    accent: "from-purple-500 to-indigo-600",
    accentText: "text-purple-400",
    accentTextLight: "text-purple-600",
    borderHover: "hover:border-purple-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(168,85,247,0.22)]",
    icon: Layers,
    bgAccent: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    badge: "System Architect"
  },
  {
    id: "plan-03",
    name: "노현우",
    school: "구미전자공업고등학교",
    grade: "2학년",
    role: "Planning & Promo Page Design",
    codeName: "PLAN // 03",
    description: "서비스 기획 및 스토리보드 설계, 브랜드 아이덴티티 확립, 공식 홍보페이지 UI/UX 디자인 및 3D 인터랙션 연동을 담당했습니다.",
    tags: ["Service Planning", "Promo Page Design", "UI/UX Interaction", "Storytelling", "Brand Identity"],
    accent: "from-emerald-400 to-teal-600",
    accentText: "text-emerald-400",
    accentTextLight: "text-emerald-600",
    borderHover: "hover:border-emerald-500/50",
    glow: "hover:shadow-[0_0_35px_rgba(16,185,129,0.22)]",
    icon: Cpu,
    bgAccent: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    badge: "Product Designer"
  }
];
