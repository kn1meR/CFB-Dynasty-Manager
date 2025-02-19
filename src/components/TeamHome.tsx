"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getCurrentYear, setCurrentYear, getSchedule, setSchedule, getYearStats, setYearStats, calculateStats, generateYearRecord, setYearRecord } from '@/utils/localStorage';
import { validateYear } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import { Calendar, GraduationCap, User } from 'lucide-react';
import { Game, YearStats } from '@/types/yearRecord';
import { PlayerStat } from '@/types/playerStats';
import { Player } from '@/types/playerTypes';
import TeamOverviewCard from '@/components/TeamOverviewCard';

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
  const [currentYear, setYear] = useState<number>(2024); // Start with default
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [yearStats, setCurrentYearStats] = useState<YearStats>({
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statLeaders, setStatLeaders] = useState<StatLeaders>({});

  const getStatLeaders = () => {
    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '[]');
    const currentYearStats = playerStats.filter((stat: PlayerStat) => stat.year === currentYear);

    return {
      passingLeader: currentYearStats
        .filter((stat: PlayerStat) => stat.category === 'Passing')
        .sort((a: PlayerStat, b: PlayerStat) => (b.passyards || 0) - (a.passyards || 0))[0],

      rushingLeader: currentYearStats
        .filter((stat: PlayerStat) => stat.category === 'Rushing')
        .sort((a: PlayerStat, b: PlayerStat) => (b.rushyards || 0) - (a.rushyards || 0))[0],

      receivingLeader: currentYearStats
        .filter((stat: PlayerStat) => stat.category === 'Receiving')
        .sort((a: PlayerStat, b: PlayerStat) => (b.recyards || 0) - (a.recyards || 0))[0],

      tacklesLeader: currentYearStats
        .filter((stat: PlayerStat) => stat.category === 'Defense')
        .sort((a: PlayerStat, b: PlayerStat) =>
          ((b.solo || 0) + (b.assists || 0)) - ((a.solo || 0) + (a.assists || 0))
        )[0]
    };
  };

  // Update year from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedYear = localStorage.getItem('currentYear');
      if (storedYear) {
        setYear(parseInt(storedYear));
      }
    }
  }, []);

  // Fetch data based on current year
  useEffect(() => {
    const fetchData = () => {
      if (typeof window === 'undefined') return;

      try {
        const schedule = getSchedule(currentYear);
        setCurrentSchedule(schedule);
        const stats = getYearStats(currentYear);
        setCurrentYearStats(stats);
        const leaders = getStatLeaders();
        setStatLeaders(leaders);
        const storedPlayers = localStorage.getItem('players');
        if (storedPlayers) {
          setPlayers(JSON.parse(storedPlayers));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentYear' && e.newValue) {
        const newYear = parseInt(e.newValue);
        if (newYear !== currentYear) {
          setYear(newYear);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [currentYear]);

  const endYear = () => {
    if (!validateYear(currentYear + 1)) {
      toast.error('Invalid next year. Please check year and try again')
      return;
    }

    try {
      // Save current year's schedule and stats
      setSchedule(currentYear, currentSchedule);
      const calculatedStats = calculateStats(currentSchedule);
      setYearStats(currentYear, calculatedStats);

      // Get existing trophies before year change
      const existingTrophies = JSON.parse(localStorage.getItem('allTrophies') || '[]');

      let yearRecord = generateYearRecord(currentYear, yearStats, currentSchedule);

      // Store Year Record
      setYearRecord(currentYear, yearRecord);

      // Move to next year
      const newYear = currentYear + 1;
      setYear(newYear);
      localStorage.setItem('currentYear', newYear.toString());

      // Reset schedule for new year
      const newSchedule: Game[] = Array.from({ length: 21 }, (_, i) => ({
        id: i,
        week: i,
        location: 'neutral',
        opponent: 'unselected',
        result: 'N/A',
        score: ''
      }));
      setCurrentSchedule(newSchedule);
      setSchedule(newYear, newSchedule);
      setCurrentYearStats({
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
      });

      // Reset Top 25 rankings
      const emptyTop25 = Array.from({ length: 25 }, (_, i) => ({ rank: i + 1, name: '', previousRank: null }));
      localStorage.setItem('top25Rankings', JSON.stringify(emptyTop25));

      // Restore trophies after year change
      localStorage.setItem('allTrophies', JSON.stringify(existingTrophies));

      router.refresh();
      toast.success('Year ended successfully. Welcome to the new season!');
    } catch (error) {
      console.error('Error ending year:', error);
      toast.error('Failed to end the year. Please try again.');
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const recentGames = currentSchedule.filter(game => game.result !== 'N/A').slice(-5);
  const upcomingGames = currentSchedule.filter(game => game.result === 'N/A').slice(0, 5);

  const formatGameDisplay = (game: Game) => {
    switch (game.location) {
      case 'neutral':
        return `vs ${game.opponent}`;
      case '@':
        return `@ ${game.opponent}`;
      case 'vs':
        return `vs ${game.opponent}`;
      case ' ':
        return `BYE ${game.opponent}`;
      default:
        return game.opponent;
    }
  };

  const calculateLocationRecord = (location: '@' | 'vs' | 'neutral'): LocationRecord => {
    const filteredGames = currentSchedule.filter(game =>
      game.location === location && game.result !== 'N/A' && game.result !== 'Bye'
    );

    return {
      wins: filteredGames.filter(game => game.result === 'Win').length,
      losses: filteredGames.filter(game => game.result === 'Loss').length,
      ties: filteredGames.filter(game => game.result === 'Tie').length
    };
  };

  const homeRecord = calculateLocationRecord('vs');
  const awayRecord = calculateLocationRecord('@');
  const neutralRecord = calculateLocationRecord('neutral');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Team Dashboard • {currentYear}</h1>

      <TeamOverviewCard players={players} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Team Record</CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center h-[250px]">
              {/* Record Circle */}
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-600 dark:text-blue-400 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${((yearStats.wins / (yearStats.wins + yearStats.losses)) || 0) * 289} 289`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold mb-1">
                    {yearStats.wins}-{yearStats.losses}
                  </div>
                  <div className="text-xl text-gray-500 dark:text-gray-400">
                    .{Math.round((yearStats.wins / (yearStats.wins + yearStats.losses) || 0) * 1000).toFixed(0).padStart(3, '0')}
                  </div>
                </div>
              </div>

              {/* Conference Record */}
              <div className="text-center mb-4">
                <div className="text-gray-500 dark:text-gray-400">Conference</div>
                <div className="text-2xl font-bold">
                  {yearStats.conferenceWins}-{yearStats.conferenceLosses}
                </div>
              </div>

              {/* Location Records */}
              <div className="grid grid-cols-3 gap-8 w-full">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400">Home</div>
                  <div className="text-lg font-semibold">
                    {homeRecord.wins}-{homeRecord.losses}{homeRecord.ties > 0 ? `-${homeRecord.ties}` : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400">Away</div>
                  <div className="text-lg font-semibold">
                    {awayRecord.wins}-{awayRecord.losses}{awayRecord.ties > 0 ? `-${awayRecord.ties}` : ''}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400">Neutral</div>
                  <div className="text-lg font-semibold">
                    {neutralRecord.wins}-{neutralRecord.losses}{neutralRecord.ties > 0 ? `-${neutralRecord.ties}` : ''}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Upcoming Games</CardHeader>
          <CardContent className="p-0"> {/* Remove default padding for full-width items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingGames.map((game, index) => (
                <div key={index} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-16 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Week</div>
                    <div className="text-xl font-bold">{game.week}</div>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="text-lg font-semibold">
                      {game.opponent !== 'BYE' ? game.opponent : 'BYE WEEK'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {game.location === '@' ? 'Away' :
                        game.location === 'vs' ? 'Home' :
                          game.location === 'neutral' ? 'Neutral Site' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Recent Games</CardHeader>
          <CardContent className="p-0"> {/* Remove default padding for full-width items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-16 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Week</div>
                    <div className="text-xl font-bold">{game.week}</div>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="text-lg font-semibold">
                      {game.opponent !== 'BYE' ? game.opponent : 'BYE WEEK'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {game.location === '@' ? 'Away' :
                        game.location === 'vs' ? 'Home' :
                          game.location === 'neutral' ? 'Neutral Site' : ''}
                    </div>
                  </div>
                  {game.result !== 'Bye' && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${game.result === 'Win' ? 'text-green-600 dark:text-green-400' :
                        game.result === 'Loss' ? 'text-red-600 dark:text-red-400' :
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                        {game.score}
                      </div>
                      <div className={`text-sm ${game.result === 'Win' ? 'text-green-500 dark:text-green-400' :
                        game.result === 'Loss' ? 'text-red-500 dark:text-red-400' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                        {game.result}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Season Progress</CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-[250px]">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-600 dark:text-blue-400 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="46"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${(currentSchedule.filter(game => game.result !== 'N/A').length / currentSchedule.length) * 289} 289`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold">
                    {currentSchedule.filter(game => game.result !== 'N/A').length}/{currentSchedule.length}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current Week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Team Stats Summary</CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Points Per Game */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="w-32 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(yearStats.pointsScored / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">PPG</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Points Per Game</div>
                </div>
              </div>

              {/* Points Allowed */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="w-32 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {(yearStats.pointsAgainst / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">PA</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Points Allowed</div>
                </div>
              </div>

              {/* Point Differential */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="w-32 text-center">
                  <div className={`text-2xl font-bold ${((yearStats.pointsScored - yearStats.pointsAgainst) / (yearStats.wins + yearStats.losses) || 0) > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    {((yearStats.pointsScored - yearStats.pointsAgainst) / (yearStats.wins + yearStats.losses) || 0) > 0 ? '+' : ''}
                    {((yearStats.pointsScored - yearStats.pointsAgainst) / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">DIFF</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Point Differential</div>
                </div>
              </div>

              {/* Conference Win % */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="w-32 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {((yearStats.conferenceWins / (yearStats.conferenceWins + yearStats.conferenceLosses) || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">CONF</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Conference Win %</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold pb-2 text-center">Team Stat Leaders</CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Passing Leader */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Passing</div>
                  <div className="font-semibold">{statLeaders.passingLeader?.name || 'No stats'}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statLeaders.passingLeader ? statLeaders.passingLeader.passyards : '-'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">YDS</div>
                </div>
              </div>

              {/* Rushing Leader */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rushing</div>
                  <div className="font-semibold">{statLeaders.rushingLeader?.name || 'No stats'}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statLeaders.rushingLeader ? statLeaders.rushingLeader.rushyards : '-'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">YDS</div>
                </div>
              </div>

              {/* Receiving Leader */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Receiving</div>
                  <div className="font-semibold">{statLeaders.receivingLeader?.name || 'No stats'}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statLeaders.receivingLeader ? statLeaders.receivingLeader.recyards : '-'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">YDS</div>
                </div>
              </div>

              {/* Tackles Leader */}
              <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tackles</div>
                  <div className="font-semibold">{statLeaders.tacklesLeader?.name || 'No stats'}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {statLeaders.tacklesLeader ?
                      (statLeaders.tacklesLeader.solo || 0) + (statLeaders.tacklesLeader.assists || 0) :
                      '-'
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">TKL</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="px-8 py-4 text-lg">End Year</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to end the year?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will save the current year's data and start a new year. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={endYear}>End Year</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default TeamHome;
