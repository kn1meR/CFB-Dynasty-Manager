// src/components/DataControls.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DynastyExporter } from '@/utils/dynasty-export';
import { toast } from 'react-hot-toast';

const DataControls = () => {
  const handleExport = () => {
    try {
      DynastyExporter.downloadDynastyBackup();
      toast.success('Current dynasty exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export dynasty');
    }
  };

  return (
    <div className="flex gap-4">
      <Button 
        onClick={handleExport}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        Export Current Dynasty
      </Button>
      {/* The dangerous import button has been removed from this component */}
    </div>
  );
};

export default DataControls;
