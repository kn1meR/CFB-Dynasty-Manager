// src/components/TrophyCase.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import useLocalStorage from '@/hooks/useLocalStorage';
import { notifySuccess, notifyError, MESSAGES } from '@/utils/notification-utils';
import { Trophy, Medal, Star, Crown, Award, Target, Users, Zap, Calendar, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

// Enhanced Trophy interface with simplified categorization
interface Trophy {
  id: number;
  category: 'championship' | 'bowl' | 'conference' | 'rivalry';
  type: string;
  name: string;
  year: number;
  description?: string;
  opponent?: string;
  location?: string;
  significance?: 'High' | 'Medium' | 'Low';
}

// Trophy categories with their types and metadata - simplified to 4 core categories
const TROPHY_CATEGORIES = {
  championship: {
    name: 'National Championships',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    types: [
      'National Championship',
    ]
  },
  conference: {
    name: 'Conference Championships',
    icon: Medal,
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-800 dark:text-green-200',
    types: [
      'Conference Championship',
      'Conference Tournament Championship',
      'Division Title',
      'Regular Season Champion'
    ]
  },
  bowl: {
    name: 'Bowl Games',
    icon: Trophy,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    types: [
    '68 Ventures Bowl',
    'Allstate Sugar Bowl',
    'Art of Sport LA Bowl Hosted By Gronk',
    'AutoZone Liberty Bowl',
    'Bad Boy Mowers Pinstripe bowl',
    'Birmingham Bowl',
    'Boca Raton Bowl',
    'Capital One Orange Bowl',
    'Cheez-It Citrus Bowl',
    'Chick-Fil-A Peach Bowl',
    'Cricket Celebration Bowl',
    'DIRECTV Holiday Bowl',
    'Duke’s Mayo Bowl',
    'Famous Idaho Potato Bowl',
    'GameAbove Sports Bowl',
    'Go Bowling Military Bowl',
    'Goodyear Cotton Bowl Classic',
    'Hawai’i Bowl',
    'IS4S Salute to Veterans Bowl',
    'Isleta New Mexico Bowl',
    'Kinder’s Texas Bowl',
    'Lockheed Martin Armed Forces Bowl',
    'Myrtle Beach Bowl',
    'Outback Bowl',
    'Pop-Tarts Bowl',
    'Radiance Technologies Independence Bowl',
    'Rate Bowl',
    'R+L Carriers New Orleans Bowl',
    'Reliaquest Bowl',
    'Rose Bowl',
    'Scooter’s Coffee Frisco Bowl',
    'Servpro First Responder Bowl',
    'Snoop Dogg Arizona Bowl presented by Gin & Juice by Dre and Snoop',
    'SRS Distribution Las Vegas Bowl',
    'StaffDNA Cure Bowl',
    'Taxpayer Gator Bowl',
    'Tony the Tiger Sun Bowl',
    'Transperfect Music City Bowl',
    'Union Home Mortgage Gasparilla Bowl',
    'Valero Alamo Bowl',
    'VRBO Fiesta Bowl',
    'Wasabi Fenway Bowl',
    'Other Bowl Game'
]

  },
  rivalry: {
    name: 'Rivalry Trophies',
    icon: Target,
    color: 'from-red-400 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    types: [
    'Anniversary Award',
    'Apple Cup',
    'Bayou Bucket',
    'Battle of I-75 Trophy',
    'Bedlam Bell',
    'Beehive Boot',
    'Bronze Boot',
    'Bronze Stalk',
    'Centennial Cup',
    'Chancellor Spurs',
    'Commander-In-Chief Trophy',
    'Commonwealth Cup',
    'Cy-Hawk Trophy',
    'Don Shula Award',
    'Florida Cup',
    'Floyd of Rosedale',
    'FOY-ODK Sportsmanship Trophy',
    'Fremont Cannon',
    'Golden Boot',
    'Golden Cannon',
    'Golden Egg',
    'Golden Hat',
    'Governor\'s Cup (Georgia-GT)',
    'Governor\'s Cup (Kansas-Kansas St)',
    'Governor\'s Cup (Kentucky-Louisville)',
    'Hardee\'s Trophy',
    'Heartland Trophy',
    'Heroes Trophy',
    'Illibuck',
    'Ireland Trophy',
    'Iron Skillet',
    'Jefferson-Eppes Trophy',
    'Jeweled Shillelagh',
    'Keg of Nails',
    'Land of Lincoln Trophy',
    'Legends Trophy',
    'Little Brown Jug',
    'Magnolia Bowl',
    'Mayor\'s Cup',
    'Megaphone Trophy',
    'Michigan MAC Trophy',
    'Milk Can',
    'Oil Can',
    'Old Brass Spittoon',
    'Old Oaken Bucket',
    'Old Wagon Wheel',
    'O\'Rourke-McFadden Trophy',
    'Paddlewheel Trophy',
    'Paniolo Trophy',
    'Paul Bunyan Axe',
    'Paul Bunyan Trophy',
    'Platypus Trophy',
    'Purdue Cannon',
    'Ram-Falcon Trophy',
    'Secretary\'s Trophy',
    'Seminole War Canoe',
    'Shillelagh Trophy (ND-Purdue)',
    'Silver Spade',
    'Stanford Axe',
    'Territorial Cup',
    'Textile Bowl',
    'The Bell',
    'The Bones',
    'The Saddle',
    'Victory Bell (USC-UCLA)',
    'Victory Bell (North Carolina-Duke)',
    'Victory Bell (Miami OH-Cincinnati)',
    'Wagon Wheel'
]

  }
};

const TrophyCase: React.FC = () => {
  const [currentYear] = useLocalStorage<number>('currentYear', new Date().getFullYear());
  const [allTrophies, setAllTrophies] = useLocalStorage<Trophy[]>('allTrophies', []);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddFormExpanded, setIsAddFormExpanded] = useState<boolean>(false); // New state for collapsible form
  const [newTrophy, setNewTrophy] = useState<Omit<Trophy, 'id' | 'year'>>({
    category: 'championship',
    type: 'National Championship',
    name: '',
    description: '',
    opponent: '',
    location: '',
    significance: 'High'
  });
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Migration function to convert old trophy categories to new ones
  const migrateTrophies = (trophies: Trophy[]) => {
    return trophies.map(trophy => {
      // Enhanced migration mapping from old categories/types to new ones
      const migrationMap: Record<string, Trophy['category']> = {
        // Old category names to new category keys
        'National Championship': 'championship',
        'Bowl Game': 'bowl',
        'Conference Championship': 'conference',
        'Rivalry': 'rivalry',

        // Also check trophy type for better mapping
        'Rose Bowl': 'bowl',
        'Allstate Sugar Bowl': 'bowl',
        'Capital One Orange Bowl': 'bowl',
        'VRBO Fiesta Bowl': 'bowl',
        'Goodyear Cotton Bowl Classic': 'bowl',
        'Chick-Fil-A Peach Bowl': 'bowl',
        'Cheez-It Citrus Bowl': 'bowl',
        'Holiday Bowl': 'bowl',
        'Taxpayer Gator Bowl': 'bowl',
        'AutoZone Liberty Bowl': 'bowl',
        'Tony the Tiger Sun Bowl': 'bowl',
        'SRS Distribution Las Vegas Bowl': 'bowl',
        'Lockheed Martin Armed Forces Bowl': 'bowl',
        'Bahamas Bowl': 'bowl',
        'Duke’s Mayo Bowl': 'bowl',
        'Servpro First Responder Bowl': 'bowl',
        'Kinder’s Texas Bowl': 'bowl',
        'Reliaquest Bowl': 'bowl',
        'Outback Bowl': 'bowl',
        'Cricket Celebration Bowl': 'bowl',
        'IS4S Salute to Veterans Bowl': 'bowl',
        'Scooter’s Coffee Frisco Bowl': 'bowl',
        'Boca Raton Bowl': 'bowl',
        'Art of Sport LA Bowl Hosted By Gronk': 'bowl',
        'R+L Carriers New Orleans Bowl': 'bowl',
        'StaffDNA Cure Bowl': 'bowl',
        'Union Home Mortgage Gasparilla Bowl': 'bowl',
        'Myrtle Beach Bowl': 'bowl',
        'Famous Idaho Potato Bowl': 'bowl',
        'Hawai’i Bowl': 'bowl',
        'GameAbove Sports Bowl': 'bowl',
        'Rate Bowl': 'bowl',
        '68 Ventures Bowl': 'bowl',
        'Birmingham Bowl': 'bowl',
        'DIRECTV Holiday Bowl': 'bowl',
        'Wasabi Fenway Bowl': 'bowl',
        'Bad Boy Mowers Pinstripe bowl': 'bowl',
        'Isleta New Mexico Bowl': 'bowl',
        'Pop-Tarts Bowl': 'bowl',
        'Snoop Dogg Arizona Bowl presented by Gin & Juice by Dre and Snoop': 'bowl',
        'Go Bowling Military Bowl': 'bowl',
        'Valero Alamo Bowl': 'bowl',
        'Radiance Technologies Independence Bowl': 'bowl',
        'Transperfect Music City Bowl': 'bowl',

        'College Football Playoff National Championship': 'championship',

        'Conference Tournament Championship': 'conference',
        'Division Title': 'conference',
        'Regular Season Champion': 'conference',

        'The Game Trophy': 'rivalry',
        'Iron Bowl Trophy': 'rivalry',
        'Red River Trophy': 'rivalry',
        'Rivalry Game Winner': 'rivalry',
        'Annual Series Winner': 'rivalry',
        'Crosstown Trophy': 'rivalry',
        'Border War Trophy': 'rivalry',
        'Custom Rivalry Trophy': 'rivalry'
      };

      let newCategory: Trophy['category'] = trophy.category as Trophy['category'];

      // If trophy has old category structure or needs migration
      if (typeof trophy.category === 'string') {
        // First try to map by category
        if (migrationMap[trophy.category]) {
          newCategory = migrationMap[trophy.category];
        }
        // If category doesn't match, try to map by type
        else if (migrationMap[trophy.type]) {
          newCategory = migrationMap[trophy.type];
        }
        // If trophy type contains bowl-related keywords
        else if (trophy.type && trophy.type.toLowerCase().includes('bowl')) {
          newCategory = 'bowl';
        }
        // If trophy type contains championship keywords
        else if (trophy.type && (
          trophy.type.toLowerCase().includes('championship') ||
          trophy.type.toLowerCase().includes('national')
        )) {
          newCategory = 'championship';
        }
        // If trophy type contains conference keywords
        else if (trophy.type && (
          trophy.type.toLowerCase().includes('conference') ||
          trophy.type.toLowerCase().includes('division')
        )) {
          newCategory = 'conference';
        }
        // If trophy type contains rivalry keywords
        else if (trophy.type && (
          trophy.type.toLowerCase().includes('rivalry') ||
          trophy.type.toLowerCase().includes('trophy')
        )) {
          newCategory = 'rivalry';
        }
        // Default fallback - but preserve original if it's already valid
        else if (!TROPHY_CATEGORIES[trophy.category as keyof typeof TROPHY_CATEGORIES]) {
          newCategory = 'championship';
        }
      }

      // Ensure the category is valid, fallback to championship if not
      if (!TROPHY_CATEGORIES[newCategory as keyof typeof TROPHY_CATEGORIES]) {
        newCategory = 'championship';
      }

      return {
        ...trophy,
        category: newCategory,
        // Set default values for new fields if they don't exist
        description: trophy.description || '',
        opponent: trophy.opponent || '',
        location: trophy.location || '',
        significance: trophy.significance || 'High'
      };
    });
  };

  // Apply migration when component loads and update localStorage with migrated data
  React.useEffect(() => {
    const migratedTrophies = migrateTrophies(allTrophies);
    const hasChanged = JSON.stringify(migratedTrophies) !== JSON.stringify(allTrophies);

    if (hasChanged) {
      console.log('Migrating trophies:', {
        original: allTrophies,
        migrated: migratedTrophies
      });
      setAllTrophies(migratedTrophies);
    }
  }, []); // Only run once on mount

  // Use migrated trophies for all operations
  const currentTrophies = migrateTrophies(allTrophies);

  // Helper function to safely get category info
  const getCategoryInfo = (category: string) => {
    return TROPHY_CATEGORIES[category as keyof typeof TROPHY_CATEGORIES] || TROPHY_CATEGORIES.championship;
  };

  // Get trophy counts by category - use currentTrophies
  const getTrophyStats = () => {
    const stats: Record<string, number> = {};
    Object.keys(TROPHY_CATEGORIES).forEach(category => {
      stats[category] = currentTrophies.filter(trophy => trophy.category === category).length;
    });
    stats.total = currentTrophies.length;
    return stats;
  };

  const stats = getTrophyStats();

  // Filter trophies by category - use currentTrophies
  const getFilteredTrophies = () => {
    if (activeCategory === 'all') {
      return [...currentTrophies].sort((a, b) => b.year - a.year);
    }
    return currentTrophies
      .filter(trophy => trophy.category === activeCategory)
      .sort((a, b) => b.year - a.year);
  };

  const addTrophy = () => {
    // --- MODIFICATION START: Ensure the name is set from the type ---
    const finalTrophyName = newTrophy.type; 
    
    if (!finalTrophyName.trim()) {
      notifyError('Please select a trophy type.');
      return;
    }

    const trophy: Trophy = {
      ...newTrophy,
      id: Date.now(),
      year: selectedYear,
      name: finalTrophyName, // Use the selected type as the name
    };
    // --- MODIFICATION END ---

    setAllTrophies([...allTrophies, trophy]);
    setNewTrophy({
      category: 'championship',
      type: 'National Championship',
      name: 'National Championship', // Also reset the name here
      description: '',
      opponent: '',
      location: '',
      significance: 'High'
    });
    setIsAddFormExpanded(false);
    notifySuccess(MESSAGES.SAVE_SUCCESS);
  };

  const removeTrophy = (id: number) => {
    setAllTrophies(allTrophies.filter(trophy => trophy.id !== id));
    notifySuccess('Trophy removed successfully');
  };

  const getTrophyIcon = (category: string, size: string = "h-8 w-8") => {
    const IconComponent = TROPHY_CATEGORIES[category as keyof typeof TROPHY_CATEGORIES]?.icon || Trophy;
    return <IconComponent className={size} />;
  };

  const getTrophyEmoji = (category: string, type: string) => {
    if (category === 'championship') return '👑';
    if (category === 'conference') return '🥇';
    if (category === 'bowl') return '🏆';
    if (category === 'rivalry') return '⚔️';
    return '🏆';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Trophy className="h-12 w-12 text-yellow-600" />
          <div>
            <h1 className="text-4xl font-bold">Dynasty Trophy Case</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Celebrating excellence and achievements throughout your dynasty
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Trophies</div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(TROPHY_CATEGORIES).map(([key, category]) => (
          <Card key={key} className={`bg-gradient-to-br ${category.bgColor} ${category.borderColor}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                {getTrophyIcon(key)}
                <div className="text-2xl font-bold mt-2">{stats[key] || 0}</div>
                <div className={`text-sm ${category.textColor}`}>{category.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collapsible Add New Trophy Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
          >
            <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              {isAddFormExpanded ? (
                <ChevronDown className="h-5 w-5 transition-transform group-hover:scale-110" />
              ) : (
                <ChevronRight className="h-5 w-5 transition-transform group-hover:scale-110" />
              )}
              <Plus className="h-6 w-6" />
              Add New Trophy
              <span className="ml-auto text-sm bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                Year: {selectedYear}
              </span>
            </CardTitle>
          </div>
        </CardHeader>

        {/* Collapsible Content */}
        {isAddFormExpanded && (
          <CardContent className="border-t border-blue-200 dark:border-blue-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Category</label>
                <Select
                  value={newTrophy.category}
                  onValueChange={(value: keyof typeof TROPHY_CATEGORIES) => {
                    const categoryTypes = TROPHY_CATEGORIES[value].types;
                    // --- MODIFICATION: Set name along with type ---
                    const newType = categoryTypes[0];
                    setNewTrophy({
                      ...newTrophy,
                      category: value,
                      type: newType,
                      name: newType, // Automatically set the name
                    });
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TROPHY_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {getTrophyIcon(key, "h-4 w-4")}
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Trophy Name</label>
                <Select
                  value={newTrophy.type}
                  onValueChange={(value) => setNewTrophy({ ...newTrophy, type: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TROPHY_CATEGORIES[newTrophy.category as keyof typeof TROPHY_CATEGORIES].types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Significance</label>
                <Select
                  value={newTrophy.significance}
                  onValueChange={(value: 'High' | 'Medium' | 'Low') => setNewTrophy({ ...newTrophy, significance: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* --- MODIFICATION START: Relabel Description to Score --- */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Score (Optional)</label>
                <Input
                  value={newTrophy.description}
                  onChange={(e) => setNewTrophy({ ...newTrophy, description: e.target.value })}
                  placeholder="e.g., 34-17"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Opponent (Optional)</label>
                <Input
                  value={newTrophy.opponent}
                  onChange={(e) => setNewTrophy({ ...newTrophy, opponent: e.target.value })}
                  placeholder="Defeated opponent"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200">Location (Optional)</label>
                <Input
                  value={newTrophy.location}
                  onChange={(e) => setNewTrophy({ ...newTrophy, location: e.target.value })}
                  placeholder="Game/event location"
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Adding to {selectedYear} season
                </span>
              </div>
              <Button onClick={addTrophy} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Trophy
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trophy Display Section */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </div>
          </TabsTrigger>
          {Object.entries(TROPHY_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <div className="flex items-center gap-2">
                {getTrophyIcon(key, "h-4 w-4")}
                <span className="hidden md:inline">{category.name.split(' ')[0]}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Trophies Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Trophies ({stats.total})</h2>
          </div>

          <ScrollArea className="h-[600px] p-1"> {/* MODIFICATION: Added padding for scrollbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredTrophies().map(trophy => {
                const categoryInfo = getCategoryInfo(trophy.category);
                return (
                  <Card key={trophy.id} className={`hover:shadow-lg transition-shadow ${categoryInfo.bgColor} ${categoryInfo.borderColor}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getTrophyEmoji(trophy.category, trophy.type)}
                          </div>
                          <div>
                            <Badge variant="secondary" className={`${categoryInfo.textColor} bg-white dark:bg-gray-800`}>
                              {categoryInfo.name}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">{trophy.type}</div>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeTrophy(trophy.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h3 className={`font-bold text-lg ${categoryInfo.textColor}`}>{trophy.name}</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{trophy.year}</span>
                          {trophy.significance && (
                            <Badge
                              variant={trophy.significance === 'High' ? 'default' : 'secondary'}
                              className="ml-auto"
                            >
                              {trophy.significance}
                            </Badge>
                          )}
                        </div>

                        {trophy.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{trophy.description}</p>
                        )}

                        {trophy.opponent && (
                          <div className="text-sm">
                            <span className="font-medium">vs. </span>
                            <span className={categoryInfo.textColor}>{trophy.opponent}</span>
                          </div>
                        )}

                        {trophy.location && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            📍 {trophy.location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {getFilteredTrophies().length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No trophies found</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first trophy to get started!</p>
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Individual Category Tabs */}
        {Object.entries(TROPHY_CATEGORIES).map(([categoryKey, categoryInfo]) => (
          <TabsContent key={categoryKey} value={categoryKey} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTrophyIcon(categoryKey, "h-8 w-8")}
                <div>
                  <h2 className="text-2xl font-bold">{categoryInfo.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stats[categoryKey]} {stats[categoryKey] === 1 ? 'trophy' : 'trophies'} earned
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px] p-1"> {/* MODIFICATION: Added padding for scrollbar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTrophies
                  .filter(trophy => trophy.category === categoryKey)
                  .sort((a, b) => b.year - a.year)
                  .map(trophy => {
                    const categoryInfo = getCategoryInfo(trophy.category);
                    return (
                      <Card key={trophy.id} className={`hover:shadow-lg transition-shadow ${categoryInfo.bgColor} ${categoryInfo.borderColor}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">
                                {getTrophyEmoji(trophy.category, trophy.type)}
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">{trophy.type}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {trophy.year}
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => removeTrophy(trophy.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <h3 className={`font-bold text-xl ${categoryInfo.textColor}`}>{trophy.name}</h3>

                            {trophy.significance && (
                              <Badge
                                variant={trophy.significance === 'High' ? 'default' : 'secondary'}
                                className="inline-flex"
                              >
                                {trophy.significance} Significance
                              </Badge>
                            )}

                            {trophy.description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg">
                                {trophy.description}
                              </p>
                            )}

                            <div className="space-y-2">
                              {trophy.opponent && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Target className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">Defeated:</span>
                                  <span className={categoryInfo.textColor}>{trophy.opponent}</span>
                                </div>
                              )}

                              {trophy.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <span>📍</span>
                                  <span>{trophy.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {currentTrophies.filter(trophy => trophy.category === categoryKey).length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    {getTrophyIcon(categoryKey, "h-12 w-12 mx-auto mb-3 text-gray-400")}
                    <p className="text-gray-500 dark:text-gray-400">No {categoryInfo.name.toLowerCase()} yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add your first {categoryInfo.name.toLowerCase().slice(0, -1)} to get started!</p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TrophyCase;