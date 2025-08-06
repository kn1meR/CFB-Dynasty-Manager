// This file should contain type definitions for types pertaining to year records (I.E stats, schedules, records)

import { DraftedPlayer, Recruit, Transfer } from "./playerTypes";
import { Award } from "./statTypes";

export interface YearRecord {
  year: number;
  overallRecord: string;
  conferenceRecord: string;
  bowlGame: string;
  bowlResult: string;
  pointsFor: string;
  pointsAgainst: string;
  natChamp: string;
  heisman: string;
  schedule: Game[];
  recruits?: Recruit[];
  transfers?: Transfer[];
  playerAwards: Award[];
  recruitingClassPlacement: string;
  playersDrafted: DraftedPlayer[];
  finalRanking?: string;
  conferenceFinish?: string;
}

export interface YearStats {
  wins: number;
  losses: number;
  conferenceWins: number;
  conferenceLosses: number;
  pointsScored: number;
  pointsAgainst: number;
  playersDrafted: number;
  conferenceStanding: string;
  bowlGame: string;
  bowlResult: 'Win' | 'Loss' | 'CFP' | 'DNP' | '';
}

export interface Game {
  id: number;
  week: number;
  location: '@' | 'vs' | 'neutral' | ' ';
  opponent: string;
  result: 'Win' | 'Loss' | 'Tie' | 'Bye' | 'N/A';
  score: string;
  isUserControlled?: boolean;
}

export type AllRecords = {
  [year: number]: YearRecord;
};
