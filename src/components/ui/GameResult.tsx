// src/components/ui/GameResult.tsx
import React from 'react';
import { TeamLogo } from './TeamLogo';

interface GameResultProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  result?: 'Win' | 'Loss' | 'Tie';
  isHomeGame?: boolean;
  week?: number;
  className?: string;
}

export const GameResult: React.FC<GameResultProps> = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  result,
  isHomeGame = true,
  week,
  className = ''
}) => {
  const userTeam = isHomeGame ? homeTeam : awayTeam;
  const opponent = isHomeGame ? awayTeam : homeTeam;
  const userScore = isHomeGame ? homeScore : awayScore;
  const oppScore = isHomeGame ? awayScore : homeScore;

  const getResultColor = () => {
    switch (result) {
      case 'Win': return 'text-green-600 dark:text-green-400';
      case 'Loss': return 'text-red-600 dark:text-red-400';
      case 'Tie': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${className}`}>
      {week && (
        <div className="text-sm font-medium text-gray-500 w-12">
          Week {week}
        </div>
      )}
      
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          <TeamLogo teamName={userTeam} size="sm" />
          <span className="font-medium">{userTeam}</span>
        </div>
        
        <span className="text-gray-400">vs</span>
        
        <div className="flex items-center gap-2">
          <TeamLogo teamName={opponent} size="sm" />
          <span>{opponent}</span>
        </div>
      </div>

      {(userScore !== undefined && oppScore !== undefined) && (
        <div className={`font-bold ${getResultColor()}`}>
          {userScore} - {oppScore}
        </div>
      )}
      
      {result && (
        <div className={`ml-3 px-2 py-1 rounded text-sm font-medium ${getResultColor()}`}>
          {result}
        </div>
      )}
    </div>
  );
};