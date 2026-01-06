
import React, { useState, useEffect } from 'react';
import { Trophy, Dice6, Check, Bell, Loader2 } from 'lucide-react';

const generateCard = () => {
  const card: number[] = [];
  while (card.length < 25) {
    const r = Math.floor(Math.random() * 75) + 1;
    if (card.indexOf(r) === -1) card.push(r);
  }
  return card;
};

const Bingo: React.FC<{ role: 'HOST' | 'PARTNER', bet: number, remoteMove: any, onMove: (m: any) => void, onEnd: (r: 'WIN' | 'LOSS' | 'DRAW', b: number) => void }> = ({ role, bet, remoteMove, onMove, onEnd }) => {
  const [card, setCard] = useState<number[]>([]);
  const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isBingoAvailable, setIsBingoAvailable] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PLAYING' | 'BINGO'>('IDLE');

  useEffect(() => {
    setCard(generateCard());
  }, []);

  useEffect(() => {
    if (remoteMove?.type === 'DRAW') {
      setDrawnNumbers(prev => [remoteMove.num, ...prev]);
    } else if (remoteMove?.type === 'BINGO_WIN') {
      setStatus('BINGO');
      setTimeout(() => onEnd(role === 'PARTNER' ? 'LOSS' : 'WIN', bet), 3000);
    } else if (remoteMove?.type === 'START') {
      setStatus('PLAYING');
    }
  }, [remoteMove]);

  useEffect(() => {
    // Verificar se tem Bingo (simplificado: 5 em linha ou cartela)
    const hasBingo = checkBingo();
    setIsBingoAvailable(hasBingo);
  }, [marked]);

  const checkBingo = () => {
    // Checa cartela cheia para ser um bingo real
    return marked.every(m => m === true);
  };

  const drawNumber = () => {
    if (role !== 'HOST' || status !== 'PLAYING') return;
    let nextNum;
    do {
      nextNum = Math.floor(Math.random() * 75) + 1;
    } while (drawnNumbers.includes(nextNum));
    
    onMove({ type: 'DRAW', num: nextNum });
    setDrawnNumbers(prev => [nextNum, ...prev]);
  };

  const markNumber = (val: number, idx: number) => {
    if (drawnNumbers.includes(val)) {
      const newMarked = [...marked];
      newMarked[idx] = true;
      setMarked(newMarked);
    }
  };

  const callBingo = () => {
    if (!isBingoAvailable) return;
    onMove({ type: 'BINGO_WIN' });
    setStatus('BINGO');
    onEnd('WIN', bet);
  };

  const startBingo = () => {
    onMove({ type: 'START' });
    setStatus('PLAYING');
  };

  return (
    <div className="h-full flex flex-col bg-orange-50 p-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm mb-4 border border-orange-100">
        <div className="text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase">Último Número</div>
          <div className="text-3xl font-black text-orange-600 animate-bounce">
            {drawnNumbers[0] || '--'}
          </div>
        </div>
        <div className="flex-1 px-4 overflow-x-auto">
          <div className="flex gap-2">
            {drawnNumbers.slice(1, 6).map((n, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                {n}
              </div>
            ))}
          </div>
        </div>
        {role === 'HOST' && status === 'PLAYING' && (
           <button onClick={drawNumber} className="bg-orange-500 text-white p-3 rounded-2xl active:scale-90 transition-all shadow-lg shadow-orange-200">
              <Dice6 size={24} />
           </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-5 gap-2 bg-white p-3 rounded-[2.5rem] shadow-xl border-4 border-orange-200">
        {card.map((val, i) => (
          <button
            key={i}
            onClick={() => markNumber(val, i)}
            className={`aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all ${
              marked[i] ? 'bg-orange-500 text-white shadow-inner scale-95' : 
              drawnNumbers.includes(val) ? 'bg-orange-100 text-orange-600 animate-pulse border-2 border-orange-300' : 
              'bg-slate-50 text-slate-800 border border-slate-100'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {status === 'IDLE' && role === 'HOST' && (
          <button onClick={startBingo} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">
            INICIAR BINGO
          </button>
        )}

        {status === 'PLAYING' && (
          <button 
            disabled={!isBingoAvailable}
            onClick={callBingo}
            className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
              isBingoAvailable ? 'bg-green-500 text-white animate-bounce' : 'bg-slate-200 text-slate-400 opacity-50'
            }`}
          >
            <Bell size={24} fill="currentColor" />
            BINGO!!!
          </button>
        )}

        {status === 'BINGO' && (
           <div className="text-center p-4 bg-green-100 text-green-700 rounded-2xl font-black animate-in zoom-in">
              🎉 BINGOOOOOOO! Finalizando...
           </div>
        )}
      </div>
    </div>
  );
};

export default Bingo;
