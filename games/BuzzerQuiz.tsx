
import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Trophy, Timer } from 'lucide-react';

const QUESTIONS = [
  { q: "Qual o maior planeta do sistema solar?", options: ["Marte", "Vênus", "Júpiter", "Saturno"], correct: 2 },
  { q: "Quem pintou a Mona Lisa?", options: ["Van Gogh", "Da Vinci", "Picasso", "Dalí"], correct: 1 },
  { q: "Qual a capital da França?", options: ["Londres", "Berlim", "Roma", "Paris"], correct: 3 },
  { q: "Quantos continentes existem no mundo?", options: ["5", "6", "7", "4"], correct: 1 },
  { q: "Qual o elemento químico 'O'?", options: ["Ouro", "Oxigênio", "Ósmio", "Oliva"], correct: 1 },
];

const BuzzerQuiz: React.FC<{ role: 'HOST' | 'PARTNER', bet: number, remoteMove: any, onMove: (m: any) => void, onEnd: (r: 'WIN' | 'LOSS' | 'DRAW', b: number) => void }> = ({ role, bet, remoteMove, onMove, onEnd }) => {
  const [qIndex, setQIndex] = useState(0);
  const [buzzerPressedBy, setBuzzerPressedBy] = useState<string | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [status, setStatus] = useState<'IDLE' | 'BUZZED' | 'ANSWERED'>('IDLE');

  useEffect(() => {
    if (remoteMove?.type === 'BUZZ') {
      setBuzzerPressedBy(remoteMove.sender);
      setStatus('BUZZED');
    } else if (remoteMove?.type === 'SUBMIT_ANSWER') {
      processAnswer(remoteMove.isCorrect);
    } else if (remoteMove?.type === 'NEXT') {
      nextQuestion();
    }
  }, [remoteMove]);

  const handleBuzz = () => {
    if (status !== 'IDLE') return;
    onMove({ type: 'BUZZ', sender: role });
    setBuzzerPressedBy(role);
    setStatus('BUZZED');
  };

  const submitAnswer = (idx: number) => {
    if (buzzerPressedBy !== role) return;
    const isCorrect = idx === QUESTIONS[qIndex].correct;
    onMove({ type: 'SUBMIT_ANSWER', isCorrect });
    processAnswer(isCorrect);
  };

  const processAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScores(s => buzzerPressedBy === 'HOST' ? { ...s, p1: s.p1 + 10 } : { ...s, p2: s.p2 + 10 });
    }
    setStatus('ANSWERED');
    
    if (qIndex === QUESTIONS.length - 1) {
       setTimeout(() => {
          const result = scores.p1 > scores.p2 ? (role === 'HOST' ? 'WIN' : 'LOSS') : 
                         scores.p2 > scores.p1 ? (role === 'PARTNER' ? 'WIN' : 'LOSS') : 'DRAW';
          onEnd(result as any, bet);
       }, 3000);
    } else if (role === 'HOST') {
       setTimeout(() => {
          onMove({ type: 'NEXT' });
          nextQuestion();
       }, 2000);
    }
  };

  const nextQuestion = () => {
    setQIndex(prev => prev + 1);
    setBuzzerPressedBy(null);
    setStatus('IDLE');
  };

  return (
    <div className="h-full flex flex-col bg-amber-50 p-6">
      <div className="flex justify-between mb-8 bg-white p-4 rounded-[2rem] shadow-sm">
        <div className="text-center">
          <div className="text-[10px] font-black text-slate-400">HOST</div>
          <div className="text-xl font-black text-amber-600">{scores.p1}</div>
        </div>
        <div className="text-center px-4 border-x border-slate-100 flex items-center gap-2">
           <Timer size={14} className="text-slate-300" />
           <span className="font-bold text-slate-800">{qIndex + 1}/{QUESTIONS.length}</span>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-black text-slate-400">NAMORADA</div>
          <div className="text-xl font-black text-amber-600">{scores.p2}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-amber-200 text-center w-full">
           <h2 className="text-2xl font-black text-slate-800 leading-tight">{QUESTIONS[qIndex].q}</h2>
        </div>

        {status === 'IDLE' ? (
           <button 
             onClick={handleBuzz}
             className="w-40 h-40 bg-red-600 rounded-full shadow-[0_15px_0_rgb(153,27,27)] active:translate-y-2 active:shadow-none transition-all flex flex-col items-center justify-center text-white border-8 border-red-500"
           >
             <Bell size={48} fill="white" className="animate-pulse" />
             <span className="font-black text-xl mt-2">BUZZER!</span>
           </button>
        ) : (
           <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-amber-100 text-amber-800 px-6 py-2 rounded-full font-black uppercase text-xs mb-6">
                 {buzzerPressedBy === role ? "SUA VEZ DE RESPONDER!" : "ELA APERTOU PRIMEIRO!"}
              </div>
              <div className="grid grid-cols-1 gap-3 w-64">
                {QUESTIONS[qIndex].options.map((opt, i) => (
                  <button
                    key={i}
                    disabled={buzzerPressedBy !== role || status === 'ANSWERED'}
                    onClick={() => submitAnswer(i)}
                    className={`py-4 px-6 rounded-2xl font-bold transition-all ${
                      status === 'ANSWERED' && i === QUESTIONS[qIndex].correct ? 'bg-green-500 text-white' :
                      status === 'ANSWERED' && buzzerPressedBy === role && i !== QUESTIONS[qIndex].correct ? 'bg-red-500 text-white' :
                      'bg-white border-2 border-slate-100 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default BuzzerQuiz;
