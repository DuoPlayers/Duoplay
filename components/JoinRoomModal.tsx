
import React, { useState } from 'react';
import { X, ArrowRight, Hash } from 'lucide-react';

interface JoinRoomModalProps {
  onJoin: (code: string) => void;
  onCancel: () => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onJoin, onCancel }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 4) {
      onJoin(code.toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 flex justify-between items-center border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Hash className="text-rose-500" size={20} />
            Entrar na Sala
          </h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <p className="text-slate-500 text-sm mb-6 text-center">
            Peça o código da sala para seu parceiro e digite-o abaixo:
          </p>
          
          <div className="relative mb-8">
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EX: A1B2C3"
              maxLength={8}
              autoFocus
              className="w-full bg-slate-100 border-2 border-transparent focus:border-rose-400 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-widest text-slate-800 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold"
            />
          </div>

          <button 
            type="submit"
            disabled={code.length < 4}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              code.length >= 4 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Entrar agora
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
