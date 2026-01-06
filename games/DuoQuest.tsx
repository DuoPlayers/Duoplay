
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Move, ArrowRight, UserCheck } from 'lucide-react';

const DuoQuest: React.FC<{ role: 'HOST' | 'PARTNER', remoteMove: any, onMove: (m: any) => void }> = ({ role, remoteMove, onMove }) => {
  const [myPos, setMyPos] = useState({ x: 20, y: 320 });
  const [partnerPos, setPartnerPos] = useState({ x: 20, y: 320 });
  const [buttonActive, setButtonActive] = useState(false);
  const [leverActive, setLeverActive] = useState(false);
  const [gameState, setGameState] = useState<'PLAYING' | 'WIN'>('PLAYING');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Botão 1: No chão para o Player 1 (Namorado)
  // Alavanca 2: No alto para Player 2 (Namorada)
  
  useEffect(() => {
    if (remoteMove?.type === 'MOVE') {
      setPartnerPos(remoteMove.pos);
      setButtonActive(remoteMove.btn);
      setLeverActive(remoteMove.lvr);
    } else if (remoteMove?.type === 'WIN') {
      setGameState('WIN');
    }
  }, [remoteMove]);

  const move = (dx: number, dy: number) => {
    if (gameState !== 'PLAYING') return;
    
    setMyPos(prev => {
      const nextX = Math.max(10, Math.min(320, prev.x + dx));
      const nextY = Math.max(50, Math.min(330, prev.y + dy));
      
      // Lógica de Colisão Simples e Ativação
      const isOverButton = nextX > 100 && nextX < 140 && nextY > 300;
      const isOverLever = nextX > 250 && nextX < 290 && nextY < 150;
      
      const newBtn = role === 'HOST' ? isOverButton : buttonActive;
      const newLvr = role === 'PARTNER' ? isOverLever : leverActive;

      onMove({ type: 'MOVE', pos: { x: nextX, y: nextY }, btn: newBtn, lvr: newLvr });
      
      // Vitória
      if (nextX > 300 && nextY > 300 && (buttonActive || leverActive)) {
        onMove({ type: 'WIN' });
        setGameState('WIN');
      }

      return { x: nextX, y: nextY };
    });
  };

  return (
    <div className="h-full flex flex-col bg-cyan-950 p-4 select-none">
      <div className="flex-1 relative bg-cyan-900 rounded-[2rem] border-4 border-cyan-800 overflow-hidden shadow-2xl">
        {/* Porta Controlada pelo Botão */}
        <div className={`absolute top-[250px] left-[180px] w-4 bg-yellow-500 transition-all duration-500 ${buttonActive ? 'h-0' : 'h-100'}`}></div>
        
        {/* Botão no Chão */}
        <div className={`absolute bottom-4 left-[110px] w-10 h-2 transition-all ${buttonActive ? 'bg-green-500 scale-y-50' : 'bg-red-500'}`}></div>
        
        {/* Alavanca */}
        <div className={`absolute top-20 left-[260px] w-6 h-6 rounded-full ${leverActive ? 'bg-green-400' : 'bg-slate-400'}`}></div>

        {/* Portal de Saída */}
        <div className="absolute bottom-4 right-4 w-12 h-16 bg-pink-500/20 rounded-t-full border-4 border-pink-500 flex items-center justify-center animate-pulse">
          <Heart size={20} className="text-pink-500 fill-pink-500" />
        </div>

        {/* Player 1 (Namorado) */}
        <div 
          className="absolute w-8 h-8 flex items-center justify-center text-xl transition-all duration-100 z-20"
          style={{ left: role === 'HOST' ? myPos.x : partnerPos.x, top: role === 'HOST' ? myPos.y : partnerPos.y }}
        >
          👦
        </div>

        {/* Player 2 (Namorada) */}
        <div 
          className="absolute w-8 h-8 flex items-center justify-center text-xl transition-all duration-100 z-20"
          style={{ left: role === 'PARTNER' ? myPos.x : partnerPos.x, top: role === 'PARTNER' ? myPos.y : partnerPos.y }}
        >
          👧
        </div>

        {gameState === 'WIN' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50 animate-in zoom-in">
             <Heart size={60} className="text-pink-500 fill-pink-500 mb-4 animate-bounce" />
             <h2 className="text-3xl font-black">QUEST CONCLUÍDA!</h2>
             <p className="text-cyan-400 font-bold">Vocês formam um ótimo time!</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6 max-w-[200px] mx-auto">
        <div />
        <button onClick={() => move(0, -30)} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white active:bg-white/30"><Move size={24} className="rotate-0" /></button>
        <div />
        <button onClick={() => move(-30, 0)} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white active:bg-white/30"><Move size={24} className="-rotate-90" /></button>
        <button onClick={() => move(0, 30)} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white active:bg-white/30"><Move size={24} className="rotate-180" /></button>
        <button onClick={() => move(30, 0)} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white active:bg-white/30"><Move size={24} className="rotate-90" /></button>
      </div>
      
      <p className="text-center text-[10px] text-cyan-500 font-black uppercase mt-4 tracking-widest">
        Dica: {role === 'HOST' ? 'Fique no botão vermelho' : 'Ative a alavanca no topo'}
      </p>
    </div>
  );
};

export default DuoQuest;
