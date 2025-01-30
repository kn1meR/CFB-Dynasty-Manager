// src/components/YearRecordModal.tsx

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraftedPlayer, Recruit, Transfer } from '@/types/playerTypes';
import { Award } from '@/types/statTypes';
import { YearRecord, Game, YearStats } from '@/types/yearRecord';
import { getRecruits, getTransfers, getYearAwards, getYearRecord } from '@/utils/localStorage';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';

interface YearRecordModalProps {
  year: number;
  onClose: () => void;
}
const YearRecordModal: React.FC<YearRecordModalProps> = ({ year, onClose }) => {
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
    schedule: Array(19).fill({ week: 0, opponent: '', result: '', score: '' }).map((game, index) => ({ ...game, week: index })),
    recruits: [],
    transfers: [],
    playerAwards: [],
    recruitingClassPlacement: '',
    playersDrafted: [],
  });

  useEffect(() => {
    let existingRecord = getYearRecord(year);

    if(existingRecord.playerAwards.length == 0) {
      const yearAwards = getYearAwards(year);
      existingRecord = {
        ...existingRecord, 
        playerAwards: yearAwards
      }
    }
    if(existingRecord.transfers?.length == 0) {
      const yearTransfers = getTransfers(year);
      existingRecord = {
        ...existingRecord, 
        transfers: yearTransfers
      }
    }
    if(existingRecord.recruits?.length == 0) {
      const yearRecruits = getRecruits(year);
      existingRecord = {
        ...existingRecord, 
        recruits: yearRecruits
      }
    }

    setRecord(existingRecord);

  }, [year]);

  const handleSave = () => {
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
  };

  const updateSchedule = (index: number, field: keyof Game, value: string) => {
    if (record.schedule) {
      const updatedSchedule = [...record.schedule];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      setRecord({ ...record, schedule: updatedSchedule });
    }
  };

  const addDraftedPlayer = () => {
    setRecord(prev => ({
      ...prev,
      playersDrafted: [...prev.playersDrafted, { playerName: '', round: '' }]
    }));
  };

  const updateDraftedPlayer = (index: number, field: keyof DraftedPlayer, value: string) => {
    const updatedPlayersDrafted = [...record.playersDrafted];
    updatedPlayersDrafted[index] = { ...updatedPlayersDrafted[index], [field]: value };
    setRecord({ ...record, playersDrafted: updatedPlayersDrafted });
  };

  const removeDraftedPlayer = (index: number) => {
    const updatedPlayersDrafted = record.playersDrafted.filter((_, i) => i !== index);
    setRecord({ ...record, playersDrafted: updatedPlayersDrafted });
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] h-full flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{year} Season Stats</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6 flex-grow overflow-hidden">
          <div className="w-full md:w-1/3 space-y-4 overflow-y-auto p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="overallRecord" className="text-right">Overall Record:</label>
                  <Input
                    id="overallRecord"
                    value={record.overallRecord}
                    onChange={(e) => setRecord({ ...record, overallRecord: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="conferenceRecord" className="text-right">Conference Record:</label>
                  <Input
                    id="conferenceRecord"
                    value={record.conferenceRecord}
                    onChange={(e) => setRecord({ ...record, conferenceRecord: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="pointsFor" className="text-right">Points For:</label>
                  <Input
                    id="pointsFor"
                    value={record.pointsFor}
                    onChange={(e) => setRecord({ ...record, pointsFor: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="pointsAgainst" className="text-right">Points Against:</label>
                  <Input
                    id="pointsAgainst"
                    value={record.pointsAgainst}
                    onChange={(e) => setRecord({ ...record, pointsAgainst: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="bowlGame" className="text-right">Bowl Game:</label>
                  <Input
                    id="bowlGame"
                    value={record.bowlGame}
                    onChange={(e) => setRecord({ ...record, bowlGame: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="bowlResult" className="text-right">Bowl Result:</label>
                  <Select
                    value={record.bowlResult}
                    onValueChange={(value) => setRecord({ ...record, bowlResult: value })}
                  >
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Win">W</SelectItem>
                      <SelectItem value="Loss">L</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="natChamp" className="text-right">National Champion:</label>
                  <Input
                    id="natChamp"
                    value={record.natChamp}
                    onChange={(e) => setRecord({ ...record, natChamp: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="heisman" className="text-right">Heisman Winner:</label>
                  <Input
                    id="heisman"
                    value={record.heisman}
                    onChange={(e) => setRecord({ ...record, heisman: e.target.value })}
                    className="col-span-2"
                  />
                </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="classRanking" className="text-right">Recruiting Class Rank:</label>
                  <Input
                    id="classRanking"
                    value={record.recruitingClassPlacement}
                    onChange={(e) => setRecord({ ...record, recruitingClassPlacement: e.target.value })}
                    className="col-span-2"
                  />
                </div>
                </div>
            </ScrollArea>
          </div>
          {record.schedule && (
            <div className="w-full md:w-1/3 overflow-hidden">
              <h3 className="text-xl text-center font-semibold mb-2">{year} Schedule</h3>
              <ScrollArea className="h-[calc(100%-3rem)] w-full rounded-md border p-4">
                <Table>
                  <thead>
                    <tr>
                      <th className="w-1/6">Week</th>
                      <th className="w-1/3">Opponent</th>
                      <th className="w-1/4">Result</th>
                      <th className="w-1/4">Score</th>
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
                          />
                        </td>
                        <td>
                          <Select
                            value={game.result}
                            onValueChange={(value) => updateSchedule(index, 'result', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </div>
          )}
          <div className="w-full md:w-1/3 overflow-hidden">
            <h3 className="text-xl text-center font-semibold mb-2">{year} Recruits, Transfers, and Awards</h3>
            <ScrollArea className="h-[calc(100%-3rem)] w-full rounded-md border p-4">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-center">Player Awards</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Award Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.playerAwards?.map((award, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{award.playerName}</td>
                        <td style={{ textAlign: 'center' }}>{award.awardName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <h4 className="text-lg font-semibold text-center">Recruits</h4>
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
                        <td style={{ textAlign: 'center' }}>{recruit.stars} ★</td>
                        <td style={{ textAlign: 'center' }}>{recruit.name}</td>
                        <td style={{ textAlign: 'center' }}>{recruit.position}</td>
                        <td style={{ textAlign: 'center' }}>{recruit.rating}</td>
                        <td style={{ textAlign: 'center' }}>{recruit.potential}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <h4 className="text-lg font-semibold mt-4 text-center">Transfers</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>Stars</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Direction</th>
                      <th>School</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.transfers?.map((transfer, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: 'center' }}>{transfer.stars} ★</td>
                        <td style={{ textAlign: 'center' }}>{transfer.playerName}</td>
                        <td style={{ textAlign: 'center' }}>{transfer.position}</td>
                        <td style={{ textAlign: 'center' }}>{transfer.transferDirection}</td>
                        <td style={{ textAlign: 'center' }}>{transfer.school}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <h4 className="text-lg font-semibold mt-4 text-center">Players Drafted</h4>
                <Table>
                  <thead>
                    <tr>
                      <th>Player Name</th>
                      <th>Round</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.playersDrafted.map((player, index) => (
                      <tr key={index}>
                        <td>
                          <Input
                            value={player.playerName}
                            onChange={(e) => updateDraftedPlayer(index, 'playerName', e.target.value)}
                          />
                        </td>
                        <td>
                          <Input
                            value={player.round}
                            onChange={(e) => updateDraftedPlayer(index, 'round', e.target.value)}
                          />
                        </td>
                        <td>
                          <Button onClick={() => removeDraftedPlayer(index)} variant="destructive" size="sm">
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button onClick={addDraftedPlayer} className="w-full">Add Drafted Player</Button>
              </div>
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default YearRecordModal;
