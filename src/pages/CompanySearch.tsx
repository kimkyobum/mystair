import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, User, Brain, Briefcase, Award, GraduationCap, ChevronRight, Sparkles, Building, CheckCircle2, X, Banknote, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../friend_site/LanguageContext';

export default function CompanySearch() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [largeCompanies, setLargeCompanies] = useState<any[]>([]);
  const [publicCompanies, setPublicCompanies] = useState<any[]>([]);
  const [otherLargeCompanies, setOtherLargeCompanies] = useState<any[]>([]);
  const [otherPublicCompanies, setOtherPublicCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showOtherModal, setShowOtherModal] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
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
        setLargeCompanies(data.largeCompanies || []);
        setPublicCompanies(data.publicCompanies || []);
        setOtherLargeCompanies(data.otherLargeCompanies || []);
        setOtherPublicCompanies(data.otherPublicCompanies || []);
      } catch (error) {
        console.error('Error:', error);
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
          className="absolute inset-0 bg-[#0F172A]/85 backdrop-blur-md"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col z-10">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between mb-6 pb-6 border-b border-white/10 gap-6 pr-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 text-[13px] font-semibold rounded-lg border ${
                  getCompanyTypeBadge(company) === '공기업' 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35'
                }`}>
                  {t(getCompanyTypeBadge(company))}
                </span>
                <span className="text-white/50 text-[13px] font-medium tracking-wide">{cleanText(company.sector)}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{cleanText(company.company)}</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Building2 size={28} />
            </div>
          </div>

          {/* Interactive Category Buttons / Tabs (Wrapped to prevent cutoff) */}
          <div className="flex flex-wrap gap-2.5 pb-6 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'business' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <Briefcase size={16} className="text-blue-400" /> 주요 사업/제품
            </button>
            <button
              onClick={() => setActiveTab('culture')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'culture' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <User size={16} className="text-emerald-400" /> 조직 문화
            </button>
            <button
              onClick={() => setActiveTab('talent')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'talent' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <Sparkles size={16} className="text-amber-400" /> 핵심 역량 및 가치
            </button>
            <button
              onClick={() => setActiveTab('majors_certs')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'majors_certs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <GraduationCap size={16} className="text-purple-400" /> 우대 전공 & 자격증
            </button>
            <button
              onClick={() => setActiveTab('salary_welfare')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'salary_welfare' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <Banknote size={16} className="text-green-400" /> 연봉 & 복리후생
            </button>
            <button
              onClick={() => setActiveTab('work_recruitment')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'work_recruitment' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <Building size={16} className="text-pink-400" /> 근무 & 채용절차
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'career' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <ChevronRight size={16} className="text-cyan-400" /> 커리어 패스
            </button>
            <button
              onClick={() => setActiveTab('reason')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'reason' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <Brain size={16} className="text-indigo-300" /> AI 추천 사유
            </button>
          </div>
          
          {/* Active Tab Content */}
          <div className="flex-1 bg-white/5 rounded-2xl p-6 md:p-8 border border-white/5 min-h-[240px] max-h-[420px] overflow-y-auto flex flex-col justify-between">
            <div>
              {activeTab === null && (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">원하시는 정보 카테고리를 선택해주세요</h3>
                  <p className="text-white/60 text-sm max-w-md">
                    상단의 버튼(주요 사업, 조직 문화, 연봉 및 복지, 우대 자격증 등)을 누르면 해당 상세 내용이 표시됩니다.
                  </p>
                </div>
              )}

              {activeTab === 'business' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-400" /> 주요 사업 및 제품
                  </h3>
                  <p className="text-white/80 leading-relaxed text-base">
                    {company.main_business_products || '등록된 주요 사업 정보가 없습니다.'}
                  </p>
                </div>
              )}

              {activeTab === 'culture' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={20} className="text-emerald-400" /> 조직 문화 및 근무 분위기
                  </h3>
                  <p className="text-white/80 leading-relaxed text-base mb-4">
                    {company.organizational_culture || '등록된 조직 문화 정보가 없습니다.'}
                  </p>
                  {company.employee_review_summary && (
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="text-xs font-semibold text-emerald-400 block mb-1">💡 현직자 리뷰 / 특징 요약</span>
                      <p className="text-white/70 text-sm leading-relaxed">{company.employee_review_summary}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'talent' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-400" /> 핵심 역량 및 가치 (인재상)
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {company.core_talent_keywords?.map((kw: string, i: number) => (
                       <span key={i} className="px-4 py-2 bg-white/10 text-white/90 text-sm font-medium rounded-xl border border-white/10 flex items-center gap-2.5">
                         <CheckCircle2 size={16} className="text-amber-400" /> {kw}
                       </span>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'majors_certs' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                      <GraduationCap size={18} className="text-purple-400" /> 우대 전공
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {company.preferred_majors?.map((mj: string, i: number) => (
                         <span key={i} className="px-3.5 py-1.5 bg-purple-500/15 text-purple-200 text-sm font-medium rounded-xl border border-purple-500/30">
                           {mj}
                         </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                      <Award size={18} className="text-pink-400" /> 필요 역량 및 자격증 (하나씩 확인)
                    </h3>
                    <div className="flex flex-col gap-2">
                      {company.required_competencies_certifications?.map((cert: string, i: number) => (
                         <div key={i} className="px-4 py-2.5 bg-pink-500/10 text-pink-200 text-sm font-medium rounded-xl border border-pink-500/20 flex items-center gap-3">
                           <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                           <span>{cert}</span>
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
                      <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                        <Banknote size={18} className="text-green-400" /> 마이스터고 출신 평균 연봉 기준
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-white/50 text-xs font-medium block mb-1">기본급 기준</span>
                          <span className="text-white font-semibold text-sm">{company.meister_average_salary.starting_salary_base}</span>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <span className="text-green-400/85 text-xs font-medium block mb-1">성과급 및 수당 포함</span>
                          <span className="text-green-300 font-bold text-sm">{company.meister_average_salary.annual_salary_with_incentives}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {company.welfare_benefits && (
                    <div>
                      <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-400" /> 복리후생 및 복지 제도
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {company.welfare_benefits.map((wb: string, i: number) => (
                          <div key={i} className="px-3.5 py-2 bg-white/10 text-white/90 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                            <span>{wb}</span>
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
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <span className="text-white/50 text-xs font-medium block mb-1">근무 지역</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {company.work_locations.map((loc: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white/10 text-white text-xs rounded-md">{loc}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {company.expected_work_hours && (
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <span className="text-white/50 text-xs font-medium block mb-1">근무 형태</span>
                        <span className="text-white text-sm font-medium">{company.expected_work_hours}</span>
                      </div>
                    )}
                  </div>

                  {company.recruitment_process && (
                    <div>
                      <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                        <Building size={18} className="text-pink-400" /> 채용 절차
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {company.recruitment_process.map((step: string, i: number) => (
                          <React.Fragment key={i}>
                            <span className="px-3 py-1.5 bg-pink-500/10 text-pink-200 text-xs font-semibold rounded-xl border border-pink-500/20">
                              {step}
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
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ChevronRight size={20} className="text-cyan-400" /> 마이스터고 졸업생 커리어 패스
                  </h3>
                  <p className="text-white/80 leading-relaxed text-base bg-black/20 p-5 rounded-2xl border border-white/5">
                    {company.meister_career_path || '등록된 커리어 패스 정보가 없습니다.'}
                  </p>
                </div>
              )}

              {activeTab === 'reason' && (
                <div>
                  <h3 className="text-lg font-bold text-indigo-300 mb-4 flex items-center gap-2">
                    <Brain size={20} /> MyStair AI 맞춤 추천 사유
                  </h3>
                  <p className="text-indigo-100/90 leading-relaxed text-base bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20">
                    {company.reason || '등록된 추천 사유가 없습니다.'}
                  </p>
                </div>
              )}
            </div>

            {/* Official Website Link at bottom */}
            {company.url && company.url.startsWith('http') && (
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/50 text-xs">공식 채용 및 기업 홈페이지에서 상세 채용 공고를 확인하세요.</span>
                <a 
                  href={company.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <span>🔗 공식 홈페이지 방문하기</span>
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
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30">
                나머지 기업 목록
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">TOP 10 이외의 전체 기업 ({totalCount}개)</h2>
            <p className="text-white/50 text-xs sm:text-sm mt-1">상위 TOP 10 이외의 모든 추천 대기업 및 공기업 리스트입니다. 클릭 시 상세 정보를 볼 수 있습니다.</p>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="기업명 또는 업종 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-white/30"
              />
            </div>
            <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                전체 ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('LARGE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'LARGE' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                대기업 ({otherLargeCompanies.length})
              </button>
              <button
                onClick={() => setActiveTab('PUBLIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'PUBLIC' ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white'}`}
              >
                공기업 ({otherPublicCompanies.length})
              </button>
            </div>
          </div>

          {/* Companies List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-sm">
                {t('검색 조건에 일치하는 기업이 없습니다.')}
              </div>
            ) : (
              filtered.map((company, idx) => (
                <button
                  key={`other-${idx}-${company.company}`}
                  onClick={() => setSelectedCompany(company)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                      getCompanyTypeBadge(company) === '공기업' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white'
                    }`}>
                      {idx + 11}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors">
                          {cleanText(company.company)}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded border shrink-0 ${
                          getCompanyTypeBadge(company) === '공기업'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}>
                          {t(getCompanyTypeBadge(company))}
                        </span>
                      </div>
                      {company.sector && (
                        <p className="text-white/50 text-xs mt-0.5 truncate max-w-lg">
                          {cleanText(company.sector)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 ml-2" />
                </button>
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
      <div className="bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 shrink-0">
        <div className="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">나만의 기업찾기</h1>
              <p className="text-[13px] text-white/60 font-medium mt-0.5">내 성향과 전공에 딱 맞는 기업 TOP 10</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowOtherModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-2 border border-indigo-400/30 shrink-0"
            >
              <Building2 size={16} />
              <span>나머지 기업 보기</span>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[11px] rounded-full font-bold">
                {otherLargeCompanies.length + otherPublicCompanies.length}
              </span>
            </button>

            {!hasProfileData && (
              <button 
                onClick={() => navigate('/mypage')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 border border-white/5 hover:border-white/10"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">프로필 완성</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className="text-white/60 font-medium text-lg">사용자님의 프로필을 분석 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {/* 대기업 리스트 */}
            <section>
              <div className="flex flex-col items-center justify-center mb-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 mb-4">
                  <Building2 size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">추천 대기업 TOP 10</h2>
                <p className="text-white/50 text-sm">내 성향과 전공에 맞춘 가장 적합한 대기업 리스트입니다.</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {largeCompanies.map((company, index) => (
                  <button 
                    key={`large-${index}`}
                    onClick={() => setSelectedCompany(company)}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">
                            {cleanText(company.company)}
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-500/15 text-blue-300 text-xs font-medium rounded-md border border-blue-500/30 shrink-0">
                            {t('대기업')}
                          </span>
                        </div>
                        {company.sector && (
                          <p className="text-white/60 text-xs mt-1 truncate max-w-md sm:max-w-xl">
                            {cleanText(company.sector)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            </section>

            {/* 공기업 리스트 */}
            <section>
              <div className="flex flex-col items-center justify-center mb-8 text-center mt-16">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 mb-4">
                  <Building size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">{t('추천 공기업 TOP 10')}</h2>
                <p className="text-white/50 text-sm">{t('내 성향과 전공에 맞춘 가장 적합한 공기업/공공기관 리스트입니다.')}</p>
              </div>
              
              <div className="flex flex-col gap-4">
                {publicCompanies.map((company, index) => (
                  <button 
                    key={`public-${index}`}
                    onClick={() => setSelectedCompany(company)}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors">
                            {cleanText(company.company)}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 text-xs font-medium rounded-md border border-emerald-500/30 shrink-0">
                            {t('공기업')}
                          </span>
                        </div>
                        {company.sector && (
                          <p className="text-white/60 text-xs mt-1 truncate max-w-md sm:max-w-xl">
                            {cleanText(company.sector)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 ml-4" />
                  </button>
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
