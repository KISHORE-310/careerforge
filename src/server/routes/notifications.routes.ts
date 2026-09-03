import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const notifications = await db.notifications.listByUser(userId);

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      link: n.actionUrl,
      action_url: n.actionUrl,
      created_at: n.createdAt.toISOString(),
    }));

    const unreadCount = formatted.filter((n) => !n.read).length;

    res.json({
      success: true,
      count: formatted.length,
      unread_count: unreadCount,
      notifications: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve notifications." });
  }
});

// POST /api/notifications/:id/read
notificationsRouter.post("/:id/read", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    await db.notifications.markAsRead(req.params.id, userId);
    res.json({ success: true, message: "Notification marked as read." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update notification." });
  }
});

// POST / PUT /api/notifications/read-all
const markAllReadHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    await db.notifications.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to mark all as read." });
  }
};

notificationsRouter.post("/read-all", authenticateToken, markAllReadHandler);
notificationsRouter.put("/read-all", authenticateToken, markAllReadHandler);
