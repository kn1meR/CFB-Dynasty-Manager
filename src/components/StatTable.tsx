// src/components/StatTable.tsx
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayerStat, StatCategory } from '@/types/playerStats';

// Define ViewType to include all possible values
type ViewType = 'Season' | 'Career' | 'Game';

interface StatTableProps {
  category: StatCategory;
  viewType: ViewType;
  stats: PlayerStat[];
  onAddStat: (stat: Omit<PlayerStat, 'id'>) => void;
  onUpdateStat: (id: string, stat: Partial<PlayerStat>) => void;
  onDeleteStat: (id: string) => void;
}

const statFields: { [key in StatCategory]: string[] } = {
  Passing: ['passAttempts', 'passCompletions', 'passyards', 'passTDs', 'interceptions'],
  Rushing: ['rushAttempts', 'rushyards', 'rushTDs', 'fumbles'],
  Receiving: ['receptions', 'recyards', 'recTDs', 'drops'],
  Defense: ['tackles', 'sacks', 'defInterceptions', 'fumblesForced', 'fumblesRecovered'],
  Kicking: ['fgMade', 'fgAttempted', 'xpMade', 'xpAttempted'],
  Punting: ['punts', 'puntYards', 'puntsInside20'],
  Returns: ['kickReturnYards', 'kickReturnTDs', 'puntReturnYards', 'puntReturnTDs']
};

const StatTable: React.FC<StatTableProps> = ({ category, viewType, stats, onAddStat, onUpdateStat, onDeleteStat }) => {
  const [newStat, setNewStat] = useState<Omit<PlayerStat, 'id'>>({
    playerId: 0,
    playerName: '',
    year: new Date().getFullYear(),
    category: category,
  });

  const handleAddStat = () => {
    if (newStat.playerName) {
      onAddStat(newStat);
      setNewStat({
        playerId: 0,
        playerName: '',
        year: new Date().getFullYear(),
        category: category,
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {viewType !== 'Game' && <TableHead>Year</TableHead>}
          {statFields[category]?.map(field => (
            <TableHead key={field}>{field}</TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats.map(stat => (
          <TableRow key={stat.id}>
            <TableCell>{stat.playerName}</TableCell>
            {viewType !== 'Game' && <TableCell>{stat.year}</TableCell>}
            {statFields[category]?.map(field => (
              <TableCell key={field}>
                <Input
                  type="number"
                  value={(stat as any)[field]?.toString() || ''}
                  onChange={(e) => onUpdateStat(stat.id, { [field]: parseFloat(e.target.value) || 0 })}
                />
              </TableCell>
            ))}
            <TableCell>
              <Button onClick={() => onDeleteStat(stat.id)} variant="destructive" size="sm">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            <Input
              value={newStat.playerName}
              onChange={(e) => setNewStat({ ...newStat, playerName: e.target.value })}
              placeholder="New player"
            />
          </TableCell>
          {viewType !== 'Game' && (
            <TableCell>
              <Input
                type="number"
                value={newStat.year.toString()}
                onChange={(e) => setNewStat({ ...newStat, year: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="Year"
              />
            </TableCell>
          )}
          {statFields[category]?.map(field => (
            <TableCell key={field}>
              <Input
                type="number"
                value={(newStat as any)[field]?.toString() || ''}
                onChange={(e) => setNewStat({ ...newStat, [field]: parseFloat(e.target.value) || 0 })}
                placeholder={field}
              />
            </TableCell>
          ))}
          <TableCell>
            <Button onClick={handleAddStat} size="sm">Add</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default StatTable;