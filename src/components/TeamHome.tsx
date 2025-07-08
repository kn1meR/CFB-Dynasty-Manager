// src/components/TeamHome.tsx

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TeamLogo, ConferenceLogo } from '@/components/ui/TeamLogo';
import { getTeamWithLogo } from '@/utils/logoUtils';
import { 
  getCurrentYear, setCurrentYear, getSchedule, setSchedule, 
  calculateStats, generateYearRecord, setYearRecord, 
  getCoachProfile, getPlayers, getPlayerStats, 
  getTeamRankForWeek, getTop25History, setTop25History, 
  getYearRecord, prepareNextSeason,
  getRecruits, getTransfers, getYearAwards
} from '@/utils/localStorage';
import { validateYear } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import { Calendar, Edit } from 'lucide-react';
import { Game, YearRecord } from '@/types/yearRecord';
import { PlayerStat } from '@/types/playerStats';
import { Player } from '@/types/playerTypes';
import TeamOverviewCard from '@/components/TeamOverviewCard';
import { usePlayerCard } from '@/hooks/usePlayerCard';
import PlayerCard from './PlayerCard';
import { useDynasty } from '@/contexts/DynastyContext';
import { Top25History } from '@/hooks/useTop25Rankings';
import { getTeamData } from '@/utils/fbsTeams';



interface LocationRecord {
  wins: number;
  losses: number;
  ties: number;
}

interface StatLeaders {
  passingLeader?: PlayerStat;
  rushingLeader?: PlayerStat;
  receivingLeader?: PlayerStat;
  tacklesLeader?: PlayerStat;
}

const TeamHome: React.FC = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState<string>('Team');
  const [currentYear, setYear] = useState<number>(() => getCurrentYear());
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentYearRecord, setCurrentYearRecord] = useState<YearRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedPlayer, isOpen, openPlayerCard, closePlayerCard } = usePlayerCard();
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const { saveDynastyData, refreshData } = useDynasty();
  const [top25History, setTop25HistoryState] = useState<Top25History>({});
  const { dataVersion } = useDynasty();
  const [currentWeek, setCurrentWeek] = useState(0);

  const teamData = useMemo(() => {
    return teamName ? getTeamData(teamName) : null;
  }, [teamName, dataVersion]);

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      if (typeof window === 'undefined') return;

      try {
        const yearToFetch = getCurrentYear();
        const profile = getCoachProfile();
        const schoolName = profile?.schoolName || 'Team';
        const schedule = getSchedule(yearToFetch);
        
        // Calculate the current week based on the last played game
        const lastPlayedGameIndex = [...schedule].reverse().findIndex(g => g.result !== 'N/A' && g.result !== 'Bye');
        const calculatedWeek = lastPlayedGameIndex !== -1 ? schedule.length - 1 - lastPlayedGameIndex + 1 : 0;
        const finalWeek = Math.min(calculatedWeek, 21); // Cap at 21
        setCurrentWeek(finalWeek);

        const rank = getTeamRankForWeek(schoolName, yearToFetch, finalWeek);
        
        setTeamName(schoolName);
        setYear(yearToFetch);
        setCurrentSchedule(schedule);
        setCurrentYearRecord(getYearRecord(yearToFetch));
        setPlayers(getPlayers());
        setTeamRank(rank);

      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load initial data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Re-fetch data when focus returns to the window to catch external changes
    window.addEventListener('focus', fetchData);
    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, [dataVersion]);

  const handlePlayerNameClick = useCallback((statLeader?: PlayerStat) => {
    if (!statLeader) return;
    const playerFromRoster = players.find(p => p.name === statLeader.playerName);
    if (playerFromRoster) {
        openPlayerCard(playerFromRoster);
    } else {
        const basicPlayer = {
            id: Date.now(), name: statLeader.playerName, position: 'Unknown', year: 'Graduated',
            rating: 'N/A', jerseyNumber: 'N/A', devTrait: 'Normal' as const,
            notes: 'Player not on current roster.', isRedshirted: false
        };
        openPlayerCard(basicPlayer);
    }
  }, [players, openPlayerCard]);

  const statLeaders = useMemo<StatLeaders>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const allPlayerStats = getPlayerStats();
      if (!allPlayerStats || allPlayerStats.length === 0) return {};
      const currentYearStats = allPlayerStats.filter(stat => stat.year === currentYear);
      const getLeader = (category: string, sortField: keyof PlayerStat) => {
        return currentYearStats.filter(stat => stat.category === category && stat[sortField] != null)
          .sort((a, b) => (Number(b[sortField]) || 0) - (Number(a[sortField]) || 0))[0];
      };
      const getTacklesLeader = () => {
        return currentYearStats.filter(stat => stat.category === 'Defense')
          .sort((a, b) => ((b.solo || 0) + (b.assists || 0)) - ((a.solo || 0) + (a.assists || 0)))[0];
      };
      return {
        passingLeader: getLeader('Passing', 'passyards'), rushingLeader: getLeader('Rushing', 'rushyards'),
        receivingLeader: getLeader('Receiving', 'recyards'), tacklesLeader: getTacklesLeader()
      };
    } catch (error) {
      console.error("Error parsing playerStats for leaders:", error);
      return {};
    }
  }, [currentYear, players]);

  const locationRecords = useMemo<{ home: LocationRecord, away: LocationRecord, neutral: LocationRecord }>(() => {
    const calculate = (location: Game['location']): LocationRecord => {
      const filteredGames = currentSchedule.filter(g => g.location === location && g.result !== 'N/A' && g.result !== 'Bye');
      return {
        wins: filteredGames.filter(g => g.result === 'Win').length,
        losses: filteredGames.filter(g => g.result === 'Loss').length,
        ties: filteredGames.filter(g => g.result === 'Tie').length,
      };
    };
    return { home: calculate('vs'), away: calculate('@'), neutral: calculate('neutral') };
  }, [currentSchedule]);

const derivedStats = useMemo(() => {
    const stats = calculateStats(currentSchedule, teamName);
    
    const { wins, losses } = stats;
    const { conferenceWins, conferenceLosses } = stats;
    
    const totalGamesPlayed = wins + losses;
    const ppg = totalGamesPlayed > 0 ? (stats.pointsScored || 0) / totalGamesPlayed : 0;
    const pa = totalGamesPlayed > 0 ? (stats.pointsAgainst || 0) / totalGamesPlayed : 0;
    const diff = ppg - pa;
    const winPct = totalGamesPlayed > 0 ? wins / totalGamesPlayed : 0;
    const totalConfGames = conferenceWins + conferenceLosses;
    const confWinPct = totalConfGames > 0 ? conferenceWins / totalConfGames : 0;

    // Correct progress value for the "Current Week" card's circle
    const weekProgress = currentWeek / 21;

    return {
      wins, losses, confWins: conferenceWins, confLosses: conferenceLosses,
      ppg: ppg.toFixed(1),
      pa: pa.toFixed(1),
      diff: diff.toFixed(1),
      diffSign: diff >= 0 ? '+' : '',
      winPct: winPct, // Pass the raw win percentage for the record card
      winPctFormatted: `.${Math.round(winPct * 1000).toString().padStart(3, '0')}`,
      confWinPctFormatted: `${(confWinPct * 100).toFixed(1)}%`,
      weekProgressValue: weekProgress * 289, // For the "Current Week" circle
    };
  }, [currentSchedule, teamName, currentWeek]);

  const endYear = useCallback(() => {
    const nextYear = currentYear + 1;
    if (!validateYear(nextYear)) {
      toast.error('Invalid next year calculated.');
      return;
    }
    try {
      // Get the most up-to-date version of the record from storage
      const finalRecord = getYearRecord(currentYear);
      const finalStats = calculateStats(currentSchedule, teamName); // Use the live schedule for stats
      
      // --- MODIFICATION START: Ensure all data is included in the final record ---
      const completeFinalRecord: YearRecord = {
        ...finalRecord,
        overallRecord: `${finalStats.wins}-${finalStats.losses}`,
        conferenceRecord: `${finalStats.conferenceWins}-${finalStats.conferenceLosses}`,
        pointsFor: String(finalStats.pointsScored),
        pointsAgainst: String(finalStats.pointsAgainst),
        schedule: currentSchedule, // Explicitly save the final state of the schedule
        recruits: getRecruits(currentYear),
        transfers: getTransfers(currentYear),
        playerAwards: getYearAwards(currentYear),
      };
      
      // Save the fully populated record for the year being ended
      setYearRecord(currentYear, completeFinalRecord);
      // --- MODIFICATION END ---
      
      prepareNextSeason(nextYear);
      setCurrentYear(nextYear);
      saveDynastyData();
      
      refreshData();

      toast.success(`Year ${currentYear} finalized. Welcome to the ${nextYear} season!`, { duration: 4000 });
    } catch (error) {
      console.error('Error ending year:', error);
      toast.error('Failed to end the year.');
    }
  }, [currentYear, currentSchedule, teamName, saveDynastyData, refreshData]);

  const recentGames = useMemo(() => currentSchedule.filter(game => game.result !== 'N/A' && game.result !== 'Bye').slice(-5), [currentSchedule]);
  const upcomingGames = useMemo(() => currentSchedule.filter(game => game.result === 'N/A' && game.opponent && game.opponent !== 'BYE').slice(0, 5), [currentSchedule]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;
  }

  const GameDisplayRow: React.FC<{ game: Game; keyPrefix: string }> = ({ game, keyPrefix }) => {
    const userTeamRank = teamName ? getTeamRankForWeek(teamName, currentYear, game.week) : null;
    const userTeamDisplayName = userTeamRank ? `#${userTeamRank} ${teamName}` : teamName;
    const opponentRank = game.opponent ? getTeamRankForWeek(game.opponent, currentYear, game.week) : null;
    const opponentDisplayName = opponentRank ? `#${opponentRank} ${game.opponent}` : game.opponent;

    return (
      <div key={`${keyPrefix}-${game.id || game.week}`} className="flex items-center p-3 sm:p-4 hover:bg-muted/50 transition-colors">
        <div className="w-12 sm:w-16 text-center"><div className="text-xs sm:text-sm text-muted-foreground">Week</div><div className="text-lg sm:text-xl font-bold">{game.week}</div></div>
        <div className="flex items-center gap-2 flex-1 ml-3 sm:ml-4">
          {teamData && <TeamLogo teamName={teamData.name} size="sm" />}
          <span className="font-medium">{userTeamDisplayName}</span>
          <span className="text-gray-400">{game.location === '@' ? 'at' : 'vs'}</span>
          {game.opponent && game.opponent !== 'BYE' && (<><TeamLogo teamName={game.opponent} size="sm" /><span>{opponentDisplayName}</span></>)}
          {game.opponent === 'BYE' && <span className="text-gray-500">BYE WEEK</span>}
          {!game.opponent && <span className="text-gray-500">TBD</span>}
        </div>
        {keyPrefix === 'recent' && game.result !== 'Bye' && (
          <div className="text-right ml-2">
            <div className={`text-base sm:text-lg font-bold ${game.result === 'Win' ? 'text-green-600 dark:text-green-400' : game.result === 'Loss' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>{game.score || 'N/A'}</div>
            <div className={`text-xs sm:text-sm ${game.result === 'Win' ? 'text-green-500 dark:text-green-400' : game.result === 'Loss' ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}>{game.result}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          {teamData && <TeamLogo teamName={teamData.name} size="xl" />}
          <div>
            <h1 className="text-3xl font-bold">
              {teamRank && <span className="text-gray-600 dark:text-gray-400"><strong>#{teamRank}</strong> - </span>}
              {teamName} Dashboard • {currentYear}
            </h1>
            {teamData && teamData.conference && (<div className="flex items-center justify-center gap-2 mt-1"><ConferenceLogo conference={teamData.conference} size="sm" /><span className="text-lg text-gray-600 dark:text-gray-400">{teamData.conference}</span></div>)}
          </div>
        </div>
      </div>
      <TeamOverviewCard players={players} teamName={teamName} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Team Record</CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center min-h-[250px]">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-gray-200 dark:text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50" />
                  {/* --- MODIFICATION START: Use winPct for this circle --- */}
                  <circle className="stroke-current progress-circle-school" strokeWidth="8" fill="transparent" r="46" cx="50" cy="50" strokeDasharray={`${derivedStats.winPct * 289} 289`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-out', color: 'var(--school-primary)' }}/>
                  {/* --- MODIFICATION END --- */}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-bold mb-1">{derivedStats.wins}-{derivedStats.losses}</div>
                  <div className="text-lg sm:text-xl text-muted-foreground">{derivedStats.winPctFormatted}</div>
                </div>
              </div>
              <div className="text-center mb-4"><div className="text-sm text-muted-foreground">Conference</div><div className="text-xl sm:text-2xl font-bold">{derivedStats.confWins}-{derivedStats.confLosses}</div></div>
              <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full text-center">
                <div><div className="text-xs sm:text-sm text-muted-foreground">Home</div><div className="text-base sm:text-lg font-semibold">{locationRecords.home.wins}-{locationRecords.home.losses}</div></div>
                <div><div className="text-xs sm:text-sm text-muted-foreground">Away</div><div className="text-base sm:text-lg font-semibold">{locationRecords.away.wins}-{locationRecords.away.losses}</div></div>
                <div><div className="text-xs sm:text-sm text-muted-foreground">Neutral</div><div className="text-base sm:text-lg font-semibold">{locationRecords.neutral.wins}-{locationRecords.neutral.losses}</div></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Upcoming Games</CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-border">{upcomingGames.length > 0 ? upcomingGames.map((game) => (<GameDisplayRow key={`upcoming-${game.id || game.week}`} game={game} keyPrefix="upcoming" />)) : <p className="p-4 text-center text-muted-foreground">No upcoming games scheduled.</p>}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Recent Results</CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-border">{recentGames.length > 0 ? recentGames.map((game) => (<GameDisplayRow key={`recent-${game.id || game.week}`} game={game} keyPrefix="recent" />)) : <p className="p-4 text-center text-muted-foreground">No games played yet.</p>}</div></CardContent>
        </Card>
         <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Current Week</CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[250px]">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-gray-200 dark:text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50" />
                  {/* --- MODIFICATION START: Use weekProgressValue for this circle --- */}
                  <circle className="stroke-current progress-circle-school" strokeWidth="8" fill="transparent" r="46" cx="50" cy="50" strokeDasharray={`${derivedStats.weekProgressValue} 289`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-out', color: 'var(--school-primary)' }}/>
                  {/* --- MODIFICATION END --- */}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                  <span className="text-3xl sm:text-4xl font-bold">{currentWeek} / 21</span>
                  <span className="text-xs sm:text-sm text-muted-foreground mt-1">Weeks Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Team Stats Summary</CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-border">
              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50"><span className="text-sm sm:text-base text-muted-foreground">Points Per Game</span><span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{derivedStats.ppg}</span></div>
              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50"><span className="text-sm sm:text-base text-muted-foreground">Points Allowed</span><span className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{derivedStats.pa}</span></div>
              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50"><span className="text-sm sm:text-base text-muted-foreground">Point Differential</span><span className={`text-lg sm:text-xl font-bold ${parseFloat(derivedStats.diff) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{derivedStats.diffSign}{derivedStats.diff}</span></div>
              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50"><span className="text-sm sm:text-base text-muted-foreground">Conference Win %</span><span className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{derivedStats.confWinPctFormatted}</span></div>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Stat Leaders</CardHeader>
          <CardContent className="p-0"><div className="divide-y divide-border">
              <div className="flex items-center p-3 sm:p-4 hover:bg-muted/50">
                <div className="flex-1 mr-2"><div className="text-xs sm:text-sm text-muted-foreground">Passing</div><div className="font-semibold truncate">{statLeaders.passingLeader ? (<button onClick={() => handlePlayerNameClick(statLeaders.passingLeader)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer" title={statLeaders.passingLeader.playerName}>{statLeaders.passingLeader.playerName}</button>) : ('N/A')}</div></div>
                <div className="text-right"><div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{statLeaders.passingLeader?.passyards ?? '-'}</div><div className="text-xs sm:text-sm text-muted-foreground">YDS</div></div>
              </div>
              <div className="flex items-center p-3 sm:p-4 hover:bg-muted/50">
                <div className="flex-1 mr-2"><div className="text-xs sm:text-sm text-muted-foreground">Rushing</div><div className="font-semibold truncate">{statLeaders.rushingLeader ? (<button onClick={() => handlePlayerNameClick(statLeaders.rushingLeader)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer" title={statLeaders.rushingLeader.playerName}>{statLeaders.rushingLeader.playerName}</button>) : ('N/A')}</div></div>
                <div className="text-right"><div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{statLeaders.rushingLeader?.rushyards ?? '-'}</div><div className="text-xs sm:text-sm text-muted-foreground">YDS</div></div>
              </div>
              <div className="flex items-center p-3 sm:p-4 hover:bg-muted/50">
                <div className="flex-1 mr-2"><div className="text-xs sm:text-sm text-muted-foreground">Receiving</div><div className="font-semibold truncate">{statLeaders.receivingLeader ? (<button onClick={() => handlePlayerNameClick(statLeaders.receivingLeader)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer" title={statLeaders.receivingLeader.playerName}>{statLeaders.receivingLeader.playerName}</button>) : ('N/A')}</div></div>
                <div className="text-right"><div className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">{statLeaders.receivingLeader?.recyards ?? '-'}</div><div className="text-xs sm:text-sm text-muted-foreground">YDS</div></div>
              </div>
              <div className="flex items-center p-3 sm:p-4 hover:bg-muted/50">
                <div className="flex-1 mr-2"><div className="text-xs sm:text-sm text-muted-foreground">Tackles</div><div className="font-semibold truncate">{statLeaders.tacklesLeader ? (<button onClick={() => handlePlayerNameClick(statLeaders.tacklesLeader)} className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer" title={statLeaders.tacklesLeader.playerName}>{statLeaders.tacklesLeader.playerName}</button>) : ('N/A')}</div></div>
                <div className="text-right"><div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{(statLeaders.tacklesLeader?.solo ?? 0) + (statLeaders.tacklesLeader?.assists ?? 0) || '-'}</div><div className="text-xs sm:text-sm text-muted-foreground">TKL</div></div>
              </div>
          </div></CardContent>
        </Card>
      </div>
      <div className="flex justify-center pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive" className="px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg">End {currentYear} Season</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>End {currentYear} Season?</AlertDialogTitle><AlertDialogDescription>This will finalize stats and records for {currentYear}, reset the schedule, and advance to the {currentYear + 1} season. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={endYear} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Confirm End Season</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {selectedPlayer && (<PlayerCard player={selectedPlayer} isOpen={isOpen} onClose={closePlayerCard} />)}
    </div>
  );
};

export default TeamHome;
