
export interface AnalysisResult {
  jobTitleDetected: string;
  summary: string;
  overallScore: number;
  strengths: string[];
  missingKeywords: string[];
  improvements: string[];
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
}

export interface ResumeBuilderInputs {
  fullName: string;
  targetRole: string;
  experience: string;
  skills: string;
  education: string;
}

export interface GeneratedResume {
  fullName: string;
  professionalTitle: string;
  contactInfoPlaceholder: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    duration: string;
    achievements: string[];
  }[];
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface JobSearchParams {
  role: string;
  location: string;
  experienceLevel: string;
  skills: string;
  workMode?: string;
  salaryRange?: string;
  companySize?: string;
  fromResume?: boolean;
}
