// src/components/SchedulePage.tsx

"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TeamLogo, ConferenceLogo } from '@/components/ui/TeamLogo';
import { getTeamWithLogo } from '@/utils/logoUtils';
import { getCurrentYear, getSchedule, setSchedule, setYearStats, calculateStats, getYearStats, getCoachProfile, getTeamRankForWeek } from '@/utils/localStorage';
import { fbsTeams, getTeamData } from '@/utils/fbsTeams';
import { fcsTeams } from '@/utils/fcsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { AlertCircle, Trophy, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { CustomTeamManager } from '@/utils/customTeamManager';
import { useDynasty } from '@/contexts/DynastyContext';

interface Game {
  id: number;
  week: number;
  location: '@' | 'vs' | 'neutral' | ' ';
  opponent: string;
  result: 'Win' | 'Loss' | 'Tie' | 'Bye' | 'N/A';
  score: string;
}

type UpdateableField = 'location' | 'opponent' | 'result' | 'score';

// --- MODIFICATION START: Added helper function for week names ---
const getWeekDisplayName = (weekNumber: number): string => {
  switch (weekNumber) {
    case 15:
      return 'Conf. Champ';
    case 16:
      return 'Army - Navy';
    case 17:
      return 'Bowl Week 1';
    case 18:
      return 'Bowl Week 2';
    case 19:
      return 'Bowl Week 3';
    case 20:
      return 'Bowl Week 4';
    default:
      return `Week ${weekNumber}`;
  }
};
// --- MODIFICATION END ---


// --- START: OPTIMIZED GameRow COMPONENT ---

interface GameRowProps {
  game: Game;
  availableTeams: any[];
  onUpdateGame: (week: number, field: UpdateableField, value: any) => void;
}

const GameRow = React.memo(({ game, availableTeams, onUpdateGame }: GameRowProps) => {
  // Local state for score inputs for immediate feedback without re-rendering the parent
  const [localTeamScore, setLocalTeamScore] = useState('');
  const [localOppScore, setLocalOppScore] = useState('');
  const currentYear = getCurrentYear();
  const opponentRank = game.opponent ? getTeamRankForWeek(game.opponent, currentYear, game.week) : null;
  const opponentDisplayName = opponentRank ? `#${opponentRank} ${game.opponent}` : game.opponent;
  

  // Effect to sync local state when the parent's data changes (e.g., initial load or auto-save update)
  useEffect(() => {
    if (game.score) {
      const [team, opp] = game.score.split('-').map(s => s.trim());
      setLocalTeamScore(team || '');
      setLocalOppScore(opp || '');
    } else {
      setLocalTeamScore('');
      setLocalOppScore('');
    }
  }, [game.score]);


  const handleScoreInput = (type: 'team' | 'opp', value: string) => {
    if (value && !/^\d+$/.test(value)) return; // Only allow numbers
    if (type === 'team') {
      setLocalTeamScore(value);
    } else {
      setLocalOppScore(value);
    }
  };
  
  // Commit the score change to the parent state onBlur
  const handleScoreBlur = () => {
    const newScore = `${localTeamScore}-${localOppScore}`;
    if (newScore !== game.score && (localTeamScore || localOppScore)) {
      onUpdateGame(game.week, 'score', newScore);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100';
      case 'Loss': return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100';
      case 'Bye': return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100';
      default: return '';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'Win': return <Trophy className="w-4 h-4 text-green-600" />;
      case 'Loss': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'Tie': return <Minus className="w-4 h-4 text-yellow-600" />;
       case 'Bye': return <Calendar className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 py-2 items-center border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      {/* Week */}
      <div className="col-span-1 text-sm font-medium">
        {/* --- MODIFICATION: Use the helper function here --- */}
        {getWeekDisplayName(game.week)}
      </div>

      {/* Location */}
      <div className="col-span-2">
        <Select
          value={game.location}
          onValueChange={(value) => onUpdateGame(game.week, 'location', value)}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="@">Away (@)</SelectItem>
            <SelectItem value="vs">Home (vs)</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value=" ">BYE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Opponent with Logo */}
      <div className="col-span-4">
         <Select
            value={game.opponent || 'NONE'}
            onValueChange={(value) => onUpdateGame(game.week, 'opponent', value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select opponent">
                {game.opponent && game.opponent !== 'BYE' && (
                  <div className="flex items-center gap-2">
                    <TeamLogo teamName={game.opponent} size="xs" />
                    <span>{opponentDisplayName}</span>
                  </div>
                )}
                {game.opponent === 'BYE' && <span>BYE</span>}
                {!game.opponent && <span>Select opponent</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="NONE">No Opponent</SelectItem>
              <SelectItem value="BYE">BYE</SelectItem>
              {availableTeams.map((team) => {
                const isCustom = CustomTeamManager.isCustomTeam(team.name);
                const isFCS = 'isFCS' in team && team.isFCS;
                
                return (
                  <SelectItem key={team.name} value={team.name}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <TeamLogo teamName={team.name} size="xs" />
                        <span>{team.name}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <ConferenceLogo conference={team.conference} size="xs" />
                        <span className="text-sm text-gray-500">
                          ({team.conference}) 
                          {isCustom && ' 🎨'}
                          {isFCS && ' (FCS)'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
      </div>

      {/* Result with Icon */}
      <div className="col-span-3">
        <Select
          value={game.result}
          onValueChange={(value) => onUpdateGame(game.week, 'result', value)}
        >
          <SelectTrigger className={`h-8 ${getResultColor(game.result)}`}>
            <SelectValue placeholder="Result">
              <div className="flex items-center gap-2">
                {getResultIcon(game.result)}
                <span>{game.result}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="Win"><div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-green-600" />Win</div></SelectItem>
             <SelectItem value="Loss"><div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-600" />Loss</div></SelectItem>
             <SelectItem value="Tie"><div className="flex items-center gap-2"><Minus className="w-4 h-4 text-yellow-600" />Tie</div></SelectItem>
             <SelectItem value="Bye"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />Bye</div></SelectItem>
             <SelectItem value="N/A">Not Played</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score */}
      <div className="col-span-2 flex gap-2">
        <Input
          value={localTeamScore}
          onChange={(e) => handleScoreInput('team', e.target.value)}
          onBlur={handleScoreBlur}
          placeholder="You"
          className="h-8 text-center w-20"
        />
        <span className="flex items-center">-</span>
        <Input
          value={localOppScore}
          onChange={(e) => handleScoreInput('opp', e.target.value)}
          onBlur={handleScoreBlur}
          placeholder="Opp."
          className="h-8 text-center w-20"
        />
      </div>
    </div>
  );
});

GameRow.displayName = 'GameRow';

// --- END: GameRow COMPONENT ---


const SchedulePage = () => {
  const [currentYear, setYear] = useState<number>(getCurrentYear());
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [teamName, setTeamName] = useState<string>('Your Team');
  const { dataVersion } = useDynasty();
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const teamData = useMemo(() => {
    return teamName ? getTeamData(teamName) : null;
  }, [teamName, dataVersion]);

  const record = useMemo(() => {
    const wins = currentSchedule.filter(game => game.result === 'Win').length;
    const losses = currentSchedule.filter(game => game.result === 'Loss').length;
    const ties = currentSchedule.filter(game => game.result === 'Tie').length;
    return { wins, losses, ties };
  }, [currentSchedule]);

  const locationRecords = useMemo(() => {
    const calculate = (location: Game['location']) => {
      const games = currentSchedule.filter(game => 
        game.location === location && game.result !== 'N/A' && game.result !== 'Bye'
      );
      return {
        wins: games.filter(game => game.result === 'Win').length,
        losses: games.filter(game => game.result === 'Loss').length,
        ties: games.filter(game => game.result === 'Tie').length,
      };
    };

    return {
      home: calculate('vs'),
      away: calculate('@'),
      neutral: calculate('neutral'),
    };
  }, [currentSchedule]);

  const debouncedSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;
  
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        setSchedule(currentYear, currentSchedule);
        
        const coachProfile = getCoachProfile();
        const schoolNameForStats = coachProfile?.schoolName || '';
        
        const calculatedStats = calculateStats(currentSchedule, schoolNameForStats);
        const currentStats = getYearStats(currentYear);
        setYearStats(currentYear, { ...currentStats, ...calculatedStats });
        
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [currentSchedule, hasUnsavedChanges, isSaving, currentYear]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, debouncedSave]);

  // ***** THE FIX IS HERE *****
  // Memoize the availableTeams array so it's not recreated on every render
  const availableTeams = useMemo(() => {
    const allTeams = CustomTeamManager.getAllAvailableTeams();
    const fcsTeamsList = fcsTeams.map((team: any) => ({
      name: typeof team === 'string' ? team : team.name,
      conference: typeof team === 'string' ? 'FCS' : (team.conference || 'FCS'),
      isFCS: true,
    }));
    return [...allTeams, ...fcsTeamsList]
      .filter(team => team && team.name)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, []); // Empty dependency array means this runs only ONCE

  useEffect(() => {
    const fetchData = () => {
        const year = getCurrentYear();
        setYear(year);

        const profile = getCoachProfile();
        setTeamName(profile?.schoolName || 'Your Team');

        const schedule = getSchedule(year);
        if (schedule.length === 0) {
          const newSchedule: Game[] = Array.from({ length: 21 }, (_, i) => ({
            id: i, week: i, location: 'neutral', opponent: '', result: 'N/A', score: ''
          }));
          setSchedule(year, newSchedule);
          setCurrentSchedule(newSchedule);
        } else {
          setCurrentSchedule(schedule);
        }
    };
    
    fetchData();
  }, [dataVersion]);

  const handleUpdateGame = useCallback((week: number, field: UpdateableField, value: any) => {
    setCurrentSchedule(prevSchedule => {
      const updatedSchedule = [...prevSchedule];
      const gameIndex = updatedSchedule.findIndex(g => g.week === week);

      if (gameIndex === -1) return prevSchedule; // Game not found, do nothing

      const game = { ...updatedSchedule[gameIndex] };

      if (field === 'score') {
        game.score = value;
        const [teamScoreStr, oppScoreStr] = value.split('-').map((s: string) => s.trim());
        const teamScore = parseInt(teamScoreStr, 10);
        const oppScore = parseInt(oppScoreStr, 10);
        if (!isNaN(teamScore) && !isNaN(oppScore)) {
            if (teamScore > oppScore) game.result = 'Win';
            else if (oppScore > teamScore) game.result = 'Loss';
            else game.result = 'Tie';
        }
      } else if (field === 'result') {
          game.result = value;
          const [teamScoreStr, oppScoreStr] = game.score.split('-').map((s: string) => s.trim());
          const teamScore = parseInt(teamScoreStr, 10);
          const oppScore = parseInt(oppScoreStr, 10);
          if (!isNaN(teamScore) && !isNaN(oppScore)) {
              if ((value === 'Win' && teamScore < oppScore) || (value === 'Loss' && teamScore > oppScore)) {
                  game.score = `${oppScore}-${teamScore}`;
              }
          }
      } else {
        game[field as 'location' | 'opponent'] = value === 'NONE' ? '' : value;
      }
      
      updatedSchedule[gameIndex] = game;
      setHasUnsavedChanges(true);
      return updatedSchedule;
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header with Team Logo */}
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-4">
          {teamData && <TeamLogo teamName={teamData.name} size="lg" />}
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {currentYear} Schedule
            </h1>
            {teamData && teamData.conference && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <ConferenceLogo conference={teamData.conference} size="sm" />
                <span className="text-lg text-gray-600 dark:text-gray-400">{teamData.conference}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{record.wins}-{record.losses}{record.ties > 0 ? `-${record.ties}` : ''}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Record</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{locationRecords.home.wins}-{locationRecords.home.losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Home Record</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{locationRecords.away.wins}-{locationRecords.away.losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Away Record</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{locationRecords.neutral.wins}-{locationRecords.neutral.losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Neutral Record</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-1">
            {currentSchedule.map(game => (
              <GameRow
                key={game.id} // Use game.id for a stable key
                game={game}
                availableTeams={availableTeams}
                onUpdateGame={handleUpdateGame}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional: Subtle saving indicator */}
      {isSaving && (
        <div className="flex justify-center items-center py-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Saving changes...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
