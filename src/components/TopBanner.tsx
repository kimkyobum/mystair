import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../friend_site/LanguageContext';

export default function TopBanner() {
  const { t } = useLanguage();
  const { isLightMode } = useTheme();

  const phrases = [
    "빛나는 기술인으로 성장하는 여정, MyStair가 당신의 든든한 날개가 되어줄게요",
    "마이스터고 학생들을 위한 맞춤형 진로 로드맵",
    "AI 컨설턴트와 함께하는 스마트한 취업 준비",
    "나의 잠재력을 발견하고 내일의 명장으로 거듭나는 첫걸음",
    "자격증부터 취업까지, 당신만의 특별한 커리어 스토리",
    "현업 전문가의 인사이트와 맞춤형 진로 추천"
  ];
  
  return (
    <div className={`relative z-50 w-full overflow-hidden backdrop-blur-md border-b py-3 flex font-medium text-xs sm:text-sm ${isLightMode ? "bg-white/40 border-slate-200/60 text-slate-800" : "bg-black/60 border-white/5 text-white/70"}`}>
      {/* 윗부분의 은은한 보랏빛 네온 라인 효과 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      
      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 120 }}
      >
        <div className="flex items-center pr-12">
          {phrases.map((item, index) => (
            <div key={`first-${index}`} className="flex items-center">
              <span className={`tracking-wide transition-colors cursor-default ${isLightMode ? "hover:text-slate-900" : "hover:text-white"}`}>{t(item)}</span>
              {/* 이모지 대신 우주/별빛 컨셉에 맞는 빛나는 점(Dot)을 구분자로 사용 */}
              <div className="mx-12 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]"></div>
            </div>
          ))}
        </div>
        <div className="flex items-center pr-12">
          {phrases.map((item, index) => (
            <div key={`second-${index}`} className="flex items-center">
              <span className={`tracking-wide transition-colors cursor-default ${isLightMode ? "hover:text-slate-900" : "hover:text-white"}`}>{t(item)}</span>
              <div className="mx-12 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]"></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
