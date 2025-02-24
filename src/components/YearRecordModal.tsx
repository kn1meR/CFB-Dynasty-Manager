"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftedPlayer, Recruit, Transfer } from '@/types/playerTypes';
//import { Award } from '@/types/statTypes';
import { YearRecord, Game, YearStats } from '@/types/yearRecord';
import { getRecruits, getTransfers, getYearAwards, getYearRecord } from '@/utils/localStorage';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star, TrendingUp, Users, Award } from "lucide-react";


interface YearRecordModalProps {
  year: number;
  onClose: () => void;
}

interface DevTraitBadgeProps {
  trait: 'Normal' | 'Impact' | 'Star' | 'Elite';
}

const SCHEDULE_SIZE = 21;

const YearRecordModal: React.FC<YearRecordModalProps> = ({ year, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const defaultSchedule: Game[] = Array(SCHEDULE_SIZE)
    .fill({ week: 0, opponent: '', result: '', score: '' })
    .map((game, index) => ({ ...game, week: index }));

  const [record, setRecord] = useState<YearRecord>({
    year,
    overallRecord: '',
    conferenceRecord: '',
    bowlGame: '',
    bowlResult: '',
    pointsFor: '',
    pointsAgainst: '',
    natChamp: '',
    heisman: '',
    schedule: defaultSchedule,
    recruits: [],
    transfers: [],
    playerAwards: [],
    recruitingClassPlacement: '',
    playersDrafted: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        let existingRecord = getYearRecord(year);

        // Handle schedule expansion while preserving existing data
        let updatedSchedule = existingRecord.schedule || [];
        if (updatedSchedule.length < SCHEDULE_SIZE) {
          // Create additional empty slots while preserving existing games
          const additionalSlots = Array(SCHEDULE_SIZE - updatedSchedule.length)
            .fill({ week: 0, opponent: '', result: '', score: '' })
            .map((game, index) => ({
              ...game,
              week: updatedSchedule.length + index
            }));

          updatedSchedule = [...updatedSchedule, ...additionalSlots];
        }

        const updates = {
          playerAwards: existingRecord.playerAwards.length === 0 ? getYearAwards(year) : existingRecord.playerAwards,
          transfers: existingRecord.transfers?.length === 0 ? getTransfers(year) : existingRecord.transfers,
          recruits: existingRecord.recruits?.length === 0 ? getRecruits(year) : existingRecord.recruits,
          schedule: updatedSchedule
        };

        setRecord({ ...existingRecord, ...updates });
      } catch (error) {
        notifyError(MESSAGES.SAVE_ERROR);
      }
    };

    loadData();
  }, [year]);

  const handleSave = () => {
    try {
      const storedRecords = localStorage.getItem('yearRecords');
      let records: YearRecord[] = storedRecords ? JSON.parse(storedRecords) : [];
      const existingIndex = records.findIndex(r => r.year === year);

      if (existingIndex !== -1) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }

      localStorage.setItem('yearRecords', JSON.stringify(records));
      notifySuccess(MESSAGES.SAVE_SUCCESS);
      onClose();
    } catch (error) {
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const updateSchedule = (index: number, field: keyof Game, value: string) => {
    setRecord(prev => {
      const updatedSchedule = [...prev.schedule];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      return { ...prev, schedule: updatedSchedule };
    });
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

  const updateDraftedPlayer = (index: number, field: keyof DraftedPlayer, value: string) => {
    setRecord(prev => {
      const updatedPlayersDrafted = [...prev.playersDrafted];
      updatedPlayersDrafted[index] = { ...updatedPlayersDrafted[index], [field]: value };
      return { ...prev, playersDrafted: updatedPlayersDrafted };
    });
  };

  const addDraftedPlayer = () => {
    setRecord(prev => ({
      ...prev,
      playersDrafted: [...prev.playersDrafted, { playerName: '', round: '', isLocked: false }]
    }));
  };

  const saveDraftedPlayer = (index: number) => {
    const player = record.playersDrafted[index];
    if (!player.playerName || !player.round) {
      notifyError('Please fill in both player name and round before saving');
      return;
    }

    // If this was the last row, add a new empty row
    if (index === record.playersDrafted.length - 1) {
      setRecord(prev => ({
        ...prev,
        playersDrafted: [...prev.playersDrafted, { playerName: '', round: '' }]
      }));
    }
    notifySuccess('Player drafted successfully');
  };

  const removeDraftedPlayer = (index: number) => {
    setRecord(prev => ({
      ...prev,
      playersDrafted: prev.playersDrafted.filter((_, i) => i !== index)
    }));
    notifySuccess(MESSAGES.DELETE_SUCCESS);
  };

  const calculatePointDifferential = (pointsFor: string, pointsAgainst: string) => {
    const pf = parseInt(pointsFor) || 0;
    const pa = parseInt(pointsAgainst) || 0;
    const diff = pf - pa;
    return diff > 0 ? `+${diff}` : diff.toString();
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win':
        return 'text-green-600 dark:text-green-500 font-semibold';
      case 'Loss':
        return 'text-red-600 dark:text-red-500 font-semibold';
      default:
        return '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-2xl font-bold text-center">{year} Season Recap</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">

          <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
            <TabsList className="flex justify-center border-b px-6 py-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-2">
                {[
                  { value: 'general', label: 'General Stats' },
                  { value: 'schedule', label: 'Schedule' },
                  { value: 'recruits', label: 'Recruits & Transfers' },
                  { value: 'awards', label: 'Awards & Draft' }
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="px-6 py-3 text-lg font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            <TabsContent value="general" className="flex-grow">
              <ScrollArea className="pt-6 h-[calc(100vh-300px)]">
                <div className="space-y-8 max-w-4xl mx-auto">
                  {/* Season Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <Trophy className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">Overall Record</p>
                            <h3 className="text-2xl font-bold text-blue-600">{record.overallRecord || "0-0"}</h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <Medal className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-600">Conference Record</p>
                            <h3 className="text-2xl font-bold text-green-600">{record.conferenceRecord || "0-0"}</h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <Star className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-purple-600">Recruiting Rank</p>
                            <h3 className="text-2xl font-bold text-purple-600">#{record.recruitingClassPlacement || "—"}</h3>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Points Summary */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Scoring Stats
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                              <label className="font-medium">Points For</label>
                              <Input
                                id="pointsFor"
                                value={record.pointsFor}
                                onChange={(e) => setRecord(prev => ({ ...prev, pointsFor: e.target.value }))}
                                placeholder="0"
                                className="w-32 text-right"
                              />
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <label className="font-medium">Points Against</label>
                              <Input
                                id="pointsAgainst"
                                value={record.pointsAgainst}
                                onChange={(e) => setRecord(prev => ({ ...prev, pointsAgainst: e.target.value }))}
                                placeholder="0"
                                className="w-32 text-right"
                              />
                            </div>
                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span>Point Differential</span>
                              <span>{calculatePointDifferential(record.pointsFor, record.pointsAgainst)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Records
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <label className="font-medium">Overall Record</label>
                              <Input
                                id="overallRecord"
                                value={record.overallRecord}
                                onChange={(e) => setRecord(prev => ({ ...prev, overallRecord: e.target.value }))}
                                placeholder="0-0"
                                className="w-32"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="font-medium">Conference Record</label>
                              <Input
                                id="conferenceRecord"
                                value={record.conferenceRecord}
                                onChange={(e) => setRecord(prev => ({ ...prev, conferenceRecord: e.target.value }))}
                                placeholder="0-0"
                                className="w-32"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bowl Game & Championships */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Season Achievements
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-medium">Bowl Game</label>
                            <Input
                              id="bowlGame"
                              value={record.bowlGame}
                              onChange={(e) => setRecord(prev => ({ ...prev, bowlGame: e.target.value }))}
                              placeholder="Bowl Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-medium">Bowl Result</label>
                            <Select
                              value={record.bowlResult}
                              onValueChange={(value) => setRecord(prev => ({ ...prev, bowlResult: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select result" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Win">Win</SelectItem>
                                <SelectItem value="Loss">Loss</SelectItem>
                                <SelectItem value="N/A">N/A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="font-medium">National Champion</label>
                            <Input
                              id="natChamp"
                              value={record.natChamp}
                              onChange={(e) => setRecord(prev => ({ ...prev, natChamp: e.target.value }))}
                              placeholder="Team Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-medium">Heisman Winner</label>
                            <Input
                              id="heisman"
                              value={record.heisman}
                              onChange={(e) => setRecord(prev => ({ ...prev, heisman: e.target.value }))}
                              placeholder="Player Name"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Rankings Summary */}
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Rankings
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="font-medium">Final Ranking</label>
                          <Input
                            id="finalRanking"
                            value={record.finalRanking || ""}
                            onChange={(e) => setRecord(prev => ({ ...prev, finalRanking: e.target.value }))}
                            placeholder="#"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Recruiting Class</label>
                          <Input
                            id="classRanking"
                            value={record.recruitingClassPlacement}
                            onChange={(e) => setRecord(prev => ({ ...prev, recruitingClassPlacement: e.target.value }))}
                            placeholder="#"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Conference Finish</label>
                          <Input
                            id="conferenceFinish"
                            value={record.conferenceFinish || ""}
                            onChange={(e) => setRecord(prev => ({ ...prev, conferenceFinish: e.target.value }))}
                            placeholder="1st"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 max-w-4xl mx-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-16 text-left p-2">Week</th>
                        <th className="text-left p-2">Opponent</th>
                        <th className="w-28 text-center p-2">Result</th>
                        <th className="w-28 text-center p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.schedule.map((game, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="p-2">{game.week}</td>
                          <td className="p-2">{game.opponent}</td>
                          <td className={`p-2 text-center ${getResultColor(game.result)}`}>
                            {game.result === 'N/A' ? '-' : game.result}
                          </td>
                          <td className="p-2 text-center">{game.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Recruits & Transfers Tab */}
            <TabsContent value="recruits" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 max-w-7xl mx-auto">
                  <div className="grid grid-cols-2 gap-20">
                    {/* Recruits Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Recruits</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="w-20 text-center p-2">Stars</th>
                              <th className="text-left p-2">Name</th>
                              <th className="w-24 text-center p-2">Position</th>
                              <th className="w-20 text-center p-2">Rating</th>
                              <th className="w-24 text-center p-2">Potential</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.recruits?.map((recruit, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="text-center p-2">{recruit.stars} ⭐</td>
                                <td className="p-2">{recruit.name}</td>
                                <td className="text-center p-2">{recruit.position}</td>
                                <td className="text-center p-2">{recruit.rating}</td>
                                <td className="text-center p-2"><DevTraitBadge trait={recruit.potential as 'Elite' | 'Star' | 'Impact' | 'Normal'} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Transfers Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Transfers</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="w-20 text-center p-2">Stars</th>
                              <th className="text-left p-2">Name</th>
                              <th className="w-24 text-center p-2">Position</th>
                              <th className="w-24 text-center p-2">To / From</th>
                              <th className="text-left p-2">School</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.transfers?.map((transfer, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="text-center p-2">{transfer.stars} ⭐</td>
                                <td className="p-2">{transfer.playerName}</td>
                                <td className="text-center p-2">{transfer.position}</td>
                                <td className="text-center p-2">
                                  <span className={`font-medium ${transfer.transferDirection === 'To'
                                    ? 'text-red-600 dark:text-red-500'
                                    : 'text-green-600 dark:text-green-500'
                                    }`}>
                                    {transfer.transferDirection}
                                  </span>
                                </td>
                                <td className="p-2">{transfer.school}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Awards & Draft Tab */}
            <TabsContent value="awards" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 max-w-7xl mx-auto">
                  <div className="grid grid-cols-2 gap-20">
                    {/* Player Awards Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Player Awards</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="text-left p-2">Player</th>
                              <th className="text-left p-2">Award</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.playerAwards?.map((award, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="p-2">{award.playerName}</td>
                                <td className="p-2">{award.awardName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Players Drafted Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center relative">
                        <span className="absolute left-1/2 -translate-x-1/2">Players Drafted</span>
                        <div className="ml-auto">
                          <Button
                            onClick={addDraftedPlayer}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Add Player
                          </Button>
                        </div>
                      </h3>
                      <div className="space-y-4">
                        {record.playersDrafted.map((player, index) => (
                          <Card key={index} className="p-4">
                            <div className="grid grid-cols-[1fr,120px,120px] gap-4 items-center">
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Player Name
                                </label>
                                <Input
                                  value={player.playerName}
                                  onChange={(e) => updateDraftedPlayer(index, 'playerName', e.target.value)}
                                  placeholder="Enter player name"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Round
                                </label>
                                <Select
                                  value={player.round}
                                  onValueChange={(value) => updateDraftedPlayer(index, 'round', value)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Round" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 7 }, (_, i) => (
                                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        Round {i + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end justify-end gap-2 h-9">
                                <Button
                                  onClick={() => removeDraftedPlayer(index)}
                                  variant="destructive"
                                  size="sm"
                                  className="h-full"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                        {record.playersDrafted.length === 0 && (
                          <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">
                              No players drafted yet. Click "Add Player" to start adding drafted players.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-4 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearRecordModal;
