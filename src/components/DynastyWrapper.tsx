// src/components/DynastyWrapper.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useDynasty } from '@/contexts/DynastyContext';
import DynastyLaunch from '@/components/DynastyLaunch';
import Navigation from '@/components/Navigation';
import { toast } from 'react-hot-toast';

interface DynastyWrapperProps {
  children: React.ReactNode;
}

const DynastyWrapper: React.FC<DynastyWrapperProps> = ({ children }) => {
  const { currentDynastyId, isDynastyLoaded, setCurrentDynastyId, saveDynastyData } = useDynasty();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDynastySelected = (dynastyId: string) => {
    setCurrentDynastyId(dynastyId);
  };

  const handleReturnToLaunch = () => {
    if (currentDynastyId) {
      saveDynastyData();
      toast.success('Dynasty progress saved');
    }
    setCurrentDynastyId(null);
  };

  const handleManualSave = () => {
    if (currentDynastyId) {
      saveDynastyData();
      toast.success('Dynasty saved successfully');
    }
  };

  if (!isClient) {
    return null;
  }

  if (!isDynastyLoaded || !currentDynastyId) {
    return <DynastyLaunch onDynastySelected={handleDynastySelected} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        onReturnToLaunch={handleReturnToLaunch}
        onManualSave={handleManualSave}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-300 dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p>© CFB25 Dynasty Manager</p>
        </div>
      </footer>
    </div>
  );
};

export default DynastyWrapper;