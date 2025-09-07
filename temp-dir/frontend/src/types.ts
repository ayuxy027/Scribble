// This file will hold all shared interfaces for your app.

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

// Socket event types
export interface ServerToClientEvents {
  "room-update": (roomState: RoomState) => void;
  "room-closed": () => void;
  "error": (msg: string) => void;
  "canvas-state": (fullHistory: any[][]) => void;
  "canvas-cleared": () => void;
  "new-round": (data: {
    drawerId: string;
    round: number;
    totalRounds: number;
    time: number;
  }) => void;
  "your-turn": (word: string) => void;
  "new-message": (msg: Message) => void;
  "system-message": (msg: string) => void;
  "game-over": (scores: { username: string; score: number }[]) => void;
}

export interface ClientToServerEvents {
  "create-room": (username: string) => void;
  "join-room": (roomId: string, username: string) => void;
  "start-game": (roomId: string) => void;
  "send-message": (data: { roomId: string; message: string }) => void;
  "clear-canvas": (roomId: string) => void;
  "canvas-state-update": (data: { roomId: string; history: any[][] }) => void;
}