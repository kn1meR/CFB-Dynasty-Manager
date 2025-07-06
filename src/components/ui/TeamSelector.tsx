// src/components/ui/TeamSelector.tsx
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamLogo, ConferenceLogo } from './TeamLogo';
import { getTeamWithLogo } from '@/utils/logoUtils';
import { fbsTeams } from '@/utils/fbsTeams';
import { CustomTeamManager } from '@/utils/customTeamManager';

interface TeamSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeCustomTeams?: boolean;
  className?: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select a team",
  includeCustomTeams = true,
  className = ''
}) => {
  const availableTeams = includeCustomTeams 
    ? CustomTeamManager.getAllAvailableTeams()
    : fbsTeams;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <TeamLogo teamName={value} size="sm" />
              <span>{value}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {availableTeams.map(team => {
          const isCustom = CustomTeamManager.isCustomTeam(team.name);
          return (
            <SelectItem key={team.name} value={team.name}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <TeamLogo teamName={team.name} size="sm" />
                  <span>{team.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ConferenceLogo conference={team.conference} size="xs" />
                  <span className="text-sm text-gray-500">
                    ({team.conference}) {isCustom && '🎨'}
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};