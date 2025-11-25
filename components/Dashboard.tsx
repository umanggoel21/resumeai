import React from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, Briefcase, Target, Activity, Database, LayoutDashboard } from 'lucide-react';
import { AnalysisResult } from '../types';
import { ScoreChart } from './ScoreChart';

interface DashboardProps {
  data: AnalysisResult;
  isDark: boolean;
  analysisType: 'general' | 'match' | 'builder';
}

export const Dashboard: React.FC<DashboardProps> = ({ data, isDark, analysisType }) => {
  const isMatchMode = analysisType === 'match';

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Top Overview Panel */}
      <div className="bg-[#13141c] border border-slate-800 rounded-lg p-8 mb-8 shadow-lg relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
             <Activity size={300} />
         </div>
         
         <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 relative z-10">
           
           {/* Score Circle */}
           <div className="flex-shrink-0">
              <ScoreChart score={data.overallScore} isDark={isDark} />
           </div>

           {/* Title & Summary */}
           <div className="flex-grow max-w-4xl">
             <div className="flex items-center gap-3 mb-4">
               <div className={`p-2 rounded-md ${isMatchMode ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}>
                 {isMatchMode ? <Target className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
               </div>
               <div>
                  <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Detected Role</div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{data.jobTitleDetected}</h2>
               </div>
             </div>
             
             <div className="bg-[#0B0C10] border border-slate-800 rounded p-4 text-slate-300 leading-relaxed font-light text-sm md:text-base border-l-4 border-l-slate-600">
               {data.summary}
             </div>
           </div>
         </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strengths */}
        <div className="bg-[#13141c] border border-slate-800 rounded-lg flex flex-col hover:border-green-500/30 transition-all duration-300">
          <div className="p-4 border-b border-slate-800 bg-[#181a24] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider font-mono">Key Strengths</h3>
            </div>
            <div className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20">
              {data.strengths.length} FOUND
            </div>
          </div>
          <div className="p-6 flex-grow">
            <ul className="space-y-4">
              {data.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-green-500 flex-shrink-0 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-[#13141c] border border-slate-800 rounded-lg flex flex-col hover:border-yellow-500/30 transition-all duration-300">
          <div className="p-4 border-b border-slate-800 bg-[#181a24] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider font-mono">Missing Keywords</h3>
            </div>
            <div className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/20">
              CRITICAL
            </div>
          </div>
          <div className="p-6 flex-grow">
            <div className="flex flex-wrap gap-2 mb-6">
              {data.missingKeywords.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-[#0B0C10] text-yellow-500 border border-yellow-500/20 text-xs font-mono hover:bg-yellow-500/10 transition-colors cursor-default">
                  {item}
                </span>
              ))}
            </div>
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded text-xs text-slate-400 leading-relaxed">
               <AlertTriangle className="w-3 h-3 inline mr-1 text-yellow-500 mb-0.5" />
               {isMatchMode 
                  ? "These terms appear frequently in the job description but are absent from your profile." 
                  : "Adding these industry-standard terms will likely improve your ATS ranking."}
            </div>
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-[#13141c] border border-slate-800 rounded-lg flex flex-col hover:border-cyan-500/30 transition-all duration-300">
          <div className="p-4 border-b border-slate-800 bg-[#181a24] rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider font-mono">Action Items</h3>
            </div>
             <div className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded border border-cyan-500/20">
              PRIORITY
            </div>
          </div>
          <div className="p-6 flex-grow">
            <ul className="space-y-4">
              {data.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                   <div className="mt-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded bg-[#0B0C10] text-cyan-400 text-[10px] font-mono border border-slate-700 shadow-sm">
                    {i + 1}
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
