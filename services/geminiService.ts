
import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, ResumeBuilderInputs, GeneratedResume, JobSearchParams } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash'; 

export const analyzeResume = async (base64Data: string, mimeType: string, jobDescription?: string): Promise<AnalysisResult> => {
  
  const basePrompt = `
    You are an expert Technical Recruiter and ATS (Applicant Tracking System) specialist.
    Analyze the provided resume document.
  `;

  const specificInstruction = jobDescription 
    ? `
      Analyze this resume specifically against the following Target Job Description:
      "${jobDescription}"

      Please provide a structured analysis including:
      1. The detected job title (or "Target: [Role Name]" if the resume is being evaluated for a specific target).
      2. A brief summary of how well the candidate fits this specific role (2 sentences).
      3. A Match Score from 0 to 100 based on skills match, experience alignment, and keywords for this specific job.
      4. A list of key strengths of the candidate specifically relative to this job.
      5. A list of critical keywords from the job description that are missing in the resume.
      6. Specific actionable improvement suggestions to tailor the resume for this specific job application.
    `
    : `
      Please provide a structured analysis including:
      1. The detected job title or primary professional role.
      2. A brief professional summary (2 sentences).
      3. An ATS score from 0 to 100 based on formatting, content, and impact.
      4. A list of key strengths found in the resume.
      5. A list of important industry keywords that appear to be missing or could be added to improve searchability for this specific role.
      6. Actionable improvement suggestions to increase the chances of getting hired.
    `;

  const prompt = `${basePrompt}\n${specificInstruction}\nBe critical but constructive.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      jobTitleDetected: { type: Type.STRING, description: "The primary job title identified or the target role being analyzed" },
      summary: { type: Type.STRING, description: "A short executive summary or fit analysis" },
      overallScore: { type: Type.NUMBER, description: "A score from 0-100 rating the resume quality or match" },
      strengths: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of strong points"
      },
      missingKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Keywords that are missing"
      },
      improvements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Specific actionable advice"
      }
    },
    required: ["jobTitleDetected", "summary", "overallScore", "strengths", "missingKeywords", "improvements"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Lower temperature for more analytical results
      }
    });

    // Check if the response was blocked or empty
    if (!response.text) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("The resume content was flagged by safety filters. Please ensure the document does not contain sensitive personal data.");
      }
      if (candidate?.finishReason === 'RECITATION') {
        throw new Error("The analysis was flagged as recitation. Please ensure the content is original.");
      }
      throw new Error("The AI model could not generate a response. Please try uploading the document again.");
    }

    try {
      const result = JSON.parse(response.text) as AnalysisResult;
      
      // Basic validation of the result structure
      if (typeof result.overallScore !== 'number' || !Array.isArray(result.strengths)) {
        throw new Error("The analysis result was incomplete.");
      }
      
      return result;
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      throw new Error("Failed to process the analysis results. The model output was malformed.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    handleError(error);
    throw error; // Should be unreachable due to handleError throwing, but keeps TS happy
  }
};

export const generateResume = async (inputs: ResumeBuilderInputs): Promise<GeneratedResume> => {
  const prompt = `
    You are an expert Resume Writer and Career Coach.
    Create a high-impact, ATS-optimized professional resume based on the following raw user input.
    
    User Profile:
    - Name: ${inputs.fullName}
    - Target Role: ${inputs.targetRole}
    - Skills (Raw): ${inputs.skills}
    - Experience (Raw Notes): ${inputs.experience}
    - Education (Raw Notes): ${inputs.education}

    Instructions:
    1. Professional Title: Use the target role or a professional derivative.
    2. Summary: Write a compelling 3-4 line professional summary tailored to the target role.
    3. Experience: Transform the raw notes into structured roles. 
       - Use strong action verbs (e.g., "Spearheaded", "Developed", "Optimized").
       - Quantify results where possible (e.g., "increased by 20%").
       - Fix grammar and improve clarity.
    4. Skills: Group and refine the skills list.
    5. Education: Format clearly.
    6. Contact Info: Use a placeholder "[Email Address] | [Phone Number]" as we don't collect PII.

    Return the result in a structured JSON format suitable for rendering.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING },
      professionalTitle: { type: Type.STRING },
      contactInfoPlaceholder: { type: Type.STRING },
      summary: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            company: { type: Type.STRING },
            duration: { type: Type.STRING },
            achievements: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      },
      skills: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            degree: { type: Type.STRING },
            school: { type: Type.STRING },
            year: { type: Type.STRING }
          }
        }
      }
    },
    required: ["fullName", "professionalTitle", "summary", "experience", "skills", "education"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5, // Slightly creative for writing
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate resume content.");
    }

    return JSON.parse(response.text) as GeneratedResume;

  } catch (error: any) {
    console.error("Gemini API Error (Resume Generation):", error);
    handleError(error);
    throw error;
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are an expert career coach and resume strategist named 'ResumeAI Assistant'. Your goal is to help users craft perfect resumes, prepare for interviews, and navigate their career path. Be concise, encouraging, and professional.",
    }
  });
};

export const searchJobs = async (params: JobSearchParams): Promise<GenerateContentResponse> => {
  let prompt = "";

  // Build filter strings
  const filters = [
    params.workMode && params.workMode !== 'Any' ? `Work Mode: ${params.workMode}` : '',
    params.salaryRange && params.salaryRange !== 'Any' ? `Salary Range: ${params.salaryRange}` : '',
    params.companySize && params.companySize !== 'Any' ? `Company Size: ${params.companySize}` : ''
  ].filter(Boolean).join('\n      ');

  if (params.fromResume) {
    prompt = `
      Search for current job openings suitable for a candidate with this profile:
      "${params.skills}" (Based on Resume Analysis)
      
      Target Role: ${params.role}
      Location: ${params.location || 'Remote/Any'}
      Experience Level: ${params.experienceLevel}
      ${filters}

      Please list 5-7 real, active job postings found online.
      For each job, provide:
      1. Job Title
      2. Company Name
      3. Location
      4. A brief summary of why it's a good match.
      
      Ensure the information is up-to-date.
    `;
  } else {
    prompt = `
      Find current job openings for the following criteria:
      Role: ${params.role}
      Skills: ${params.skills}
      Location: ${params.location || 'Remote'}
      Experience Level: ${params.experienceLevel}
      ${filters}

      Please list 5-7 real, active job postings found online.
      For each job, provide:
      1. Job Title
      2. Company Name
      3. Location
      4. A brief key requirement snippet.
    `;
  }

  try {
    // Using gemini-2.5-flash with googleSearch tool
    // Note: responseMimeType and responseSchema are NOT allowed when using googleSearch
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return response;
  } catch (error: any) {
    console.error("Gemini API Error (Job Search):", error);
    handleError(error);
    throw error;
  }
};

// Helper for error handling
const handleError = (error: any) => {
  // If we threw a specific error above, rethrow it
  if (error.message && (error.message.includes("safety filters") || error.message.includes("model output") || error.message.includes("could not generate"))) {
    throw error;
  }

  // Handle specific API errors
  if (error.message?.includes('403') || error.message?.includes('API_KEY')) {
    throw new Error("Authentication failed. Please check your API key.");
  }
  if (error.message?.includes('429')) {
    throw new Error("Service usage limit exceeded. Please wait a moment before trying again.");
  }
  if (error.message?.includes('500') || error.message?.includes('503')) {
    throw new Error("The AI service is temporarily unavailable. Please try again later.");
  }
  if (error.message?.includes('fetch failed')) {
    throw new Error("Network connection failed. Please check your internet connection.");
  }

  throw new Error("An unexpected error occurred. Please try again.");
};
