
import React, { useState, useEffect, useRef } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { UserProfile, RoomState, NetworkConfig } from './types';
import { GAMES } from './constants';
import GameGrid from './components/GameGrid';
import Lobby from './components/Lobby';
import JoinRoomModal from './components/JoinRoomModal';
import EditProfileModal from './components/EditProfileModal';
import LoginScreen from './components/LoginScreen';
import MusicPlayer from './components/MusicPlayer';
import { LoveAnimations } from './components/LoveAnimations';
import TruthOrDare from './games/TruthOrDare';
import CouplePoly from './games/CouplePoly';
import BuzzerQuiz from './games/BuzzerQuiz';
import DuoBingo from './games/Bingo';
import DuoQuest from './games/DuoQuest';
import DuoUno from './games/Uno';
import { Heart, Coins, ArrowLeft, LogOut, Edit, Send, Wifi, WifiOff, Trophy, Swords, Scale } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const active = sessionStorage.getItem('duoplay_active_user');
    return active ? JSON.parse(active) : null;
  });

  // Usando Variáveis de Ambiente VITE_ ou os valores padrão para facilitar o seu deploy
  const [network] = useState<NetworkConfig>({ 
    // Fix: Using process.env instead of import.meta.env to resolve TS error in the execution environment
    supabaseUrl: (process.env as any).VITE_SUPABASE_URL || 'https://zbvezafcmpeuzgsmidt.supabase.co', 
    // Fix: Using process.env instead of import.meta.env to resolve TS error in the execution environment
    supabaseKey: (process.env as any).VITE_SUPABASE_KEY || 'sb_publishable_whLbljSn8oCVjOkfGKrXDg_j2U0VPKw', 
    isEnabled: true 
  });

  const [view, setView] = useState<'HOME' | 'LOBBY' | 'GAME' | 'PROFILE'>('HOME');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [partner, setPartner] = useState<{name: string, avatar: string, gender?: any, lastSeen: number} | null>(null);
  const [netStatus, setNetStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [remoteGameMove, setRemoteGameMove] = useState<any>(null);
  const [remoteMusicSync, setRemoteMusicSync] = useState<any>(null);
  const [loveTrigger, setLoveTrigger] = useState<string | null>(null);
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [donateValue, setDonateValue] = useState('');

  const supabaseRef = useRef<any>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (network.isEnabled) {
      supabaseRef.current = createClient(network.supabaseUrl, network.supabaseKey);
    }
  }, [network]);

  useEffect(() => {
    const pTimer = setInterval(() => {
      if (partner && Date.now() - partner.lastSeen > 12000) {
        setPartner(null);
      }
    }, 5000);
    return () => clearInterval(pTimer);
  }, [partner]);

  useEffect(() => {
    if (!room) {
      setNetStatus('DISCONNECTED');
      return;
    }
    
    setNetStatus('CONNECTING');
    const channelName = `duoplay_v12_prod_${room.roomId}`;
    
    if (supabaseRef.current) {
      const channel = supabaseRef.current.channel(channelName, { 
        config: { broadcast: { self: false, ack: true } } 
      });

      channel
        .on('broadcast', { event: 'msg' }, ({ payload }: any) => {
          if (payload.type === 'HANDSHAKE_REQ') {
            if (room.role === 'HOST') sendPresence();
          } else if (payload.type === 'PRESENCE') {
            setPartner({ 
              name: payload.data.name, 
              avatar: payload.data.avatar, 
              gender: payload.data.gender, 
              lastSeen: Date.now() 
            });
          } else {
            processIncomingMessage(payload.type, payload.data);
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setNetStatus('CONNECTED');
            if (room.role === 'PARTNER') {
              sendMessage('HANDSHAKE_REQ', { from: user?.name });
            }
            sendPresence();
          }
        });
      channelRef.current = channel;
    }

    const presenceInterval = setInterval(sendPresence, 4000);
    return () => {
      clearInterval(presenceInterval);
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, [room?.roomId]);

  const sendPresence = () => {
    if (!room || !user || !channelRef.current) return;
    channelRef.current.send({ 
      type: 'broadcast', 
      event: 'msg', 
      payload: { type: 'PRESENCE', data: { name: user.name, avatar: user.avatar, gender: user.gender } } 
    });
  };

  const processIncomingMessage = (type: string, data: any) => {
    switch (type) {
      case 'DONATE_COINS': receiveCoins(data.amount); break;
      case 'START_GAME': setActiveGameId(data.gameId); setView('GAME'); break;
      case 'GAME_MOVE': setRemoteGameMove(data.move); break;
      case 'MUSIC_SYNC': setRemoteMusicSync(data.sync); break;
      case 'QUIT_GAME': setView('LOBBY'); setActiveGameId(null); break;
      case 'LOVE_ACTION': setLoveTrigger(data.type); break;
    }
  };

  const sendMessage = (type: string, data: any) => {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: 'msg', payload: { type, data } });
  };

  const donateCoins = () => {
    const amount = parseInt(donateValue);
    if (isNaN(amount) || amount <= 0 || !user || user.coins < amount) return;
    const updatedUser = { ...user, coins: user.coins - amount };
    updateUserGlobal(updatedUser);
    sendMessage('DONATE_COINS', { amount });
    setDonateValue('');
    setIsDonateOpen(false);
    setLoveTrigger('KISS');
  };

  const receiveCoins = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, coins: user.coins + amount };
    updateUserGlobal(updatedUser);
    setLoveTrigger('HEARTBEAT');
  };

  const updateUserGlobal = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    sessionStorage.setItem('duoplay_active_user', JSON.stringify(updatedUser));
    const accounts = JSON.parse(localStorage.getItem('duoplay_accounts_v2') || '[]');
    const idx = accounts.findIndex((a: any) => a.name === updatedUser.name);
    if (idx !== -1) {
       accounts[idx] = updatedUser;
       localStorage.setItem('duoplay_accounts_v2', JSON.stringify(accounts));
    }
  };

  const createRoom = () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom({ roomId: newId, partnerConnected: false, partnerName: null, currentBet: 0, isBetConfirmed: false, role: 'HOST' });
    setView('LOBBY');
  };

  const joinRoom = (id: string) => {
    setRoom({ roomId: id.toUpperCase(), partnerConnected: false, partnerName: null, currentBet: 0, isBetConfirmed: false, role: 'PARTNER' });
    setIsJoinModalOpen(false);
    setView('LOBBY');
  };

  const onGameEnd = (result: 'WIN' | 'LOSS' | 'DRAW', bet: number) => {
    if (!user || !activeGameId) return;
    let newCoins = user.coins;
    const newStats = { ...user.stats, byGame: { ...user.stats.byGame } };
    
    if (result === 'WIN') { newCoins += bet; newStats.wins += 1; }
    else if (result === 'LOSS') { newCoins -= bet; newStats.losses += 1; }
    else { newStats.draws += 1; }

    const gameStats = { ...(newStats.byGame[activeGameId] || { wins: 0, losses: 0 }) };
    if (result === 'WIN') gameStats.wins += 1;
    if (result === 'LOSS') gameStats.losses += 1;
    newStats.byGame[activeGameId] = gameStats;

    const updatedUser = { ...user, coins: newCoins, stats: newStats };
    updateUserGlobal(updatedUser);
    setTimeout(() => { setView('LOBBY'); setActiveGameId(null); }, 3000);
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen pb-6 pt-20 bg-[#fff5f6]">
      <LoveAnimations trigger={loveTrigger} onComplete={() => setLoveTrigger(null)} />
      
      <MusicPlayer 
        onSync={(s) => sendMessage('MUSIC_SYNC', { sync: s })} 
        remoteSync={remoteMusicSync} 
        isMaster={room?.role === 'HOST'}
        active={!!room}
      />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-rose-100 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2" onClick={() => setView('HOME')}>
          <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-200"><Heart className="text-white fill-white" size={18} /></div>
          <span className="font-black text-xl tracking-tighter text-slate-800">DuoPlay</span>
        </div>
        <div className="flex items-center gap-3">
          {room && (
            <div className={`p-2 rounded-full ${netStatus === 'CONNECTED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600 animate-pulse'}`}>
              {netStatus === 'CONNECTED' ? <Wifi size={14}/> : <WifiOff size={14}/>}
            </div>
          )}
          <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1.5 rounded-full border border-yellow-400/50">
            <Coins className="text-yellow-600" size={14} /><span className="font-black text-yellow-700 text-xs">{user.coins}</span>
          </div>
          <button onClick={() => setView('PROFILE')} className="w-10 h-10 bg-white border-2 border-rose-100 rounded-full flex items-center justify-center text-xl overflow-hidden shadow-sm">{user.avatar}</button>
        </div>
      </header>

      <main className="px-5 max-w-lg mx-auto">
        {view === 'HOME' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-indigo-600 to-rose-500 p-8 rounded-[3rem] text-white shadow-2xl">
              <h1 className="text-3xl font-black mb-1">Olá, {user.name}!</h1>
              <p className="opacity-80 text-sm mb-6 font-medium">Você é {user.gender === 'NAMORADO' ? 'o Namorado' : 'a Namorada'} 💖</p>
              <div className="flex gap-2">
                <button onClick={createRoom} className="flex-1 bg-white text-indigo-600 font-black py-4 rounded-2xl text-sm active:scale-95 transition-all shadow-xl">Criar Sala</button>
                <button onClick={() => setIsJoinModalOpen(true)} className="flex-1 bg-black/20 text-white font-black py-4 rounded-2xl border border-white/20 text-sm active:scale-95 transition-all">Entrar</button>
              </div>
            </div>
            <h2 className="text-lg font-black text-slate-800 ml-2">Mini Jogos 🎮</h2>
            <GameGrid games={GAMES} onSelectGame={(id) => room ? (setActiveGameId(id), sendMessage('START_GAME', { gameId: id })) : setIsJoinModalOpen(true)} />
          </div>
        )}

        {view === 'LOBBY' && room && (
          <div className="space-y-6">
            <Lobby 
              room={{...room, partnerConnected: !!partner, partnerName: partner?.name || null}} 
              user={user} 
              onBack={() => { setRoom(null); setPartner(null); setView('HOME'); }} 
              onStartGame={(id) => { setActiveGameId(id); sendMessage('START_GAME', { gameId: id }); setView('GAME'); }} 
            />
            {partner && (
               <button onClick={() => setIsDonateOpen(true)} className="w-full bg-yellow-400 text-yellow-950 py-5 rounded-3xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <Send size={18} /> Enviar Presente para {partner.name}
               </button>
            )}
          </div>
        )}

        {view === 'GAME' && (
          <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <button onClick={() => { sendMessage('QUIT_GAME', {}); setView('LOBBY'); setActiveGameId(null); }} className="p-3 bg-slate-100 rounded-2xl"><ArrowLeft size={24} /></button>
              <span className="font-black text-lg">{GAMES.find(g => g.id === activeGameId)?.title}</span>
              <div className="w-10"></div>
            </div>
            <div className="flex-1">
               {activeGameId === 'duo-uno' && <DuoUno bet={room?.currentBet || 0} role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} onEnd={onGameEnd} />}
               {activeGameId === 'duo-bingo' && <DuoBingo bet={room?.currentBet || 0} role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} onEnd={onGameEnd} />}
               {activeGameId === 'duo-quest' && <DuoQuest role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} />}
               {activeGameId === 'couple-poly' && <CouplePoly bet={room?.currentBet || 0} role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} onEnd={onGameEnd} />}
               {activeGameId === 'truth-dare' && <TruthOrDare role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} />}
               {activeGameId === 'buzzer-quiz' && <BuzzerQuiz bet={room?.currentBet || 0} role={room?.role || 'HOST'} remoteMove={remoteGameMove} onMove={(m) => sendMessage('GAME_MOVE', { move: m })} onEnd={onGameEnd} />}
            </div>
          </div>
        )}

        {view === 'PROFILE' && (
          <div className="flex flex-col items-center gap-6 py-6 animate-in slide-in-from-bottom-4">
             <div className="w-full flex justify-start">
               <button onClick={() => setView('HOME')} className="p-3 bg-white rounded-2xl border border-rose-100 shadow-sm"><ArrowLeft size={24}/></button>
             </div>
             
             <div className="relative">
               <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border-4 border-rose-500 ring-8 ring-rose-100">{user.avatar}</div>
               <button onClick={() => setIsEditProfileOpen(true)} className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full border-4 border-white shadow-lg"><Edit size={16}/></button>
             </div>
             
             <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{user.name}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full mt-2">
                  <Heart size={12} className="text-rose-500 fill-rose-500"/>
                  <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest">{user.gender}</span>
                </div>
             </div>

             <div className="w-full grid grid-cols-3 gap-3">
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                 <Trophy size={18} className="mx-auto mb-1 text-yellow-500" />
                 <div className="text-lg font-black">{user.stats.wins}</div>
                 <div className="text-[8px] font-black uppercase text-slate-400">Vitórias</div>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                 <Swords size={18} className="mx-auto mb-1 text-rose-500" />
                 <div className="text-lg font-black">{user.stats.losses}</div>
                 <div className="text-[8px] font-black uppercase text-slate-400">Derrotas</div>
               </div>
               <div className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                 <Scale size={18} className="mx-auto mb-1 text-indigo-500" />
                 <div className="text-lg font-black">{user.stats.draws}</div>
                 <div className="text-[8px] font-black uppercase text-slate-400">Empates</div>
               </div>
             </div>

             <div className="w-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Seu Histórico no Parque</h3>
                <div className="space-y-3">
                   {GAMES.map(g => {
                      const s = user.stats.byGame[g.id] || { wins: 0, losses: 0 };
                      return (
                        <div key={g.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                           <div className="flex items-center gap-3">
                              <span className="text-xl">{g.icon}</span>
                              <span className="text-xs font-bold text-slate-700">{g.title}</span>
                           </div>
                           <div className="flex gap-4">
                              <div className="text-center"><span className="text-[8px] font-black text-green-500 block">W</span><span className="font-black text-sm">{s.wins}</span></div>
                              <div className="text-center"><span className="text-[8px] font-black text-rose-500 block">L</span><span className="font-black text-sm">{s.losses}</span></div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>

             <button onClick={() => { sessionStorage.removeItem('duoplay_active_user'); setUser(null); }} className="w-full py-5 bg-rose-50 text-rose-600 font-black rounded-3xl flex items-center justify-center gap-2 mt-4"><LogOut size={20}/> Encerrar Sessão</button>
          </div>
        )}
      </main>

      {isDonateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-2 text-slate-800">Mimo de Amor 🎁</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">Quantas LoveCoins deseja doar?</p>
            <input 
              type="number"
              value={donateValue}
              onChange={(e) => setDonateValue(e.target.value)}
              placeholder="Ex: 500"
              className="w-full bg-slate-50 border-2 focus:border-yellow-400 rounded-2xl px-6 py-5 text-2xl font-black mb-8 outline-none transition-all"
            />
            <div className="flex gap-3">
               <button onClick={() => setIsDonateOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Voltar</button>
               <button onClick={donateCoins} className="flex-1 py-4 bg-yellow-400 text-yellow-950 font-black rounded-2xl shadow-lg shadow-yellow-100">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {isEditProfileOpen && <EditProfileModal currentName={user.name} currentAvatar={user.avatar} onSave={(n, a) => { updateUserGlobal({...user, name: n, avatar: a}); setIsEditProfileOpen(false); }} onCancel={() => setIsEditProfileOpen(false)} />}
      {isJoinModalOpen && <JoinRoomModal onJoin={joinRoom} onCancel={() => setIsJoinModalOpen(false)} />}
    </div>
  );
};

export default App;
