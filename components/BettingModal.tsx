
import React, { useState } from 'react';
import { Coins, X, Check } from 'lucide-react';

interface BettingModalProps {
  maxCoins: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

const BettingModal: React.FC<BettingModalProps> = ({ maxCoins, onConfirm, onCancel }) => {
  const [bet, setBet] = useState(50);
  const options = [0, 50, 100, 250, 500];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-yellow-400 p-8 text-center text-yellow-950 relative">
          <button onClick={onCancel} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full"><X size={20}/></button>
          <Coins className="mx-auto mb-4" size={48} />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Hora da Aposta!</h3>
          <p className="text-sm font-bold opacity-80">Quanto deseja apostar nesta partida?</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-black text-slate-800 mb-1 flex items-center justify-center gap-2">
              <span className="text-yellow-500">$</span>
              {bet}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">LoveCoins em Jogo</div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-8">
            {options.map(opt => (
              <button 
                key={opt}
                onClick={() => setBet(Math.min(opt, maxCoins))}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${bet === opt ? 'bg-yellow-400 border-yellow-500 text-yellow-950 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                {opt === 0 ? 'Livre' : opt}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm(bet)}
              className="flex-[2] py-4 bg-yellow-400 text-yellow-950 font-bold rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Check size={20} strokeWidth={3} />
              Confirmar
            </button>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 font-bold mt-6 uppercase tracking-wider">
            Saldo Atual: <span className="text-yellow-600">{maxCoins} LoveCoins</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BettingModal;
