// src/components/TeamHome.tsx
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
import { Calendar, Users, GraduationCap, User } from 'lucide-react';
import { Game, YearStats } from '@/types/yearRecord';

const TeamHome: React.FC = () => {
  const router = useRouter();
  const [currentYear, setYear] = useState<number>(getCurrentYear());
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

  useEffect(() => {
    const fetchData = () => {
      try {
        const year = getCurrentYear();
        setYear(year);
        const schedule = getSchedule(year);
        setCurrentSchedule(schedule);
        const stats = getYearStats(year);
        setCurrentYearStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      setCurrentYear(newYear);
      
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Team Dashboard - {currentYear}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-xl font-semibold text-center">Current Record</CardHeader>
          <CardContent>
            <p className="text-center text-5xl font-bold">
              {yearStats.wins} - {yearStats.losses} 
              <br />({yearStats.conferenceWins} - {yearStats.conferenceLosses})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold">Team Stats Summary</CardHeader>
          <CardContent>
            <p>Avg. Points Scored: <strong>{(yearStats.pointsScored / (yearStats.wins + yearStats.losses)).toFixed(1)}</strong></p>
            <p>Avg. Points Allowed: <strong>{(yearStats.pointsAgainst / (yearStats.wins + yearStats.losses)).toFixed(1)}</strong></p>
            <p>Win Percentage: <strong>{((yearStats.wins / (yearStats.wins + yearStats.losses)) * 100).toFixed(1)}%</strong></p>
            <p>Conference Win Percentage: <strong>{((yearStats.conferenceWins / (yearStats.conferenceWins + yearStats.conferenceLosses)) * 100).toFixed(1)}%</strong></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-xl font-semibold">Recent Games</CardHeader>
          <CardContent>
            <ul>
              {recentGames.map((game, index) => (
                <li key={index} className="mb-2 flex justify-between items-center">
                  <span><strong>Week {game.week}:</strong> {formatGameDisplay(game)}</span>
                  <span className={game.result === 'Win' ? 'text-green-500' : 'text-red-500'}>
                    {game.result} ({game.score})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

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
