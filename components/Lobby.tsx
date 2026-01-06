
import React, { useState } from 'react';
import { RoomState, UserProfile } from '../types';
import { GAMES } from '../constants';
import { Share2, ArrowLeft, Gamepad2, Coins, Copy, Check, Zap } from 'lucide-react';

interface LobbyProps {
  room: RoomState;
  user: UserProfile;
  onBack: () => void;
  onStartGame: (id: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ room, user, onBack, onStartGame }) => {
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomId}`;
    if (navigator.share) {
      navigator.share({ title: 'DuoPlay', text: `Código da sala: ${room.roomId}`, url: inviteUrl }).catch(() => copyToClipboard(inviteUrl));
    } else {
      copyToClipboard(inviteUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20}/></button>
        <div className="text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código da Sala</span>
          <div className="text-2xl font-black text-rose-600 tracking-tighter">{room.roomId}</div>
        </div>
        <button onClick={copyInviteLink} className="p-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
          {copied ? <Check size={20}/> : <Copy size={20}/>}
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between gap-4 relative overflow-hidden">
        {room.partnerConnected && <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none"></div>}
        
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-3xl shadow-md ring-2 ring-rose-500">{user.avatar}</div>
          <span className="text-[10px] font-bold text-slate-800">{user.name}</span>
        </div>
        
        <div className="flex-1 h-0.5 bg-slate-100 relative">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 ${room.partnerConnected ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500 animate-pulse'}`}>
            {room.partnerConnected ? <><Zap size={10} fill="white"/> Online</> : 'Aguardando...'}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 z-10">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md ring-2 transition-all ${room.partnerConnected ? 'bg-rose-100 ring-rose-500 scale-110' : 'bg-slate-50 ring-slate-100'}`}>
            {room.partnerConnected ? '💖' : '?'}
          </div>
          <span className="text-[10px] font-bold text-slate-400">{room.partnerName || 'Vazio'}</span>
        </div>
      </div>

      <button onClick={copyInviteLink} className={`w-full p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
        <Share2 size={20}/> {copied ? 'LINK COPIADO!' : 'CONVIDAR NAMORADA PELO LINK'}
      </button>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest ml-2 flex items-center gap-2"><Gamepad2 size={16}/> Mini Jogos do Parque</h3>
        <div className="grid grid-cols-1 gap-3 pb-20">
          {GAMES.map(game => (
            <button 
              key={game.id} 
              disabled={!room.partnerConnected} 
              onClick={() => onStartGame(game.id)} 
              className={`flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-left transition-all active:scale-[0.98] ${!room.partnerConnected ? 'opacity-50 grayscale' : 'hover:border-rose-200 shadow-md'}`}
            >
              <div className={`${game.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4`}>{game.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{game.title}</h4>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{game.category} • {game.avgDuration}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
