'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { DataManager } from '@/utils/data-manager';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DataControls = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = () => {
    try {
      DataManager.downloadBackup();
      toast.success('Backup downloaded successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to download backup');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      await DataManager.loadBackup(selectedFile);
      toast.success('Data imported successfully');
      setImportDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    }
  };

  return (
    <div className="flex gap-4">
      <Button 
        onClick={handleExport}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Download className="h-4 w-4 "  />
        Export Data
      </Button>

      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Import Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all existing data. Make sure to backup your current data first.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataControls;
