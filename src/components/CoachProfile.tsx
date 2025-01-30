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

const CoachProfile = () => {
  const [profile, setProfile] = useState({ coachName: '', schoolName: '', currentYear: 2024 });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedProfile = {
      coachName: localStorage.getItem('coachName') || '',
      schoolName: localStorage.getItem('schoolName') || '',
      currentYear: parseInt(localStorage.getItem('currentYear') || '2024', 10)
    };
    setProfile(storedProfile);
  }, []);

  const handleSave = () => {
    Object.entries(profile).forEach(([key, value]) => localStorage.setItem(key, value.toString()));
    setIsEditing(false);
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.clear();
      setProfile({ coachName: '', schoolName: '', currentYear: 2024 });
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleReset}>Reset Data</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachProfile;