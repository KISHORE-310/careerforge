import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config, isDemoModeAllowed } from "./config";
import { db } from "../db/repositories";

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
  user?: any;
}

export function createToken(userId: string, email: string): string {
  // Standard 7-day token expiration
  return jwt.sign(
    {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // Demo Token Bypass Check
  if (token === "demo_jwt_token_careerforge") {
    if (!isDemoModeAllowed()) {
      return res.status(403).json({
        success: false,
        message: "Demo authentication is disabled on this server.",
      });
    }

    // Look up or create demo user safely in development
    let demoUser = await db.users.findByEmail("demo@careerforge.ai");
    if (!demoUser) {
      return res.status(401).json({
        success: false,
        message: "Demo user not initialized. Please log in or sign up.",
      });
    }

    (req as AuthenticatedRequest).userId = demoUser.id;
    (req as AuthenticatedRequest).userEmail = demoUser.email;
    (req as AuthenticatedRequest).user = demoUser;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { sub: string; email?: string };
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ success: false, message: "Invalid session token." });
    }

    let user = await db.users.findById(decoded.sub);
    if (!user && decoded.email) {
      user = await db.users.findByEmail(decoded.email);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).userEmail = user.email;
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or corrupted session token.",
      code: "INVALID_TOKEN",
    });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token === "demo_jwt_token_careerforge") {
      if (isDemoModeAllowed()) {
        const demoUser = await db.users.findByEmail("demo@careerforge.ai");
        if (demoUser) {
          (req as AuthenticatedRequest).userId = demoUser.id;
          (req as AuthenticatedRequest).userEmail = demoUser.email;
          (req as AuthenticatedRequest).user = demoUser;
        }
      }
    } else {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as { sub: string; email?: string };
        if (decoded && decoded.sub) {
          const user = await db.users.findById(decoded.sub);
          if (user) {
            (req as AuthenticatedRequest).userId = user.id;
            (req as AuthenticatedRequest).userEmail = user.email;
            (req as AuthenticatedRequest).user = user;
          }
        }
      } catch {
        // Safe to ignore for optional auth
      }
    }
  }
  next();
}
