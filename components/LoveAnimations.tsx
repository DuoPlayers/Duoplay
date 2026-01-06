
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export const LoveAnimations: React.FC<{ trigger: string | null; onComplete: () => void }> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenEffect, setScreenEffect] = useState<string | null>(null);

  useEffect(() => {
    if (!trigger) return;

    let emojis: string[] = [];
    let count = 15;

    switch(trigger) {
      case 'KISS': emojis = ['😘', '💋', '❤️']; break;
      case 'SAUDADES': emojis = ['📸', '💭', '❤️', '🫂']; count = 30; break;
      case 'TRISTE': emojis = ['😢', '🫂', '💌', '✨']; count = 20; setScreenEffect('bg-blue-500/10'); break;
      case 'SEXY': emojis = ['🔥', '😏', '💋', '👅']; count = 25; setScreenEffect('bg-red-600/20'); break;
      case 'HEARTBEAT': emojis = ['💓', '💗', '❤️']; count = 10; setScreenEffect('pulse-red'); break;
      default: emojis = ['❤️', '✨'];
    }
    
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 90 + 5,
      y: 100,
      size: Math.random() * 30 + 20,
      duration: Math.random() * 2 + 2
    }));

    setParticles(newParticles);
    const timer = setTimeout(() => {
      setParticles([]);
      setScreenEffect(null);
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {screenEffect === 'pulse-red' && (
        <div className="absolute inset-0 bg-red-600/10 animate-pulse-fast"></div>
      )}
      {screenEffect && !screenEffect.includes('pulse') && (
        <div className={`absolute inset-0 ${screenEffect} animate-in fade-in duration-1000`}></div>
      )}
      
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-float-up opacity-0"
          style={{
            left: `${p.x}%`,
            bottom: '-10%',
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .animate-float-up { animation-name: float-up; animation-timing-function: ease-out; animation-fill-mode: forwards; }
        .animate-pulse-fast { animation: pulse-fast 0.6s infinite; }
      `}</style>
    </div>
  );
};
