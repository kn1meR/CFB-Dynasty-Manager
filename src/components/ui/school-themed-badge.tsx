// src/components/ui/school-themed-badge.tsx
// School-themed badge component

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SchoolThemedBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export const SchoolThemedBadge: React.FC<SchoolThemedBadgeProps> = ({
  children,
  variant = 'primary',
  className
}) => {
  const variantClasses = {
    primary: "badge-school-primary",
    secondary: "badge-school-secondary",
    accent: "bg-school-accent text-white"
  };

  return (
    <Badge className={cn(variantClasses[variant], className)}>
      {children}
    </Badge>
  );
};