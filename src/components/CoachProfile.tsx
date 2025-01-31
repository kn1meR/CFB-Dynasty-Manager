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
      
      // Reopen dialog after a brief delay
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
        className="flex items-center space-x-2"
        onClick={() => setIsEditing(true)}
      >
        <User size={18} />
        <span className={profile.coachName ? "" : "text-gray-400"}>
          {profile.coachName || 'Coach Name'}
        </span>
        <School size={18} />
        <span className={profile.schoolName ? "" : "text-gray-400"}>
          {profile.schoolName || 'School'}
        </span>
        <Calendar size={18} />
        <span>{profile.currentYear}</span>
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coachName" className="text-right">
                Coach Name
              </Label>
              <Input
                id="coachName"
                value={profile.coachName}
                onChange={(e) => setProfile({ ...profile, coachName: e.target.value })}
                placeholder="Coach Name"
                className="col-span-3"
                autoComplete="off"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schoolName" className="text-right">
                School
              </Label>
              <Select
                value={profile.schoolName}
                onValueChange={(value) => setProfile({ ...profile, schoolName: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent>
                  {fbsTeams.map(team => (
                    <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentYear" className="text-right">
                Current Year
              </Label>
              <Input
                id="currentYear"
                type="number"
                value={profile.currentYear}
                onChange={(e) => setProfile({ ...profile, currentYear: parseInt(e.target.value, 10) })}
                className="col-span-3"
                min={2024}
                max={2054}
              />
            </div>
          </div>
          <DialogFooter>
            <AlertDialog open={isConfirmingReset} onOpenChange={setIsConfirmingReset}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Reset Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all application data and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsConfirmingReset(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachProfile;