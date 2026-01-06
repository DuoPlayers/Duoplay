
import React, { useState, useEffect } from 'react';
import { Dice6, Home, User, Coins, MapPin, AlertCircle, ShieldAlert, Layers } from 'lucide-react';

const BOARD = [
  { id: 0, name: 'Início', icon: '🚀', type: 'START', effect: 'RECEIVE_200' },
  { id: 1, name: 'Cinema', icon: '🎬', type: 'PROP', price: 100, rent: 20 },
  { id: 2, name: 'Sorte/Revés', icon: '❓', type: 'CARD' },
  { id: 3, name: 'Parque', icon: '🌳', type: 'PROP', price: 150, rent: 30 },
  { id: 4, name: 'PRISÃO', icon: '🔒', type: 'JAIL' },
  { id: 5, name: 'Jantar', icon: '🍝', type: 'PROP', price: 200, rent: 40 },
  { id: 6, name: 'Sorte/Revés', icon: '❓', type: 'CARD' },
  { id: 7, name: 'Praia', icon: '🏖️', type: 'PROP', price: 300, rent: 60 },
  { id: 8, name: 'Visita', icon: '👀', type: 'START' },
  { id: 9, name: 'Café', icon: '☕', type: 'PROP', price: 120, rent: 25 },
  { id: 10, name: 'Vá p/ Prisão', icon: '👮', type: 'GO_JAIL' },
  { id: 11, name: 'Show', icon: '🎸', type: 'PROP', price: 350, rent: 70 },
];

const CHANCE_CARDS = [
  { title: "Herança!", text: "Um tio distante te deixou uma fortuna.", value: 500, type: 'GAIN' },
  { title: "Imposto de Renda", text: "Hora de pagar o governo.", value: -200, type: 'LOSS' },
  { title: "Investimento", text: "Suas ações subiram muito.", value: 300, type: 'GAIN' },
  { title: "Multa de Trânsito", text: "Você foi pego no radar.", value: -150, type: 'LOSS' },
  { title: "Escola dos Filhos", text: "Mensalidade escolar venceu.", value: -250, type: 'LOSS' },
  { title: "Loteria!", text: "Você acertou 4 números.", value: 1000, type: 'GAIN' },
  { title: "Conserto do Carro", text: "O motor bateu.", value: -400, type: 'LOSS' },
];

const CouplePoly: React.FC<{ role: 'HOST' | 'PARTNER', bet: number, remoteMove: any, onMove: (m: any) => void, onEnd: (r: 'WIN' | 'LOSS' | 'DRAW', b: number) => void }> = ({ role, bet, remoteMove, onMove, onEnd }) => {
  const [gameState, setGameState] = useState({
    p1: { pos: 0, coins: 1500, props: [] as number[], inJail: 0 },
    p2: { pos: 0, coins: 1500, props: [] as number[], inJail: 0 },
    turn: 'HOST' as 'HOST' | 'PARTNER',
    dice: 0,
    isRolling: false,
    waitingMove: false,
    drawnCard: null as any
  });

  const [message, setMessage] = useState('DuoPoly: Role os dados!');

  useEffect(() => {
    if (remoteMove?.type === 'ROLL') {
      setGameState(prev => ({ ...prev, dice: remoteMove.dice, isRolling: false, waitingMove: true }));
      setMessage('Aguardando movimento do pino...');
    } else if (remoteMove?.type === 'MOVE_MANUAL') {
      executeMove(remoteMove.player, remoteMove.dice);
    } else if (remoteMove?.type === 'DRAW_CARD') {
      setGameState(prev => ({ ...prev, drawnCard: remoteMove.card }));
      setTimeout(() => setGameState(prev => ({ ...prev, drawnCard: null })), 5000);
    }
  }, [remoteMove]);

  const rollDice = () => {
    if (gameState.turn !== role || gameState.isRolling || gameState.waitingMove) return;
    setGameState(prev => ({ ...prev, isRolling: true }));
    const d = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
       onMove({ type: 'ROLL', dice: d });
       setGameState(prev => ({ ...prev, dice: d, isRolling: false, waitingMove: true }));
    }, 800);
  };

  const handlePawnClick = () => {
    if (gameState.turn !== role || !gameState.waitingMove) return;
    onMove({ type: 'MOVE_MANUAL', player: role, dice: gameState.dice });
    executeMove(role, gameState.dice);
  };

  const executeMove = (player: 'HOST' | 'PARTNER', dice: number) => {
    const key = player === 'HOST' ? 'p1' : 'p2';
    const otherKey = player === 'HOST' ? 'p2' : 'p1';
    
    setGameState(prev => {
      const newPos = (prev[key].pos + dice) % BOARD.length;
      let newCoins = prev[key].coins;
      const tile = BOARD[newPos];

      // Aluguel
      if (prev[otherKey].props.includes(newPos)) {
        newCoins -= tile.rent || 0;
        prev[otherKey].coins += tile.rent || 0;
        setMessage(`Paga aluguel de $${tile.rent}!`);
      }

      // Cadeia
      if (tile.type === 'GO_JAIL') {
         return { ...prev, [key]: { ...prev[key], pos: 4, inJail: 2 }, waitingMove: false, turn: player === 'HOST' ? 'PARTNER' : 'HOST' };
      }

      return { ...prev, [key]: { ...prev[key], pos: newPos, coins: newCoins }, waitingMove: false, turn: player === 'HOST' ? 'PARTNER' : 'HOST' };
    });
  };

  const drawCard = () => {
    const key = role === 'HOST' ? 'p1' : 'p2';
    if (BOARD[gameState[key].pos].type !== 'CARD') return;
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    onMove({ type: 'DRAW_CARD', card });
    setGameState(prev => {
       const newCoins = prev[key].coins + card.value;
       return { ...prev, [key]: { ...prev[key], coins: newCoins }, drawnCard: card };
    });
    setTimeout(() => setGameState(prev => ({ ...prev, drawnCard: null })), 5000);
  };

  const currentPlayer = role === 'HOST' ? gameState.p1 : gameState.p2;

  return (
    <div className="h-full flex flex-col bg-slate-100 p-4">
      {/* HUD de Jogadores */}
      <div className="flex justify-between mb-2">
        <div className={`p-3 rounded-2xl flex items-center gap-2 border-2 ${gameState.turn === 'HOST' ? 'bg-indigo-500 border-white text-white shadow-lg' : 'bg-white border-slate-100'}`}>
          <span className="text-xl">👦</span>
          <div>
            <div className="text-[8px] font-black uppercase opacity-60">Host</div>
            <div className="font-bold">${gameState.p1.coins}</div>
          </div>
        </div>
        <div className={`p-3 rounded-2xl flex items-center gap-2 border-2 ${gameState.turn === 'PARTNER' ? 'bg-rose-500 border-white text-white shadow-lg' : 'bg-white border-slate-100'}`}>
          <div>
            <div className="text-[8px] font-black uppercase opacity-60">Parceiro</div>
            <div className="font-bold text-right">${gameState.p2.coins}</div>
          </div>
          <span className="text-xl">👧</span>
        </div>
      </div>

      {/* Tabuleiro */}
      <div className="flex-1 bg-white rounded-[2rem] border-4 border-slate-300 relative grid grid-cols-4 grid-rows-4 gap-1 p-1">
        {BOARD.map((tile, i) => (
          <div key={i} className={`rounded-xl flex flex-col items-center justify-center border ${gameState.p1.props.includes(i) ? 'bg-indigo-100 border-indigo-300' : gameState.p2.props.includes(i) ? 'bg-rose-100 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-sm">{tile.icon}</span>
            <span className="text-[5px] font-black text-center">{tile.name}</span>
            {gameState.p1.pos === i && (
              <button onClick={handlePawnClick} className="w-4 h-4 bg-indigo-600 rounded-full border-2 border-white absolute shadow-md z-10 animate-bounce">👦</button>
            )}
            {gameState.p2.pos === i && (
              <button onClick={handlePawnClick} className="w-4 h-4 bg-rose-500 rounded-full border-2 border-white absolute shadow-md z-10 animate-bounce">👧</button>
            )}
          </div>
        ))}

        {/* Centro do Tabuleiro: Deck e Dados */}
        <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex flex-col items-center justify-center p-2">
           <div className="flex gap-2 mb-2">
              <div className={`w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-xl font-black ${gameState.isRolling ? 'animate-spin' : ''}`}>
                {gameState.dice || '?'}
              </div>
           </div>
           
           <button onClick={drawCard} className="relative group active:scale-95 transition-all">
              <Layers size={40} className="text-slate-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[8px] font-black text-slate-600">DECK</span>
              </div>
           </button>
        </div>
      </div>

      {/* Card de Sorte/Revés */}
      {gameState.drawnCard && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 animate-in zoom-in">
           <div className={`p-8 rounded-[3rem] text-center w-full max-w-xs shadow-2xl ${gameState.drawnCard.type === 'GAIN' ? 'bg-green-500' : 'bg-red-600'} text-white`}>
              <h3 className="text-3xl font-black italic mb-2">{gameState.drawnCard.title}</h3>
              <p className="font-bold opacity-90 mb-6">{gameState.drawnCard.text}</p>
              <div className="text-4xl font-black">${Math.abs(gameState.drawnCard.value)}</div>
           </div>
        </div>
      )}

      {/* Controles */}
      <div className="mt-4 flex gap-2">
         <button 
           onClick={rollDice}
           disabled={gameState.turn !== role || gameState.isRolling || gameState.waitingMove}
           className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black active:scale-95 disabled:opacity-30"
         >
           {gameState.isRolling ? 'ROLANDO...' : 'GIRAR DADO'}
         </button>
      </div>
    </div>
  );
};

export default CouplePoly;
