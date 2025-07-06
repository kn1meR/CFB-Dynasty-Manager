"use client";

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
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

const resetLocalStorage = () => {
  // Get the current year
  const currentYear = new Date().getFullYear();

  // Clear all items from localStorage
  localStorage.clear();

  // Reset to default values
  localStorage.setItem('currentYear', JSON.stringify(currentYear));
  localStorage.setItem('coachName', JSON.stringify(''));
  localStorage.setItem('schoolName', JSON.stringify(''));

  // Initialize an empty schedule for the current year
  const emptySchedule = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    week: i,
    opponent: '',
    result: 'N/A',
    score: ''
  }));
  localStorage.setItem(`schedule_${currentYear}`, JSON.stringify(emptySchedule));

  // Force a page reload to reflect the changes
  window.location.reload();
};

const ResetStorageButton: React.FC = memo(() => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">Reset Application Data</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will reset all application data, including schedules, results, and scores. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={resetLocalStorage}>Reset Data</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ResetStorageButton.displayName = 'ResetStorageButton';

export default ResetStorageButton;