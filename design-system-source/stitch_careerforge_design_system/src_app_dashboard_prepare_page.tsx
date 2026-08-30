import React from 'react';
import { InterviewCanvas } from '@/components/interview/InterviewCanvas';
import { InterviewFeedback } from '@/components/interview/InterviewFeedback';

export default function InterviewLabPage() {
  return (
    <div className="grid grid-cols-12 gap-8 h-full">
      <div className="col-span-8 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gold">Interview Lab</h1>
            <p className="text-gray-400">AI-Simulated Behavioral & Technical Prep</p>
          </div>
        </div>
        <InterviewCanvas />
      </div>
      <div className="col-span-4">
        <InterviewFeedback />
      </div>
    </div>
  );
}
