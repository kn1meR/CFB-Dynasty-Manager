// src/app/schedule/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getCurrentYear, getSchedule, setSchedule, setYearStats, calculateStats, getYearStats } from '@/utils/localStorage';
import { validateScore } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import { fbsTeams } from '@/utils/fbsTeams';
import { fcsTeams } from '@/utils/fcsTeams';
import { Game } from '@/types/yearRecord';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

const results = ['Win', 'Loss', 'Tie', 'Bye', 'N/A'] as const;
const locations = ['@', 'vs', 'neutral', ' '] as const;

const SchedulePage: React.FC = () => {
  const [currentYear, setYear] = useState<number>(getCurrentYear());
  const [currentSchedule, setCurrentSchedule] = useState<Game[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const year = getCurrentYear();
    setYear(year);
    const schedule = getSchedule(year);
    if (schedule.length === 0) {
      const newSchedule: Game[] = Array.from({ length: 19 }, (_, i) => ({
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
    }
  }, []);

  const updateSchedule = (week: number, field: keyof Game, value: string) => {
    setCurrentSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(game =>
        game.week === week ? { ...game, [field]: value } : game
      );

      if (field === 'score' && !validateScore(value)) {
        setErrors(prev => ({ ...prev, [`score-${week}`]: 'Invalid score format. Use "00-00".' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`score-${week}`];
          return newErrors;
        });
      }

      return updatedSchedule;
    });
  };

  const saveSchedule = () => {
    try {
      setSchedule(currentYear, currentSchedule);
      const calculatedStats = calculateStats(currentSchedule);
      const currentStats = getYearStats(currentYear);
      setYearStats(currentYear, { ...currentStats, ...calculatedStats });
      notifySuccess(MESSAGES.SAVE_SUCCESS);
    } catch (error) {
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win':
        return 'bg-green-200 dark:bg-green-800';
      case 'Loss':
        return 'bg-red-200 dark:bg-red-800';
      case 'Bye':
        return 'bg-gray-100 dark:bg-gray-700';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">{currentYear} Team Schedule</h1>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="text-center w-1/12">Week</th>
                <th className="text-center w-1/12">Location</th>
                <th className="text-center w-1/3">Opponent</th>
                <th className="text-center w-1/6">Result</th>
                <th className="text-center w-1/4">Your Points - Opp Points</th>
              </tr>
            </thead>
            <tbody>
              {currentSchedule.map(game => (
                <tr key={game.week}>
                  <td className="text-center">
                    {game.week === 0 ? 'Week 0' : `Week ${game.week}`}
                  </td>
                  <td className="text-center">
                    <Select
                      value={game.location}
                      onValueChange={(value) => updateSchedule(game.week, 'location', value as Game['location'])}
                    >
                      <SelectTrigger className="w-full text-center">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="@">@</SelectItem>
                        <SelectItem value="vs">vs</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="BYE">BYE</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="text-center">
                    <Select
                      value={game.opponent}
                      onValueChange={(value) => updateSchedule(game.week, 'opponent', value)}
                    >
                      <SelectTrigger className="w-full text-center">
                        <SelectValue placeholder="Select opponent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unselected">-- Select Team --</SelectItem>
                        <SelectItem key={'BYE'} value='BYE'>BYE</SelectItem>
                        {fbsTeams.map(team => (
                          <SelectItem key={team.name} value={team.name}>{team.name + ' ' + team.nickName}</SelectItem>
                        ))}
                        {fcsTeams.map(team => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className={`text-center ${getResultColor(game.result)}`}>
                    <Select
                      value={game.result}
                      onValueChange={(value) => updateSchedule(game.week, 'result', value as Game['result'])}
                    >
                      <SelectTrigger className="w-full text-center">
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        {results.map(result => (
                          <SelectItem key={result} value={result}>
                            {result === 'N/A' ? 'Not Played' : result}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="text-center">
                    <Input
                      value={game.score}
                      onChange={(e) => updateSchedule(game.week, 'score', e.target.value)}
                      placeholder="Enter score"
                      className={`w-full text-center ${errors[`score-${game.week}`] ? 'border-red-500' : ''}`}
                    />
                    {errors[`score-${game.week}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`score-${game.week}`]}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={saveSchedule}>Save Schedule</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SchedulePage;
