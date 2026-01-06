
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, X, Radio, Zap } from 'lucide-react';
import { TRACKS } from '../constants';

interface MusicPlayerProps {
  onSync: (state: any) => void;
  remoteSync: any;
  isMaster: boolean;
  active: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onSync, remoteSync, isMaster, active }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Sincronização Mirror V12
  useEffect(() => {
    if (remoteSync && !isMaster && active) {
      if (remoteSync.type === 'PLAY') {
        setIsPlaying(true);
        if (audioRef.current && remoteSync.time !== undefined) {
          if (Math.abs(audioRef.current.currentTime - remoteSync.time) > 1.5) {
            audioRef.current.currentTime = remoteSync.time;
          }
        }
      } else if (remoteSync.type === 'PAUSE') {
        setIsPlaying(false);
      } else if (remoteSync.type === 'CHANGE') {
        setCurrentTrackIndex(remoteSync.index);
        setIsPlaying(true);
      } else if (remoteSync.type === 'HEARTBEAT') {
        if (audioRef.current && Math.abs(audioRef.current.currentTime - remoteSync.time) > 2.5) {
           audioRef.current.currentTime = remoteSync.time;
        }
        if (remoteSync.index !== currentTrackIndex) setCurrentTrackIndex(remoteSync.index);
      }
    }
  }, [remoteSync, isMaster, active, currentTrackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && audioUnlocked) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, audioUnlocked]);

  // Heartbeat do Host a cada 3s
  useEffect(() => {
    if (!isMaster || !isPlaying || !active) return;
    const beat = setInterval(() => {
      if (audioRef.current) {
        onSync({ type: 'HEARTBEAT', time: audioRef.current.currentTime, index: currentTrackIndex });
      }
    }, 3000);
    return () => clearInterval(beat);
  }, [isMaster, isPlaying, currentTrackIndex, active]);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        setAudioUnlocked(true);
        if (isPlaying) audioRef.current?.play();
      }).catch(console.error);
    }
  };

  const handleToggle = () => {
    if (!audioUnlocked) { unlockAudio(); return; }
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (isMaster) {
      onSync({ type: newState ? 'PLAY' : 'PAUSE', time: audioRef.current?.currentTime });
    }
  };

  const handleNext = () => {
    if (!isMaster) return;
    const next = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(next);
    setIsPlaying(true);
    onSync({ type: 'CHANGE', index: next });
  };

  const handlePrev = () => {
    if (!isMaster) return;
    const prev = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prev);
    setIsPlaying(true);
    onSync({ type: 'CHANGE', index: prev });
  };

  return (
    <>
      <div className={`fixed bottom-24 right-6 z-[100] transition-all duration-500 transform ${isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-20 scale-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border border-white/10 w-72">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-white">
                <Radio size={14} className="text-rose-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">DuoPlayer {isMaster ? "👑" : "📡"}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={18}/></button>
           </div>
           
           {!audioUnlocked && (
              <button onClick={unlockAudio} className="w-full mb-4 bg-rose-500 text-white py-3 rounded-2xl font-black text-[10px] animate-bounce shadow-lg flex items-center justify-center gap-2">
                <Zap size={14} fill="white" /> ATIVAR SOM SINCRONIZADO
              </button>
           )}

           <div className="bg-white/5 rounded-3xl p-4 mb-5 text-center border border-white/5">
              <div className="text-white font-bold text-sm truncate">{currentTrack.title}</div>
              <div className="text-slate-500 text-[10px] font-medium mb-3">{currentTrack.artist}</div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(audioRef.current?.currentTime || 0) / (audioRef.current?.duration || 1) * 100}%` }}></div>
              </div>
           </div>

           <div className="flex items-center justify-center gap-8 text-white">
              <button onClick={handlePrev} className={`active:scale-90 transition-all ${!isMaster ? 'opacity-20 cursor-not-allowed' : 'opacity-70'}`}><SkipBack size={24}/></button>
              <button onClick={handleToggle} className="bg-rose-500 p-5 rounded-full shadow-lg active:scale-90 transition-all">
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="translate-x-0.5" />}
              </button>
              <button onClick={handleNext} className={`active:scale-90 transition-all ${!isMaster ? 'opacity-20 cursor-not-allowed' : 'opacity-70'}`}><SkipForward size={24}/></button>
           </div>
           
           <audio 
             ref={audioRef} 
             src={currentTrack.url} 
             onEnded={handleNext}
             onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
             preload="auto"
             crossOrigin="anonymous"
           />
           
           {!isMaster && (
             <p className="text-center text-[8px] text-slate-500 font-bold uppercase mt-4 tracking-widest">Sincronizado com o Host</p>
           )}
        </div>
      </div>

      <button onClick={() => setIsOpen(true)} className={`fixed bottom-28 right-6 w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl z-[90] border-2 border-white/10 ${isPlaying ? 'animate-pulse' : ''}`}>
        <Music size={24} className={isPlaying ? "animate-spin-slow" : ""} />
        {!audioUnlocked && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black">!</div>}
      </button>

      <style>{`
        .animate-spin-slow { animation: spin 5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default MusicPlayer;
