import React from 'react';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 68 },
  { name: 'Week 3', score: 75 },
  { name: 'Week 4', score: 82 },
  { name: 'Week 5', score: 86 },
];

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-gold">Career Progress</h1>
      
      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-8 p-6 bg-surface h-[400px]">
          <h3 className="text-xl mb-6 font-bold">Readiness Growth</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151310', border: '1px solid #D4AF37' }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Line type="monotone" dataKey="score" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-4 p-6 bg-surface">
          <h3 className="text-xl mb-4 font-bold">Milestones</h3>
          <ul className="space-y-4">
            {[
              { label: 'Profile Optimized', date: '2 days ago', status: 'done' },
              { label: 'First Mock Interview', date: '4 days ago', status: 'done' },
              { label: 'Target Score Reached', date: 'In progress', status: 'active' }
            ].map((m, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${m.status === 'done' ? 'bg-gold' : 'bg-gray-600'}`} />
                <div>
                  <p className="text-sm font-bold">{m.label}</p>
                  <p className="text-xs text-gray-500">{m.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
