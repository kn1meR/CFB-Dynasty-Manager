// src/contexts/DynastyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface DynastyContextType {
  currentDynastyId: string | null;
  isDynastyLoaded: boolean;
  dataVersion: number; // --- MODIFICATION START ---
  refreshData: () => void; // Add refresh function
  // --- MODIFICATION END ---
  setCurrentDynastyId: (id: string | null) => void;
  saveDynastyData: () => void;
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
  const [dataVersion, setDataVersion] = useState(0); // --- MODIFICATION START ---

  const refreshData = () => setDataVersion(v => v + 1); // Function to trigger updates
  // --- MODIFICATION END ---

  useEffect(() => {
    if (currentDynastyId) {
      setIsDynastyLoaded(true);
      refreshData(); // Refresh data when a new dynasty is loaded
    } else {
      setIsDynastyLoaded(false);
    }
  }, [currentDynastyId]);

  const saveDynastyData = useCallback(() => {
    if (!currentDynastyId) return;
    try {
      const dynastyData: Record<string, any> = {};
      const keysToSave = [
        'coachProfile', 'currentYear', 'players', 'playerStats',
        'allRecruits', 'allTransfers', 'allAwards', 'yearRecords',
        'top25History', 'allTrophies'
      ];

      keysToSave.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try { dynastyData[key] = JSON.parse(data); } catch (e) { console.error(`Error parsing key ${key}`, e); }
        }
      });

      // --- THIS IS THE KEY CHANGE ---
      // Gather dynamic keys and add them to the top level of the object
      Object.keys(localStorage).forEach(key => {
        if (key && (key.startsWith('schedule_') || key.startsWith('yearStats_'))) {
          const data = localStorage.getItem(key);
          if (data) {
            try { dynastyData[key] = JSON.parse(data); } catch (e) { console.error(`Error parsing key ${key}`, e); }
          }
        }
      });

      localStorage.setItem(`dynasty_${currentDynastyId}`, JSON.stringify(dynastyData));
      
      const dynastiesData = localStorage.getItem('dynasties');
      if (dynastiesData && dynastyData.coachProfile && dynastyData.currentYear) {
        const dynasties = JSON.parse(dynastiesData);
        const updatedDynasties = dynasties.map((d: any) =>
          d.id === currentDynastyId
            ? { ...d, 
                coachName: dynastyData.coachProfile.coachName || d.coachName,
                schoolName: dynastyData.coachProfile.schoolName || d.schoolName,
                currentYear: dynastyData.currentYear || d.currentYear,
                lastPlayed: new Date().toISOString()
              }
            : d
        );
        localStorage.setItem('dynasties', JSON.stringify(updatedDynasties));
      }
    } catch (error) {
      console.error('Error saving dynasty data:', error);
    }
  }, [currentDynastyId]);

const value: DynastyContextType = {
    currentDynastyId,
    isDynastyLoaded,
    setCurrentDynastyId,
    saveDynastyData,
    dataVersion,    // --- MODIFICATION START ---
    refreshData,    // Expose new values
    // --- MODIFICATION END ---
  };

  return <DynastyContext.Provider value={value}>{children}</DynastyContext.Provider>;
};