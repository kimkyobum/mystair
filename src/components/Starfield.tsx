import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];
    let shootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      active: false,
      timer: Math.random() * 200 + 100,
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 1500);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random(),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });

      if (!shootingStar.active) {
        shootingStar.timer--;
        if (shootingStar.timer <= 0) {
          shootingStar.active = true;
          shootingStar.x = Math.random() * canvas.width;
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

        if (shootingStar.x > canvas.width || shootingStar.x < 0 || shootingStar.y > canvas.height) {
          shootingStar.active = false;
          shootingStar.timer = Math.random() * 300 + 100;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
