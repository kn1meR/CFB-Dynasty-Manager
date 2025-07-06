// src/components/ui/school-themed-card.tsx  
// Utility component for school-themed cards

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SchoolThemedCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'stat';
  className?: string;
  headerClassName?: string;
}

export const SchoolThemedCard: React.FC<SchoolThemedCardProps> = ({
  children,
  variant = 'primary',
  className,
  headerClassName
}) => {
  const variantClasses = {
    primary: "stat-card-school",
    secondary: "border-school-secondary", 
    accent: "border-school-primary",
    stat: "stat-card-school shadow-lg"
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      {children}
    </Card>
  );
};