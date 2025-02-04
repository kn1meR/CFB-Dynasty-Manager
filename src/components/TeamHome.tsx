"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getCurrentYear, setCurrentYear, getSchedule, setSchedule, getYearStats, setYearStats, calculateStats, generateYearRecord, setYearRecord} from '@/utils/localStorage';
import { validateYear } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Calendar, GraduationCap, User } from 'lucide-react';
import { Game, YearStats } from '@/types/yearRecord';

interface LocationRecord {
  wins: number;
  losses: number;
  ties: number;
}

const TeamHome: React.FC = () => {
  const router = useRouter();
  const [currentYear, setYear] = useState<number>(2024); // Start with default
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
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
    if(!validateYear(currentYear + 1)) {
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
      const newSchedule: Game[] = Array.from({ length:19 }, (_, i) => ({
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
      const emptyTop25 = Array.from({length: 25}, (_, i) => ({ rank: i + 1, name: '', previousRank: null }));
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
      <h1 className="text-3xl font-bold text-center">Team Dashboard - {currentYear}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-700 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-600 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${((yearStats.wins / (yearStats.wins + yearStats.losses)) || 0) * 283} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold">
                      {yearStats.wins}-{yearStats.losses}
                    </div>
                    <div className="text-xl mt-2">.{Math.round((yearStats.wins / (yearStats.wins + yearStats.losses) || 0) * 1000)}</div>
                  </div>
                </div>
              </div>
              <div className="text-lg font-semibold">
                Conference: {yearStats.conferenceWins}-{yearStats.conferenceLosses}
              </div>
              <div className="flex justify-around text-sm">
                <div>
                  <div className="font-semibold">Home</div>
                  <div>{homeRecord.wins}-{homeRecord.losses}{homeRecord.ties > 0 ? `-${homeRecord.ties}` : ''}</div>
                </div>
                <div>
                  <div className="font-semibold">Away</div>
                  <div>{awayRecord.wins}-{awayRecord.losses}{awayRecord.ties > 0 ? `-${awayRecord.ties}` : ''}</div>
                </div>
                <div>
                  <div className="font-semibold">Neutral</div>
                  <div>{neutralRecord.wins}-{neutralRecord.losses}{neutralRecord.ties > 0 ? `-${neutralRecord.ties}` : ''}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold">Team Stats Summary</CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Points Per Game:</span>
                <span className="font-bold">{(yearStats.pointsScored / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Points Allowed:</span>
                <span className="font-bold">{(yearStats.pointsAgainst / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Point Differential:</span>
                <span className="font-bold">{((yearStats.pointsScored - yearStats.pointsAgainst) / (yearStats.wins + yearStats.losses) || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Conf. Win %:</span>
                <span className="font-bold">{((yearStats.conferenceWins / (yearStats.conferenceWins + yearStats.conferenceLosses) || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* [Rest of the cards remain the same] */}
        
        <Card>
          <CardHeader className="text-xl font-semibold">Recent Games</CardHeader>
          <CardContent>
            <ul>
              {recentGames.map((game, index) => (
                <li key={index} className="mb-2 flex justify-between items-center">
                  <span><strong>Week {game.week}: </strong> {formatGameDisplay(game)}</span>
                  <span className={
                    game.result === 'Win' ? 'text-green-500' : 
                    game.result === 'Loss' ? 'text-red-500' : 
                    'text-gray-500 dark:text-gray-400'
                  }>
                    {game.result} {game.result !== 'Bye' && ` - ${game.score}`}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* [Rest of the existing component code remains the same] */}
        
        <Card>
          <CardHeader className="text-xl font-semibold">Upcoming Games</CardHeader>
          <CardContent>
            <ul>
              {upcomingGames.map((game, index) => (
                <li key={index} className="mb-2">
                  <strong>Week {game.week}:</strong> {formatGameDisplay(game)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold">Season Progress</CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{width: `${(currentSchedule.filter(game => game.result !== 'N/A').length / currentSchedule.length) * 100}%`}}
              ></div>
            </div>
            <p className="text-center mt-2">
              {currentSchedule.filter(game => game.result !== 'N/A').length} of {currentSchedule.length} games played
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold">Quick Links</CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/schedule" className="block">
                <Button className="w-full flex items-center justify-center">
                  <Calendar className="mr-2" size={18} />
                  View Full Schedule
                </Button>
              </Link>
              <Link href="/roster" className="block">
                <Button className="w-full flex items-center justify-center">
                  <User className="mr-2" size={18} />
                  Manage Roster
                </Button>
              </Link>
              <Link href="/recruiting" className="block">
                <Button className="w-full flex items-center justify-center">
                  <GraduationCap className="mr-2" size={18} />
                  Recruiting
                </Button>
              </Link>
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
