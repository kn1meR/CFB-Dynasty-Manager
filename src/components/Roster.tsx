"use client";

import React, { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import useLocalStorage from '@/hooks/useLocalStorage';
import { capitalizeName } from '@/utils';
import { validateName, validateRating, validatePosition } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import RosterImageUpload from './RosterImageUpload';
import { defensivePositions, offensePositions, positions, specialTeamsPositions } from '@/types/playerTypes';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface Player {
  id: number;
  jerseyNumber: string; // New field
  name: string;
  position: string;
  year: string;
  rating: string;
  devTrait: 'Normal' | 'Impact' | 'Star' | 'Elite';
  notes: string;
}

interface DevTraitBadgeProps {
  trait: 'Normal' | 'Impact' | 'Star' | 'Elite';
}

const years = ['FR', 'FR (RS)', 'SO', 'SO (RS)', 'JR', 'JR (RS)', 'SR', 'SR (RS)'];
const devTraits = ['Normal', 'Impact', 'Star', 'Elite'] as const;

type SortField = 'jersey #' | 'name' | 'position' | 'year' | 'rating' | 'dev. trait';

const yearOrder: { [key: string]: number } = {
  'FR': 0, 'FR (RS)': 1, 'SO': 2, 'SO (RS)': 3, 'JR': 4, 'JR (RS)': 5, 'SR': 6, 'SR (RS)': 7
};

const devTraitOrder: { [key: string]: number } = {
  'Normal': 0, 'Impact': 1, 'Star': 2, 'Elite': 3
};

const Roster: React.FC = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('players', []);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({ jerseyNumber: '', name: '', position: '', year: '', rating: '', devTrait: 'Normal', notes: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' }>({ field: 'rating', direction: 'desc' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [posFilter, setPosFilter] = useState('all');

  useEffect(() => {
    setSortConfig({ field: 'rating', direction: 'desc' });
  }, [players]);

  // Export functionality
  const exportToCSV = () => {
    const csvData = players.map(player => ({
      'Jersey #': player.jerseyNumber,
      'Name': player.name,
      'Position': player.position,
      'Year': player.year,
      'Rating': player.rating,
      'Development Trait': player.devTrait,
      'Notes': player.notes
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `roster-${new Date().toISOString().split('T')[0]}.csv`);
    notifySuccess('Roster exported successfully');
  };

  useEffect(() => {
    // Filter Players based on Filter Rule
    if (posFilter === 'all')
      setFilteredPlayers(players);
    else if (posFilter === 'offense') {
      let filter = players.filter((player) => offensePositions.includes(player.position))
      setFilteredPlayers(filter);
    }
    else if (posFilter === 'defense') {
      let filter = players.filter((player) => defensivePositions.includes(player.position))
      setFilteredPlayers(filter);
    }
    else if (posFilter === 'specialTeams') {
      let filter = players.filter((player) => specialTeamsPositions.includes(player.position))
      setFilteredPlayers(filter);
    }
    else {
      let filter = players.filter((player) => player.position === posFilter);
      setFilteredPlayers(filter);
    }

  }, [posFilter, players])

  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (sortConfig.field === 'jersey #') {
      return sortConfig.direction === 'asc'
        ? a.jerseyNumber.localeCompare(b.jerseyNumber, undefined, { numeric: true })
        : b.jerseyNumber.localeCompare(a.jerseyNumber, undefined, { numeric: true });
    }
    if (sortConfig.field === 'year') {
      const yearDiff = yearOrder[a.year] - yearOrder[b.year];
      if (yearDiff === 0) {
        const ratingDiff = parseInt(a.rating) - parseInt(b.rating);
        return sortConfig.direction === 'asc' ? ratingDiff : -ratingDiff
      }
      return sortConfig.direction === 'asc' ? yearDiff : -yearDiff;
    } else if (sortConfig.field === 'rating') {
      return sortConfig.direction === 'asc'
        ? parseInt(a.rating) - parseInt(b.rating)
        : parseInt(b.rating) - parseInt(a.rating);
    } else if (sortConfig.field === 'dev. trait') {
      const traitDiff = devTraitOrder[a.devTrait] - devTraitOrder[b.devTrait];
      if (traitDiff === 0) {
        const ratingDiff = parseInt(a.rating) - parseInt(b.rating);
        return sortConfig.direction === 'asc' ? ratingDiff : -ratingDiff
      }
      return sortConfig.direction === 'asc' ? traitDiff : -traitDiff;
    } else {
      if (a[sortConfig.field] < b[sortConfig.field]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.field] > b[sortConfig.field]) return sortConfig.direction === 'asc' ? 1 : -1;
      return sortConfig.direction === 'asc' ? parseInt(a.rating) - parseInt(b.rating) : parseInt(b.rating) - parseInt(a.rating);
    }
  });

  const requestSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const addPlayer = () => {
    if (validatePlayer(newPlayer)) {
      try {
        setPlayers([...players, { ...newPlayer, id: Date.now(), name: capitalizeName(newPlayer.name) }]);
        setNewPlayer({ jerseyNumber: '', name: '', position: '', year: '', rating: '', devTrait: 'Normal', notes: '' });
        toast.success('Player added successfully!');
      } catch (error) {
        console.error('Error adding player:', error);
        toast.error('Failed to add player. Please try again.');
      }
    } else {
      toast.error('Please correct the errors before adding the player.');
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };

    if (validatePlayer(updatedPlayers[index])) {
      try {
        setPlayers(updatedPlayers);
        toast.success('Player updated successfully!');
      } catch (error) {
        console.error('Error updating player:', error);
        toast.error('Failed to update player. Please try again.');
      }
    } else {
      toast.error('Please correct the errors before updating the player.');
    }
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setNewPlayer(player);
  };

  const saveEdit = () => {
    setPlayers(players.map(player =>
      player.id === editingId
        ? { ...newPlayer, id: player.id, name: capitalizeName(newPlayer.name) }
        : player
    ));
    setEditingId(null);
    setNewPlayer({ jerseyNumber: '', name: '', position: '', year: '', rating: '', devTrait: 'Normal', notes: '' });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPlayer({ jerseyNumber: '', name: '', position: '', year: '', rating: '', devTrait: 'Normal', notes: '' });
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(player => player.id !== id));
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const validatePlayer = (player: Omit<Player, 'id'>): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!player.jerseyNumber.trim()) {
      newErrors.jerseyNumber = 'Jersey number is required.';
    } else if (!/^\d+$/.test(player.jerseyNumber)) {
      newErrors.jerseyNumber = 'Jersey number must be a valid number.';
    }

    if (!validateName(player.name)) {
      newErrors.name = 'Invalid name. Please enter a non-empty name up to 100 characters.';
    }
    if (!validatePosition(player.position)) {
      newErrors.position = 'Invalid position. Please select a valid position.';
    }
    if (!validateRating(player.rating)) {
      newErrors.rating = 'Invalid rating. Please enter a number between 0 and 99.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcessComplete = (newPlayers: Omit<Player, 'id' | 'devTrait' | 'notes' | 'jerseyNumber'>[]) => {
    const playersWithIds = newPlayers.map(player => ({
      ...player,
      id: Date.now() + Math.random(),
      jerseyNumber: '', // Default empty string for jersey number
      devTrait: 'Normal' as const,
      notes: ''
    }));
    setPlayers(prevPlayers => [...prevPlayers, ...playersWithIds]);
  };

  const handleJerseyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2); // Only allow numbers, max 2 digits
    setNewPlayer({ ...newPlayer, jerseyNumber: value });
  };

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


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Roster</h1>


      <Card className="shadow-lg">
        <CardHeader className="text-xl font-semibold">
          {editingId ? 'Edit Player' : 'Add New Player'}
          <div className="flex justify-end">
            <div className="flex items-center gap-6">
              <RosterImageUpload onProcessComplete={handleProcessComplete} />
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex gap-2"
              >
                <Download className="h-4 w-8" />
                Export Roster
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            <div className="space-y-2">
              <Input
                id="jerseyNumber"
                value={newPlayer.jerseyNumber}
                onChange={handleJerseyNumberChange}
                placeholder="Jersey #"
                className={`text-center font-bold ${errors.jerseyNumber ? 'border-red-500' : ''}`}
                maxLength={2}
              />
              {errors.jerseyNumber && (
                <p className="text-red-500 text-xs">{errors.jerseyNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                id="name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="Player Name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Select
                value={newPlayer.position}
                onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={newPlayer.year}
                onValueChange={(value) => setNewPlayer({ ...newPlayer, year: value })}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                id="rating"
                value={newPlayer.rating}
                onChange={(e) => setNewPlayer({ ...newPlayer, rating: e.target.value })}
                placeholder="Player Overall"
                className={`text-center ${errors.rating ? 'border-red-500' : ''}`}
                maxLength={2}
              />
              {errors.rating && (
                <p className="text-red-500 text-xs">{errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <Select
                value={newPlayer.devTrait}
                onValueChange={(value) => setNewPlayer({ ...newPlayer, devTrait: value as Player['devTrait'] })}
              >
                <SelectTrigger id="devTrait">
                  <SelectValue placeholder="Dev Trait" />
                </SelectTrigger>
                <SelectContent>
                  {devTraits.map(trait => (
                    <SelectItem key={trait} value={trait}>{trait}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                id="notes"
                value={newPlayer.notes}
                onChange={(e) => setNewPlayer({ ...newPlayer, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <div className="flex items-center justify-center mt-6 space-x-3">
            {editingId ? (
              <>
                <Button onClick={saveEdit} className="bg-blue-800 dark:bg-blue-100 hover:bg-green-400">
                  Save Changes
                </Button>
                <Button onClick={cancelEdit} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={addPlayer} className="bg-blue-800 dark:bg-blue-100 hover:bg-green-400">
                Add Player to Roster
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="text-xl font-semibold">
          Current Roster
        </CardHeader>
        <CardContent>
          <div className='w-1/6 pb-4'>
            <Select
              value={posFilter}
              onValueChange={(value) => setPosFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='All Positions'></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={'all'} value='all'>All Positions</SelectItem>
                <SelectItem key={'offense'} value='offense'>Offense</SelectItem>
                <SelectItem key={'defense'} value='defense'>Defense</SelectItem>
                <SelectItem key={'specialTeams'} value='specialTeams'>Special Teams</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <thead>
              <tr className="bg-muted/50">
                {['Jersey #', 'Name', 'Position', 'Year', 'Rating', 'Dev. Trait', 'Notes', 'Edit / Delete'].map((header, index) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-center text-sm font-medium cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => requestSort(header.toLowerCase() as SortField)}
                    onMouseEnter={() => setHoveredColumn(index)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  >
                    <div className="items-center gap-2">
                      {header}
                      {sortConfig.field === header.toLowerCase() && (
                        <span className={`transition-transform duration-200 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'
                          }`}>
                          ↑
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, idx) => (
                <tr
                  key={player.id}
                  className={`border-t transition-colors hover:bg-muted/50 table-hover-row
                    ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                  `}
                >
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.jerseyNumber}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 1 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.name}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 2 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.position}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 3 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.year}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 4 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.rating}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 5 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{<DevTraitBadge trait={player.devTrait} />}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 6 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>{player.notes}</td>
                  <td className={` text-base text-center table-hover-cell ${hoveredColumn === 7 ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                    <div className="flex items-center gap-2 justify-center p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(player)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Player</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {player.name} (#{player.jerseyNumber}) from the roster?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removePlayer(player.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Player
                            </AlertDialogAction>
                          </AlertDialogFooter>
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

export default Roster;
