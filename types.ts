
export type GameCategory = 'CLASSIC' | 'COOP' | 'VERSUS' | 'ROMANTIC' | 'STRATEGY';
export type PlayerRole = 'HOST' | 'PARTNER';
export type UserGender = 'NAMORADO' | 'NAMORADA';

export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: GameCategory;
  avgDuration: string;
  allowsBetting: boolean;
  color: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  gender: UserGender;
  password?: string;
  coins: number;
  stats: {
    wins: number;
    losses: number;
    draws: number;
    byGame: Record<string, { wins: number; losses: number }>;
  };
}

export interface RoomState {
  roomId: string;
  partnerConnected: boolean;
  partnerName: string | null;
  partnerGender?: UserGender;
  partnerAvatar?: string;
  currentBet: number;
  isBetConfirmed: boolean;
  role: PlayerRole;
}

export interface NetworkConfig {
  supabaseUrl: string;
  supabaseKey: string;
  isEnabled: boolean;
}

export interface MusicSyncPayload {
  type: 'PLAY_PAUSE' | 'CHANGE_TRACK' | 'SEEK';
  isPlaying?: boolean;
  index?: number;
  time?: number;
}
