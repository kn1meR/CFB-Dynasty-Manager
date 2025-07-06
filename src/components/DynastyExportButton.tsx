// src/components/DynastyExportButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DynastyExporter } from '@/utils/dynasty-export';
import { toast } from 'react-hot-toast';

const DynastyExportButton = () => {
  const handleExport = () => {
    try {
      DynastyExporter.downloadDynastyBackup();
      toast.success('Dynasty exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dynasty');
    }
  };

  return (
    <Button onClick={handleExport} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Export Dynasty
    </Button>
  );
};

export default DynastyExportButton;