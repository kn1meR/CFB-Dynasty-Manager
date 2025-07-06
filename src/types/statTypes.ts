// This file should contain type definitions relating to player stats (either stat's themselves or awards)

export interface Award {
    id: number;
    playerName: string;
    awardName: string;
    year: number;
    team?: '1st Team' | '2nd Team' | 'Freshman' ; // Optional field for team designation
  }