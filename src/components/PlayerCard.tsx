// src/components/PlayerCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Info, BarChart2, User, StickyNote } from 'lucide-react';
import { getCoachProfile, getPlayerStats, getAllRecruits, getAllTransfers, getAllYearRecords } from '@/utils/localStorage';
import { Award } from '@/types/statTypes';
import { PlayerStat } from '@/types/playerStats';
import { Recruit, Transfer } from '@/types/playerTypes';

// Extended Player interface to include optional properties that may exist in roster
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
  height?: string;
  weight?: string;
}

interface PlayerCardProps {
  player: ExtendedPlayer;
  isOpen: boolean;
  onClose: () => void;
}

interface CareerStats {
  [year: number]: PlayerStat[];
}

const isRecruit = (obj: any): obj is Recruit => {
  return obj && typeof obj === 'object' && 'recruitedYear' in obj;
};

const getDevTraitColor = (trait?: string): string => {
  const colors = {
    'Elite': 'bg-red-400 text-purple-100 dark:bg-red-700 dark:text-purple-0',
    'Star': 'bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:text-black',
    'Impact': 'bg-gray-400 text-gray-100 dark:bg-gray-600 dark:text-green-0',
    'Normal': 'bg-yellow-800 text-gray-100 dark:bg-yellow-900 dark:text-gray-0'
  } as const;
  return colors[trait as keyof typeof colors] || colors['Normal'];
};

const calculateQBR = (stat: Partial<PlayerStat>): number => {
  const completions = stat.completions || 0;
  const attempts = stat.attempts || 0;
  const yards = stat.passyards || 0;
  const touchdowns = stat.passtd || 0;
  const interceptions = stat.passint || 0;
  if (attempts === 0) return 0;
  const rating = ((8.4 * yards) + (330 * touchdowns) + (100 * completions) - (200 * interceptions)) / attempts;
  return Number(rating.toFixed(1));
};

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isOpen, onClose }) => {
  const [careerStats, setCareerStats] = useState<CareerStats>({});
  const [playerAwards, setPlayerAwards] = useState<Award[]>([]);
  // Store the full Recruit or Transfer object
  const [originInfo, setOriginInfo] = useState<Recruit | Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolColors, setSchoolColors] = useState({ primary: '#1e40af', secondary: '#ffffff' });

  useEffect(() => {
    if (!isOpen || !player) return;
    setLoading(true);
    try {
      const coachProfile = getCoachProfile();
      if (coachProfile?.schoolColors) setSchoolColors(coachProfile.schoolColors);

      const allStats: PlayerStat[] = getPlayerStats();
      const playerStats: CareerStats = {};
      allStats.forEach((stat) => {
        if (stat.playerName === player.name) {
          if (!playerStats[stat.year]) playerStats[stat.year] = [];
          playerStats[stat.year].push(stat);
        }
      });
      setCareerStats(playerStats);

      const allYearRecords = getAllYearRecords();
      const awards: Award[] = [];
      allYearRecords.forEach(record => {
        if (record.playerAwards) {
          awards.push(...record.playerAwards.filter(award => award.playerName === player.name));
        }
      });
      setPlayerAwards(awards);

      // Fetch and store the full origin object
      const allRecruits = getAllRecruits();
      const playerRecruit = allRecruits.find(r => r.name === player.name);
      if (playerRecruit) {
        setOriginInfo(playerRecruit);
      } else {
        const allTransfers = getAllTransfers();
        const playerTransfer = allTransfers.find(t => t.playerName === player.name && t.transferDirection === 'From');
        setOriginInfo(playerTransfer || null);
      }

    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, player]);

  const enhancedPlayer = player;
  const sortedYears = Object.keys(careerStats).map(Number).sort((a, b) => b - a);

  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="sr-only"><DialogTitle>Player Profile</DialogTitle></DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col h-full">
            {/* === HEADER SECTION (MODIFIED) === */}
            <div className="flex items-center gap-6 p-4 flex-shrink-0">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ backgroundColor: schoolColors.primary }}>
                {enhancedPlayer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold tracking-wider">{enhancedPlayer.name.toUpperCase()}</h1>

                {/* --- NEW HORIZONTAL INFO ROW --- */}
                <div className="flex items-end gap-x-6 mt-2">
                  <div>
                    <div className="text-gray-400 text-xs uppercase">Number</div>
                    <div className="text-lg font-semibold">#{enhancedPlayer.jerseyNumber}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">Position</div>
                    <div className="text-lg font-semibold">{enhancedPlayer.position}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">Class</div>
                    <div className="text-lg font-semibold">{enhancedPlayer.year}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">Rating</div>
                    <div className="text-lg font-semibold">{enhancedPlayer.rating}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">Dev. Trait</div>
                    <Badge className={`${getDevTraitColor(enhancedPlayer.devTrait)} text-sm`}>{enhancedPlayer.devTrait || 'Normal'}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-black flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="stats" className="w-full h-full flex flex-col">
                <TabsList
                  className="w-full rounded-none border-b bg-gray-50 h-10 flex-shrink-0"
                  style={{ '--school-primary-color': schoolColors.primary } as React.CSSProperties}
                >

                  {/* === STEP 2: USE CSS VARIABLE IN CHILD === */}
                  <TabsTrigger
                    value="stats"
                    className="flex-1 text-gray-600 rounded-xl transition-colors data-[state=active]:font-semibold data-[state=active]:bg-[--school-primary-color] data-[state=active]:text-white"
                  >
                    <BarChart2 className="h-4 w-4 mr-2" />Career Stats
                  </TabsTrigger>
                  <TabsTrigger
                    value="awards"
                    className="flex-1 text-gray-600 rounded-xl transition-colors data-[state=active]:font-semibold data-[state=active]:bg-[--school-primary-color] data-[state=active]:text-white"
                  >
                    <Trophy className="h-4 w-4 mr-2" />Awards
                  </TabsTrigger>

                  <TabsTrigger
                    value="info"
                    className="flex-1 text-gray-600 rounded-xl transition-colors data-[state=active]:font-semibold data-[state=active]:bg-[--school-primary-color] data-[state=active]:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />Player Info
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto">
                  <TabsContent value="stats" className="mt-0 h-full p-4">
                    {sortedYears.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="space-y-6">
                          {(() => {
                            const categories = new Set<string>();
                            Object.values(careerStats).forEach(yearStats => yearStats.forEach((stat: { category: string; }) => categories.add(stat.category)));
                            return Array.from(categories).map(category => {
                              const categoryStats: (PlayerStat & { year: number })[] = [];
                              Object.entries(careerStats).forEach(([year, yearStats]) => {
                                const categoryStat = yearStats.find((s: PlayerStat) => s.category === category);
                                if (categoryStat) categoryStats.push({ ...categoryStat, year: parseInt(year) });
                              });
                              if (categoryStats.length === 0) return null;
                              categoryStats.sort((a, b) => a.year - b.year);
                              const careerTotals: { [key: string]: number } = {};
                              categoryStats.forEach(stat => Object.entries(stat).forEach(([key, value]) => {
                                if (typeof value === 'number' && key !== 'year' && key !== 'id') {
                                  if (key.toLowerCase().includes('long')) careerTotals[key] = Math.max(careerTotals[key] || 0, value);
                                  else careerTotals[key] = (careerTotals[key] || 0) + value;
                                }
                              }));
                              const columns: { key: string; label: string; width?: string }[] = {
                                'Passing': [{ key: 'completions', label: 'CMP' }, { key: 'attempts', label: 'ATT' }, { key: 'passyards', label: 'YDS' }, { key: 'avg', label: 'AVG' }, { key: 'passtd', label: 'TD' }, { key: 'passint', label: 'INT' }, { key: 'long', label: 'LNG' }, { key: 'qbr', label: 'QBR' }],
                                'Rushing': [{ key: 'carries', label: 'CAR' }, { key: 'rushyards', label: 'YDS' }, { key: 'avg', label: 'AVG' }, { key: 'rushtd', label: 'TD' }, { key: 'long', label: 'LNG' }, { key: 'fumbles', label: 'FUM' }],
                                'Receiving': [{ key: 'receptions', label: 'REC' }, { key: 'recyards', label: 'YDS' }, { key: 'avg', label: 'AVG' }, { key: 'rectd', label: 'TD' }, { key: 'long', label: 'LNG' }, { key: 'fumbles', label: 'FUM' }],
                                'Blocking': [{ key: 'gp', label: 'GP' }, { key: 'dp', label: 'DP' }, { key: 'sacksallowed', label: 'Sacks Allowed' }],
                                'Defense': [{ key: 'tackles', label: 'TCKL' }, { key: 'solo', label: 'SOLO' }, { key: 'assists', label: 'AST' }, { key: 'sacks', label: 'SACK' }, { key: 'tfl', label: 'TFL' }, { key: 'defint', label: 'INT' }, { key: 'deftd', label: 'TD' }],
                                'Kicking': [{ key: 'fgmade', label: 'FGM' }, { key: 'fgattempted', label: 'FGA' }, { key: 'fgpct', label: 'FG%' }, { key: 'long', label: 'LNG' }, { key: 'xpmade', label: 'XPM' }, { key: 'xpattempted', label: 'XPA' }],
                                'Punting': [{ key: 'punts', label: 'PUNTS' }, { key: 'puntyards', label: 'YDS' }, { key: 'avg', label: 'AVG' }, { key: 'long', label: 'LNG' }, { key: 'touchbacks', label: 'TB' }],
                                'Kick Return': [{ key: 'krattempts', label: 'KR ATT' }, { key: 'kryards', label: 'KR YRD' }, { key: 'krtd', label: 'KR TD' }, { key: 'krlong', label: 'KR LNG' }],
                                'Punt Return': [{ key: 'prattempts', label: 'PR ATT' }, { key: 'pryards', label: 'PR YRD' }, { key: 'prtd', label: 'PR TD' }, { key: 'prlong', label: 'PR LNG' }]
                              }[category as string] || [];
                              const getStatValue = (stat: PlayerStat | { [key: string]: number }, key: string, isCareerTotal = false): string => {
                                const isFullStat = 'id' in stat;
                                switch (key) {
                                  case 'avg':
                                    if (category === 'Passing') { const yards = isFullStat ? (stat as PlayerStat).passyards : (stat as { [key: string]: number }).passyards; const attempts = isFullStat ? (stat as PlayerStat).attempts : (stat as { [key: string]: number }).attempts; return (attempts || 0) > 0 ? ((yards || 0) / (attempts || 1)).toFixed(1) : '0.0'; }
                                    if (category === 'Rushing') { const yards = isFullStat ? (stat as PlayerStat).rushyards : (stat as { [key: string]: number }).rushyards; const carries = isFullStat ? (stat as PlayerStat).carries : (stat as { [key: string]: number }).carries; return (carries || 0) > 0 ? ((yards || 0) / (carries || 1)).toFixed(1) : '0.0'; }
                                    if (category === 'Receiving') { const yards = isFullStat ? (stat as PlayerStat).recyards : (stat as { [key: string]: number }).recyards; const receptions = isFullStat ? (stat as PlayerStat).receptions : (stat as { [key: string]: number }).receptions; return (receptions || 0) > 0 ? ((yards || 0) / (receptions || 1)).toFixed(1) : '0.0'; }
                                    if (category === 'Punting') { const yards = isFullStat ? (stat as PlayerStat).puntyards : (stat as { [key: string]: number }).puntyards; const punts = isFullStat ? (stat as PlayerStat).punts : (stat as { [key: string]: number }).punts; return (punts || 0) > 0 ? ((yards || 0) / (punts || 1)).toFixed(1) : '0.0'; }
                                    break;
                                  case 'qbr': return calculateQBR(stat as Partial<PlayerStat>).toString();
                                  case 'fgpct': const made = isFullStat ? (stat as PlayerStat).fgmade : (stat as { [key: string]: number }).fgmade; const attempted = isFullStat ? (stat as PlayerStat).fgattempted : (stat as { [key: string]: number }).fgattempted; return (attempted || 0) > 0 ? (((made || 0) / (attempted || 1)) * 100).toFixed(1) : '0.0';
                                  case 'tackles': const solo = isFullStat ? (stat as PlayerStat).solo : (stat as { [key: string]: number }).solo; const assists = isFullStat ? (stat as PlayerStat).assists : (stat as { [key: string]: number }).assists; return ((solo || 0) + (assists || 0)).toString();
                                  default: return (stat as any)[key]?.toString() || '0';
                                }
                                return '0';
                              };
                              return (
                                <div key={category} className="border border-gray-200 rounded">
                                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200"><h3 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">{category}</h3></div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead><tr className="border-b border-gray-200"><th className="text-left px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide w-16">YEAR</th>{columns.map(col => <th key={col.key} className={`text-center px-2 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide ${col.width || 'w-16'}`}>{col.label}</th>)}</tr></thead>
                                      <tbody>
                                        {categoryStats.map((stat, index) => (
                                          <tr key={stat.year} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}><td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.year}</td>{columns.map(col => <td key={col.key} className="px-2 py-3 text-sm text-gray-900 text-center">{getStatValue(stat, col.key)}</td>)}</tr>
                                        ))}
                                        <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold"><td className="px-4 py-3 text-sm font-bold text-gray-900">Career</td>{columns.map(col => <td key={col.key} className="px-2 py-3 text-sm text-gray-900 text-center font-semibold">{getStatValue(careerTotals, col.key, true)}</td>)}</tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 h-full flex flex-col justify-center"><Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No statistics recorded yet</p></div>
                    )}
                  </TabsContent>

                  <TabsContent value="awards" className="mt-0 h-full p-4">
                    <div className="h-full flex flex-col">
                      {playerAwards.length > 0 ? (
                        <div className="grid gap-3">
                          {playerAwards.map((award, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                              <Trophy className="h-6 w-6 text-yellow-600" />
                              <div className="flex-1">
                                <div className="font-semibold">{award.awardName}{award.team && <span className="text-sm font-normal text-gray-700 ml-2">({award.team})</span>}</div>
                                <div className="text-sm text-gray-600">{award.year}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 h-full flex flex-col justify-center"><Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No awards yet</p></div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="mt-0 h-full p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Recruiting Profile Section */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Recruiting Info</h3>
                        {originInfo ? (
                          <>
                            <InfoItem label="Origin Type" value={<Badge variant="secondary">{isRecruit(originInfo) ? 'Recruit' : 'Transfer'}</Badge>} />
                            <InfoItem label="Class Year" value={isRecruit(originInfo) ? originInfo.recruitedYear : originInfo.transferYear} />
                            <InfoItem label="Star Rating" value={'⭐'.repeat(parseInt(originInfo.stars))} />
                            {isRecruit(originInfo) && (
                              <>
                                <InfoItem label="Home State" value={originInfo.state || 'N/A'} />
                                <InfoItem label="National Rank" value={originInfo.nationalRank ?? 'N/A'} />
                                <InfoItem label="State Rank" value={originInfo.stateRank ?? 'N/A'} />
                              </>
                            )}
                            {!isRecruit(originInfo) && (
                              <InfoItem label="Previous School" value={(originInfo as Transfer).school || 'N/A'} />
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No recruiting or transfer history found.</p>
                        )}
                      </div>

                      {/* Player Attributes Section */}
                      <div className="bg-white p-4 rounded-lg border">
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Player Info</h3>
                        <InfoItem label="Class" value={player.year} />
                        <InfoItem label="Redshirted" value={player.isRedshirted ? 'Yes' : 'No'} />
                        <InfoItem label="Development Trait" value={<Badge className={`${getDevTraitColor(enhancedPlayer.devTrait)} text-xs`}>{enhancedPlayer.devTrait || 'Normal'}</Badge>} />
                        {/* Optional attributes */}
                        {/*<InfoItem label="Height" value={player.height || 'N/A'} /> */}
                        {/*<InfoItem label="Weight" value={player.weight ? `${player.weight} lbs` : 'N/A'} />*/}
                      </div>

                      {/* Notes Section */}
                      <div className="bg-white p-4 rounded-lg border md:col-span-2">
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Coach's Notes</h3>
                        {player.notes ? (
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{player.notes}</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No notes recorded.</p>
                        )}
                      </div>

                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerCard;
