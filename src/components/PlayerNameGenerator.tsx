import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const PlayerNameGenerator: React.FC = () => {
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [lastNames, setLastNames] = useState<string[]>([]);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [numNames, setNumNames] = useState(1);
  const MAX_NAMES = 5;

  useEffect(() => {
    const loadNames = async () => {
      try {
        const firstNamesResponse = await fetch('/firstnames.txt');
        const lastNamesResponse = await fetch('/lastnames.txt');
        
        const firstNamesText = await firstNamesResponse.text();
        const lastNamesText = await lastNamesResponse.text();

        setFirstNames(firstNamesText.split('\n').filter(name => name.trim() !== '').map(toProperCase));
        setLastNames(lastNamesText.split('\n').filter(name => name.trim() !== '').map(toProperCase));
      } catch (error) {
        console.error('Error loading names:', error);
      }
    };

    loadNames();
  }, []);

  const toProperCase = (name: string): string => {
    return name.toLowerCase().replace(/(?:^|\s|[''-])\S/g, match => match.toUpperCase());
  };

  const generateNames = () => {
    if (numNames > MAX_NAMES) {
      toast.error(`Maximum ${MAX_NAMES} names can be generated at once`);
      setNumNames(MAX_NAMES);
      return;
    }

    const newNames = Array.from({ length: numNames }, () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return `${firstName} ${lastName}`;
    });
    setGeneratedNames(newNames);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center space-y-4">
          <div className="flex items-center space-x-4 w-full">
            <Label htmlFor="numNames">Number of names (max {MAX_NAMES}):</Label>
            <Input
              id="numNames"
              type="number"
              value={numNames}
              onChange={(e) => setNumNames(Math.min(MAX_NAMES, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20"
              min={1}
              max={MAX_NAMES}
            />
            <Button onClick={generateNames} className="bg-blue-600 hover:bg-blue-700 ">Generate Names</Button>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          {generatedNames.map((name, index) => (
            <div key={index} className="p-2 bg-secondary rounded">
              {name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerNameGenerator;
