// src/components/PlayerNameGenerator.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PlayerNameGenerator: React.FC = () => {
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [lastNames, setLastNames] = useState<string[]>([]);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);
  const [numNames, setNumNames] = useState(1);

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
            <Label htmlFor="numNames">Number of names:</Label>
            <Input
              id="numNames"
              type="number"
              value={numNames}
              onChange={(e) => setNumNames(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20"
            />
            <Button onClick={generateNames}>Generate Names</Button>
          </div>
          <div className="space-y-2">
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