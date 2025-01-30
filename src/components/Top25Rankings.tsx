// src/components/Top25Rankings.tsx
"use client";

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { fbsTeams } from '@/utils/fbsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

interface RankedTeam {
  rank: number;
  name: string;
  previousRank: number | null;
}

const Top25Rankings: React.FC = () => {
  const [rankings, setRankings] = useLocalStorage<RankedTeam[]>('top25Rankings',
    Array.from({length: 25}, (_, i) => ({ rank: i + 1, name: '', previousRank: null }))
  );

  const updateTeam = (index: number, teamName: string) => {
    const newRankings = [...rankings];
    newRankings[index] = { ...newRankings[index], name: teamName === "unranked" ? "" : teamName };
    setRankings(newRankings);
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const updateRankings = () => {
    const updatedRankings = rankings.map((team, index) => ({
      ...team,
      previousRank: team.name ? team.rank : null,
      rank: index + 1,
    }));
    setRankings(updatedRankings);
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const moveTeam = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rankings.length) return;
    const newRankings = [...rankings];
    const [movedTeam] = newRankings.splice(fromIndex, 1);
    newRankings.splice(toIndex, 0, movedTeam);
    setRankings(newRankings.map((team, index) => ({ ...team, rank: index + 1 })));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const renderRankingChange = (team: RankedTeam) => {
    if (team.previousRank === null || team.name === '') return null;
    const diff = team.previousRank - team.rank;
    if (diff > 0) {
      return <div className="text-green-500 flex items-center"><ArrowUp size={20} />{diff}</div>;
    } else if (diff < 0) {
      return <div className="text-red-500 flex items-center"><ArrowDown size={20} />{Math.abs(diff)}</div>;
    }
    return <div>-</div>;
  };

  const renderRankingColumn = (start: number, end: number) => (
    <div className="space-y-2">
      {rankings.slice(start, end).map((team, index) => (
        <div key={start + index} className="flex items-center space-x-1">
          <span className="w-10 text-right font-semibold">{team.rank}.</span>
          <Select value={team.name || "unranked"} onValueChange={(value) => updateTeam(start + index, value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unranked">  </SelectItem>
              {fbsTeams.map((teamName) => (
                <SelectItem key={teamName.name} value={teamName.name}>{teamName.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-10 text-center">{renderRankingChange(team)}</div>
          <div className="flex flex-col space-y-1">
            <Button 
              size="icon"
              variant="outline" 
              className="h-5 w-7 p-0"
              onClick={() => moveTeam(start + index, start + index - 1)}
              disabled={start + index === 0}
            >
              <ChevronUp size={15} />
            </Button>
            <Button 
              size="icon"
              variant="outline" 
              className="h-5 w-7 p-0"
              onClick={() => moveTeam(start + index, start + index + 1)}
              disabled={start + index === rankings.length - 1}
            >
              <ChevronDown size={15} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Top 25 Rankings</h1>
      <Card>
        <CardHeader className="text-xl text-center font-semibold">Current Rankings</CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {renderRankingColumn(0, 10)}
            {renderRankingColumn(10, 20)}
            {renderRankingColumn(20, 25)}
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={updateRankings} className="text-center">Update Rankings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Top25Rankings;