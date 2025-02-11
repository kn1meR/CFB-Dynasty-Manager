"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useLocalStorage from '@/hooks/useLocalStorage';
import { toast } from 'react-hot-toast';
import { offensePositions, defensivePositions, specialTeamsPositions } from '@/types/playerTypes';
import { ArrowUpDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface PlayerStat {
  id: string;
  name: string;
  year: number;
  category: StatCategory;
  // Passing Stats
  completions?: number;
  attempts?: number;
  passyards?: number;
  passtd?: number;
  passint?: number;
  // Rushing Stats
  carries?: number;
  rushyards?: number;
  rushtd?: number;
  fumbles?: number;
  yac?: number;
  long?: number;
  // Receiving Stats
  receptions?: number;
  recyards?: number;
  rectd?: number;
  rac?: number;
  // Blocking Stats
  sacksallowed?: number;
  gp?: number;
  dp?: number;
  // Defensive Stats
  solo?: number;
  assists?: number;
  tackles?: number;
  tfl?: number;
  sacks?: number;
  defint?: number;
  forcedfumbles?: number;
  deftd?: number;
  // Kicking Stats
  fgmade?: number;
  fgattempted?: number;
  xpmade?: number;
  xpattempted?: number;
  // Punting Stats
  punts?: number;
  puntyards?: number;
  touchbacks?: number;
  // Return Stats
  kryards?: number;
  krtd?: number;
  pryards?: number;
  prtd?: number;
  krlong?: number;
  prlong?: number;

  [key: string]: string | number | StatCategory | undefined;
}

type StatKeys = keyof Omit<PlayerStat, 'id' | 'name' | 'year' | 'category'>;

type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Blocking' | 'Defense' | 'Kicking' | 'Punting' | 'Kick Return' | 'Punt Return';

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
  'Passing': ['Completions', 'Attempts', 'Pass Yards', 'Pass TD', 'Pass Int','Comp %', 'YPA', 'Long', 'RTG'],
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
    case 'Passing':
      return players.filter(player => ['QB'].includes(player.position));
    case 'Rushing':
      return players.filter(player => ['QB', 'RB', 'FB', 'WR'].includes(player.position));
    case 'Receiving':
      return players.filter(player => ['WR', 'TE', 'RB', 'FB'].includes(player.position));
    case 'Blocking':
      return players.filter(player => ['LT', 'LG', 'C', 'RG', 'RT'].includes(player.position));
    case 'Defense':
      return players.filter(player => defensivePositions.includes(player.position));
    case 'Kicking':
      return players.filter(player => player.position === 'K');
    case 'Punting':
      return players.filter(player => player.position === 'P');
    case 'Kick Return':
      return players;
    case 'Punt Return':
      return players; // Everyone can potentially return
    default:
      return players;
  }
};

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

  // NCAA Passer Efficiency Formula
  const rating = (
    (8.4 * yards) +
    (330 * touchdowns) +
    (100 * completions) -
    (200 * interceptions)
  ) / attempts;

  return Number(rating.toFixed(1));
};

const getDefaultSortConfig = (category: StatCategory): SortConfig => {
  switch (category) {
    case 'Passing':
      return { key: 'Pass Yards', direction: 'desc' };
    case 'Rushing':
      return { key: 'Rush Yards', direction: 'desc' };
    case 'Receiving':
      return { key: 'Rec Yards', direction: 'desc' };
    case 'Blocking':
      return { key: 'DP', direction: 'desc' };
    case 'Defense':
      return { key: 'Tackles', direction: 'desc' };
    case 'Kicking':
      return { key: 'FG Made', direction: 'desc' };
    case 'Punting':
      return { key: 'Punts', direction: 'desc' };
    case 'Kick Return':
      return { key: 'KR Yards', direction: 'desc' };
    case 'Punt Return':
      return { key: 'PR Yards', direction: 'desc' };
    default:
      return { key: '', direction: 'desc' };
  }
};

const PlayerStats: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rosterPlayers] = useLocalStorage<RosterPlayer[]>('players', []);
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [playerStats, setPlayerStats] = useLocalStorage<PlayerStat[]>('playerStats', []);
  const [viewType, setViewType] = useState<'Season' | 'Career'>('Season');
  const [selectedCategory, setSelectedCategory] = useState<StatCategory>('Passing');
  const [newStat, setNewStat] = useState<Omit<PlayerStat, 'id'>>({
    name: '',
    year: currentYear,
    category: 'Passing'
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>(getDefaultSortConfig('Passing'));

  const sortStats = (stats: PlayerStat[], sortConfig: SortConfig) => {
    if (!sortConfig.key) return stats;
 
    return [...stats].sort((a, b) => {
      const aValue = getStatValue(a, sortConfig.key);
      const bValue = getStatValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const startEditing = (stat: PlayerStat) => {
    setEditingId(stat.id);
    setNewStat({
      name: stat.name,
      year: stat.year,
      category: stat.category,
      ...Object.fromEntries(
        Object.entries(stat).filter(([key]) =>
          key !== 'id' && key !== 'name' && key !== 'year' && key !== 'category'
        )
      )
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewStat({
      name: '',
      year: currentYear,
      category: selectedCategory
    });
  };

  const getFilteredPlayers = () => {
    const eligiblePlayers = getEligiblePlayers(rosterPlayers, selectedCategory);
    return eligiblePlayers.sort((a, b) => {
      // Convert jersey numbers to integers for proper numeric sorting
      const jerseyA = parseInt(a.jerseyNumber) || 0;
      const jerseyB = parseInt(b.jerseyNumber) || 0;
      return jerseyA - jerseyB;
    });
  };

  const validatePlayerForCategory = (playerName: string, category: StatCategory): boolean => {
    const player = rosterPlayers.find(p => p.name === playerName);
    if (!player) return false;

    const eligiblePlayers = getEligiblePlayers(rosterPlayers, category);
    return eligiblePlayers.some(p => p.name === playerName);
  };

  const addStat = () => {
    if (!newStat.name) {
      toast.error('Please select a player');
      return;
    }
  
    if (!validatePlayerForCategory(newStat.name.toString(), selectedCategory)) {
      toast.error('Selected player is not eligible for this stat category');
      return;
    }
  
    if (editingId) {
      setPlayerStats(playerStats.map(stat => 
        stat.id === editingId 
          ? { ...stat, ...newStat, id: editingId }
          : stat
      ));
      setEditingId(null);
      // Clear the form after saving changes
      setNewStat({
        name: '',
        year: currentYear,
        category: selectedCategory
      });
      toast.success('Stats updated successfully');
    } else {
      const statValues = Object.entries(newStat)
        .filter(([key]) => key !== 'name' && key !== 'year' && key !== 'category')
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: typeof value === 'number' ? value : 0
        }), {});
  
      const stat: PlayerStat = {
        name: newStat.name.toString(),
        year: Number(newStat.year),
        category: selectedCategory,
        id: Date.now().toString(),
        ...statValues
      };
  
      setPlayerStats([...playerStats, stat]);
      setNewStat({
        name: '',
        year: currentYear,
        category: selectedCategory
      });
      toast.success('Stats added successfully');
    }
  };

  const deleteStat = (id: string) => {
    setPlayerStats(playerStats.filter(stat => stat.id !== id));
    toast.success('Stats deleted successfully');
  };

  const getDisplayStats = () => {
    let filteredStats = playerStats.filter(stat => stat.category === selectedCategory);
  
    if (viewType === 'Season') {
      return filteredStats.filter(stat => stat.year === currentYear);
    } else {
      const playerTotals: Record<string, PlayerStat> = {};
  
      filteredStats.forEach(curr => {
        if (!playerTotals[curr.name]) {
          playerTotals[curr.name] = {
            ...curr,
            year: 0,
            id: curr.id,
            name: curr.name,
            category: curr.category
          };
        } else {
          Object.entries(curr).forEach(([key, value]) => {
            if (typeof value === 'number' && key !== 'year') {
              const currentTotal = playerTotals[curr.name][key as keyof PlayerStat];
              // Special handling for "long" fields - take the maximum value
              if (key.toLowerCase().includes('long')) {
                if (typeof currentTotal === 'number') {
                  playerTotals[curr.name][key as keyof PlayerStat] = Math.max(currentTotal, value);
                } else {
                  playerTotals[curr.name][key as keyof PlayerStat] = value;
                }
              } else {
                // For all other numeric fields, sum the values
                if (typeof currentTotal === 'number') {
                  playerTotals[curr.name][key as keyof PlayerStat] = currentTotal + value;
                }
              }
            }
          });
        }
      });
  
      return Object.values(playerTotals);
    }
  };

  const getStatValue = (stat: PlayerStat, category: string): string | number => {
    const statKey = category.toLowerCase().replace(/\s/g, '') as StatKeys;

    if (category === 'Comp %') {
      return `${calculateCompletionPercentage(stat.completions, stat.attempts)}%`;
    }

    if (category === 'RTG') {
      return calculateQBR(stat);
    }

    if (category === 'YPA') {
      return calculateAverage(stat.passyards, stat.attempts);
    }

    if (category === 'AVG') {
      if (selectedCategory === 'Rushing') {
        return calculateAverage(stat.rushyards, stat.carries);
      }
      if (selectedCategory === 'Receiving') {
        return calculateAverage(stat.recyards, stat.receptions);
      }
    }

    if (category === 'FG %') {
      const made = stat.fgmade || 0;
      const attempted = stat.fgattempted || 0;
      return attempted > 0 ? `${((made / attempted) * 100).toFixed(1)}%` : '0%';
    }

    if (category === 'XP %') {
      const made = stat.xpmade || 0;
      const attempted = stat.xpattempted || 0;
      return attempted > 0 ? `${((made / attempted) * 100).toFixed(1)}%` : '0%';
    }

    if (category === 'Tackles' && selectedCategory === 'Defense') {
      const solo = Number(stat.solo || 0);
      const assists = Number(stat.assists || 0);
      return solo + assists;
    }

    if (category === 'YPP' && selectedCategory === 'Punting') {
      const yards = Number(stat.puntyards || 0);
      const punts = Number(stat.punts || 0);
      return punts > 0 ? Number((yards / punts).toFixed(1)) : 0;
    }

    const value = stat[statKey];
    return typeof value === 'number' ? value : 0;
  };

  const renderStatInputs = () => {
    return statCategories[selectedCategory].map(stat => {
      const statKey = stat.toLowerCase().replace(/\s/g, '') as StatKeys;
      return (
        <div key={stat} className="flex flex-col space-y-1.5">
          <Label htmlFor={stat}>{stat}</Label>
          <Input
            id={stat}
            type="number"
            step="0.5"
            value={newStat[statKey] || ''}
            onChange={(e) => setNewStat({
              ...newStat,
              [statKey]: parseFloat(e.target.value) || 0
            })}
            placeholder="0"
          />
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Player Stats</h1>

      <div className="flex justify-center space-x-4">
        <Select value={viewType} onValueChange={(value: 'Season' | 'Career') => setViewType(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="View Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Season">Season</SelectItem>
            <SelectItem value="Career">Career</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={(value: StatCategory) => {
          setSelectedCategory(value);
          setSortConfig(getDefaultSortConfig(value)); // Set default sort for new category
          setNewStat(prev => ({ ...prev, category: value, name: '' })); // Reset player selection when changing category
        }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(statCategories) as StatCategory[]).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>Add New Stats</CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Player Name</Label>
              <Select
                value={newStat.name ? String(newStat.name) : undefined}
                onValueChange={(value: string) => {
                  setNewStat({
                    ...newStat,
                    name: value,
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Player" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredPlayers().map((player) => (
                    <SelectItem key={player.id} value={player.name}>
                      {player.name} - {player.position} #{player.jerseyNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {renderStatInputs()}
          </div>
          {editingId ? (
            <div className="flex gap-2">
              <Button onClick={addStat}>Save Changes</Button>
              <Button onClick={cancelEditing} variant="outline">Cancel</Button>
            </div>
          ) : (
            <Button onClick={addStat}>Add Stats</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>{viewType} Stats - {selectedCategory}</CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {displayCategories[selectedCategory].map(stat => (
                  <TableHead
                    key={stat}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortConfig({
                        key: stat,
                        direction: sortConfig?.key === stat && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {stat}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortStats(getDisplayStats(), sortConfig).map(stat => (
                <TableRow key={stat.id}>
                  <TableCell>{stat.name}</TableCell>
                  {displayCategories[selectedCategory].map(category => (
                    <TableCell key={category}>
                      {getStatValue(stat, category)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => startEditing(stat)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Stats</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete these stats? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStat(stat.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStats;
