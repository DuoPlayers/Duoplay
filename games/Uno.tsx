
import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, Hand, MessageCircle } from 'lucide-react';

type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'SKIP' | 'REVERSE' | 'PLUS2' | 'WILD' | 'PLUS4';

interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
}

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];
const VALUES: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REVERSE', 'PLUS2'];

const createDeck = () => {
  const deck: Card[] = [];
  COLORS.forEach(color => {
    VALUES.forEach(val => {
      deck.push({ id: Math.random().toString(36), color, value: val });
      if (val !== '0') deck.push({ id: Math.random().toString(36), color, value: val });
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: Math.random().toString(36), color: 'wild', value: 'WILD' });
    deck.push({ id: Math.random().toString(36), color: 'wild', value: 'PLUS4' });
  }
  return deck.sort(() => Math.random() - 0.5);
};

const DuoUno: React.FC<{ role: 'HOST' | 'PARTNER', bet: number, remoteMove: any, onMove: (m: any) => void, onEnd: (r: 'WIN' | 'LOSS' | 'DRAW', b: number) => void }> = ({ role, bet, remoteMove, onMove, onEnd }) => {
  const [hand, setHand] = useState<Card[]>([]);
  const [partnerHandCount, setPartnerHandCount] = useState(7);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turn, setTurn] = useState<'HOST' | 'PARTNER'>('HOST');
  const [unoCalled, setUnoCalled] = useState(false);
  const [message, setMessage] = useState('DuoUno: Seu turno!');

  useEffect(() => {
    if (role === 'HOST') {
      const fullDeck = createDeck();
      const p1Hand = fullDeck.splice(0, 7);
      const p2Hand = fullDeck.splice(0, 7);
      const firstDiscard = fullDeck.splice(0, 1)[0];
      
      setHand(p1Hand);
      setDiscardPile([firstDiscard]);
      onMove({ type: 'INIT_UNO', partnerHand: p2Hand, firstDiscard, deckCount: fullDeck.length });
    }
  }, [role]);

  useEffect(() => {
    if (!remoteMove) return;
    switch (remoteMove.type) {
      case 'INIT_UNO':
        setHand(remoteMove.partnerHand);
        setDiscardPile([remoteMove.firstDiscard]);
        setPartnerHandCount(7);
        break;
      case 'PLAY_CARD':
        setDiscardPile(prev => [remoteMove.card, ...prev]);
        setTurn(remoteMove.nextTurn);
        setPartnerHandCount(remoteMove.handCount);
        break;
      case 'DRAW_CARD':
        setPartnerHandCount(remoteMove.handCount);
        setTurn(remoteMove.nextTurn);
        break;
      case 'UNO_CALL':
        setMessage('O parceiro gritou UNO! 😱');
        break;
      case 'WIN':
        onEnd(role === 'HOST' ? 'LOSS' : 'WIN', bet);
        break;
    }
  }, [remoteMove]);

  const canPlay = (card: Card) => {
    if (turn !== role) return false;
    const top = discardPile[0];
    if (card.color === 'wild') return true;
    return card.color === top.color || card.value === top.value;
  };

  const playCard = (card: Card) => {
    if (!canPlay(card)) return;

    const newHand = hand.filter(c => c.id !== card.id);
    setHand(newHand);
    setDiscardPile(prev => [card, ...prev]);

    let nextTurn: 'HOST' | 'PARTNER' = role === 'HOST' ? 'PARTNER' : 'HOST';
    
    // Lógica especial de cartas
    if (card.value === 'SKIP' || card.value === 'REVERSE') nextTurn = role;

    if (newHand.length === 0) {
      onMove({ type: 'WIN' });
      onEnd('WIN', bet);
      return;
    }

    onMove({ type: 'PLAY_CARD', card, nextTurn, handCount: newHand.length });
    setTurn(nextTurn);
  };

  const drawCard = () => {
    if (turn !== role) return;
    // Simulação simples de compra (gera uma carta aleatória para manter o estado leve)
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...hand, newCard];
    setHand(newHand);
    
    // Turno passa se não puder jogar a carta comprada imediatamente (regra simplificada)
    const nextTurn: 'HOST' | 'PARTNER' = role === 'HOST' ? 'PARTNER' : 'HOST';
    onMove({ type: 'DRAW_CARD', nextTurn, handCount: newHand.length });
    setTurn(nextTurn);
  };

  const callUno = () => {
    if (hand.length === 1) {
      setUnoCalled(true);
      onMove({ type: 'UNO_CALL' });
      setMessage('Você gritou UNO!');
    }
  };

  const getCardStyle = (color: CardColor) => {
    switch (color) {
      case 'red': return 'bg-red-600';
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-slate-900';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Mão do Parceiro */}
      <div className="h-32 bg-slate-200/50 flex items-center justify-center gap-1 p-4 relative">
         <div className="absolute top-2 left-4 text-[10px] font-black uppercase text-slate-400">Cartas do Parceiro: {partnerHandCount}</div>
         {Array.from({ length: Math.min(partnerHandCount, 8) }).map((_, i) => (
           <div key={i} className="w-10 h-16 bg-slate-800 rounded-lg border-2 border-white/20 -ml-4 first:ml-0 shadow-lg flex items-center justify-center">
              <div className="w-6 h-10 border border-white/10 rounded flex items-center justify-center font-black text-white text-[8px]">UNO</div>
           </div>
         ))}
      </div>

      {/* Centro: Baralho e Descarte */}
      <div className="flex-1 flex items-center justify-center gap-12 relative">
        {/* Monte de Compra */}
        <button onClick={drawCard} className="group relative">
           <div className="w-20 h-28 bg-slate-800 rounded-xl border-4 border-white shadow-2xl flex items-center justify-center transform group-active:scale-95 transition-all">
              <Layers size={32} className="text-white" />
           </div>
           <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-black text-slate-400">COMPRAR</div>
        </button>

        {/* Carta de Descarte */}
        {discardPile.length > 0 && (
          <div className={`w-24 h-32 ${getCardStyle(discardPile[0].color)} rounded-xl border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white relative animate-in zoom-in duration-300`}>
             <div className="absolute top-1 left-2 font-black text-xs">{discardPile[0].value}</div>
             <div className="text-3xl font-black italic">{discardPile[0].value}</div>
             <div className="absolute bottom-1 right-2 font-black text-xs rotate-180">{discardPile[0].value}</div>
          </div>
        )}

        <div className="absolute top-4 left-0 right-0 text-center">
           <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${turn === role ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'}`}>
              {turn === role ? 'Seu Turno!' : 'Turno do Parceiro...'}
           </span>
        </div>
      </div>

      {/* Minha Mão */}
      <div className="h-48 bg-white p-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 w-full">
           <button onClick={callUno} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all ${hand.length === 1 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>Gritar UNO!</button>
           <div className="flex-1 text-center font-bold text-slate-400 text-[10px]">{message}</div>
        </div>
        
        <div className="flex justify-center w-full overflow-x-auto pb-4 gap-2 scrollbar-hide">
          {hand.map((card) => (
            <button
              key={card.id}
              onClick={() => playCard(card)}
              disabled={!canPlay(card)}
              className={`flex-shrink-0 w-16 h-24 ${getCardStyle(card.color)} rounded-xl border-2 border-white shadow-lg flex flex-col items-center justify-center text-white relative transition-all active:scale-90 ${!canPlay(card) ? 'opacity-40 grayscale' : 'hover:-translate-y-2'}`}
            >
               <div className="absolute top-0.5 left-1 font-black text-[8px]">{card.value}</div>
               <div className="text-xl font-black italic">{card.value}</div>
               <div className="absolute bottom-0.5 right-1 font-black text-[8px] rotate-180">{card.value}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DuoUno;
