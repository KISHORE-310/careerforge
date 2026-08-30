import React from 'react';
import { Card } from '@/components/ui/Card';
import { ScoreGauge } from '@/components/ai/ScoreGauge';
import { NextActions } from '@/components/shared/NextActions';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold text-gold">Command Center</h1>
        <button className="bg-gold text-obsidian px-6 py-2 rounded-md font-bold">
          Optimize Resume
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-4 p-6 border-gold/20 bg-surface">
          <ScoreGauge score={86} label="Career Readiness" />
        </Card>
        
        <Card className="col-span-8 p-6 bg-surface">
          <h3 className="text-xl mb-4">Algorithmic Matches</h3>
          {/* Matches implementation */}
        </Card>
      </div>

      <NextActions />
    </div>
  );
}