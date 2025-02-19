"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getCurrentYear, getSchedule, setSchedule, setYearStats, calculateStats, getYearStats } from '@/utils/localStorage';
import { fbsTeams } from '@/utils/fbsTeams';
import { fcsTeams } from '@/utils/fcsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { AlertCircle } from 'lucide-react';

interface Game {
  id: number;
  week: number;
  location: '@' | 'vs' | 'neutral' | ' ';
  opponent: string;
  result: 'Win' | 'Loss' | 'Tie' | 'Bye' | 'N/A';
  score: string;
}

type UpdateableField = 'location' | 'opponent' | 'result' | 'score';

const SchedulePage = () => {
  const [currentYear, setYear] = useState<number>(getCurrentYear());
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [scores, setScores] = useState<{ [key: number]: { team: string; opp: string } }>({});

  const record = useMemo(() => {
    const wins = currentSchedule.filter(game => game.result === 'Win').length;
    const losses = currentSchedule.filter(game => game.result === 'Loss').length;
    return { wins, losses };
  }, [currentSchedule]);

  useEffect(() => {
    const year = getCurrentYear();
    setYear(year);
    const schedule = getSchedule(year);
    if (schedule.length === 0) {
      const newSchedule: Game[] = Array.from({ length: 21 }, (_, i) => ({
        id: i,
        week: i,
        location: 'neutral',
        opponent: 'unselected',
        result: 'N/A',
        score: ''
      }));
      setSchedule(year, newSchedule);
      setCurrentSchedule(newSchedule);
    } else {
      setCurrentSchedule(schedule);
      // Initialize scores state from existing schedule
      const initialScores: { [key: number]: { team: string; opp: string } } = {};
      schedule.forEach(game => {
        if (game.score) {
          const [team, opp] = game.score.split('-');
          initialScores[game.week] = { team, opp };
        } else {
          initialScores[game.week] = { team: '', opp: '' };
        }
      });
      setScores(initialScores);
    }
  }, []);

  const handleScoreChange = (week: number, type: 'team' | 'opp', value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    setScores(prev => {
      const newScores = {
        ...prev,
        [week]: {
          ...prev[week] || { team: '', opp: '' },
          [type]: value
        }
      };

      // If both scores are present, update the game score
      const weekScores = newScores[week];
      if (weekScores.team && weekScores.opp) {
        const game = currentSchedule[week];
        let score = `${weekScores.team}-${weekScores.opp}`;
        
        // Swap scores if needed based on result
        const teamScore = parseInt(weekScores.team);
        const oppScore = parseInt(weekScores.opp);
        if ((game.result === 'Win' && teamScore < oppScore) ||
            (game.result === 'Loss' && teamScore > oppScore)) {
          score = `${weekScores.opp}-${weekScores.team}`;
        }

        setCurrentSchedule(prev => {
          const updated = [...prev];
          updated[week] = { ...updated[week], score };
          return updated;
        });
        setHasUnsavedChanges(true);
      }

      return newScores;
    });
  };

  const updateSchedule = (week: number, field: UpdateableField, value: string) => {
    setCurrentSchedule(prevSchedule => {
      const updatedSchedule = [...prevSchedule];
      const game = { ...updatedSchedule[week] };

      switch (field) {
        case 'location':
          game.location = value as Game['location'];
          break;
        case 'opponent':
          game.opponent = value;
          break;
        case 'result':
          game.result = value as Game['result'];
          // If we have scores, check if we need to swap them
          const weekScores = scores[week];
          if (weekScores?.team && weekScores?.opp) {
            const teamScore = parseInt(weekScores.team);
            const oppScore = parseInt(weekScores.opp);
            if (!isNaN(teamScore) && !isNaN(oppScore)) {
              if ((value === 'Win' && teamScore < oppScore) ||
                  (value === 'Loss' && teamScore > oppScore)) {
                game.score = `${oppScore}-${teamScore}`;
              } else {
                game.score = `${teamScore}-${oppScore}`;
              }
            }
          }
          break;
      }

      updatedSchedule[week] = game;
      setHasUnsavedChanges(true);
      return updatedSchedule;
    });
  };

  const saveSchedule = () => {
    try {
      setSchedule(currentYear, currentSchedule);
      const calculatedStats = calculateStats(currentSchedule);
      const currentStats = getYearStats(currentYear);
      setYearStats(currentYear, { ...currentStats, ...calculatedStats });
      setHasUnsavedChanges(false);
      notifySuccess(MESSAGES.SAVE_SUCCESS);
    } catch (error) {
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win':
        return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100';
      case 'Loss':
        return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100';
      case 'Bye':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{currentYear} Schedule</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {currentSchedule.map(game => (
          <div 
            key={game.week} 
            className="grid grid-cols-12 gap-2 py-1 items-center"
          >
            <div className="col-span-1 text-sm font-medium">
              {game.week === 0 ? 'Week 0' : `Week ${game.week}`}
            </div>

            <div className="col-span-2">
              <Select
                value={game.location}
                onValueChange={(value) => updateSchedule(game.week, 'location', value)}
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

            <div className="col-span-4">
              <Select
                value={game.opponent}
                onValueChange={(value) => updateSchedule(game.week, 'opponent', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select opponent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">-- Select Team --</SelectItem>
                  <SelectItem value="BYE">BYE</SelectItem>
                  {fbsTeams.map(team => (
                    <SelectItem key={team.name} value={team.name}>
                      {team.name} {team.nickName}
                    </SelectItem>
                  ))}
                  {fcsTeams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-3">
              <Select
                value={game.result}
                onValueChange={(value) => updateSchedule(game.week, 'result', value)}
              >
                <SelectTrigger className={`h-8 ${getResultColor(game.result)}`}>
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Win">Win</SelectItem>
                  <SelectItem value="Loss">Loss</SelectItem>
                  <SelectItem value="Tie">Tie</SelectItem>
                  <SelectItem value="Bye">Bye</SelectItem>
                  <SelectItem value="N/A">Not Played</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex gap-2">
              <Input
                value={scores[game.week]?.team || ''}
                onChange={(e) => handleScoreChange(game.week, 'team', e.target.value)}
                placeholder="You"
                className="h-8 text-center w-20"
              />
              <span className="flex items-center">-</span>
              <Input
                value={scores[game.week]?.opp || ''}
                onChange={(e) => handleScoreChange(game.week, 'opp', e.target.value)}
                placeholder="Opp."
                className="h-8 text-center w-20"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-6">
        {hasUnsavedChanges && (
          <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mr-4">
            <AlertCircle className="h-5 w-5" />
            Unsaved changes
          </span>
        )}
        <Button
          onClick={saveSchedule}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!hasUnsavedChanges}
        >
          Save Schedule
        </Button>
      </div>
    </div>
  );
};

export default SchedulePage;
