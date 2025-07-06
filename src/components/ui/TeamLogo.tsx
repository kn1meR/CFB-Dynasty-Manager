// src/components/ui/TeamLogo.tsx
import React, { useState } from 'react';
import { getTeamLogoPaths, getConferenceLogoPath } from '@/utils/logoUtils';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  teamName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showFallback?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-24 h-24'
};

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  size = 'md',
  showFallback = true,
  className = '',
  onClick
}) => {
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [error, setError] = useState(false);

  // Get all possible logo paths for the team
  const possiblePaths = getTeamLogoPaths(teamName);
  const logoSrc = possiblePaths[currentPathIndex];

  const handleImageError = () => {
    // If there are more paths to try, increment the index
    if (currentPathIndex < possiblePaths.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    } else {
      // All paths have failed, set the error state
      setError(true);
    }
  };

  // If we've exhausted all paths and have an error
  if (error) {
    if (!showFallback) {
      return null;
    }
    // Fallback to team initials
    const initials = teamName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
    return (
      <div
        className={cn(
          sizeClasses[size],
          'bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        title={teamName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${teamName} logo`}
      className={cn(
        sizeClasses[size],
        'object-contain rounded',
        onClick && 'cursor-pointer',
        className
      )}
      onError={handleImageError}
      onClick={onClick}
      title={teamName}
      loading="lazy"
    />
  );
};

// --- ConferenceLogo component remains the same ---
interface ConferenceLogoProps {
  conference: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showFallback?: boolean;
  className?: string;
}

export const ConferenceLogo: React.FC<ConferenceLogoProps> = ({
  conference,
  size = 'sm',
  showFallback = true,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const logoPath = getConferenceLogoPath(conference);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError && !showFallback) {
    return null;
  }

  if (imageError && showFallback) {
    return (
      <span className={cn('text-xs font-medium text-gray-600 dark:text-gray-400', className)}>
        {conference}
      </span>
    );
  }

  return (
    <img
      src={logoPath}
      alt={`${conference} logo`}
      className={cn(sizeClasses[size], 'object-contain', className)}
      onError={handleImageError}
      title={conference}
      loading="lazy"
    />
  );
};