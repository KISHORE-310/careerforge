import { prisma } from "./prisma";

export const db = {
  // Users & Profiles
  users: {
    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true },
      });
    },
    async findById(id: string) {
      return prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
    },
    async create(data: {
      email: string;
      passwordHash: string;
      name: string;
      role?: string;
      profile?: {
        title?: string;
        bio?: string;
        location?: string;
        targetRole?: string;
        targetSalary?: number;
        experienceLevel?: string;
        phone?: string;
        github?: string;
        linkedin?: string;
      };
    }) {
      return prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          name: data.name,
          role: data.role || "user",
          profile: data.profile
            ? {
                create: {
                  title: data.profile.title || "Software Engineer",
                  bio: data.profile.bio || "",
                  location: data.profile.location || "",
                  targetRole: data.profile.targetRole || "Full Stack Engineer",
                  targetSalary: data.profile.targetSalary || 120000,
                  experienceLevel: data.profile.experienceLevel || "Mid-Level",
                  phone: data.profile.phone || "",
                  github: data.profile.github || "",
                  linkedin: data.profile.linkedin || "",
                },
              }
            : {
                create: {
                  title: "Software Engineer",
                  targetRole: "Full Stack Engineer",
                  targetSalary: 120000,
                  experienceLevel: "Mid-Level",
                },
              },
        },
        include: { profile: true },
      });
    },
    async updateProfile(userId: string, data: Record<string, any>) {
      return prisma.profile.upsert({
        where: { userId },
        update: {
          title: data.title,
          bio: data.bio,
          location: data.location,
          targetRole: data.targetRole,
          targetSalary: data.targetSalary ? Number(data.targetSalary) : undefined,
          experienceLevel: data.experienceLevel,
          phone: data.phone,
          github: data.github,
          linkedin: data.linkedin,
          portfolio: data.portfolio,
          preferences: data.preferences ? JSON.stringify(data.preferences) : undefined,
        },
        create: {
          userId,
          title: data.title || "Software Engineer",
          bio: data.bio || "",
          location: data.location || "",
          targetRole: data.targetRole || "Full Stack Engineer",
          targetSalary: data.targetSalary ? Number(data.targetSalary) : 120000,
          experienceLevel: data.experienceLevel || "Mid-Level",
          phone: data.phone || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        },
      });
    },
  },

  // Resumes & Versions
  resumes: {
    async getPrimary(userId: string) {
      return prisma.resume.findFirst({
        where: { userId, isPrimary: true },
        include: { versions: { orderBy: { createdAt: "desc" }, take: 5 } },
      });
    },
    async upsertResume(userId: string, resumeData: any) {
      const existing = await prisma.resume.findFirst({
        where: { userId, isPrimary: true },
      });

      const payload = {
        title: resumeData.title || "My Resume",
        targetRole: resumeData.targetRole || resumeData.target_role || "Software Engineer",
        contactInfo: JSON.stringify(resumeData.contactInfo || resumeData.contact || {}),
        summary: resumeData.summary || "",
        experience: JSON.stringify(resumeData.experience || []),
        education: JSON.stringify(resumeData.education || []),
        skills: JSON.stringify(resumeData.skills || []),
        projects: JSON.stringify(resumeData.projects || []),
        certifications: JSON.stringify(resumeData.certifications || []),
        atsScore: resumeData.atsScore || resumeData.ats_score || null,
        parsedText: resumeData.parsedText || resumeData.raw_text || null,
        evaluation: resumeData.evaluation ? JSON.stringify(resumeData.evaluation) : null,
      };

      if (existing) {
        return prisma.resume.update({
          where: { id: existing.id },
          data: payload,
        });
      }

      return prisma.resume.create({
        data: {
          userId,
          isPrimary: true,
          ...payload,
        },
      });
    },
    async createVersion(resumeId: string, userId: string, content: any, changelog?: string) {
      const count = await prisma.resumeVersion.count({ where: { resumeId } });
      return prisma.resumeVersion.create({
        data: {
          resumeId,
          userId,
          versionNum: count + 1,
          content: JSON.stringify(content),
          changelog: changelog || "Manual save",
          atsScore: content.atsScore || content.ats_score || null,
        },
      });
    },
  },

  // Skills
  skills: {
    async listByUser(userId: string) {
      return prisma.skill.findMany({
        where: { userId },
        orderBy: { proficiency: "desc" },
      });
    },
    async upsert(userId: string, skill: { name: string; category?: string; proficiency?: number; verified?: boolean; source?: string }) {
      return prisma.skill.upsert({
        where: {
          userId_name: {
            userId,
            name: skill.name,
          },
        },
        update: {
          category: skill.category || "Technical",
          proficiency: skill.proficiency ?? 70,
          verified: skill.verified ?? false,
          source: skill.source || "User",
        },
        create: {
          userId,
          name: skill.name,
          category: skill.category || "Technical",
          proficiency: skill.proficiency ?? 70,
          verified: skill.verified ?? false,
          source: skill.source || "User",
        },
      });
    },
    async delete(userId: string, skillId: string) {
      return prisma.skill.deleteMany({
        where: { id: skillId, userId },
      });
    },
  },

  // Jobs
  jobs: {
    async list(filters?: { type?: string; location?: string; search?: string; limit?: number }) {
      const where: any = { isActive: true };
      if (filters?.type && filters.type !== "all") {
        where.type = { contains: filters.type };
      }
      if (filters?.location) {
        where.location = { contains: filters.location };
      }
      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search } },
          { company: { contains: filters.search } },
          { description: { contains: filters.search } },
        ];
      }
      return prisma.job.findMany({
        where,
        take: filters?.limit || 50,
        orderBy: { postedAt: "desc" },
      });
    },
    async findById(id: string) {
      return prisma.job.findUnique({ where: { id } });
    },
    async create(jobData: any) {
      return prisma.job.create({
        data: {
          title: jobData.title,
          company: jobData.company,
          companyLogo: jobData.companyLogo,
          location: jobData.location,
          type: jobData.type || "Full-time",
          workplace: jobData.workplace || "Hybrid",
          salaryMin: jobData.salaryMin,
          salaryMax: jobData.salaryMax,
          salaryText: jobData.salaryText,
          description: jobData.description,
          requirements: JSON.stringify(jobData.requirements || []),
          skills: JSON.stringify(jobData.skills || []),
          experience: jobData.experience,
          applyUrl: jobData.applyUrl,
          source: jobData.source || "Direct",
        },
      });
    },
  },

  // Applications
  applications: {
    async listByUser(userId: string) {
      return prisma.application.findMany({
        where: { userId },
        orderBy: { appliedDate: "desc" },
      });
    },
    async findById(id: string, userId: string) {
      return prisma.application.findFirst({
        where: { id, userId },
      });
    },
    async create(userId: string, data: any) {
      return prisma.application.create({
        data: {
          userId,
          jobId: data.jobId || null,
          company: data.company,
          role: data.role || data.title,
          location: data.location || "",
          salary: data.salary || "",
          status: data.status || "applied",
          nextStep: data.nextStep || null,
          matchScore: data.matchScore ? Number(data.matchScore) : null,
          notes: data.notes || "",
          coverLetter: data.coverLetter || "",
          contactPerson: data.contactPerson || "",
          history: JSON.stringify([
            {
              status: data.status || "applied",
              date: new Date().toISOString(),
              note: "Application record created",
            },
          ]),
        },
      });
    },
    async update(id: string, userId: string, data: any) {
      const existing = await prisma.application.findFirst({ where: { id, userId } });
      if (!existing) return null;

      let history = [];
      try {
        history = existing.history ? JSON.parse(existing.history) : [];
      } catch (e) {
        history = [];
      }

      if (data.status && data.status !== existing.status) {
        history.unshift({
          status: data.status,
          date: new Date().toISOString(),
          note: data.notes || `Status changed to ${data.status}`,
        });
      }

      return prisma.application.update({
        where: { id },
        data: {
          company: data.company !== undefined ? data.company : existing.company,
          role: data.role !== undefined ? data.role : existing.role,
          location: data.location !== undefined ? data.location : existing.location,
          salary: data.salary !== undefined ? data.salary : existing.salary,
          status: data.status !== undefined ? data.status : existing.status,
          nextStep: data.nextStep !== undefined ? data.nextStep : existing.nextStep,
          notes: data.notes !== undefined ? data.notes : existing.notes,
          coverLetter: data.coverLetter !== undefined ? data.coverLetter : existing.coverLetter,
          history: JSON.stringify(history),
        },
      });
    },
    async delete(id: string, userId: string) {
      return prisma.application.deleteMany({
        where: { id, userId },
      });
    },
  },

  // Interviews
  interviews: {
    async listByUser(userId: string) {
      return prisma.interview.findMany({
        where: { userId },
        include: {
          messages: { orderBy: { timestamp: "asc" } },
          evaluations: true,
        },
        orderBy: { startedAt: "desc" },
      });
    },
    async findById(id: string, userId: string) {
      return prisma.interview.findFirst({
        where: { id, userId },
        include: {
          messages: { orderBy: { timestamp: "asc" } },
          evaluations: true,
        },
      });
    },
    async create(userId: string, data: any) {
      return prisma.interview.create({
        data: {
          userId,
          title: data.title || `${data.type || "Technical"} Round: ${data.targetRole || "Software Engineer"}`,
          type: data.type || "Technical",
          targetRole: data.targetRole || "Software Engineer",
          companyFocus: data.companyFocus || null,
          difficulty: data.difficulty || "Intermediate",
          status: "in_progress",
        },
        include: { messages: true, evaluations: true },
      });
    },
    async addMessage(interviewId: string, sender: string, content: string, metrics?: any) {
      return prisma.interviewMessage.create({
        data: {
          interviewId,
          sender,
          content,
          metrics: metrics ? JSON.stringify(metrics) : null,
        },
      });
    },
    async saveEvaluation(interviewId: string, evalData: any) {
      await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: "completed",
          overallScore: evalData.overallScore || evalData.overall_score || 85,
          completedAt: new Date(),
        },
      });

      return prisma.interviewEvaluation.upsert({
        where: { interviewId },
        update: {
          overallScore: evalData.overallScore || evalData.overall_score || 85,
          rubricScores: JSON.stringify(evalData.rubricScores || evalData.rubrics || {}),
          strengths: JSON.stringify(evalData.strengths || []),
          weaknesses: JSON.stringify(evalData.weaknesses || []),
          improvements: JSON.stringify(evalData.improvements || []),
          detailedSummary: evalData.detailedSummary || evalData.summary || "",
        },
        create: {
          interviewId,
          overallScore: evalData.overallScore || evalData.overall_score || 85,
          rubricScores: JSON.stringify(evalData.rubricScores || evalData.rubrics || {}),
          strengths: JSON.stringify(evalData.strengths || []),
          weaknesses: JSON.stringify(evalData.weaknesses || []),
          improvements: JSON.stringify(evalData.improvements || []),
          detailedSummary: evalData.detailedSummary || evalData.summary || "",
        },
      });
    },
  },

  // Roadmaps
  roadmaps: {
    async getActiveByUser(userId: string) {
      return prisma.roadmap.findFirst({
        where: { userId, isActive: true },
        include: { milestones: { orderBy: { weekNumber: "asc" } } },
      });
    },
    async createWithMilestones(userId: string, data: any) {
      // Deactivate older active roadmaps
      await prisma.roadmap.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      return prisma.roadmap.create({
        data: {
          userId,
          targetRole: data.targetRole || "Senior Full Stack Engineer",
          title: data.title || `Mastery Path for ${data.targetRole || "Software Engineer"}`,
          description: data.description || "Structured 90-day roadmap targeting high-impact engineering competencies.",
          duration: data.duration || "90 Days",
          isActive: true,
          milestones: {
            create: (data.milestones || []).map((m: any, idx: number) => ({
              orderIndex: idx,
              weekNumber: m.week || m.weekNumber || idx + 1,
              title: m.title || `Milestone ${idx + 1}`,
              description: m.description || "",
              category: m.category || "Core",
              status: m.status || "todo",
              skills: JSON.stringify(m.skills || []),
              resources: JSON.stringify(m.resources || []),
            })),
          },
        },
        include: { milestones: { orderBy: { weekNumber: "asc" } } },
      });
    },
    async updateMilestone(milestoneId: string, status: string) {
      return prisma.roadmapMilestone.update({
        where: { id: milestoneId },
        data: {
          status,
          completedAt: status === "completed" ? new Date() : null,
        },
      });
    },
  },

  // Learning
  learning: {
    async listResources() {
      return prisma.learningResource.findMany({
        orderBy: { enrolled: "desc" },
      });
    },
    async getUserProgress(userId: string) {
      return prisma.learningProgress.findMany({
        where: { userId },
        include: { resource: true },
      });
    },
    async updateProgress(userId: string, resourceId: string, progress: number, quizScore?: number) {
      const isCompleted = progress >= 100;
      return prisma.learningProgress.upsert({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
        update: {
          progress,
          status: isCompleted ? "completed" : "in_progress",
          quizScore: quizScore !== undefined ? quizScore : undefined,
          completedAt: isCompleted ? new Date() : undefined,
        },
        create: {
          userId,
          resourceId,
          progress,
          status: isCompleted ? "completed" : "in_progress",
          quizScore: quizScore !== undefined ? quizScore : null,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    },
  },

  // DSA Progress
  dsa: {
    async listByUser(userId: string) {
      return prisma.dSAProgress.findMany({
        where: { userId },
        orderBy: { solvedAt: "desc" },
      });
    },
    async recordProblem(userId: string, problem: {
      problemId: string;
      title: string;
      slug: string;
      topic: string;
      difficulty: string;
      status?: string;
      timeSpentMs?: number;
      notes?: string;
    }) {
      return prisma.dSAProgress.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId: problem.problemId,
          },
        },
        update: {
          status: problem.status || "solved",
          timeSpentMs: problem.timeSpentMs,
          notes: problem.notes,
          attempts: { increment: 1 },
          solvedAt: new Date(),
        },
        create: {
          userId,
          problemId: problem.problemId,
          title: problem.title,
          slug: problem.slug,
          topic: problem.topic,
          difficulty: problem.difficulty,
          status: problem.status || "solved",
          timeSpentMs: problem.timeSpentMs || null,
          notes: problem.notes || null,
        },
      });
    },
    async resetProgress(userId: string) {
      return prisma.dSAProgress.deleteMany({
        where: { userId },
      });
    },
  },

  // Notifications
  notifications: {
    async listByUser(userId: string) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    },
    async create(userId: string, data: { title: string; message: string; type?: string; link?: string }) {
      return prisma.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type || "info",
          link: data.link || null,
        },
      });
    },
    async markAllRead(userId: string) {
      return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    },
  },

  // Analytics & Snapshots
  analytics: {
    async recordEvent(userId: string, eventType: string, category: string, metadata?: any) {
      return prisma.analyticsEvent.create({
        data: {
          userId,
          eventType,
          category,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });
    },
    async getEvents(userId: string, limit = 100) {
      return prisma.analyticsEvent.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });
    },
    async saveSnapshot(userId: string, data: {
      readinessScore: number;
      atsScore?: number;
      skillsCount: number;
      dsaSolvedCount: number;
      interviewScore?: number;
      activeApps: number;
      velocityScore?: number;
      metadata?: any;
    }) {
      return prisma.careerSnapshot.create({
        data: {
          userId,
          readinessScore: data.readinessScore,
          atsScore: data.atsScore,
          skillsCount: data.skillsCount,
          dsaSolvedCount: data.dsaSolvedCount,
          interviewScore: data.interviewScore,
          activeApps: data.activeApps,
          velocityScore: data.velocityScore,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });
    },
    async getSnapshots(userId: string) {
      return prisma.careerSnapshot.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        take: 30,
      });
    },
  },
};

export default db;
