import React, { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 400;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5,
        speed: (Math.random() * 0.1) + 0.02,
        opacity: Math.random()
      });
    }

    let shootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      active: false,
      timer: Math.random() * 200 + 100,
    };

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      stars.forEach(star => {
        // Move star down slowly
        star.y += star.speed;
        star.x -= star.speed * 0.2; // Slight diagonal movement
        
        // Reset if it goes off screen
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * height;
        }

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.05;
        if (star.opacity < 0.2) star.opacity = 0.2;
        if (star.opacity > 1) star.opacity = 1;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw shooting star
      if (!shootingStar.active) {
        shootingStar.timer--;
        if (shootingStar.timer <= 0) {
          shootingStar.active = true;
          shootingStar.x = Math.random() * width;
          shootingStar.y = 0;
          shootingStar.length = Math.random() * 80 + 40;
          shootingStar.speed = Math.random() * 4 + 8;
          shootingStar.angle = (Math.random() * Math.PI) / 4 + Math.PI / 4; // 45 to 90 degrees
        }
      } else {
        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;

        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const gradient = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Head
        gradient.addColorStop(0.1, 'rgba(255, 105, 180, 0.8)'); // Pink
        gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.6)'); // Orange
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)'); // Yellow
        gradient.addColorStop(0.7, 'rgba(0, 255, 0, 0.2)'); // Green
        gradient.addColorStop(0.9, 'rgba(0, 191, 255, 0.1)'); // Blue
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0)'); // Purple

        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();

        if (shootingStar.x > width || shootingStar.x < 0 || shootingStar.y > height) {
          shootingStar.active = false;
          shootingStar.timer = Math.random() * 300 + 100;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}
