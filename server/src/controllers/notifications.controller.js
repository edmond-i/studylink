import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Notification type constants
export const NOTIFICATION_TYPES = {
  POST_UPVOTE: 'post_upvote',
  COMMENT_REPLY: 'comment_reply',
  COMMENT_UPVOTE: 'comment_upvote',
  GROUP_INVITATION: 'group_invitation',
  GROUP_MESSAGE: 'group_message',
  GROUP_MEMBER_JOINED: 'group_member_joined',
  AI_CHAT_RESPONSE: 'ai_chat_response',
  BADGE_EARNED: 'badge_earned',
  MENTION: 'mention',
};

/**
 * Create a notification for a user
 * Used internally by other features
 */
export async function createNotification(userId, data) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        content: data.content || data.message,
        link: data.link || data.actionUrl,
        actorId: data.actorId,
        relatedId: data.relatedId,
      },
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
export async function getNotifications(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedOffset = Math.max(0, parseInt(offset));

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        content: true,
        link: true,
        isRead: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parsedLimit,
      skip: parsedOffset,
    });

    const total = await prisma.notification.count({
      where: { userId: req.user.id },
    });

    const normalizedNotifications = notifications.map((notification) => ({
      ...notification,
      title: notification.title || 'Notification',
      message: notification.message || notification.content || '',
      actionUrl: notification.actionUrl || notification.link || '#',
    }));

    res.json({
      notifications: normalizedNotifications,
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a specific notification as read
 */
export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;

    // Verify notification belongs to current user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
      },
      select: {
        id: true,
        isRead: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export async function markAllAsRead(req, res) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      updated: result.count,
      message: `Marked ${result.count} notification(s) as read`,
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
}

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
export async function deleteNotification(req, res) {
  try {
    const { notificationId } = req.params;

    // Verify notification belongs to current user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}

/**
 * GET /api/notifications/unread/count
 * Get count of unread notifications
 */
export async function getUnreadCount(req, res) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}

/**
 * Send notifications to group members when a message is posted
 */
export async function notifyGroupMembers(groupId, messageAuthorId, message) {
  try {
    // Get all group members except sender
    const members = await prisma.user.findMany({
      where: {
        studyGroups: {
          some: {
            id: groupId,
          },
        },
      },
      select: { id: true },
    });

    const notifications = members
      .filter((m) => m.id !== messageAuthorId)
      .map((member) => ({
        userId: member.id,
        type: NOTIFICATION_TYPES.GROUP_MESSAGE,
        title: 'New Group Message',
        message: `${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        actionUrl: `/groups/${groupId}`,
        actorId: messageAuthorId,
        relatedId: groupId,
      }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }
  } catch (err) {
    console.error('Error notifying group members:', err);
  }
}

/**
 * Send notifications to post author when content is upvoted
 */
export async function notifyPostUpvote(postId, voterId) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });

    if (!post || post.authorId === voterId) return;

    await createNotification(post.authorId, {
      type: NOTIFICATION_TYPES.POST_UPVOTE,
      title: 'Post Upvoted',
      message: `Someone upvoted your post: "${post.title.substring(0, 30)}..."`,
      actionUrl: `/forum/posts/${postId}`,
      actorId: voterId,
      relatedId: postId,
    });
  } catch (err) {
    console.error('Error notifying post upvote:', err);
  }
}

/**
 * Send notifications to comment author when replied
 */
export async function notifyCommentReply(commentId, replyAuthorId) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true, content: true },
    });

    if (!comment || comment.authorId === replyAuthorId) return;

    await createNotification(comment.authorId, {
      type: NOTIFICATION_TYPES.COMMENT_REPLY,
      title: 'New Reply',
      message: `Someone replied to your comment: "${comment.content.substring(0, 30)}..."`,
      actionUrl: `/forum/posts/${comment.postId}`,
      actorId: replyAuthorId,
      relatedId: comment.postId,
    });
  } catch (err) {
    console.error('Error notifying comment reply:', err);
  }
}

/**
 * Send notifications when user receives group invitation
 */
export async function notifyGroupInvitation(userId, groupId, groupName, invitedByName) {
  try {
    await createNotification(userId, {
      type: NOTIFICATION_TYPES.GROUP_INVITATION,
      title: 'Study Group Invitation',
      message: `${invitedByName} invited you to join "${groupName}"`,
      actionUrl: `/groups/${groupId}`,
      relatedId: groupId,
    });
  } catch (err) {
    console.error('Error notifying group invitation:', err);
  }
}

/**
 * Send notifications when user earns a badge
 */
export async function notifyBadgeEarned(userId, badgeName, badgeIcon) {
  try {
    await createNotification(userId, {
      type: NOTIFICATION_TYPES.BADGE_EARNED,
      title: 'Achievement Unlocked',
      message: `You've earned the "${badgeName}" badge! ${badgeIcon}`,
      actionUrl: `/profile/${userId}`,
      relatedId: userId,
    });
  } catch (err) {
    console.error('Error notifying badge earned:', err);
  }
}
