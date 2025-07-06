// Enhanced src/components/CoachProfile.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, School, Calendar, Palette } from 'lucide-react';
import { fbsTeams } from '@/utils/fbsTeams';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { useDynasty } from '@/contexts/DynastyContext';
import { getCoachProfile, setCoachProfile, getCurrentYear, setCurrentYear } from '@/utils/localStorage';
import { CoachProfile as CoachProfileType } from '@/types/coachProfile';

const defaultProfileData: CoachProfileType = {
  coachName: '',
  schoolName: '',
  schoolColors: { primary: '#3B82F6', secondary: '#EF4444', accent: '#10B981' }
};

const defaultYear = 2025;

const CoachProfile = () => {
  const { currentDynastyId, saveDynastyData } = useDynasty();
  const [profile, setProfile] = useState<CoachProfileType>(defaultProfileData);
  const [displayYear, setDisplayYear] = useState<number>(defaultYear);
  const [isEditing, setIsEditing] = useState(false);
  const [schoolColorPresets, setSchoolColorPresets] = useState<Record<string, { primary: string; secondary: string; accent: string }>>({});

  useEffect(() => {
    const loadSchoolColors = async () => {
      try {
        const response = await fetch('/fbsColors.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const csvContent = await response.text();
        const parsed = Papa.parse(csvContent, { header: true, dynamicTyping: true, skipEmptyLines: true, delimitersToGuess: [','] });
        const presets: Record<string, any> = {};
        parsed.data.forEach((row: any) => {
          if (row.Team && row['Color 1'] && row['Color 2']) {
            presets[row.Team] = { primary: row['Color 1'], secondary: row['Color 2'], accent: row['Color 3'] || row['Color 1'] };
          }
        });
        setSchoolColorPresets(presets);
      } catch (error) {
        console.error('Error loading school colors:', error);
      }
    };
    loadSchoolColors();
  }, []);

  const applyThemeColors = (colors?: CoachProfileType['schoolColors']) => {
    if (!colors) return;
    const root = document.documentElement;
    const adjust = (c: string, a: number) => {
      const p = c[0] === '#', s = p ? c.slice(1) : c; const n = parseInt(s, 16);
      let r = (n >> 16) + a; r = r > 255 ? 255 : r < 0 ? 0 : r;
      let g = (n >> 8 & 0x00FF) + a; g = g > 255 ? 255 : g < 0 ? 0 : g;
      let b = (n & 0x0000FF) + a; b = b > 255 ? 255 : b < 0 ? 0 : b;
      return (p ? '#' : '') + ("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
    };
    root.style.setProperty('--school-primary', colors.primary);
    root.style.setProperty('--school-secondary', colors.secondary);
    root.style.setProperty('--school-accent', colors.accent);
    root.style.setProperty('--school-primary-hover', adjust(colors.primary, -20));
    root.style.setProperty('--school-primary-light', adjust(colors.primary, 40));
    root.style.setProperty('--school-secondary-light', adjust(colors.secondary, 40));
  };

  useEffect(() => {
    if (!currentDynastyId) return;
    const loadData = () => {
      try {
        const storedProfile = getCoachProfile();
        const storedYear = getCurrentYear();
        const loadedProfile = storedProfile || defaultProfileData;
        setProfile(loadedProfile);
        setDisplayYear(storedYear);
        applyThemeColors(loadedProfile.schoolColors);
      } catch (error) { console.error('Error loading profile/year:', error); }
    };
    loadData();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'currentYear' || event.key === 'dynastyLoaded') loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentDynastyId]);

  const handleSave = () => {
    try {
      setCoachProfile(profile);
      setCurrentYear(displayYear);
      applyThemeColors(profile.schoolColors);
      saveDynastyData();
      setIsEditing(false);
      notifySuccess(MESSAGES.SAVE_SUCCESS);
      window.dispatchEvent(new StorageEvent('storage', { key: 'currentYear' }));
    } catch (error) {
      console.error('Error saving profile/year:', error);
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const handleSchoolChange = (schoolName: string) => {
    const presetColors = schoolColorPresets[schoolName];
    setProfile(prev => ({
      ...prev,
      schoolName,
      schoolColors: presetColors || prev.schoolColors
    }));
  };

  // MODIFICATION: This function is now type-safe.
  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    setProfile(prev => {
        // Start with the default colors to ensure all keys are present.
        const newColors = { ...defaultProfileData.schoolColors! };
        
        // If previous colors exist, use them as a base.
        if (prev.schoolColors) {
            Object.assign(newColors, prev.schoolColors);
        }
        
        // Apply the specific change.
        newColors[colorType] = value;
        
        return { ...prev, schoolColors: newColors };
    });
  };

  const ColorPreview = ({ color, size = 'w-6 h-6' }: { color: string; size?: string }) => (
    <div className={`${size} rounded border-2 border-gray-300 dark:border-gray-600`} style={{ backgroundColor: color }} />
  );

  return (
    <>
      <Button variant="ghost" className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 px-2 h-auto" onClick={() => setIsEditing(true)}
        style={{ borderLeft: profile.schoolColors?.primary ? `4px solid ${profile.schoolColors.primary}` : undefined }}>
        <div className="flex items-center space-x-1"><User className="h-4 w-4" /><span className="text-sm font-medium">{profile.coachName || 'Coach'}</span></div>
        <div className="flex items-center space-x-1"><School className="h-4 w-4" /><span className="text-sm font-medium">{profile.schoolName || 'School'}</span></div>
        <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span className="text-sm font-medium">{displayYear}</span></div>
        {profile.schoolColors && <div className="flex items-center space-x-1"><ColorPreview color={profile.schoolColors.primary} size="w-4 h-4" /><ColorPreview color={profile.schoolColors.secondary} size="w-4 h-4" /></div>}
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Edit Profile & School Colors</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coachName" className="text-right">Coach Name</Label>
              <Input id="coachName" value={profile.coachName} onChange={e => setProfile(p => ({...p, coachName: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schoolName" className="text-right">School</Label>
              <Select value={profile.schoolName} onValueChange={handleSchoolChange}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>{fbsTeams.map(team => <SelectItem key={team.name} value={team.name}>{team.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentYear" className="text-right">Current Year</Label>
              <Input id="currentYear" type="number" value={displayYear} onChange={e => setDisplayYear(parseInt(e.target.value) || defaultYear)} className="col-span-3"/>
            </div>
            <div className="border-t pt-4">
              <Label className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette className="h-4 w-4" />School Colors</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary</Label>
                  <div className="flex items-center gap-2">
                    <input id="primaryColor" type="color" value={profile.schoolColors?.primary} onChange={e => handleColorChange('primary', e.target.value)} className="w-12 h-10 rounded border" />
                    <Input value={profile.schoolColors?.primary} onChange={e => handleColorChange('primary', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary</Label>
                   <div className="flex items-center gap-2">
                    <input id="secondaryColor" type="color" value={profile.schoolColors?.secondary} onChange={e => handleColorChange('secondary', e.target.value)} className="w-12 h-10 rounded border" />
                    <Input value={profile.schoolColors?.secondary} onChange={e => handleColorChange('secondary', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent</Label>
                  <div className="flex items-center gap-2">
                    <input id="accentColor" type="color" value={profile.schoolColors?.accent} onChange={e => handleColorChange('accent', e.target.value)} className="w-12 h-10 rounded border" />
                    <Input value={profile.schoolColors?.accent} onChange={e => handleColorChange('accent', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSave} style={{ backgroundColor: profile.schoolColors?.primary, color: 'white' }}>Save Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachProfile;