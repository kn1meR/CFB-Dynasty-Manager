// src/app/records/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import YearRecordModal from '@/components/YearRecordModal';

const Records: React.FC = () => {
  const currentYear = 2024;
  const years = Array.from({ length: 30 }, (_, i) => currentYear + i);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Season Stats</h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {years.map(year => (
          <Button
            key={year}
            className="w-full h-16 text-lg font-semibold"
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </Button>
        ))}
      </div>

      {selectedYear && (
        <YearRecordModal
          year={selectedYear}
          onClose={() => setSelectedYear(null)}
        />
      )}
    </div>
  );
};

export default Records;
