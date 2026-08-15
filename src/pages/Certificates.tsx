import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';
import certificatesJson from '../../Data/certificates.json';

export default function Certificates() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const [licensesData, setLicensesData] = useState<any[]>(certificatesJson || []);
  const [currentCategory, setCurrentCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalItem, setSelectedModalItem] = useState<any>(null);
  const [loadingError, setLoadingError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/certificates')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLicensesData(data);
          setLoadingError(false);
        }
      })
      .catch(err => {
        console.warn('Vercel/Static environment detected: fallback to imported certificates.json', err);
        if (!licensesData || licensesData.length === 0) {
          if (Array.isArray(certificatesJson) && certificatesJson.length > 0) {
            setLicensesData(certificatesJson);
            setLoadingError(false);
          } else {
            setLoadingError(true);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const MEISTER_CATEGORY_MAP: Record<string, string[]> = {
    '전기/전자/에너지': ['전기/전자/에너지'],
    '기계/메카/모빌리티': ['기계/메카트로닉스', '모빌리티/자동차/항공'],
    '화학/바이오/환경': ['화학/바이오/환경', '농림/환경'],
    'IT/소프트웨어/OA': ['IT/소프트웨어', '공통/OA/데이터'],
    '건설/중장비/안전': ['중장비/물류/안전', '건설/부동산', '건설/기계', '건설/건축'],
    '공통/어학/사무': ['공통/어학/한국사', '공통/경영/사무', '공통/어학/무역', '공통/어학', '금융/보험', '복지/보건', '조리/식품', '미용/패션']
  };

  const categories = [
    'ALL',
    '전기/전자/에너지',
    '기계/메카/모빌리티',
    '화학/바이오/환경',
    'IT/소프트웨어/OA',
    '건설/중장비/안전',
    '공통/어학/사무'
  ];

  const filteredLicenses = licensesData.filter(item => {
    const matchesCat = 
      currentCategory === 'ALL' || 
      (MEISTER_CATEGORY_MAP[currentCategory] 
        ? MEISTER_CATEGORY_MAP[currentCategory].includes(item.category) 
        : item.category === currentCategory);

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.advantage_companies && item.advantage_companies.some((c: string) => c.toLowerCase().includes(query)));

    return matchesCat && matchesSearch;
  });

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      <header className={`backdrop-blur-md h-[64px] sm:h-[72px] flex items-center px-4 sm:px-10 sticky top-0 z-50 border-b shadow-xs ${isLightMode ? "bg-white/60 border-slate-200/80" : "bg-[#0F172A]/80 border-white/5"}`}>
        <Link to="/" className={`${isLightMode ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-indigo-300'} font-black text-xl sm:text-[26px] tracking-[-0.5px] cursor-pointer transition-colors`}>
          MyStair
        </Link>
        <span className="bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-2 sm:ml-3 shrink-0">
          {t('자격증 NAVI')}
        </span>
        <span className={`text-[14px] font-medium border-l pl-4 ml-4 hidden md:block ${isLightMode ? 'text-slate-600 border-slate-300' : 'text-[#94A3B8] border-slate-800'}`}>
          {t('우리가 원하는 자격증을 한눈에!')}
        </span>
      </header>

      <Link to="/" className={`hidden sm:flex absolute top-[92px] left-10 w-20 h-[50px] rounded-xl justify-center items-center text-[24px] font-bold border shadow-md hover:-translate-y-0.5 transition-all duration-200 z-40 ${isLightMode ? 'bg-white/70 backdrop-blur-md border-slate-300/80 text-slate-700 hover:border-[#6366F1] hover:text-[#6366F1]' : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-[#6366F1] hover:text-[#6366F1]'}`}>
        ←
      </Link>

      <div className="max-w-[1200px] mx-auto px-5 pt-9 pb-15">
        <div className="text-center mb-8 mt-5">
          <h1 className={`text-[28px] font-extrabold mb-2.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{t('마이스터고 자격증 정밀 검색')}</h1>
          <p className={`text-[15px] mb-6 ${isLightMode ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{t('자격증명, 전공 분야, 가산점 적용 기업(삼성, 한전, 코레일 등)을 입력해보세요.')}</p>
          
          <div className="max-w-[640px] mx-auto mb-5 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-slate-500">🔍</span>
            <input 
              type="text" 
              className={`w-full h-14 pl-[52px] pr-5 text-[16px] font-semibold border rounded-2xl outline-none backdrop-blur-md shadow-md transition-all focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] ${isLightMode ? 'bg-white/80 border-slate-300/80 text-slate-900 placeholder-slate-400' : 'bg-slate-900/90 border-slate-700 text-white placeholder-slate-400'}`} 
              placeholder={t('자격증명, 우대기업, 카테고리 검색...')} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-center flex-wrap gap-2 mb-8 p-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-semibold border transition-all cursor-pointer shadow-sm min-h-[44px] flex items-center justify-center ${currentCategory === cat ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500' : isLightMode ? 'bg-white/70 backdrop-blur-md border-slate-300/80 text-slate-800 hover:bg-white hover:text-indigo-600 hover:border-indigo-300' : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                {cat === 'ALL' ? t('전체보기') : t(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className={`col-span-full text-center py-15 font-medium ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <br />
              {t('자격증 데이터를 불러오는 중입니다...')}
            </div>
          ) : loadingError ? (
            <div className={`col-span-full text-center py-15 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {t("⚠️ 'Data/certificates.json' 데이터를 불러올 수 없습니다.")}
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className={`col-span-full text-center py-15 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('🔍 검색 조건과 일치하는 자격증이 없습니다.')}
            </div>
          ) : (
            filteredLicenses.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedModalItem(item)}
                className={`backdrop-blur-md rounded-[20px] border p-6 flex flex-col justify-between transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(99,102,241,0.2)] hover:border-indigo-500 ${isLightMode ? 'bg-white/75 border-slate-200/90 shadow-sm' : 'bg-slate-900/60 border-white/10 text-white'}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">{t(item.category)}</span>
                    <span className="text-[12px] text-[#F59E0B] font-bold">{t(item.difficulty)}</span>
                  </div>
                  <div className={`text-[20px] font-extrabold mb-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{t(item.name)}</div>
                  <div className={`text-[14px] leading-relaxed mb-4 line-clamp-2 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>{t(item.description)}</div>
                  
                  <div className={`border rounded-xl p-3 grid grid-cols-2 gap-2 mb-4 ${isLightMode ? 'bg-slate-50/80 border-slate-200/60' : 'bg-slate-800/60 border-slate-700/60'}`}>
                    <div>
                      <div className={`text-[11px] mb-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('평균 합격률')}</div>
                      <div className={`text-[13px] font-bold truncate ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{t(item.pass_rate)}</div>
                    </div>
                    <div>
                      <div className={`text-[11px] mb-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('실기 응시료')}</div>
                      <div className={`text-[13px] font-bold truncate ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{t(item.practical_exam_fee)}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {(item.advantage_companies || []).slice(0, 3).map((c: string) => (
                      <span key={c} className={`border text-[11px] font-semibold px-2 py-1 rounded-md mr-1 mb-1 inline-block ${isLightMode ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{t(c)}</span>
                    ))}
                  </div>
                </div>
                <button className={`w-full border-none py-3 rounded-xl text-[14px] font-bold cursor-pointer transition-colors duration-200 ${isLightMode ? 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white' : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'}`}>
                  {t('자세히 보기 & 접수하기 ➔')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-[4px] flex justify-center items-center z-[1000] p-5" onClick={() => setSelectedModalItem(null)}>
          <div className="bg-white border border-slate-100 w-full max-w-[650px] max-h-[90vh] rounded-[24px] overflow-y-auto light-scrollbar p-8 relative text-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border-none w-9 h-9 rounded-full text-[18px] font-bold text-slate-500 cursor-pointer flex items-center justify-center transition-colors" onClick={() => setSelectedModalItem(null)}>✕</button>
            
            <span className="inline-block bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white px-3 py-1 rounded-xl text-[12px] font-bold mb-3">
              {t(selectedModalItem.qualification_type)}
            </span>
            <h2 className="text-[26px] font-extrabold text-slate-900 mb-4">{t(selectedModalItem.name)}</h2>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('📝 자격증 개요')}</div>
                <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.description)}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('📋 응시 자격 조건')}</div>
                <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.eligibility)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                  <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('⭐ 난이도')}</div>
                  <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.difficulty)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                  <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('📊 평균 합격률')}</div>
                  <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.pass_rate)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                  <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('💰 필기 응시료')}</div>
                  <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.written_exam_fee)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                  <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('🛠️ 실기 응시료')}</div>
                  <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{t(selectedModalItem.practical_exam_fee)}</div>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('🏢 우대 및 가산점 반영 기업')}</div>
                <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{(selectedModalItem.advantage_companies || []).map((c: string) => t(c)).join(', ')}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-[14px] border border-slate-100">
                <div className="text-[13px] font-bold text-indigo-600 mb-1.5">{t('🔗 연계 / 관련 자격증')}</div>
                <div className="text-[15px] text-slate-800 font-semibold leading-relaxed">{(selectedModalItem.related_certificates || []).map((c: string) => t(c)).join(', ')}</div>
              </div>
            </div>

            <a href={selectedModalItem.application_site} target="_blank" rel="noreferrer" className="block w-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-center py-4 rounded-[14px] text-[16px] font-bold no-underline mt-6 hover:opacity-90">
              {t('👉 공식 접수 사이트 바로가기')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

