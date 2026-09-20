import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-slate-200"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-none">
            <div className="flex items-center gap-2">
              <span className="inline-block bg-[#E6FFFA] text-[#0D9488] text-xs font-bold px-2.5 py-1 rounded">
                MyStair 개인정보 보호 지침
              </span>
              <span className="text-sm font-semibold text-slate-600 hidden sm:inline">
                개인정보 처리방침
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-[#002B49] bg-white border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                title="새 탭에서 전체화면으로 열기"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">새 탭으로 보기</span>
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Policy Body */}
          <div className="p-6 sm:p-10 overflow-y-auto text-left leading-relaxed text-[15px] text-slate-700 space-y-6">
            <header className="border-b-2 border-[#002B49] pb-5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002B49] mb-2">
                개인정보 처리방침
              </h1>
              <p className="text-sm text-slate-500">
                시행일자: 2026년 8월 25일 | 최종 변경일자: 2026년 8월 25일
              </p>
            </header>

            <p>
              <strong className="text-slate-900">MyStair(마이스테어)</strong>(이하 '회사' 또는 '서비스')는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련된 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제1조 (개인정보의 처리 목적)
              </h2>
              <p className="mb-2">
                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base">
                <li>
                  <strong className="text-slate-900">회원 가입 및 관리:</strong> 학생·교사·기업 회원 가입 의사 확인, 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지.
                </li>
                <li>
                  <strong className="text-slate-900">MyStair 핵심 서비스 제공:</strong>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-600">
                    <li>캘린더 기반 실습/대회 경험 데이터 적재 및 자격증 통합 관리</li>
                    <li>보유 역량(자격증 및 기술 태그) 기반 맞춤 기업 채용 정보 추천</li>
                    <li>AI 기반 지원 기업/문항 맞춤형 최적 에피소드(소재) 추출 및 STAR 작성 개요 제공</li>
                    <li>학교/학급 단위 경력 관리 및 교사 모니터링 기능 제공</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-slate-900">서비스 개선 및 신규 기능 개발:</strong> AI 모델 성능 향상(비식별화 데이터 활용), 접속 빈도 파악, 서비스 이용에 대한 통계학적 분석.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제2조 (개인정보의 처리 및 보유 기간)
              </h2>
              <p className="mb-3">
                회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[#002B49] font-semibold border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200">구분</th>
                      <th className="p-3 border-r border-slate-200">수집 및 처리 항목</th>
                      <th className="p-3">보유 및 이용 기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-semibold border-r border-slate-200">회원 가입 정보</td>
                      <td className="p-3 border-r border-slate-200">[필수] 이름, 이메일, 비밀번호, 학교명, 전공/학과, 학년, 회원 유형(학생/교사/기업)</td>
                      <td className="p-3 font-semibold text-slate-900">회원 탈퇴 시 즉시 파기</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold border-r border-slate-200">서비스 이용 데이터</td>
                      <td className="p-3 border-r border-slate-200">[선택] 실습/대회 경험 기록(다이어리), 자격증/수상 이력, AI 추출 자소서 소재 내역</td>
                      <td className="p-3 font-semibold text-slate-900">회원 탈퇴 시 즉시 파기</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold border-r border-slate-200">자동 수집 정보</td>
                      <td className="p-3 border-r border-slate-200">서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</td>
                      <td className="p-3 font-semibold text-slate-900">통신비밀보호법에 따라 3개월</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제3조 (개인정보의 제3자 제공)
              </h2>
              <p className="mb-2">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
                <li>
                  <strong className="text-slate-900">기업 채용 연계 서비스 이용 시 (학생 동의 시에 한함):</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>제공받는 자: MyStair 제휴 기업 채용 담당자</li>
                    <li>제공 목적: 고졸 기술인재 채용 전형 검토 및 면접 제안</li>
                    <li>제공 항목: 이름, 학교/전공, 캘린더 기반 경험 이력, 자격증, STAR 자소서 포트폴리오</li>
                    <li>보유 기간: 채용 전형 종료 시까지</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제4조 (개인정보 처리의 위탁)
              </h2>
              <p className="mb-3">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[#002B49] font-semibold border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200">수탁업체</th>
                      <th className="p-3 border-r border-slate-200">위탁 업무 내용</th>
                      <th className="p-3">개인정보의 보유 및 이용 기간</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">Google LLC / OpenAI</td>
                      <td className="p-3 border-r border-slate-200">
                        AI 맞춤형 자소서 소재 추천 및 챗봇 연동<br />
                        <span className="text-[#0D9488] text-xs mt-1 block">
                          (※ 모든 프롬프트 데이터는 이름 등 식별자 제거(비식별화) 후 전송되며, 외부 AI 모델 학습에 사용되지 않음)
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">회원 탈퇴 시 또는 위탁 계약 종료 시까지</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-200">Vercel Inc. / Render</td>
                      <td className="p-3 border-r border-slate-200">
                        프론트엔드/백엔드 클라우드 서버 호스팅 및 PostgreSQL 데이터베이스 운영
                      </td>
                      <td className="p-3 text-slate-700">회원 탈퇴 시 또는 위탁 계약 종료 시까지</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제5조 (개인정보의 파기절차 및 파기방법)
              </h2>
              <p className="mb-2">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base">
                <li>
                  <strong className="text-slate-900">파기절차:</strong> 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 얻어 개인정보를 파기합니다.
                </li>
                <li>
                  <strong className="text-slate-900">파기방법:</strong> 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 기술적 방법(파기 알고리즘)을 이용하여 영구 삭제합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제6조 (정보주체와 법정대리인의 권리·의무 및 행사방법)
              </h2>
              <ol className="list-decimal pl-6 space-y-1.5 text-sm sm:text-base">
                <li>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
                <li>권리 행사는 회사에 대해 개인정보 보호법 시행령 제41조 제1항에 따라 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
                <li>만 14세 미만 아동의 경우, 법정대리인이 아동의 개인정보에 대한 열람, 정정, 삭제, 처리정지 요구 권리를 가집니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제7조 (개인정보의 안전성 확보조치)
              </h2>
              <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
                <li><strong className="text-slate-900">관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 취급자 교육.</li>
                <li><strong className="text-slate-900">기술적 조치 (데이터 암호화):</strong> 사용자의 비밀번호는 단방향 암호화되어 저장되며, <strong className="text-slate-900">특히 사용자가 작성한 '경험 다이어리' 및 '자소서 데이터' 등 민감한 정보는 강력한 양방향 암호화 알고리즘을 적용하여 안전하게 데이터베이스에 보관</strong>됩니다. 개인정보처리시스템 등의 접근권한 관리를 철저히 하고 있습니다.</li>
                <li><strong className="text-slate-900">물리적 조치:</strong> 데이터센터 및 클라우드 인프라의 철저한 접근 통제.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제8조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)
              </h2>
              <p className="mb-2">회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
              <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base">
                <li><strong className="text-slate-900">쿠키의 사용 목적:</strong> 이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 보안접속 여부 등을 파악하여 이용자에게 최적화된 정보 제공.</li>
                <li><strong className="text-slate-900">쿠키 설치·운영 및 거부:</strong> 웹 브라우저의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 거부 시 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</li>
              </ul>
            </section>

            {/* AI Ethics Highlight Box */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 rounded-xl my-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mb-3">
                제9조 (AI 윤리 및 생성물의 저작권)
              </h2>
              <p className="mb-3 text-slate-700">
                MyStair는 인공지능 기술을 활용함에 있어 사용자의 권리와 윤리를 최우선으로 고려합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-800">
                <li>
                  <strong className="text-slate-900">데이터 비식별화 및 학습 배제:</strong> AI 분석을 위해 외부(Gemini 등)로 전송되는 사용자의 다이어리 및 실습 데이터는 개인을 특정할 수 없도록 철저히 비식별화(Anonymization) 처리됩니다. 전송된 데이터는 외부 AI 제공사의 기반 모델 학습용으로 무단 수집되거나 활용되지 않습니다.
                </li>
                <li>
                  <strong className="text-slate-900">생성물의 저작권 귀속:</strong> MyStair의 AI를 통해 생성된 자소서 뼈대(STAR 가이드), 포트폴리오 요약본 등 모든 결과물에 대한 권리 및 저작권은 <strong className="text-slate-900">이를 입력하고 생성한 '사용자(학생 본인)'에게 전적으로 귀속</strong>됩니다.
                </li>
                <li>
                  <strong className="text-slate-900">윤리적 사용 가이드라인:</strong> 회사는 AI의 허위 사실 생성(Hallucination)을 막기 위해 팩트 기반 추출(RAG) 기술을 적용하고 있습니다. 다만, AI가 도출한 초안을 바탕으로 최종 제출본을 검토 및 수정하는 것은 사용자의 권리이자 책임이며, 실제 채용 및 면접 과정에서 발생하는 결과의 책임은 사용자 본인에게 있습니다.
                </li>
              </ul>
            </div>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제10조 (개인정보 보호책임자)
              </h2>
              <p className="mb-3">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-slate-50 border-l-4 border-[#11CAA0] p-4 rounded-r-lg">
                <strong className="text-slate-900 block mb-2 font-semibold">개인정보 보호책임자</strong>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• 소속 / 팀명: 구미전자공업고등학교 Team AMP</li>
                  <li>• 연락처 / 이메일: <a href="mailto:privacy@mystair.io" className="text-blue-600 hover:underline">privacy@mystair.io</a></li>
                  <li>• 문의 가능 시간: 평일 09:00 ~ 18:00</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제11조 (권익침해 구제방법)
              </h2>
              <p className="mb-2">
                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-slate-700">
                <li>개인정보분쟁조정위원회 : (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                <li>개인정보침해신고센터 : (국번없이) 118 (privacy.kisa.or.kr)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-[#002B49] mt-6 mb-3 pb-2 border-b border-slate-200">
                제12조 (개인정보 처리방침의 변경)
              </h2>
              <p className="text-sm sm:text-base">
                이 개인정보 처리방침은 2026년 8월 25일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 웹사이트 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <footer className="mt-10 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
              <p>&copy; 2026 MyStair (구미전자공업고등학교 Team AMP). All Rights Reserved.</p>
            </footer>
          </div>

          {/* Modal Bottom Close Action */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#002B49] text-white font-semibold text-sm rounded-xl hover:bg-[#003860] transition-colors cursor-pointer"
            >
              확인 및 닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
