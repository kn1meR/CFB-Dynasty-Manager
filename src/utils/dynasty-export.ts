// src/utils/dynasty-export.ts

import { toast } from 'react-hot-toast'; // Import toast
import { getCoachProfile, getCurrentYear } from '@/utils/localStorage';

export interface DynastySnapshot {
  version: string;
  exportedAt: string;
  dynastyData: Record<string, any>;
}

export class DynastyExporter {
  public static exportCurrentDynasty(): string {
    try {
      const liveData: Record<string, any> = {};
      const keysToExport = [
        'coachProfile', 'currentYear', 'players', 'playerStats',
        'allRecruits', 'allTransfers', 'allAwards', 'yearRecords',
        'allTrophies', 'top25History'
      ];

      // 1. Grab all known, top-level keys
      keysToExport.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try { liveData[key] = JSON.parse(item); } catch { liveData[key] = item; }
        }
      });

      // 2. Grab all dynamic, year-specific keys and add them to the top level
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('schedule_') || key.startsWith('yearStats_'))) {
          const item = localStorage.getItem(key);
          if (item) { liveData[key] = JSON.parse(item); }
        }
      }
      
      const snapshot: DynastySnapshot = {
        version: "1.0.1", // Increment version for new format
        exportedAt: new Date().toISOString(),
        dynastyData: liveData
      };

      return JSON.stringify(snapshot, null, 2);

    } catch (error) {
      console.error('Error exporting dynasty:', error);
      throw new Error('Failed to create dynasty snapshot.');
    }
  }

  public static downloadDynastyBackup(): void {
    try {
      const data = this.exportCurrentDynasty();
      const snapshot = JSON.parse(data) as DynastySnapshot;
      const schoolName = snapshot.dynastyData.coachProfile?.schoolName || 'Dynasty';
      const currentYear = snapshot.dynastyData.currentYear || new Date().getFullYear();
      
      const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${schoolName}-Dynasty-${currentYear}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading dynasty backup:', error);
      toast.error('Failed to download dynasty backup.');
    }
  }
}