import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const positions = [
  { label: 'QB', value: 'QB', modifier: 2.42, stdError: 0.61 },
  { label: 'HB', value: 'HB', modifier: 1.29, stdError: 0.57 },
  { label: 'FB', value: 'FB', modifier: 2.60, stdError: 1.44 },
  { label: 'WR', value: 'WR', modifier: 0.18, stdError: 0.57 },
  { label: 'TE', value: 'TE', modifier: 0.88, stdError: 0.64 },
  { label: 'OT', value: 'OT', modifier: 2.01, stdError: 0.58 },
  { label: 'OG', value: 'OG', modifier: 2.07, stdError: 0.60 },
  { label: 'C', value: 'C', modifier: 0, stdError: 0.70 },
  { label: 'DE', value: 'DE', modifier: 2.07, stdError: 0.56 },
  { label: 'DT', value: 'DT', modifier: 1.95, stdError: 0.62 },
  { label: 'OLB', value: 'OLB', modifier: 2.12, stdError: 0.58 },
  { label: 'MLB', value: 'MLB', modifier: 1.54, stdError: 0.65 },
  { label: 'CB', value: 'CB', modifier: 2.74, stdError: 0.58 },
  { label: 'FS', value: 'FS', modifier: 1.92, stdError: 0.62 },
  { label: 'SS', value: 'SS', modifier: 2.10, stdError: 0.66 },
  { label: 'K', value: 'K', modifier: 2.23, stdError: 1.22 },
  { label: 'P', value: 'P', modifier: 3.23, stdError: 1.22 }
];

const stars = [
  { label: '5 ⭐', value: 25.44 },
  { label: '4 ⭐', value: 22.14 },
  { label: '3 ⭐', value: 14.38 },
  { label: '2 ⭐', value: 6.98 },
  { label: '1 ⭐', value: 0 }
];

const RecruitPredictor = () => {
  const [position, setPosition] = useState('');
  const [starRating, setStarRating] = useState<string>('');
  const [result, setResult] = useState<{predicted: number, low: number, high: number} | null>(null);

  const calculatePrediction = () => {
    if (!position || !starRating) return;
    
    const pos = positions.find(p => p.value === position);
    const star = stars.find(s => s.value.toString() === starRating);
    
    if (!pos || !star) return;

    // Formula: 50 + (position_modifier + star_value)
    const predicted = Math.round(((50 + (pos.modifier + star.value)) + Number.EPSILON) * 100) / 100;
    
    // Use position-specific standard error and multiply by 2.2 for 95% confidence interval
    const errorMargin = pos.stdError * 2.2;
    
    setResult({
      predicted,
      low: Math.round((predicted - errorMargin) * 100) / 100,
      high: Math.round((predicted + errorMargin) * 100) / 100
    });
  };

  const reset = () => {
    setPosition('');
    setStarRating('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger>
            <SelectValue placeholder="Select Position" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((pos) => (
              <SelectItem key={pos.value} value={pos.value}>
                {pos.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={starRating}
          onValueChange={setStarRating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Star Rating" />
          </SelectTrigger>
          <SelectContent>
            {stars.map((star) => (
              <SelectItem key={star.value} value={star.value.toString()}>
                {star.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={calculatePrediction} className="bg-blue-600 hover:bg-blue-700">
          Calculate
        </Button>
        <Button onClick={reset} variant="outline" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-center text-2xl font-bold text-blue-600">
              Predicted OVR: {result.predicted}
            </p>
            <p className="text-center text-lg text-gray-600">
              Range: {result.low} - {result.high}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecruitPredictor;
