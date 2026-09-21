// Global declarations for third-party CDNs loaded in index.html

export interface Member {
  id: string;
  name: string;
  timestamp?: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  members: Member[];
}

export interface Clue {
  id: string;
  value: number;
  question: string;
  answer: string;
  isAnswered: boolean;
}

export interface Category {
  id: string;
  title: string;
  clues: Clue[];
}

export interface BuzzItem {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  timestamp: number;
}

export interface ActiveClue extends Clue {
  categoryTitle: string;
  catId: string;
}

export interface SavedProgram {
  id: string;
  name: string;
  createdAt: number;
  dateStr?: string;
  categories: Category[];
  totalQuestions?: number;
}

export interface JeopardyState {
  roomCode: string;
  status: 'setup' | 'qrcodes' | 'game' | 'podium_teams';
  title: string;
  categories: Category[];
  teamCount: number;
  maxMembersPerTeam: number;
  teams: Team[];
  activeClue: ActiveClue | null;
  currentTurn: BuzzItem | null;
  buzzQueue: BuzzItem[];
  disqualifiedTeams: string[];
  buzzersUnlocked: boolean;
  loadingDevicesState: boolean;
  lastUpdated: number;
}

declare global {
  interface Window {
    QRCode: any;
    confetti: any;
    firebase: any;
    XLSX: any;
    webkitAudioContext: typeof AudioContext;
  }
}
