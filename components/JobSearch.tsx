
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Code, Globe, ExternalLink, Loader2, Sparkles, UserCheck, DollarSign, Building2, Monitor, RefreshCw, Bell, Mail, Check, X } from 'lucide-react';
import { searchJobs } from '../services/geminiService';
import { AnalysisResult, JobSearchParams } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface JobSearchProps {
  resumeAnalysis: AnalysisResult | null;
}

export const JobSearch: React.FC<JobSearchProps> = ({ resumeAnalysis }) => {
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    role: '',
    location: '',
    experienceLevel: 'Mid-Level',
    skills: '',
    workMode: 'Any',
    salaryRange: 'Any',
    companySize: 'Any'
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GenerateContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Alert State
  const [showAlertInput, setShowAlertInput] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertActive, setAlertActive] = useState(false);

  // Pre-fill if analysis exists
  useEffect(() => {
    if (resumeAnalysis) {
      setSearchParams(prev => ({
        ...prev,
        role: resumeAnalysis.jobTitleDetected,
        skills: resumeAnalysis.strengths.slice(0, 5).join(', '),
      }));
    }
  }, [resumeAnalysis]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      role: '',
      location: '',
      experienceLevel: 'Mid-Level',
      skills: '',
      workMode: 'Any',
      salaryRange: 'Any',
      companySize: 'Any'
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.role) {
      setError("Job Role is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await searchJobs(searchParams);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Failed to search jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) {
      // In a real app, this would send a request to the backend
      setAlertActive(true);
      setShowAlertInput(false);
    }
  };

  const renderGroundingSources = () => {
    if (!response?.candidates?.[0]?.groundingMetadata?.groundingChunks) return null;

    const chunks = response.candidates[0].groundingMetadata.groundingChunks;
    const webSources = chunks.filter((c: any) => c.web?.uri && c.web?.title);

    if (webSources.length === 0) return null;

    return (
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-500" />
            Direct Application Links
          </h4>
          <span className="text-xs text-slate-500 font-mono">{webSources.length} SOURCES FOUND</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {webSources.map((source: any, i: number) => {
            let hostname = source.web.uri;
            try {
              hostname = new URL(source.web.uri).hostname.replace(/^www\./, '');
            } catch (e) {
              // fallback to raw uri if parsing fails
            }

            return (
              <div 
                key={i} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#181a24] border border-slate-700 rounded-lg hover:border-cyan-500/50 transition-all group gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                    {source.web.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    <span className="truncate opacity-70">{hostname}</span>
                  </div>
                </div>
                
                <a 
                  href={source.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 transition-all whitespace-nowrap shrink-0 gap-2"
                >
                  <span>Apply on {hostname}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple markdown formatter for the text response
  const formatResponseText = (text: string | undefined) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('##')) {
        return <h3 key={i} className="text-xl font-bold text-white mt-6 mb-3">{trimmed.replace(/^##\s+/, '')}</h3>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) { // Basic bold header detection
         return <h4 key={i} className="text-lg font-bold text-cyan-400 mt-4 mb-2">{trimmed.replace(/\*\*/g, '')}</h4>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start ml-2 mb-2 text-slate-300">
            <span className="mr-2 mt-2 w-1.5 h-1.5 bg-cyan-500 rounded-full shrink-0"></span>
            <span>{trimmed.replace(/^[*|-]\s+/, '').replace(/\*\*(.*?)\*\*/g, (match, p1) => p1)}</span>
          </div>
        );
      }
      return <p key={i} className="mb-2 text-slate-300 leading-relaxed">{trimmed.replace(/\*\*(.*?)\*\*/g, (match, p1) => match)}</p>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Job Search</h1>
        <p className="text-slate-400">Find live opportunities tailored to your skills using Google Search grounding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* Left Panel: Search Controls */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="bg-[#13141c] border border-slate-800 rounded-lg p-6">
            
            {resumeAnalysis && (
              <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                 <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Resume Context Active</span>
                 </div>
                 <p className="text-xs text-slate-400">
                    Search optimized for <strong>{resumeAnalysis.jobTitleDetected}</strong> based on your uploaded resume.
                 </p>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                   <Briefcase className="w-3 h-3" /> Role / Job Title
                </label>
                <input
                  type="text"
                  name="role"
                  value={searchParams.role}
                  onChange={handleInputChange}
                  placeholder="e.g. Frontend Developer"
                  className="w-full px-4 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white placeholder-slate-700 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                   <MapPin className="w-3 h-3" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={searchParams.location}
                  onChange={handleInputChange}
                  placeholder="e.g. New York, Remote"
                  className="w-full px-4 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white placeholder-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <UserCheck className="w-3 h-3" /> Experience
                  </label>
                  <select
                    name="experienceLevel"
                    value={searchParams.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white text-sm"
                  >
                    <option value="Internship">Intern</option>
                    <option value="Entry Level">Entry</option>
                    <option value="Mid-Level">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Exec</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <Monitor className="w-3 h-3" /> Work Mode
                  </label>
                  <select
                    name="workMode"
                    value={searchParams.workMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white text-sm"
                  >
                    <option value="Any">Any</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                   <DollarSign className="w-3 h-3" /> Salary Range
                </label>
                <select
                  name="salaryRange"
                  value={searchParams.salaryRange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white text-sm"
                >
                  <option value="Any">Any</option>
                  <option value="Under $50k">Under $50k</option>
                  <option value="$50k - $80k">$50k - $80k</option>
                  <option value="$80k - $120k">$80k - $120k</option>
                  <option value="$120k - $180k">$120k - $180k</option>
                  <option value="$180k+">$180k+</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                   <Building2 className="w-3 h-3" /> Company Size
                </label>
                <select
                  name="companySize"
                  value={searchParams.companySize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white text-sm"
                >
                  <option value="Any">Any</option>
                  <option value="Startup">Startup (1-50)</option>
                  <option value="Mid-Size">Mid-Size (51-1000)</option>
                  <option value="Enterprise">Enterprise (1000+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                   <Code className="w-3 h-3" /> Skills / Keywords
                </label>
                <textarea
                  name="skills"
                  value={searchParams.skills}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="e.g. React, TypeScript, Node.js"
                  className="w-full px-4 py-3 bg-[#0B0C10] border border-slate-700 rounded focus:border-cyan-500 outline-none text-white placeholder-slate-700 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition-all flex items-center justify-center border border-slate-700 group"
                  title="Reset all filters"
                >
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? 'SEARCHING...' : 'FIND JOBS'}
                </button>
              </div>
            </form>

            {/* Job Alert Section */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              {!alertActive ? (
                !showAlertInput ? (
                  <button
                    onClick={() => setShowAlertInput(true)}
                    className="w-full py-3 bg-[#181a24] border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <Bell className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Create Job Alert</span>
                  </button>
                ) : (
                  <form onSubmit={handleAlertSubscribe} className="bg-[#181a24] border border-slate-700 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-3 h-3 text-cyan-500" /> Email Alerts
                      </h4>
                      <button type="button" onClick={() => setShowAlertInput(false)} className="text-slate-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="email"
                      required
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 bg-[#0B0C10] border border-slate-700 rounded text-sm text-white focus:border-cyan-500 outline-none mb-3 placeholder-slate-600"
                    />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase rounded transition-colors shadow-lg shadow-cyan-900/20">
                      Activate Alerts
                    </button>
                  </form>
                )
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                  <div className="p-2 bg-green-500/20 rounded-full text-green-400 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-green-400">Alerts Active</h4>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">Notify: {alertEmail}</p>
                  </div>
                  <button onClick={() => setAlertActive(false)} className="text-slate-600 hover:text-slate-400 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {!response && !loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-slate-800 rounded-lg bg-[#13141c] border-dashed">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                   <Globe className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-300">No Search Results Yet</h3>
                <p className="text-slate-500 max-w-sm mt-2">Enter your criteria or use your resume details to find relevant job openings across the web.</p>
             </div>
          )}

          {loading && (
             <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
                  <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-white animate-pulse">Scanning Job Boards...</h3>
                <p className="text-slate-500 mt-2">Leveraging Google Search Grounding</p>
             </div>
          )}

          {response && !loading && (
            <div className="flex-1 bg-[#13141c] border border-slate-800 rounded-lg p-8 overflow-y-auto shadow-xl scrollbar-thin scrollbar-thumb-slate-700">
              <div className="prose prose-invert max-w-none">
                {formatResponseText(response.text)}
              </div>
              {renderGroundingSources()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
