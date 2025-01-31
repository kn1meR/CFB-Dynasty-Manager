// utils/localStorage.ts

import { Recruit, Transfer } from "@/types/playerTypes";
import { Award } from "@/types/statTypes";
import { Game, YearRecord, YearStats } from "@/types/yearRecord";
import { stat } from "fs";
import { getTeamByName } from "./fbsTeams";

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
};

export const getCurrentYear = (): number => {
  const storedYear = safeLocalStorage.getItem('currentYear');
  return storedYear ? parseInt(storedYear, 10) : 2024;
};
export const setCurrentYear = (year: number): void => {
  safeLocalStorage.setItem('currentYear', year.toString());
};
export const getSchedule = (year: number): Game[] => {
  const storedSchedule = safeLocalStorage.getItem(`schedule_${year}`);
  if (storedSchedule) {
    return JSON.parse(storedSchedule);
  }
  return [];
};
export const setSchedule = (year: number, schedule: Game[]): void => {
  safeLocalStorage.setItem(`schedule_${year}`, JSON.stringify(schedule));
};
export const calculateStats = (schedule: Game[]): YearStats => {
  let wins = 0, losses = 0, pointsScored = 0, pointsAgainst = 0, conferenceWins = 0, conferenceLosses = 0;
  let currentSchoolName = localStorage.getItem('schoolName') || '';
  let currentSchool = getTeamByName(currentSchoolName);
  schedule.forEach(game => {
    let opponentConference = getTeamByName(game.opponent)?.conference;
    let inConferenceGame:boolean = (currentSchool !== undefined && currentSchool?.conference !== 'Independents' && currentSchool?.conference === opponentConference)
    if (game.result === 'Win') {
      wins++;
      if(inConferenceGame)
        conferenceWins++;
    }
    if (game.result === 'Loss') {
      losses++;
      if(inConferenceGame)
        conferenceLosses++;
    }
    if (game.score) {
      const [teamScore, opponentScore] = game.score.split('-').map(Number);
      if (!isNaN(teamScore) && !isNaN(opponentScore)) {
        pointsScored += teamScore;
        pointsAgainst += opponentScore;
      }
    }
  });

  return {
    wins,
    losses,
    conferenceWins, 
    conferenceLosses,
    pointsScored,
    pointsAgainst,
    playersDrafted: 0,
    conferenceStanding: '',
    bowlGame: '',
    bowlResult: '',
  };
};
export const getYearStats = (year: number): YearStats => {
  if (typeof window !== 'undefined') {
    const storedStats = localStorage.getItem(`yearStats_${year}`);
    if (storedStats) {
      return JSON.parse(storedStats);
    }
  }
  return {
    wins: 0,
    losses: 0,
    conferenceWins: 0,
    conferenceLosses: 0,
    pointsScored: 0,
    pointsAgainst: 0,
    playersDrafted: 0,
    conferenceStanding: '',
    bowlGame: '',
    bowlResult: '',
  };
};
export const setYearStats = (year: number, stats: YearStats): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`yearStats_${year}`, JSON.stringify(stats));
  }
};

export const setYearRecord = (year: number, record: YearRecord): void => {
  if (typeof window !== 'undefined') {
    const storedRecords = localStorage.getItem('yearRecords');
    let records: YearRecord[] = storedRecords ? JSON.parse(storedRecords) : [];
    const existingIndex = records.findIndex(r => r.year === year);

    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    localStorage.setItem('yearRecords', JSON.stringify(records));
  }
}

export const getYearRecord = (year: number): YearRecord => {
  if (typeof window !== 'undefined') {
    const storedRecords = localStorage.getItem('yearRecords');
    let records: YearRecord[] = storedRecords ? JSON.parse(storedRecords) : [];
    const existingIndex = records.findIndex(r => r.year === year);

    if (existingIndex !== -1) {
      return records[existingIndex]
    }
  }
  return {
    year: year,
    overallRecord: '',
    conferenceRecord: '',
    bowlGame: '',
    bowlResult: '',
    pointsFor: '',
    pointsAgainst: '',
    natChamp: '',
    heisman: '',
    schedule: Array(19).fill({ week: 0, opponent: '', result: '', score: '' }).map((game, index) => ({ ...game, week: index })),
    recruits: [],
    transfers: [],
    playerAwards: [],
    recruitingClassPlacement: '',
    playersDrafted: []
  }
}

/**
 * Generates a {@link YearRecord} item for use with storage and saving
 * @param year the year of the record being generated
 * @param stats an element of type {@link YearStats} representing various statistics about the season
 * @param schedule the season schedule of the year of the record
 * @param natChamp the national champion of the year
 * @param heisman the year's heisman winner
 * @param classPlacement team's recruiting class rank for the given year
 * @returns an item of type {@link YearRecord} containing the relevant data from the season
 */
export const generateYearRecord = (year: number, stats: YearStats, schedule: Game[], natChamp?: string, heisman?: string, classPlacement?: string): YearRecord => {
  let ovrRecord = stats.wins + '-' + stats.losses;
  let confRecord = stats.conferenceWins + '-' + stats.conferenceLosses;
  let yearTransfers = getTransfers(year);
  let yearRecruits = getRecruits(year);
  return {
    year: year,
    overallRecord: ovrRecord,
    conferenceRecord: confRecord,
    bowlGame: stats.bowlGame,
    bowlResult: stats.bowlResult,
    pointsFor: String(stats.pointsScored),
    pointsAgainst: String(stats.pointsAgainst),
    natChamp: natChamp || '',
    heisman: heisman || '',
    schedule: schedule,
    recruits: yearRecruits,
    transfers: yearTransfers,
    playerAwards: getYearAwards(year),
    recruitingClassPlacement: classPlacement || '',
    playersDrafted: []
  }
}

export const getAllRecruits = (): Recruit[] => {
  if (typeof window !== 'undefined') {
    const storedRecruits = localStorage.getItem('allRecruits');
    if (storedRecruits) {
      const allRecruits: Recruit[] = JSON.parse(storedRecruits);
      return allRecruits;
    }
  }
  return [];
}

export const getRecruits = (year: number): Recruit[] => {
  if (typeof window !== 'undefined') {
    const storedRecruits = getAllRecruits();
    if (storedRecruits.length !== 0) {
      const yearRecruits = storedRecruits.filter(recruit => recruit.recruitedYear === year);
      return yearRecruits;
    }
  }
  return [];
}

export const setRecruits = (recruits: Recruit[]): void => {
  if (typeof window !== 'undefined') {
    const storedRecruits: Recruit[] = getAllRecruits();
    let newList = storedRecruits.concat(recruits);
    localStorage.setItem('allRecruits', JSON.stringify(newList));
  }
}

export const getAllTransfers = (): Transfer[] => {
  if (typeof window !== 'undefined') {
    const storedTransfers = localStorage.getItem('allTransfers');
    if (storedTransfers) {
      const allTransfers: Transfer[] = JSON.parse(storedTransfers);
      return allTransfers;
    }
  }
  return [];
}

export const getTransfers = (year: number): Transfer[] => {
  if(typeof window !== 'undefined') {
    const allTransfers = getAllTransfers();
    const yearTransfers = allTransfers.filter(transfer => transfer.transferYear === year);
    return yearTransfers
  }
  return [];
}

export const setTransfers = (transfers: Transfer[]): void => {
  if (typeof window !== 'undefined') {
    const allTransfers: Transfer[] = getAllTransfers();
    let newList = allTransfers.concat(transfers);
    localStorage.setItem('allTransfers', JSON.stringify(newList));
  }
}

export const getAllAwards = (): Award[] => {
  if (typeof window !== 'undefined') {
    const storedAwards = localStorage.getItem('allAwards');
    if(storedAwards) {
      const allAwards: Award[] = JSON.parse(storedAwards);
      return allAwards;
    }
  }
  return [];
}

export const getYearAwards = (year: number): Award[] => {
  if(typeof window !== 'undefined') {
    const allAwards = getAllAwards();
    let yearAwards = allAwards.filter(award => award.year === year);
    return yearAwards;
  }
  return [];
}

// TODO: Add Method to Generate and Save Year Record
