// src/components/AwardTracker.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Player } from '@/types/playerTypes';
import { Award } from '@/types/statTypes';
import { toast } from 'react-hot-toast';
import { getCoachProfile, getYearRecord, setYearRecord } from '@/utils/localStorage';

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

const teamAwards = ["All-American", "All-Conference"];

const AwardTracker: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [players] = useLocalStorage<Player[]>('players', []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [awardsForSelectedYear, setAwardsForSelectedYear] = useState<Award[]>([]);

  useEffect(() => {
    const record = getYearRecord(selectedYear);
    setAwardsForSelectedYear(record.playerAwards || []);
  }, [selectedYear]);

  const [selectedAwardName, setSelectedAwardName] = useState('');
  const [selectedPlayerName, setSelectedPlayerName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<'1st Team' | '2nd Team' | 'Freshman' | undefined>(undefined);
  const [broylesName, setBroylesName] = useState('');
  const [broylesPosition, setBroylesPosition] = useState<'OC' | 'DC'>('OC');

  const coachProfile = getCoachProfile();

  const resetForm = () => {
    setSelectedAwardName('');
    setSelectedPlayerName('');
    setSelectedTeam(undefined);
    setBroylesName('');
    setBroylesPosition('OC');
    setEditingId(null);
  };

  const handleSave = () => {
    if (!selectedAwardName) {
      toast.error('Please select an award');
      return;
    }

    let finalPlayerName = selectedPlayerName;
    if (selectedAwardName === 'Head Coach of the Year') {
      finalPlayerName = coachProfile?.coachName || 'Head Coach';
    } else if (selectedAwardName === 'Broyles Award') {
      if (!broylesName.trim()) {
        toast.error("Please enter the coordinator's name.");
        return;
      }
      finalPlayerName = `${broylesName} - ${broylesPosition}`;
    }

    if (!finalPlayerName) {
      toast.error('Please select a player or enter a name.');
      return;
    }

    if (teamAwards.includes(selectedAwardName) && !selectedTeam) {
      toast.error('Please select a team (1st, 2nd, or Freshman).');
      return;
    }

    const awardData: Omit<Award, 'id'> = {
      playerName: finalPlayerName,
      awardName: selectedAwardName,
      year: selectedYear,
      team: selectedTeam
    };

    let updatedAwards: Award[];
    if (editingId) {
      updatedAwards = awardsForSelectedYear.map(award =>
        award.id === editingId ? { ...awardData, id: editingId } : award
      );
      toast.success('Award updated successfully');
    } else {
      updatedAwards = [...awardsForSelectedYear, { ...awardData, id: Date.now() }];
      toast.success('Award added successfully');
    }

    const record = getYearRecord(selectedYear);
    setYearRecord(selectedYear, { ...record, playerAwards: updatedAwards });
    setAwardsForSelectedYear(updatedAwards);

    resetForm();
  };

  const startEditing = (award: Award) => {
    setEditingId(award.id);
    setSelectedAwardName(award.awardName);
    setSelectedTeam(award.team);

    if (award.awardName === "Broyles Award" && award.playerName.includes(' - ')) {
      const [name, pos] = award.playerName.split(' - ');
      setBroylesName(name);
      setBroylesPosition(pos as 'OC' | 'DC');
      setSelectedPlayerName('');
    } else {
      setSelectedPlayerName(award.playerName);
      setBroylesName('');
    }
  };

  const removeAward = (id: number) => {
    const updatedAwards = awardsForSelectedYear.filter(award => award.id !== id);
    const record = getYearRecord(selectedYear);
    setYearRecord(selectedYear, { ...record, playerAwards: updatedAwards });
    setAwardsForSelectedYear(updatedAwards);
    toast.success('Award removed successfully');
  };

  const isTeamAwardSelected = teamAwards.includes(selectedAwardName);
  const isCoachAward = selectedAwardName === "Head Coach of the Year";
  const isBroylesAward = selectedAwardName === "Broyles Award";
  const isPlayerAward = !isCoachAward && !isBroylesAward;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Award Tracker</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>{editingId ? 'Edit' : 'Add New'} Award for Year: {selectedYear}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-4`}>
            {isPlayerAward && (
              <Select value={selectedPlayerName} onValueChange={setSelectedPlayerName}>
                <SelectTrigger><SelectValue placeholder="Select Player" /></SelectTrigger>
                <SelectContent>
                  {[...players].sort((a, b) => parseInt(a.jerseyNumber) - parseInt(b.jerseyNumber)).map(player => (
                    <SelectItem key={player.id} value={player.name}>{player.name} - {player.position} #{player.jerseyNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isCoachAward && (
              <Input value={coachProfile?.coachName || ''} readOnly disabled />
            )}

            {isBroylesAward && (
              <>
                <Input value={broylesName} onChange={(e) => setBroylesName(e.target.value)} placeholder="Coordinator Name" />
                <Select value={broylesPosition} onValueChange={(value: 'OC' | 'DC') => setBroylesPosition(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OC">Offensive Coordinator</SelectItem>
                    <SelectItem value="DC">Defensive Coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            <Select value={selectedAwardName} onValueChange={setSelectedAwardName}>
              <SelectTrigger><SelectValue placeholder="Select Award" /></SelectTrigger>
              <SelectContent>
                {predefinedAwards.map(award => (<SelectItem key={award} value={award}>{award}</SelectItem>))}
              </SelectContent>
            </Select>
            
            {isTeamAwardSelected && (
              <Select value={selectedTeam} onValueChange={(value: any) => setSelectedTeam(value)}>
                <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Team">1st Team</SelectItem>
                  <SelectItem value="2nd Team">2nd Team</SelectItem>
                  <SelectItem value="Freshman">Freshman</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleSave}>{editingId ? 'Save' : 'Add Award'}</Button>
              {editingId && <Button onClick={resetForm} variant="outline">Cancel</Button>}
            </div>
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
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Player/Coach Name</TableHead>
                <TableHead className="text-center">Award</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {awardsForSelectedYear.map(award => (
                <TableRow key={award.id}>
                  <TableCell className="text-center">{award.playerName}</TableCell>
                  <TableCell className="text-center">
                    {award.awardName}
                    {award.team && <span className="ml-2 font-semibold text-gray-600 dark:text-gray-400">({award.team})</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => startEditing(award)} size="sm">Edit</Button>
                      <Button onClick={() => removeAward(award.id)} variant="destructive" size="sm">Remove</Button>
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

export default AwardTracker;