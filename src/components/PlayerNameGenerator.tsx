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
        toast.error('Failed to load name files. Make sure firstnames.txt and lastnames.txt are in the public folder.');
      }
    };

    loadNames();
  }, []);

  // Fixed the regex pattern - this was causing the parsing error
  const toProperCase = (name: string): string => {
    return name.toLowerCase().replace(/(^|\s|[''-])\S/g, match => match.toUpperCase());
  };

  const generateNames = () => {
    if (numNames > MAX_NAMES) {
      toast.error(`Maximum ${MAX_NAMES} names can be generated at once`);
      setNumNames(MAX_NAMES);
      return;
    }

    if (firstNames.length === 0 || lastNames.length === 0) {
      toast.error('Name lists not loaded yet. Please wait a moment and try again.');
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
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label htmlFor="numNames" className="whitespace-nowrap">
            Number of names (max {MAX_NAMES}):
          </Label>
          <Input
            id="numNames"
            type="number"
            value={numNames}
            onChange={(e) => setNumNames(Math.min(MAX_NAMES, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20"
            min={1}
            max={MAX_NAMES}
          />
        </div>
        <Button 
          onClick={generateNames} 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={firstNames.length === 0 || lastNames.length === 0}
        >
          Generate Names
        </Button>
      </div>

      {generatedNames.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Generated Names:</h3>
          {generatedNames.map((name, index) => (
            <div key={index} className="p-2 bg-secondary rounded">
              {name}
            </div>
          ))}
        </div>
      )}
      
      {firstNames.length === 0 && lastNames.length === 0 && (
        <div className="text-sm text-gray-500">
          Loading name lists... Make sure firstnames.txt and lastnames.txt are in your public folder.
        </div>
      )}
    </div>
  );
};

export default PlayerNameGenerator;