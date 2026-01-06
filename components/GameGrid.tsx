
import React from 'react';
import { Game } from '../types';

interface GameGridProps {
  games: Game[];
  onSelectGame: (id: string) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ games, onSelectGame }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {games.map(game => (
        <button 
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className="flex flex-col text-left bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 active:scale-95 transition-all group"
        >
          <div className={`${game.color} h-28 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform`}>
            {game.icon}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1 mb-1">
              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                game.category === 'COOP' ? 'bg-blue-100 text-blue-600' : 
                game.category === 'VERSUS' ? 'bg-orange-100 text-orange-600' :
                game.category === 'ROMANTIC' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {game.category}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">{game.avgDuration}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{game.title}</h3>
            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{game.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default GameGrid;
