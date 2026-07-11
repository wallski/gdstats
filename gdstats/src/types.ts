export interface PlayerSearchResult {
  accountID: number;
  playerName: string;
  stars: number;
  demons: number;
  icon: number;
  color1: number;
  color2: number;
}

export interface Level {
  levelID: number;
  name: string;
  author: string;
  difficulty: string;
  stars: number;
  downloads: number;
  likes: number;
}

export interface PlayerProfile {
  accountID: number;
  playerName: string;
  stars: number;
  demons: number;
  diamonds: number;
  coins: number;
  userCoins: number;
  creatorPoints: number;
  rank: number;
  icon: number;
  ship: number;
  ball: number;
  ufo: number;
  wave: number;
  robot: number;
  spider: number;
  color1: number;
  color2: number;
  color3: number;
  glow: boolean;
  moons: number;
  swing: number;
  jetpack: number;
  youtube: string;
  twitter: string;
  twitch: string;
  levelsCreated: Level[];
}

export interface SearchResponse {
  results: PlayerSearchResult[];
}
