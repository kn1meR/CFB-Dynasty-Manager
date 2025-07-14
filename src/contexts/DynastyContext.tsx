// src/contexts/DynastyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getTop25History, getSchedule } from '@/utils/localStorage'; // <-- Import getSchedule
import { RankedTeam, Top25History } from '@/hooks/useTop25Rankings';

interface DynastyContextType {
  currentDynastyId: string | null;
  isDynastyLoaded: boolean;
  dataVersion: number;
  refreshData: () => void;
  setCurrentDynastyId: (id: string | null) => void;
  saveDynastyData: () => void;
  latestUnlockedWeek: number;

  // --- NEW STATE & ACTIONS ---
  activeWeek: number;
  top25History: Top25History;
  setActiveWeek: (week: number) => void;
  advanceWeek: () => void;
  updateRankingsForWeek: (year: number, week: number, rankings: RankedTeam[]) => void;
  getRankingsForWeek: (year: number, week: number) => RankedTeam[];
}

const DynastyContext = createContext<DynastyContextType | undefined>(undefined);

export const useDynasty = () => {
  const context = useContext(DynastyContext);
  if (context === undefined) {
    throw new Error('useDynasty must be used within a DynastyProvider');
  }
  return context;
};

interface DynastyProviderProps {
  children: ReactNode;
}

export const DynastyProvider: React.FC<DynastyProviderProps> = ({ children }) => {
  const [currentDynastyId, setCurrentDynastyId] = useState<string | null>(null);
  const [isDynastyLoaded, setIsDynastyLoaded] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [latestUnlockedWeek, setLatestUnlockedWeek] = useState(0);

  // --- NEW CENTRALIZED STATE ---
  const [activeWeek, setActiveWeekState] = useState(0);
  const [top25History, setTop25HistoryState] = useState<Top25History>({});

  const refreshData = () => setDataVersion(v => v + 1);

  // Load data when a dynasty is selected
  useEffect(() => {
    if (currentDynastyId) {
      const history = getTop25History();
      setTop25HistoryState(history);
      
      // We let TeamHome or SchedulePage determine the initial active week
      // because it's based on game progress.
      
      setIsDynastyLoaded(true);
      refreshData();
    } else {
      setIsDynastyLoaded(false);
    }
  }, [currentDynastyId]);

  const setActiveWeek = (week: number) => {
        const newWeek = Math.max(0, Math.min(week, 21)); 
        setActiveWeekState(newWeek);

        // When we set the active week based on game progression,
        // it also becomes our new "latest unlocked week".
        // We only want to increase this, never decrease it.
        if (newWeek > latestUnlockedWeek) {
            setLatestUnlockedWeek(newWeek);
        }
    };
    
    

  const advanceWeek = () => {
    setActiveWeekState(prev => Math.min(prev + 1, 21));
  };

  const updateRankingsForWeek = useCallback((year: number, week: number, newRankings: RankedTeam[]) => {
    setTop25HistoryState(prevHistory => {
      const newHistory = {
        ...prevHistory,
        [year]: {
          ...(prevHistory[year] || {}),
          [week]: newRankings,
        },
      };
      // No longer calls setTop25History. Only updates state.
      return newHistory;
    });
    refreshData();
}, []);

  const getRankingsForWeek = useCallback((year: number, week: number): RankedTeam[] => {
    const yearData = top25History[year] || {};
    // Find the latest rankings at or before the given week
    let weekToSearch = week;
    while (weekToSearch >= 0) {
      if (yearData[weekToSearch]) {
        return yearData[weekToSearch];
      }
      weekToSearch--;
    }
    // Return empty rankings if none are found
    return Array.from({ length: 25 }, () => ({ name: '' }));
  }, [top25History]);


  const saveDynastyData = useCallback(() => {
    if (!currentDynastyId) return;

    try {
      // This object will be built to represent the entire state of the dynasty.
      const dynastyData: Record<string, any> = {};
      
      // 1. Define the list of standard data keys to read from localStorage.
      // NOTE: 'top25History' is intentionally REMOVED from this list.
      const keysToReadFromStorage = [
        'coachProfile', 'currentYear', 'players', 'playerStats',
        'allRecruits', 'allTransfers', 'allAwards', 'yearRecords',
        'allTrophies'
      ];

      // 2. Read the standard keys from localStorage. These are managed by other components.
      keysToReadFromStorage.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try { 
            dynastyData[key] = JSON.parse(data); 
          } catch (e) { 
            console.error(`Error parsing key ${key} from localStorage`, e); 
          }
        }
      });

      // 3. **THE CRITICAL FIX**: Get the 'top25History' directly from the context's state.
      // This ensures the most up-to-date version is saved, preventing data loss.
      dynastyData.top25History = top25History;

      // 4. Gather dynamic, year-specific keys (like schedules and stats) from localStorage.
      Object.keys(localStorage).forEach(key => {
        if (key && (key.startsWith('schedule_') || key.startsWith('yearStats_'))) {
          const data = localStorage.getItem(key);
          if (data) {
            try { 
              dynastyData[key] = JSON.parse(data); 
            } catch (e) { 
              console.error(`Error parsing dynamic key ${key}`, e); 
            }
          }
        }
      });

      // 5. Write the complete, authoritative dynasty object to its dedicated storage slot.
      localStorage.setItem(`dynasty_${currentDynastyId}`, JSON.stringify(dynastyData));
      
      // 6. Update the main 'dynasties' list with the latest metadata for the launch screen.
      const dynastiesListData = localStorage.getItem('dynasties');
      if (dynastiesListData && dynastyData.coachProfile && dynastyData.currentYear) {
        const dynastiesList = JSON.parse(dynastiesListData);
        const updatedDynastiesList = dynastiesList.map((dynasty: any) =>
          dynasty.id === currentDynastyId
            ? { 
                ...dynasty, 
                coachName: dynastyData.coachProfile.coachName || dynasty.coachName,
                schoolName: dynastyData.coachProfile.schoolName || dynasty.schoolName,
                currentYear: dynastyData.currentYear || dynasty.currentYear,
                lastPlayed: new Date().toISOString()
              }
            : dynasty
        );
        localStorage.setItem('dynasties', JSON.stringify(updatedDynastiesList));
      }
    } catch (error) {
      console.error('Error saving dynasty data:', error);
    }
  }, [currentDynastyId, top25History]);

const value: DynastyContextType = {
    currentDynastyId,
    isDynastyLoaded,
    setCurrentDynastyId,
    saveDynastyData,
    dataVersion,
    refreshData,
    latestUnlockedWeek,
    // --- EXPOSE NEW VALUES ---
    activeWeek,
    top25History,
    setActiveWeek,
    advanceWeek,
    updateRankingsForWeek,
    getRankingsForWeek,
  };

  return <DynastyContext.Provider value={value}>{children}</DynastyContext.Provider>;
};
