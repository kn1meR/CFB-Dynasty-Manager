"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Player } from '@/types/playerTypes';
import { Award } from '@/types/statTypes';
import { toast } from 'react-hot-toast';

const predefinedAwards = [
  "All-American",
  "All-Conference",
  "Heisman Trophy",
  "Player of the Year",
  "Head Coach of the Year",
  "Best Quarterback",
  "Best Defensive Player",
  "Best Defensive Back",
  "Best Running Back",
  "Best Receiver",
  "Lombardi Award",
  "Unitas Golden Arm Award", 
  "Best Defensive End",
  "Best Interior Lineman",
  "Best Tight End",
  "Broyles Award",
  "Best Linebacker",
  "Best Center",
  "Lou Groza Award",
  "Best Punter",
  "Best Returner",
];

const AwardTracker: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allAwards, setAllAwards] = useLocalStorage<Award[]>('allAwards', []);
  const [players] = useLocalStorage<Player[]>('players', []);
  const [newAward, setNewAward] = useState<Omit<Award, 'id' | 'year'>>({ 
    playerName: '', 
    awardName: '' 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const awardsForSelectedYear = allAwards.filter(award => award.year === selectedYear);

  const addAward = () => {
    if (!newAward.playerName || !newAward.awardName) {
      toast.error('Please select both player and award');
      return;
    }

    setAllAwards([...allAwards, {
      ...newAward,
      id: Date.now(),
      year: selectedYear
    }]);
    setNewAward({ playerName: '', awardName: '' });
    toast.success('Award added successfully');
  };

  const startEditing = (award: Award) => {
    setEditingId(award.id);
    setNewAward(award);
  };

  const saveEdit = () => {
    if (!newAward.playerName || !newAward.awardName) {
      toast.error('Please select both player and award');
      return;
    }

    setAllAwards(allAwards.map(award =>
      award.id === editingId
        ? { ...newAward, id: award.id, year: selectedYear }
        : award
    ));
    setEditingId(null);
    setNewAward({ playerName: '', awardName: '' });
    toast.success('Award updated successfully');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewAward({ playerName: '', awardName: '' });
  };

  const removeAward = (id: number) => {
    setAllAwards(allAwards.filter(award => award.id !== id));
    toast.success('Award removed successfully');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Award Tracker</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Add New Award for Year: {selectedYear}</span>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              value={newAward.playerName}
              onValueChange={(value) => setNewAward({ ...newAward, playerName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Player" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.name}>
                    {player.name} - {player.position} #{player.jerseyNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={newAward.awardName}
              onValueChange={(value) => setNewAward({ ...newAward, awardName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Award" />
              </SelectTrigger>
              <SelectContent>
                {predefinedAwards.map(award => (
                  <SelectItem key={award} value={award}>{award}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {editingId ? (
              <div className="flex space-x-2">
                <Button onClick={saveEdit}>Save</Button>
                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
              </div>
            ) : (
              <Button onClick={addAward}>Add Award</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Awards for {selectedYear}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="text-center">Player Name</th>
                <th className="text-center">Award</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {awardsForSelectedYear.map(award => (
                <tr key={award.id}>
                  <td className="text-center">{award.playerName}</td>
                  <td className="text-center">{award.awardName}</td>
                  <td className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => startEditing(award)} size="sm">Edit</Button>
                      <Button onClick={() => removeAward(award.id)} variant="destructive" size="sm">Remove</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AwardTracker;
