// src/utils/insightEngine.ts
import { Player } from '@/types/playerTypes';
import { Game, YearStats } from '@/types/yearRecord';
import { Recruit, Transfer } from '@/types/playerTypes';

export interface Insight {
  id: string;
  type: 'roster' | 'performance' | 'recruiting' | 'season' | 'development';
  category: 'roster_gap' | 'depth_chart' | 'player_development' | 'win_streak' | 'losing_streak' | 
           'schedule_difficulty' | 'season_prediction' | 'class_balance' | 'star_distribution' | 
           'position_needs' | 'transfer_suggestions' | 'bowl_eligibility' | 'graduation_impact';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation?: string;
  confidence?: number; // 0-100
  data?: any;
  actions?: InsightAction[];
  dismissible: boolean;
  createdAt: Date;
}

export interface InsightAction {
  label: string;
  type: 'navigate' | 'action' | 'external';
  payload?: any;
}

// Position depth requirements
const POSITION_DEPTH_REQUIREMENTS: Record<string, number> = {
  'QB': 2,
  'RB': 3,
  'WR': 5,
  'TE': 2,
  'LT': 2,
  'LG': 2,
  'C': 2,
  'RG': 2,
  'RT': 2,
  'LE': 2,
  'RE': 2,
  'DT': 4,
  'LOLB': 2,
  'MLB': 3,
  'ROLB': 2,
  'CB': 4,
  'FS': 2,
  'SS': 2,
  'K': 1,
  'P': 1
};

export class InsightEngine {
  static generateAllInsights(
    players: Player[],
    schedule: Game[],
    yearStats: YearStats,
    recruits: Recruit[],
    transfers: Transfer[],
    currentYear: number
  ): Insight[] {
    const insights: Insight[] = [];

    console.log('InsightEngine: Starting insight generation with:', {
      playersCount: players?.length || 0,
      scheduleCount: schedule?.length || 0,
      yearStats: yearStats || {},
      recruitsCount: recruits?.length || 0,
      transfersCount: transfers?.length || 0,
      currentYear
    });

    try {
      // Validate inputs before processing
      const safeInputs = this.validateInputs(players, schedule, yearStats, recruits, transfers, currentYear);
      
      // Generate different types of insights with error handling
      try {
        const rosterInsights = this.analyzeRosterDepth(safeInputs.players);
        insights.push(...rosterInsights);
        console.log('Generated roster insights:', rosterInsights.length);
      } catch (error) {
        console.error('Error generating roster insights:', error);
      }

      try {
        const graduationInsights = this.analyzeGraduationImpact(safeInputs.players, currentYear);
        insights.push(...graduationInsights);
        console.log('Generated graduation insights:', graduationInsights.length);
      } catch (error) {
        console.error('Error generating graduation insights:', error);
      }

      try {
        const performanceInsights = this.analyzePerformanceTrends(safeInputs.schedule);
        insights.push(...performanceInsights);
        console.log('Generated performance insights:', performanceInsights.length);
      } catch (error) {
        console.error('Error generating performance insights:', error);
      }

      try {
        const bowlInsights = this.analyzeBowlEligibility(safeInputs.schedule, safeInputs.yearStats);
        insights.push(...bowlInsights);
        console.log('Generated bowl insights:', bowlInsights.length);
      } catch (error) {
        console.error('Error generating bowl insights:', error);
      }

      try {
        const recruitingInsights = this.analyzeRecruitingBalance(safeInputs.recruits, safeInputs.players);
        insights.push(...recruitingInsights);
        console.log('Generated recruiting insights:', recruitingInsights.length);
      } catch (error) {
        console.error('Error generating recruiting insights:', error);
      }

      try {
        const seasonInsights = this.analyzeSeasonPrediction(safeInputs.schedule, safeInputs.yearStats);
        insights.push(...seasonInsights);
        console.log('Generated season insights:', seasonInsights.length);
      } catch (error) {
        console.error('Error generating season insights:', error);
      }

    } catch (error) {
      console.error('Error in insight generation:', error);
    }

    console.log('Total insights generated:', insights.length);

    // Sort by priority and date
    return insights.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private static validateInputs(players: Player[], schedule: Game[], yearStats: YearStats, recruits: Recruit[], transfers: Transfer[], currentYear: number) {
    return {
      players: Array.isArray(players) ? players.filter(p => p && typeof p === 'object' && p.position) : [],
      schedule: Array.isArray(schedule) ? schedule.filter(g => g && typeof g === 'object') : [],
      yearStats: yearStats && typeof yearStats === 'object' ? yearStats : {
        wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0,
        pointsScored: 0, pointsAgainst: 0, playersDrafted: 0,
        conferenceStanding: '', bowlGame: '', bowlResult: '' as const
      },
      recruits: Array.isArray(recruits) ? recruits.filter(r => r && typeof r === 'object') : [],
      transfers: Array.isArray(transfers) ? transfers.filter(t => t && typeof t === 'object') : [],
      currentYear: typeof currentYear === 'number' ? currentYear : new Date().getFullYear()
    };
  }

  static analyzeRosterDepth(players: Player[]): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(players) || players.length === 0) {
      // Generate a "no players" insight if the roster is empty
      insights.push({
        id: `empty-roster-${Date.now()}`,
        type: 'roster',
        category: 'roster_gap',
        priority: 'critical',
        title: 'Empty Roster',
        description: 'Your roster has no players! Start by adding players to build your team.',
        recommendation: 'Add players through recruiting, transfers, or the roster management tools.',
        confidence: 100,
        data: { totalPlayers: 0 },
        actions: [
          { label: 'Add Players', type: 'navigate', payload: '/roster' },
          { label: 'Start Recruiting', type: 'navigate', payload: '/recruiting' }
        ],
        dismissible: false,
        createdAt: new Date()
      });
      return insights;
    }

    const positionCounts: Record<string, Player[]> = {};

    // Group players by position
    players.forEach(player => {
      if (player && player.position) {
        if (!positionCounts[player.position]) {
          positionCounts[player.position] = [];
        }
        positionCounts[player.position].push(player);
      }
    });

    // Check each position for depth issues
    Object.entries(POSITION_DEPTH_REQUIREMENTS).forEach(([position, required]) => {
      const currentPlayers = positionCounts[position] || [];
      const currentCount = currentPlayers.length;

      if (currentCount === 0) {
        insights.push({
          id: `roster-gap-${position}-${Date.now()}`,
          type: 'roster',
          category: 'roster_gap',
          priority: 'critical',
          title: `No ${position} on Roster!`,
          description: `You have 0 players at ${position}. This is a critical roster gap that needs immediate attention.`,
          recommendation: `Immediately recruit a ${position} or explore the transfer portal for available players.`,
          confidence: 100,
          data: { position, currentCount, required, gap: required - currentCount },
          actions: [
            { label: 'View Recruiting', type: 'navigate', payload: '/recruiting' },
            { label: 'Check Transfers', type: 'navigate', payload: '/transfers' }
          ],
          dismissible: false,
          createdAt: new Date()
        });
      } else if (currentCount < required) {
        const gap = required - currentCount;
        insights.push({
          id: `roster-thin-${position}-${Date.now()}`,
          type: 'roster',
          category: 'depth_chart',
          priority: gap >= required * 0.5 ? 'high' : 'medium',
          title: `Thin at ${position}`,
          description: `Only ${currentCount} ${position}${currentCount > 1 ? 's' : ''} on roster. Recommended: ${required}`,
          recommendation: `Consider recruiting ${gap} more ${position}${gap > 1 ? 's' : ''} or developing current players.`,
          confidence: 85,
          data: { position, currentCount, required, gap },
          actions: [
            { label: 'View Roster', type: 'navigate', payload: '/roster' },
            { label: 'Recruiting Tools', type: 'navigate', payload: '/tools' }
          ],
          dismissible: true,
          createdAt: new Date()
        });
      }
    });

    return insights;
  }

  static analyzeGraduationImpact(players: Player[], currentYear: number): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(players) || players.length === 0) return insights;

    const seniors = players.filter(player => 
      player && 
      player.year && 
      typeof player.year === 'string' && 
      player.year.includes('SR') && 
      !player.year.includes('SR (RS)')
    );
    
    if (seniors.length === 0) return insights;

    // Group seniors by position
    const seniorsByPosition: Record<string, Player[]> = {};
    seniors.forEach(senior => {
      if (senior && senior.position) {
        if (!seniorsByPosition[senior.position]) {
          seniorsByPosition[senior.position] = [];
        }
        seniorsByPosition[senior.position].push(senior);
      }
    });

    // Analyze impact by position
    Object.entries(seniorsByPosition).forEach(([position, positionSeniors]) => {
      const totalAtPosition = players.filter(p => p && p.position === position).length;
      const seniorCount = positionSeniors.length;
      const impactPercentage = totalAtPosition > 0 ? (seniorCount / totalAtPosition) * 100 : 0;

      if (impactPercentage >= 50) {
        insights.push({
          id: `graduation-${position}-${Date.now()}`,
          type: 'development',
          category: 'graduation_impact',
          priority: impactPercentage >= 75 ? 'critical' : 'high',
          title: `Heavy ${position} Graduation`,
          description: `Losing ${seniorCount} of ${totalAtPosition} ${position}s (${Math.round(impactPercentage)}%) after this season.`,
          recommendation: `Prioritize recruiting ${position} or developing underclassmen. Consider redshirting promising freshmen.`,
          confidence: 95,
          data: { 
            position, 
            graduatingPlayers: positionSeniors, 
            impactPercentage: Math.round(impactPercentage),
            remainingPlayers: totalAtPosition - seniorCount
          },
          actions: [
            { label: 'View Seniors', type: 'navigate', payload: '/roster' },
            { label: 'Recruiting Plan', type: 'navigate', payload: '/recruiting' }
          ],
          dismissible: true,
          createdAt: new Date()
        });
      }
    });

    return insights;
  }

  static analyzePerformanceTrends(schedule: Game[]): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(schedule) || schedule.length === 0) return insights;

    const playedGames = schedule.filter(game => 
      game && 
      typeof game === 'object' &&
      game.result !== 'N/A' && 
      game.result !== 'Bye' && 
      game.opponent &&
      game.opponent.trim() !== '' &&
      game.opponent !== 'BYE'
    );

    if (playedGames.length < 3) return insights;

    // Check for win/loss streaks
    const recentGames = playedGames.slice(-5); // Last 5 games
    const wins = recentGames.filter(game => game.result === 'Win').length;
    const losses = recentGames.filter(game => game.result === 'Loss').length;

    // Win streak detection
    if (wins >= 3 && wins > losses) {
      insights.push({
        id: `win-streak-${Date.now()}`,
        type: 'performance',
        category: 'win_streak',
        priority: 'low',
        title: `${wins}-Game Win Streak`,
        description: `Team has won ${wins} of the last ${recentGames.length} games.`,
        recommendation: `Keep the momentum going! Focus on maintaining current strategies.`,
        confidence: 85,
        data: { wins, totalGames: recentGames.length, games: recentGames },
        actions: [
          { label: 'View Schedule', type: 'navigate', payload: '/schedule' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    }

    // Losing streak detection
    if (losses >= 3 && losses > wins) {
      insights.push({
        id: `losing-streak-${Date.now()}`,
        type: 'performance',
        category: 'losing_streak',
        priority: 'high',
        title: `${losses}-Game Losing Streak`,
        description: `Team has lost ${losses} of the last ${recentGames.length} games.`,
        recommendation: `Consider adjusting game plan, reviewing player rotations, or focusing on recruiting.`,
        confidence: 90,
        data: { losses, totalGames: recentGames.length, games: recentGames },
        actions: [
          { label: 'View Roster', type: 'navigate', payload: '/roster' },
          { label: 'Check Recruiting', type: 'navigate', payload: '/recruiting' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  static analyzeBowlEligibility(schedule: Game[], yearStats: YearStats): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(schedule) || schedule.length === 0) return insights;
    if (!yearStats || typeof yearStats !== 'object') return insights;

    const playedGames = schedule.filter(game => 
      game && 
      typeof game === 'object' &&
      game.result !== 'N/A' && 
      game.result !== 'Bye' && 
      game.opponent &&
      game.opponent.trim() !== '' &&
      game.opponent !== 'BYE'
    );
    
    const remainingGames = schedule.filter(game => 
      game &&
      typeof game === 'object' &&
      game.result === 'N/A' && 
      game.opponent && 
      game.opponent !== 'BYE' &&
      game.opponent.trim() !== ''
    ).length;

    if (playedGames.length < 6) return insights; // Too early in season

    const currentWins = yearStats.wins || 0;
    const currentLosses = yearStats.losses || 0;
    const winsNeeded = Math.max(0, 6 - currentWins);

    // Bowl eligibility insights
    if (currentWins >= 6) {
      insights.push({
        id: `bowl-eligible-${Date.now()}`,
        type: 'season',
        category: 'bowl_eligibility',
        priority: 'low',
        title: 'Bowl Eligible!',
        description: `With ${currentWins} wins, your team has achieved bowl eligibility.`,
        recommendation: `Focus on improving bowl positioning and conference standings.`,
        confidence: 100,
        data: { currentWins, currentLosses, bowlEligible: true },
        actions: [
          { label: 'View Schedule', type: 'navigate', payload: '/schedule' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    } else if (winsNeeded <= remainingGames && remainingGames > 0) {
      insights.push({
        id: `bowl-watch-${Date.now()}`,
        type: 'season',
        category: 'bowl_eligibility',
        priority: 'medium',
        title: `${winsNeeded} Wins Needed for Bowl`,
        description: `Need ${winsNeeded} more wins from ${remainingGames} remaining games for bowl eligibility.`,
        recommendation: winsNeeded <= remainingGames / 2 ? 
          `On track for bowl eligibility - maintain current performance.` :
          `Must win most remaining games to reach bowl eligibility.`,
        confidence: 80,
        data: { currentWins, winsNeeded, remainingGames, bowlEligible: false },
        actions: [
          { label: 'View Schedule', type: 'navigate', payload: '/schedule' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    } else if (remainingGames > 0 && winsNeeded > remainingGames) {
      insights.push({
        id: `bowl-unlikely-${Date.now()}`,
        type: 'season',
        category: 'bowl_eligibility',
        priority: 'high',
        title: 'Bowl Eligibility Unlikely',
        description: `Need ${winsNeeded} wins but only ${remainingGames} games remaining.`,
        recommendation: `Focus on player development and recruiting for next season.`,
        confidence: 95,
        data: { currentWins, winsNeeded, remainingGames, bowlEligible: false },
        actions: [
          { label: 'View Recruiting', type: 'navigate', payload: '/recruiting' },
          { label: 'Player Development', type: 'navigate', payload: '/roster' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  static analyzeRecruitingBalance(recruits: Recruit[], players: Player[]): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(recruits) || recruits.length === 0) return insights;
    
    // Analyze star distribution in latest recruiting class
    const validRecruits = recruits.filter(r => r && typeof r === 'object' && r.recruitedYear);
    if (validRecruits.length === 0) return insights;

    const latestYear = Math.max(...validRecruits.map(r => r.recruitedYear));
    const latestClass = validRecruits.filter(r => r.recruitedYear === latestYear);
    
    if (latestClass.length === 0) return insights;

    const starDistribution = latestClass.reduce((acc, recruit) => {
      if (recruit.stars) {
        const stars = parseInt(recruit.stars.toString());
        if (!isNaN(stars)) {
          acc[stars] = (acc[stars] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<number, number>);

    const fiveStars = starDistribution[5] || 0;
    const fourStars = starDistribution[4] || 0;
    const threeStars = starDistribution[3] || 0;
    const totalRecruits = latestClass.length;

    // Analyze recruiting class quality
    if (fiveStars + fourStars < totalRecruits * 0.3 && totalRecruits > 10) {
      insights.push({
        id: `recruiting-quality-${Date.now()}`,
        type: 'recruiting',
        category: 'star_distribution',
        priority: 'medium',
        title: 'Low Star Recruiting Class',
        description: `Only ${fiveStars + fourStars} high-rated recruits (4★+) in ${totalRecruits}-player class.`,
        recommendation: `Focus on landing higher-rated prospects or improving recruiting efficiency through coaching upgrades.`,
        confidence: 80,
        data: { 
          totalRecruits, 
          highRatedCount: fiveStars + fourStars,
          starDistribution,
          classYear: latestYear
        },
        actions: [
          { label: 'Recruiting Tools', type: 'navigate', payload: '/tools' },
          { label: 'View Class', type: 'navigate', payload: '/recruiting' }
        ],
        dismissible: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  static analyzeSeasonPrediction(schedule: Game[], yearStats: YearStats): Insight[] {
    const insights: Insight[] = [];
    
    if (!Array.isArray(schedule) || schedule.length === 0) return insights;
    if (!yearStats || typeof yearStats !== 'object') return insights;

    const playedGames = schedule.filter(game => 
      game && 
      typeof game === 'object' &&
      game.result !== 'N/A' && 
      game.result !== 'Bye' && 
      game.opponent &&
      game.opponent.trim() !== '' &&
      game.opponent !== 'BYE'
    );
    
    const remainingGames = schedule.filter(game => 
      game &&
      typeof game === 'object' &&
      game.result === 'N/A' && 
      game.opponent &&
      game.opponent.trim() !== '' &&
      game.opponent !== 'BYE'
    ).length;

    if (playedGames.length < 3 || remainingGames === 0) return insights;

    const currentWins = yearStats.wins || 0;
    const currentLosses = yearStats.losses || 0;
    const totalGames = playedGames.length + remainingGames;
    
    // Simple prediction based on current win percentage
    const currentWinRate = playedGames.length > 0 ? currentWins / playedGames.length : 0;
    const projectedWins = Math.round(currentWinRate * totalGames);
    const projectedLosses = totalGames - projectedWins;

    let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (projectedWins >= 10) priority = 'low';
    else if (projectedWins >= 8) priority = 'medium';
    else if (projectedWins >= 6) priority = 'medium';
    else priority = 'high';

    insights.push({
      id: `season-prediction-${Date.now()}`,
      type: 'season',
      category: 'season_prediction',
      priority,
      title: `Projected Record: ${projectedWins}-${projectedLosses}`,
      description: `Based on current ${currentWins}-${currentLosses} record and ${Math.round(currentWinRate * 100)}% win rate.`,
      recommendation: currentWinRate >= 0.7 ? 
        `Strong season pace! Focus on maintaining performance and preparing for postseason.` :
        `Consider strategic adjustments to improve win rate in remaining games.`,
      confidence: Math.min(90, 50 + (playedGames.length * 5)), // More confident with more games played
      data: { 
        currentWins, 
        currentLosses, 
        projectedWins, 
        projectedLosses,
        currentWinRate: Math.round(currentWinRate * 100),
        gamesPlayed: playedGames.length,
        remainingGames
      },
      actions: [
        { label: 'View Schedule', type: 'navigate', payload: '/schedule' }
      ],
      dismissible: true,
      createdAt: new Date()
    });

    return insights;
  }
}