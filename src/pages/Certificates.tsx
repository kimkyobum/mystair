import { useState } from 'react';
import { Link } from 'react-router-dom';
import data from '../../Data/certificates.json';

export default function Certificates() {
  const [licensesData, setLicensesData] = useState<any[]>(data);
  const [currentCategory, setCurrentCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalItem, setSelectedModalItem] = useState<any>(null);
  const [loadingError, setLoadingError] = useState(false);

  const filteredLicenses = licensesData.filter(item => {
    const matchesCat = currentCategory === 'ALL' || item.category === currentCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.advantage_companies && item.advantage_companies.some((c: string) => c.toLowerCase().includes(query)));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans relative">
      <header className="bg-[#0F172A] h-[72px] flex items-center px-10 sticky top-0 z-50 shadow-[0_4px_20px_rgba(15,23,42,0.15)]">
        <Link to="/" className="text-white font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity">
          MyStair
        </Link>
        <span className="bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px] ml-3">
          자격증 NAVI
        </span>
        <span className="text-[#94A3B8] text-[14px] font-medium border-l border-[#334155] pl-4 ml-4 hidden sm:block">
          우리가 원하는 자격증을 한눈에!
        </span>
      </header>

      <Link to="/" className="hidden sm:flex absolute top-[92px] left-10 w-20 h-[50px] rounded-xl justify-center items-center text-[30px] font-bold bg-white border-[1.5px] border-[#E2E8F0] text-[#64748B] shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:border-[#6366F1] hover:text-[#6366F1] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.15)] transition-all duration-200 z-40">
        ←
      </Link>

      <div className="max-w-[1200px] mx-auto px-5 pt-9 pb-15">
        <div className="text-center mb-8 mt-5">
          <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-2.5">마이스터고 자격증 정밀 검색</h1>
          <p className="text-[15px] text-[#64748B] mb-6">자격증명, 전공 분야, 가산점 적용 기업(삼성, 한전, 코레일 등)을 입력해보세요.</p>
          
          <div className="max-w-[640px] mx-auto mb-5 relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[18px] text-[#64748B]">🔍</span>
            <input 
              type="text" 
              className="w-full h-14 pl-[52px] pr-5 text-[16px] font-semibold border-2 border-[#E2E8F0] rounded-2xl outline-none bg-white transition-all focus:border-[#6366F1] focus:shadow-[0_6px_20px_rgba(99,102,241,0.15)]" 
              placeholder="자격증명, 우대기업, 카테고리 검색..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {['ALL', '기계/메카트로닉스', '전기/전자/에너지', '화학/바이오/환경', 'IT/소프트웨어', '중장비/물류/안전', '공통/어학/한국사'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCurrentCategory(cat)}
                className={`px-[18px] py-2 rounded-full text-[14px] font-semibold border transition-all ${currentCategory === cat ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-gray-50'}`}
              >
                {cat === 'ALL' ? '전체보기' : 
                 cat === '기계/메카트로닉스' ? '기계/메카' : 
                 cat === '전기/전자/에너지' ? '전기/전자' : 
                 cat === '화학/바이오/환경' ? '화학/바이오' : 
                 cat === 'IT/소프트웨어' ? 'IT/SW' : 
                 cat === '중장비/물류/안전' ? '중장비/안전' : '어학/한국사'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loadingError ? (
            <div className="col-span-full text-center py-15 text-[#64748B]">
              ⚠️ 'Data/certificates.json' 데이터를 불러올 수 없습니다.
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="col-span-full text-center py-15 text-[#64748B]">
              🔍 검색 조건과 일치하는 자격증이 없습니다.
            </div>
          ) : (
            filteredLicenses.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedModalItem(item)}
                className="bg-white rounded-[20px] border border-[#E2E8F0] p-6 flex flex-col justify-between transition-all duration-250 cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:border-[#6366F1]"
              >
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#6366F1]">{item.category}</span>
                    <span className="text-[12px] text-[#F59E0B] font-bold">{item.difficulty}</span>
                  </div>
                  <div className="text-[20px] font-extrabold text-[#0F172A] mb-2">{item.name}</div>
                  <div className="text-[14px] text-[#64748B] leading-relaxed mb-4 line-clamp-2">{item.description}</div>
                  
                  <div className="bg-[#F8FAFC] rounded-xl p-3 grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <div className="text-[11px] text-[#64748B] mb-0.5">평균 합격률</div>
                      <div className="text-[13px] text-[#0F172A] font-bold truncate">{item.pass_rate}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#64748B] mb-0.5">실기 응시료</div>
                      <div className="text-[13px] text-[#0F172A] font-bold truncate">{item.practical_exam_fee}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {(item.advantage_companies || []).slice(0, 3).map((c: string) => (
                      <span key={c} className="bg-[#EEF2FF] text-[#4338CA] text-[11px] font-semibold px-2 py-1 rounded-md mr-1 mb-1 inline-block">{c}</span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-[#F1F5F9] text-[#0F172A] border-none py-3 rounded-xl text-[14px] font-bold cursor-pointer transition-colors hover:bg-[#0F172A] hover:text-white">
                  자세히 보기 & 접수하기 ➔
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedModalItem && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-[4px] flex justify-center items-center z-[1000] p-5" onClick={() => setSelectedModalItem(null)}>
          <div className="bg-white w-full max-w-[650px] max-h-[90vh] rounded-[24px] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 bg-[#F1F5F9] border-none w-9 h-9 rounded-full text-[18px] font-bold text-[#64748B] cursor-pointer" onClick={() => setSelectedModalItem(null)}>✕</button>
            
            <span className="inline-block bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white px-3 py-1 rounded-xl text-[12px] font-bold mb-3">
              {selectedModalItem.qualification_type}
            </span>
            <h2 className="text-[26px] font-extrabold text-[#0F172A] mb-4">{selectedModalItem.name}</h2>

            <div className="flex flex-col gap-4">
              <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">📝 자격증 개요</div>
                <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.description}</div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">📋 응시 자격 조건</div>
                <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.eligibility}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                  <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">⭐ 난이도</div>
                  <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.difficulty}</div>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                  <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">📊 평균 합격률</div>
                  <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.pass_rate}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                  <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">💰 필기 응시료</div>
                  <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.written_exam_fee}</div>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                  <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">🛠️ 실기 응시료</div>
                  <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{selectedModalItem.practical_exam_fee}</div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">🏢 우대 및 가산점 반영 기업</div>
                <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{(selectedModalItem.advantage_companies || []).join(', ')}</div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E2E8F0]">
                <div className="text-[13px] font-bold text-[#6366F1] mb-1.5">🔗 연계 / 관련 자격증</div>
                <div className="text-[15px] text-[#0F172A] font-semibold leading-relaxed">{(selectedModalItem.related_certificates || []).join(', ')}</div>
              </div>
            </div>

            <a href={selectedModalItem.application_site} target="_blank" rel="noreferrer" className="block w-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-center py-4 rounded-[14px] text-[16px] font-bold no-underline mt-6 hover:opacity-90">
              👉 공식 접수 사이트 바로가기
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
