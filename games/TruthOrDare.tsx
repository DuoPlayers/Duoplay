
import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw, Send, HelpCircle, Swords } from 'lucide-react';

const TruthOrDare: React.FC<{ role: 'HOST' | 'PARTNER', remoteMove: any, onMove: (m: any) => void }> = ({ role, remoteMove, onMove }) => {
  const [gameState, setGameState] = useState<'IDLE' | 'TYPING' | 'READING'>('IDLE');
  const [selectedMode, setSelectedMode] = useState<'VERDADE' | 'DESAFIO' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [inputText, setInputText] = useState('');
  const [whoIsPlaying, setWhoIsPlaying] = useState<'HOST' | 'PARTNER'>('HOST');

  useEffect(() => {
    if (remoteMove?.type === 'MODE_SELECTED') {
      setSelectedMode(remoteMove.mode);
      setGameState('TYPING');
    } else if (remoteMove?.type === 'PROMPT_SENT') {
      setCurrentPrompt(remoteMove.text);
      setGameState('READING');
    } else if (remoteMove?.type === 'DONE') {
      resetTurn();
    }
  }, [remoteMove]);

  const selectMode = (mode: 'VERDADE' | 'DESAFIO') => {
    if (whoIsPlaying !== role) return;
    setSelectedMode(mode);
    setGameState('TYPING');
    onMove({ type: 'MODE_SELECTED', mode });
  };

  const sendPrompt = () => {
    if (!inputText.trim()) return;
    onMove({ type: 'PROMPT_SENT', text: inputText });
    setCurrentPrompt(inputText);
    setGameState('READING');
  };

  const resetTurn = () => {
    setWhoIsPlaying(prev => prev === 'HOST' ? 'PARTNER' : 'HOST');
    setGameState('IDLE');
    setSelectedMode(null);
    setCurrentPrompt('');
    setInputText('');
  };

  const completeAction = () => {
    onMove({ type: 'DONE' });
    resetTurn();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-rose-50">
      <div className="mb-8 text-center">
         <div className="text-[10px] font-black uppercase text-rose-400 tracking-widest mb-1">Turno de</div>
         <h2 className="text-2xl font-black text-slate-800">{whoIsPlaying === role ? "SUA VEZ!" : "PARCEIRO JOGANDO"}</h2>
      </div>

      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-8 border-4 border-white overflow-hidden min-h-[400px] flex flex-col justify-center">
        {gameState === 'IDLE' && (
          <div className="space-y-6 text-center animate-in fade-in">
             <Flame size={60} className="text-rose-500 mx-auto animate-pulse" />
             <p className="font-bold text-slate-500">O que você escolhe?</p>
             <div className="grid grid-cols-1 gap-4">
                <button onClick={() => selectMode('VERDADE')} disabled={whoIsPlaying !== role} className="py-5 bg-blue-500 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3">
                   <HelpCircle /> VERDADE
                </button>
                <button onClick={() => selectMode('DESAFIO')} disabled={whoIsPlaying !== role} className="py-5 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3">
                   <Swords /> DESAFIO
                </button>
             </div>
          </div>
        )}

        {gameState === 'TYPING' && (
           <div className="text-center animate-in slide-in-from-bottom-4">
              {whoIsPlaying === role ? (
                 <div className="space-y-4">
                    <p className="font-bold text-slate-400">Aguardando {selectedMode} do parceiro...</p>
                    <div className="w-16 h-1 bg-slate-100 mx-auto rounded-full overflow-hidden">
                       <div className="h-full bg-rose-500 w-1/2 animate-ping"></div>
                    </div>
                 </div>
              ) : (
                 <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800">
                       Parceiro escolheu <span className={selectedMode === 'VERDADE' ? 'text-blue-500' : 'text-orange-500'}>{selectedMode}</span>!
                    </h3>
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Escreva sua pergunta ou desafio de ${selectedMode}...`}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-medium outline-none h-32 focus:border-rose-300"
                    />
                    <button onClick={sendPrompt} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2">
                       ENVIAR <Send size={18} />
                    </button>
                 </div>
              )}
           </div>
        )}

        {gameState === 'READING' && (
           <div className="text-center animate-in zoom-in">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black text-white mb-6 inline-block ${selectedMode === 'VERDADE' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                 {selectedMode}
              </span>
              <p className="text-2xl font-black text-slate-800 mb-10 leading-tight">
                 "{currentPrompt}"
              </p>
              {whoIsPlaying === role && (
                 <button onClick={completeAction} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black shadow-lg shadow-green-100">
                    CONCLUÍDO! ✅
                 </button>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default TruthOrDare;
