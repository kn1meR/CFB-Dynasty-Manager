// This file should contain types relating to a player's information (recruiting, roster, transfer, etc.)
export const positions = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'LE', 'RE', 'DT', 'LOLB', 'MLB', 'ROLB', 'CB', 'FS', 'SS', 'K', 'P'];
export const generalPositions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'ATH'];
export const offensePositions = ['QB', 'RB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
export const defensivePositions = ['LE', 'RE', 'DT', 'LOLB', 'MLB', 'ROLB', 'CB', 'FS', 'SS'];
export const specialTeamsPositions = ['K', 'P']

export interface Player {
    id: number;
    name: string;
    position: string;
    year: string;
    rating: string;
    jerseyNumber: string;
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
    playerName: string;
    round: string;
  }
