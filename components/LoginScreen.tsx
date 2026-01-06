
import React, { useState } from 'react';
import { Heart, Lock, User, ArrowRight, UserCheck } from 'lucide-react';
import { UserProfile, UserGender } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [gender, setGender] = useState<UserGender>('NAMORADO');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) {
      setError('Nome muito curto');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN deve ter 4 dígitos');
      return;
    }

    const accountsKey = 'duoplay_accounts_v2';
    const accounts: UserProfile[] = JSON.parse(localStorage.getItem(accountsKey) || '[]');
    const existingAccount = accounts.find(acc => acc.name.toLowerCase() === name.toLowerCase());

    if (existingAccount) {
      if (existingAccount.password === pin) {
        onLogin({ ...existingAccount, gender }); // Atualiza gênero na sessão
      } else {
        setError('PIN incorreto para este usuário');
      }
    } else {
      const newAccount: UserProfile = {
        name,
        password: pin,
        avatar: gender === 'NAMORADO' ? '👦' : '👧',
        gender,
        coins: 1000,
        // Added byGame property to match UserProfile stats definition
        stats: { wins: 0, losses: 0, draws: 0, byGame: {} }
      };
      accounts.push(newAccount);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      onLogin(newAccount);
    }
  };

  return (
    <div className="fixed inset-0 bg-rose-50 flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500 py-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-rose-500 rounded-[2rem] shadow-xl shadow-rose-200 mb-2 animate-bounce">
            <Heart className="text-white fill-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">DuoPlay</h1>
          <p className="text-slate-600 font-medium">Sua diversão em dupla começa aqui</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Seu Nome"
                value={name}
                onChange={(e) => {setName(e.target.value); setError('');}}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-300 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password"
                placeholder="PIN (4 dígitos)"
                maxLength={4}
                inputMode="numeric"
                value={pin}
                onChange={(e) => {setPin(e.target.value.replace(/\D/g, '')); setError('');}}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-rose-300 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-900 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Eu sou...</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setGender('NAMORADO')}
                  className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${gender === 'NAMORADO' ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  👦 Namorado
                </button>
                <button 
                  type="button"
                  onClick={() => setGender('NAMORADA')}
                  className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${gender === 'NAMORADA' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  👧 Namorada
                </button>
              </div>
            </div>
          </div>

          {error && <div className="text-rose-500 text-xs font-bold text-center">{error}</div>}

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Entrar no Parque <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
          Novos usuários serão registrados automaticamente.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
