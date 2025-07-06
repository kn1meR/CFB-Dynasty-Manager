import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface YearRecord {
  year: number;
  overallRecord: string;
  conferenceRecord: string;
  bowlGame: string;
  bowlResult: string;
  playerAwards: PlayerAward[];
}

interface PlayerAward {
  playerName: string;
  awardName: string;
}

const YearRecords: React.FC = () => {
  const [records, setRecords] = useState<YearRecord[]>([]);
  const [newRecord, setNewRecord] = useState<YearRecord>({
    year: new Date().getFullYear(),
    overallRecord: '',
    conferenceRecord: '',
    bowlGame: '',
    bowlResult: '',
    playerAwards: [],
  });

  useEffect(() => {
    const storedRecords = localStorage.getItem('yearRecords');
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yearRecords', JSON.stringify(records));
  }, [records]);

  const addRecord = () => {
    setRecords([...records, newRecord]);
    setNewRecord({
      year: newRecord.year + 1,
      overallRecord: '',
      conferenceRecord: '',
      bowlGame: '',
      bowlResult: '',
      playerAwards: [],
    });
  };

  const updateRecord = (index: number, field: keyof YearRecord, value: string) => {
    const updatedRecords = [...records];
    updatedRecords[index] = { ...updatedRecords[index], [field]: value };
    setRecords(updatedRecords);
  };

  const deleteRecord = (index: number) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
  };
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Year Records</h1>

      <Card>
        <CardHeader className="text-xl font-semibold">Add New Year Record</CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Input
              type="number"
              value={newRecord.year}
              onChange={(e) => setNewRecord({ ...newRecord, year: parseInt(e.target.value) })}
              placeholder="Year"
            />
            <Input
              value={newRecord.overallRecord}
              onChange={(e) => setNewRecord({ ...newRecord, overallRecord: e.target.value })}
              placeholder="Overall Record (e.g., 10-2)"
            />
            <Input
              value={newRecord.conferenceRecord}
              onChange={(e) => setNewRecord({ ...newRecord, conferenceRecord: e.target.value })}
              placeholder="Conference Record (e.g., 7-1)"
            />
            <Input
              value={newRecord.bowlGame}
              onChange={(e) => setNewRecord({ ...newRecord, bowlGame: e.target.value })}
              placeholder="Bowl Game"
            />
            <Select
              value={newRecord.bowlResult}
              onValueChange={(value) => setNewRecord({ ...newRecord, bowlResult: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bowl Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Win">Win</SelectItem>
                <SelectItem value="Loss">Loss</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addRecord}>Add Record</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-xl font-semibold">Year Records</CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Overall Record</th>
                <th>Conference Record</th>
                <th>Bowl Game</th>
                <th>Bowl Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index}>
                  <td>{record.year}</td>
                  <td>
                    <Input
                      value={record.overallRecord}
                      onChange={(e) => updateRecord(index, 'overallRecord', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      value={record.conferenceRecord}
                      onChange={(e) => updateRecord(index, 'conferenceRecord', e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      value={record.bowlGame}
                      onChange={(e) => updateRecord(index, 'bowlGame', e.target.value)}
                    />
                  </td>
                  <td>
                    <Select
                      value={record.bowlResult}
                      onValueChange={(value) => updateRecord(index, 'bowlResult', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Win">Win</SelectItem>
                        <SelectItem value="Loss">Loss</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <Button onClick={() => deleteRecord(index)} variant="destructive" size="sm">
                      Delete
                    </Button>
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

export default YearRecords;