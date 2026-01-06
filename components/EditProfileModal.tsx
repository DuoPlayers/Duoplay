
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVATARS } from '../constants';

interface EditProfileModalProps {
  currentName: string;
  currentAvatar: string;
  onSave: (name: string, avatar: string) => void;
  onCancel: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentName, currentAvatar, onSave, onCancel }) => {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState(currentAvatar);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Editar Perfil</h3>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seu Nome</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-rose-400 rounded-2xl px-6 py-4 text-lg font-bold outline-none transition-all"
              placeholder="Digite seu nome..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ícone de Perfil</label>
            <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 border-2 border-slate-50 rounded-2xl">
              {AVATARS.map(a => (
                <button 
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`aspect-square text-2xl flex items-center justify-center rounded-xl transition-all ${avatar === a ? 'bg-rose-500 shadow-lg scale-110' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => onSave(name, avatar)}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Check size={20} strokeWidth={3} />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
