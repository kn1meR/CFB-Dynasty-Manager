// src/utils/customTeamManager.ts
import { Team, fbsTeams, getTeamByName } from '@/utils/fbsTeams';
import { CustomTeamConfig } from '@/types/customTeam';

export class CustomTeamManager {
  private static STORAGE_KEY = 'customTeams';

  // Get all custom teams from storage
  static getCustomTeams(): CustomTeamConfig[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save custom teams to storage
  static saveCustomTeams(customTeams: CustomTeamConfig[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTeams));
    } catch (error) {
      console.error('Failed to save custom teams:', error);
    }
  }

  // Create a new custom team that replaces an existing team
  static createCustomTeam(config: Omit<CustomTeamConfig, 'id' | 'createdAt'>): CustomTeamConfig {
    const customTeam: CustomTeamConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const customTeams = this.getCustomTeams();
    
    // Check if this team is already replaced
    const existingIndex = customTeams.findIndex(team => team.replacedTeam === config.replacedTeam);
    
    if (existingIndex >= 0) {
      // Update existing custom team
      customTeams[existingIndex] = customTeam;
    } else {
      // Add new custom team
      customTeams.push(customTeam);
    }

    this.saveCustomTeams(customTeams);
    return customTeam;
  }

  // Remove a custom team (restore original)
  static removeCustomTeam(replacedTeamName: string): void {
    const customTeams = this.getCustomTeams();
    const filtered = customTeams.filter(team => team.replacedTeam !== replacedTeamName);
    this.saveCustomTeams(filtered);
  }

  // Get the effective team info (custom if exists, otherwise original)
  static getEffectiveTeam(teamName: string): Team | null {
    // First check if this is a custom team name
    const customTeams = this.getCustomTeams();
    const customTeam = customTeams.find(team => team.customName === teamName);
    
    if (customTeam) {
      // Return custom team data with original team's conference info
      const originalTeam = getTeamByName(customTeam.replacedTeam);
      if (originalTeam) {
        return {
          name: customTeam.customName,
          nickName: customTeam.customNickName,
          city: customTeam.customLocation,
          state: originalTeam.state, // Keep original state for administrative purposes
          conference: originalTeam.conference, // Critical: preserve conference for tracking
          stadium: customTeam.customStadium,
          abbrev: customTeam.customAbbrev
        };
      }
    }

    // Check if this team has been replaced by a custom team
    const replacementTeam = customTeams.find(team => team.replacedTeam === teamName);
    if (replacementTeam) {
      const originalTeam = getTeamByName(teamName);
      if (originalTeam) {
        return {
          name: replacementTeam.customName,
          nickName: replacementTeam.customNickName,
          city: replacementTeam.customLocation,
          state: originalTeam.state,
          conference: originalTeam.conference,
          stadium: replacementTeam.customStadium,
          abbrev: replacementTeam.customAbbrev
        };
      }
    }

    // Return original team if no custom replacement
    return getTeamByName(teamName);
  }

  // Get all available teams (originals + customs, with replacements handled)
  static getAllAvailableTeams(): Team[] {
    const customTeams = this.getCustomTeams();
    const replacedTeamNames = new Set(customTeams.map(team => team.replacedTeam));
    
    // Start with original teams that haven't been replaced
    const availableTeams = fbsTeams
      .filter(team => !replacedTeamNames.has(team.name))
      .map(team => ({ ...team })); // Create copies

    // Add custom teams
    customTeams.forEach(customTeam => {
      const originalTeam = getTeamByName(customTeam.replacedTeam);
      if (originalTeam) {
        availableTeams.push({
          name: customTeam.customName,
          nickName: customTeam.customNickName,
          city: customTeam.customLocation,
          state: originalTeam.state,
          conference: originalTeam.conference,
          stadium: customTeam.customStadium,
          abbrev: customTeam.customAbbrev
        });
      }
    });

    return availableTeams.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Check if a team name is a custom team
  static isCustomTeam(teamName: string): boolean {
    const customTeams = this.getCustomTeams();
    return customTeams.some(team => team.customName === teamName);
  }

  // Get custom team config by custom name
  static getCustomTeamConfig(customName: string): CustomTeamConfig | null {
    const customTeams = this.getCustomTeams();
    return customTeams.find(team => team.customName === customName) || null;
  }

  // Get original team name from custom name
  static getOriginalTeamName(customName: string): string | null {
    const customTeam = this.getCustomTeamConfig(customName);
    return customTeam ? customTeam.replacedTeam : null;
  }

  // Update utils/localStorage.ts calculateStats function to use effective teams
  static updateStatsCalculation(schedule: any[], schoolName: string): any {
    let wins = 0, losses = 0, pointsScored = 0, pointsAgainst = 0, conferenceWins = 0, conferenceLosses = 0;
    const currentSchool = this.getEffectiveTeam(schoolName);

    schedule.forEach(game => {
      if (!game.opponent || game.opponent === 'BYE' || game.result === 'N/A' || game.result === 'Bye') {
        return;
      }
      
      const opponentSchool = this.getEffectiveTeam(game.opponent);
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
          // Away game: first score is opponent, second is us
          pointsScored += score2;
          pointsAgainst += score1;
        } else {
          // Home/neutral game: first score is us, second is opponent
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
  }
}