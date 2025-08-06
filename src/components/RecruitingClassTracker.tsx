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
import { notifySuccess, MESSAGES } from '@/utils/notification-utils';
import { Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface DevTraitBadgeProps {
  trait: 'Normal' | 'Impact' | 'Star' | 'Elite';
}

// Data for form dropdowns
const potentials = ['Elite', 'Star', 'Impact', 'Normal'];
const starOptions = ['5', '4', '3', '2', '1'];
const usStates = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const stateOptions = [...usStates, 'International'];

// This type represents the state of the form, where ranks are strings from input fields.
type NewRecruitFormState = {
  name: string;
  stars: string;
  position: string;
  state: string;
  nationalRank: string;
  stateRank: string;
  potential: string;
};

// Function to sort recruits by star rating, then national rank
const sortRecruitsByStars = (recruits: Recruit[]): Recruit[] => {
  return [...recruits].sort((a, b) => {
    const starsA = parseInt(a.stars) || 0;
    const starsB = parseInt(b.stars) || 0;

    // Sort by stars descending (5 to 1)
    if (starsA !== starsB) {
      return starsB - starsA;
    }

    // If stars are equal, sort by national rank ascending (lower is better)
    // Ranks of null are sorted last
    const rankA = a.nationalRank ?? 9999;
    const rankB = b.nationalRank ?? 9999;
    return rankA - rankB;
  });
};

const RecruitingClassTracker: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allRecruits, setAllRecruits] = useLocalStorage<Recruit[]>('allRecruits', []);

  const initialFormState: NewRecruitFormState = {
    name: '',
    stars: '',
    position: '',
    state: '',
    nationalRank: '',
    stateRank: '',
    potential: ''
  };

  const [newRecruit, setNewRecruit] = useState<NewRecruitFormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Apply sorting to displayed recruits
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

  const resetForm = () => {
    setNewRecruit(initialFormState);
  };

  const addRecruit = () => {
    const recruitToAdd: Recruit = {
      id: Date.now(),
      recruitedYear: selectedYear,
      name: capitalizeName(newRecruit.name),
      stars: newRecruit.stars,
      position: newRecruit.position,
      state: newRecruit.state,
      potential: newRecruit.potential,
      // Convert rank strings to numbers or null if empty
      nationalRank: newRecruit.nationalRank ? parseInt(newRecruit.nationalRank, 10) : null,
      stateRank: newRecruit.stateRank ? parseInt(newRecruit.stateRank, 10) : null,
    };
    setAllRecruits([...allRecruits, recruitToAdd]);
    resetForm();
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const startEditing = (recruit: Recruit) => {
    setEditingId(recruit.id);
    // Convert numbers back to strings for the form input fields
    setNewRecruit({
      name: recruit.name,
      stars: recruit.stars,
      position: recruit.position,
      state: recruit.state,
      potential: recruit.potential,
      nationalRank: recruit.nationalRank?.toString() ?? '',
      stateRank: recruit.stateRank?.toString() ?? '',
    });
  };

  const saveEdit = () => {
    setAllRecruits(allRecruits.map(r => {
      if (r.id !== editingId) return r;
      // Create the updated recruit object that matches the Recruit type
      return {
        id: r.id,
        recruitedYear: selectedYear,
        name: capitalizeName(newRecruit.name),
        stars: newRecruit.stars,
        position: newRecruit.position,
        state: newRecruit.state,
        potential: newRecruit.potential,
        nationalRank: newRecruit.nationalRank ? parseInt(newRecruit.nationalRank, 10) : null,
        stateRank: newRecruit.stateRank ? parseInt(newRecruit.stateRank, 10) : null,
      };
    }));
    setEditingId(null);
    resetForm();
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
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
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4 items-end">
            <Input
              value={newRecruit.name}
              onChange={(e) => setNewRecruit({ ...newRecruit, name: e.target.value })}
              placeholder="Player Name"
              className="md:col-span-2"
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
            <Select
              value={newRecruit.state}
              onValueChange={(value) => setNewRecruit({ ...newRecruit, state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={newRecruit.nationalRank}
              onChange={(e) => setNewRecruit({ ...newRecruit, nationalRank: e.target.value })}
              placeholder="Nat. Rank"
              type="number"
            />
            <Input
              value={newRecruit.stateRank}
              onChange={(e) => setNewRecruit({ ...newRecruit, stateRank: e.target.value })}
              placeholder="State Rank"
              type="number"
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
            <div className="md:col-start-8">
              {editingId ? (
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm">Save</Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">Cancel</Button>
                </div>
              ) : (
                <Button onClick={addRecruit} className="w-full">Add Recruit</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">
          <div className="flex justify-between items-center">
            <span>Recruiting Class for {selectedYear}</span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sorted by Stars, then National Rank
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
                <th className="text-center">State</th>
                <th className="text-center">Nat. Rank</th>
                <th className="text-center">State Rank</th>
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
                  <td className="text-center">{recruit.state}</td>
                  <td className="text-center">{recruit.nationalRank ?? 'N/A'}</td>
                  <td className="text-center">{recruit.stateRank ?? 'N/A'}</td>
                  <td className="text-center"><DevTraitBadge trait={recruit.potential as 'Elite' | 'Star' | 'Impact' | 'Normal'} /></td>
                  <td className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Button variant="ghost" size="icon" onClick={() => startEditing(recruit)} title="Edit"> <Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Remove Player"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Remove Player</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {recruit.name}?</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeRecruit(recruit.id)}>Remove</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
