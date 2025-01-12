"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLocalStorage from '@/hooks/useLocalStorage';
import { capitalizeName } from '@/utils';
import { Recruit } from '@/types/playerTypes';
import { generalPositions } from '@/types/playerTypes';

const potentials = ['Elite', 'Star', 'Impact', 'Normal'];
const starOptions = ['5', '4', '3', '2', '1'];

const RecruitingClassTracker: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allRecruits, setAllRecruits] = useLocalStorage<Recruit[]>('allRecruits', []);
  const [newRecruit, setNewRecruit] = useState<Omit<Recruit, 'id' | 'recruitedYear'>>({
    name: '',
    stars: '',
    position: '',
    rating: '',
    potential: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const recruitsForSelectedYear = allRecruits.filter(recruit => recruit.recruitedYear === selectedYear);

  const addRecruit = () => {
    const recruitToAdd = {
      ...newRecruit,
      id: Date.now(),
      recruitedYear: selectedYear,
      name: capitalizeName(newRecruit.name)
    };
    setAllRecruits([...allRecruits, recruitToAdd]);
    setNewRecruit({ name: '', stars: '', position: '', rating: '', potential: '' });
  };

  const startEditing = (recruit: Recruit) => {
    setEditingId(recruit.id);
    setNewRecruit(recruit);
  };

  const saveEdit = () => {
    setAllRecruits(allRecruits.map(recruit =>
      recruit.id === editingId
        ? { ...newRecruit, id: recruit.id, recruitedYear: selectedYear, name: capitalizeName(newRecruit.name) }
        : recruit
    ));
    setEditingId(null);
    setNewRecruit({ name: '', stars: '', position: '', rating: '', potential: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewRecruit({ name: '', stars: '', position: '', rating: '', potential: '' });
  };

  const removeRecruit = (id: number) => {
    setAllRecruits(allRecruits.filter(recruit => recruit.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Recruiting Class Tracker</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Add New Recruit for Year: {selectedYear}</span>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <Input
              value={newRecruit.name}
              onChange={(e) => setNewRecruit({ ...newRecruit, name: e.target.value })}
              placeholder="Player Name"
            />
            <Select
              value={newRecruit.stars}
              onValueChange={(value) => setNewRecruit({ ...newRecruit, stars: value })}
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
              value={newRecruit.position}
              onValueChange={(value) => setNewRecruit({ ...newRecruit, position: value })}
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
            <Input
              value={newRecruit.rating}
              onChange={(e) => setNewRecruit({ ...newRecruit, rating: e.target.value })}
              placeholder="Rating"
            />
            <Select
              value={newRecruit.potential}
              onValueChange={(value) => setNewRecruit({ ...newRecruit, potential: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dev. Trait" />
              </SelectTrigger>
              <SelectContent>
                {potentials.map(pot => (
                  <SelectItem key={pot} value={pot}>{pot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editingId ? (
              <div className="flex space-x-2">
                <Button onClick={saveEdit}>Save</Button>
                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
              </div>
            ) : (
              <Button onClick={addRecruit}>Add Recruit</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Recruiting Class for {selectedYear}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th className="text-center">Name</th>
                <th className="text-center">Stars</th>
                <th className="text-center">Position</th>
                <th className="text-center">Rating</th>
                <th className="text-center">Dev. Trait</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruitsForSelectedYear.map(recruit => (
                <tr key={recruit.id}>
                  <td className="text-center">{recruit.name}</td>
                  <td className="text-center">{recruit.stars} ★</td>
                  <td className="text-center">{recruit.position}</td>
                  <td className="text-center">{recruit.rating}</td>
                  <td className="text-center">{recruit.potential}</td>
                  <td className="text-center">
                    <div className="flex justify-center space-x-2">
                      <Button onClick={() => startEditing(recruit)} size="sm">Edit</Button>
                      <Button onClick={() => removeRecruit(recruit.id)} variant="destructive" size="sm">Remove</Button>
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

export default RecruitingClassTracker;
