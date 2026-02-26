import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Award XP to a user for an action
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @param {number} points - XP points to award
 */
export async function awardXP(userId, action, points) {
  try {
    // Create XP event record for audit trail
    await prisma.xPEvent.create({
      data: {
        userId,
        action,
        points,
      },
    });

    // Update user's total XP
    const user = await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: points } },
    });

    // Check for XP milestones (e.g., every 100 XP)
    if (user.xp % 100 === 0) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'xp_milestone',
          content: `Congrats! You've reached ${user.xp} XP! 🎉`,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('XP award error:', error);
    throw error;
  }
}

/**
 * Get XP leaderboard (global, week/month/all-time)
 * @param {string} period - 'week', 'month', or 'alltime'
 * @param {number} limit - Number of top users (default 100)
 */
export async function getLeaderboard(period = 'week', limit = 100) {
  try {
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date('2000-01-01'); // All time
    }

    // Get users with their XP earned in the period
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        streak: true,
        role: true,
        xpEvents: {
          where: {
            createdAt: { gte: startDate },
          },
          select: { points: true },
        },
      },
      orderBy: { xp: 'desc' },
      take: limit,
    });

    // Calculate earned XP in period
    return leaderboard.map((user, idx) => ({
      ...user,
      rank: idx + 1,
      xpEarned: user.xpEvents.reduce((sum, evt) => sum + evt.points, 0),
    }));
  } catch (error) {
    console.error('Leaderboard error:', error);
    throw error;
  }
}

/**
 * Check and award daily login bonus
 * @param {string} userId - User ID
 */
export async function checkDailyLogin(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActive: true, streak: true },
    });

    if (!user) return null;

    const today = new Date().toDateString();
    const lastActiveDate = user.lastActive?.toDateString();

    // If already active today, no bonus
    if (lastActiveDate === today) {
      return user;
    }

    // Update last active
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() },
    });

    // Check if streak continues (last active was yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterday_str = yesterday.toDateString();

    let newStreak = user.streak + 1;
    if (lastActiveDate !== yesterday_str && user.streak > 0) {
      newStreak = 1; // Reset streak
    }

    // Award XP for daily login
    await awardXP(userId, 'daily_login', 10);

    // Update streak
    await prisma.user.update({
      where: { id: userId },
      data: { streak: newStreak },
    });

    // Award streak bonus at 7 days
    if (newStreak === 7) {
      await awardXP(userId, '7_day_streak_bonus', 100);
      await prisma.badge.upsert({
        where: { userId_name: { userId, name: '7-Day Streak' } },
        update: {},
        create: {
          userId,
          name: '7-Day Streak',
        },
      });
    }

    return updatedUser;
  } catch (error) {
    console.error('Daily login check error:', error);
    throw error;
  }
}
