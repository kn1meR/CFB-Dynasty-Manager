"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, Save, GripVertical } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { fbsTeams } from '@/utils/fbsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

interface RankedTeam {
  name: string;
  previousRank: number | null;
}

interface Props {
  currentWeek: number;
}

const TOTAL_RANKS = 25;

const Top25Rankings: React.FC<Props> = ({ currentWeek }) => {
  const [rankings, setRankings] = useLocalStorage<RankedTeam[]>(
    'top25Rankings',
    Array.from({ length: TOTAL_RANKS }, () => ({
      name: '',
      previousRank: null
    }))
  );

  const [draggedTeam, setDraggedTeam] = useState<number | null>(null);

  // Used for optimizing SelectItem rendering
  const rankedTeamsMap = useMemo(() => {
    const map = new Map<string, number>();
    rankings.forEach((team, index) => {
      if (team.name) map.set(team.name, index);
    });
    return map;
  }, [rankings]);

  const updateTeam = useCallback((index: number, teamName: string) => {
    if (teamName !== "unranked") {
      const existingIndex = rankedTeamsMap.get(teamName);
      if (existingIndex !== undefined && existingIndex !== index) {
        notifyError(`${teamName} is already ranked at #${existingIndex + 1}`);
        return;
      }
    }

    setRankings(prev => {
      const newRankings = [...prev];
      newRankings[index] = {
        ...newRankings[index],
        name: teamName === "unranked" ? "" : teamName,
        previousRank: null
      };
      return newRankings;
    });
  }, [rankedTeamsMap]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedTeam(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedTeam === null || draggedTeam === targetIndex) {
      setDraggedTeam(null);
      return;
    }

    setRankings(prev => {
      const newRankings = [...prev];
      const [movedTeam] = newRankings.splice(draggedTeam, 1);

      // Store the original index before moving
      movedTeam.previousRank = draggedTeam + 1;

      // Insert at new position
      newRankings.splice(targetIndex, 0, movedTeam);

      // Update previousRanks for affected teams
      for (let i = Math.min(draggedTeam, targetIndex); i <= Math.max(draggedTeam, targetIndex); i++) {
        if (i !== targetIndex) {
          newRankings[i].previousRank = i + (draggedTeam < targetIndex ? 1 : -1) + 1;
        }
      }

      return newRankings;
    });

    setDraggedTeam(null);
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  }, [draggedTeam]);

  const handleDragEnd = useCallback(() => {
    setDraggedTeam(null);
  }, []);

  const renderRankingChange = useCallback((team: RankedTeam, currentIndex: number) => {
    if (!team.previousRank || !team.name) return null;

    const diff = team.previousRank - (currentIndex + 1);
    if (diff === 0) return <div className="text-gray-500">-</div>;

    return diff > 0 ? (
      <div className="text-green-500 flex items-center">
        <ArrowUp size={16} />{diff}
      </div>
    ) : (
      <div className="text-red-500 flex items-center">
        <ArrowDown size={16} />{Math.abs(diff)}
      </div>
    );
  }, []);

  const saveRankings = useCallback(() => {
    const storageKey = 'top25Rankings';
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setRankings(parsedState.map((team: RankedTeam) => ({
          name: team.name, // Preserve the team name
          previousRank: null // Reset only the previousRank
        })));
        notifySuccess('Rankings saved successfully');
      } catch (error) {
        console.error('Error saving rankings:', error);
        notifyError('Error saving rankings');
      }
    }
  }, []);

  const TeamRow = useCallback(({ team, index }: { team: RankedTeam, index: number }) => (
    <div
      draggable={!!team.name}
      onDragStart={() => handleDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
      onDragEnd={handleDragEnd}
      className={`flex items-center space-x-2 p-2 rounded transition-colors duration-150 ${draggedTeam === index ? 'bg-gray-100' : 'hover:bg-gray-50'
        } ${team.name ? 'cursor-move' : 'cursor-default'} touch-manipulation`}
      role="listitem"
      aria-label={`Rank ${index + 1}: ${team.name || 'Unranked'}`}
    >
      <div className="flex items-center space-x-2 flex-1">
        <GripVertical size={16} className={`${team.name ? 'text-gray-400' : 'text-gray-200'} touch-manipulation`} />
        <div className="font-semibold w-8 text-right">{index + 1}.</div>
        <Select
          value={team.name || "unranked"}
          onValueChange={(value) => updateTeam(index, value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unranked">Unranked</SelectItem>
            {fbsTeams.map((team) => (
              <SelectItem
                key={team.name}
                value={team.name}
                disabled={rankedTeamsMap.has(team.name) && rankedTeamsMap.get(team.name) !== index}
              >
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-16 text-center">{renderRankingChange(team, index)}</div>
      </div>
    </div>
  ), [draggedTeam, handleDragStart, handleDragOver, handleDrop, handleDragEnd, updateTeam, renderRankingChange, rankedTeamsMap]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mx-auto">Top 25 Rankings</h1>
        <Button
          variant="outline"
          onClick={saveRankings}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          Save Rankings
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-1">
              {rankings.slice(0, 9).map((team, i) => (
                <TeamRow key={i} team={team} index={i} />
              ))}
            </div>
            <div className="space-y-1">
              {rankings.slice(9, 17).map((team, i) => (
                <TeamRow key={i + 9} team={team} index={i + 9} />
              ))}
            </div>
            <div className="space-y-1">
              {rankings.slice(17, 25).map((team, i) => (
                <TeamRow key={i + 17} team={team} index={i + 17} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Top25Rankings;
