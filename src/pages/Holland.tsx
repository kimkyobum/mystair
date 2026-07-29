import { useState } from 'react';
import { Link } from 'react-router-dom';
import { hollandQuestions, hollandMeta } from '../data/hollandData';

export default function Holland() {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(hollandQuestions.length).fill(null));
  const [result, setResult] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const startQuiz = () => {
    setScreen('quiz');
    setCurrentIndex(0);
    setAnswers(new Array(hollandQuestions.length).fill(null));
  };

  const showQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const selectOption = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);

    if (currentIndex < hollandQuestions.length - 1) {
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
    let scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    currentAnswers.forEach((ans, idx) => {
      if (ans !== null) {
        const type = hollandQuestions[idx].type as keyof typeof scores;
        scores[type] += ans;
      }
    });

    let percentages: Record<string, number> = {};
    Object.keys(scores).forEach(type => {
      percentages[type] = Math.round(((scores[type as keyof typeof scores] - 10) / 40) * 100);
    });

    let sorted = Object.keys(percentages).sort((a, b) => percentages[b] - percentages[a]);
    const topCode = sorted[0] + sorted[1];

    return {
      topCode,
      firstType: sorted[0],
      secondType: sorted[1],
      percentages
    };
  };

  const showResults = (currentAnswers: (number | null)[]) => {
    const res = calculateScores(currentAnswers);
    setResult(res);
    setScreen('result');
    try {
      localStorage.setItem('mystair_holland_result', JSON.stringify(res));

      // Automatically update mypage data
      const savedMyPage = localStorage.getItem('mystair_mypage_data');
      let myPageData = savedMyPage ? JSON.parse(savedMyPage) : {};
      myPageData.hollandCode = res.topCode;
      localStorage.setItem('mystair_mypage_data', JSON.stringify(myPageData));
    } catch (e) {
      console.error('Failed to save Holland result to localStorage', e);
    }
  };

  const copyResults = () => {
    if (!result) return;
    const primaryMeta = hollandMeta[result.firstType];
    const secondaryMeta = hollandMeta[result.secondType];
    const combinedJobs = Array.from(new Set([...primaryMeta.jobs, ...secondaryMeta.jobs]));

    let text = `[MyStair Holland 직업적성검사 결과]\n\n`;
    text += `■ 주요 적성 코드: ${result.topCode}\n`;
    text += `■ 대표 성향: ${primaryMeta.alias} & ${secondaryMeta.alias}\n\n`;
    text += `■ 흥미 유형별 적합도:\n`;
    Object.keys(result.percentages).forEach(type => {
      text += `- ${hollandMeta[type].name}: ${result.percentages[type]}%\n`;
    });
    text += `\n■ 추천 직무 분야:\n`;
    text += `- ${combinedJobs.join(', ')}\n`;

    navigator.clipboard.writeText(text).then(() => {
      setToastMsg("검사 결과가 클립보드에 복사되었습니다!");
      setTimeout(() => setToastMsg(null), 2500);
    }).catch(err => {
      console.error("복사 실패", err);
    });
  };

  const restartQuiz = () => {
    setScreen('start');
  };

  const q = hollandQuestions[currentIndex];
  const percent = Math.round(((currentIndex) / hollandQuestions.length) * 100);

  return (
    <div className="h-full flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col relative">
      <header className="bg-[#0F172A] h-[72px] w-full flex items-center justify-start px-10 shadow-[0_4px_20px_rgba(15,23,42,0.15)] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white font-black text-[26px] tracking-[-0.5px] cursor-pointer hover:opacity-80 transition-opacity">
            MyStair
          </Link>
          <span className="bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-[0.5px]">
            Holland
          </span>
          <span className="text-[#94A3B8] text-[14px] font-medium border-l border-[#334155] pl-4 hidden sm:block">
            전국 마이스터고 맞춤형 직업적성검사
          </span>
        </div>
      </header>

      <Link to="/" className="hidden sm:flex absolute top-[92px] left-10 w-20 h-[50px] rounded-xl justify-center items-center text-[30px] font-bold bg-white border-[1.5px] border-[#E2E8F0] text-[#64748B] shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:border-[#6366F1] hover:text-[#6366F1] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.15)] transition-all duration-200 z-40">
        ←
      </Link>

      <main className="flex-1 flex justify-center items-center py-10 px-5">
        <div className="w-full max-w-[680px] bg-white rounded-3xl shadow-[0_10px_30px_-5px_rgba(15,23,42,0.08),0_0_0_1px_rgba(226,232,240,0.8)] p-6 sm:p-10 transition-all duration-300">
          
          {screen === 'start' && (
            <div className="text-center py-5">
              <h1 className="text-[28px] font-extrabold text-[#0F172A] mb-3 leading-tight">Holland<br/>직업적성검사</h1>
              <p className="text-[#64748B] text-[15px] leading-relaxed mb-8">나의 흥미와 적성 유형(RIASEC)을 분석하여<br/>나에게 꼭 맞는 직업군과 직무를 추천해 드립니다.</p>
              
              <div className="flex justify-center gap-3 mb-9 flex-wrap">
                <div className="bg-[#F1F5F9] text-[#0F172A] px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5">⏱ 소요시간 약 7분</div>
                <div className="bg-[#F1F5F9] text-[#0F172A] px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5">📝 총 60문항</div>
                <div className="bg-[#F1F5F9] text-[#0F172A] px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5">🎯 6가지 흥미 유형 진단</div>
              </div>

              <button onClick={startQuiz} className="bg-[#0F172A] text-white border-none py-4 px-10 text-[16px] font-bold rounded-2xl cursor-pointer transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.15)] w-full max-w-[300px] hover:bg-[#1E293B] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.2)]">검사 시작하기</button>
            </div>
          )}

          {screen === 'quiz' && (
            <div>
              <div className="mb-8">
                <div className="flex justify-between items-center text-[14px] font-bold text-[#0F172A] mb-2.5">
                  <span>문항 {currentIndex + 1} / {hollandQuestions.length}</span>
                  <span className="text-[#6366F1]">{percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] transition-all duration-300 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
              </div>

              <div className="min-h-[110px] flex items-center mb-7">
                <div className="text-[17px] sm:text-[20px] font-bold text-[#0F172A] leading-relaxed break-keep">{q?.text}</div>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { val: 1, label: "1. 전혀 그렇지 않다" },
                  { val: 2, label: "2. 그렇지 않은 편이다" },
                  { val: 3, label: "3. 보통이다" },
                  { val: 4, label: "4. 그런 편이다" },
                  { val: 5, label: "5. 매우 그렇다" },
                ].map(opt => (
                  <button 
                    key={opt.val}
                    onClick={() => selectOption(opt.val)}
                    className={`bg-white border-2 px-5 py-4 rounded-xl text-left text-[15px] font-semibold transition-all duration-200 flex items-center justify-between
                      ${answers[currentIndex] === opt.val 
                        ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]' 
                        : 'border-[#E2E8F0] text-[#0F172A] hover:border-[#6366F1] hover:bg-[#F8FAFC] hover:translate-x-1'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-7 pt-5 border-t border-[#E2E8F0]">
                <button 
                  onClick={prevQuestion} 
                  disabled={currentIndex === 0}
                  className="bg-transparent border border-[#E2E8F0] px-5 py-2.5 rounded-lg text-[#64748B] text-[14px] font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-[#F1F5F9] hover:not-disabled:text-[#0F172A]"
                >
                  ← 이전 문항
                </button>
              </div>
            </div>
          )}

          {screen === 'result' && result && (
            <div>
              <div className="text-center pb-6 mb-6 border-b-2 border-dashed border-[#E2E8F0]">
                <div className="inline-block bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white px-[18px] py-1.5 rounded-full text-[13px] font-bold mb-3">
                  Holland 진로 진단 결과
                </div>
                <h2 className="text-[28px] font-extrabold text-[#0F172A] mb-1.5">유형: {result.topCode}</h2>
                <p className="text-[15px] text-[#64748B] font-semibold">"{hollandMeta[result.firstType].alias} & {hollandMeta[result.secondType].alias}"</p>
              </div>

              <div className="mb-8">
                {Object.keys(result.percentages).map(type => {
                  const val = result.percentages[type];
                  const meta = hollandMeta[type];
                  return (
                    <div key={type} className="mb-3.5">
                      <div className="flex justify-between text-[14px] font-bold mb-1.5 text-[#0F172A]">
                        <span>{meta.name}</span>
                        <span>{val}% 적합도</span>
                      </div>
                      <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#6366F1] rounded-full transition-all duration-700 ease-out" style={{ width: `${val}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-4 border border-[#E2E8F0]">
                  <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2.5 flex items-center gap-2">💡 1순위: {hollandMeta[result.firstType].name}</h3>
                  <p className="text-[14px] text-[#64748B] leading-relaxed mb-0">{hollandMeta[result.firstType].desc}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-4 border border-[#E2E8F0]">
                  <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2.5 flex items-center gap-2">💡 2순위: {hollandMeta[result.secondType].name}</h3>
                  <p className="text-[14px] text-[#64748B] leading-relaxed mb-0">{hollandMeta[result.secondType].desc}</p>
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-4 border border-[#E2E8F0]">
                  <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2.5 flex items-center gap-2">🎯 추천 맞춤 직무</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set([...hollandMeta[result.firstType].jobs, ...hollandMeta[result.secondType].jobs])).map((job: string) => (
                      <span key={job} className="bg-white border border-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded-lg text-[13px] font-semibold">{job}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Link to="/mypage" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none p-4 rounded-xl text-[15px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
                  <span>👤 마이페이지로 이동하여 결과 확인하기</span>
                </Link>
                <button onClick={copyResults} className="w-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white border-none p-4 rounded-xl text-[15px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-all hover:opacity-95 hover:-translate-y-0.5">
                  📋 검사 결과 복사하기
                </button>
                <button onClick={restartQuiz} className="w-full bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] p-3.5 rounded-xl text-[14px] font-bold cursor-pointer transition-colors hover:bg-[#E2E8F0]">
                  🔄 다시 검사하기
                </button>
                <Link to="/" className="w-full bg-[#0F172A] text-white border-none p-4 rounded-xl text-[15px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(15,23,42,0.2)] transition-all hover:bg-[#1E293B] hover:-translate-y-0.5 text-center flex items-center justify-center">
                  🏠 메인으로 돌아가기
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {toastMsg && (
        <div className="fixed bottom-[30px] left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-3 rounded-full text-[14px] font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-[200]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
