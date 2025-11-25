import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, FileUp } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    setError(null);
    
    if (file.type !== "application/pdf") {
      setError("Invalid file type. PDF format required.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
       setError(`File exceeds 5MB limit.`);
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onFileSelect({
          name: file.name,
          type: file.type,
          base64: result.split(',')[1]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto group">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all duration-300 ease-out
          ${dragActive 
            ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]' 
            : 'border-slate-700 bg-[#0B0C10]'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500 hover:bg-[#11121a]'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Technical Corner Markers */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 transition-colors ${dragActive ? 'border-cyan-500' : 'border-slate-600'} -mt-1 -ml-1`}></div>
        <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 transition-colors ${dragActive ? 'border-cyan-500' : 'border-slate-600'} -mt-1 -mr-1`}></div>
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 transition-colors ${dragActive ? 'border-cyan-500' : 'border-slate-600'} -mb-1 -ml-1`}></div>
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 transition-colors ${dragActive ? 'border-cyan-500' : 'border-slate-600'} -mb-1 -mr-1`}></div>

        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 pointer-events-none z-10">
          <div className={`p-4 rounded-md mb-4 transition-all duration-300 ${dragActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800/50 text-slate-500 group-hover:text-cyan-500 group-hover:bg-slate-800'}`}>
            <Upload className="w-8 h-8" strokeWidth={1.5} />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
             DROP RESUME PDF
          </h3>
          <p className="text-xs text-slate-500 font-mono mb-4">
            OR CLICK TO BROWSE FILES
          </p>
          <div className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700 text-[10px] font-mono text-slate-400">
            MAX SIZE: 5MB
          </div>
        </div>
        
        <input 
          id="dropzone-file" 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="application/pdf"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border-l-2 border-red-500 flex items-center text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="font-mono">{error}</span>
        </div>
      )}
    </div>
  );
};
