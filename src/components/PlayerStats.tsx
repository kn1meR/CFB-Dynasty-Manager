// src/components/PlayerStats.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { defensivePositions } from '@/types/playerTypes';
import PlayerCard from '@/components/PlayerCard';
import { usePlayerCard } from '@/hooks/usePlayerCard';

// Type definitions (assuming they are in separate files in a real app)
interface PlayerStat {
  id: string;
  playerName: string;
  year: number;
  category: StatCategory;
  completions?: number; attempts?: number; passyards?: number; passtd?: number; passint?: number;
  carries?: number; rushyards?: number; rushtd?: number; fumbles?: number; yac?: number; long?: number;
  receptions?: number; recyards?: number; rectd?: number; rac?: number;
  sacksallowed?: number; gp?: number; dp?: number;
  solo?: number; assists?: number; tfl?: number; sacks?: number; defint?: number; forcedfumbles?: number; deftd?: number;
  fgmade?: number; fgattempted?: number; xpmade?: number; xpattempted?: number;
  punts?: number; puntyards?: number; touchbacks?: number;
  kryards?: number; krtd?: number; pryards?: number; prtd?: number; krlong?: number; prlong?: number;
}
type StatKeys = keyof Omit<PlayerStat, 'id' | 'playerName' | 'year' | 'category'>;
type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Blocking' | 'Defense' | 'Kicking' | 'Punting' | 'Kick Return' | 'Punt Return';

interface RosterPlayer {
  id: number;
  name: string;
  position: string;
  jerseyNumber: string;
  year: string;
  rating: string;
  devTrait?: string;
  notes?: string;
}
// End type definitions

const statCategories: Record<StatCategory, string[]> = {
  'Passing': ['Completions', 'Attempts', 'Pass Yards', 'Pass TD', 'Pass Int', 'Long'],
  'Rushing': ['Carries', 'Rush Yards', 'Rush TD', 'Fumbles', 'YAC', 'Long'],
  'Receiving': ['Receptions', 'Rec Yards', 'Rec TD', 'RAC', 'Long'],
  'Blocking': ['Sacks Allowed', 'GP', 'DP'],
  'Defense': ['Solo', 'Assists', 'TFL', 'Sacks', 'Def Int', 'Forced Fumbles', 'Def TD'],
  'Kicking': ['FG Made', 'FG Attempted', 'Long', 'XP Made', 'XP Attempted'],
  'Punting': ['Punts', 'Punt Yards', 'Long', 'Touchbacks'],
  'Kick Return': ['KR Attempts', 'KR Yards', 'KR TD', 'KR Long'],
  'Punt Return': ['PR Attempts', 'PR Yards', 'PR TD', 'PR Long']
};

const displayCategories: Record<StatCategory, string[]> = {
  'Passing': ['Completions', 'Attempts', 'Pass Yards', 'Pass TD', 'Pass Int', 'Comp %', 'YPA', 'Long', 'RTG'],
  'Rushing': ['Carries', 'Rush Yards', 'AVG', 'Rush TD', 'Fumbles', 'YAC', 'Long'],
  'Receiving': ['Receptions', 'Rec Yards', 'AVG', 'Rec TD', 'RAC', 'Long'],
  'Blocking': ['Sacks Allowed', 'GP', 'DP'],
  'Defense': ['Solo', 'Assists', 'Tackles', 'TFL', 'Sacks', 'Def Int', 'Forced Fumbles', 'Def TD'],
  'Kicking': ['FG Made', 'FG Attempted', 'FG %', 'Long', 'XP Made', 'XP Attempted', 'XP %'],
  'Punting': ['Punts', 'Punt Yards', 'YPP', 'Long', 'Touchbacks'],
  'Kick Return': ['KR Attempts', 'KR Yards', 'KR TD', 'KR Long'],
  'Punt Return': ['PR Attempts', 'PR Yards', 'PR TD', 'PR Long']
};

const getEligiblePlayers = (players: RosterPlayer[], category: StatCategory): RosterPlayer[] => {
  switch (category) {
    case 'Passing': return players.filter(player => ['QB'].includes(player.position));
    case 'Rushing': return players.filter(player => ['QB', 'RB', 'FB', 'WR'].includes(player.position));
    case 'Receiving': return players.filter(player => ['WR', 'TE', 'RB', 'FB'].includes(player.position));
    case 'Blocking': return players.filter(player => ['LT', 'LG', 'C', 'RG', 'RT'].includes(player.position));
    case 'Defense': return players.filter(player => defensivePositions.includes(player.position));
    case 'Kicking': return players.filter(player => player.position === 'K');
    case 'Punting': return players.filter(player => player.position === 'P');
    case 'Kick Return': return players.filter(player => ['RB', 'WR', 'CB', 'FS', 'SS'].includes(player.position));
    case 'Punt Return': return players.filter(player => ['RB', 'WR', 'CB', 'FS', 'SS'].includes(player.position));
    default: return players;
  }
};

const calculateCompletionPercentage = (completions: number = 0, attempts: number = 0): number => {
  if (attempts === 0) return 0;
  return Number(((completions / attempts) * 100).toFixed(1));
};

const calculateAverage = (yards: number = 0, attempts: number = 0): number => {
  if (attempts === 0) return 0;
  return Number((yards / attempts).toFixed(1));
};

const calculateQBR = (stats: PlayerStat): number => {
  const completions = stats.completions || 0;
  const attempts = stats.attempts || 0;
  const yards = stats.passyards || 0;
  const touchdowns = stats.passtd || 0;
  const interceptions = stats.passint || 0;
  if (attempts === 0) return 0;
  const rating = ((8.4 * yards) + (330 * touchdowns) + (100 * completions) - (200 * interceptions)) / attempts;
  return Number(rating.toFixed(1));
};

const getDefaultSortConfig = (category: StatCategory): { key: string; direction: 'asc' | 'desc' } => {
  switch (category) {
    case 'Passing': return { key: 'Pass Yards', direction: 'desc' };
    case 'Rushing': return { key: 'Rush Yards', direction: 'desc' };
    case 'Receiving': return { key: 'Rec Yards', direction: 'desc' };
    case 'Blocking': return { key: 'DP', direction: 'desc' };
    case 'Defense': return { key: 'Tackles', direction: 'desc' };
    case 'Kicking': return { key: 'FG Made', direction: 'desc' };
    case 'Punting': return { key: 'Punt Yards', direction: 'desc' };
    case 'Kick Return': return { key: 'KR Yards', direction: 'desc' };
    case 'Punt Return': return { key: 'PR Yards', direction: 'desc' };
    default: return { key: 'Pass Yards', direction: 'desc' };
  }
};

const PlayerStats: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rosterPlayers] = useLocalStorage<RosterPlayer[]>('players', []);
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [playerStats, setPlayerStats] = useLocalStorage<PlayerStat[]>('playerStats', []);
  const [viewType, setViewType] = useState<'Season' | 'Career'>('Season');
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>('Passing');
  const { selectedPlayer, isOpen, openPlayerCard, closePlayerCard } = usePlayerCard();
  const [careerStatsDisplayCount, setCareerStatsDisplayCount] = useState(5);
  const ITEMS_PER_PAGE = 5;

  const initialStatState = useMemo(() => ({
    playerName: '',
    year: currentYear,
    category: selectedCategory
  }), [currentYear, selectedCategory]);

  const [newStat, setNewStat] = useState<Omit<PlayerStat, 'id'>>(initialStatState);

  useEffect(() => {
    setNewStat(initialStatState);
  }, [selectedCategory, initialStatState]);

  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'}>(() => getDefaultSortConfig(selectedCategory));

  const handleOpenAddModal = () => {
    setEditingId(null);
    setNewStat(initialStatState);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = useCallback((stat: PlayerStat) => {
    setEditingId(stat.id);
    setNewStat(stat);
    setIsModalOpen(true);
  }, []);

  const handlePlayerNameClick = useCallback((playerName: string) => {
    const player = rosterPlayers.find(p => p.name === playerName);
    if (player) {
      const playerForCard = {
        id: player.id, name: player.name, position: player.position, year: player.year,
        rating: player.rating, jerseyNumber: player.jerseyNumber,
        devTrait: (player.devTrait as 'Normal' | 'Impact' | 'Star' | 'Elite') || 'Normal',
        notes: player.notes || '', isRedshirted: false
      };
      openPlayerCard(playerForCard);
    } else {
      const basicPlayer = {
        id: Date.now(), name: playerName, position: 'Unknown', year: 'Unknown',
        rating: 'Unknown', jerseyNumber: '0', devTrait: 'Normal' as const,
        notes: '', isRedshirted: false
      };
      openPlayerCard(basicPlayer);
    }
  }, [rosterPlayers, openPlayerCard]);

  const getFilteredPlayers = () => {
    const eligiblePlayers = getEligiblePlayers(rosterPlayers, selectedCategory);
    return eligiblePlayers.sort((a, b) => (parseInt(a.jerseyNumber) || 0) - (parseInt(b.jerseyNumber) || 0));
  };

  const handleSave = () => {
    if (!newStat.playerName) {
      toast.error('Please select a player');
      return;
    }

    if (editingId) {
      setPlayerStats(playerStats.map(stat => stat.id === editingId ? { ...newStat, id: editingId } as PlayerStat : stat));
      toast.success('Stats updated successfully');
    } else {
      const statValues = Object.entries(newStat)
        .filter(([key]) => !['playerName', 'year', 'category'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: typeof value === 'number' ? value : 0 }), {});

      const stat: PlayerStat = {
        playerName: newStat.playerName,
        year: Number(newStat.year),
        category: selectedCategory,
        id: Date.now().toString(),
        ...statValues
      };
      setPlayerStats([...playerStats, stat]);
      toast.success('Stats added successfully');
    }
    
    setIsModalOpen(false);
    setEditingId(null);
  };

  const deleteStat = (id: string) => {
    setPlayerStats(playerStats.filter(stat => stat.id !== id));
    toast.success('Stats deleted successfully');
  };

  const getDisplayStats = useMemo(() => {
    let filteredStats = playerStats.filter(stat => stat.category === selectedCategory);
  
    if (viewType === 'Season') {
      return filteredStats.filter(stat => stat.year === currentYear);
    }
    
    const playerTotals: Record<string, PlayerStat> = {};
    filteredStats.forEach(stat => {
      const playerKey = stat.playerName;
      if (!playerTotals[playerKey]) {
        playerTotals[playerKey] = { ...stat, year: 0, id: `career-${playerKey}-${selectedCategory}` };
      } else {
        Object.entries(stat).forEach(([key, value]) => {
          if (typeof value === 'number' && key !== 'year' && key !== 'id') {
            const currentTotal = (playerTotals[playerKey] as any)[key] || 0;
            if (key.toLowerCase().includes('long')) {
              (playerTotals[playerKey] as any)[key] = Math.max(currentTotal, value);
            } else {
              (playerTotals[playerKey] as any)[key] = currentTotal + value;
            }
          }
        });
      }
    });
    return Object.values(playerTotals);
  }, [playerStats, selectedCategory, viewType, currentYear]);

  // MODIFICATION: Moved getStatValue function definition ABOVE the sortedStats useMemo hook
  const getStatValue = useCallback((stat: PlayerStat, category: string): string | number => {
    const statKey = category.toLowerCase().replace(/\s/g, '') as StatKeys;

    if (category === 'Comp %') return `${calculateCompletionPercentage(stat.completions, stat.attempts)}%`;
    if (category === 'RTG') return calculateQBR(stat);
    if (category === 'YPA') return calculateAverage(stat.passyards, stat.attempts);
    if (category === 'AVG') {
      if (selectedCategory === 'Rushing') return calculateAverage(stat.rushyards, stat.carries);
      if (selectedCategory === 'Receiving') return calculateAverage(stat.recyards, stat.receptions);
    }
    if (category === 'FG %') return `${calculateCompletionPercentage(stat.fgmade, stat.fgattempted)}%`;
    if (category === 'XP %') return `${calculateCompletionPercentage(stat.xpmade, stat.xpattempted)}%`;
    if (category === 'Tackles') return (Number(stat.solo || 0) + Number(stat.assists || 0));
    if (category === 'YPP') return calculateAverage(stat.puntyards, stat.punts);

    return (stat as any)[statKey] || 0;
  }, [selectedCategory]);

  const sortedStats = useMemo(() => {
    if (!sortConfig.key) return getDisplayStats;

    const sorted = [...getDisplayStats].sort((a, b) => {
      const aValue = getStatValue(a, sortConfig.key);
      const bValue = getStatValue(b, sortConfig.key);
      // Ensure values are numbers for comparison
      const numA = typeof aValue === 'string' ? parseFloat(aValue) : aValue;
      const numB = typeof bValue === 'string' ? parseFloat(bValue) : bValue;
      
      if (numA < numB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (numA > numB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return viewType === 'Career' ? sorted.slice(0, careerStatsDisplayCount) : sorted;
  }, [getDisplayStats, sortConfig, viewType, careerStatsDisplayCount, getStatValue]);

  const totalCareerStats = useMemo(() => viewType === 'Career' ? getDisplayStats.length : 0, [viewType, getDisplayStats]);
  const hasMoreCareerStats = viewType === 'Career' && careerStatsDisplayCount < totalCareerStats;
  const canShowLess = viewType === 'Career' && careerStatsDisplayCount > 5;
  
  useEffect(() => {
    setCareerStatsDisplayCount(10);
    setSortConfig(getDefaultSortConfig(selectedCategory));
  }, [viewType, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-center">Player Stats</h1>
        <div className="flex items-center gap-2">
          <Select value={viewType} onValueChange={(value: 'Season' | 'Career') => setViewType(value)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Season">Season</SelectItem><SelectItem value="Career">Career</SelectItem></SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={(value: StatCategory) => setSelectedCategory(value)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.keys(statCategories).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
          </Select>
          {viewType === 'Season' && (
            <Button onClick={handleOpenAddModal}><Plus className="h-4 w-4 mr-2" />Add Stats</Button>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Player Stats' : 'Add New Player Stats'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
            <div className="flex flex-col space-y-1.5 lg:col-span-4">
              <Label htmlFor="playerName">Player Name</Label>
              <Select value={newStat.playerName || ''} onValueChange={(v) => setNewStat(p => ({ ...p, playerName: v }))} disabled={!!editingId}>
                <SelectTrigger id="playerName"><SelectValue placeholder="Select Player" /></SelectTrigger>
                <SelectContent>{getFilteredPlayers().map(p => <SelectItem key={p.id} value={p.name}>{p.name} - {p.position} #{p.jerseyNumber}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {statCategories[selectedCategory].map(stat => {
              const statKey = stat.toLowerCase().replace(/\s/g, '') as StatKeys;
              return (
                <div key={stat} className="flex flex-col space-y-1.5">
                  <Label htmlFor={stat}>{stat}</Label>
                  <Input id={stat} type="number" step="0.5" value={(newStat as any)[statKey] || ''}
                    onChange={e => setNewStat(p => ({ ...p, [statKey]: parseFloat(e.target.value) || 0 }))} placeholder="0" />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Save Changes' : 'Add Stats'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>{viewType} Stats - {selectedCategory}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Name</TableHead>
              {displayCategories[selectedCategory].map(stat => (
                <TableHead key={stat} className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSortConfig(prev => ({ key: stat, direction: prev.key === stat && prev.direction === 'asc' ? 'desc' : 'asc' }))}>
                  <div className="flex items-center gap-1">{stat} {sortConfig.key === stat && (sortConfig.direction === 'asc' ? '▲' : '▼')}</div>
                </TableHead>
              ))}
              {viewType === 'Season' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow></TableHeader>
            <TableBody>
              {sortedStats.map(stat => (
                <TableRow key={stat.id}>
                  <TableCell>
                    <button onClick={() => handlePlayerNameClick(stat.playerName)}
                      className="text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer font-medium" type="button">
                      {stat.playerName}
                    </button>
                  </TableCell>
                  {displayCategories[selectedCategory].map(category => (<TableCell key={category}>{getStatValue(stat, category)}</TableCell>))}
                  {viewType === 'Season' && (
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(stat)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Stats?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteStat(stat.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(hasMoreCareerStats || canShowLess) && (
            <div className="flex justify-center gap-2 mt-4">
              {hasMoreCareerStats && <Button onClick={() => setCareerStatsDisplayCount(p => p + ITEMS_PER_PAGE)} variant="outline" className="flex items-center gap-2"><ChevronDown className="h-4 w-4" />Show More</Button>}
              {canShowLess && <Button onClick={() => setCareerStatsDisplayCount(p => Math.max(5, p - ITEMS_PER_PAGE))} variant="outline" className="flex items-center gap-2"><ChevronUp className="h-4 w-4" />Show Less</Button>}
            </div>
          )}
        </CardContent>
      </Card>
      {selectedPlayer && <PlayerCard player={selectedPlayer} isOpen={isOpen} onClose={closePlayerCard} />}
    </div>
  );
};

export default PlayerStats;