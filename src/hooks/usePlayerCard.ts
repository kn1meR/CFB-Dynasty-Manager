// src/hooks/usePlayerCard.ts
import { useState } from 'react';

// Extended Player interface to match what PlayerCard expects
interface ExtendedPlayer {
  id: number;
  name: string;
  position: string;
  year: string;
  rating: string;
  jerseyNumber: string;
  devTrait?: 'Normal' | 'Impact' | 'Star' | 'Elite';
  notes?: string;
  isRedshirted?: boolean;
}

export const usePlayerCard = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<ExtendedPlayer | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPlayerCard = (player: ExtendedPlayer) => {
    setSelectedPlayer(player);
    setIsOpen(true);
  };

  const closePlayerCard = () => {
    setIsOpen(false);
    setSelectedPlayer(null);
  };

  return {
    selectedPlayer,
    isOpen,
    openPlayerCard,
    closePlayerCard,
  };
};