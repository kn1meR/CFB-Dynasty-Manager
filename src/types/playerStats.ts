// src/types/playerStats.ts

export type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Defense' | 'Kicking' | 'Punting' | 'Returns';

export interface PlayerStat {
  id: string; // Unique ID for the stat entry
  playerId?: number; // Optional - for linking to roster
  playerName: string; // CONSISTENT field name for player name
  year: number; // The season year for these stats
  category: StatCategory;

  // Common fields
  gamesPlayed?: number;

  // Passing specific
  attempts?: number;
  completions?: number;
  passyards?: number;
  passtd?: number;
  passint?: number;
  long?: number;

  // Rushing specific
  carries?: number;
  rushyards?: number;
  rushtd?: number;
  fumbles?: number;
  yac?: number;

  // Receiving specific
  receptions?: number;
  recyards?: number;
  rectd?: number;
  rac?: number;

  // Defensive specific
  solo?: number;
  assists?: number;
  tackles?: number; // Can be calculated from solo + assists
  tfl?: number; // Tackles for loss
  sacks?: number;
  defint?: number;
  forcedfumbles?: number;
  deftd?: number;

  // Kicking specific
  fgmade?: number;
  fgattempted?: number;
  xpmade?: number;
  xpattempted?: number;

  // Punting specific
  punts?: number;
  puntyards?: number;
  touchbacks?: number;

  // Return specific
  kryards?: number;
  krtd?: number;
  pryards?: number;
  prtd?: number;
  krlong?: number;
  prlong?: number;

  // Allow for future expansion
  [key: string]: string | number | StatCategory | undefined;
}