// utils/localStorage.ts

// Import types from dedicated files
import { Recruit, Transfer, Player, DraftedPlayer } from "@/types/playerTypes";
import { Award } from "@/types/statTypes";
import { Game, YearRecord, YearStats } from "@/types/yearRecord";
import { CoachProfile } from '@/types/coachProfile';
import { getTeamByName, Team, getTeamData } from "./fbsTeams";
import { PlayerStat } from "@/types/playerStats";
import { CustomTeamManager } from './customTeamManager';
import { RankedTeam, Top25History } from '@/hooks/useTop25Rankings';

const COACH_PROFILE_KEY = 'coachProfile';
const CURRENT_YEAR_KEY = 'currentYear';
const ALL_RECRUITS_KEY = 'allRecruits';
const ALL_TRANSFERS_KEY = 'allTransfers';
const ALL_AWARDS_KEY = 'allAwards'; // Will be deprecated but kept for migration
const YEAR_RECORDS_KEY = 'yearRecords';
export const PLAYERS_KEY = 'players';
// export const TOP_25_RANKINGS_KEY = 'top25Rankings';
export const PLAYER_STATS_KEY = 'playerStats';


// Helper for safe localStorage access
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
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
  }
};

const getCurrentDynastyData = (): Record<string, any> | null => {
    const dynastyId = safeLocalStorage.getItem('currentDynastyId');
    if (!dynastyId) return null;
    const dynastyData = safeLocalStorage.getItem(`dynasty_${dynastyId}`);
    try {
        return dynastyData ? JSON.parse(dynastyData) : {};
    } catch (e) {
        console.error("Failed to parse dynasty data", e);
        return {};
    }
}

const setCurrentDynastyData = (data: Record<string, any>): void => {
    const dynastyId = safeLocalStorage.getItem('currentDynastyId');
    if (!dynastyId) return;
    try {
        safeLocalStorage.setItem(`dynasty_${dynastyId}`, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save dynasty data", e);
    }
}


// --- Coach Profile ---
export const getCoachProfile = (): CoachProfile | null => {
  const profileData = safeLocalStorage.getItem(COACH_PROFILE_KEY);
  try {
    return profileData ? (JSON.parse(profileData) as CoachProfile) : null;
  } catch (error) {
    console.error("Error retrieving coach profile from localStorage:", error);
    safeLocalStorage.removeItem(COACH_PROFILE_KEY); 
    return null;
  }
};

export const setCoachProfile = (profile: CoachProfile): void => {
     try {
        safeLocalStorage.setItem(COACH_PROFILE_KEY, JSON.stringify(profile));
     } catch (error) {
         console.error("Error saving coach profile to localStorage:", error);
     }
};

// --- Players ---
export const getPlayers = (): Player[] => {
    const storedPlayers = safeLocalStorage.getItem(PLAYERS_KEY);
    try {
        return storedPlayers ? JSON.parse(storedPlayers) : [];
    } catch (error) {
        console.error("Error parsing players from localStorage:", error);
        safeLocalStorage.removeItem(PLAYERS_KEY);
        return [];
    }
};
export const setPlayers = (players: Player[]): void => {
    try {
        safeLocalStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
        console.error("Error saving players to localStorage:", error);
    }
};

// --- Player Stats ---
export const getPlayerStats = (): PlayerStat[] => {
    const storedStats = safeLocalStorage.getItem(PLAYER_STATS_KEY);
    try {
        return storedStats ? JSON.parse(storedStats) : [];
    } catch (error) {
        console.error("Error parsing playerStats from localStorage:", error);
        safeLocalStorage.removeItem(PLAYER_STATS_KEY);
        return [];
    }
};
export const setPlayerStats = (stats: PlayerStat[]): void => {
     try {
        safeLocalStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Error saving playerStats to localStorage:", error);
    }
};

// --- Current Year ---
export const getCurrentYear = (): number => {
  const storedYear = safeLocalStorage.getItem(CURRENT_YEAR_KEY);
  const year = storedYear ? parseInt(storedYear, 10) : NaN;
  return !isNaN(year) && year > 1900 ? year : 2024;
};
export const setCurrentYear = (year: number): void => {
  safeLocalStorage.setItem(CURRENT_YEAR_KEY, year.toString());
};

// --- Schedule ---
const getScheduleKey = (year: number) => `schedule_${year}`;
export const getSchedule = (year: number): Game[] => {
  const storedSchedule = safeLocalStorage.getItem(getScheduleKey(year));
  try {
    return storedSchedule ? (JSON.parse(storedSchedule) as Game[]) : [];
  } catch (error) {
     console.error(`Error parsing schedule for year ${year}:`, error);
     safeLocalStorage.removeItem(getScheduleKey(year));
     return [];
  }
};
export const setSchedule = (year: number, schedule: Game[]): void => {
  try {
    safeLocalStorage.setItem(getScheduleKey(year), JSON.stringify(schedule));
  } catch (error) {
    console.error(`Error saving schedule for year ${year}:`, error);
  }
};
export const removeSchedule = (year: number): void => {
    safeLocalStorage.removeItem(getScheduleKey(year));
}


// --- Year Stats ---
const getYearStatsKey = (year: number) => `yearStats_${year}`;
const defaultYearStats: YearStats = {
    wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0,
    pointsScored: 0, pointsAgainst: 0, playersDrafted: 0,
    conferenceStanding: '', bowlGame: '', bowlResult: '',
};

export const calculateStats = (schedule: Game[], schoolName: string): YearStats => {
  let wins = 0, losses = 0, pointsScored = 0, pointsAgainst = 0, conferenceWins = 0, conferenceLosses = 0;
  
  // --- USE THE NEW getTeamData FUNCTION ---
  const currentSchool = getTeamData(schoolName);

  schedule.forEach(game => {
    if (!game.opponent || game.opponent === 'BYE' || game.opponent === 'NONE' || game.result === 'N/A' || game.result === 'Bye') {
      return;
    }
    
    // --- USE THE NEW getTeamData FUNCTION HERE TOO ---
    const opponentSchool = getTeamData(game.opponent);
    
    // The rest of the logic remains the same but now uses the correct conference data
    const isConferenceGame = !!(currentSchool && opponentSchool && 
                               currentSchool.conference === opponentSchool.conference);

    if (game.result === 'Win') {
      wins++;
      if (isConferenceGame) conferenceWins++;
    } else if (game.result === 'Loss') {
      losses++;
      if (isConferenceGame) conferenceLosses++;
    }

    if (game.score && game.score.includes('-')) {
      const scores = game.score.split('-');
      if (scores.length === 2) {
        const teamScore = parseInt(scores[0]) || 0;
        const oppScore = parseInt(scores[1]) || 0;
        pointsScored += teamScore;
        pointsAgainst += oppScore;
      }
    }
  });

  return {
    wins, losses, conferenceWins, conferenceLosses,
    pointsScored, pointsAgainst, playersDrafted: 0,
    conferenceStanding: '', bowlGame: '', bowlResult: ''
  };
};


export const getYearStats = (year: number): YearStats => {
  const storedStats = safeLocalStorage.getItem(getYearStatsKey(year));
  try {
    return storedStats ? (JSON.parse(storedStats) as YearStats) : { ...defaultYearStats };
  } catch(error) {
      console.error(`Error parsing year stats for year ${year}:`, error);
      safeLocalStorage.removeItem(getYearStatsKey(year));
      return { ...defaultYearStats };
  }
};

export const setYearStats = (year: number, stats: YearStats): void => {
  try {
    safeLocalStorage.setItem(getYearStatsKey(year), JSON.stringify(stats));
  } catch(error) {
      console.error(`Error saving year stats for year ${year}:`, error);
  }
};
export const removeYearStats = (year: number): void => {
    safeLocalStorage.removeItem(getYearStatsKey(year));
}


// --- Year Records ---
const defaultYearRecord = (year: number): YearRecord => ({
    year: year, overallRecord: '0-0', conferenceRecord: '0-0', bowlGame: '', bowlResult: '',
    pointsFor: '0', pointsAgainst: '0', natChamp: '', heisman: '',
    schedule: [], recruits: [], transfers: [], playerAwards: [],
    recruitingClassPlacement: '',
    playersDrafted: [] as DraftedPlayer[]
});

export const setYearRecord = (year: number, record: YearRecord): void => {
  try {
    const storedRecords = safeLocalStorage.getItem(YEAR_RECORDS_KEY);
    let records: YearRecord[] = storedRecords ? JSON.parse(storedRecords) : [];
    const existingIndex = records.findIndex(r => r.year === year);
    if (existingIndex !== -1) {
      records[existingIndex] = record;
    } else {
      records.push(record);
      records.sort((a, b) => a.year - b.year);
    }
    safeLocalStorage.setItem(YEAR_RECORDS_KEY, JSON.stringify(records));
  } catch(error) {
    console.error(`Error setting year record for year ${year}:`, error);
  }
};

export const getYearRecord = (year: number): YearRecord => {
   try {
    const storedRecords = safeLocalStorage.getItem(YEAR_RECORDS_KEY);
    let records: YearRecord[] = storedRecords ? JSON.parse(storedRecords) : [];
    const record = records.find(r => r.year === year);
    return record || defaultYearRecord(year);
   } catch(error) {
     console.error(`Error getting year record for year ${year}:`, error);
     return defaultYearRecord(year);
   }
};
export const getAllYearRecords = (): YearRecord[] => {
    try {
     const storedRecords = safeLocalStorage.getItem(YEAR_RECORDS_KEY);
     return storedRecords ? JSON.parse(storedRecords) : [];
    } catch(error) {
      console.error(`Error getting all year records:`, error);
      safeLocalStorage.removeItem(YEAR_RECORDS_KEY);
      return [];
    }
};
export const removeAllYearRecords = (): void => {
    safeLocalStorage.removeItem(YEAR_RECORDS_KEY);
}

// --- Recruits ---
export const getAllRecruits = (): Recruit[] => {
  const storedRecruits = safeLocalStorage.getItem(ALL_RECRUITS_KEY);
  try {
    return storedRecruits ? JSON.parse(storedRecruits) : [];
  } catch (error) {
     console.error(`Error parsing all recruits:`, error);
     safeLocalStorage.removeItem(ALL_RECRUITS_KEY);
     return [];
  }
};
export const getRecruits = (year: number): Recruit[] => getAllRecruits().filter(recruit => recruit.recruitedYear === year);

// --- Transfers ---
export const getAllTransfers = (): Transfer[] => {
  const storedTransfers = safeLocalStorage.getItem(ALL_TRANSFERS_KEY);
  try {
      return storedTransfers ? JSON.parse(storedTransfers) : [];
  } catch(error) {
      console.error(`Error parsing all transfers:`, error);
      safeLocalStorage.removeItem(ALL_TRANSFERS_KEY);
      return [];
  }
};
export const getTransfers = (year: number): Transfer[] => getAllTransfers().filter(transfer => transfer.transferYear === year);

// MODIFICATION START: Update Award functions
// --- Awards ---
export const getYearAwards = (year: number): Award[] => {
  // The single source of truth for awards is now within the year's record.
  const record = getYearRecord(year);
  return record.playerAwards || [];
};

export const setYearAwards = (year: number, awards: Award[]): void => {
    // This function will now update the awards within the specific year's record.
    const record = getYearRecord(year);
    const updatedRecord = { ...record, playerAwards: awards };
    setYearRecord(year, updatedRecord);
};
// The old getAllAwards and setAllAwards are no longer needed for data integrity.
// We can leave them for migration purposes or remove them if confident.
// For now, let's leave them but not use them in new code.
export const getAllAwards = (): Award[] => {
  const storedAwards = safeLocalStorage.getItem(ALL_AWARDS_KEY);
  try {
    return storedAwards ? JSON.parse(storedAwards) : [];
  } catch (error) {
     console.error(`Error parsing all awards:`, error);
     safeLocalStorage.removeItem(ALL_AWARDS_KEY);
     return [];
  }
};
// MODIFICATION END

export const clearActiveSessionData = (): void => {
    console.log("Clearing active session data from localStorage...");
    
    const keysToRemove = [
        COACH_PROFILE_KEY,
        CURRENT_YEAR_KEY,
        ALL_RECRUITS_KEY,
        ALL_TRANSFERS_KEY,
        ALL_AWARDS_KEY, // This key is deprecated but we clear it for safety
        YEAR_RECORDS_KEY,
        PLAYERS_KEY,
        //TOP_25_RANKINGS_KEY,
        PLAYER_STATS_KEY,
        'allTrophies', // Add any other session-specific keys here
    ];

    keysToRemove.forEach(key => safeLocalStorage.removeItem(key));

    // Also remove any dynamic schedule or year stats keys from the previous session
    if (typeof window !== 'undefined') {
        const keysToDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('schedule_') || key.startsWith('yearStats_'))) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => safeLocalStorage.removeItem(key));
    }
    
    console.log("Active session data cleared.");
};

// --- Generate Year Record ---
export const generateYearRecord = (
    year: number,
    stats: YearStats,
    schedule: Game[],
    coachProfile: CoachProfile | null
    ): YearRecord => {
  const ovrRecord = `${stats.wins}-${stats.losses}`;
  const confRecord = `${stats.conferenceWins}-${stats.conferenceLosses}`;
  const yearTransfers = getTransfers(year);
  const yearRecruits = getRecruits(year);
  
  // Use the new getYearAwards function which pulls from the correct source
  const yearAwards = getYearAwards(year); 

  const natChamp = '';
  const heisman = '';
  const classPlacement = '';
  const playersDrafted: DraftedPlayer[] = [];

  return {
    year: year,
    overallRecord: ovrRecord,
    conferenceRecord: confRecord,
    bowlGame: stats.bowlGame || '',
    bowlResult: stats.bowlResult || '',
    pointsFor: String(stats.pointsScored),
    pointsAgainst: String(stats.pointsAgainst),
    natChamp: natChamp,
    heisman: heisman,
    schedule: schedule,
    recruits: yearRecruits,
    transfers: yearTransfers,
    playerAwards: yearAwards,
    recruitingClassPlacement: classPlacement,
    playersDrafted: playersDrafted
  };
};

export const getTop25History = (): Top25History => {
  const dynastyData = getCurrentDynastyData();
  // Data is now stored under a 'top25History' key within the dynasty object
  return dynastyData?.top25History || {};
};

export const setTop25History = (history: Top25History): void => {
    const dynastyData = getCurrentDynastyData() || {};
    dynastyData.top25History = history;
    setCurrentDynastyData(dynastyData);
};

/**
 * Gets the ranking for a specific team for a given week of a year.
 * Returns the rank number (1-25) or null if the team is not ranked.
 */
export const getTeamRankForWeek = (teamName: string, year: number, week: number): number | null => {
  const history = getTop25History();
  const yearData = history[year];
  
  if (!yearData) return null;

  // Find the most recent poll data available up to the requested week
  let weekToCheck = week;
  let pollData: RankedTeam[] | undefined = undefined;

  while (weekToCheck >= 1) {
    if (yearData[weekToCheck]) {
      pollData = yearData[weekToCheck];
      break;
    }
    weekToCheck--;
  }

  if (!pollData) return null;

  const rankIndex = pollData.findIndex(t => t.name === teamName);
  
  return rankIndex !== -1 ? rankIndex + 1 : null;
};

export const prepareNextSeason = (year: number): void => {
  try {
    // THIS IS THE FIX: Update the global current year
    setCurrentYear(year);

    // 1. Create a fresh schedule for the new year
    const newSchedule: Game[] = Array.from({ length: 21 }, (_, i) => ({
      id: i,
      week: i,
      location: 'vs',
      opponent: '',
      result: 'N/A',
      score: ''
    }));
    setSchedule(year, newSchedule);

    // 2. Create empty year stats for the new year
    const initialYearStats: YearStats = { 
        wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0, 
        pointsScored: 0, pointsAgainst: 0, playersDrafted: 0, 
        conferenceStanding: '', bowlGame: '', bowlResult: '' 
    };
    setYearStats(year, initialYearStats);

    // 3. Create an empty YearRecord for the new year so it can be edited immediately
    const newYearRecord = getYearRecord(year); // This will create a default one
    setYearRecord(year, newYearRecord);

    // 4. Initialize the Top 25 poll for the new year
    const currentHistory = getTop25History();
    const newYearHistory = {
      [year]: {
        0: Array.from({ length: 25 }, () => ({ name: '' })) // Start with a poll for Week 0
      }
    };
    setTop25History({ ...currentHistory, ...newYearHistory });

  } catch (error) {
    console.error(`Error preparing next season for year ${year}:`, error);
  }
};

/**
 * Wipes all active session data and replaces it with the contents of a dynasty data object.
 * This is the core function for loading a dynasty.
 * @param data - The complete data object for a dynasty.
 */
export const restoreDynastyFromSnapshot = (data: Record<string, any>): void => {
  // 1. Clear out all potentially conflicting keys from the previous session.
  clearActiveSessionData();

  // 2. Iterate over the imported data and set each item in localStorage.
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (key && value !== undefined && value !== null) {
      try {
        safeLocalStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to restore key "${key}" from snapshot`, error);
      }
    }
  });
};
