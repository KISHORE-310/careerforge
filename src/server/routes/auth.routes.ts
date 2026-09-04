import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db/repositories";
import { config, isDemoModeAllowed } from "../config";
import { authLimiter, validateBody } from "../security";
import { createToken, authenticateToken, AuthenticatedRequest } from "../auth";
import { SignupSchema, LoginSchema } from "../schemas";

export const authRouter = Router();

// Demo Authentication (controlled by DEMO_MODE)
authRouter.post(["/demo", "/auth/demo"], authLimiter, async (_req: Request, res: Response) => {
  if (!isDemoModeAllowed()) {
    return res.status(403).json({
      success: false,
      message: "Demo authentication is disabled on this environment. Please sign up or log in.",
    });
  }

  try {
    let demoUser = await db.users.findByEmail("demo@careerforge.ai");
    if (!demoUser) {
      const hash = await bcrypt.hash("password123", 10);
      demoUser = await db.users.create({
        email: "demo@careerforge.ai",
        passwordHash: hash,
        name: "Alex Mercer",
        profile: {
          title: "Senior Full Stack Engineer",
          targetRole: "Senior Full Stack Engineer",
          targetSalary: 175000,
          experienceLevel: "Senior",
          location: "San Francisco, CA",
        },
      });
      // The demo account ships with a pre-filled profile, so it should
      // genuinely skip onboarding rather than just claim to in the response.
      await db.users.completeOnboarding(demoUser.id);
      demoUser = await db.users.findById(demoUser.id);
    }

    const token = createToken(demoUser.id, demoUser.email);
    return res.json({
      success: true,
      message: "Logged in as demo candidate.",
      access_token: token,
      token_type: "bearer",
      user: {
        id: demoUser.id,
        full_name: demoUser.name,
        email: demoUser.email,
        target_role: demoUser.profile?.targetRole || "Senior Full Stack Engineer",
        onboarding_completed: demoUser.onboardingCompleted,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Authentication service encountered an error." });
  }
});

// Signup Route (Rate limited + Zod validated)
authRouter.post(
  ["/signup", "/auth/signup"],
  authLimiter,
  validateBody(SignupSchema),
  async (req: Request, res: Response) => {
    try {
      const { full_name, email, password } = req.body;
      const cleanEmail = email.trim().toLowerCase();
      const existing = await db.users.findByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({ success: false, message: "An account with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const displayName = (full_name || "").trim() || "Candidate";

      const newUser = await db.users.create({
        email: cleanEmail,
        passwordHash: hashedPassword,
        name: displayName,
        profile: {
          title: "Software Engineer",
          targetRole: "Software Engineer",
          experienceLevel: "Entry / Mid-Level",
        },
      });

      // Initial welcome notification
      await db.notifications.create(newUser.id, {
        title: "Welcome to CareerForge AI",
        message: "Complete your profile and upload your resume to activate intelligent job matching.",
        type: "system",
        link: "/profile",
      });

      const token = createToken(newUser.id, cleanEmail);
      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        access_token: token,
        token_type: "bearer",
        user: {
          id: newUser.id,
          full_name: newUser.name,
          email: newUser.email,
          onboarding_completed: newUser.onboardingCompleted,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Registration service encountered an error." });
    }
  }
);

// Login Route (Rate limited + Zod validated)
authRouter.post(
  ["/login", "/auth/login"],
  authLimiter,
  validateBody(LoginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = email.trim().toLowerCase();
      const user = await db.users.findByEmailWithPassword(cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password. Please verify credentials." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password. Please verify credentials." });
      }

      const token = createToken(user.id, cleanEmail);
      return res.json({
        success: true,
        message: "Login successful!",
        access_token: token,
        token_type: "bearer",
        user: {
          id: user.id,
          full_name: user.name,
          email: user.email,
          target_role: user.profile?.targetRole || "Software Engineer",
          onboarding_completed: user.onboardingCompleted,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Authentication service encountered an error." });
    }
  }
);

// Logout Route
authRouter.post(["/logout", "/auth/logout"], (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Logged out successfully. Token cleared.",
  });
});

// Current User Profile (`/api/auth/me`)
// The path array previously contained only "/auth/me". Mounted at "/api/auth",
// that resolved to "/api/auth/auth/me", so the "/api/auth/me" call the frontend
// makes returned 404. "/me" is added; "/auth/me" is retained for the "/auth"
// and "/demo" top-level mounts in server.ts.
authRouter.get(["/me", "/auth/me"], authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.name,
        email: user.email,
        target_role: user.profile?.targetRole || "Software Engineer",
        target_salary: user.profile?.targetSalary ? `$${user.profile.targetSalary.toLocaleString()}` : "$140,000",
        experience_level: user.profile?.experienceLevel || "Mid-Level",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        phone: user.profile?.phone || "",
        github: user.profile?.github || "",
        linkedin: user.profile?.linkedin || "",
        portfolio: user.profile?.portfolio || "",
        onboarding_completed: user.onboardingCompleted,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve authenticated user." });
  }
});
