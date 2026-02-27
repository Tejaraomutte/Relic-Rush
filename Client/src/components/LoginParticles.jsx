import React, { useRef, useEffect } from 'react';

// Utility for random float
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

const MAX_SMOKE = 28;   // slightly increased
const MAX_DUST = 42;

export default function LoginParticles() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const dustParticles = useRef([]);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function onMove(e) {
      if (particles.current.length < MAX_SMOKE) {
        particles.current.push({
          x: e.clientX + rand(-12, 12),
          y: e.clientY + rand(-12, 12),
          r: rand(28, 48),      // bigger smoke
          alpha: 0.9,
          vx: rand(-0.3, 0.3),
          vy: rand(-0.6, -1.5),
        });
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    function spawnGold(w) {
      if (dustParticles.current.length < MAX_DUST && Math.random() < 0.25) {
        dustParticles.current.push({
          x: rand(w * 0.35, w * 0.65),
          y: rand(-30, 0),
          r: rand(2, 4),          // bigger dust
          alpha: rand(0.35, 0.7),
          vy: rand(0.2, 0.35),
          drift: rand(-0.12, 0.12),
        });
      }
    }

    function animate() {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ========================
      // DARKER LIGHT BEAM
      // ========================
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.06 * Math.sin(Date.now() / 2000);
      const grad = ctx.createLinearGradient(w / 2, 0, w / 2, h * 0.7);
      grad.addColorStop(0, 'rgba(255, 220, 150, 0.15)');
      grad.addColorStop(0.3, 'rgba(180, 130, 40, 0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(w / 2 - w * 0.12, 0, w * 0.24, h * 0.7);
      ctx.restore();

      // ========================
      // GOLD DUST (DARK ROYAL)
      // ========================
      spawnGold(w);

      for (let i = dustParticles.current.length - 1; i >= 0; i--) {
        const p = dustParticles.current[i];
        p.y += p.vy;
        p.x += p.drift;
        p.alpha -= 0.002;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(170, 120, 25, 0.95)'; // darker gold
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowColor = '#B8860B';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();

        if (p.y > h * 0.7 || p.alpha <= 0) {
          dustParticles.current.splice(i, 1);
        }
      }

      // ========================
      // DARKER SMOKE (MORE MYSTIC)
      // ========================
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 80, 95, 0.35)'; // darker teal smoke
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = '#1f4f5c';
        ctx.shadowBlur = 30;
        ctx.filter = 'blur(8px)';
        ctx.fill();
        ctx.restore();

        if (p.alpha <= 0) {
          particles.current.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        mixBlendMode: 'lighter',
      }}
    />
  );
}