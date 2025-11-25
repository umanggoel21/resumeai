import React, { useState } from 'react';
import { 
  PenTool, Loader2, Download, Copy, ChevronLeft, Check, 
  FilePlus, Wand2, User, Briefcase, GraduationCap, Cpu, 
  Target, LayoutTemplate, FileText, Layout, Type, Columns,
  Globe, Linkedin
} from 'lucide-react';
import { ResumeBuilderInputs, GeneratedResume } from '../types';
import { generateResume } from '../services/geminiService';

type TemplateId = 'modern' | 'executive' | 'sidebar' | 'minimalist' | 'bold';

interface TemplateOption {
  id: TemplateId;
  name: string;
  icon: React.ElementType;
  description: string;
  previewClass: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern Tech',
    icon: Layout,
    description: 'Clean sans-serif design with cyan accents. Ideal for product, tech, and creative roles.',
    previewClass: 'border-cyan-500'
  },
  {
    id: 'executive',
    name: 'Executive Serif',
    icon: Type,
    description: 'Traditional serif typography with authoritative centered layout. Best for legal and executive roles.',
    previewClass: 'border-slate-500'
  },
  {
    id: 'sidebar',
    name: 'Split Column',
    icon: Columns,
    description: 'Space-efficient two-column structure. Highlights skills and education alongside experience.',
    previewClass: 'border-violet-500'
  },
  {
    id: 'minimalist',
    name: 'Pure Minimalist',
    icon: FileText,
    description: 'High-contrast, black & white layout. Maximizes readability for academic and research positions.',
    previewClass: 'border-zinc-400'
  },
  {
    id: 'bold',
    name: 'Bold Header',
    icon: LayoutTemplate,
    description: 'Distinctive dark header block. Creates strong visual impact for sales and marketing professionals.',
    previewClass: 'border-blue-600'
  }
];

export const ResumeBuilder: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'input' | 'preview'>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  
  // Form State
  const [formData, setFormData] = useState<ResumeBuilderInputs>({
    fullName: '',
    targetRole: '',
    experience: '',
    skills: '',
    education: ''
  });

  // Result State
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.targetRole || !formData.experience) {
      setError("Please fill in at least Name, Target Role, and Experience.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateResume(formData);
      setResume(result);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || "Failed to generate resume.");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = () => {
    if (!resume) return;

    const markdown = `
# ${resume.fullName}
## ${resume.professionalTitle}
${resume.contactInfoPlaceholder}

### Professional Summary
${resume.summary}

### Experience
${resume.experience.map(exp => `
**${exp.role}** | ${exp.company}
_${exp.duration}_
${exp.achievements.map(ach => `- ${ach}`).join('\n')}
`).join('\n')}

### Skills
${resume.skills.join(', ')}

### Education
${resume.education.map(edu => `
**${edu.degree}**
${edu.school} - ${edu.year}
`).join('\n')}
    `.trim();

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.fullName.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = () => {
    if (!resume) return;
    
    const text = `
${resume.fullName}
${resume.professionalTitle}

SUMMARY
${resume.summary}

EXPERIENCE
${resume.experience.map(exp => `${exp.role} at ${exp.company} (${exp.duration})\n${exp.achievements.map(a => `• ${a}`).join('\n')}`).join('\n\n')}

SKILLS
${resume.skills.join(', ')}

EDUCATION
${resume.education.map(edu => `${edu.degree}, ${edu.school} (${edu.year})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderResumePreview = () => {
    if (!resume) return null;

    // --- TEMPLATE: MODERN TECH (Default) ---
    if (selectedTemplate === 'modern') {
      return (
        <div className="bg-white text-slate-900 w-full max-w-[850px] min-h-[1100px] shadow-2xl p-12 md:p-16 font-sans leading-relaxed">
          {/* Header */}
          <div className="border-b-2 border-cyan-600 pb-6 mb-8">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2 text-slate-900">{resume.fullName}</h1>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center text-cyan-700">
              <h2 className="text-lg font-bold tracking-wide">{resume.professionalTitle}</h2>
              <p className="text-sm font-mono mt-1 md:mt-0">{resume.contactInfoPlaceholder}</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3 border-b border-slate-200 pb-1">Professional Summary</h3>
              <p className="text-slate-700 text-justify">{resume.summary}</p>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-4 border-b border-slate-200 pb-1">Professional Experience</h3>
              <div className="space-y-6">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">{exp.role}</h4>
                      <span className="text-slate-500 text-sm font-semibold font-mono">{exp.duration}</span>
                    </div>
                    <div className="text-cyan-700 font-medium mb-2">{exp.company}</div>
                    <ul className="space-y-1.5 text-slate-700">
                      {exp.achievements.map((ach, j) => (
                        <li key={j} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-cyan-500">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <section className="md:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3 border-b border-slate-200 pb-1">Core Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200 uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3 border-b border-slate-200 pb-1">Education</h3>
                <div className="space-y-4">
                  {resume.education.map((edu, i) => (
                    <div key={i}>
                      <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                      <div className="text-slate-600 text-xs">{edu.school}</div>
                      <div className="text-slate-400 text-xs font-mono mt-0.5">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      );
    }

    // --- TEMPLATE: EXECUTIVE SERIF ---
    if (selectedTemplate === 'executive') {
      return (
         <div className="bg-[#fcfcfc] text-slate-900 w-full max-w-[850px] min-h-[1100px] shadow-2xl p-12 md:p-16 font-serif leading-relaxed">
           {/* Centered Header */}
           <div className="text-center mb-10 border-b border-slate-300 pb-8">
             <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-wide">{resume.fullName}</h1>
             <p className="text-lg text-slate-600 italic mb-2">{resume.professionalTitle}</p>
             <p className="text-sm text-slate-500 font-sans">{resume.contactInfoPlaceholder}</p>
           </div>

           <div className="space-y-8">
              <section>
                 <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-300 pb-2">Executive Profile</h3>
                 <p className="text-slate-700 text-center italic max-w-2xl mx-auto">{resume.summary}</p>
              </section>

              <section>
                <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-800 mb-6 border-b border-slate-300 pb-2">Experience</h3>
                <div className="space-y-8">
                   {resume.experience.map((exp, i) => (
                     <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                           <h4 className="font-bold text-lg text-slate-900">{exp.company}</h4>
                           <span className="text-slate-600 text-sm font-sans">{exp.duration}</span>
                        </div>
                        <div className="text-slate-800 font-semibold mb-3 italic">{exp.role}</div>
                        <ul className="list-disc list-outside ml-5 space-y-1 text-slate-700 text-sm md:text-base">
                           {exp.achievements.map((ach, j) => (
                              <li key={j}>{ach}</li>
                           ))}
                        </ul>
                     </div>
                   ))}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-12">
                 <section>
                    <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-300 pb-2">Expertise</h3>
                    <div className="text-center text-sm text-slate-700 leading-7">
                       {resume.skills.join(' • ')}
                    </div>
                 </section>
                 <section>
                    <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-300 pb-2">Credentials</h3>
                     <div className="space-y-3 text-center">
                      {resume.education.map((edu, i) => (
                        <div key={i}>
                          <div className="font-bold text-slate-900 text-sm">{edu.degree}</div>
                          <div className="text-slate-600 text-sm italic">{edu.school}, {edu.year}</div>
                        </div>
                      ))}
                    </div>
                 </section>
              </div>
           </div>
         </div>
      );
    }

    // --- TEMPLATE: SIDEBAR SPLIT ---
    if (selectedTemplate === 'sidebar') {
       return (
         <div className="bg-white text-slate-900 w-full max-w-[850px] min-h-[1100px] shadow-2xl font-sans flex">
            {/* Left Sidebar */}
            <div className="w-1/3 bg-slate-900 text-white p-8 flex flex-col gap-8">
               <div className="mt-8">
                  <h1 className="text-3xl font-bold leading-tight mb-4">{resume.fullName}</h1>
                  <p className="text-violet-400 font-medium text-lg">{resume.professionalTitle}</p>
               </div>

               <div className="text-sm text-slate-400 border-t border-slate-800 pt-4">
                  {resume.contactInfoPlaceholder}
               </div>

               <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Education</h3>
                  <div className="space-y-4">
                    {resume.education.map((edu, i) => (
                      <div key={i}>
                        <div className="font-bold text-white text-sm">{edu.degree}</div>
                        <div className="text-slate-400 text-xs">{edu.school}</div>
                        <div className="text-slate-500 text-xs mt-1">{edu.year}</div>
                      </div>
                    ))}
                  </div>
               </div>

               <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">Skills</h3>
                  <ul className="space-y-2">
                     {resume.skills.map((skill, i) => (
                        <li key={i} className="text-sm text-slate-300 border-l-2 border-slate-700 pl-3">
                           {skill}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Right Content */}
            <div className="w-2/3 p-10 bg-white">
               <section className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Profile</h3>
                  <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
               </section>

               <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Experience</h3>
                  <div className="space-y-8">
                     {resume.experience.map((exp, i) => (
                        <div key={i}>
                           <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-bold text-slate-900 text-lg">{exp.role}</h4>
                              <span className="text-slate-500 text-xs font-mono bg-slate-100 px-2 py-1 rounded">{exp.duration}</span>
                           </div>
                           <div className="text-violet-700 font-medium mb-3 text-sm">{exp.company}</div>
                           <ul className="space-y-2 text-slate-600 text-sm">
                              {exp.achievements.map((ach, j) => (
                                 <li key={j} className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 bg-violet-400 rounded-full flex-shrink-0"></span>
                                    <span className="leading-relaxed">{ach}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </div>
               </section>
            </div>
         </div>
       );
    }

    // --- TEMPLATE: MINIMALIST ---
    if (selectedTemplate === 'minimalist') {
      return (
        <div className="bg-white text-black w-full max-w-[850px] min-h-[1100px] shadow-2xl p-12 md:p-16 font-sans text-sm leading-relaxed">
          {/* Minimalist Header */}
          <div className="border-b-4 border-black pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">{resume.fullName}</h1>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <h2 className="text-base font-bold uppercase tracking-wide">{resume.professionalTitle}</h2>
              <p className="text-xs mt-1 md:mt-0 font-mono">{resume.contactInfoPlaceholder}</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-widest">Professional Summary</h3>
              <p className="text-justify leading-7">{resume.summary}</p>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase border-b border-black mb-4 pb-1 tracking-widest">Professional Experience</h3>
              <div className="space-y-6">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-base">{exp.role}</h4>
                      <span className="text-xs font-bold font-mono">{exp.duration}</span>
                    </div>
                    <div className="italic mb-2">{exp.company}</div>
                    <ul className="space-y-1 list-disc list-outside ml-4 text-slate-800">
                      {exp.achievements.map((ach, j) => (
                        <li key={j}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
               <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-widest">Skills & Competencies</h3>
               <div className="text-justify leading-6">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="inline-block after:content-['•'] after:mx-2 after:text-slate-400 last:after:content-['']">
                      {skill}
                    </span>
                  ))}
               </div>
            </section>

            <section>
               <h3 className="text-sm font-bold uppercase border-b border-black mb-3 pb-1 tracking-widest">Education</h3>
               <div className="space-y-2">
                 {resume.education.map((edu, i) => (
                   <div key={i} className="flex justify-between">
                     <div><span className="font-bold">{edu.degree}</span>, {edu.school}</div>
                     <div className="font-mono text-xs pt-1">{edu.year}</div>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        </div>
      );
    }

    // --- TEMPLATE: BOLD HEADER ---
    if (selectedTemplate === 'bold') {
      return (
        <div className="bg-white text-slate-800 w-full max-w-[850px] min-h-[1100px] shadow-2xl font-sans">
           {/* Dark Header Area */}
           <div className="bg-slate-900 text-white p-12 md:p-14">
              <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{resume.fullName}</h1>
              <p className="text-blue-400 font-medium text-lg mb-6">{resume.professionalTitle}</p>
              
              <div className="flex flex-wrap gap-6 text-sm text-slate-400 border-t border-slate-800 pt-6">
                 <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> {resume.contactInfoPlaceholder}</span>
              </div>
           </div>
           
           <div className="p-12 md:p-14 space-y-10">
               <section>
                  <h3 className="text-blue-700 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                     <User className="w-4 h-4" /> Professional Profile
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{resume.summary}</p>
               </section>

               <section>
                  <h3 className="text-blue-700 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                     <Briefcase className="w-4 h-4" /> Work History
                  </h3>
                  <div className="space-y-8 border-l-2 border-slate-100 pl-6 ml-2">
                     {resume.experience.map((exp, i) => (
                        <div key={i} className="relative">
                           <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-600"></div>
                           <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-bold text-slate-900 text-xl">{exp.role}</h4>
                           </div>
                           <div className="text-slate-500 font-medium mb-3 flex justify-between">
                              <span>{exp.company}</span>
                              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{exp.duration}</span>
                           </div>
                           <ul className="space-y-2 text-slate-600">
                              {exp.achievements.map((ach, j) => (
                                 <li key={j}>{ach}</li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                   <section>
                      <h3 className="text-blue-700 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                         <Cpu className="w-4 h-4" /> Technical Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                         {resume.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-700 text-sm font-medium rounded">
                               {skill}
                            </span>
                         ))}
                      </div>
                   </section>
                   <section>
                      <h3 className="text-blue-700 font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                         <GraduationCap className="w-4 h-4" /> Education
                      </h3>
                      <div className="space-y-4">
                         {resume.education.map((edu, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded border border-slate-100">
                               <div className="font-bold text-slate-900">{edu.degree}</div>
                               <div className="text-slate-500 text-sm">{edu.school}</div>
                               <div className="text-slate-400 text-xs mt-1">{edu.year}</div>
                            </div>
                         ))}
                      </div>
                   </section>
               </div>
           </div>
        </div>
      )
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-fade-in">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white font-mono tracking-widest">GENERATING</h2>
        <p className="text-cyan-500 font-mono text-sm mt-2 uppercase">Constructing Document...</p>
      </div>
    );
  }

  // Landing View
  if (step === 'landing') {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-center mb-16">
             <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
                <PenTool className="w-10 h-10 text-cyan-400" />
             </div>
             <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Resume Generator</h2>
             <p className="text-slate-400 max-w-md mx-auto">Generate ATS-optimized content using structured data input.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
             <button 
              onClick={() => setStep('input')}
              className="group bg-[#13141c] border border-slate-800 hover:border-cyan-500 rounded-lg p-8 text-left transition-all duration-300 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FilePlus size={100} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Manual Input</h3>
                   <p className="text-sm text-slate-500 mb-6">Enter your details into structured fields.</p>
                   <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest border-b border-cyan-500 pb-1">Start Process &rarr;</span>
                </div>
             </button>

             <button 
              onClick={() => setStep('input')}
              className="group bg-[#13141c] border border-slate-800 hover:border-violet-500 rounded-lg p-8 text-left transition-all duration-300 relative overflow-hidden"
             >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <LayoutTemplate size={100} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">Import Data</h3>
                   <p className="text-sm text-slate-500 mb-6">Paste raw text to organize automatically.</p>
                   <span className="text-xs font-mono text-violet-500 uppercase tracking-widest border-b border-violet-500 pb-1">Import Text &rarr;</span>
                </div>
             </button>
          </div>
       </div>
    )
  }

  // Preview View
  if (step === 'preview' && resume) {
    return (
      <div className="animate-fade-in h-full flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 bg-[#13141c] border border-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setStep('input')}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-[#0B0C10] border border-slate-700 hover:border-slate-500 rounded transition-all group relative"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Editor
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                Return to form inputs
              </span>
            </button>
            <div className="h-8 w-px bg-slate-800 hidden lg:block"></div>
            <span className="text-sm text-slate-500 font-mono uppercase hidden lg:block">
              Template: <span className="text-white">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
            </span>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center px-5 py-2 text-sm font-bold text-slate-300 bg-[#0B0C10] border border-slate-700 rounded hover:bg-slate-800 transition-colors group relative"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2 group-hover:text-white" />}
              {copied ? 'COPIED' : 'COPY TEXT'}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                Copy raw text to clipboard
              </span>
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex items-center px-5 py-2 text-sm font-bold text-[#0B0C10] bg-cyan-500 hover:bg-cyan-400 rounded shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all group relative"
            >
              <Download className="w-4 h-4 mr-2" />
              DOWNLOAD .MD
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-md border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                Save as Markdown file
              </span>
            </button>
          </div>
        </div>

        {/* Resume Preview - Document Container */}
        <div className="flex-grow overflow-hidden bg-[#0B0C10] rounded-lg border border-slate-800 relative">
           <div className="absolute inset-0 overflow-y-auto p-8 md:p-12 flex justify-center">
              {renderResumePreview()}
           </div>
        </div>
      </div>
    );
  }

  // Input Form
  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
         <div className="flex items-center">
            <button onClick={() => setStep('landing')} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors mr-4">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h2>
                <p className="text-slate-500 text-sm">Complete industry-standard fields to generate your resume.</p>
            </div>
         </div>
         <div className="text-xs text-slate-500 font-mono uppercase tracking-widest border border-slate-800 px-3 py-1 rounded">Phase 1 of 2</div>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-8 pb-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider font-mono">
                <User className="w-3 h-3" /> FULL NAME
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#13141c] border border-slate-700 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-slate-700 font-mono text-sm"
                placeholder="e.g. JOHN DOE"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider font-mono">
                 <Target className="w-3 h-3" /> TARGET ROLE
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#13141c] border border-slate-700 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-slate-700 font-mono text-sm"
                placeholder="e.g. SENIOR SOFTWARE ENGINEER"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider font-mono">
              <Briefcase className="w-3 h-3" /> EXPERIENCE
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                rows={8}
                className="relative w-full px-4 py-4 bg-[#13141c] border border-slate-700 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-slate-300 placeholder-slate-700 resize-none font-mono text-sm leading-relaxed"
                placeholder={`Provide a summary of your career history. Raw notes are accepted.\n\nEXAMPLE:\n2021-Present: Senior Product Designer at Creative Inc.\n- Led UI redesign increasing conversion by 15%.\n- Managed team of 4 juniors.`}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider font-mono">
               <Cpu className="w-3 h-3" /> SKILLS
            </label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-[#13141c] border border-slate-700 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-slate-700 resize-none font-mono text-sm"
              placeholder="List technical and soft skills (comma separated). e.g. Project Management, Python, Strategic Planning..."
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider font-mono">
               <GraduationCap className="w-3 h-3" /> EDUCATION
            </label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 bg-[#13141c] border border-slate-700 rounded focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-slate-700 resize-none font-mono text-sm"
              placeholder="e.g. BS Computer Science, MIT, 2018"
            />
          </div>

          <div className="pt-8 border-t border-slate-800">
             <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">
                SELECT RESUME TEMPLATE
             </label>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((template) => (
                   <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 flex flex-col gap-3 bg-[#13141c] group hover:bg-[#181a24]
                        ${selectedTemplate === template.id ? `${template.previewClass} bg-[#181a24]` : 'border-slate-800 hover:border-slate-600'}
                      `}
                   >
                      <div className="flex items-center justify-between w-full">
                         <template.icon className={`w-6 h-6 ${selectedTemplate === template.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                         {selectedTemplate === template.id && <Check className="w-4 h-4 text-cyan-500" />}
                      </div>
                      <div>
                         <div className={`font-bold text-sm mb-1 ${selectedTemplate === template.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{template.name}</div>
                         <p className="text-xs text-slate-600 leading-relaxed">{template.description}</p>
                      </div>
                   </button>
                ))}
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 text-sm rounded flex items-center">
              <span className="mr-2 font-bold">ERROR:</span> {error}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 uppercase tracking-wide"
            >
              <Wand2 className="w-4 h-4" /> Generate Document
            </button>
          </div>
      </div>
    </div>
  );
};