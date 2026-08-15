import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ClickEffect() {
  const { isClickEffectEnabled, isLightMode } = useTheme();

  useEffect(() => {
    if (!isClickEffectEnabled) return;

    const handleClick = (e: MouseEvent) => {
      // Don't trigger on buttons or links to avoid visual noise when actually interacting?
      // User said: "눌러도 아무의미없는 배경을 마우스로 터치하면 뭔가 톡톡 터지게 만들어줘"
      // If it's a button or link, maybe we don't do it, or do it everywhere. Let's do it everywhere for fun, or check tag name.
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea') || target.closest('select') || target.closest('[role="button"]')) {
         return; // Uncomment to disable on interactive elements
      }

      const numParticles = 6;
      const colors = isLightMode 
        ? ['#4f46e5', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'] 
        : ['#818cf8', '#c084fc', '#f472b6', '#60a5fa', '#34d399'];

      for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        
        // Randomize color
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Randomize size
        const size = Math.random() * 6 + 4;
        
        particle.style.position = 'fixed';
        particle.style.top = `${e.clientY}px`;
        particle.style.left = `${e.clientX}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.opacity = '1';

        document.body.appendChild(particle);

        // Animate
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 40 + 20;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        requestAnimationFrame(() => {
          particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
          particle.style.opacity = '0';
        });

        // Cleanup
        setTimeout(() => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle);
          }
        }, 600);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isClickEffectEnabled, isLightMode]);

  return null;
}
