// src/components/SocialMediaHub.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Flame, TrendingUp, Star, Users, Trophy, RefreshCw } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Player, Recruit } from '@/types/playerTypes';
import { Game } from '@/types/yearRecord';
import { getCoachProfile, getSchedule, getAllRecruits, getPlayers } from '@/utils/localStorage';
import { Badge } from '@/components/ui/badge';

// --- Types ---
interface SocialPost {
    id: string; type: string; author: string; authorHandle: string; authorType: string; content: string;
    timestamp: Date; likes: number; retweets: number; comments: number;
    verified?: boolean; avatarPath?: string;
}

// --- Helper Components ---
const Avatar: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (<div className={`inline-flex items-center justify-center rounded-full ${className}`}>{children}</div>);
const AvatarFallback: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (<div className={`w-full h-full flex items-center justify-center text-white font-medium text-sm ${className}`}>{children}</div>);

// --- Content Generation Logic ---
const getRandomTemplate = (templates: string[]) => templates[Math.floor(Math.random() * templates.length)];
const getGameEmoji = (score?: string, result?: string): string => {
    if (result === 'Win') return '🏆';
    if (result === 'Loss') return '💔';
    return '🏈';
};

const MEDIA_PERSONALITIES = {
    official: (teamName: string) => ({ name: `${teamName} Football`, handle: `@${teamName.replace(/\s+/g, '')}FB`, avatar: undefined, verified: true }),
    on3: { name: 'On3 Recruits', handle: '@On3Recruits', avatar: '/avatars/on3.png', verified: true },
    espn: { name: 'ESPN College Football', handle: '@ESPNCFB', avatar: '/avatars/espncfb.png', verified: true },
    br: { name: 'Bleacher Report CFB', handle: '@BR_CFB', avatar: '/avatars/brcfb.png', verified: true },
    pff: { name: 'PFF College', handle: '@PFF_College', avatar: '/avatars/pff.png', verified: true },
    gameday: { name: 'College GameDay', handle: '@CollegeGameDay', avatar: '/avatars/gameday.png', verified: true },
    ncaa: { name: 'NCAA Football', handle: '@NCAAFootball', avatar: '/avatars/ncaafootball.png', verified: true },
    playoff: { name: 'CFB Playoffs', handle: '@CFBPlayoff', avatar: '/avatars/cfbplayoff.png', verified: true },
    reporter: { name: 'CFB Report', handle: '@CFBReport', avatar: '/avatars/cfbrep.png', verified: true },
    recruiting247: { name: '24/7 Recruiting', handle: '@247Recruiting', avatar: '/avatars/247.png', verified: true },
};

const generateGameRecapPosts = (game: Game, teamName: string, players: Player[], virtualDate: Date): SocialPost[] => {
    if (!game || !game.opponent || game.result === 'N/A' || game.result === 'Bye') return [];

    const isWin = game.result === 'Win';
    const scoreParts = game.score.split('-').map(s => parseInt(s.trim()));
    const scoreDiff = scoreParts.length === 2 ? Math.abs(scoreParts[0] - scoreParts[1]) : 0;
    const topPerformer = players.length > 0 ? players.sort((a,b) => parseInt(b.rating) - parseInt(a.rating))[0] : null;

    const templates = isWin ? [
        `That's a W! Final from today's game: ${teamName} ${game.score} ${game.opponent}. Great team effort! #Go${teamName.replace(/\s+/g,'')}`,
        scoreDiff > 21 
            ? `DOMINANT! ${teamName} rolls past ${game.opponent}, ${game.score}. Not even close. #Untouchable`
            : `VICTORY! We take care of business against ${game.opponent}, ${game.score}. On to the next one.`
    ] : [
        scoreDiff <= 7 
            ? `HEARTBREAKER. A tough, last-minute loss to ${game.opponent}, ${game.score}. We'll be back.`
            : `Final: ${game.opponent} ${game.score} ${teamName}. Not our day. Back to the film room.`
    ];

    const official = MEDIA_PERSONALITIES.official(teamName);
    const post: SocialPost = {
        id: `official-recap-${game.id}`, type: 'game_recap', author: official.name, authorHandle: official.handle, authorType: 'official',
        content: getRandomTemplate(templates), timestamp: new Date(virtualDate.getTime() - 18 * 3600000),
        likes: isWin ? 450 : 150, retweets: isWin ? 120 : 40, comments: 60, verified: true
    };
    
    const mediaPersonalitiesArray = Object.values(MEDIA_PERSONALITIES).filter((p): p is { name: string; handle: string; avatar: string; verified: boolean; } => typeof p !== 'function' && p.handle !== '@On3Recruits' && p.handle !== '@247Recruiting');
    const mediaPersonality = mediaPersonalitiesArray[Math.floor(Math.random() * mediaPersonalitiesArray.length)];

    const mediaTemplates = isWin ? [
        `${teamName} gets a big win over ${game.opponent}, ${game.score}. ${topPerformer?.name || 'The offense'} was a key factor today.`,
        `Impressive performance by ${teamName} as they defeat ${game.opponent}. Are they a contender in their conference?`
    ] : [
        `UPSET ALERT? ${game.opponent} takes down ${teamName} in a ${scoreDiff <= 7 ? 'thriller' : 'convincing fashion'}, ${game.score}.`,
        `${teamName} struggles today, falling to ${game.opponent}. Questions will be asked this week in practice.`
    ];

    const mediaPost: SocialPost = {
        id: `media-recap-${game.id}`, type: 'news', author: mediaPersonality.name, authorHandle: mediaPersonality.handle, authorType: 'media',
        content: getRandomTemplate(mediaTemplates), timestamp: new Date(virtualDate.getTime() - 16 * 3600000),
        likes: 300, retweets: 90, comments: 75, verified: mediaPersonality.verified, avatarPath: mediaPersonality.avatar
    };

    return [post, mediaPost];
};

const generatePlayerSpotlightPost = (players: Player[], teamName: string, virtualDate: Date): SocialPost[] => {
    if (players.length === 0) return [];
    const topPlayer = players.sort((a,b) => parseInt(b.rating) - parseInt(a.rating))[0];
    
    const positionPraise: { [key: string]: string } = {
        'QB': 'A true field general and leader of this offense.', 'RB': 'A workhorse out of the backfield. Tough to bring down.',
        'WR': 'A nightmare for defensive backs. Can score from anywhere.', 'TE': 'The ultimate safety blanket and a red zone threat.',
        'DL': 'Lives in the opponent\'s backfield. A true trench warrior.', 'LB': 'The heart and soul of the defense. Sideline to sideline speed.',
        'CB': 'Welcome to Revis Island. Good luck throwing his way.', 'S': 'The commander of the secondary. Lays the boom.',
        'OL': 'The unsung hero paving the way for our offense.', 'K': 'Automatic. Mr. Reliable when we need points.', 'P': 'A weapon in the field position battle.'
    };

    const official = MEDIA_PERSONALITIES.official(teamName);
    return [{
        id: `player-spotlight-${topPlayer.id}`, type: 'player_spotlight', author: official.name, authorHandle: official.handle, authorType: 'official',
        content: `⭐ PLAYER SPOTLIGHT ⭐\n\n${topPlayer.name} | ${topPlayer.position} | ${topPlayer.rating} OVR\n\n${positionPraise[topPlayer.position] || 'A key contributor to our success.'}\n\n#Go${teamName.replace(/\s+/g, '')} #CFB`,
        timestamp: new Date(virtualDate.getTime() - 2 * 86400000), likes: 300, retweets: 80, comments: 50, verified: true
    }];
};

const generateRecruitingPosts = (recruits: Recruit[], teamName: string, virtualDate: Date): SocialPost[] => {
    if (recruits.length === 0) return [];
    const topRecruit = recruits.sort((a,b) => parseInt(b.stars) - parseInt(a.stars))[0];
    const media = MEDIA_PERSONALITIES.recruiting247;
    const stars = '⭐'.repeat(parseInt(topRecruit.stars));
    
    let content = ``;
    if (parseInt(topRecruit.stars) === 5) {
        content = `🚨 BLOCKBUSTER COMMITMENT 🚨\n\n5-star phenom ${topRecruit.name} (${topRecruit.position}) has officially committed to ${teamName}!\n\nA massive, program-altering get for the staff. #Recruiting #BOOM`;
    } else {
        content = `✍️ New Commit! ${teamName} lands a key piece for their future in ${stars} ${topRecruit.position} ${topRecruit.name}.\n\nLove the upside here. A player with a very high ceiling. #Go${teamName.replace(/\s+/g, '')}`;
    }

    return [{
        id: `recruit-buzz-${topRecruit.id}`, type: 'recruiting', author: media.name, authorHandle: media.handle, authorType: 'media',
        content, timestamp: new Date(virtualDate.getTime() - 3 * 86400000),
        likes: 600, retweets: 250, comments: 120, verified: true, avatarPath: media.avatar
    }];
};

const generateFanPost = (teamName: string, lastGame: Game | null, virtualDate: Date): SocialPost[] => {
    let templates: string[];
    if (lastGame?.result === 'Win') {
        templates = [`LET'S GOOOO! What a win! This team is DIFFERENT this year! #Go${teamName.replace(/\s+/g,'')}`, `So proud of this team. They left it all out on the field today. Huge W!`];
    } else if (lastGame?.result === 'Loss') {
        templates = [`Tough loss, but we'll bounce back. Gotta clean up those mistakes for next week. #Believe`, `Frustrating game. We had our chances. On to the next, I still ride with this team.`];
    } else {
        templates = [`Can't wait for the season to start! I think this is our year. #Go${teamName.replace(/\s+/g,'')}`];
    }
    return [{
        id: `fan-post-${Date.now()}`, type: 'tweet', author: "Big CFB Fan", authorHandle: "@CFBFanatic99", authorType: 'fan',
        content: getRandomTemplate(templates), timestamp: new Date(virtualDate.getTime() - 10 * 3600000),
        likes: Math.floor(Math.random() * 80) + 15, retweets: Math.floor(Math.random() * 25) + 5, comments: 10
    }];
};

const SocialMediaHub: React.FC = () => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [filter, setFilter] = useState<'all' | 'news' | 'social' | 'recruiting'>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [rawCurrentYear] = useLocalStorage<number | null>('currentYear', null);

    const dynastyData = useMemo(() => {
        if (rawCurrentYear === null) return null;
        const profile = getCoachProfile();
        return {
            teamName: profile?.schoolName || 'Your Team',
            schedule: getSchedule(rawCurrentYear),
            recruits: getAllRecruits().filter(r => r.recruitedYear === rawCurrentYear),
            players: getPlayers(),
            year: rawCurrentYear
        };
    }, [rawCurrentYear]);

    const generateAllPosts = useCallback(() => {
        if (!dynastyData || dynastyData.teamName === 'Your Team' || isGenerating) return;

        setIsGenerating(true);

        const { teamName, schedule, recruits, players, year } = dynastyData;
        
        // MODIFICATION: Create a virtual "today" based on the dynasty year
        // We'll set it to October 15th of the current dynasty year
        const virtualToday = new Date(year, 9, 15); // Month is 0-indexed, so 9 is October

        const lastCompletedGame = [...schedule].reverse().find(g => g.result !== 'N/A' && g.result !== 'Bye') || null;

        let allGeneratedPosts: SocialPost[] = [];
        
        if (lastCompletedGame) {
            allGeneratedPosts.push(...generateGameRecapPosts(lastCompletedGame, teamName, players, virtualToday));
        }
        
        allGeneratedPosts.push(...generatePlayerSpotlightPost(players, teamName, virtualToday));
        
        if (recruits.length > 0) {
            allGeneratedPosts.push(...generateRecruitingPosts(recruits, teamName, virtualToday));
        }

        allGeneratedPosts.push(...generateFanPost(teamName, lastCompletedGame, virtualToday));
        
        if (allGeneratedPosts.length === 0) {
            const official = MEDIA_PERSONALITIES.official(teamName);
            allGeneratedPosts.push({
                id: `welcome-${Date.now()}`, type: 'news', author: official.name, authorHandle: official.handle, authorType: 'official',
                content: `Let's get this season started! The journey for a championship begins now. #Go${teamName.replace(/\s+/g,'')} #CFB${year - 2000 + 25}`,
                timestamp: virtualToday, likes: 50, retweets: 10, comments: 5, verified: true
            });
        }
        
        setPosts(allGeneratedPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        setIsGenerating(false);

    }, [dynastyData, isGenerating]);

    useEffect(() => {
        generateAllPosts();
    }, [dynastyData, generateAllPosts]);

    const filteredPosts = useMemo(() => {
        if (filter === 'all') return posts;
        return posts.filter(post => {
            if (filter === 'news') return ['game_recap', 'news'].includes(post.type);
            if (filter === 'social') return ['player_tweet', 'player_spotlight'].includes(post.type);
            if (filter === 'recruiting') return post.type === 'recruiting';
            return true;
        });
    }, [posts, filter]);

    const getAuthorAvatarColor = (authorType: string) => ({
        official: 'bg-blue-600', media: 'bg-purple-600', player: 'bg-orange-600', fan: 'bg-gray-600'
    }[authorType] || 'bg-gray-600');
    
    const getTypeIcon = (type: string) => ({
        game_recap: <Trophy className="h-4 w-4" />, recruiting: <Star className="h-4 w-4" />,
        news: <TrendingUp className="h-4 w-4" />, player_spotlight: <Users className="h-4 w-4" />,
        player_tweet: <Users className="h-4 w-4" />,
    }[type] || <MessageCircle className="h-4 w-4" />);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-3"><Flame className="h-8 w-8 text-orange-500" />Team Social Hub</h1>
                <p className="text-muted-foreground">Your dynasty's pulse on social media</p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}><MessageCircle className="h-4 w-4 mr-2" />All</Button>
                <Button variant={filter === 'news' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('news')}><TrendingUp className="h-4 w-4 mr-2" />News</Button>
                <Button variant={filter === 'social' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('social')}><Heart className="h-4 w-4 mr-2" />Social</Button>
                <Button variant={filter === 'recruiting' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('recruiting')}><Star className="h-4 w-4 mr-2" />Recruiting</Button>
                <Button variant="outline" size="sm" onClick={generateAllPosts} disabled={isGenerating}><RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />Refresh</Button>
            </div>
            <div className="space-y-4">
                {isGenerating && posts.length === 0 && <p className="text-center text-muted-foreground">Generating feed...</p>}
                {!isGenerating && filteredPosts.length === 0 && (
                    <Card className="p-8 text-center text-muted-foreground"><MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />No posts yet. Play games to see the feed come to life!</Card>
                )}
                {filteredPosts.map(post => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar className="h-10 w-10">
                                    {post.avatarPath ? (<img src={post.avatarPath} alt="Avatar" className="w-full h-full rounded-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; (target.parentElement as HTMLElement).classList.add(getAuthorAvatarColor(post.authorType)); }} />) : (<AvatarFallback className={getAuthorAvatarColor(post.authorType)}>{post.author.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>)}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-sm">{post.author}</h3>
                                        {post.verified && <img src="/avatars/verified.png" alt="V" className="w-4 w-4" />}
                                        <span className="text-gray-500 text-sm">{post.authorHandle}</span>
                                        <span className="text-gray-400">·</span>
                                        <span className="text-gray-500 text-sm">{post.timestamp.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">{getTypeIcon(post.type)}{post.type.replace('_', ' ')}</div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </div>
                            <div className="mb-4">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground border-t pt-3 -mx-6 px-6">
                                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-blue-500"><MessageCircle className="h-4 w-4" /><span className="text-xs">{post.comments}</span></Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-green-500"><Repeat2 className="h-4 w-4" /><span className="text-xs">{post.retweets}</span></Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-red-500"><Heart className="h-4 w-4" /><span className="text-xs">{post.likes.toLocaleString()}</span></Button>
                                <Button variant="ghost" size="sm" className="hover:text-blue-500"><Share className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default SocialMediaHub;