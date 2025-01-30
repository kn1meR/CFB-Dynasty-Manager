"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';
import { capitalizeName } from '@/utils';
import { fbsTeams } from '@/utils/fbsTeams';
import { Transfer } from '@/types/playerTypes';
import { getTransfers } from '@/utils/localStorage';
import { generalPositions } from '@/types/playerTypes';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

const starOptions = ['5', '4', '3', '2', '1'];

const TransferPortalTracker: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allTransfers, setAllTransfers] = useLocalStorage<Transfer[]>('allTransfers', []);
  const [newTransfer, setNewTransfer] = useState<Omit<Transfer, 'id' | 'transferYear'>>({
    playerName: '',
    position: '',
    stars: '',
    transferDirection: 'From',
    school: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const transfersForSelectedYear = getTransfers(selectedYear);

  const addTransfer = () => {
    const transferToAdd = {
      ...newTransfer,
      id: Date.now(),
      transferYear: selectedYear,
      playerName: capitalizeName(newTransfer.playerName),
    };
    setAllTransfers([...allTransfers, transferToAdd]);
    setNewTransfer({
      playerName: '',
      position: '',
      stars: '',
      transferDirection: 'From',
      school: ''
    });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const startEditing = (transfer: Transfer) => {
    setEditingId(transfer.id);
    setNewTransfer(transfer);
  };

  const saveEdit = () => {
    setAllTransfers(allTransfers.map(transfer =>
      transfer.id === editingId
        ? {
          ...newTransfer,
          id: transfer.id,
          transferYear: selectedYear,
          playerName: capitalizeName(newTransfer.playerName),
        }
        : transfer
    ));
    setEditingId(null);
    setNewTransfer({
      playerName: '',
      position: '',
      stars: '',
      transferDirection: 'From',
      school: ''
    });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTransfer({
      playerName: '',
      position: '',
      stars: '',
      transferDirection: 'From',
      school: ''
    });
  };

  const removeTransfer = (id: number) => {
    setAllTransfers(allTransfers.filter(transfer => transfer.id !== id));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Transfer Portal Tracker</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Add New Transfer for Year: {selectedYear}</span>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <Input
              value={newTransfer.playerName}
              onChange={(e) => setNewTransfer({ ...newTransfer, playerName: e.target.value })}
              placeholder="Player Name"
            />
            <Select
              value={newTransfer.stars}
              onValueChange={(value) => setNewTransfer({ ...newTransfer, stars: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stars" />
              </SelectTrigger>
              <SelectContent>
                {starOptions.map(stars => (
                  <SelectItem key={stars} value={stars}>{stars} ★</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newTransfer.position}
              onValueChange={(value) => setNewTransfer({ ...newTransfer, position: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                {generalPositions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newTransfer.transferDirection}
              onValueChange={(value) => setNewTransfer({ ...newTransfer, transferDirection: value as 'From' | 'To' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Transfer Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="From">From</SelectItem>
                <SelectItem value="To">To</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newTransfer.school}
              onValueChange={(value) => setNewTransfer({ ...newTransfer, school: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                {fbsTeams.map(school => (
                  <SelectItem key={school.name} value={school.name}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editingId ? (
              <div className="flex space-x-2">
                <Button onClick={saveEdit}>Save</Button>
                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
              </div>
            ) : (
              <Button onClick={addTransfer}>Add Transfer</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Transfers for {selectedYear}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="text-center">Player Name</th>
                <th className="text-center">Stars</th>
                <th className="text-center">Position</th>
                <th className="text-center">Transfer Direction</th>
                <th className="text-center">School</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfersForSelectedYear.map(transfer => (
                <tr key={transfer.id}>
                  <td className="text-center">{transfer.playerName}</td>
                  <td className="text-center">{transfer.stars} ★</td>
                  <td className="text-center">{transfer.position}</td>
                  <td className="text-center">{transfer.transferDirection}</td>
                  <td className="text-center">{transfer.school}</td>
                  <td className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => startEditing(transfer)} size="sm">Edit</Button>
                      <Button onClick={() => removeTransfer(transfer.id)} variant="destructive" size="sm">Remove</Button>
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

export default TransferPortalTracker;
