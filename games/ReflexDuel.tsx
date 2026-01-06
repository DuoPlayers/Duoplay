
import React, { useState, useEffect, useRef } from 'react';
// Added Coins to imports from lucide-react
import { Zap, Timer, MousePointer2, Coins } from 'lucide-react';

interface Props {
  bet: number;
  role: 'HOST' | 'PARTNER';
  remoteMove: any;
  onMove: (move: any) => void;
  onEnd: (result: 'WIN' | 'LOSS' | 'DRAW', bet: number) => void;
}

const ReflexDuel: React.FC<Props> = ({ bet, role, remoteMove, onMove, onEnd }) => {
  const [state, setState] = useState<'IDLE' | 'WAITING' | 'READY' | 'RESULTS'>('IDLE');
  const [msg, setMsg] = useState('Toque para iniciar o duelo!');
  const [startTime, setStartTime] = useState(0);
  const [myReactionTime, setMyReactionTime] = useState<number | null>(null);
  const [partnerReactionTime, setPartnerReactionTime] = useState<number | null>(null);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (remoteMove?.type === 'START_ROUND') {
      startWaiting();
    } else if (remoteMove?.type === 'GO_NOW') {
      goReady();
    } else if (remoteMove?.type === 'CLICK_ACTION') {
      handlePartnerClick(remoteMove.time);
    } else if (remoteMove?.type === 'FOULED') {
        handleFoul('PARTNER');
    }
  }, [remoteMove]);

  const startWaiting = () => {
    setState('WAITING');
    setMyReactionTime(null);
    setPartnerReactionTime(null);
    setMsg('Prepare-se...');
    
    if (role === 'HOST') {
      const delay = 2500 + Math.random() * 3500;
      timerRef.current = window.setTimeout(() => {
        onMove({ type: 'GO_NOW' });
        goReady();
      }, delay);
    }
  };

  const goReady = () => {
    setState('READY');
    setMsg('AGORA!!!');
    setStartTime(Date.now());
  };

  const handlePartnerClick = (partnerTime: number) => {
    setPartnerReactionTime(partnerTime);
    checkWinner(myReactionTime, partnerTime);
  };

  const handleFoul = (who: 'ME' | 'PARTNER') => {
      setState('RESULTS');
      if (who === 'ME') {
          setMsg('Você queimou a largada! ❌');
          onMove({ type: 'FOULED' });
          setTimeout(() => onEnd('LOSS', bet), 2500);
      } else {
          setMsg('Ela queimou a largada! 🎉');
          setTimeout(() => onEnd('WIN', bet), 2500);
      }
  };

  const checkWinner = (me: number | null, partner: number | null) => {
      if (me !== null && partner !== null) {
          setState('RESULTS');
          if (me < partner) {
              setMsg(`VOCÊ GANHOU! (${me}ms) 🎉`);
              setTimeout(() => onEnd('WIN', bet), 3000);
          } else if (me > partner) {
              setMsg(`ELA FOI MAIS RÁPIDA! (${partner}ms)`);
              setTimeout(() => onEnd('LOSS', bet), 3000);
          } else {
              setMsg('EMPATE ABSURDO!');
              setTimeout(() => onEnd('DRAW', bet), 3000);
          }
      }
  };

  const handleTap = () => {
    if (state === 'IDLE') {
      if (role === 'HOST') {
        onMove({ type: 'START_ROUND' });
        startWaiting();
      } else {
        setMsg('Aguardando o Host iniciar...');
      }
    } else if (state === 'WAITING') {
      handleFoul('ME');
    } else if (state === 'READY') {
      const time = Date.now() - startTime;
      setMyReactionTime(time);
      onMove({ type: 'CLICK_ACTION', time });
      setMsg(`Seu tempo: ${time}ms`);
      
      if (partnerReactionTime !== null) {
          checkWinner(time, partnerReactionTime);
      } else {
          setMsg('Aguardando o tempo dela...');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        onClick={handleTap}
        className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer select-none active:opacity-80 ${
          state === 'IDLE' ? 'bg-indigo-600' :
          state === 'WAITING' ? 'bg-rose-600' :
          state === 'READY' ? 'bg-green-500' : 'bg-slate-900'
        }`}
      >
        <div className={`p-12 rounded-[2.5rem] mb-10 border-4 border-white/20 transition-all transform ${state === 'READY' ? 'bg-white/30 scale-125 rotate-12 shadow-2xl' : 'bg-white/5'}`}>
          {state === 'READY' ? <Zap size={100} className="text-white fill-white animate-pulse" /> : 
           state === 'WAITING' ? <Timer size={100} className="text-white animate-spin-slow" /> :
           <MousePointer2 size={100} className="text-white/50" />}
        </div>
        
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight max-w-xs drop-shadow-lg">
                {msg}
            </h2>
            {state === 'IDLE' && role === 'PARTNER' && (
                <div className="bg-white/10 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <p className="text-white/70 font-black uppercase tracking-widest text-[10px]">Aguardando Host</p>
                </div>
            )}
        </div>

        {state === 'RESULTS' && (
            <div className="mt-12 flex gap-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <span className="block text-[8px] font-black text-white/40 uppercase mb-1">Você</span>
                    <span className="text-xl font-bold text-white">{myReactionTime ? `${myReactionTime}ms` : '---'}</span>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                    <span className="block text-[8px] font-black text-white/40 uppercase mb-1">Namorada</span>
                    <span className="text-xl font-bold text-white">{partnerReactionTime ? `${partnerReactionTime}ms` : '---'}</span>
                </div>
            </div>
        )}
      </div>
      <div className="bg-yellow-400 py-6 text-center border-t-4 border-yellow-500 shadow-[0_-10px_30px_rgba(234,179,8,0.2)]">
         <div className="flex items-center justify-center gap-2">
            <Coins className="text-yellow-950" size={18} />
            <span className="font-black text-yellow-950 uppercase italic text-lg tracking-tighter">Prêmio: {bet > 0 ? bet * 2 : 'Amor'} Coins</span>
         </div>
      </div>
      <style>{`
          .animate-spin-slow {
              animation: spin 3s linear infinite;
          }
          @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
      `}</style>
    </div>
  );
};

export default ReflexDuel;
