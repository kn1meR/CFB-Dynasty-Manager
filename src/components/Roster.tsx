"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import useLocalStorage from '@/hooks/useLocalStorage';
import { capitalizeName } from '@/utils';
import { validateName, validateRating, validatePosition } from '@/utils/validationUtils';
import { toast } from 'react-hot-toast';
import RosterImageUpload from './RosterImageUpload';
import { defensivePositions, offensePositions, positions, specialTeamsPositions } from '@/types/playerTypes';
import { notifySuccess, MESSAGES } from '@/utils/notification-utils';
import { Pencil, Trash2, Download, Shirt, Plus } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import RosterCSVImport from './RosterCSVImport';
import { Label } from '@/components/ui/label';
import { usePlayerCard } from '@/hooks/usePlayerCard';
import PlayerCard from './PlayerCard';

interface Player {
  id: number;
  jerseyNumber: string;
  name: string;
  position: string;
  year: string;
  rating: string;
  devTrait: 'Normal' | 'Impact' | 'Star' | 'Elite';
  notes: string;
  isRedshirted: boolean;
}

interface DevTraitBadgeProps {
  trait: 'Normal' | 'Impact' | 'Star' | 'Elite';
}

const years = ['FR', 'FR (RS)', 'SO', 'SO (RS)', 'JR', 'JR (RS)', 'SR', 'SR (RS)'];
const devTraits = ['Normal', 'Impact', 'Star', 'Elite'] as const;
type SortField = 'jersey #' | 'name' | 'position' | 'year' | 'rating' | 'dev. trait';
const yearOrder: { [key: string]: number } = { 'FR': 0, 'FR (RS)': 1, 'SO': 2, 'SO (RS)': 3, 'JR': 4, 'JR (RS)': 5, 'SR': 6, 'SR (RS)': 7 };
const devTraitOrder: { [key: string]: number } = { 'Normal': 0, 'Impact': 1, 'Star': 2, 'Elite': 3 };

const FILTER_ALL = 'all';
const FILTER_OFFENSE = 'offense';
const FILTER_DEFENSE = 'defense';
const FILTER_SPECIAL_TEAMS = 'specialTeams';

const initialNewPlayerState: Omit<Player, 'id'> = {
  jerseyNumber: '', name: '', position: '', year: '', rating: '', devTrait: 'Normal', notes: '', isRedshirted: false,
};

const DevTraitBadge: React.FC<DevTraitBadgeProps> = ({ trait }) => {
  const colors = {
    'Elite': 'bg-red-400 text-purple-100 dark:bg-red-700 dark:text-purple-0',
    'Star': 'bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:text-black',
    'Impact': 'bg-gray-400 text-gray-100 dark:bg-gray-600 dark:text-green-0',
    'Normal': 'bg-yellow-800 text-gray-100 dark:bg-yellow-900 dark:text-gray-0'
  } as const;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm/6 font-medium ${colors[trait]}`}>{trait}</span>;
};

const Roster: React.FC = () => {
  const [players, setPlayers] = useLocalStorage<Player[]>('players', []);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>(initialNewPlayerState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' }>({ field: 'rating', direction: 'desc' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [posFilter, setPosFilter] = useState(FILTER_ALL);
  const { selectedPlayer, isOpen, openPlayerCard, closePlayerCard } = usePlayerCard();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (posFilter === FILTER_ALL) setFilteredPlayers(players);
    else if (posFilter === FILTER_OFFENSE) setFilteredPlayers(players.filter((p) => offensePositions.includes(p.position)));
    else if (posFilter === FILTER_DEFENSE) setFilteredPlayers(players.filter((p) => defensivePositions.includes(p.position)));
    else if (posFilter === FILTER_SPECIAL_TEAMS) setFilteredPlayers(players.filter((p) => specialTeamsPositions.includes(p.position)));
    else setFilteredPlayers(players.filter((p) => p.position === posFilter));
  }, [posFilter, players]);

  const handleImportComplete = useCallback((importedPlayers: Partial<Player>[]) => {
    setPlayers(prev => [...prev, ...importedPlayers.map(p => ({
        id: Date.now() + Math.random(),
        jerseyNumber: p.jerseyNumber || '', name: p.name || 'N/A', position: p.position || '', year: p.year || '',
        rating: p.rating || '0', devTrait: p.devTrait || 'Normal', notes: p.notes || '',
        isRedshirted: p.isRedshirted || false,
      }))]);
    toast.success('Roster imported successfully!');
  }, [setPlayers]);

  const exportToCSV = useCallback(() => {
    const csvData = players.map(p => ({
      'Jersey #': p.jerseyNumber, 'Name': p.name, 'Position': p.position, 'Year': p.year, 'Rating': p.rating,
      'Dev. Trait': p.devTrait, 'Is Redshirted': p.isRedshirted ? 'Yes' : 'No', 'Notes': p.notes
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `roster-${new Date().toISOString().split('T')[0]}.csv`);
    notifySuccess('Roster exported successfully');
  }, [players]);

  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      if (sortConfig.field === 'jersey #') return sortConfig.direction === 'asc' ? a.jerseyNumber.localeCompare(b.jerseyNumber, undefined, { numeric: true }) : b.jerseyNumber.localeCompare(a.jerseyNumber, undefined, { numeric: true });
      if (sortConfig.field === 'year') return sortConfig.direction === 'asc' ? yearOrder[a.year] - yearOrder[b.year] : yearOrder[b.year] - yearOrder[a.year];
      if (sortConfig.field === 'rating') return sortConfig.direction === 'asc' ? parseInt(a.rating) - parseInt(b.rating) : parseInt(b.rating) - parseInt(a.rating);
      if (sortConfig.field === 'dev. trait') return sortConfig.direction === 'asc' ? devTraitOrder[a.devTrait] - devTraitOrder[b.devTrait] : devTraitOrder[b.devTrait] - devTraitOrder[a.devTrait];
      const field = sortConfig.field as 'name' | 'position';
      return sortConfig.direction === 'asc' ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field]);
    });
  }, [filteredPlayers, sortConfig]);

  const requestSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({ field, direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc' }));
  }, []);

  const validatePlayer = useCallback((player: Omit<Player, 'id'>): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!player.jerseyNumber.trim() || !/^\d+$/.test(player.jerseyNumber)) newErrors.jerseyNumber = 'Jersey # is required and must be a number.';
    if (!validateName(player.name)) newErrors.name = 'Name is required (max 100 chars).';
    if (!validatePosition(player.position)) newErrors.position = 'Please select a position.';
    if (!validateRating(player.rating)) newErrors.rating = 'Rating must be 0-99.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setNewPlayer(initialNewPlayerState);
    setErrors({});
    setIsFormOpen(true);
  };

  const startEditing = useCallback((player: Player) => {
    setEditingId(player.id);
    setNewPlayer(player);
    setErrors({});
    setIsFormOpen(true);
  }, []);
  
  const handleFormSubmit = useCallback(() => {
    if (editingId) { // This is an edit
        if (validatePlayer(newPlayer)) {
            setPlayers(prev => prev.map(p => p.id === editingId ? { ...newPlayer, id: p.id, name: capitalizeName(newPlayer.name) } : p));
            notifySuccess(MESSAGES.SAVE_SUCCESS);
            setIsFormOpen(false);
        } else {
            toast.error('Please correct errors before saving.');
        }
    } else { // This is a new player
        if (validatePlayer(newPlayer)) {
            setPlayers(prev => [...prev, { ...newPlayer, id: Date.now(), name: capitalizeName(newPlayer.name) }]);
            notifySuccess('Player added successfully!');
            setIsFormOpen(false);
        } else {
            toast.error('Please correct errors before adding.');
        }
    }
  }, [newPlayer, editingId, validatePlayer, setPlayers]);

  const removePlayer = useCallback((id: number) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    notifySuccess(MESSAGES.DELETE_SUCCESS);
  }, [setPlayers]);

  const handleProcessComplete = useCallback((processedNewPlayers: Omit<Player, 'id' | 'devTrait' | 'notes' | 'jerseyNumber' | 'isRedshirted'>[]) => {
    const playersWithDefaults = processedNewPlayers.map(p => ({
      ...p, id: Date.now() + Math.random(), jerseyNumber: '', devTrait: 'Normal' as const, notes: '', isRedshirted: false,
    }));
    setPlayers(prev => [...prev, ...playersWithDefaults]);
    notifySuccess('Players processed from image!');
  }, [setPlayers]);

  const toggleRedshirtStatus = useCallback((playerId: number) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isRedshirted: !p.isRedshirted } : p));
  }, [setPlayers]);

  const getRowClassName = useCallback((player: Player) => {
    return `border-t transition-colors ${player.isRedshirted ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200/80 dark:hover:bg-red-800/50' : 'hover:bg-muted/50'}`;
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Roster Management</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-semibold">Team Roster</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleOpenAddForm} className="btn-school-primary"><Plus className="h-4 w-4 mr-2" />Add New Player</Button>
                  <RosterImageUpload onProcessComplete={handleProcessComplete} />
                  <RosterCSVImport onImportComplete={handleImportComplete} />
                  <Button onClick={exportToCSV} variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 pb-4'>
            <Select value={posFilter} onValueChange={(value) => setPosFilter(value)}>
              <SelectTrigger><SelectValue placeholder='Filter by Position' /></SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>All Positions</SelectItem>
                <SelectItem value={FILTER_OFFENSE}>Offense</SelectItem>
                <SelectItem value={FILTER_DEFENSE}>Defense</SelectItem>
                <SelectItem value={FILTER_SPECIAL_TEAMS}>Special Teams</SelectItem>
                {positions.map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {sortedPlayers.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {['Jersey #', 'Name', 'Position', 'Year', 'Rating', 'Dev. Trait', 'Notes', 'Actions'].map(header => (
                                <TableHead key={header} className="text-center cursor-pointer" onClick={() => header !== 'Actions' && requestSort(header.toLowerCase() as SortField)}>
                                    <div className="flex items-center justify-center gap-1">
                                        {header}
                                        {header !== 'Actions' && sortConfig.field === header.toLowerCase() && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPlayers.map(player => (
                        <TableRow key={player.id} className={getRowClassName(player)}>
                            <TableCell className="text-center font-mono">{player.jerseyNumber}</TableCell>
                            <TableCell className="text-center font-medium">
                                <button onClick={() => openPlayerCard(player)} className="hover:underline">{player.name}</button>
                            </TableCell>
                            <TableCell className="text-center">{player.position}</TableCell>
                            <TableCell className="text-center">{player.year}</TableCell>
                            <TableCell className="text-center font-bold">{player.rating}</TableCell>
                            <TableCell className="text-center"><DevTraitBadge trait={player.devTrait} /></TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground max-w-xs truncate" title={player.notes}>{player.notes}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center gap-1 justify-center">
                                    <Button variant="ghost" size="icon" onClick={() => toggleRedshirtStatus(player.id)} title={player.isRedshirted ? "Remove Redshirt" : "Add Redshirt"}><Shirt className={`h-4 w-4 ${player.isRedshirted ? 'text-red-600' : 'text-muted-foreground'}`} /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => startEditing(player)} title="Edit Player"><Pencil className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Remove Player"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Remove Player</AlertDialogTitle><AlertDialogDescription>Are you sure you want to remove {player.name}?</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removePlayer(player.id)}>Remove</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No players found. Add a player or adjust filters.</p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Player Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Player' : 'Add New Player'}</DialogTitle>
                <CardDescription>Fill in the details for the player.</CardDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                <div className="space-y-1.5"><Label htmlFor="jerseyNumber">Jersey #</Label><Input id="jerseyNumber" value={newPlayer.jerseyNumber} onChange={e => setNewPlayer(p => ({ ...p, jerseyNumber: e.target.value.replace(/\D/g, '').slice(0, 2) }))} placeholder="#" className={errors.jerseyNumber ? 'border-red-500' : ''}/>{errors.jerseyNumber && <p className="text-red-500 text-xs">{errors.jerseyNumber}</p>}</div>
                <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" className={errors.name ? 'border-red-500' : ''}/>{errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}</div>
                <div className="space-y-1.5"><Label htmlFor="position">Position</Label><Select value={newPlayer.position} onValueChange={v => setNewPlayer(p => ({ ...p, position: v }))}><SelectTrigger id="position" className={errors.position ? 'border-red-500' : ''}><SelectValue placeholder="Position" /></SelectTrigger><SelectContent>{positions.map(pos => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}</SelectContent></Select>{errors.position && <p className="text-red-500 text-xs">{errors.position}</p>}</div>
                <div className="space-y-1.5"><Label htmlFor="year">Year</Label><Select value={newPlayer.year} onValueChange={v => setNewPlayer(p => ({ ...p, year: v }))}><SelectTrigger id="year"><SelectValue placeholder="Year" /></SelectTrigger><SelectContent>{years.map(y => (<SelectItem key={y} value={y}>{y}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label htmlFor="rating">Rating</Label><Input id="rating" value={newPlayer.rating} onChange={e => setNewPlayer(p => ({ ...p, rating: e.target.value.replace(/\D/g, '').slice(0, 2) }))} placeholder="OVR" className={errors.rating ? 'border-red-500' : ''}/>{errors.rating && <p className="text-red-500 text-xs">{errors.rating}</p>}</div>
                <div className="space-y-1.5"><Label htmlFor="devTrait">Dev. Trait</Label><Select value={newPlayer.devTrait} onValueChange={v => setNewPlayer(p => ({ ...p, devTrait: v as Player['devTrait'] }))}><SelectTrigger id="devTrait"><SelectValue placeholder="Trait" /></SelectTrigger><SelectContent>{devTraits.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-1.5 col-span-1 md:col-span-2"><Label htmlFor="notes">Notes</Label><Input id="notes" value={newPlayer.notes} onChange={e => setNewPlayer(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..."/></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button onClick={handleFormSubmit}>{editingId ? 'Save Changes' : 'Add Player'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedPlayer && (
        <PlayerCard player={selectedPlayer} isOpen={isOpen} onClose={closePlayerCard} />
      )}
    </div>
  );
};

export default Roster;