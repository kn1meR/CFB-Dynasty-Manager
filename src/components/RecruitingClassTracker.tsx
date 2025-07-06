// src/components/RecruitingClassTracker.tsx
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
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

interface DevTraitBadgeProps {
  trait: 'Normal' | 'Impact' | 'Star' | 'Elite';
}

const potentials = ['Elite', 'Star', 'Impact', 'Normal'];
const starOptions = ['5', '4', '3', '2', '1'];

// NEW: Function to sort recruits by star rating (5 to 1)
const sortRecruitsByStars = (recruits: Recruit[]): Recruit[] => {
  return [...recruits].sort((a, b) => {
    // Convert star strings to numbers for comparison
    const starsA = parseInt(a.stars) || 0;
    const starsB = parseInt(b.stars) || 0;
    
    // Sort by stars descending (5 to 1)
    if (starsA !== starsB) {
      return starsB - starsA;
    }
    
    // If stars are equal, sort by rating descending as secondary sort
    const ratingA = parseInt(a.rating) || 0;
    const ratingB = parseInt(b.rating) || 0;
    return ratingB - ratingA;
  });
};

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

  // NEW: Apply star rating sorting to displayed recruits
  const recruitsForSelectedYear = sortRecruitsByStars(
    allRecruits.filter(recruit => recruit.recruitedYear === selectedYear)
  );

  const DevTraitBadge: React.FC<DevTraitBadgeProps> = ({ trait }) => {
    const colors = {
      'Elite': 'bg-red-400 text-purple-100 dark:bg-red-700 dark:text-purple-0',
      'Star': 'bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:text-black',
      'Impact': 'bg-gray-400 text-gray-100 dark:bg-gray-600 dark:text-green-0',
      'Normal': 'bg-yellow-800 text-gray-100 dark:bg-yellow-900 dark:text-gray-0'
    } as const;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm/6 font-medium ${colors[trait]}`}>
        {trait}
      </span>
    );
  };

  const addRecruit = () => {
    const recruitToAdd = {
      ...newRecruit,
      id: Date.now(),
      recruitedYear: selectedYear,
      name: capitalizeName(newRecruit.name)
    };
    setAllRecruits([...allRecruits, recruitToAdd]);
    setNewRecruit({ name: '', stars: '', position: '', rating: '', potential: '' });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
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
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewRecruit({ name: '', stars: '', position: '', rating: '', potential: '' });
  };

  const removeRecruit = (id: number) => {
    setAllRecruits(allRecruits.filter(recruit => recruit.id !== id));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
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
                  <SelectItem key={stars} value={stars}>{stars} ⭐</SelectItem>
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
                {potentials.map(potential => (
                  <SelectItem key={potential} value={potential}>{potential}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editingId ? (
              <div className="flex gap-2">
                <Button onClick={saveEdit} size="sm">Save</Button>
                <Button onClick={cancelEdit} variant="outline" size="sm">Cancel</Button>
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
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sorted by Star Rating (5★ → 1★)
            </div>
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
                  <td className="text-center">{recruit.stars} ⭐</td>
                  <td className="text-center">{recruit.position}</td>
                  <td className="text-center">{recruit.rating}</td>
                  <td className="text-center"><DevTraitBadge trait={recruit.potential as 'Elite' | 'Star' | 'Impact' | 'Normal'} /></td>
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