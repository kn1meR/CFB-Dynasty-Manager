// src/components/ClickablePlayerName.tsx
import React from 'react';
import { Player } from '@/types/playerTypes';

interface ClickablePlayerNameProps {
  player: Player;
  onPlayerClick: (player: Player) => void;
  className?: string;
}

const ClickablePlayerName: React.FC<ClickablePlayerNameProps> = ({ 
  player, 
  onPlayerClick, 
  className = "" 
}) => {
  return (
    <button
      onClick={() => onPlayerClick(player)}
      className={`text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer ${className}`}
      type="button"
    >
      {player.name}
    </button>
  );
};

export default ClickablePlayerName;