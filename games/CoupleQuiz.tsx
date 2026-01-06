
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const QUESTIONS = [
  { q: 'Qual o prato favorito do seu parceiro?', options: ['Pizza', 'Japonês', 'Hambúrguer', 'Massas'] },
  { q: 'Qual a cor dos olhos do seu parceiro?', options: ['Castanhos', 'Azuis', 'Verdes', 'Pretos'] },
];

const CoupleQuiz: React.FC<{ role: 'HOST' | 'PARTNER', remoteMove: any, onMove: (m: any) => void }> = ({ role, remoteMove, onMove }) => {
  const [qIndex, setQIndex] = useState(0);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (remoteMove?.type === 'ANSWER') {
      setPartnerAnswer(remoteMove.answer);
    } else if (remoteMove?.type === 'NEXT_Q') {
      setQIndex(remoteMove.index);
      setMyAnswer(null);
      setPartnerAnswer(null);
    }
  }, [remoteMove]);

  const handleAnswer = (ans: string) => {
    if (myAnswer) return;
    setMyAnswer(ans);
    onMove({ type: 'ANSWER', answer: ans });
  };

  const handleNext = () => {
    if (role !== 'HOST') return;
    const next = (qIndex + 1) % QUESTIONS.length;
    onMove({ type: 'NEXT_Q', index: next });
    setQIndex(next);
    setMyAnswer(null);
    setPartnerAnswer(null);
  };

  const showResults = myAnswer && partnerAnswer;

  return (
    <div className="h-full flex flex-col p-6 bg-pink-50">
      <div className="bg-white p-6 rounded-[32px] shadow-sm mb-6 border border-pink-100 text-center">
        <Heart className="mx-auto text-pink-500 mb-2" size={32} />
        <h2 className="text-xl font-bold text-slate-800">{QUESTIONS[qIndex].q}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1">
        {QUESTIONS[qIndex].options.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className={`p-5 rounded-2xl font-bold transition-all text-left flex justify-between items-center ${
              myAnswer === opt ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-100'
            }`}
          >
            {opt}
            {showResults && partnerAnswer === opt && <span className="text-2xl">💖</span>}
          </button>
        ))}
      </div>

      {showResults && (
        <div className="mt-6 p-6 bg-white rounded-[32px] border-2 border-pink-200 animate-in zoom-in duration-300">
           <p className="text-center font-bold text-slate-500 uppercase text-xs mb-4">Respostas Reveladas!</p>
           <div className="flex justify-around gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div className="text-[10px] font-black uppercase text-slate-400">Você</div>
                <div className="font-bold text-slate-800">{myAnswer}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💖</div>
                <div className="text-[10px] font-black uppercase text-slate-400">Parceiro</div>
                <div className="font-bold text-slate-800">{partnerAnswer}</div>
              </div>
           </div>
           {role === 'HOST' && (
             <button onClick={handleNext} className="w-full mt-6 bg-pink-500 text-white py-4 rounded-xl font-bold">Próxima Pergunta</button>
           )}
        </div>
      )}
    </div>
  );
};

export default CoupleQuiz;
