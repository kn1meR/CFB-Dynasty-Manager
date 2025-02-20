// src/components/Navigation.tsx
"use client";

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CoachProfile from './CoachProfile';
import { ThemeToggle } from './ThemeToggle';

const Navigation: React.FC = memo(() => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Team Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Top 25', path: '/top25' },
    { name: 'Roster', path: '/roster' },
    { name: 'Recruiting', path: '/recruiting' },
    { name: 'Transfers', path: '/transfers' },
    { name: 'Player Stats', path: '/player-stats' },
    { name: 'Season Stats', path: '/records' },
    { name: 'Player Awards', path: '/awards' },
    { name: 'Trophy Case', path: '/trophy-case' },
    //{ name: 'Coach Stats', path: '/coach-stats' },
    { name: 'Tools', path: '/tools' }
  ];

  return (
    <nav className="w-full bg-gray-300 dark:bg-gray-800 text-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${
                    pathname === item.path
                      ? 'border-blue-500 text-blue-900 dark:text-white'
                      : 'border-transparent text-gray-900 dark:text-gray-300 hover:border-gray-300 hover:text-blue-300'
                  } inline-flex items-center px-2 pt-1 border-b-4 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <CoachProfile />
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${
                pathname === item.path
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
