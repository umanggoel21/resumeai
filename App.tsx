
import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { JobSearch } from './components/JobSearch';
import { ChatBot } from './components/ChatBot';
import { analyzeResume } from './services/geminiService';
import { AnalysisResult, FileData } from './types';
import { 
  Loader2, 
  RefreshCw, 
  Target, 
  Briefcase, 
  FileText, 
  ArrowRight, 
  X, 
  PenTool,
  ClipboardList,
  Workflow,
  Gauge,
  Lightbulb,
  Menu,
  Search
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'match' | 'builder' | 'job-search'>('general');
  
  // State
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Job Match specific state
  const [jobDescription, setJobDescription] = useState("");

  // Always dark mode for this design spec
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleTabChange = (tab: 'general' | 'match' | 'builder' | 'job-search') => {
    setActiveTab(tab);
    // Reset results when switching tabs if needed, or keep state. 
    // For this UX, let's clear errors but keep file/result if valid for context, 
    // but usually switching contexts implies a reset.
    setError(null);
  };

  const handleFileSelect = async (selectedFile: FileData) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);

    if (activeTab === 'general') {
      await runAnalysis(selectedFile, undefined);
    }
  };

  const runAnalysis = async (fileToAnalyze: FileData, jobDesc?: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeResume(fileToAnalyze.base64, fileToAnalyze.type, jobDesc);
      setResult(analysis);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to analyze resume. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAnalysis = () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
    runAnalysis(file, jobDescription);
  };

  const handleReset = () => {
    setResult(null);
    setFile(null);
    setError(null);
    setJobDescription("");
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-300 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#13141c] border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-8 bg-cyan-500 rounded-sm"></div>
            <span className="text-xl font-bold text-white tracking-tight">RESUME<span className="text-cyan-500">AI</span></span>
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 px-3">
          <div className="px-3 mb-2 text-xs font-mono text-slate-500 uppercase tracking-widest">Workspace</div>
          
          <button
            onClick={() => handleTabChange('general')}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
              activeTab === 'general'
                ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
            }`}
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            General Analysis
          </button>

          <button
            onClick={() => handleTabChange('match')}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
              activeTab === 'match'
                ? 'bg-violet-500/10 text-violet-400 border-l-2 border-violet-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
            }`}
          >
            <Target className="w-5 h-5 mr-3" />
            Job Fit Check
          </button>

          <button
            onClick={() => handleTabChange('job-search')}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
              activeTab === 'job-search'
                ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
            }`}
          >
            <Search className="w-5 h-5 mr-3" />
            Job Search
          </button>

          <button
            onClick={() => handleTabChange('builder')}
            className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
              activeTab === 'builder'
                ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
            }`}
          >
            <PenTool className="w-5 h-5 mr-3" />
            Resume Builder
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 px-3 py-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             <span className="text-xs font-mono text-slate-500">SYSTEM ONLINE</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1C1E26] to-[#0B0C10]">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-[#13141c]/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center text-sm text-slate-400">
              <span className="font-mono mr-2 opacity-50">// CURRENT MODULE:</span>
              <span className="text-white font-semibold tracking-wide uppercase">
                {activeTab === 'general' && 'Standard Analysis'}
                {activeTab === 'match' && 'Targeted Role Match'}
                {activeTab === 'builder' && 'Document Generator'}
                {activeTab === 'job-search' && 'Live Job Search'}
              </span>
           </div>
           
           {file && !loading && activeTab !== 'builder' && (
             <button 
                onClick={handleReset}
                className="flex items-center text-xs font-medium text-slate-400 hover:text-red-400 transition-colors uppercase tracking-wider px-3 py-1.5 border border-slate-700 hover:border-red-900 rounded bg-[#0B0C10]"
              >
                <RefreshCw className="w-3 h-3 mr-2" /> Reset Session
             </button>
           )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {loading && activeTab !== 'job-search' && (
            <div className="absolute inset-0 z-50 bg-[#0B0C10]/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full"></div>
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-white font-mono tracking-wider">PROCESSING DATA</h2>
                <div className="h-1 w-48 bg-slate-800 rounded-full mt-4 overflow-hidden mx-auto">
                  <div className="h-full bg-cyan-500 animate-progress w-1/2"></div>
                </div>
                <p className="mt-3 text-cyan-500/70 font-mono text-xs uppercase">Running AI Models...</p>
              </div>
            </div>
          )}

          {error && activeTab !== 'job-search' && (
             <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded text-red-400 flex items-center gap-3 max-w-4xl mx-auto">
               <div className="p-2 bg-red-900/40 rounded-full"><X className="w-4 h-4" /></div>
               <p className="text-sm font-medium">{error}</p>
             </div>
          )}

          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            
            {/* Tab Content: General */}
            {activeTab === 'general' && (
              <>
                {!result ? (
                  <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="text-center mb-12">
                      <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Resume Analysis <span className="text-cyan-500">Protocol</span></h1>
                      <p className="text-slate-400 max-w-lg mx-auto text-lg">Upload your document to initiate deep-scan analysis for ATS compatibility and content optimization.</p>
                    </div>

                    {!file ? (
                       <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
                    ) : (
                       <div className="w-full max-w-xl bg-[#13141c] border border-cyan-500/30 rounded-lg p-6 flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium font-mono">{file.name}</h3>
                              <p className="text-xs text-green-400 font-mono uppercase mt-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                Ready to analyze
                              </p>
                            </div>
                          </div>
                          <button onClick={handleClearFile} className="text-slate-500 hover:text-slate-300 p-2 hover:bg-slate-800 rounded transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                       </div>
                    )}

                    {!file && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
                        <div className="bg-[#13141c] border border-slate-800 p-6 rounded-lg hover:border-cyan-500/30 transition-colors group">
                          <Workflow className="w-8 h-8 text-slate-600 group-hover:text-cyan-500 mb-4 transition-colors" />
                          <h4 className="text-white font-bold mb-2">Structure Scan</h4>
                          <p className="text-sm text-slate-500">Evaluates formatting hierarchy and parsing readability.</p>
                        </div>
                        <div className="bg-[#13141c] border border-slate-800 p-6 rounded-lg hover:border-violet-500/30 transition-colors group">
                          <Gauge className="w-8 h-8 text-slate-600 group-hover:text-violet-500 mb-4 transition-colors" />
                          <h4 className="text-white font-bold mb-2">Keyword Match</h4>
                          <p className="text-sm text-slate-500">Identifies industry-standard terms missing from your profile.</p>
                        </div>
                        <div className="bg-[#13141c] border border-slate-800 p-6 rounded-lg hover:border-emerald-500/30 transition-colors group">
                          <Lightbulb className="w-8 h-8 text-slate-600 group-hover:text-emerald-500 mb-4 transition-colors" />
                          <h4 className="text-white font-bold mb-2">Smart Feedback</h4>
                          <p className="text-sm text-slate-500">Generates specific, actionable bullet-point improvements.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Dashboard data={result} isDark={true} analysisType="general" />
                )}
              </>
            )}

            {/* Tab Content: Match */}
            {activeTab === 'match' && (
              <>
                {!result ? (
                   <div className="flex flex-col h-full">
                     <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Job Fit Analysis</h1>
                        <p className="text-slate-400">Compare your profile against specific role requirements.</p>
                     </div>

                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-1">
                        {/* Left Column: Resume */}
                        <div className="flex flex-col bg-[#13141c] border border-slate-800 rounded-lg p-6">
                           <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-mono">01</span>
                                Source Document
                              </h3>
                           </div>
                           
                           <div className="flex-1 flex flex-col justify-center">
                              {!file ? (
                                <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
                              ) : (
                                <div className="bg-[#0B0C10] border border-slate-700 rounded p-4 flex items-center justify-between group hover:border-violet-500/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded text-violet-400">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h3 className="text-white font-medium font-mono text-sm">{file.name}</h3>
                                      <p className="text-xs text-slate-500 mt-1">PDF Document Loaded</p>
                                    </div>
                                  </div>
                                  <button onClick={handleClearFile} className="text-slate-500 hover:text-red-400 p-2">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Right Column: Job Desc */}
                        <div className="flex flex-col bg-[#13141c] border border-slate-800 rounded-lg p-6 relative overflow-hidden">
                           <div className="flex items-center justify-between mb-6 relative z-10">
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-mono">02</span>
                                Target Requirements
                              </h3>
                           </div>

                           <textarea
                              value={jobDescription}
                              onChange={(e) => setJobDescription(e.target.value)}
                              placeholder="PASTE JOB DESCRIPTION HERE..."
                              className="flex-1 bg-[#0B0C10] border border-slate-700 rounded-lg p-5 text-slate-300 placeholder-slate-600 font-mono text-sm leading-relaxed focus:border-violet-500 focus:ring-0 resize-none transition-all z-10"
                              disabled={!file}
                           />
                           
                           <div className="mt-6 flex justify-end z-10">
                              <button
                                onClick={handleMatchAnalysis}
                                disabled={!file || !jobDescription.trim()}
                                className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center gap-2"
                              >
                                INITIALIZE MATCH <ArrowRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                   </div>
                ) : (
                  <Dashboard data={result} isDark={true} analysisType="match" />
                )}
              </>
            )}

            {/* Tab Content: Job Search */}
            {activeTab === 'job-search' && (
              <JobSearch resumeAnalysis={result} />
            )}

            {/* Tab Content: Builder */}
            {activeTab === 'builder' && (
               <ResumeBuilder />
            )}
            
          </div>
        </div>
      </main>
      
      {/* Chat Bot Overlay */}
      <ChatBot />
      
    </div>
  );
};

export default App;
