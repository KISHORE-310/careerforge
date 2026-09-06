-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn');
-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('catalog', 'live');
-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('in_progress', 'completed');
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('job_match', 'interview', 'milestone', 'learning', 'system', 'application');
-- CreateTable
CREATE TABLE "User" (    "id" TEXT NOT NULL,    "email" TEXT NOT NULL,    "passwordHash" TEXT NOT NULL,    "fullName" TEXT NOT NULL,    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Profile" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "targetRole" TEXT NOT NULL DEFAULT 'Software Engineer',    "targetSalary" TEXT NOT NULL DEFAULT '',    "experienceLevel" TEXT NOT NULL DEFAULT '',    "bio" TEXT NOT NULL DEFAULT '',    "location" TEXT NOT NULL DEFAULT '',    "phone" TEXT NOT NULL DEFAULT '',    "linkedin" TEXT NOT NULL DEFAULT '',    "github" TEXT NOT NULL DEFAULT '',    "portfolio" TEXT NOT NULL DEFAULT '',    "careerGoal" TEXT NOT NULL DEFAULT '',    "avatar" TEXT NOT NULL DEFAULT '',    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "UserSettings" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "jobMatchAlerts" BOOLEAN NOT NULL DEFAULT true,    "interviewReminders" BOOLEAN NOT NULL DEFAULT true,    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,    "aiTone" TEXT NOT NULL DEFAULT 'professional',    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "RefreshToken" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "tokenHash" TEXT NOT NULL,    "expiresAt" TIMESTAMP(3) NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Resume" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "currentVersionId" TEXT,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "ResumeVersion" (    "id" TEXT NOT NULL,    "resumeId" TEXT NOT NULL,    "versionNumber" INTEGER NOT NULL,    "content" JSONB NOT NULL,    "extractedText" TEXT,    "source" TEXT NOT NULL,    "label" TEXT NOT NULL DEFAULT '',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Skill" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "name" TEXT NOT NULL,    "category" TEXT NOT NULL DEFAULT 'Technical',    "proficiency" INTEGER NOT NULL DEFAULT 50,    "status" TEXT NOT NULL DEFAULT 'learning',    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Company" (    "id" TEXT NOT NULL,    "name" TEXT NOT NULL,    "industry" TEXT NOT NULL DEFAULT '',    "headquarters" TEXT NOT NULL DEFAULT '',    "size" TEXT NOT NULL DEFAULT '',    "rating" DOUBLE PRECISION,    "recommendRate" INTEGER,    "hiringVelocity" TEXT NOT NULL DEFAULT '',    "avgSalary" TEXT NOT NULL DEFAULT '',    "techStack" JSONB NOT NULL,    "culture" TEXT NOT NULL DEFAULT '',    "description" TEXT NOT NULL DEFAULT '',    "openRolesCount" INTEGER NOT NULL DEFAULT 0,    "source" "JobSource" NOT NULL DEFAULT 'catalog',    CONSTRAINT "Company_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Job" (    "id" TEXT NOT NULL,    "externalId" TEXT,    "title" TEXT NOT NULL,    "companyId" TEXT,    "companyName" TEXT NOT NULL,    "location" TEXT NOT NULL DEFAULT '',    "salary" TEXT NOT NULL DEFAULT '',    "equity" TEXT NOT NULL DEFAULT '',    "type" TEXT NOT NULL DEFAULT 'Full-time',    "experience" TEXT NOT NULL DEFAULT '',    "workplace" TEXT NOT NULL DEFAULT 'Remote',    "department" TEXT NOT NULL DEFAULT '',    "description" TEXT NOT NULL,    "requirements" JSONB NOT NULL,    "skillsRequired" JSONB NOT NULL,    "benefits" JSONB NOT NULL,    "source" "JobSource" NOT NULL DEFAULT 'catalog',    "sourceUrl" TEXT NOT NULL DEFAULT '',    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "expiresAt" TIMESTAMP(3),    "isExpired" BOOLEAN NOT NULL DEFAULT false,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "Job_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "SavedJob" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "jobId" TEXT NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Application" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "jobId" TEXT,    "company" TEXT NOT NULL,    "role" TEXT NOT NULL,    "location" TEXT NOT NULL DEFAULT '',    "salary" TEXT NOT NULL DEFAULT '',    "status" "ApplicationStatus" NOT NULL DEFAULT 'applied',    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "jobUrl" TEXT NOT NULL DEFAULT '',    "notes" TEXT NOT NULL DEFAULT '',    "contacts" TEXT NOT NULL DEFAULT '',    "nextStep" TEXT NOT NULL DEFAULT '',    "followUpAt" TIMESTAMP(3),    "interviewAt" TIMESTAMP(3),    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Application_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Interview" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "role" TEXT NOT NULL,    "type" TEXT NOT NULL,    "company" TEXT NOT NULL DEFAULT '',    "status" "InterviewStatus" NOT NULL DEFAULT 'in_progress',    "durationMinutes" INTEGER NOT NULL DEFAULT 0,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "InterviewMessage" (    "id" TEXT NOT NULL,    "interviewId" TEXT NOT NULL,    "sender" TEXT NOT NULL,    "text" TEXT NOT NULL,    "microFeedback" TEXT,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "InterviewMessage_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "InterviewEvaluation" (    "id" TEXT NOT NULL,    "interviewId" TEXT NOT NULL,    "overallScore" INTEGER NOT NULL,    "clarityScore" INTEGER NOT NULL,    "technicalScore" INTEGER NOT NULL,    "impactScore" INTEGER NOT NULL,    "summary" TEXT NOT NULL,    "strengths" JSONB NOT NULL,    "improvements" JSONB NOT NULL,    "method" TEXT NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Roadmap" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "targetRole" TEXT NOT NULL,    "source" TEXT NOT NULL DEFAULT 'skill_gap',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "RoadmapMilestone" (    "id" TEXT NOT NULL,    "roadmapId" TEXT NOT NULL,    "week" INTEGER NOT NULL,    "title" TEXT NOT NULL,    "description" TEXT NOT NULL,    "duration" TEXT NOT NULL DEFAULT '',    "status" TEXT NOT NULL DEFAULT 'todo',    "sortOrder" INTEGER NOT NULL DEFAULT 0,    "tasks" JSONB NOT NULL,    CONSTRAINT "RoadmapMilestone_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "LearningResource" (    "id" TEXT NOT NULL,    "skill" TEXT NOT NULL,    "title" TEXT NOT NULL,    "category" TEXT NOT NULL,    "duration" TEXT NOT NULL,    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 1,    "difficulty" TEXT NOT NULL,    "type" TEXT NOT NULL,    "description" TEXT NOT NULL,    "lessons" JSONB NOT NULL,    "quiz" JSONB,    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "LearningProgress" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "resourceId" TEXT NOT NULL,    "completedLessonIds" JSONB NOT NULL,    "progressPct" INTEGER NOT NULL DEFAULT 0,    "completed" BOOLEAN NOT NULL DEFAULT false,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "DsaProgress" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "topicSlug" TEXT NOT NULL,    "problemSlug" TEXT NOT NULL,    "status" TEXT NOT NULL DEFAULT 'unsolved',    "bookmarked" BOOLEAN NOT NULL DEFAULT false,    "notes" TEXT NOT NULL DEFAULT '',    "attempts" INTEGER NOT NULL DEFAULT 0,    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "DsaProgress_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "Notification" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "title" TEXT NOT NULL,    "message" TEXT NOT NULL,    "type" "NotificationType" NOT NULL DEFAULT 'system',    "read" BOOLEAN NOT NULL DEFAULT false,    "actionUrl" TEXT NOT NULL DEFAULT '',    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "AnalyticsEvent" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "type" TEXT NOT NULL,    "payload" JSONB NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "CareerSnapshot" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "metrics" JSONB NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "CareerSnapshot_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "CoachMessage" (    "id" TEXT NOT NULL,    "userId" TEXT NOT NULL,    "sender" TEXT NOT NULL,    "text" TEXT NOT NULL,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,    CONSTRAINT "CoachMessage_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "MarketInsight" (    "id" TEXT NOT NULL,    "kind" TEXT NOT NULL,    "payload" JSONB NOT NULL,    "source" TEXT NOT NULL DEFAULT 'catalog',    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id"));
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");
-- CreateIndex
CREATE INDEX "ResumeVersion_resumeId_idx" ON "ResumeVersion"("resumeId");
-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_resumeId_versionNumber_key" ON "ResumeVersion"("resumeId", "versionNumber");
-- CreateIndex
CREATE INDEX "Skill_userId_idx" ON "Skill"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "Skill_userId_name_key" ON "Skill"("userId", "name");
-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
-- CreateIndex
CREATE INDEX "Job_companyName_idx" ON "Job"("companyName");
-- CreateIndex
CREATE INDEX "Job_title_idx" ON "Job"("title");
-- CreateIndex
CREATE UNIQUE INDEX "Job_source_externalId_key" ON "Job"("source", "externalId");
-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");
-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");
-- CreateIndex
CREATE INDEX "InterviewMessage_interviewId_idx" ON "InterviewMessage"("interviewId");
-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_interviewId_key" ON "InterviewEvaluation"("interviewId");
-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_userId_key" ON "Roadmap"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_resourceId_key" ON "LearningProgress"("userId", "resourceId");
-- CreateIndex
CREATE INDEX "DsaProgress_userId_idx" ON "DsaProgress"("userId");
-- CreateIndex
CREATE UNIQUE INDEX "DsaProgress_userId_topicSlug_problemSlug_key" ON "DsaProgress"("userId", "topicSlug", "problemSlug");
-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_type_createdAt_idx" ON "AnalyticsEvent"("userId", "type", "createdAt");
-- CreateIndex
CREATE INDEX "CareerSnapshot_userId_createdAt_idx" ON "CareerSnapshot"("userId", "createdAt");
-- CreateIndex
CREATE INDEX "CoachMessage_userId_createdAt_idx" ON "CoachMessage"("userId", "createdAt");
-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "InterviewMessage" ADD CONSTRAINT "InterviewMessage_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "RoadmapMilestone" ADD CONSTRAINT "RoadmapMilestone_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "DsaProgress" ADD CONSTRAINT "DsaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CareerSnapshot" ADD CONSTRAINT "CareerSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;