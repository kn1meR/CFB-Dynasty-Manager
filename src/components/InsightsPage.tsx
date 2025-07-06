// src/components/InsightsPage.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import SmartInsights from '@/components/SmartInsights';
import { Brain, Filter, RefreshCw } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [category, setCategory] = useState<'all' | 'roster' | 'performance' | 'recruiting' | 'season'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Smart Insights</h1>
            <p className="text-muted-foreground">AI-powered recommendations for your dynasty</p>
          </div>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filter Insights</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Level</label>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 text-white">Critical</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-600 text-white">High</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-600 text-white">Medium</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white">Low</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roster">Roster Management</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="season">Season Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div key={refreshKey}>
        <SmartInsights 
          showHeader={false} 
          context="full"
          priorityFilter={filter}
          categoryFilter={category}
          refreshTrigger={refreshKey}
        />
      </div>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How Smart Insights Work
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  Smart Insights analyzes your dynasty data to provide personalized recommendations:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Roster Analysis:</strong> Identifies depth chart gaps and graduation impacts</li>
                  <li><strong>Performance Tracking:</strong> Monitors win/loss trends and bowl eligibility</li>
                  <li><strong>Recruiting Intelligence:</strong> Suggests position needs and class balance</li>
                  <li><strong>Season Predictions:</strong> Projects outcomes based on current performance</li>
                </ul>
                <p className="mt-3">
                  Insights are updated in real-time as you add games, players, and recruiting classes.
                  Dismissed insights won't show again unless the situation changes significantly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPage;