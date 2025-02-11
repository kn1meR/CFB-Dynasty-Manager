import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { offensePositions, defensivePositions, specialTeamsPositions } from '@/types/playerTypes';
import { Player } from '@/types/playerTypes';

interface TeamOverviewCardProps {
  players: Player[];
}

const calculateOverall = (players: Player[], type: 'all' | 'offense' | 'defense' | 'special'): number => {
  if (!players || players.length === 0) return 0;

  let relevantPlayers;
  switch (type) {
    case 'offense':
      relevantPlayers = players.filter(p => offensePositions.includes(p.position));
      break;
    case 'defense':
      relevantPlayers = players.filter(p => defensivePositions.includes(p.position));
      break;
    case 'special':
      relevantPlayers = players.filter(p => specialTeamsPositions.includes(p.position));
      break;
    default:
      relevantPlayers = players;
  }

  if (relevantPlayers.length === 0) return 0;

  const sum = relevantPlayers.reduce((acc, player) => {
    const rating = parseInt(player.rating);
    return isNaN(rating) ? acc : acc + rating;
  }, 0);
  
  return Math.round(sum / relevantPlayers.length);
};

const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ players }) => {
  const teamOverall = calculateOverall(players, 'all');
  const offenseOverall = calculateOverall(players, 'offense');
  const defenseOverall = calculateOverall(players, 'defense');
  const specialTeamsOverall = calculateOverall(players, 'special');

  return (
    <Card className="mb-6">
      <CardContent className="py-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Team Overall</div>
            <div className="text-3xl font-bold">
              {teamOverall}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Offense</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {offenseOverall}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Defense</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {defenseOverall}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Special Teams</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {specialTeamsOverall}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamOverviewCard;