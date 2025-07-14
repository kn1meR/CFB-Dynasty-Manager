// src/components/Navigation.tsx
"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CoachProfile from './CoachProfile';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Home, Save } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface NavigationProps {
  onReturnToLaunch?: () => void;
  onManualSave?: () => void;
}

const Navigation: React.FC<NavigationProps> = memo(({ onReturnToLaunch, onManualSave }) => {
  const pathname = usePathname();

  const handleSaveAndExit = () => {
    // 1. Call the existing manual save function
    if (onManualSave) {
      onManualSave(); 
    }

    // 2. Execute the navigation function
    if (onReturnToLaunch) {
      onReturnToLaunch();
    }
  };

  const navItems = [
    { name: 'Team Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Top 25', path: '/top25' },
    { name: 'Roster', path: '/roster' },
    { name: 'Recruiting', path: '/recruiting' },
    { name: 'Transfers', path: '/transfers' },
    { name: 'Player Stats', path: '/player-stats' },
    { name: 'Player Awards', path: '/awards' },
    { name: 'Season History', path: '/records' },
    { name: 'Trophy Case', path: '/trophy-case' },
    { name: 'Social Media', path: '/social' },
    { name: 'Tools', path: '/tools' }
  ];

  return (
    <nav className="w-full bg-gray-300 dark:bg-gray-800 text-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Home Button */}
          <div className="flex items-center">
            {onReturnToLaunch && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2"
                  title="Return to Dynasty Selection"
                >
                  <Home className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Return to Main Menu?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Would you like to save your current progress before returning to the dynasty selection screen? 
                    Any unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSaveAndExit}>
                    Save & Exit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          </div>
          
          {/* Center - Navigation Items */}
          <div className="hidden sm:flex sm:space-x-6 flex-1 justify-center">
            {navItems.map((item) => {
              // *** THE FIX IS HERE ***
              // Added a null check for `pathname` before calling .startsWith()
              const isActive = pathname ? 
                (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)) 
                : false;
              
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-900 dark:text-white'
                      : 'border-transparent text-gray-900 dark:text-gray-300 hover:border-gray-300 hover:text-blue-300'
                  } inline-flex items-center px-2 pt-1 border-b-4 text-sm font-medium transition-colors`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Right Side - Coach Profile, Save Button, Theme Toggle */}
          <div className="flex items-center">
            <CoachProfile />
            
            <div className="h-6 w-px bg-gray-400 dark:bg-gray-600 mx-3"></div>
            
            {onManualSave && (
              <>
                <Button
                  onClick={onManualSave}
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                
                <div className="h-6 w-px bg-gray-400 dark:bg-gray-600 mx-3"></div>
              </>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
