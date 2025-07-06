// src/hooks/useSchoolColors.ts
// Hook to access school colors in components

import { useState, useEffect } from 'react';
import { getCoachProfile } from '@/utils/localStorage';

export interface SchoolColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const useSchoolColors = (): SchoolColors => {
  const [colors, setColors] = useState<SchoolColors>({
    primary: '#3B82F6',
    secondary: '#EF4444', 
    accent: '#10B981'
  });

  useEffect(() => {
    const profile = getCoachProfile();
    if (profile?.schoolColors) {
      setColors(profile.schoolColors);
    }
  }, []);

  return colors;
};