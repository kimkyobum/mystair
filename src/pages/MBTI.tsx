import { useState } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { User, Copy, RotateCcw, Home } from 'lucide-react';
import { mbtiQuestions, mbtiMeta } from '../data/mbtiData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function MBTI() {
  const { user, updateProfileInFirestore } = useAuth();
  const { t } = useLanguage();
  const { isLightMode } = useTheme();
  const [screen, setScreen] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(mbtiQuestions.length).fill(null));
  const [result, setResult] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const startQuiz = () => {
    setScreen('quiz');
    setCurrentIndex(0);
    setAnswers(new Array(mbtiQuestions.length).fill(null));
  };

  const showQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const selectOption = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);

    if (currentIndex < mbtiQuestions.length - 1) {
      setTimeout(() => {
        showQuestion(currentIndex + 1);
      }, 120);
    } else {
      showResults(newAnswers);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      showQuestion(currentIndex - 1);
    }
  };

  const calculateScores = (currentAnswers: (number | null)[]) => {
    let scores = { EI: 0, SN: 0, TF: 0, JP: 0, AT: 0 };
    
    currentAnswers.forEach((ans, idx) => {
      if (ans !== null && mbtiQuestions[idx]) {
        const q = mbtiQuestions[idx];
        const val = q.reverse ? (6 - ans) : ans;
        const type = q.type as keyof typeof scores;
        scores[type] += val;
      }
    });

    const eiRatio = Math.max(0, Math.min(100, Math.round(((scores.EI - 12) / 48) * 100)));
    const snRatio = Math.max(0, Math.min(100, Math.round(((scores.SN - 12) / 48) * 100)));
    const tfRatio = Math.max(0, Math.min(100, Math.round(((scores.TF - 12) / 48) * 100)));
    const jpRatio = Math.max(0, Math.min(100, Math.round(((scores.JP - 12) / 48) * 100)));
    const atRatio = Math.max(0, Math.min(100, Math.round(((scores.AT - 12) / 48) * 100)));

    const typeE = eiRatio >= 50 ? 'E' : 'I';
    const typeN = snRatio >= 50 ? 'N' : 'S';
    const typeT = tfRatio >= 50 ? 'T' : 'F';
    const typeJ = jpRatio >= 50 ? 'J' : 'P';
    const typeA = atRatio >= 50 ? 'A' : 'T';

    const baseType = `${typeE}${typeN}${typeT}${typeJ}`;
    const fullType = `${baseType}-${typeA}`;

    return {
      fullType,
      baseType,
      typeA,
      ratios: {
        EI: { label: typeE === 'E' ? t('외향형 (E)') : t('내향형 (I)'), val: typeE === 'E' ? eiRatio : 100 - eiRatio },
        SN: { label: typeN === 'N' ? t('직관형 (N)') : t('감각형 (S)'), val: typeN === 'N' ? snRatio : 100 - snRatio },
        TF: { label: typeT === 'T' ? t('사고형 (T)') : t('감정형 (F)'), val: typeT === 'T' ? tfRatio : 100 - tfRatio },
        JP: { label: typeJ === 'J' ? t('판단형 (J)') : t('인식형 (P)'), val: typeJ === 'J' ? jpRatio : 100 - jpRatio },
        AT: { label: typeA === 'A' ? t('자기확신형 (-A)') : t('신중형 (-T)'), val: typeA === 'A' ? atRatio : 100 - atRatio }
      }
    };
  };

  const showResults = (currentAnswers: (number | null)[]) => {
    const res = calculateScores(currentAnswers);
    setResult(res);
    setScreen('result');
    try {
      const uid = user?.uid || 'local-user';
      localStorage.setItem(`mystair_mbti_result_${uid}`, JSON.stringify(res));

      // Automatically update mypage data
      const savedMyPage = localStorage.getItem(`mystair_mypage_data_${uid}`);
      let myPageData = savedMyPage ? JSON.parse(savedMyPage) : {};
      myPageData.mbti = res.baseType;
      localStorage.setItem(`mystair_mypage_data_${uid}`, JSON.stringify(myPageData));
      
      // Also update firestore profile so context is updated for CompanySearch
      updateProfileInFirestore({ mbti: res.baseType });
    } catch (e) {
      console.error('Failed to save MBTI result to localStorage', e);
    }
  };

  const copyResults = () => {
    if (!result) return;
    const meta = mbtiMeta[result.baseType];

    let text = `[MyStair ${t('32가지 MBTI 진로 적성 검사')} ${t('진로 적성 진단 결과')}]\n\n`;
    text += `■ ${t('성격 유형')}: ${result.fullType} (${t(meta.alias)})\n`;
    text += `■ ${t('핵심 특성')}: ${t(meta.desc)}\n\n`;
    text += `■ ${t('지표별 선호도 비율')}:\n`;
    Object.keys(result.ratios).forEach(k => {
        text += `- ${result.ratios[k].label}: ${result.ratios[k].val}%\n`;
    });
    text += `\n■ ${t('추천 세부 직무')}:\n`;
    text += `- ${meta.jobs.map(j => t(j)).join(', ')}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setToastMsg(t("검사 결과가 클립보드에 복사되었습니다!"));
      setTimeout(() => setToastMsg(null), 2500);
    }).catch(err => {
        console.error("복사 실패", err);
    });
  };

  const restartQuiz = () => {
    setScreen('start');
  };

  const q = mbtiQuestions[currentIndex];
  const percent = Math.round(((currentIndex) / mbtiQuestions.length) * 100);

  return (
    <div className={`h-full flex-1 overflow-y-auto overflow-x-hidden bg-transparent font-sans flex flex-col relative ${isLightMode ? "text-slate-900" : "text-slate-100"}`}>
      <header className={`backdrop-blur-md h-[72px] w-full flex items-center justify-start px-10 shadow-sm sticky top-0 z-50 border-b ${isLightMode ? "bg-white/80 border-slate-200" : "bg-[#0F172A]/80 border-white/5"}`}>
        <div className="flex items-center gap-4">
          <Link to="/" className={`font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity ${isLightMode ? "text-slate-900" : "text-white"}`}>
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px]">
            MBTI 32
          </span>
          <span className="text-[#94A3B8] text-[14px] font-medium border-l border-[#334155] pl-4 hidden sm:block">
            {t('전국 마이스터고 맞춤형 MBTI 진로 적성 검사')}
          </span>
        </div>
      </header>

      <Link 
        to="/mypage" 
        title={t('마이페이지로 돌아가기')}
        className={`hidden sm:flex absolute top-[92px] left-10 px-3.5 h-[44px] rounded-xl justify-center items-center gap-1.5 text-[13px] font-bold shadow-md hover:border-[#14b8a6] hover:text-[#14b8a6] hover:-translate-y-0.5 transition-all duration-200 z-40 border ${
          isLightMode ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900/80 border-slate-700/50 text-slate-300 hover:bg-slate-800"
        }`}
      >
        <span>←</span>
        <span>{t('마이페이지')}</span>
      </Link>

      <main className="flex-1 flex justify-center items-center py-10 px-5">
        <div className={`w-full max-w-[680px] rounded-3xl p-6 sm:p-10 transition-all duration-300 border ${
          isLightMode 
            ? "bg-white text-slate-900 border-slate-200 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.08)]" 
            : "bg-slate-900/90 text-slate-100 border-slate-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        }`}>
          
          {screen === 'start' && (
            <div className="text-center py-5">
              <h1 className={`text-[28px] font-extrabold mb-3 leading-tight ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>{t('32가지 MBTI 진로 적성 검사')}</h1>
              <p className={`text-[15px] leading-relaxed mb-8 ${isLightMode ? "text-[#64748B]" : "text-slate-400"}`}>{t('나의 성격 유형(E/I, S/N, T/F, J/P)과 자아 지표(A/T)를 정밀 분석하여 나에게 꼭 맞는 맞춤형 직무를 추천해 드립니다.')}</p>
              
              <div className="flex justify-center gap-3 mb-9 flex-wrap">
                <div className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 border ${
                  isLightMode ? "bg-[#F1F5F9] text-[#0F172A] border-slate-200" : "bg-slate-800 text-slate-200 border-slate-700"
                }`}>{t('⏱ 소요시간 약 7분')}</div>
                <div className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 border ${
                  isLightMode ? "bg-[#F1F5F9] text-[#0F172A] border-slate-200" : "bg-slate-800 text-slate-200 border-slate-700"
                }`}>{t('📝 총 60문항')}</div>
                <div className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 border ${
                  isLightMode ? "bg-[#F1F5F9] text-[#0F172A] border-slate-200" : "bg-slate-800 text-slate-200 border-slate-700"
                }`}>{t('🎯 32가지 정밀 성격 분석')}</div>
              </div>

              <button 
                onClick={startQuiz} 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-none py-4 px-10 text-[16px] font-bold rounded-2xl cursor-pointer transition-all duration-200 shadow-lg shadow-teal-500/20 w-full max-w-[300px] hover:-translate-y-0.5"
              >
                {t('검사 시작하기')}
              </button>
            </div>
          )}

          {screen === 'quiz' && (
            <div>
              <div className="mb-8">
                <div className={`flex justify-between items-center text-[14px] font-bold mb-2.5 ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>
                  <span>{t('문항')} {currentIndex + 1} / {mbtiQuestions.length}</span>
                  <span className="text-[#14b8a6]">{percent}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isLightMode ? "bg-[#F1F5F9]" : "bg-slate-800"}`}>
                  <div className="h-full bg-gradient-to-br from-[#14b8a6] to-[#10b981] transition-all duration-300 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
              </div>

              <div className="min-h-[110px] flex items-center mb-7">
                <div className={`text-[17px] sm:text-[20px] font-bold leading-relaxed break-keep ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>
                  {q ? t(q.text) : ''}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { val: 1, label: t("1. 전혀 그렇지 않다") },
                  { val: 2, label: t("2. 그렇지 않은 편이다") },
                  { val: 3, label: t("3. 보통이다") },
                  { val: 4, label: t("4. 그런 편이다") },
                  { val: 5, label: t("5. 매우 그렇다") },
                ].map(opt => (
                  <button 
                    key={opt.val}
                    onClick={() => selectOption(opt.val)}
                    className={`border-2 px-5 py-4 rounded-xl text-left text-[15px] font-semibold transition-all duration-200 flex items-center justify-between
                      ${answers[currentIndex] === opt.val 
                        ? (isLightMode ? 'border-[#14b8a6] bg-[#f0fdfa] text-teal-800' : 'border-teal-500 bg-teal-950/40 text-teal-200 shadow-md shadow-teal-500/10')
                        : (isLightMode ? 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#14b8a6] hover:bg-[#F8FAFC]' : 'border-slate-800 bg-slate-800/60 text-slate-200 hover:border-teal-500/60 hover:bg-slate-800')}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className={`flex justify-between mt-7 pt-5 border-t ${isLightMode ? "border-[#E2E8F0]" : "border-slate-800"}`}>
                <button 
                  onClick={prevQuestion} 
                  disabled={currentIndex === 0}
                  className={`border px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isLightMode 
                      ? "border-[#E2E8F0] text-[#64748B] hover:not-disabled:bg-[#F1F5F9] hover:not-disabled:text-[#0F172A]" 
                      : "border-slate-700 text-slate-400 hover:not-disabled:bg-slate-800 hover:not-disabled:text-white"
                  }`}
                >
                  {t('← 이전 문항')}
                </button>
              </div>
            </div>
          )}

          {screen === 'result' && result && (
            <div>
              <div className={`text-center pb-6 mb-6 border-b-2 border-dashed ${isLightMode ? "border-[#E2E8F0]" : "border-slate-800"}`}>
                <div className="inline-block bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white px-[18px] py-1.5 rounded-full text-[13px] font-bold mb-3">
                  {t('진로 적성 진단 결과')}
                </div>
                <h2 className={`text-[28px] font-extrabold mb-1.5 ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>MBTI: {result.fullType}</h2>
                <p className={`text-[15px] font-semibold ${isLightMode ? "text-[#64748B]" : "text-slate-400"}`}>"{t(mbtiMeta[result.baseType].alias)}"</p>
              </div>

              <div className="mb-8">
                {Object.keys(result.ratios).map(key => {
                  const item = result.ratios[key];
                  return (
                    <div key={key} className="mb-3.5">
                      <div className={`flex justify-between text-[14px] font-bold mb-1.5 ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>
                        <span>{item.label}</span>
                        <span className="text-teal-400">{item.val}% {t('선호도')}</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${isLightMode ? "bg-[#F1F5F9]" : "bg-slate-800"}`}>
                        <div className="h-full bg-[#14b8a6] rounded-full transition-all duration-700 ease-out" style={{ width: `${item.val}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <div className={`rounded-2xl p-6 mb-4 border ${isLightMode ? "bg-[#F8FAFC] border-[#E2E8F0]" : "bg-slate-800/70 border-slate-700"}`}>
                  <h3 className={`text-[17px] font-extrabold mb-2.5 flex items-center gap-2 ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>{t('💡 성격 핵심 특성')}</h3>
                  <p className={`text-[14px] leading-relaxed mb-4 ${isLightMode ? "text-[#64748B]" : "text-slate-300"}`}>{t(mbtiMeta[result.baseType].desc)}</p>
                  <p className={`text-[14px] leading-relaxed m-0 ${isLightMode ? "text-[#64748B]" : "text-slate-300"}`}>
                    {result.typeA === 'A' 
                      ? <><strong className={isLightMode ? "text-[#0F172A]" : "text-teal-300"}>{t('자기확신형 (-A):')}</strong> {t('스트레스 저항력이 높으며 유연하고 자신감이 넘칩니다. 정서적으로 안정감이 느껴집니다.')}</>
                      : <><strong className={isLightMode ? "text-[#0F172A]" : "text-teal-300"}>{t('신중형 (-T):')}</strong> {t('성공 욕구가 강하고 자아 성찰적입니다. 섬세하고 신중한 완성도를 추구합니다.')}</>
                    }
                  </p>
                </div>
                <div className={`rounded-2xl p-6 mb-4 border ${isLightMode ? "bg-[#F8FAFC] border-[#E2E8F0]" : "bg-slate-800/70 border-slate-700"}`}>
                  <h3 className={`text-[17px] font-extrabold mb-2.5 flex items-center gap-2 ${isLightMode ? "text-[#0F172A]" : "text-white"}`}>{t('🎯 추천 적성 직무 및 분야')}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {mbtiMeta[result.baseType].jobs.map((job: string) => (
                      <span key={job} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border ${
                        isLightMode ? "bg-white border-[#E2E8F0] text-[#0F172A]" : "bg-slate-900 border-slate-700 text-teal-300"
                      }`}>{t(job)}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`mt-8 pt-6 border-t space-y-3 ${isLightMode ? "border-slate-200" : "border-slate-800"}`}>
                {/* Primary Action Button */}
                <Link 
                  to="/mypage" 
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <User size={16} />
                  <span>{t('마이페이지에서 결과 확인하기')}</span>
                </Link>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  <button 
                    type="button"
                    onClick={copyResults} 
                    className={`py-2.5 px-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLightMode 
                        ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" 
                        : "border-slate-700 bg-slate-800 hover:bg-slate-700/70 text-slate-200"
                    }`}
                  >
                    <Copy size={14} className="text-slate-400" />
                    <span>{t('결과 복사')}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={restartQuiz} 
                    className={`py-2.5 px-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLightMode 
                        ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" 
                        : "border-slate-700 bg-slate-800 hover:bg-slate-700/70 text-slate-200"
                    }`}
                  >
                    <RotateCcw size={14} className="text-slate-400" />
                    <span>{t('다시 검사')}</span>
                  </button>

                  <Link 
                    to="/" 
                    className={`py-2.5 px-3 rounded-xl border font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 text-center ${
                      isLightMode 
                        ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700" 
                        : "border-slate-700 bg-slate-800 hover:bg-slate-700/70 text-slate-200"
                    }`}
                  >
                    <Home size={14} className="text-slate-400" />
                    <span>{t('메인으로')}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {toastMsg && (
        <div className="fixed bottom-[30px] left-1/2 -translate-x-1/2 bg-[#0F172A] text-white border border-slate-700 px-6 py-3 rounded-full text-[14px] font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-[200]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

