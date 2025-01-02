// src/components/RecruitingCalculator.tsx
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const grades = [
  { label: 'A+', value: 13 },
  { label: 'A', value: 12 },
  { label: 'A-', value: 11 },
  { label: 'B+', value: 10 },
  { label: 'B', value: 9 },
  { label: 'B-', value: 8 },
  { label: 'C+', value: 7 },
  { label: 'C', value: 6 },
  { label: 'C-', value: 5 },
  { label: 'D+', value: 4 },
  { label: 'D', value: 3 },
  { label: 'D-', value: 2 },
  { label: 'F', value: 1 },
];

const RecruitingCalculator: React.FC = () => {
  const [grade1, setGrade1] = useState<number | null>(null);
  const [grade2, setGrade2] = useState<number | null>(null);
  const [grade3, setGrade3] = useState<number | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    if (grade1 !== null && grade2 !== null && grade3 !== null) {
      const total = grade1 + grade2 + grade3;
      if (total <= 17) {
        setResult('DON\'T SELL!');
      } else if (total >= 18 && total <= 20) {
        setResult('RISKY!');
      } else {
        setResult('SELL!');
      }
    } else {
      setResult('');
    }
  }, [grade1, grade2, grade3]);

  const resetGrades = () => {
    setGrade1(null);
    setGrade2(null);
    setGrade3(null);
    setResult('');
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'SELL!':
        return 'text-green-600';
      case 'RISKY!':
        return 'text-yellow-600';
      case 'DON\'T SELL!':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: grade1, setter: setGrade1 },
          { value: grade2, setter: setGrade2 },
          { value: grade3, setter: setGrade3 },
        ].map((grade, index) => (
          <Select
            key={index}
            value={grade.value?.toString() || ''}
            onValueChange={(value) => grade.setter(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Grade ${index + 1}`} />
            </SelectTrigger>
            <SelectContent>
              {grades.map((g) => (
                <SelectItem key={g.label} value={g.value.toString()}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <Button onClick={resetGrades} variant="outline" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Grades
        </Button>
        {result && (
          <Card>
            <CardContent className="pt-6">
              <p className={`text-center text-2xl font-bold ${getResultColor(result)}`}>
                {result}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecruitingCalculator;