"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, School, Calendar } from 'lucide-react';
import { fbsTeams } from '@/utils/fbsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
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

const CoachProfile = () => {
  const defaultProfile = {
    coachName: '',
    schoolName: '',
    currentYear: 2024
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = {
        coachName: localStorage.getItem('coachName') || '',
        schoolName: localStorage.getItem('schoolName') || '',
        currentYear: parseInt(localStorage.getItem('currentYear') || '2024', 10)
      };
      setProfile(storedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      notifyError('Failed to load profile data');
    }
  }, []);

  const handleSave = () => {
    try {
      Object.entries(profile).forEach(([key, value]) => 
        localStorage.setItem(key, value.toString())
      );
      setIsEditing(false);
      notifySuccess(MESSAGES.SAVE_SUCCESS);
    } catch (error) {
      console.error('Error saving profile:', error);
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const handleReset = () => {
    try {
      localStorage.clear();
      setProfile(defaultProfile);
      setIsConfirmingReset(false);
      setIsEditing(false);
      
      setTimeout(() => {
        setIsEditing(true);
      }, 100);
      
      notifySuccess('Data reset successfully');
    } catch (error) {
      console.error('Error resetting data:', error);
      notifyError('Failed to reset data');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => setIsEditing(true)}
      >
        <User className="h-4 w-5 text-primary dark:text-gray-400" />
        <span className={`text-base font-medium ${profile.coachName ? "text-primary dark:text-gray-200" : "text-muted-foreground"}`}>
          {profile.coachName || 'Coach Name'}
        </span>
        <School className="h-4 w-5 text-primary dark:text-gray-400" />
        <span className={`text-base font-medium ${profile.schoolName ? "text-primary dark:text-gray-200" : "text-muted-foreground"}`}>
          {profile.schoolName || 'School'}
        </span>
        <Calendar className="h-4 w-5 text-primary dark:text-gray-400" />
        <span className="text-base font-medium text-primary dark:text-gray-200">
          {profile.currentYear}
        </span>
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold dark:text-gray-100">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coachName" className="text-right dark:text-gray-300">
                Coach Name
              </Label>
              <Input
                id="coachName"
                value={profile.coachName}
                onChange={(e) => setProfile({ ...profile, coachName: e.target.value })}
                placeholder="Coach Name"
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 select-none"
                autoComplete="off"
                autoFocus={false}
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schoolName" className="text-right dark:text-gray-300">
                School
              </Label>
              <Select
                value={profile.schoolName}
                onValueChange={(value) => setProfile({ ...profile, schoolName: value })}
              >
                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {fbsTeams.map(team => (
                    <SelectItem 
                      key={team.name} 
                      value={team.name}
                      className="dark:text-gray-100 dark:focus:bg-gray-700"
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentYear" className="text-right dark:text-gray-300">
                Current Year
              </Label>
              <Input
                id="currentYear"
                type="number"
                value={profile.currentYear}
                onChange={(e) => setProfile({ ...profile, currentYear: parseInt(e.target.value, 10) })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                min={2024}
                max={2054}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <AlertDialog open={isConfirmingReset} onOpenChange={setIsConfirmingReset}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  Reset Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="dark:text-gray-100">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-gray-300">
                    This will reset all application data and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel 
                    className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setIsConfirmingReset(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                    onClick={handleReset}
                  >
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              onClick={handleSave}
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachProfile;
