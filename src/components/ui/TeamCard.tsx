// src/components/ui/TeamCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TeamLogo, ConferenceLogo } from './TeamLogo';
import { getTeamWithLogo } from '@/utils/logoUtils';

interface TeamCardProps {
  teamName: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  showConference?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  children,
  className = '',
  onClick,
  showConference = true
}) => {
  const team = getTeamWithLogo(teamName);

  return (
    <Card className={`${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <TeamLogo teamName={teamName} size="lg" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{team.name}</h3>
            {team.nickName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{team.nickName}</p>
            )}
            {showConference && team.conference && (
              <div className="flex items-center gap-1 mt-1">
                <ConferenceLogo conference={team.conference} size="xs" />
                <span className="text-xs text-gray-500">{team.conference}</span>
              </div>
            )}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
