import { useState, useCallback } from 'react';
import { motion } from 'motion/react';

// Helper to generate dynamic random floating paths across screen
function getRandomSpacePath() {
  const startSide = Math.floor(Math.random() * 4); // 0: left, 1: bottom, 2: right, 3: top
  let startX = -15, startY = -15;
  let endX = 115, endY = 115;

  if (startSide === 0) { // left -> right
    startX = -15;
    startY = Math.random() * 70 + 15;
    endX = 115;
    endY = Math.random() * 70 + 15;
  } else if (startSide === 1) { // bottom -> top
    startX = Math.random() * 70 + 15;
    startY = 115;
    endX = Math.random() * 70 + 15;
    endY = -15;
  } else if (startSide === 2) { // right -> left
    startX = 115;
    startY = Math.random() * 70 + 15;
    endX = -15;
    endY = Math.random() * 70 + 15;
  } else { // top -> bottom
    startX = Math.random() * 70 + 15;
    startY = -15;
    endX = Math.random() * 70 + 15;
    endY = 115;
  }

  // Random mid points for curved space drift
  const mid1X = Math.random() * 60 + 20;
  const mid1Y = Math.random() * 60 + 20;
  const mid2X = Math.random() * 60 + 20;
  const mid2Y = Math.random() * 60 + 20;

  // Random 360/720 spin direction
  const spins = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 360 : 720);

  return {
    x: [`${startX}vw`, `${mid1X}vw`, `${mid2X}vw`, `${endX}vw`],
    y: [`${startY}vh`, `${mid1Y}vh`, `${mid2Y}vh`, `${endY}vh`],
    rotate: [0, 90, spins, spins + (Math.random() > 0.5 ? 45 : -45)],
    duration: Math.random() * 12 + 28, // 28 ~ 40 seconds per transit
  };
}

// Vector SVG component of the cute green alien in a light blue UFO
export function AlienUFOSvg({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* UFO Glow / Thruster Aura */}
      <ellipse cx="50" cy="78" rx="22" ry="8" fill="#38bdf8" opacity="0.35" className="animate-pulse" />
      <ellipse cx="50" cy="77" rx="14" ry="5" fill="#a5f3fc" opacity="0.6" />

      {/* UFO Bottom Base */}
      <path d="M30 68 C30 82, 70 82, 70 68 Z" fill="#0284c7" />
      <path d="M34 68 C34 78, 66 78, 66 68 Z" fill="#0369a1" />

      {/* Alien Head */}
      <path d="M26 42 C24 16, 76 16, 74 42 C72 58, 28 58, 26 42 Z" fill="#4ade80" stroke="#166534" strokeWidth="2.5" />
      
      {/* Alien Forehead Highlights */}
      <circle cx="62" cy="24" r="2" fill="#86efac" />
      <circle cx="66" cy="27" r="1.5" fill="#86efac" />

      {/* Alien Eyes - Big glossy black eyes */}
      <ellipse cx="38" cy="38" rx="10" ry="13" fill="#0f172a" transform="rotate(-8 38 38)" />
      <ellipse cx="62" cy="38" rx="10" ry="13" fill="#0f172a" transform="rotate(8 62 38)" />

      {/* Eye shine reflections */}
      <ellipse cx="36" cy="34" rx="3.5" ry="5" fill="#ffffff" transform="rotate(-8 36 34)" />
      <circle cx="41" cy="42" r="1.5" fill="#ffffff" />
      
      <ellipse cx="60" cy="34" rx="3.5" ry="5" fill="#ffffff" transform="rotate(8 60 34)" />
      <circle cx="65" cy="42" r="1.5" fill="#ffffff" />

      {/* Cute Smile */}
      <path d="M45 49 Q50 54 55 49" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Cute Little Alien Hand */}
      <path d="M68 50 C74 52, 75 58, 68 59" stroke="#166534" strokeWidth="2.5" fill="#4ade80" strokeLinecap="round" />

      {/* UFO Saucer Main Ring / Rim */}
      <ellipse cx="50" cy="65" rx="42" ry="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      <ellipse cx="50" cy="63" rx="40" ry="11" fill="#7dd3fc" />

      {/* UFO Rim Lights */}
      <circle cx="20" cy="64" r="2.5" fill="#fef08a" />
      <circle cx="35" cy="68" r="3" fill="#ffffff" />
      <circle cx="50" cy="70" r="3" fill="#fef08a" />
      <circle cx="65" cy="68" r="3" fill="#ffffff" />
      <circle cx="80" cy="64" r="2.5" fill="#fef08a" />
    </svg>
  );
}

// Vector SVG component of the cute Pink Alien Girlfriend in a Pink Flying Saucer
export function PinkAlienGirlfriendSvg({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* UFO Glow / Thruster Aura */}
      <ellipse cx="50" cy="78" rx="22" ry="8" fill="#f472b6" opacity="0.4" className="animate-pulse" />
      <ellipse cx="50" cy="77" rx="14" ry="5" fill="#fbcfe8" opacity="0.7" />

      {/* UFO Bottom Base */}
      <path d="M30 68 C30 82, 70 82, 70 68 Z" fill="#be185d" />
      <path d="M34 68 C34 78, 66 78, 66 68 Z" fill="#9d174d" />

      {/* Pink Alien Girlfriend Head */}
      <path d="M26 42 C24 16, 76 16, 74 42 C72 58, 28 58, 26 42 Z" fill="#f472b6" stroke="#9d174d" strokeWidth="2.5" />
      
      {/* Head Ribbons / Cute Red Ribbon Bow on Top Right */}
      <g>
        <path d="M 64 16 C 58 10, 56 20, 64 20 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
        <path d="M 64 16 C 70 10, 72 20, 64 20 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1.5" />
        <circle cx="64" cy="18" r="2.5" fill="#fbe2e8" />
      </g>

      {/* Rosy Cheeks */}
      <circle cx="30" cy="46" r="4" fill="#f43f5e" opacity="0.5" />
      <circle cx="70" cy="46" r="4" fill="#f43f5e" opacity="0.5" />

      {/* Alien Eyes - Big glossy black eyes with cute eyelashes */}
      <g>
        {/* Left Eye */}
        <ellipse cx="38" cy="38" rx="10" ry="13" fill="#0f172a" transform="rotate(-8 38 38)" />
        {/* Left Eyelashes */}
        <path d="M 28 32 L 24 28 M 31 28 L 29 22 M 36 26 L 37 20" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

        {/* Right Eye */}
        <ellipse cx="62" cy="38" rx="10" ry="13" fill="#0f172a" transform="rotate(8 62 38)" />
        {/* Right Eyelashes */}
        <path d="M 72 32 L 76 28 M 69 28 L 71 22 M 64 26 L 63 20" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

        {/* Eye shine reflections (Heart-shaped highlight in eyes) */}
        <path d="M 36 32 C 34 30, 32 32, 36 36 C 40 32, 38 30, 36 32 Z" fill="#ffffff" />
        <circle cx="41" cy="42" r="1.5" fill="#ffffff" />
        
        <path d="M 60 32 C 58 30, 56 32, 60 36 C 64 32, 62 30, 60 32 Z" fill="#ffffff" />
        <circle cx="65" cy="42" r="1.5" fill="#ffffff" />
      </g>

      {/* Cute Smile with open happy mouth */}
      <path d="M 44 49 Q 50 55 56 49" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" fill="#fda4af" />

      {/* Cute Little Pink Alien Hand Waving */}
      <motion.g
        animate={{ rotate: [-10, 15, -10] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '68px 50px' }}
      >
        <path d="M68 50 C74 50, 78 56, 70 59" stroke="#9d174d" strokeWidth="2.5" fill="#f472b6" strokeLinecap="round" />
      </motion.g>

      {/* UFO Saucer Main Ring / Rim (Pink / Magenta theme) */}
      <ellipse cx="50" cy="65" rx="42" ry="14" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
      <ellipse cx="50" cy="63" rx="40" ry="11" fill="#f472b6" />

      {/* UFO Rim Lights */}
      <circle cx="20" cy="64" r="2.5" fill="#fde047" />
      <circle cx="35" cy="68" r="3" fill="#ffffff" />
      <circle cx="50" cy="70" r="3" fill="#fde047" />
      <circle cx="65" cy="68" r="3" fill="#ffffff" />
      <circle cx="80" cy="64" r="2.5" fill="#fde047" />
    </svg>
  );
}

export default function FloatingAliens() {
  // Random paths state for UFO Green Alien
  const [alienPathKey, setAlienPathKey] = useState(0);
  const [alienPath, setAlienPath] = useState(() => getRandomSpacePath());

  // Random paths state for Pink Alien Girlfriend
  const [girlPathKey, setGirlPathKey] = useState(0);
  const [girlPath, setGirlPath] = useState(() => {
    const p = getRandomSpacePath();
    p.duration = Math.random() * 10 + 30;
    return p;
  });

  const nextAlienPath = useCallback(() => {
    setAlienPath(getRandomSpacePath());
    setAlienPathKey(prev => prev + 1);
  }, []);

  const nextGirlPath = useCallback(() => {
    const p = getRandomSpacePath();
    p.duration = Math.random() * 10 + 30;
    setGirlPath(p);
    setGirlPathKey(prev => prev + 1);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden">
      {/* 1. Main UFO Green Alien - Floating with Random Unpredictable Paths */}
      <motion.div
        key={`alien-${alienPathKey}`}
        className="absolute"
        initial={{ x: alienPath.x[0], y: alienPath.y[0] }}
        animate={{
          x: alienPath.x,
          y: alienPath.y,
          rotate: alienPath.rotate,
        }}
        transition={{
          duration: alienPath.duration,
          ease: 'easeInOut',
        }}
        onAnimationComplete={nextAlienPath}
      >
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotate: [-4, 4, -4],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative group"
        >
          {/* Subtle Space Glow behind alien */}
          <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-md" />
          
          {/* Main UFO Green Alien SVG */}
          <AlienUFOSvg className="w-13 h-13 sm:w-15 sm:h-15 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
        </motion.div>
      </motion.div>

      {/* 2. Pink Alien Girlfriend - Floating with Random Unpredictable Paths */}
      <motion.div
        key={`girl-${girlPathKey}`}
        className="absolute"
        initial={{ x: girlPath.x[0], y: girlPath.y[0] }}
        animate={{
          x: girlPath.x,
          y: girlPath.y,
          rotate: girlPath.rotate,
        }}
        transition={{
          duration: girlPath.duration,
          ease: 'easeInOut',
        }}
        onAnimationComplete={nextGirlPath}
      >
        <motion.div
          animate={{
            y: [-5, 5, -5],
            rotate: [3, -3, 3],
          }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative group"
        >
          {/* Pink Space Glow behind girlfriend alien */}
          <div className="absolute -inset-2 bg-pink-500/25 rounded-full blur-md" />
          
          {/* Main Pink Alien Girlfriend SVG */}
          <PinkAlienGirlfriendSvg className="w-13 h-13 sm:w-15 sm:h-15 drop-shadow-[0_0_14px_rgba(236,72,153,0.6)]" />
        </motion.div>
      </motion.div>
    </div>
  );
}

