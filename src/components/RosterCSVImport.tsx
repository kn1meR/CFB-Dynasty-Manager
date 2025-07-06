import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';

interface RosterCSVImportProps {
  onImportComplete: (players: any[]) => void;
}

const RosterCSVImport: React.FC<RosterCSVImportProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateCsvData = (data: any[]) => {
    const requiredColumns = ['Jersey #', 'Name', 'Position', 'Year', 'Rating', 'Development Trait', 'Notes'];
    const headers = Object.keys(data[0] || {});
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    return data.map(row => ({
      jerseyNumber: row['Jersey #']?.toString() || '',
      name: row['Name'] || '',
      position: row['Position'] || '',
      year: row['Year'] || '',
      rating: row['Rating']?.toString() || '',
      devTrait: row['Development Trait'] || 'Normal',
      notes: row['Notes'] || ''
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const validatedData = validateCsvData(results.data);
          const playersToImport = validatedData.map(player => ({
            ...player,
            id: Date.now() + Math.random()
          }));
          
          onImportComplete(playersToImport);
          toast.success('Roster imported successfully');
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Invalid CSV format');
        }
      },
      error: (error) => {
        toast.error('Error parsing CSV file');
        console.error('CSV Parse Error:', error);
      }
    });
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Roster
      </button>
    </div>
  );
};

export default RosterCSVImport;