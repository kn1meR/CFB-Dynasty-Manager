// src/components/PlayerCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { getCoachProfile, getPlayerStats, getAllRecruits, getAllTransfers, getAllYearRecords } from '@/utils/localStorage';
import { Award } from '@/types/statTypes';
import { PlayerStat } from '@/types/playerStats';

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
}

interface PlayerCardProps {
  player: ExtendedPlayer;
  isOpen: boolean;
  onClose: () => void;
}

interface CareerStats {
  [year: number]: PlayerStat[];
}

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
  const [loading, setLoading] = useState(true);
  const [recruitingInfo, setRecruitingInfo] = useState<{ year: number; stars: string; type: string } | null>(null);
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

      const allRecruits = getAllRecruits();
      let foundRecruitingInfo = null;
      const playerRecruit = allRecruits.find(r => r.name === player.name);
      if (playerRecruit) {
        foundRecruitingInfo = { year: playerRecruit.recruitedYear, stars: playerRecruit.stars, type: 'Recruited' };
      } else {
        const allTransfers = getAllTransfers();
        const playerTransfer = allTransfers.find(t => t.playerName === player.name && t.transferDirection === 'From');
        if (playerTransfer) {
          foundRecruitingInfo = { year: playerTransfer.transferYear, stars: playerTransfer.stars, type: 'Transfer' };
        }
      }
      setRecruitingInfo(foundRecruitingInfo);
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, player]);

  const enhancedPlayer = player;
  const sortedYears = Object.keys(careerStats).map(Number).sort((a, b) => b - a);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[85vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="sr-only"><DialogTitle>Player Profile</DialogTitle></DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col h-full">
            <div className="flex items-start gap-4 p-4 flex-shrink-0">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0" style={{ backgroundColor: schoolColors.primary }}>
                {enhancedPlayer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-1">{enhancedPlayer.name.toUpperCase()}</h1>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold">#{enhancedPlayer.jerseyNumber}</span>
                  <span className="text-lg">{enhancedPlayer.position}</span>
                  <Badge className={`${getDevTraitColor(enhancedPlayer.devTrait)} text-xs`}>{enhancedPlayer.devTrait || 'Normal'}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div><div className="text-gray-400 text-xs">CLASS</div><div className="font-semibold">{enhancedPlayer.year}</div></div>
                  <div><div className="text-gray-400 text-xs">RATING</div><div className="font-semibold">{enhancedPlayer.rating}</div></div>
                  {recruitingInfo && (
                    <>
                      <div><div className="text-gray-400 text-xs">{recruitingInfo.type.toUpperCase()}</div><div className="font-semibold">{recruitingInfo.year}</div></div>
                      <div><div className="text-gray-400 text-xs">{recruitingInfo.type.toUpperCase()} STARS</div><div className="font-semibold">{'⭐'.repeat(parseInt(recruitingInfo.stars))}</div></div>
                    </>
                  )}
                  {playerAwards.length > 0 && <div><div className="text-gray-400 text-xs">AWARDS</div><div className="font-semibold">{playerAwards.length}</div></div>}
                </div>
              </div>
            </div>

            <div className="bg-white text-black flex-1 flex flex-col overflow-hidden">
              <Tabs defaultValue="stats" className="w-full h-full flex flex-col">
                <TabsList className="w-full rounded-none border-b bg-gray-50 h-10 flex-shrink-0">
                  <TabsTrigger value="stats" className="flex-1 text-black data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2" style={{ borderColor: schoolColors.primary }}>Career Stats</TabsTrigger>
                  <TabsTrigger value="awards" className="flex-1 text-black data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2" style={{ borderColor: schoolColors.primary }}>Awards</TabsTrigger>
                  <TabsTrigger value="bio" className="flex-1 text-black data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:border-b-2" style={{ borderColor: schoolColors.primary }}>Bio</TabsTrigger>
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
                  
                  <TabsContent value="bio" className="mt-0 h-full p-4">
                    <div className="h-full flex flex-col">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Notes</h4>
                        {player.notes ? (<p className="text-gray-800 bg-gray-50 p-3 rounded">{player.notes}</p>) : (<p className="text-gray-500 italic">No notes recorded</p>)}
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