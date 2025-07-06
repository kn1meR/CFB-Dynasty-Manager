import { Player } from '@/types/playerTypes';
import { YearRecord } from '@/types/yearRecord';
import { Award } from '@/types/statTypes';

interface AppData {
  players: Player[];
  yearRecords: YearRecord[];
  allAwards: Award[];
  currentYear: number;
  coachName: string;
  schoolName: string;
  settings: Record<string, any>;
}

export class DataManager {
  public static exportData(): string {
    console.log('Starting data export...');
    try {
      console.log('Building data object...');
      const data: AppData = {
        players: JSON.parse(localStorage.getItem('players') || '[]'),
        yearRecords: JSON.parse(localStorage.getItem('yearRecords') || '[]'),
        allAwards: JSON.parse(localStorage.getItem('allAwards') || '[]'),
        currentYear: parseInt(localStorage.getItem('currentYear') || new Date().getFullYear().toString()),
        coachName: localStorage.getItem('coachName') || '',
        schoolName: localStorage.getItem('schoolName') || '',
        settings: {}
      };

      // Export any additional settings
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !['players', 'yearRecords', 'allAwards', 'currentYear', 'coachName', 'schoolName'].includes(key)) {
          const value = localStorage.getItem(key);
          try {
            data.settings[key] = value ? JSON.parse(value) : null;
          } catch {
            data.settings[key] = value; // Store as string if can't parse JSON
          }
        }
      }

      console.log('Data object built:', data);
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export data');
    }
  }

  public static importData(jsonData: string): void {
    try {
      const data: AppData = JSON.parse(jsonData);
      
      if (!this.validateData(data)) {
        throw new Error('Invalid data format');
      }

      localStorage.clear();

      localStorage.setItem('players', JSON.stringify(data.players));
      localStorage.setItem('yearRecords', JSON.stringify(data.yearRecords));
      localStorage.setItem('allAwards', JSON.stringify(data.allAwards));
      localStorage.setItem('currentYear', data.currentYear.toString());
      localStorage.setItem('coachName', data.coachName);
      localStorage.setItem('schoolName', data.schoolName);

      Object.entries(data.settings).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }

  public static downloadBackup(): void {
    try {
      const data = this.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dynasty-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw new Error('Failed to download backup');
    }
  }

  public static async loadBackup(file: File): Promise<void> {
    try {
      const text = await file.text();
      this.importData(text);
    } catch (error) {
      console.error('Error loading backup:', error);
      throw new Error('Failed to load backup');
    }
  }

  private static validateData(data: any): boolean {
    return (
      Array.isArray(data.players) &&
      Array.isArray(data.yearRecords) &&
      Array.isArray(data.allAwards) &&
      typeof data.currentYear === 'number' &&
      typeof data.coachName === 'string' &&
      typeof data.schoolName === 'string' &&
      typeof data.settings === 'object'
    );
  }
}