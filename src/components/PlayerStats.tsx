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

interface PlayerStat {
  id: string;
  name: string;
  year: number;
  category: StatCategory;
  // Passing Stats
  passyards?: number;
  passtd?: number;
  passint?: number;
  // Rushing Stats
  rushyards?: number;
  rushtd?: number;
  // Receiving Stats
  receptions?: number;
  recyards?: number;
  rectd?: number;
  // Defensive Stats
  tackles?: number;
  sacks?: number;
  defint?: number;
  forcedfumbles?: number;
  // Kicking Stats
  fgmade?: number;
  fgattempted?: number;
  xpmade?: number;
  xpattempted?: number;
  // Return Stats
  kryards?: number;
  krtd?: number;
  pryards?: number;
  prtd?: number;
  [key: string]: string | number | undefined; // Index signature
}

type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Defense' | 'Kicking' | 'Return';

const statCategories: Record<StatCategory, string[]> = {
  'Passing': ['Completions','Attempts','Pass Yards', 'Pass TD', 'Pass Int'],
  'Rushing': ['Rush Yards', 'Rush TD'],
  'Receiving': ['Receptions', 'Rec Yards', 'Rec TD'],
  'Defense': ['Tackles', 'Sacks', 'Def Int', 'Forced Fumbles'],
  'Kicking': ['FG Made', 'FG Attempted', 'XP Made', 'XP Attempted'],
  'Return': ['KR Yards', 'KR TD', 'PR Yards', 'PR TD']
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

  const addStat = () => {
    if (!newStat.name) {
      toast.error('Please select a player');
      return;
    }

    if (editingId) {
      setPlayerStats(playerStats.map(stat => 
        stat.id === editingId 
          ? { ...stat, ...newStat, id: editingId }
          : stat
      ));
      setEditingId(null);
      toast.success('Stats updated successfully');
    } else {

    // Create a new object with just the stat values, filtering out the required fields
    const statValues = Object.entries(newStat)
      .filter(([key]) => key !== 'name' && key !== 'year' && key !== 'category')
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'number' ? value : 0
      }), {});

    const stat: PlayerStat = {
      name: String(newStat.name),
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
      // For career stats, sum up all stats for each player within the selected category
      const playerTotals: { [key: string]: PlayerStat } = {};
      
      filteredStats.forEach(curr => {
        if (!playerTotals[curr.name]) {
          playerTotals[curr.name] = { ...curr, year: 0 };
        } else {
          Object.keys(curr).forEach(key => {
            if (typeof curr[key] === 'number' && key !== 'year') {
              const totalStat = playerTotals[curr.name][key] as number || 0;
              const currentStat = curr[key] as number || 0;
              playerTotals[curr.name][key] = totalStat + currentStat;
            }
          });
        }
      });
      
      return Object.values(playerTotals);
    }
  };

  const renderStatInputs = () => {
    return statCategories[selectedCategory].map(stat => {
      const statKey = stat.toLowerCase().replace(/\s/g, '');
      return (
        <div key={stat} className="flex flex-col space-y-1.5">
          <Label htmlFor={stat}>{stat}</Label>
          <Input
            id={stat}
            type="number"
            value={newStat[statKey] || ''}
            onChange={(e) => setNewStat({
              ...newStat,
              [statKey]: parseInt(e.target.value) || 0
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
          setNewStat(prev => ({ ...prev, category: value }));
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
                  {rosterPlayers.map((player) => (
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
              <Button onClick={addStat} className="flex-1">Save Changes</Button>
              <Button onClick={cancelEditing} variant="outline">Cancel</Button>
            </div>
          ) : (
            <Button onClick={addStat} className="w-full">Add Stats</Button>
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
                {statCategories[selectedCategory].map(stat => (
                  <TableHead key={stat}>{stat}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getDisplayStats().map(stat => (
                <TableRow key={stat.id}>
                  <TableCell>{stat.name}</TableCell>
                  {statCategories[selectedCategory].map(category => {
                    const statKey = category.toLowerCase().replace(/\s/g, '');
                    return (
                      <TableCell key={category}>
                        {stat[statKey] || 0}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => startEditing(stat)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteStat(stat.id)}
                      >
                        Delete
                      </Button>
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
