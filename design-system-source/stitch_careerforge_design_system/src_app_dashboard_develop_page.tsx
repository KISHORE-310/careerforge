import React from 'react';
import { RoadmapTimeline } from '@/components/skills/RoadmapTimeline';
import { SkillGapMatrix } from '@/components/skills/SkillGapMatrix';

export default function SkillIntelligencePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-serif text-3xl font-bold text-gold mb-2">Skill Intelligence</h1>
        <p className="text-gray-400 mb-6">Gap analysis vs. target Senior AI Engineer role</p>
        <SkillGapMatrix />
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-4">Your 30/60/90 Day Roadmap</h2>
        <RoadmapTimeline />
      </section>
    </div>
  );
}
