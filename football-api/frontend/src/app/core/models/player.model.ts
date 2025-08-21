export interface Player {
  id?: number;
  fifaVersion: string;
  fifaUpdate: string; // YYYY-MM-DD
  playerFaceUrl?: string;
  longName: string;
  playerPositions: string; // "FW", "MF", etc
  clubName?: string;
  nationalityName?: string;
  rating?: number;
  speed?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePlayerDto {
  name: string;
  position: string;
  club?: string;
  nationality?: string;
  playerFaceUrl?: string;
  fifaVersion?: string;
  fifaUpdate?: string; // YYYY-MM-DD
  rating?: number;
  speed?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
}

export type UpdatePlayerDto = Partial<CreatePlayerDto>;