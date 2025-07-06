// src/components/DynastyLaunch.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { fbsTeams } from '@/utils/fbsTeams';
import { toast } from 'react-hot-toast';
import { Trophy, Plus, Calendar, User, School, Trash2, Play, Upload } from 'lucide-react';
import { TeamLogo } from '@/components/ui/TeamLogo';
import Papa from 'papaparse';
import { clearActiveSessionData, restoreDynastyFromSnapshot } from '@/utils/localStorage';
import { DynastySnapshot } from '@/utils/dynasty-export';

interface Dynasty {
  id: string;
  coachName: string;
  schoolName: string;
  currentYear: number;
  createdAt: string;
  lastPlayed: string;
  seasonsPlayed: number;
  totalWins: number;
  totalLosses: number;
  championships: number;
}

interface DynastyLaunchProps {
  onDynastySelected: (dynastyId: string) => void;
}

interface ImportedData {
  coachProfile?: { coachName: string; schoolName: string; }; // Make coachProfile optional to handle older formats if needed
  currentYear?: number;
  players?: any[];
  playerStats?: any[];
  allRecruits?: any[];
  allTransfers?: any[];
  allTrophies?: any[];
  top25History?: any;
  schedulesAndStats?: Record<string, any>;
}

const DynastyLaunch: React.FC<DynastyLaunchProps> = ({ onDynastySelected }) => {
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newDynasty, setNewDynasty] = useState({
    coachName: '',
    schoolName: '',
    customTeamName: '',
    currentYear: 2025
  });
  const [schoolColorPresets, setSchoolColorPresets] = useState<Record<string, { primary: string; secondary: string; accent: string }>>({});

  useEffect(() => {
    const loadSchoolColors = async () => {
      try {
        const response = await fetch('/fbsColors.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const csvContent = await response.text();
        const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: true, skipEmptyLines: true, delimitersToGuess: [','] });
        const presets: Record<string, any> = {};
        parsed.data.forEach((row: any) => {
          if (row.Team && row['Color 1'] && row['Color 2']) {
            presets[row.Team] = { primary: row['Color 1'], secondary: row['Color 2'], accent: row['Color 3'] || row['Color 1'] };
          }
        });
        setSchoolColorPresets(presets);
      } catch (error) {
        console.error('Error loading school colors in DynastyLaunch:', error);
      }
    };
    loadSchoolColors();
  }, []);

  const loadDynasties = useCallback(() => {
    try {
      const savedDynasties = localStorage.getItem('dynasties');
      if (savedDynasties) {
        const dynastiesData = JSON.parse(savedDynasties);
        const updatedDynasties = dynastiesData.map((dynasty: Dynasty) => {
          const dynastyData = localStorage.getItem(`dynasty_${dynasty.id}`);
          if (dynastyData) {
            try {
              const data = JSON.parse(dynastyData);
              return {
                ...dynasty,
                coachName: data.coachProfile?.coachName || dynasty.coachName,
                schoolName: data.coachProfile?.schoolName || dynasty.schoolName,
                currentYear: data.currentYear || dynasty.currentYear,
                lastPlayed: dynasty.lastPlayed
              };
            } catch { return dynasty; }
          }
          return dynasty;
        });
        setDynasties(updatedDynasties);
      }
    } catch (error) {
      console.error('Error loading dynasties:', error);
      toast.error('Error loading dynasties');
    }
  }, []);

  useEffect(() => {
    loadDynasties();
    const handleVisibilityChange = () => { if (!document.hidden) loadDynasties(); };
    const handleFocus = () => loadDynasties();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadDynasties]);

  const validateImportedData = (data: any): data is DynastySnapshot => {
    if (!data || typeof data !== 'object') return false;
    return data.version && data.dynastyData && data.dynastyData.coachProfile && data.dynastyData.currentYear;
  };

  const calculateDynastyStatsFromImport = (data: ImportedData): { wins: number; losses: number; seasonsPlayed: number } => {
    // This function will now be much simpler as we don't have yearRecords in the export
    // A more advanced calculation could be done, but for now, we reset it.
    return { wins: 0, losses: 0, seasonsPlayed: 0 };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  
  const createDynasty = useCallback(() => {
    if (!newDynasty.coachName.trim()) { toast.error('Coach name required'); return; }
    if (!newDynasty.schoolName) { toast.error('School required'); return; }

    const actualSchoolName = newDynasty.schoolName === 'CUSTOM_TEAM' ? newDynasty.customTeamName.trim() : newDynasty.schoolName;
    if (!actualSchoolName) { toast.error('Custom team name required'); return; }
    if (dynasties.find(d => d.schoolName === actualSchoolName)) { toast.error('A dynasty already exists for this school'); return; }

    const newDynastyEntry: Dynasty = {
      id: Date.now().toString(),
      coachName: newDynasty.coachName.trim(), schoolName: actualSchoolName,
      currentYear: newDynasty.currentYear, createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(), seasonsPlayed: 0,
      totalWins: 0, totalLosses: 0, championships: 0
    };

    const initializeDynastyData = (d: Dynasty) => {
        clearActiveSessionData();
        localStorage.setItem('currentDynastyId', d.id);
        const colorData = schoolColorPresets[d.schoolName] || { primary: '#3B82F6', secondary: '#EF4444', accent: '#10B981' };
        
        const coachProfile = { coachName: d.coachName, schoolName: d.schoolName, schoolColors: colorData };
        localStorage.setItem('coachProfile', JSON.stringify(coachProfile));
        localStorage.setItem('currentYear', d.currentYear.toString());
        
        const emptyDataKeys = ['players', 'playerStats', 'allRecruits', 'allTransfers', 'allAwards', 'yearRecords', 'allTrophies'];
        emptyDataKeys.forEach(key => localStorage.setItem(key, JSON.stringify([])));
        
        localStorage.setItem('top25Rankings', JSON.stringify(Array.from({ length: 25 }, () => ({ name: '', previousRank: null }))));
        
        const emptySchedule = Array.from({ length: 21 }, (_, i) => ({ id: i, week: i, location: 'vs' as const, opponent: '', result: 'N/A' as const, score: '' }));
        localStorage.setItem(`schedule_${d.currentYear}`, JSON.stringify(emptySchedule));

        const freshDynastyData = {
            coachProfile, currentYear: d.currentYear,
            players: [], playerStats: [], allRecruits: [], allTransfers: [], allAwards: [], yearRecords: [], allTrophies: [],
            top25Rankings: JSON.parse(localStorage.getItem('top25Rankings')!),
            [`schedule_${d.currentYear}`]: emptySchedule,
        };
        localStorage.setItem(`dynasty_${d.id}`, JSON.stringify(freshDynastyData));
    };

    initializeDynastyData(newDynastyEntry);
    
    const updatedDynasties = [...dynasties, newDynastyEntry];
    setDynasties(updatedDynasties);
    localStorage.setItem('dynasties', JSON.stringify(updatedDynasties));
    
    setShowCreateModal(false);
    setNewDynasty({ coachName: '', schoolName: '', customTeamName: '', currentYear: 2024 });
    toast.success('Dynasty created successfully!');

    window.dispatchEvent(new StorageEvent('storage', { key: 'dynastyLoaded', newValue: newDynastyEntry.id }));
    onDynastySelected(newDynastyEntry.id);

  }, [newDynasty, dynasties, schoolColorPresets, onDynastySelected]);
  
   const loadDynasty = useCallback((dynasty: Dynasty) => {
    try {
      const dynastyDataString = localStorage.getItem(`dynasty_${dynasty.id}`);
      if (!dynastyDataString) {
        toast.error("Could not find saved data for this dynasty.");
        return;
      }
      
      const dataToLoad = JSON.parse(dynastyDataString);
      
      // The restore function is now perfectly matched with the data structure
      restoreDynastyFromSnapshot(dataToLoad);
      
      localStorage.setItem('currentDynastyId', dynasty.id);
      
      onDynastySelected(dynasty.id);

      toast.success(`Loaded ${dynasty.schoolName} dynasty!`);
    } catch (error) {
      console.error('Error loading dynasty:', error);
      toast.error('Error loading dynasty');
    }
  }, [onDynastySelected]);

   const importDynasty = useCallback(async () => {
    if (!selectedFile) { toast.error('Please select a file to import'); return; }
    setIsImporting(true);
    try {
      const text = await selectedFile.text();
      const snapshot: DynastySnapshot = JSON.parse(text);

      if (!validateImportedData(snapshot)) {
        throw new Error('Invalid or corrupted dynasty snapshot file.');
      }
      
      const { coachName, schoolName } = snapshot.dynastyData.coachProfile;
      if (dynasties.find(d => d.schoolName === schoolName)) {
        throw new Error(`A dynasty for ${schoolName} already exists.`);
      }

      // Create the new dynasty metadata entry
      const newDynastyEntry: Dynasty = {
        id: Date.now().toString(),
        coachName,
        schoolName,
        currentYear: snapshot.dynastyData.currentYear,
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        seasonsPlayed: (snapshot.dynastyData.yearRecords || []).length, // A better calculation
        totalWins: 0, // Could be calculated, but 0 is safe
        totalLosses: 0,
        championships: 0,
      };

      const updatedDynasties = [...dynasties, newDynastyEntry];
      localStorage.setItem('dynasties', JSON.stringify(updatedDynasties));
      setDynasties(updatedDynasties);

      // --- THIS IS THE KEY SIMPLIFICATION ---
      // Save the inner dynastyData object, which is now flat and correct.
      localStorage.setItem(`dynasty_${newDynastyEntry.id}`, JSON.stringify(snapshot.dynastyData));
      
      // Clean up the UI
      setShowImportModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      toast.success(`Dynasty for ${schoolName} imported! Loading now...`);
      
      loadDynasty(newDynastyEntry);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  }, [selectedFile, dynasties, onDynastySelected, loadDynasty]);
  
  const deleteDynasty = (dynastyId: string) => {
    try {
      const updatedDynasties = dynasties.filter(d => d.id !== dynastyId);
      setDynasties(updatedDynasties);
      localStorage.setItem('dynasties', JSON.stringify(updatedDynasties));
      localStorage.removeItem(`dynasty_${dynastyId}`);
      toast.success('Dynasty deleted successfully');
    } catch (error) {
      console.error('Error deleting dynasty:', error);
      toast.error('Error deleting dynasty');
    }
  };

  // --- MODIFICATION START: Change date formatting ---
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  // --- MODIFICATION END ---
  
  const getSchoolInfo = (schoolName: string) => fbsTeams.find(team => team.name === schoolName) || null;
  
  const calculateDynastyRecord = (dynastyId: string) => {
    try {
      const dynastyData = localStorage.getItem(`dynasty_${dynastyId}`);
      if (!dynastyData) return { wins: 0, losses: 0, seasonsPlayed: 0 };
      
      const data = JSON.parse(dynastyData);
      let totalWins = 0;
      let totalLosses = 0;
      let seasonsPlayed = 0;
      const completedSeasons = new Set<number>();

      // 1. Calculate stats from completed seasons in yearRecords
      if (data.yearRecords && Array.isArray(data.yearRecords)) {
        seasonsPlayed = data.yearRecords.length;
        data.yearRecords.forEach((record: any) => {
          if (record.overallRecord && record.year) {
            const [wins, losses] = record.overallRecord.split('-').map((n: string) => parseInt(n) || 0);
            totalWins += wins;
            totalLosses += losses;
            completedSeasons.add(record.year);
          }
        });
      }

      // 2. Check if the current season is in-progress and add its stats
      const currentYear = data.currentYear;
      if (currentYear && !completedSeasons.has(currentYear)) {
        const currentScheduleKey = `schedule_${currentYear}`;
        if (data[currentScheduleKey] && Array.isArray(data[currentScheduleKey])) {
          const schedule = data[currentScheduleKey];
          const currentYearWins = schedule.filter((game: any) => game.result === 'Win').length;
          const currentYearLosses = schedule.filter((game: any) => game.result === 'Loss').length;
          
          if (currentYearWins > 0 || currentYearLosses > 0) {
            totalWins += currentYearWins;
            totalLosses += currentYearLosses;
            seasonsPlayed++; // The current season counts if games have been played
          }
        }
      }

      return { wins: totalWins, losses: totalLosses, seasonsPlayed };
    } catch (error) {
      console.error(`Error calculating record for dynasty ${dynastyId}:`, error);
      return { wins: 0, losses: 0, seasonsPlayed: 0 };
    }
  };
  
  return (
    <div className="relative min-h-screen bg-gradient-to-bl from-gray-700 via-plum-900 to-slateblue-500 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.4),_transparent_70%)] mix-blend-screen animate-flicker pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2),_transparent_70%)] mix-blend-screen animate-flicker pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="h-12 w-12 text-yellow-400" />
            CFB Dynasty Manager
          </h1>
          <p className="text-xl text-blue-200">Pave your path to the College Football Championship!</p>
        </div>
        <div className="text-center mb-8 flex justify-center gap-4">
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
            <Plus className="mr-2 h-5 w-5" />
            Create New Dynasty
          </Button>
          <Button onClick={() => setShowImportModal(true)} size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
            <Upload className="mr-2 h-5 w-5" />
            Import Dynasty
          </Button>
        </div>
        {dynasties.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-6">Your Dynasties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynasties.map((dynasty) => {
                const schoolInfo = getSchoolInfo(dynasty.schoolName);
                const actualRecord = calculateDynastyRecord(dynasty.id);
                return (
                  <Card key={dynasty.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-3">
                        <TeamLogo teamName={dynasty.schoolName} size="lg" />
                        <div className="flex-1">
                          {dynasty.schoolName}
                          <CardDescription className="text-blue-200 mt-1">
                            Coach {dynasty.coachName} • {schoolInfo?.conference || 'Custom Team'}
                          </CardDescription>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-3">
                      <div className="flex items-center gap-2 text-blue-100"><Calendar className="h-4 w-4" /><span>Year: {dynasty.currentYear}</span></div>
                      <div className="flex items-center gap-2 text-blue-100"><User className="h-4 w-4" /><span>Seasons: {actualRecord.seasonsPlayed}</span></div>
                      <div className="text-blue-100"><span>Record: {actualRecord.wins}-{actualRecord.losses}</span></div>
                      <div className="text-blue-100"><span>Last Played: {formatDate(dynasty.lastPlayed)}</span></div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => loadDynasty(dynasty)} className="flex-1 bg-blue-600 hover:bg-blue-700"><Play className="mr-2 h-4 w-4" />Load</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Dynasty</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete the {dynasty.schoolName} dynasty? This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteDynasty(dynasty.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Start Your Dynasty</h3>
              <p className="text-blue-200 mb-6">Create your first dynasty or import an existing one to begin.</p>
            </CardContent>
          </Card>
        )}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Create New Dynasty</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label htmlFor="coachName">Coach Name</Label><Input id="coachName" value={newDynasty.coachName} onChange={(e) => setNewDynasty({ ...newDynasty, coachName: e.target.value })} placeholder="Enter your name"/></div>
              <div className="space-y-2"><Label htmlFor="schoolName">School</Label><Select value={newDynasty.schoolName} onValueChange={(value) => setNewDynasty({ ...newDynasty, schoolName: value })}><SelectTrigger><SelectValue placeholder="Select a school" /></SelectTrigger><SelectContent><SelectItem value="CUSTOM_TEAM">Custom/TeamBuilder Team</SelectItem>{fbsTeams.map(team => (<SelectItem key={team.name} value={team.name}>{team.name} ({team.conference})</SelectItem>))}</SelectContent></Select>{newDynasty.schoolName === 'CUSTOM_TEAM' && (<div className="space-y-2 mt-2"><Label htmlFor="customTeamName">Custom Team Name</Label><Input id="customTeamName" value={newDynasty.customTeamName} onChange={(e) => setNewDynasty({ ...newDynasty, customTeamName: e.target.value })} placeholder="Enter custom name"/></div>)}</div>
              <div className="space-y-2"><Label htmlFor="currentYear">Starting Year</Label><Input id="currentYear" type="number" value={newDynasty.currentYear} onChange={(e) => setNewDynasty({ ...newDynasty, currentYear: parseInt(e.target.value) || 2024 })} min={2024} max={2030}/></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button><Button onClick={createDynasty}>Create Dynasty</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Import Dynasty</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="importFile">Dynasty Export File (.json)</Label>
                        <Input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="w-full" />
                    </div>
                    {selectedFile && <div className="p-3 bg-muted rounded-md"><p className="text-sm font-medium">Selected: {selectedFile.name}</p></div>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
                    <Button onClick={importDynasty} disabled={!selectedFile || isImporting}>{isImporting ? 'Importing...' : 'Import Dynasty'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DynastyLaunch;