// Updated src/components/TeamOverviewCard.tsx with simplified calculation (no position limits)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamLogo, ConferenceLogo } from '@/components/ui/TeamLogo';
import { getTeamWithLogo } from '@/utils/logoUtils';
import { offensePositions, defensivePositions, specialTeamsPositions } from '@/types/playerTypes';
import { Player } from '@/types/playerTypes';

interface TeamOverviewCardProps {
  players: Player[];
  teamName?: string;
}

const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ players, teamName }) => {
  const team = teamName ? getTeamWithLogo(teamName) : null;

  // Filter players by position categories
  const offensePlayers = players.filter(p => offensePositions.includes(p.position));
  const defensePlayers = players.filter(p => defensivePositions.includes(p.position));
  const specialTeamsPlayers = players.filter(p => specialTeamsPositions.includes(p.position));

  // NEW: Updated calculation function with formula 1.28*x-11.1
  const calculateOverall = (positionPlayers: Player[]) => {
    if (positionPlayers.length === 0) return 0;

    // Calculate the average of ALL players in this category
    const total = positionPlayers.reduce((sum, player) => sum + (parseInt(player.rating) || 0), 0);
    const average = total / positionPlayers.length;

    // Apply the new formula: 1.28*x-11.1 (where x = average)
    const calculatedRating = (1.28 * average) - 11.1;

    // Round to nearest whole number and ensure it's not negative
    return Math.max(0, Math.round(calculatedRating));
  };

  // Calculate ratings using the new formula for each category
  const offenseOverall = calculateOverall(offensePlayers);
  const defenseOverall = calculateOverall(defensePlayers);
  const specialTeamsOverall = calculateOverall(specialTeamsPlayers);

  // Team overall uses ALL players on the roster
  const teamOverall = calculateOverall(players);

  return (
    <Card>
      <CardContent className="py-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Team Overall</div>
            <div className="text-3xl font-bold">{teamOverall}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Offense</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{offenseOverall}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Defense</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{defenseOverall}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Special Teams</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{specialTeamsOverall}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamOverviewCard;
