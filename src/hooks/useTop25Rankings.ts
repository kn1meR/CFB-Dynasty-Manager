// src/hooks/useTop25Rankings.ts
import { useState, useEffect, useCallback } from 'react';
import { getTop25History, setTop25History } from '@/utils/localStorage';
import { useDynasty } from '@/contexts/DynastyContext';
import { useMemo } from 'react';

export interface RankedTeam {
  name: string;
  record?: string;
}

export interface Top25History {
  [year: number]: {
    [week: number]: RankedTeam[];
  };
}

export function useTop25Rankings() {
  const {
    activeWeek,
    setActiveWeek,
    top25History, // <-- This is the state from the context
    updateRankingsForWeek,
    latestUnlockedWeek,
    getRankingsForWeek,
  } = useDynasty();

  // If you need to pass currentYear, you can, but the context handles it.
  // The hook's responsibility is now just to provide the context's values.
  
  return {
    activeWeek,
    setActiveWeek,
    latestUnlockedWeek,
    getRankingsForWeek,
    updateRankingsForWeek,
    history,
  };
}
