import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
  isDark: boolean;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ score, isDark }) => {
  const data = [
    {
      name: 'Score',
      value: score,
      fill: score > 80 ? '#06b6d4' : score > 60 ? '#8b5cf6' : '#ef4444', // Cyan -> Violet -> Red
    },
  ];

  const getColor = (val: number) => {
    if (val >= 80) return 'text-cyan-400';
    if (val >= 60) return 'text-violet-400';
    return 'text-red-400';
  };

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-slate-800 opacity-30"></div>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="80%" 
          outerRadius="100%" 
          barSize={10} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'transparent' }}
            dataKey="value"
            cornerRadius={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-5xl font-bold ${getColor(score)} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] font-mono tracking-tighter`}>{score}</span>
      </div>
    </div>
  );
};
