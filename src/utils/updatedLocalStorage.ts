// src/utils/updatedLocalStorage.ts
// Updated localStorage utilities to work with custom teams
import { CustomTeamManager } from './customTeamManager';
import { Game, YearStats } from '@/types/yearRecord';

// Update the calculateStats function to use CustomTeamManager
export const calculateStatsWithCustomTeams = (schedule: Game[], schoolName: string): YearStats => {
  let wins = 0, losses = 0, pointsScored = 0, pointsAgainst = 0, conferenceWins = 0, conferenceLosses = 0;
  const currentSchool = CustomTeamManager.getEffectiveTeam(schoolName);

  schedule.forEach(game => {
    if (!game.opponent || game.opponent === 'BYE' || game.result === 'N/A' || game.result === 'Bye') {
      return;
    }
    
    const opponentSchool = CustomTeamManager.getEffectiveTeam(game.opponent);
    const isConferenceGame = !!(currentSchool && opponentSchool && 
      currentSchool.conference === opponentSchool.conference);

    if (game.result === 'Win') {
      wins++;
      if (isConferenceGame) conferenceWins++;
    } else if (game.result === 'Loss') {
      losses++;
      if (isConferenceGame) conferenceLosses++;
    }

    // Parse scores
    if (game.score && game.score.includes('-')) {
      const [score1, score2] = game.score.split('-').map(s => parseInt(s.trim()) || 0);
      
      if (game.location === '@') {
        pointsScored += score2;
        pointsAgainst += score1;
      } else {
        pointsScored += score1;
        pointsAgainst += score2;
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
    bowlResult: ''
  };
};
