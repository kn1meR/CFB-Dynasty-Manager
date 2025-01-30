"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

interface Trophy {
  id: number;
  type: 'National Championship' | 'Bowl Game' | 'Conference Championship' | 'Rivalry';
  name: string;
  year: number;
}

const TrophyCase: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allTrophies, setAllTrophies] = useLocalStorage<Trophy[]>('allTrophies', []);
  const [newTrophy, setNewTrophy] = useState<Omit<Trophy, 'id' | 'year'>>({
    type: 'National Championship',
    name: '',
  });
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Sort trophies by year in descending order
  const sortedTrophies = [...allTrophies].sort((a, b) => b.year - a.year);

  const addTrophy = () => {
    setAllTrophies([...allTrophies, { ...newTrophy, id: Date.now(), year: selectedYear }]);
    setNewTrophy({
      type: 'National Championship',
      name: '',
    });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const removeTrophy = (id: number) => {
    setAllTrophies(allTrophies.filter(trophy => trophy.id !== id));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Trophy Case</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Add New Trophy for Year: {selectedYear}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              value={newTrophy.type}
              onValueChange={(value: 'National Championship' | 'Bowl Game' | 'Conference Championship' | 'Rivalry') =>
                setNewTrophy({ ...newTrophy, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trophy Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="National Championship">National Championship</SelectItem>
                <SelectItem value="Bowl Game">Bowl Game</SelectItem>
                <SelectItem value="Conference Championship">Conference Championship</SelectItem>
                <SelectItem value="Rivalry">Rivalry</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newTrophy.name}
              onChange={(e) => setNewTrophy({ ...newTrophy, name: e.target.value })}
              placeholder="Trophy Name"
            />
            <Button onClick={addTrophy}>Add Trophy</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">All Trophies</CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedTrophies.map(trophy => (
              <Card key={trophy.id} className="flex flex-col items-center p-4">
                <div className="text-4xl mb-2">
                  {trophy.type === 'National Championship' && '🏅'}
                  {trophy.type === 'Bowl Game' && '🏆'}
                  {trophy.type === 'Conference Championship' && '🪙'}
                  {trophy.type === 'Rivalry' && '🏈'}
                </div>
                <h3 className="font-bold">{trophy.name}</h3>
                <p>{trophy.type}</p>
                <p>{trophy.year}</p>
                <Button
                  onClick={() => removeTrophy(trophy.id)}
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrophyCase;
