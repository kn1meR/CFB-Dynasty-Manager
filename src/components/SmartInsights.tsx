// src/components/SmartInsights.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Award, Users, X, ChevronRight, Lightbulb } from 'lucide-react';
import { InsightEngine, Insight } from '@/utils/insightEngine';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Player } from '@/types/playerTypes';
import { Game, YearStats } from '@/types/yearRecord';
import { Recruit, Transfer } from '@/types/playerTypes';
import InsightErrorBoundary from './InsightErrorBoundary';

interface SmartInsightsProps {
  limit?: number;
  showHeader?: boolean;
  context?: 'dashboard' | 'full' | 'sidebar';
  // Filter props
  priorityFilter?: 'all' | 'critical' | 'high' | 'medium' | 'low';
  categoryFilter?: 'all' | 'roster' | 'performance' | 'recruiting' | 'season';
  refreshTrigger?: number;
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ 
  limit, 
  showHeader = true, 
  context = 'dashboard',
  priorityFilter = 'all',
  categoryFilter = 'all',
  refreshTrigger = 0
}) => {
  const router = useRouter();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useLocalStorage<string[]>('dismissedInsights', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get data from localStorage
  const [players] = useLocalStorage<Player[]>('players', []);
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allRecruits] = useLocalStorage<Recruit[]>('allRecruits', []);
  const [allTransfers] = useLocalStorage<Transfer[]>('allTransfers', []);

  useEffect(() => {
    const generateInsights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Generating insights with data:', {
          playersCount: players?.length || 0,
          currentYear,
          recruitsCount: allRecruits?.length || 0,
          transfersCount: allTransfers?.length || 0
        });

        // Get current year schedule and stats with comprehensive error handling
        const scheduleKey = `schedule_${currentYear}`;
        const yearStatsKey = `yearStats_${currentYear}`;
        
        let schedule: Game[] = [];
        let yearStats: YearStats = {
          wins: 0,
          losses: 0,
          conferenceWins: 0,
          conferenceLosses: 0,
          pointsScored: 0,
          pointsAgainst: 0,
          playersDrafted: 0,
          conferenceStanding: '',
          bowlGame: '',
          bowlResult: '' as YearStats['bowlResult']
        };

        // Safe data loading with error handling
        try {
          const scheduleData = localStorage.getItem(scheduleKey);
          if (scheduleData) {
            const parsedSchedule = JSON.parse(scheduleData);
            // Validate that it's an array and has valid games
            if (Array.isArray(parsedSchedule)) {
              schedule = parsedSchedule.filter(game => 
                game && typeof game === 'object' && game.opponent !== undefined
              );
            }
          }
          console.log('Loaded schedule:', schedule.length, 'games');
        } catch (error) {
          console.warn('Error loading schedule data:', error);
          schedule = [];
        }

        try {
          const yearStatsData = localStorage.getItem(yearStatsKey);
          if (yearStatsData) {
            const parsedStats = JSON.parse(yearStatsData);
            if (parsedStats && typeof parsedStats === 'object') {
              yearStats = { ...yearStats, ...parsedStats };
            }
          }
          console.log('Loaded year stats:', yearStats);
        } catch (error) {
          console.warn('Error loading year stats:', error);
        }

        // Ensure all data arrays exist and are valid
        const safeData = {
          players: Array.isArray(players) ? players : [],
          schedule: Array.isArray(schedule) ? schedule : [],
          yearStats,
          allRecruits: Array.isArray(allRecruits) ? allRecruits : [],
          allTransfers: Array.isArray(allTransfers) ? allTransfers : []
        };

        console.log('Safe data prepared:', {
          playersCount: safeData.players.length,
          scheduleCount: safeData.schedule.length,
          recruitsCount: safeData.allRecruits.length,
          transfersCount: safeData.allTransfers.length,
          yearStats: safeData.yearStats
        });

        // Generate insights with safe data
        const allInsights = InsightEngine.generateAllInsights(
          safeData.players,
          safeData.schedule,
          safeData.yearStats,
          safeData.allRecruits,
          safeData.allTransfers,
          currentYear
        );

        console.log('Generated insights:', allInsights.length);

        // Filter out dismissed insights
        let activeInsights = allInsights.filter(insight => {
          if (!insight || !insight.id) {
            console.warn('Invalid insight found:', insight);
            return false;
          }
          return !dismissedInsights.includes(insight.id);
        });

        console.log('Active insights after filtering dismissed:', activeInsights.length);

        // Apply priority filter
        if (priorityFilter !== 'all') {
          activeInsights = activeInsights.filter(insight => insight.priority === priorityFilter);
          console.log(`Active insights after priority filter (${priorityFilter}):`, activeInsights.length);
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
          activeInsights = activeInsights.filter(insight => insight.type === categoryFilter);
          console.log(`Active insights after category filter (${categoryFilter}):`, activeInsights.length);
        }

        // Apply limit if specified
        const finalInsights = limit ? 
          activeInsights.slice(0, limit) : activeInsights;
        
        console.log('Final insights:', finalInsights.length);
        setInsights(finalInsights);
        
      } catch (error) {
        console.error('Error generating insights:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate insights');
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [
    players, 
    currentYear, 
    allRecruits, 
    allTransfers, 
    dismissedInsights, 
    limit, 
    priorityFilter, 
    categoryFilter, 
    refreshTrigger
  ]);

  const handleDismissInsight = (insightId: string) => {
    const newDismissed = [...dismissedInsights, insightId];
    setDismissedInsights(newDismissed);
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const handleInsightAction = (action: any) => {
    if (action.type === 'navigate' && action.payload) {
      router.push(action.payload);
    }
  };

  const getInsightIcon = (insight: Insight) => {
    switch (insight.category) {
      case 'roster_gap':
      case 'depth_chart':
        return <Users className="h-5 w-5" />;
      case 'win_streak':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'losing_streak':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'bowl_eligibility':
        return <Award className="h-5 w-5" />;
      case 'season_prediction':
        return <Target className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && <h2 className="text-xl font-semibold">Smart Insights</h2>}
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {showHeader && <h2 className="text-xl font-semibold">Smart Insights</h2>}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  Error Loading Insights
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="mt-2"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8">
        {showHeader && <h2 className="text-xl font-semibold mb-4">Smart Insights</h2>}
        <div className="text-gray-500 dark:text-gray-400">
          <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No insights available right now.</p>
          <p className="text-sm">
            {players.length === 0 ? 
              'Add some players to your roster to start generating insights!' :
              'Keep playing to generate smart recommendations!'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Smart Insights</h2>
          {context === 'dashboard' && insights.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => router.push('/insights')}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {insights.map(insight => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onDismiss={handleDismissInsight}
            onAction={handleInsightAction}
            getIcon={getInsightIcon}
            getPriorityColor={getPriorityColor}
            getPriorityBadgeColor={getPriorityBadgeColor}
          />
        ))}
      </div>
    </div>
  );
};

interface InsightCardProps {
  insight: Insight;
  onDismiss: (id: string) => void;
  onAction: (action: any) => void;
  getIcon: (insight: Insight) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  getPriorityBadgeColor: (priority: string) => string;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  insight, 
  onDismiss, 
  onAction, 
  getIcon, 
  getPriorityColor, 
  getPriorityBadgeColor 
}) => {
  return (
    <InsightErrorBoundary>
      <Card className={`border-l-4 ${getPriorityColor(insight.priority)} transition-all hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getIcon(insight)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${getPriorityBadgeColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()}
                  </Badge>
                  {insight.confidence && (
                    <span className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm">{insight.title}</h3>
              </div>
            </div>
            {insight.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(insight.id)}
                className="flex-shrink-0 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {insight.description}
          </p>
          
          {insight.recommendation && (
            <div className="bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500 mb-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    💡 Recommendation:
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {insight.actions && insight.actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {insight.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction(action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </InsightErrorBoundary>
  );
};

export default SmartInsights;