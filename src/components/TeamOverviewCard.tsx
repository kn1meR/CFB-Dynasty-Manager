import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { positions, offensePositions, defensivePositions, specialTeamsPositions } from '@/types/playerTypes';
import { Player } from '@/types/playerTypes';

interface TeamOverviewCardProps {
  players: Player[];
}

const getHighestRatedPlayers = (players: Player[], limits: Record<string, number>): Player[] => {
  const positionMap = new Map<string, Player[]>();

  players.forEach(player => {
    if (!positionMap.has(player.position)) {
      positionMap.set(player.position, []);
    }
    positionMap.get(player.position)?.push(player);
  });

  positionMap.forEach((playerList, position) => {
    playerList.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
    positionMap.set(position, playerList.slice(0, limits[position] || 1));
  });

  return Array.from(positionMap.values()).flat();
};

const calculateOverall = (players: Player[], positionSet: string[]): number => {
  if (!players || players.length === 0) return 0;

  const limits = {
    QB: 1, RB: 1, FB: 1, WR: 3, TE: 1, LT: 1, LG: 1, C: 1, RG: 1, RT: 1,
    LE: 1, RE: 1, DT: 2, LOLB: 1, MLB: 2, ROLB: 1, CB: 3, FS: 1, SS: 1,
    K: 1, P: 1
  };

  const filteredPlayers = players.filter(player => positionSet.includes(player.position));
  const highestRatedPlayers = getHighestRatedPlayers(filteredPlayers, limits);
  if (highestRatedPlayers.length === 0) return 0;

  const sum = highestRatedPlayers.reduce((acc, player) => acc + parseInt(player.rating), 0);
  return Math.round(sum / highestRatedPlayers.length);
};

const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ players }) => {
  const teamOverall = calculateOverall(players, positions);
  const offenseOverall = calculateOverall(players, offensePositions);
  const defenseOverall = calculateOverall(players, defensivePositions);
  const specialTeamsOverall = calculateOverall(players, specialTeamsPositions);

  return (
    <Card className="mb-6">
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
