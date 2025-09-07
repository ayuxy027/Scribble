// --- TYPE DEFINITIONS ---
export interface User {
  id: string;
  username: string;
  score: number;
}

export interface RoomState {
  roomId: string;
  users: User[];
  hostId: string;
  locked: boolean;
}

export interface Message {
  username: string;
  message: string;
}

export interface ReadyStatus {
  readyCount: number;
  totalPlayers: number;
  readyPlayerNames: string[];
  allReady: boolean;
}

export interface FinalScores {
  username: string;
  score: number;
}

export interface RoundInfo {
  round: number;
  totalRounds: number;
}


// --- SOCKET EVENT DEFINITIONS ---
export interface ServerToClientEvents {
  "room-update": (roomState: RoomState) => void;
  "room-closed": () => void;
  "error": (msg: string) => void;
  "canvas-state": (fullHistory: any[][]) => void;
  "canvas-cleared": () => void;
  "new-round": (data: { drawerId: string; round: number; totalRounds: number; time: number; }) => void;
  "choose-word-phase": (data: { drawerId: string; drawerName: string; round: number; totalRounds: number; time: number; }) => void;
  "choose-word-options": (words: string[]) => void;
  "drawing-phase": (data: { drawerId: string; round: number; totalRounds: number; time: number; }) => void;
  "round-results": (data: { round: number; results: any[]; word: string; time: number; }) => void;
  "your-turn": (word: string) => void;
  "new-message": (msg: Message) => void;
  "system-message": (msg: string) => void;
  "game-over": (scores: { username: string; score: number }[]) => void;
  "word-guessed": (data: { word: string }) => void;
  "new-game-started": () => void;
  "joined-new-game": () => void;
  "final-results": (data: { scores: any[]; totalRounds: number; time: number; }) => void;
  "chat-history": (messages: Message[]) => void;
  "ready-status-update": (data: ReadyStatus) => void;
}

export interface ClientToServerEvents {
  "create-room": (username: string) => void;
  "join-room": (roomId: string, username: string) => void;
  "start-game": (roomId: string) => void;
  "start-new-game": (roomId: string) => void;
  "join-new-game": (roomId: string) => void;
  "word-chosen": (roomId: string, word: string) => void;
  "send-message": (data: { roomId: string, message: string }) => void;
  "clear-canvas": (roomId: string) => void;
  "canvas-state-update": (data: { roomId: string, history: any[][] }) => void;
  "reconnect-room": (roomId: string, username: string) => void;
}