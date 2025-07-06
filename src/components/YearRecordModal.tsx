"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DraftedPlayer, Recruit, Transfer } from "@/types/playerTypes";
import { YearRecord, Game } from "@/types/yearRecord";
import {
  getRecruits,
  getTransfers,
  getYearAwards,
  getYearRecord,
  getCoachProfile,
  setYearRecord,
} from "@/utils/localStorage";
import {
  notifySuccess,
  notifyError,
  MESSAGES,
} from "@/utils/notification-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star, TrendingUp, Users, Award, X } from "lucide-react";
import { fbsTeams } from "@/utils/fbsTeams";
import { TeamLogo, ConferenceLogo } from "@/components/ui/TeamLogo";
import { getTeamWithLogo } from "@/utils/logoUtils";

interface YearRecordModalProps {
  year: number;
  onClose: () => void;
}

interface DevTraitBadgeProps {
  trait: "Normal" | "Impact" | "Star" | "Elite";
}

interface HeismanWinner {
  name: string;
  position: string;
  class: string;
  school: string;
}

const SCHEDULE_SIZE = 21;
const classOptions = ["FR", "SO", "JR", "SR", "Grad Student"];
const positionOptions = ["QB", "RB", "WR", "TE", "K", "P", "OL", "DL", "LB", "CB", "S"];

const YearRecordModal: React.FC<YearRecordModalProps> = ({ year, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [record, setRecord] = useState<YearRecord | null>(null);
  const [heismanWinner, setHeismanWinner] = useState<HeismanWinner>({ name: "", position: "", class: "", school: "" });

  const parseHeismanString = (heismanStr: string): HeismanWinner => {
    if (!heismanStr || heismanStr.trim() === "") {
      return { name: "", position: "", class: "", school: "" };
    }
    const parts = heismanStr.split(" - ").map((part) => part.trim());
    return { name: parts[0] || "", position: parts[1] || "", class: parts[2] || "", school: parts[3] || "" };
  };

  const formatHeismanString = (heisman: HeismanWinner): string => {
    if (!heisman.name.trim()) return "";
    return [heisman.name, heisman.position, heisman.class, heisman.school].filter(Boolean).join(" - ");
  };

  useEffect(() => {
    const loadData = () => {
      try {
        let existingRecord = getYearRecord(year);
        let updatedSchedule = existingRecord.schedule || [];
        if (updatedSchedule.length < SCHEDULE_SIZE) {
          const additionalSlots = Array(SCHEDULE_SIZE - updatedSchedule.length)
            .fill(null)
            .map((_, index) => ({
              id: updatedSchedule.length + index,
              week: updatedSchedule.length + index,
              opponent: "",
              result: "N/A" as const, // Type assertion
              score: "",
              location: "vs" as const // Type assertion
            }));
          updatedSchedule = [...updatedSchedule, ...additionalSlots];
        }

        const populatedRecord = {
          ...existingRecord,
          playerAwards: existingRecord.playerAwards?.length ? existingRecord.playerAwards : getYearAwards(year),
          recruits: existingRecord.recruits?.length ? existingRecord.recruits : getRecruits(year),
          transfers: existingRecord.transfers?.length ? existingRecord.transfers : getTransfers(year),
          schedule: updatedSchedule,
        };

        setRecord(populatedRecord);
        setHeismanWinner(parseHeismanString(populatedRecord.heisman || ""));
      } catch (error) {
        console.error("Error loading year record:", error);
        notifyError("Failed to load year record");
      }
    };
    loadData();
  }, [year]);

  const handleFieldChange = (field: keyof YearRecord, value: any) => {
    setRecord(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleHeismanChange = (field: keyof HeismanWinner, value: string) => {
    setHeismanWinner(prev => ({ ...prev, [field]: value }));
  };

  const updateDraftedPlayer = (index: number, field: keyof DraftedPlayer, value: string | number) => {
    if (!record) return;
    const updatedPlayersDrafted = [...(record.playersDrafted || [])];
    let processedValue: string | number = value;
    if (field === "round" || field === "pick" || field === "year") {
      processedValue = typeof value === "string" ? parseInt(value) || 0 : value;
    }
    updatedPlayersDrafted[index] = { ...updatedPlayersDrafted[index], [field]: processedValue };
    handleFieldChange('playersDrafted', updatedPlayersDrafted);
  };

  const addDraftedPlayer = () => {
    if (!record) return;
    const newPlayer: DraftedPlayer = { id: Date.now().toString(), playerName: "", originalTeam: "", draftedTeam: "", round: 1, pick: 1, year };
    const updatedDraft = [...(record.playersDrafted || []), newPlayer];
    handleFieldChange('playersDrafted', updatedDraft);
  };

  const removeDraftedPlayer = (index: number) => {
    if (!record) return;
    const updatedDraft = (record.playersDrafted || []).filter((_, i) => i !== index);
    handleFieldChange('playersDrafted', updatedDraft);
    notifySuccess("Player removed from draft list");
  };

  const updateSchedule = (index: number, field: keyof Game, value: string) => {
    if (!record) return;
    const updatedSchedule = [...record.schedule];
    (updatedSchedule[index] as any)[field] = value;
    handleFieldChange('schedule', updatedSchedule);
  };

  const handleSave = () => {
    if (!record) {
      notifyError("No record data to save.");
      return;
    }
    try {
      const finalHeismanString = formatHeismanString(heismanWinner);
      const recordToSave = { ...record, heisman: finalHeismanString };
      setYearRecord(year, recordToSave);
      notifySuccess(MESSAGES.SAVE_SUCCESS);
      onClose();
    } catch (error) {
      console.error("Error saving year record:", error);
      notifyError(MESSAGES.SAVE_ERROR);
    }
  };

  const DevTraitBadge: React.FC<DevTraitBadgeProps> = ({ trait }) => {
    const colors = {
      Elite: "bg-red-400 text-purple-100 dark:bg-red-700",
      Star: "bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:text-black",
      Impact: "bg-gray-400 text-gray-100 dark:bg-gray-600",
      Normal: "bg-yellow-800 text-gray-100 dark:bg-yellow-900",
    } as const;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[trait]}`}>{trait}</span>;
  };

  const sortedTeams = [...fbsTeams].sort((a, b) => a.name.localeCompare(b.name));

  if (!record) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>Loading...</DialogContent>
      </Dialog>
    );
  }

  // MODIFICATION: The content for the Schedule tab is now outside the ScrollArea
  const scheduleContent = (
    <div className="space-y-4 p-4 max-w-6xl mx-auto">
      <div className="text-center"><h2 className="text-2xl font-bold">{year} Schedule & Results</h2></div>
      <div className="space-y-2">
        {record.schedule.map((game, index) => {
          const isWin = game.result === "Win";
          const isLoss = game.result === "Loss";
          return (
            <div key={index} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-md border ${isWin ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : isLoss ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                  : "bg-transparent border-gray-200 dark:border-gray-700"
              }`}>
              <div className="col-span-1 text-center font-bold text-gray-500">{`W${game.week}`}</div>
              <div className="col-span-1 text-center">
                <Select value={game.location || "vs"} onValueChange={(value: Game['location']) => updateSchedule(index, "location", value)}><SelectTrigger className="h-8 w-14 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vs">vs</SelectItem><SelectItem value="@">@</SelectItem><SelectItem value="neutral">N</SelectItem></SelectContent></Select>
              </div>
              <div className="col-span-5 flex items-center gap-2">
                <TeamLogo teamName={game.opponent} size="sm" />
                <Input value={game.opponent} onChange={(e) => updateSchedule(index, "opponent", e.target.value)} placeholder="Opponent" className="h-8" />
              </div>
              <div className="col-span-2">
                <Input value={game.score} onChange={(e) => updateSchedule(index, "score", e.target.value)} placeholder="Score" className="h-8 text-center font-mono" />
              </div>
              <div className="col-span-3">
                <Select value={game.result} onValueChange={(value: Game['result']) => updateSchedule(index, "result", value)}><SelectTrigger className="h-8"><SelectValue placeholder="Result" /></SelectTrigger><SelectContent><SelectItem value="Win">Win</SelectItem><SelectItem value="Loss">Loss</SelectItem><SelectItem value="Tie">Tie</SelectItem><SelectItem value="Bye">Bye</SelectItem><SelectItem value="N/A">N/A</SelectItem></SelectContent></Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-2xl font-bold text-center">{year} Season Record</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-auto px-4">
              <TabsTrigger value="general">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="recruits">Recruits</TabsTrigger>
              <TabsTrigger value="awards">Awards & Draft</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="flex-grow overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4 max-w-6xl mx-auto">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4">
                      {(() => {
                        const coachProfile = getCoachProfile();
                        const teamData = coachProfile?.schoolName ? getTeamWithLogo(coachProfile.schoolName) : null;
                        return teamData ? (
                          <>
                            <TeamLogo teamName={teamData.name} size="xl" />
                            <div>
                              <h2 className="text-3xl font-bold">{year} Season Summary</h2>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <ConferenceLogo conference={teamData.conference} size="sm" />
                                <span className="text-md text-gray-600 dark:text-gray-400">{teamData.conference}</span>
                              </div>
                            </div>
                          </>
                        ) : (<h2 className="text-3xl font-bold">{year} Season Summary</h2>);
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><Trophy className="h-8 w-8 text-blue-500" /><div><p className="text-xs font-medium text-gray-500">Overall Record</p><p className="text-2xl font-bold">{record.overallRecord || "0-0"}</p></div></div></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><Star className="h-8 w-8 text-purple-500" /><div><p className="text-xs font-medium text-gray-500">Conference</p><p className="text-2xl font-bold">{record.conferenceRecord || "0-0"}</p></div></div></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-green-500" /><div><p className="text-xs font-medium text-gray-500">Points For</p><p className="text-2xl font-bold">{record.pointsFor || "0"}</p></div></div></CardContent></Card>
                    <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><Medal className="h-8 w-8 text-red-500" /><div><p className="text-xs font-medium text-gray-500">Points Against</p><p className="text-2xl font-bold">{record.pointsAgainst || "0"}</p></div></div></CardContent></Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card><CardHeader className="p-4"><CardTitle className="text-lg flex items-center gap-2"><Trophy /> Season Achievements</CardTitle></CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {record.natChamp && <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"><Trophy className="h-6 w-6 text-yellow-600" /><div><p className="font-semibold text-yellow-800 dark:text-yellow-200">National Champions!</p><p className="text-sm text-yellow-700 dark:text-yellow-300">{record.natChamp}</p></div></div>}
                        {record.bowlGame && <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><div className="flex items-center gap-3"><Medal className="h-5 w-5 text-blue-600" /><div><p className="font-semibold text-blue-800 dark:text-blue-200">{record.bowlGame}</p></div></div>{record.bowlResult && <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.bowlResult.toLowerCase().includes("win") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{record.bowlResult}</span>}</div>}
                        {record.heisman && <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Award className="h-5 w-5 text-purple-600" /><div><p className="font-semibold text-purple-800 dark:text-purple-200">Heisman Winner</p><p className="text-sm text-purple-600 dark:text-purple-400">{record.heisman}</p></div></div>}
                        {!record.natChamp && !record.bowlGame && !record.heisman && <div className="text-center py-6 text-gray-500"><Trophy className="h-10 w-10 mx-auto mb-2 opacity-50" /><p>No major achievements recorded</p></div>}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4"><CardTitle className="text-lg flex items-center gap-2"><TrendingUp /> Statistical Summary</CardTitle></CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {(() => {
                          const pointsFor = parseInt(record.pointsFor) || 0;
                          const pointsAgainst = parseInt(record.pointsAgainst) || 0;
                          const [wins, losses] = (record.overallRecord || "0-0").split("-").map((n) => parseInt(n) || 0);
                          const totalGames = wins + losses;
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"><p className="text-xs text-gray-500">Win %</p><p className="text-xl font-bold text-blue-600">{totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0.0"}%</p></div>
                                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"><p className="text-xs text-gray-500">Point Diff</p><p className={`text-xl font-bold ${pointsFor - pointsAgainst >= 0 ? "text-green-600" : "text-red-600"}`}>{pointsFor - pointsAgainst >= 0 ? "+" : ""}{pointsFor - pointsAgainst}</p></div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><span className="text-sm">Avg Points For</span><span className="font-bold text-sm">{totalGames > 0 ? (pointsFor / totalGames).toFixed(1) : "0.0"}</span></div>
                                <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><span className="text-sm">Avg Points Against</span><span className="font-bold text-sm">{totalGames > 0 ? (pointsAgainst / totalGames).toFixed(1) : "0.0"}</span></div>
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {record.recruits && record.recruits.length > 0 && <Card><CardHeader className="p-4"><CardTitle className="text-lg flex items-center gap-2"><Star /> Recruiting Highlights {record.recruitingClassPlacement && <span className="ml-auto text-sm font-normal text-gray-500">#{record.recruitingClassPlacement} Nationally</span>}</CardTitle></CardHeader><CardContent className="p-4"><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{record.recruits.slice(0, 6).map((recruit, index) => (<div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"><div className="flex">{Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`h-3 w-3 ${i < parseInt(recruit.stars) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />))}</div><div className="flex-1 min-w-0"><p className="font-semibold truncate text-sm">{recruit.name}</p><p className="text-xs text-gray-500">{recruit.position}</p></div></div>))}</div>{record.recruits.length > 6 && <p className="text-center text-xs text-gray-500 mt-2">+{record.recruits.length - 6} more recruits</p>}</CardContent></Card>}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="schedule" className="flex-grow overflow-auto">
              {scheduleContent}
            </TabsContent>

            <TabsContent value="recruits" className="flex-grow overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      {/* MODIFICATION: Added check for undefined record.recruits */}
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Star className="text-yellow-500" /> Recruiting Class ({(record.recruits || []).length})</h3>
                      <div className="space-y-2">
                        {(record.recruits || []).length > 0 ? (record.recruits || []).sort((a, b) => parseInt(b.stars) - parseInt(a.stars)).map((recruit, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border rounded-md">
                            <div className="flex flex-col items-center w-12"><div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3 w-3 ${i < parseInt(recruit.stars) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}</div><span className="text-xs">{recruit.stars}⭐</span></div>
                            <div className="flex-1"><h4 className="font-semibold">{recruit.name}</h4><p className="text-sm text-gray-500">{recruit.position} | Rating: {recruit.rating}</p></div>
                            <DevTraitBadge trait={recruit.potential as any} />
                          </div>
                        )) : <p className="text-sm text-center text-gray-500 py-4">No recruits recorded.</p>}
                      </div>
                    </div>
                    <div>
                      {/* MODIFICATION: Added check for undefined record.transfers */}
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Users className="text-blue-500" /> Transfer Portal ({(record.transfers || []).length})</h3>
                      <div className="space-y-2">
                        {(record.transfers || []).length > 0 ? (record.transfers || [])
                          .sort((a, b) => {
                            if (a.transferDirection === 'From' && b.transferDirection === 'To') return -1;
                            if (a.transferDirection === 'To' && b.transferDirection === 'From') return 1;
                            return 0;
                          })
                          .map((transfer, index) => {
                            const isIncoming = transfer.transferDirection === "From";
                            return (
                              <div key={index} className={`flex items-center gap-3 p-2 border rounded-md ${isIncoming ? "border-green-300" : "border-red-300"}`}>
                                <div className={`text-xs font-bold w-8 text-center ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>{isIncoming ? "IN" : "OUT"}</div>
                                <div className="flex-1"><h4 className="font-semibold">{transfer.playerName}</h4><p className="text-sm text-gray-500">{transfer.position} | {transfer.school}</p></div>
                                <div className="text-sm">{transfer.stars}⭐</div>
                              </div>
                            )
                          }) : <p className="text-sm text-center text-gray-500 py-4">No transfer activity.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>


            <TabsContent value="awards" className="flex-grow overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4 max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card><CardHeader className="p-3"><CardTitle className="text-base">Season Performance</CardTitle></CardHeader>
                      <CardContent className="p-3 grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-medium">Overall Record</label><Input value={record.overallRecord} onChange={e => handleFieldChange('overallRecord', e.target.value)} placeholder="12-1" className="h-8 mt-1" /></div>
                        <div><label className="text-xs font-medium">Conf. Record</label><Input value={record.conferenceRecord} onChange={e => handleFieldChange('conferenceRecord', e.target.value)} placeholder="8-1" className="h-8 mt-1" /></div>
                        <div><label className="text-xs font-medium">Points For</label><Input type="number" value={record.pointsFor} onChange={e => handleFieldChange('pointsFor', e.target.value)} placeholder="450" className="h-8 mt-1" /></div>
                        <div><label className="text-xs font-medium">Points Against</label><Input type="number" value={record.pointsAgainst} onChange={e => handleFieldChange('pointsAgainst', e.target.value)} placeholder="275" className="h-8 mt-1" /></div>
                      </CardContent>
                    </Card>
                    <Card><CardHeader className="p-3"><CardTitle className="text-base">Postseason & Rankings</CardTitle></CardHeader>
                      <CardContent className="p-3 grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-medium">Bowl Game</label><Input value={record.bowlGame} onChange={e => handleFieldChange('bowlGame', e.target.value)} placeholder="Rose Bowl" className="h-8 mt-1" /></div>
                        <div><label className="text-xs font-medium">Bowl Result</label><Select value={record.bowlResult} onValueChange={v => handleFieldChange('bowlResult', v)}><SelectTrigger className="h-8 mt-1"><SelectValue placeholder="Result" /></SelectTrigger><SelectContent><SelectItem value="Win">Win</SelectItem><SelectItem value="Loss">Loss</SelectItem></SelectContent></Select></div>
                        <div><label className="text-xs font-medium">Recruiting Rank</label><Input value={record.recruitingClassPlacement} onChange={e => handleFieldChange('recruitingClassPlacement', e.target.value)} placeholder="#8" className="h-8 mt-1" /></div>
                        <div><label className="text-xs font-medium">Final Rank</label><Input value={record.finalRanking || ""} onChange={e => handleFieldChange('finalRanking', e.target.value)} placeholder="#5" className="h-8 mt-1" /></div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card><CardHeader className="p-3"><CardTitle className="text-base">Championships & Heisman</CardTitle></CardHeader>
                    <CardContent className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">National Champion</label><Select value={record.natChamp || "none"} onValueChange={v => handleFieldChange('natChamp', v === 'none' ? '' : v)}><SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select Team" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem>{sortedTeams.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                        <div>
                          <label className="text-sm font-medium">Heisman Winner</label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <Input value={heismanWinner.name} onChange={e => handleHeismanChange("name", e.target.value)} placeholder="Player Name" className="h-9" />
                            <Select value={heismanWinner.position} onValueChange={v => handleHeismanChange("position", v)}><SelectTrigger className="h-9"><SelectValue placeholder="Pos" /></SelectTrigger><SelectContent>{positionOptions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}</SelectContent></Select>
                            <Select value={heismanWinner.class} onValueChange={v => handleHeismanChange("class", v)}><SelectTrigger className="h-9"><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                            <Select value={heismanWinner.school} onValueChange={v => handleHeismanChange("school", v)}><SelectTrigger className="h-9"><SelectValue placeholder="School" /></SelectTrigger><SelectContent>{sortedTeams.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><Award className="text-yellow-500" /> Player Awards ({record.playerAwards?.length || 0})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {record.playerAwards?.length > 0 ? record.playerAwards.map((award, index) => (
                          <div key={index} className="flex items-center p-2 border rounded-md text-sm"><Award className="h-4 w-4 mr-2 text-yellow-500" /> <span className="font-semibold">{award.playerName}</span> - {award.awardName}</div>
                        )) : <p className="text-sm text-center py-4 text-gray-500">No player awards. (Imported automatically)</p>}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold flex items-center gap-2"><Medal className="text-blue-500" /> NFL Draft ({record.playersDrafted?.length || 0})</h3>
                        <Button onClick={addDraftedPlayer} size="sm">Add Player</Button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {record.playersDrafted?.length > 0 ? record.playersDrafted.sort((a, b) => a.round - b.round || a.pick - b.pick).map((player, index) => (
                          <div key={player.id || index} className="grid grid-cols-[1fr,auto,auto] gap-2 items-center p-2 border rounded-md">
                            <Input value={player.playerName} onChange={e => updateDraftedPlayer(index, "playerName", e.target.value)} placeholder="Player Name" className="h-8" />
                            <div className="flex items-center gap-1"><span className="text-xs">Rnd</span><Input type="number" value={player.round} onChange={e => updateDraftedPlayer(index, "round", e.target.value)} className="h-8 w-14 text-center" /></div>
                            <Button onClick={() => removeDraftedPlayer(index)} variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button>
                          </div>
                        )) : <p className="text-sm text-center py-4 text-gray-500">No players drafted.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t p-3 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearRecordModal;