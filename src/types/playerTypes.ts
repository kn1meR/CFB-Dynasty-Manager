// src/types/playerTypes.ts

// This file should contain types relating to a player's information (recruiting, roster, transfer, etc.)
export const positions = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'LEDGE', 'REDGE', 'DT', 'SAM', 'MIKE', 'WILL', 'CB', 'FS', 'SS', 'K', 'P'];
export const generalPositions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'ATH'];
export const offensePositions = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
export const defensivePositions = ['LEDGE', 'REDGE', 'DT', 'SAM', 'MIKE', 'WILL', 'CB', 'FS', 'SS'];
export const specialTeamsPositions = ['K', 'P']

export interface Player {
    id: number;
    name: string;
    position: string;
    year: string;
    rating: string;
    jerseyNumber: string;
    devTrait?: 'Normal' | 'Impact' | 'Star' | 'Elite';
    notes?: string;
    isRedshirted: boolean;
}

export interface Recruit {
    id: number,
    recruitedYear: number;
    name: string;
    stars: string;
    position: string;
    rating: string;
    potential: string;
}

export interface Transfer {
    id: number;
    transferYear: number;
    playerName: string;
    position: string;
    stars: string;
    transferDirection: 'From' | 'To';
    school: string;
}

export interface DraftedPlayer {
  id: string; // Or some unique identifier
  playerName: string;
  originalTeam: string; // Team they were drafted from
  draftedTeam: string;  // NFL team that drafted them
  round: number;
  pick: number;
  year: number; // The year they were drafted
}
