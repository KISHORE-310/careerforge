import { prisma } from "./prisma";

export const db = {
  // Users & Profiles
  users: {
    shape(user: any) {
      if (!user) return null;
      return {
        ...user,
        name: user.fullName || user.name,
        fullName: user.fullName || user.name,
      };
    },
    async findByEmail(email: string) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { profile: true },
      });
      return this.shape(user);
    },
    async findById(id: string) {
      const user = await prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
      return this.shape(user);
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
        targetSalary?: number | string;
        experienceLevel?: string;
        phone?: string;
        github?: string;
        linkedin?: string;
      };
    }) {
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          fullName: data.name,
          profile: {
            create: {
              bio: data.profile?.bio || "",
              location: data.profile?.location || "",
              targetRole: data.profile?.targetRole || data.profile?.title || "Full Stack Engineer",
              targetSalary: data.profile?.targetSalary != null ? String(data.profile.targetSalary) : "",
              experienceLevel: data.profile?.experienceLevel || "Mid-Level",
              phone: data.profile?.phone || "",
              github: data.profile?.github || "",
              linkedin: data.profile?.linkedin || "",
            },
          },
        },
        include: { profile: true },
      });
      return this.shape(user);
    },
    async updateProfile(userId: string, data: Record<string, any>) {
      const targetRole = data.targetRole || data.target_role;
      const targetSalary = data.targetSalary ?? data.target_salary;
      const experienceLevel = data.experienceLevel || data.experience_level;
      return prisma.profile.upsert({
        where: { userId },
        update: {
          bio: data.bio,
          location: data.location,
          targetRole,
          targetSalary: targetSalary != null ? String(targetSalary) : undefined,
          experienceLevel,
          phone: data.phone,
          github: data.github,
          linkedin: data.linkedin,
          portfolio: data.portfolio,
        },
        create: {
          userId,
          bio: data.bio || "",
          location: data.location || "",
          targetRole: targetRole || "Full Stack Engineer",
          targetSalary: targetSalary != null ? String(targetSalary) : "",
          experienceLevel: experienceLevel || "Mid-Level",
          phone: data.phone || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        },
      });
    },
    async completeOnboarding(userId: string) {
      return prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      });
    },
  },

  // Resumes & Versions
  resumes: {
    flattenRecord(resume: any, version: any) {
      const content = version?.content && typeof version.content === "object" ? version.content : {};
      return {
        id: resume.id,
        userId: resume.userId,
        currentVersionId: resume.currentVersionId,
        versions: resume.versions || [],
        contactInfo: JSON.stringify(content.personal_info || content.contactInfo || {}),
        summary: content.summary || "",
        experience: JSON.stringify(content.experience || []),
        education: JSON.stringify(content.education || []),
        skills: JSON.stringify(content.technical_skills || content.skills || []),
        projects: JSON.stringify(content.projects || []),
        certifications: JSON.stringify(content.certifications || []),
        atsScore: content.ats_score || content.atsScore || null,
        targetRole: content.target_role || content.targetRole || null,
        parsedText: version?.extractedText || content.parsedText || null,
        evaluation: content.evaluation ? JSON.stringify(content.evaluation) : null,
        content,
      };
    },
    async getPrimary(userId: string) {
      const resume = await prisma.resume.findUnique({
        where: { userId },
        include: { versions: { orderBy: { createdAt: "desc" }, take: 20 } },
      });
      if (!resume) return null;
      const current =
        resume.versions.find((v) => v.id === resume.currentVersionId) || resume.versions[0] || null;
      return this.flattenRecord(resume, current);
    },
    async listVersions(userId: string) {
      const resume = await prisma.resume.findUnique({
        where: { userId },
        include: { versions: { orderBy: { createdAt: "desc" }, take: 20 } },
      });
      return resume?.versions || [];
    },
    async upsertResume(userId: string, resumeData: any) {
      const content = {
        personal_info: resumeData.personal_info || resumeData.contactInfo || resumeData.contact || {},
        summary: resumeData.summary || "",
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        technical_skills: resumeData.technical_skills || resumeData.skills || [],
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
        soft_skills: resumeData.soft_skills || [],
        achievements: resumeData.achievements || [],
        languages: resumeData.languages || [],
        target_role: resumeData.targetRole || resumeData.target_role,
        ats_score: resumeData.atsScore || resumeData.ats_score || null,
        evaluation: resumeData.evaluation || null,
      };

      const existing = await prisma.resume.findUnique({ where: { userId } });
      const resume = existing
        ? existing
        : await prisma.resume.create({ data: { userId } });

      const count = await prisma.resumeVersion.count({ where: { resumeId: resume.id } });
      const version = await prisma.resumeVersion.create({
        data: {
          resumeId: resume.id,
          versionNumber: count + 1,
          content,
          extractedText: resumeData.parsedText || resumeData.raw_text || null,
          source: resumeData.parsedText ? "upload" : "editor",
          label: resumeData.changelog || "Resume Studio save",
        },
      });

      await prisma.resume.update({
        where: { id: resume.id },
        data: { currentVersionId: version.id },
      });

      return this.flattenRecord({ ...resume, versions: [version] }, version);
    },
    async createVersion(resumeId: string, _userId: string, content: any, changelog?: string) {
      const count = await prisma.resumeVersion.count({ where: { resumeId } });
      return prisma.resumeVersion.create({
        data: {
          resumeId,
          versionNumber: count + 1,
          content,
          source: "editor",
          label: changelog || "Manual save",
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
          status: skill.verified ? "verified" : skill.source || "learning",
        },
        create: {
          userId,
          name: skill.name,
          category: skill.category || "Technical",
          proficiency: skill.proficiency ?? 70,
          status: skill.verified ? "verified" : skill.source || "learning",
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
    async list(filters?: { type?: string; location?: string; search?: string; workplace?: string; limit?: number }) {
      const where: any = { isExpired: false };
      const and: any[] = [];
      if (filters?.type && filters.type !== "all") {
        and.push({
          OR: [
            { type: { contains: filters.type, mode: "insensitive" } },
            { workplace: { contains: filters.type, mode: "insensitive" } },
          ],
        });
      }
      if (filters?.workplace && filters.workplace !== "all") {
        and.push({ workplace: { contains: filters.workplace, mode: "insensitive" } });
      }
      if (filters?.location) {
        and.push({ location: { contains: filters.location, mode: "insensitive" } });
      }
      if (filters?.search) {
        and.push({
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { companyName: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        });
      }
      if (and.length) where.AND = and;
      return prisma.job.findMany({
        where,
        include: { company: true },
        take: filters?.limit || 80,
        orderBy: { fetchedAt: "desc" },
      });
    },
    async findById(id: string) {
      return prisma.job.findUnique({ where: { id }, include: { company: true } });
    },
    async create(jobData: any) {
      return prisma.job.create({
        data: {
          title: jobData.title,
          companyName: jobData.company || jobData.companyName,
          companyId: jobData.companyId || null,
          location: jobData.location || "",
          type: jobData.type || "Full-time",
          workplace: jobData.workplace || "Hybrid",
          salary: jobData.salary || jobData.salaryText || "",
          description: jobData.description,
          requirements: jobData.requirements || [],
          skillsRequired: jobData.skills || jobData.skillsRequired || [],
          benefits: jobData.benefits || [],
          experience: jobData.experience || "",
          sourceUrl: jobData.applyUrl || jobData.sourceUrl || "",
          source: jobData.source === "live" ? "live" : "catalog",
          externalId: jobData.externalId || jobData.id || undefined,
        },
      });
    },
  },
  companies: {
    async list() {
      return prisma.company.findMany({
        include: { jobs: { where: { isExpired: false } } },
        orderBy: { name: "asc" },
      });
    },
    async findByName(name: string) {
      return prisma.company.findUnique({
        where: { name },
        include: { jobs: { where: { isExpired: false } } },
      });
    },
  },

  // Applications
  applications: {
    async listByUser(userId: string) {
      return prisma.application.findMany({
        where: { userId },
        orderBy: { appliedDate: "desc" },
        include: { job: true },
      });
    },
    async findById(id: string, userId: string) {
      return prisma.application.findFirst({
        where: { id, userId },
      });
    },
    async create(userId: string, data: any) {
      // Schema alignment notes:
      // - `contactPerson` is stored in the schema's `contacts` column.
      // - `matchScore`, `coverLetter` and `history` have no column in
      //   prisma/schema.prisma. They are no longer persisted here. The
      //   status-change audit trail that `history` provided is already recorded
      //   independently as AnalyticsEvent rows ("application_status_updated")
      //   by applications.routes.ts, so no audit capability is lost.
      return prisma.application.create({
        data: {
          userId,
          jobId: data.jobId || null,
          company: data.company,
          role: data.role || data.title,
          location: data.location || "",
          salary: data.salary || "",
          status: data.status || "applied",
          nextStep: data.nextStep || "",
          notes: data.notes || "",
          contacts: data.contactPerson || data.contacts || "",
          jobUrl: data.jobUrl || "",
        },
      });
    },
    async update(id: string, userId: string, data: any) {
      const existing = await prisma.application.findFirst({ where: { id, userId } });
      if (!existing) return null;

      // `history` and `coverLetter` have no column in the schema and are no
      // longer written. Status transitions continue to be recorded as
      // AnalyticsEvent rows by the route layer.
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
          contacts: data.contactPerson !== undefined ? data.contactPerson : existing.contacts,
          jobId: data.jobId !== undefined ? data.jobId : existing.jobId,
        },
        include: { job: true },
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
          messages: { orderBy: { createdAt: "asc" } },
          evaluation: true,
        },
        orderBy: { createdAt: "desc" },
      });
    },
    async findById(id: string, userId: string) {
      return prisma.interview.findFirst({
        where: { id, userId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          evaluation: true,
        },
      });
    },
    async create(userId: string, data: any) {
      // The schema models an interview as role/type/company. The caller's
      // `targetRole` maps to `role` and `companyFocus` maps to `company`.
      // `title` and `difficulty` have no column and are no longer persisted.
      return prisma.interview.create({
        data: {
          userId,
          role: data.targetRole || data.role || "Software Engineer",
          type: data.type || "Technical",
          company: data.companyFocus || data.company || "",
          status: "in_progress",
        },
        include: { messages: true, evaluation: true },
      });
    },
    async addMessage(interviewId: string, sender: string, content: string, metrics?: any) {
      // Schema stores the message body in `text` and the per-turn coaching note
      // in `microFeedback` (previously a JSON blob in `metrics`).
      return prisma.interviewMessage.create({
        data: {
          interviewId,
          sender,
          text: content,
          microFeedback: metrics?.feedbackSnippet || null,
        },
      });
    },
    async saveEvaluation(interviewId: string, evalData: any) {
      // durationMinutes has no other writer (create() defaults it to 0 and
      // never updates it), so it's computed here from the session's real
      // createdAt at the moment the interview is marked completed.
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        select: { createdAt: true },
      });
      const durationMinutes = interview
        ? Math.max(0, Math.round((Date.now() - interview.createdAt.getTime()) / 60000))
        : 0;

      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: "completed", durationMinutes },
      });

      // InterviewEvaluation requires an explicit rubric breakdown. The AI
      // service returns technical / communication / problem-solving scores,
      // which map onto technicalScore / clarityScore / impactScore.
      const rubrics = evalData.rubricScores || evalData.rubrics || {};
      const overall = evalData.overallScore ?? evalData.overall_score ?? 0;
      const payload = {
        overallScore: Number(overall) || 0,
        clarityScore: Number(rubrics.communication ?? rubrics.clarity ?? overall) || 0,
        technicalScore: Number(rubrics.technical ?? overall) || 0,
        impactScore: Number(rubrics.problemSolving ?? rubrics.impact ?? overall) || 0,
        summary: evalData.detailedSummary || evalData.summary || "",
        strengths: evalData.strengths || [],
        improvements: evalData.improvements || [],
        method: evalData.method || "ai",
      };

      return prisma.interviewEvaluation.upsert({
        where: { interviewId },
        update: payload,
        create: { interviewId, ...payload },
      });
    },
  },

  // Roadmaps
  roadmaps: {
    async getActiveByUser(userId: string) {
      // Roadmap.userId is @unique in the schema: a user has at most one
      // roadmap, so the previous `isActive` flag is no longer meaningful.
      return prisma.roadmap.findUnique({
        where: { userId },
        include: { milestones: { orderBy: { sortOrder: "asc" } } },
      });
    },
    async createWithMilestones(userId: string, data: any) {
      // One roadmap per user: regenerating replaces the existing milestone set
      // rather than deactivating an old roadmap and inserting a second one.
      // `title`, `description`, `duration` and `progress` have no column on
      // Roadmap; milestone `category`, `skills` and `resources` have no column
      // on RoadmapMilestone. Milestone `tasks` is a native Json column.
      const milestones = (data.milestones || []).map((m: any, idx: number) => ({
        sortOrder: idx,
        week: m.week || m.weekNumber || idx + 1,
        title: m.title || `Milestone ${idx + 1}`,
        description: m.description || "",
        duration: m.duration || "",
        status: m.status || "todo",
        tasks: m.tasks || [],
      }));

      const existing = await prisma.roadmap.findUnique({ where: { userId } });
      if (existing) {
        await prisma.roadmapMilestone.deleteMany({ where: { roadmapId: existing.id } });
      }

      return prisma.roadmap.upsert({
        where: { userId },
        update: {
          targetRole: data.targetRole || "Software Engineer",
          source: data.source || "skill_gap",
          milestones: { create: milestones },
        },
        create: {
          userId,
          targetRole: data.targetRole || "Software Engineer",
          source: data.source || "skill_gap",
          milestones: { create: milestones },
        },
        include: { milestones: { orderBy: { sortOrder: "asc" } } },
      });
    },
    async updateMilestone(milestoneId: string, status: string) {
      // `completedAt` has no column in the schema.
      return prisma.roadmapMilestone.update({
        where: { id: milestoneId },
        data: { status },
      });
    },
  },

  // Learning
  learning: {
    async listResources() {
      // `enrolled` has no column in the schema; ordering by title keeps the
      // listing deterministic until popularity data exists.
      return prisma.learningResource.findMany({
        orderBy: { title: "asc" },
      });
    },
    async getUserProgress(userId: string) {
      return prisma.learningProgress.findMany({
        where: { userId },
        include: { resource: true },
      });
    },
    async updateProgress(userId: string, resourceId: string, progress: number, _quizScore?: number) {
      // Schema stores percentage in `progressPct` and a `completed` boolean.
      // There is no `quizScore` or `completedAt` column, so the quiz score
      // argument is accepted for call-site compatibility but not persisted.
      // `completedLessonIds` is a required Json column and defaults to [].
      const pct = Math.min(Math.max(Math.round(progress), 0), 100);
      const isCompleted = pct >= 100;
      return prisma.learningProgress.upsert({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
        update: {
          progressPct: pct,
          completed: isCompleted,
        },
        create: {
          userId,
          resourceId,
          progressPct: pct,
          completed: isCompleted,
          completedLessonIds: [],
        },
      });
    },
  },

  // DSA Progress
  dsa: {
    async listByUser(userId: string) {
      // Accessor is `prisma.dsaProgress` (model DsaProgress). The previous
      // `prisma.dSAProgress` resolved to undefined and threw on every call.
      return prisma.dsaProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
    },
    async recordProblem(userId: string, problem: {
      topicSlug: string;
      problemSlug: string;
      status?: string;
      bookmarked?: boolean;
      notes?: string;
    }) {
      // Identity is the compound unique (userId, topicSlug, problemSlug).
      // `title`, `difficulty` and `timeSpentMs` have no column in the schema.
      return prisma.dsaProgress.upsert({
        where: {
          userId_topicSlug_problemSlug: {
            userId,
            topicSlug: problem.topicSlug,
            problemSlug: problem.problemSlug,
          },
        },
        update: {
          status: problem.status || "solved",
          notes: problem.notes ?? undefined,
          bookmarked: problem.bookmarked ?? undefined,
          attempts: { increment: 1 },
        },
        create: {
          userId,
          topicSlug: problem.topicSlug,
          problemSlug: problem.problemSlug,
          status: problem.status || "solved",
          bookmarked: problem.bookmarked ?? false,
          notes: problem.notes || "",
          attempts: 1,
        },
      });
    },
    async resetProgress(userId: string) {
      return prisma.dsaProgress.deleteMany({
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
    async create(userId: string, data: { title: string; message: string; type?: string; link?: string; actionUrl?: string }) {
      // `link` is stored in the schema's `actionUrl` column. `type` is the
      // NotificationType enum; the previous "info" default was not a member of
      // that enum and would have been rejected, so it now defaults to "system".
      const allowedTypes = ["job_match", "interview", "milestone", "learning", "system", "application"];
      const type = data.type && allowedTypes.includes(data.type) ? data.type : "system";
      return prisma.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: type as any,
          actionUrl: data.actionUrl || data.link || "",
        },
      });
    },
    // Route layer calls markAsRead / markAllAsRead; both were missing and threw
    // a TypeError. markAsRead is scoped by userId so a caller cannot mark
    // another user's notification as read.
    async markAsRead(id: string, userId: string) {
      return prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });
    },
    async markAllAsRead(userId: string) {
      return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    },
  },

  // Analytics & Snapshots
  analytics: {
    async recordEvent(userId: string, eventType: string, category: string, metadata?: any) {
      // Schema stores the event name in `type` and everything else in a native
      // Json `payload`. `category` is folded into the payload so the analytics
      // dashboard can still group by it.
      return prisma.analyticsEvent.create({
        data: {
          userId,
          type: eventType,
          payload: { category, ...(metadata || {}) },
        },
      });
    },
    async getEvents(userId: string, limit = 100) {
      return prisma.analyticsEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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
      // CareerSnapshot stores all figures in a single `metrics` Json column.
      const { metadata, ...metrics } = data;
      return prisma.careerSnapshot.create({
        data: {
          userId,
          metrics: { ...metrics, ...(metadata || {}) },
        },
      });
    },
    async getSnapshots(userId: string) {
      return prisma.careerSnapshot.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        take: 30,
      });
    },
  },
};

export default db;
