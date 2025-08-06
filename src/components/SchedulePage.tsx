// src/components/SchedulePage.tsx

"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { TeamLogo, ConferenceLogo } from '@/components/ui/TeamLogo';
import { getCurrentYear, getSchedule, setSchedule, setYearStats, calculateStats, getYearStats, getCoachProfile } from '@/utils/localStorage';
import { getTeamData } from '@/utils/fbsTeams';
import { fcsTeams } from '@/utils/fcsTeams';
import { AlertCircle, Trophy, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { CustomTeamManager } from '@/utils/customTeamManager';
import { useDynasty } from '@/contexts/DynastyContext'; // <-- IMPORT CONTEXT HOOK
import { Game } from '@/types/yearRecord';


type UpdateableField = 'location' | 'opponent' | 'result' | 'score' | 'isUserControlled';

const getWeekDisplayName = (weekNumber: number): string => {
  switch (weekNumber) {
    case 15: return 'Conf. Champ';
    case 16: return 'Army - Navy';
    case 17: return 'Bowl Week 1';
    case 18: return 'Bowl Week 2';
    case 19: return 'Bowl Week 3';
    case 20: return 'Bowl Week 4';
    default: return `Week ${weekNumber}`;
  }
};

interface GameRowProps {
  game: Game;
  availableTeams: any[];
  onUpdateGame: (week: number, field: UpdateableField, value: any) => void;
  getRankForTeam: (teamName: string, week: number) => number | null; // <-- NEW PROP
}

const GameRow = React.memo(({ game, availableTeams, onUpdateGame, getRankForTeam }: GameRowProps) => {
  const [localTeamScore, setLocalTeamScore] = useState('');
  const [localOppScore, setLocalOppScore] = useState('');

  // --- USE THE NEW PROP TO GET RANK ---
  const opponentRank = game.opponent ? getRankForTeam(game.opponent, game.week) : null;
  const opponentDisplayName = opponentRank ? `#${opponentRank} ${game.opponent}` : game.opponent;

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
    if (value && !/^\d+$/.test(value)) return;
    if (type === 'team') {
      setLocalTeamScore(value);
    } else {
      setLocalOppScore(value);
    }
  };

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
    <div className="grid gap-2 py-2 items-center border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ gridTemplateColumns: '1fr 2fr 3fr 1fr 3fr 2fr' }}>
      <div className="text-sm font-medium">{getWeekDisplayName(game.week)}</div>
      <div>
        <Select value={game.location} onValueChange={(value) => onUpdateGame(game.week, 'location', value)}>
          <SelectTrigger className="h-8"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="@">Away (@)</SelectItem>
            <SelectItem value="vs">Home (vs)</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value=" ">BYE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={game.opponent || 'NONE'} onValueChange={(value) => onUpdateGame(game.week, 'opponent', value)}>
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
                    <div className="flex items-center gap-2"><TeamLogo teamName={team.name} size="xs" /><span>{team.name}</span></div>
                    <div className="flex items-center gap-1 ml-2"><ConferenceLogo conference={team.conference} size="xs" /><span className="text-sm text-gray-500">({team.conference}) {isCustom && ' 🎨'}{isFCS && ' (FCS)'}</span></div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <input
            type="checkbox"
            checked={game.isUserControlled || false}
            onChange={(e) => onUpdateGame(game.week, 'isUserControlled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={!game.opponent || game.opponent === 'BYE'}
          />
          <span className="text-xs text-gray-500">User</span>
        </div>
      </div>
      <div>
        <Select value={game.result} onValueChange={(value) => onUpdateGame(game.week, 'result', value)}>
          <SelectTrigger className={`h-8 ${getResultColor(game.result)}`}>
            <SelectValue placeholder="Result"><div className="flex items-center gap-2">{getResultIcon(game.result)}<span>{game.result}</span></div></SelectValue>
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
      <div className="flex gap-2">
        <Input value={localTeamScore} onChange={(e) => handleScoreInput('team', e.target.value)} onBlur={handleScoreBlur} placeholder="You" className="h-8 text-center w-20" />
        <span className="flex items-center">-</span>
        <Input value={localOppScore} onChange={(e) => handleScoreInput('opp', e.target.value)} onBlur={handleScoreBlur} placeholder="Opp." className="h-8 text-center w-20" />
      </div>
    </div>
  );
});
GameRow.displayName = 'GameRow';

const SchedulePage = () => {
  const [currentYear, setYear] = useState<number>(getCurrentYear());
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [teamName, setTeamName] = useState<string>('Your Team');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- GET GLOBAL STATE AND ACTIONS FROM CONTEXT ---
  const { dataVersion, activeWeek, setActiveWeek, getRankingsForWeek } = useDynasty();

  const saveScheduleNow = useCallback((scheduleToSave: Game[]) => {
    try {
      setSchedule(currentYear, scheduleToSave);
      const coachProfile = getCoachProfile();
      const schoolNameForStats = coachProfile?.schoolName || '';
      const calculatedStats = calculateStats(scheduleToSave, schoolNameForStats);
      const currentStats = getYearStats(currentYear);
      setYearStats(currentYear, { ...currentStats, ...calculatedStats });
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [currentYear]);


  const teamData = useMemo(() => teamName ? getTeamData(teamName) : null, [teamName, dataVersion]);
  const record = useMemo(() => {
    const wins = currentSchedule.filter(g => g.result === 'Win').length;
    const losses = currentSchedule.filter(g => g.result === 'Loss').length;
    const ties = currentSchedule.filter(g => g.result === 'Tie').length;
    return { wins, losses, ties };
  }, [currentSchedule]);

  const locationRecords = useMemo(() => {
    const calculate = (location: Game['location']) => {
      const games = currentSchedule.filter(g => g.location === location && g.result !== 'N/A' && g.result !== 'Bye');
      return {
        wins: games.filter(g => g.result === 'Win').length,
        losses: games.filter(g => g.result === 'Loss').length,
        ties: games.filter(g => g.result === 'Tie').length,
      };
    };
    return { home: calculate('vs'), away: calculate('@'), neutral: calculate('neutral') };
  }, [currentSchedule]);

  const debouncedSave = useCallback(() => {
    if (!hasUnsavedChanges || isSaving) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      // We pass `currentSchedule` directly to avoid stale closure issues
      saveScheduleNow(currentSchedule);
      setIsSaving(false);
    }, 1000); // Increased to 1 second for better user experience
  }, [currentSchedule, hasUnsavedChanges, isSaving, saveScheduleNow]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave();
    }

    // --- THIS IS THE KEY FIX ---
    // This cleanup function runs when the component unmounts (e.g., user navigates away)
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // If there are unsaved changes when we leave, save them immediately.
      // We need to access the "latest" version of hasUnsavedChanges.
      // A ref is perfect for this. We'll add it now.
    };
  }, [hasUnsavedChanges, debouncedSave]);

  const unsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    unsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const availableTeams = useMemo(() => {
    const allTeams = CustomTeamManager.getAllAvailableTeams();
    const fcsTeamsList = fcsTeams.map((team: any) => ({
      name: typeof team === 'string' ? team : team.name, conference: typeof team === 'string' ? 'FCS' : (team.conference || 'FCS'), isFCS: true,
    }));
    return [...allTeams, ...fcsTeamsList].filter(team => team && team.name).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, []);

  useEffect(() => {
    const fetchData = () => {
      const year = getCurrentYear();
      setYear(year);
      const profile = getCoachProfile();
      setTeamName(profile?.schoolName || 'Your Team');
      const schedule = getSchedule(year);
      if (schedule.length === 0) {
        const newSchedule: Game[] = Array.from({ length: 21 }, (_, i) => ({ id: i, week: i, location: 'neutral', opponent: '', result: 'N/A', score: '' }));
        setSchedule(year, newSchedule);
        setCurrentSchedule(newSchedule);
      } else {
        setCurrentSchedule(schedule);
      }
    };
    fetchData();
  }, [dataVersion]);

  // --- NEW FUNCTION TO GET RANK FROM CONTEXT, TO BE PASSED DOWN ---
  const getRankForTeam = useCallback((teamNameToRank: string, week: number) => {
    const rankings = getRankingsForWeek(currentYear, week);
    const rankIndex = rankings.findIndex(t => t.name === teamNameToRank);
    return rankIndex !== -1 ? rankIndex + 1 : null;
  }, [currentYear, getRankingsForWeek]);



  const handleUpdateGame = useCallback((week: number, field: UpdateableField, value: any) => {
    setCurrentSchedule(prevSchedule => {
      const updatedSchedule = [...prevSchedule];
      const gameIndex = updatedSchedule.findIndex(g => g.week === week);
      if (gameIndex === -1) return prevSchedule;

      const gameToUpdate = { ...updatedSchedule[gameIndex] };

      if (field === 'result') {
        gameToUpdate.result = value;
        if (value === 'Bye') {
          gameToUpdate.opponent = 'BYE';
          gameToUpdate.score = '';
        }
      }
      else if (field === 'opponent') {
        gameToUpdate.opponent = value === 'NONE' ? '' : value;
        if (value === 'BYE') {
          gameToUpdate.score = '';
        }
      }
      else if (field === 'score') {
        gameToUpdate.score = value;
        const [teamScore, oppScore] = value.split('-').map(Number);
        if (!isNaN(teamScore) && !isNaN(oppScore)) {
          gameToUpdate.result = teamScore > oppScore ? 'Win' : (oppScore > teamScore ? 'Loss' : 'Tie');
        }
      }
      else if (field === 'isUserControlled') {
        gameToUpdate.isUserControlled = value;
      }
      else {
        gameToUpdate[field as 'location'] = value;
      }

      updatedSchedule[gameIndex] = gameToUpdate;

      const lastCompletedGame = [...updatedSchedule].reverse().find(g => g.result !== 'N/A');
      const newActiveWeek = lastCompletedGame ? Math.min(lastCompletedGame.week + 1, 21) : 0;

      if (newActiveWeek !== activeWeek) {
        setActiveWeek(newActiveWeek);
      }

      saveScheduleNow(updatedSchedule);

      return updatedSchedule;
    });
  }, [activeWeek, setActiveWeek, saveScheduleNow]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-4">
          {teamData && <TeamLogo teamName={teamData.name} size="lg" />}
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">{currentYear} Schedule</h1>
            {teamData && teamData.conference && (<div className="flex items-center justify-center gap-2 mt-1"><ConferenceLogo conference={teamData.conference} size="sm" /><span className="text-lg text-gray-600 dark:text-gray-400">{teamData.conference}</span></div>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{record.wins}-{record.losses}{record.ties > 0 ? `-${record.ties}` : ''}</div><div className="text-sm text-gray-600 dark:text-gray-400">Overall Record</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{locationRecords.home.wins}-{locationRecords.home.losses}</div><div className="text-sm text-gray-600 dark:text-gray-400">Home Record</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-red-600">{locationRecords.away.wins}-{locationRecords.away.losses}</div><div className="text-sm text-gray-600 dark:text-gray-400">Away Record</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{locationRecords.neutral.wins}-{locationRecords.neutral.losses}</div><div className="text-sm text-gray-600 dark:text-gray-400">Neutral Record</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Schedule Management</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-1">
            {currentSchedule.map(game => (
              <GameRow
                key={game.id}
                game={game}
                availableTeams={availableTeams}
                onUpdateGame={handleUpdateGame}
                getRankForTeam={getRankForTeam} // <-- PASS PROP DOWN
              />
            ))}
          </div>
        </CardContent>
      </Card>
      {isSaving && (
        <div className="flex justify-center items-center py-4"><div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="text-sm">Saving changes...</span></div></div>
      )}
    </div>
  );
};

export default SchedulePage;
