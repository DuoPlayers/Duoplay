
import React, { useState, useEffect } from 'react';
import { Heart, Star, Sun, Moon, Cloud, Zap, Ghost, Eye } from 'lucide-react';

interface Props {
  onEnd: (result: 'WIN' | 'LOSS' | 'DRAW') => void;
}

const icons = [Heart, Star, Sun, Moon, Cloud, Zap, Ghost, Eye];

const CoopMemory: React.FC<Props> = ({ onEnd }) => {
  const [cards, setCards] = useState<{id: number, icon: any, flipped: boolean, matched: boolean}[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((Icon, idx) => ({ id: idx, icon: Icon, flipped: false, matched: false }));
    setCards(deck);
  }, []);

  const handleFlip = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [idx1, idx2] = newFlipped;
      
      if (cards[idx1].icon === cards[idx2].icon) {
        newCards[idx1].matched = true;
        newCards[idx2].matched = true;
        setCards(newCards);
        setFlipped([]);
        
        if (newCards.every(c => c.matched)) {
          setTimeout(() => onEnd('WIN'), 1500);
        }
      } else {
        setTimeout(() => {
          newCards[idx1].flipped = false;
          newCards[idx2].flipped = false;
          setCards(newCards);
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-blue-50 p-6">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-blue-400">Progresso</span>
            <span className="text-lg font-bold text-blue-900">{Math.round((cards.filter(c => c.matched).length / cards.length) * 100)}%</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-blue-400">Tentativas</span>
            <span className="text-lg font-bold text-blue-900">{moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 flex-1 content-start">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                card.flipped || card.matched 
                  ? 'bg-white rotate-0 shadow-md border-2 border-blue-200' 
                  : 'bg-blue-400 rotate-180 shadow-sm'
              }`}
            >
              {(card.flipped || card.matched) && <Icon className="text-blue-500" size={32} />}
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-blue-100 text-blue-700 rounded-2xl text-center text-sm font-bold animate-pulse">
        Cooperativo: Ambos devem ajudar! 🤝
      </div>
    </div>
  );
};

export default CoopMemory;
