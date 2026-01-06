
import React, { useState, useEffect } from 'react';
import { X, Circle, Trophy, Heart } from 'lucide-react';

interface Props {
  bet: number;
  role: 'HOST' | 'PARTNER';
  remoteMove: any;
  onMove: (move: any) => void;
  onEnd: (result: 'WIN' | 'LOSS' | 'DRAW', bet: number) => void;
}

const TicTacToe: React.FC<Props> = ({ bet, role, remoteMove, onMove, onEnd }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winnerInfo, setWinnerInfo] = useState<{ symbol: string | null, type: 'WIN' | 'LOSS' | 'DRAW' } | null>(null);
  
  const mySymbol = role === 'HOST' ? 'X' : 'O';
  const partnerSymbol = role === 'HOST' ? 'O' : 'X';
  const isMyTurn = turn === mySymbol && !winnerInfo;

  useEffect(() => {
    if (remoteMove?.type === 'MOVE') {
      applyMove(remoteMove.index, partnerSymbol);
    } else if (remoteMove?.type === 'RESET') {
        resetBoard();
    }
  }, [remoteMove]);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.includes(null) ? null : 'DRAW';
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinnerInfo(null);
  }

  const applyMove = (i: number, symbol: string) => {
    if (board[i]) return;
    const nextBoard = [...board];
    nextBoard[i] = symbol;
    setBoard(nextBoard);
    
    const win = calculateWinner(nextBoard);
    if (win) {
      const result = win === 'DRAW' ? 'DRAW' : win === mySymbol ? 'WIN' : 'LOSS';
      setWinnerInfo({ symbol: win === 'DRAW' ? null : win, type: result });
      setTimeout(() => onEnd(result, bet), 3500);
    } else {
      setTurn(symbol === 'X' ? 'O' : 'X');
    }
  };

  const handleClick = (i: number) => {
    if (!isMyTurn || board[i] || winnerInfo) return;
    onMove({ type: 'MOVE', index: i });
    applyMove(i, mySymbol);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-indigo-50/20 p-6 relative overflow-hidden">
      {winnerInfo && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in zoom-in duration-500">
           {winnerInfo.type === 'WIN' ? (
             <>
                <div className="relative">
                    <Trophy size={100} className="text-yellow-500 mb-4 animate-bounce" />
                    <Heart size={40} className="absolute -top-2 -right-2 text-rose-500 fill-rose-500 animate-ping" />
                </div>
                <h2 className="text-4xl font-black text-indigo-900 uppercase italic">Você Venceu!</h2>
                <p className="text-indigo-500 font-bold mt-2">Ganhou {bet * 2} LoveCoins</p>
             </>
           ) : winnerInfo.type === 'LOSS' ? (
             <>
                <div className="text-8xl mb-4">😢</div>
                <h2 className="text-4xl font-black text-slate-800 uppercase italic">Perdeu...</h2>
                <p className="text-slate-500 font-bold mt-2">Sua namorada foi melhor!</p>
             </>
           ) : (
             <>
                <div className="text-8xl mb-4">🤝</div>
                <h2 className="text-4xl font-black text-slate-800 uppercase italic">Empate!</h2>
                <p className="text-slate-500 font-bold mt-2">Ninguém perdeu moedas.</p>
             </>
           )}
        </div>
      )}

      <div className="w-full max-w-xs mb-8">
        <div className="flex justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-sm border border-indigo-100 mb-4">
           <div className={`flex flex-col items-center p-3 rounded-2xl transition-all ${turn === 'X' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
              <X size={24} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase mt-1">Host</span>
           </div>
           <div className="text-center">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Rodada</div>
              <div className="text-2xl font-black text-indigo-900 leading-none">{turn}</div>
           </div>
           <div className={`flex flex-col items-center p-3 rounded-2xl transition-all ${turn === 'O' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 opacity-50'}`}>
              <Circle size={24} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase mt-1">Namorada</span>
           </div>
        </div>
        <div className={`text-center py-4 rounded-2xl font-black text-xs transition-all tracking-widest ${isMyTurn ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400'}`}>
          {isMyTurn ? 'SUA VEZ DE JOGAR! 🔥' : 'AGUARDE ELA JOGAR...'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs p-4 bg-white/60 rounded-[3rem] shadow-2xl border border-white backdrop-blur-sm">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!isMyTurn || !!square}
            className={`h-24 rounded-[2rem] bg-white shadow-sm border-2 flex items-center justify-center transition-all ${
              square === 'X' ? 'border-purple-200 text-purple-600 bg-purple-50/30' : 
              square === 'O' ? 'border-rose-200 text-rose-500 bg-rose-50/30' : 
              isMyTurn ? 'border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 active:scale-90' : 'border-transparent opacity-60'
            }`}
          >
            {square === 'X' && <X size={48} strokeWidth={4} className="animate-in zoom-in-50 duration-300" />}
            {square === 'O' && <Circle size={40} strokeWidth={4} className="animate-in zoom-in-50 duration-300" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TicTacToe;
