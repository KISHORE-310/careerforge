import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { OptimizationSidebar } from '@/components/resume/OptimizationSidebar';

export default function ResumeStudioPage() {
  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-gold">Resume Studio</h1>
          <div className="flex gap-3">
            <Button variant="outline">Save Version</Button>
            <Button variant="primary">Export PDF</Button>
          </div>
        </div>
        <Card className="min-h-[1100px] p-12 bg-white text-black shadow-2xl">
          <ResumeEditor />
        </Card>
      </div>
      <aside className="w-80">
        <OptimizationSidebar />
      </aside>
    </div>
  );
}
