
import { Game } from './types';

export const GAMES: Game[] = [
  {
    id: 'duo-uno',
    title: 'DuoUno',
    description: 'O clássico jogo de cartas! Grite UNO antes do seu parceiro.',
    icon: '🃏',
    category: 'STRATEGY',
    avgDuration: '15 min',
    allowsBetting: true,
    color: 'bg-red-500'
  },
  {
    id: 'duo-bingo',
    title: 'Bingo do Casal',
    description: 'Sorteie os números e seja o primeiro a completar a cartela!',
    icon: '🎰',
    category: 'CLASSIC',
    avgDuration: '10 min',
    allowsBetting: true,
    color: 'bg-orange-500'
  },
  {
    id: 'duo-quest',
    title: 'DuoQuest 2D',
    description: 'Trabalhem juntos em um mundo de plataforma 2D real.',
    icon: '🏃‍♂️',
    category: 'COOP',
    avgDuration: '8 min',
    allowsBetting: false,
    color: 'bg-cyan-500'
  },
  {
    id: 'buzzer-quiz',
    title: 'Buzzer Quiz',
    description: 'Perguntas de conhecimento geral do mundo! Quem é mais inteligente?',
    icon: '🔔',
    category: 'VERSUS',
    avgDuration: '5 min',
    allowsBetting: true,
    color: 'bg-amber-500'
  },
  {
    id: 'couple-poly',
    title: 'DuoPoly 2.0',
    description: 'Banco Imobiliário completo com cartas de sorte/revés e prisão.',
    icon: '🎲',
    category: 'STRATEGY',
    avgDuration: '20 min',
    allowsBetting: true,
    color: 'bg-green-500'
  },
  {
    id: 'truth-dare',
    title: 'Verdade ou Desafio',
    description: 'Mande perguntas e desafios reais para seu parceiro via texto.',
    icon: '🔥',
    category: 'ROMANTIC',
    avgDuration: '10 min',
    allowsBetting: false,
    color: 'bg-rose-500'
  }
];

export const TRACKS = [
  { id: '1', title: 'Lofi Study Love', artist: 'Duo Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', title: 'Acoustic Soul', artist: 'Pure Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', title: 'Piano Romantic', artist: 'Love Keys', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: '4', title: 'Midnight Chill', artist: 'Couple Tunes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

export const AVATARS = [
  '🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🦁', '🐸', '🦄', '🐰', 
  '🐹', '🐭', '🐣', '🦖', '🐙', '🦋', '🐝', '🐧', '🐳', '🦉',
  '🦥', '🦔', '🐘', '🦒', '🦓'
];
