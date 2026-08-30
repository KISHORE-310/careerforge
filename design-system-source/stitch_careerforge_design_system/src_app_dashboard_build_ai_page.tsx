import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ApplicationAIPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-bold text-gold">Application AI</h1>
        <p className="text-gray-400">Contextual generation for cover letters and messages</p>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-surface border-gold/10 hover:border-gold/30 transition-colors cursor-pointer">
          <h3 className="text-lg font-bold mb-2">Cover Letter</h3>
          <p className="text-sm text-gray-400 mb-4">Tailored to your profile and the specific job description.</p>
          <Button variant="outline" className="w-full">Generate</Button>
        </Card>
        
        <Card className="p-6 bg-surface border-gold/10 hover:border-gold/30 transition-colors cursor-pointer">
          <h3 className="text-lg font-bold mb-2">LinkedIn Message</h3>
          <p className="text-sm text-gray-400 mb-4">Network with recruiters using personalized outreach.</p>
          <Button variant="outline" className="w-full">Generate</Button>
        </Card>

        <Card className="p-6 bg-surface border-gold/10 hover:border-gold/30 transition-colors cursor-pointer">
          <h3 className="text-lg font-bold mb-2">Follow-up Email</h3>
          <p className="text-sm text-gray-400 mb-4">Professional follow-ups after your interview.</p>
          <Button variant="outline" className="w-full">Generate</Button>
        </Card>
      </div>
    </div>
  );
}
