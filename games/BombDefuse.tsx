
import React, { useState, useEffect } from 'react';
import { Bomb, Scissors, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

const WIRE_COLORS = [
  { id: 'red', color: 'bg-red-600', label: 'Vermelho' },
  { id: 'blue', color: 'bg-blue-600', label: 'Azul' },
  { id: 'green', color: 'bg-green-600', label: 'Verde' },
  { id: 'yellow', color: 'bg-yellow-500', label: 'Amarelo' }
];

const BombDefuse: React.FC<{ role: 'HOST' | 'PARTNER', bet: number, remoteMove: any, onMove: (m: any) => void, onEnd: (r: 'WIN' | 'LOSS' | 'DRAW', b: number) => void }> = ({ role, bet, remoteMove, onMove, onEnd }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState<'PLAYING' | 'BOOM' | 'DEFUSED'>('PLAYING');

  // Inicialização (Apenas Host gera a sequência)
  useEffect(() => {
    if (role === 'HOST') {
      const newSeq = [...WIRE_COLORS].sort(() => Math.random() - 0.5).map(w => w.id);
      setSequence(newSeq);
      // Envia a sequência para o parceiro
      setTimeout(() => onMove({ type: 'INIT_BOMB', sequence: newSeq }), 500);
    }
  }, [role]);

  // Escuta comandos remotos
  useEffect(() => {
    if (!remoteMove) return;
    if (remoteMove.type === 'INIT_BOMB') {
      setSequence(remoteMove.sequence);
    } else if (remoteMove.type === 'WIRE_CUT') {
      processCut(remoteMove.wireId);
    }
  }, [remoteMove]);

  // Timer
  useEffect(() => {
    if (status !== 'PLAYING' || sequence.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleGameOver('BOOM');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, sequence]);

  const processCut = (wireId: string) => {
    if (status !== 'PLAYING') return;
    
    if (wireId === sequence[currentStep]) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep === sequence.length) {
        handleGameOver('DEFUSED');
      }
    } else {
      handleGameOver('BOOM');
    }
  };

  const handleCut = (wireId: string) => {
    if (role !== 'PARTNER' || status !== 'PLAYING') return;
    onMove({ type: 'WIRE_CUT', wireId });
    processCut(wireId);
  };

  const handleGameOver = (finalStatus: 'BOOM' | 'DEFUSED') => {
    setStatus(finalStatus);
    setTimeout(() => {
      onEnd(finalStatus === 'DEFUSED' ? 'WIN' : 'LOSS', bet);
    }, 3000);
  };

  if (status === 'BOOM') return (
    <div className="h-full flex flex-col items-center justify-center bg-red-950 text-white p-10 text-center animate-in fade-in duration-700">
      <div className="text-9xl mb-6 animate-bounce">💥</div>
      <h2 className="text-6xl font-black uppercase italic mb-4">CABUM!</h2>
      <p className="text-xl opacity-80">A comunicação falhou e a bomba explodiu.</p>
    </div>
  );

  if (status === 'DEFUSED') return (
    <div className="h-full flex flex-col items-center justify-center bg-green-600 text-white p-10 text-center animate-in zoom-in duration-500">
      <div className="bg-white/20 p-8 rounded-full mb-6">
        <CheckCircle2 size={120} className="text-white" />
      </div>
      <h2 className="text-5xl font-black uppercase mb-4">SALVOS!</h2>
      <p className="text-xl">Vocês são o casal mais entrosado do mundo!</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
      <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${timeLeft < 15 ? 'bg-red-500 animate-ping' : 'bg-red-500/20'}`}>
            <Bomb className="text-red-500" />
          </div>
          <span className={`text-4xl font-mono font-black ${timeLeft < 15 ? 'text-red-500' : 'text-white'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase">Progresso</div>
          <div className="flex gap-1 mt-1">
             {sequence.map((_, i) => (
               <div key={i} className={`w-3 h-3 rounded-full ${i < currentStep ? 'bg-green-500' : 'bg-slate-700'}`}></div>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        {role === 'HOST' ? (
          <div className="bg-white rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
             <div className="flex items-center gap-3 mb-6">
                <FileText className="text-indigo-600" />
                <h3 className="text-2xl font-black text-slate-800 uppercase italic">Manual de Desarme</h3>
             </div>
             <p className="text-slate-500 mb-8 font-medium">Instrua seu parceiro a cortar os fios nesta <span className="text-indigo-600 font-bold">ordem exata</span>:</p>
             <div className="space-y-4">
                {sequence.map((id, i) => {
                  const wire = WIRE_COLORS.find(w => w.id === id);
                  const isDone = i < currentStep;
                  return (
                    <div key={id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isDone ? 'bg-slate-50 border-slate-100 opacity-30 scale-95' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-black">{i + 1}</div>
                      <div className={`flex-1 h-6 rounded-full ${wire?.color} shadow-inner`}></div>
                      <span className="font-black text-slate-800 uppercase text-xs">{wire?.label}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-white uppercase mb-2">Corte os Fios!</h3>
                <p className="text-slate-400">Seu parceiro tem o manual. Ouça-o com atenção.</p>
             </div>
             <div className="w-full max-w-xs space-y-6">
                {WIRE_COLORS.map(wire => (
                  <button
                    key={wire.id}
                    onClick={() => handleCut(wire.id)}
                    className="group relative w-full h-16"
                  >
                    <div className={`absolute inset-0 ${wire.color} rounded-2xl shadow-lg transform group-active:scale-95 transition-all flex items-center justify-center`}>
                       <Scissors className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-black/20"></div>
                  </button>
                ))}
             </div>
             <div className="mt-12 flex items-center gap-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <AlertTriangle className="text-red-500" />
                <span className="text-xs text-red-200 font-bold uppercase">Um erro e a bomba explode!</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BombDefuse;
