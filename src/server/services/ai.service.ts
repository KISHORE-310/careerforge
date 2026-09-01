import { GoogleGenAI, Type } from "@google/genai";
import { config } from "../config";
import { sanitizeAiInput } from "../security";

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!config.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: config.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Execute Gemini model call with exponential backoff for transient errors
 */
async function callGeminiWithRetry<T>(
  action: (ai: GoogleGenAI) => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<T> {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await action(ai);
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.status === 500 ||
        err?.code === "RESOURCE_EXHAUSTED" ||
        err?.message?.includes("fetch failed") ||
        err?.message?.includes("network timeout") ||
        err?.message?.includes("rate limit");

      if (!isTransient || attempt === maxRetries) {
        console.error(`[AI Service] Non-transient or final error on attempt ${attempt}/${maxRetries}:`, err?.message || err);
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      console.warn(`[AI Service] Transient error on attempt ${attempt}. Retrying in ${Math.round(delay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Clean & parse JSON safely from raw Gemini text response
 */
function parseJsonFromResponse(rawText: string | undefined): any {
  if (!rawText || !rawText.trim()) {
    throw new Error("Empty response returned by AI model.");
  }
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error("[AI Service] JSON parsing failed for response:", rawText.slice(0, 300));
    throw new Error(`Failed to parse structured JSON from AI output: ${err.message}`);
  }
}

export const aiService = {
  /**
   * Parse extracted resume text into a structured JSON profile using real Gemini AI
   */
  async parseResume(extractedText: string, targetRole: string = "Full Stack Engineer") {
    const cleanText = sanitizeAiInput(extractedText, 8000);
    if (!cleanText || cleanText.length < 20) {
      throw new Error("Resume content is too short or empty for AI parsing.");
    }

    return await callGeminiWithRetry(async (gemini) => {
      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: `You are CareerForge AI ATS & Resume Parsing Engine.
Target Role: ${sanitizeAiInput(targetRole, 100)}
Parse this resume text and extract candidate details accurately into the requested JSON schema.

Resume Text:
${cleanText.slice(0, 6000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personal_info: {
                type: Type.OBJECT,
                properties: {
                  full_name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                },
                required: ["full_name"],
              },
              summary: { type: Type.STRING },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    field_of_study: { type: Type.STRING },
                    start_year: { type: Type.INTEGER },
                    end_year: { type: Type.INTEGER },
                    cgpa: { type: Type.STRING },
                  },
                  required: ["degree", "institution"],
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    start_date: { type: Type.STRING },
                    end_date: { type: Type.STRING },
                    description: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["company", "role"],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    technologies: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    github_url: { type: Type.STRING },
                    live_url: { type: Type.STRING },
                  },
                  required: ["title"],
                },
              },
              certifications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    organization: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ["name"],
                },
              },
              technical_skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              soft_skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              achievements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              languages: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["personal_info", "summary", "technical_skills"],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * Executive bullet point and summary rewrite with ATS impact analysis
   */
  async rewriteResumeContent(
    section: string = "experience",
    content: string,
    targetRole: string = "Senior Software Engineer",
    instruction: string = "Rewrite using Google XYZ formula with quantified metrics"
  ) {
    const cleanContent = sanitizeAiInput(content, 3000);
    const cleanInstruction = sanitizeAiInput(instruction, 1000);
    const cleanRole = sanitizeAiInput(targetRole, 100);
    const cleanSection = sanitizeAiInput(section, 100);

    if (!cleanContent) {
      throw new Error("Content to rewrite cannot be empty.");
    }

    return await callGeminiWithRetry(async (gemini) => {
      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: `You are CareerForge AI's elite Executive Resume Strategist.
Target Role: ${cleanRole}
Resume Section: ${cleanSection}
Current Content: "${cleanContent}"
Instruction: ${cleanInstruction}

Provide 3 distinct, highly polished rewrite alternatives along with ATS impact reasoning.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              improved: { type: Type.STRING, description: "Primary polished rewrite using action verbs and quantified impact" },
              alternatives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 distinct alternative formulations",
              },
              impact_analysis: { type: Type.STRING, description: "Detailed explanation of why this change improves ATS scoring and recruiter engagement" },
            },
            required: ["improved", "alternatives", "impact_analysis"],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * High-conversion cover letters and recruiter outreach messages
   */
  async generateApplicationDocument(params: {
    type?: string;
    company?: string;
    role?: string;
    jobDescription?: string;
    tone?: string;
    keyPoints?: string;
    candidateName?: string;
  }) {
    const {
      type = "cover letter",
      company = "Target Company",
      role = "Software Engineer",
      jobDescription = "",
      tone = "Passionate & Professional",
      keyPoints = "",
      candidateName = "Candidate",
    } = params;

    const cleanName = sanitizeAiInput(candidateName, 100);
    const cleanCompany = sanitizeAiInput(company, 100);
    const cleanRole = sanitizeAiInput(role, 100);
    const cleanTone = sanitizeAiInput(tone, 50);
    const cleanJobDesc = sanitizeAiInput(jobDescription, 4000);
    const cleanKeyPoints = sanitizeAiInput(keyPoints, 1500);

    return await callGeminiWithRetry(async (gemini) => {
      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: `You are CareerForge AI's elite Executive Career Strategist.
Generate a high-converting ${type} tailored to the candidate and role:
Candidate Name: ${cleanName}
Company: ${cleanCompany}
Role: ${cleanRole}
Tone: ${cleanTone}
Key Candidate Highlights: ${cleanKeyPoints || "Full-stack capabilities, system design rigor, agile execution"}
Job Context: ${cleanJobDesc || "Competitive high-impact engineering role"}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: "Catchy, professional subject line" },
              content: { type: Type.STRING, description: "Complete, highly personalized body text ready to send" },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable tips before submitting",
              },
            },
            required: ["subject", "content", "tips"],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * AI Technical/Behavioral Interview simulator response
   */
  async generateInterviewResponse(params: {
    role?: string;
    track?: string;
    difficulty?: string;
    company?: string;
    conversationHistory: Array<{ role: string; content: string }>;
    latestUserMessage: string;
  }) {
    const {
      role = "Senior Full Stack Engineer",
      track = "System Design",
      difficulty = "Medium",
      company = "Top Tech Company",
      conversationHistory,
      latestUserMessage,
    } = params;

    const cleanMsg = sanitizeAiInput(latestUserMessage, 4000);
    if (!cleanMsg) {
      throw new Error("Candidate message cannot be empty.");
    }

    const historyContext = conversationHistory
      .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${sanitizeAiInput(m.content, 1000)}`)
      .join("\n");

    return await callGeminiWithRetry(async (gemini) => {
      const prompt = `You are a Principal Engineer and Lead Interviewer at ${company} conducting a ${difficulty}-level ${track} interview for a ${role} position.

Conversation History:
${historyContext}

Candidate's Latest Response:
"${cleanMsg}"

Instructions:
1. Provide constructive, immediate feedback or acknowledge the candidate's answer.
2. Ask a deep follow-up technical or architectural question testing their depth, edge cases, trade-offs, or scalability.
3. Keep the response professional, realistic, and focused on genuine engineering trade-offs.`;

      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "Your response and next question as the interviewer" },
              feedback_snippet: { type: Type.STRING, description: "Brief 1-sentence note on how candidate answered" },
              suggested_topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key architectural or technical concepts involved in this question",
              },
            },
            required: ["reply", "feedback_snippet", "suggested_topics"],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * Comprehensive interview session evaluation
   */
  async evaluateInterviewSession(params: {
    role: string;
    track: string;
    messages: Array<{ sender: string; message: string }>;
  }) {
    const { role, track, messages } = params;
    if (!messages || messages.length === 0) {
      throw new Error("Cannot evaluate an interview session with no messages.");
    }

    const transcript = messages
      .map((m) => `${m.sender === "ai" ? "Interviewer" : "Candidate"}: ${sanitizeAiInput(m.message, 1000)}`)
      .join("\n\n");

    return await callGeminiWithRetry(async (gemini) => {
      const prompt = `You are CareerForge AI Principal Interview Evaluator.
Role: ${sanitizeAiInput(role, 100)}
Track: ${sanitizeAiInput(track, 100)}

Interview Transcript:
${transcript.slice(0, 7000)}

Evaluate the candidate across technical depth, communication, problem solving, and overall readiness.`;

      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall_score: { type: Type.INTEGER, description: "Overall score from 0 to 100" },
              technical_score: { type: Type.INTEGER, description: "Technical depth score from 0 to 100" },
              communication_score: { type: Type.INTEGER, description: "Clarity and communication score from 0 to 100" },
              problem_solving_score: { type: Type.INTEGER, description: "Problem solving and trade-off evaluation score from 0 to 100" },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of distinct candidate strengths observed",
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of specific areas for candidate improvement",
              },
              summary: { type: Type.STRING, description: "Detailed executive evaluation summary in Markdown" },
            },
            required: [
              "overall_score",
              "technical_score",
              "communication_score",
              "problem_solving_score",
              "strengths",
              "improvements",
              "summary",
            ],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * DSA & Algorithmic Code Reviewer with Time/Space complexity analysis
   */
  async reviewDsaCode(code: string, problemTitle: string, language: string = "JavaScript") {
    const cleanCode = sanitizeAiInput(code, 4000);
    const cleanTitle = sanitizeAiInput(problemTitle, 100);

    if (!cleanCode) {
      throw new Error("No code provided for review.");
    }

    return await callGeminiWithRetry(async (gemini) => {
      const prompt = `You are CareerForge AI Senior Algorithms Specialist.
Problem: ${cleanTitle}
Language: ${language}

Candidate Code:
\`\`\`${language}
${cleanCode}
\`\`\`

Analyze the code for correctness, time complexity, and space complexity.`;

      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passed_tests: { type: Type.BOOLEAN, description: "Whether the solution is logically sound and passes all edge cases" },
              time_complexity: { type: Type.STRING, description: "Big-O time complexity (e.g. O(N), O(N log N))" },
              space_complexity: { type: Type.STRING, description: "Big-O auxiliary space complexity (e.g. O(1), O(N))" },
              is_optimal: { type: Type.BOOLEAN, description: "Whether this represents an optimal time/space solution" },
              score: { type: Type.INTEGER, description: "Code quality and efficiency score 0-100" },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key implementation strengths",
              },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific optimizations or edge case handling suggestions",
              },
              feedback: { type: Type.STRING, description: "Comprehensive code review summary" },
            },
            required: [
              "passed_tests",
              "time_complexity",
              "space_complexity",
              "is_optimal",
              "score",
              "strengths",
              "suggestions",
              "feedback",
            ],
          },
        },
      });

      return parseJsonFromResponse(response.text);
    });
  },

  /**
   * Interactive Career Coach Chat
   */
  async getCareerCoachAdvice(params: {
    userName: string;
    targetRole: string;
    skills: string[];
    applications: Array<{ company: string; status: string }>;
    targetSalary?: number | null;
    userQuestion: string;
  }) {
    const { userName, targetRole, skills, applications, targetSalary, userQuestion } = params;
    const cleanQuestion = sanitizeAiInput(userQuestion, 2000);

    if (!cleanQuestion) {
      throw new Error("Question cannot be empty.");
    }

    return await callGeminiWithRetry(async (gemini) => {
      const systemContext = `You are CareerForge AI, an elite Executive Career Coach and Technical Talent Strategist.
Candidate Real Profile Context:
- Name: ${sanitizeAiInput(userName, 100)}
- Target Role: ${sanitizeAiInput(targetRole, 100)}
- Documented Skills: ${skills.join(", ") || "None documented yet"}
- Active Applications: ${applications.length > 0 ? applications.map((a) => `${a.company} (${a.status})`).join(", ") : "0 active applications"}
- Target Salary: ${targetSalary ? `$${targetSalary.toLocaleString()}` : "Not specified"}

Respond directly to the candidate with sharp, strategic, actionable, and encouraging career advice based on their real profile. Avoid generic filler. Use clean formatting with bold headers and bullet points.`;

      const response = await gemini.models.generateContent({
        model: config.GEMINI_MODEL,
        contents: `${systemContext}\n\nCandidate Question: ${cleanQuestion}`,
      });

      const reply = response.text?.trim();
      if (!reply) {
        throw new Error("AI Coach returned an empty response.");
      }
      return reply;
    });
  },
};
