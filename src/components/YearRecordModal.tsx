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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] h-full flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{year} Season Record</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="flex-grow flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General Stats</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="recruits">Recruits & Transfers</TabsTrigger>
            <TabsTrigger value="awards">Awards & Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-grow">
            <ScrollArea className="h-full p-4">
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
          <TabsContent value="schedule" className="flex-grow">
            <ScrollArea className="h-full p-4">
              <Table>
                <thead>
                  <tr>
                    <th className="w-16">Week</th>
                    <th>Opponent</th>
                    <th className="w-24">Result</th>
                    <th className="w-24">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {record.schedule.map((game, index) => (
                    <tr key={index}>
                      <td>{game.week}</td>
                      <td>
                        <Input
                          value={game.opponent}
                          onChange={(e) => updateSchedule(index, 'opponent', e.target.value)}
                          placeholder="Team Name"
                        />
                      </td>
                      <td>
                        <Select
                          value={game.result}
                          onValueChange={(value) => updateSchedule(index, 'result', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Win">W</SelectItem>
                            <SelectItem value="Loss">L</SelectItem>
                            <SelectItem value="Tie">T</SelectItem>
                            <SelectItem value="Bye">Bye</SelectItem>
                            <SelectItem value="N/A">-</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Input
                          value={game.score}
                          onChange={(e) => updateSchedule(index, 'score', e.target.value)}
                          placeholder="00-00"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recruits" className="flex-grow">
            <ScrollArea className="h-full p-4">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Recruits</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Stars</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Rating</th>
                        <th>Potential</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.recruits?.map((recruit, index) => (
                        <tr key={index}>
                          <td className="text-center">{recruit.stars} ⭐</td>
                          <td className="text-center">{recruit.name}</td>
                          <td className="text-center">{recruit.position}</td>
                          <td className="text-center">{recruit.rating}</td>
                          <td className="text-center">{recruit.potential}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Transfers</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Stars</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>To / From</th>
                        <th>School</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.transfers?.map((transfer, index) => (
                        <tr key={index}>
                          <td className="text-center">{transfer.stars} ⭐</td>
                          <td className="text-center">{transfer.playerName}</td>
                          <td className="text-center">{transfer.position}</td>
                          <td className="text-center">{transfer.transferDirection}</td>
                          <td className="text-center">{transfer.school}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="awards" className="flex-grow">
            <ScrollArea className="h-full p-4">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Player Awards</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Award</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.playerAwards?.map((award, index) => (
                        <tr key={index}>
                          <td className="text-center">{award.playerName}</td>
                          <td className="text-center">{award.awardName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Players Drafted</h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Player Name</th>
                        <th>Round</th>
                        <th className="w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.playersDrafted.map((player, index) => (
                        <tr key={index}>
                          <td>
                            <Input
                              value={player.playerName}
                              onChange={(e) => updateDraftedPlayer(index, 'playerName', e.target.value)}
                              placeholder="Player Name"
                            />
                          </td>
                          <td>
                            <Input
                              value={player.round}
                              onChange={(e) => updateDraftedPlayer(index, 'round', e.target.value)}
                              placeholder="Round #"
                            />
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => saveDraftedPlayer(index)} 
                                variant="default"
                                size="sm"
                                className="flex-1"
                                disabled={!player.playerName || !player.round}
                              >
                                Save
                              </Button>
                              <Button 
                                onClick={() => removeDraftedPlayer(index)} 
                                variant="destructive" 
                                size="sm"
                                className="flex-1"
                              >
                                Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Button onClick={addDraftedPlayer} className="w-full mt-4">
                    Add Drafted Player
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6 px-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearRecordModal;
