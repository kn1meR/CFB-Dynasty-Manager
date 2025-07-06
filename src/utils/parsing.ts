// src/utils/parsing.ts
import { Player } from '@/types';  // Add this import

export function parsePlayerData(text: string): Omit<Player, 'id'>[] {
  const columns = text.split('\n').map(column => column.split('\n'));
  const players: Omit<Player, 'id'>[] = [];

  for (let i = 0; i < columns[0].length; i++) {
    const name = correctName(columns[0][i]);
    const position = correctPosition(columns[1][i]);
    const year = correctYear(columns[2][i]);
    const rating = correctRating(columns[3][i]);

    if (name && position && year && rating) {
      players.push({ name, position, year, rating });
    }
  }

  return players;
}

function correctName(name: string): string {
  return name.replace(/[^a-zA-Z\.\s]/g, '').trim();
}

function correctPosition(position: string): string {
  const validPositions = ['QB', 'HB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  return validPositions.find(pos => position.toUpperCase().includes(pos)) || position;
}

function correctYear(year: string): string {
  const validYears = ['FR', 'SO', 'JR', 'SR'];
  const corrected = validYears.find(y => year.toUpperCase().includes(y)) || year;
  return year.toUpperCase().includes('RS') ? `${corrected} (RS)` : corrected;
}

function correctRating(rating: string): string {
  const num = parseInt(rating.replace(/\D/g, ''));
  return num >= 40 && num <= 99 ? num.toString() : rating;
}