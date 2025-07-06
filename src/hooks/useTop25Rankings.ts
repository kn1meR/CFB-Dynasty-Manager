// src/hooks/useTop25Rankings.ts
import { useState, useEffect, useCallback } from 'react';
import { getTop25History, setTop25History } from '@/utils/localStorage';
import { useDynasty } from '@/contexts/DynastyContext';

export interface RankedTeam {
  name: string;
  record?: string;
}

export interface Top25History {
  [year: number]: {
    [week: number]: RankedTeam[];
  };
}

export function useTop25Rankings(currentYear: number, dynastyId: string | null) {
  const [history, setHistoryState] = useState<Top25History>(() => getTop25History());
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const { refreshData } = useDynasty();

  useEffect(() => {
    // If there's no active dynasty, do nothing.
    if (!dynastyId) return; 

    // When dynastyId changes, re-fetch the entire history from localStorage.
    // This ensures we get the data for the newly loaded dynasty.
    const newHistory = getTop25History();
    setHistoryState(newHistory);

    const yearData = newHistory[currentYear];
    if (yearData && Object.keys(yearData).length > 0) {
      const latestWeek = Math.max(0, ...Object.keys(yearData).map(Number));
      setActiveWeek(latestWeek);
    } else {
      // If no data for the current year, reset to Week 0.
      setActiveWeek(0);
    }
  }, [currentYear, dynastyId]);

  const getRankingsForWeek = useCallback((year: number, week: number): RankedTeam[] => {
    const yearData = history[year] || {};
    
    let weekToSearch = week;
    while(weekToSearch >= 0) {
        if (yearData[weekToSearch]) {
            return yearData[weekToSearch];
        }
        weekToSearch--;
    }

    return Array.from({ length: 25 }, () => ({ name: '' }));
  }, [history]);

  const updateRankingsForWeek = useCallback((week: number, newRankings: RankedTeam[]) => {
    const currentHistory = getTop25History();
    const newHistory = {
      ...currentHistory,
      [currentYear]: {
        ...(currentHistory[currentYear] || {}),
        [week]: newRankings,
      },
    };
    setTop25History(newHistory);
    setHistoryState(newHistory);

    // --- MODIFICATION START: Call refreshData instead of dispatching an event ---
    refreshData();
    // --- MODIFICATION END ---
  }, [currentYear, refreshData]);

  // --- REMOVED finalizeAndAdvance FUNCTION ---

 return {
    activeWeek,
    setActiveWeek,
    getRankingsForWeek,
    updateRankingsForWeek,
    history,
  };
}