import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Badge definitions
const BADGES = {
  FIRST_POST: {
    id: 'first_post',
    name: 'First Post',
    description: 'Created your first forum post',
    icon: '🚀',
    rarity: 'common',
  },
  FIRST_COMMENT: {
    id: 'first_comment',
    name: 'First Comment',
    description: 'Left your first comment',
    icon: '💬',
    rarity: 'common',
  },
  STUDY_GROUP_CREATOR: {
    id: 'study_group_creator',
    name: 'Group Founder',
    description: 'Created your first study group',
    icon: '👥',
    rarity: 'common',
  },
  CHAT_MASTER: {
    id: 'chat_master',
    name: 'Chat Master',
    description: 'Sent 50+ messages in study groups',
    icon: '💻',
    rarity: 'rare',
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Started 10+ AI tutor conversations',
    icon: '🧠',
    rarity: 'rare',
  },
  HELPFUL_SOUL: {
    id: 'helpful_soul',
    name: 'Helpful Soul',
    description: 'Received 20+ upvotes on comments',
    icon: '🤝',
    rarity: 'rare',
  },
  FORUM_EXPERT: {
    id: 'forum_expert',
    name: 'Forum Expert',
    description: 'Earned 500+ XP from forum activities',
    icon: '📚',
    rarity: 'epic',
  },
  RISING_STAR: {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reached 1000+ total XP',
    icon: '⭐',
    rarity: 'epic',
  },
  XP_LEGEND: {
    id: 'xp_legend',
    name: 'XP Legend',
    description: 'Accumulated 5000+ total XP',
    icon: '👑',
    rarity: 'legendary',
  },
  TOP_10: {
    id: 'top_10',
    name: 'Top 10',
    description: 'Ranked in top 10 of leaderboard',
    icon: '🏆',
    rarity: 'legendary',
  },
};

/**
 * Evaluate and award badges to a user based on their activity
 */
export async function evaluateAndAwardBadges(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        comments: true,
        studyGroups: true,
        messages: true,
        aiChats: true,
      },
    });

    if (!user) return [];

    const awardedBadges = [];

    // FIRST_POST - has at least 1 post
    if (user.posts.length > 0) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.FIRST_POST.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.FIRST_POST.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.FIRST_POST);
      }
    }

    // FIRST_COMMENT - has at least 1 comment
    if (user.comments.length > 0) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.FIRST_COMMENT.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.FIRST_COMMENT.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.FIRST_COMMENT);
      }
    }

    // STUDY_GROUP_CREATOR - created at least 1 group
    if (user.studyGroups.length > 0) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.STUDY_GROUP_CREATOR.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.STUDY_GROUP_CREATOR.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.STUDY_GROUP_CREATOR);
      }
    }

    // CHAT_MASTER - 50+ messages
    if (user.messages.length >= 50) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.CHAT_MASTER.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.CHAT_MASTER.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.CHAT_MASTER);
      }
    }

    // KNOWLEDGE_SEEKER - 10+ AI tutor conversations
    if (user.aiChats.length >= 10) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.KNOWLEDGE_SEEKER.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.KNOWLEDGE_SEEKER.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.KNOWLEDGE_SEEKER);
      }
    }

    // HELPFUL_SOUL - 20+ upvotes on comments
    const upvoteCount = await prisma.vote.count({
      where: {
        userId,
        vote: 1,
        comment: {
          isNot: null,
        },
      },
    });

    if (upvoteCount >= 20) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.HELPFUL_SOUL.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.HELPFUL_SOUL.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.HELPFUL_SOUL);
      }
    }

    // FORUM_EXPERT - 500+ XP from forums
    const forumXP = await prisma.xPEvent.aggregate({
      where: {
        userId,
        source: { in: ['post', 'comment', 'upvote'] },
      },
      _sum: {
        points: true,
      },
    });

    if ((forumXP._sum.points || 0) >= 500) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.FORUM_EXPERT.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.FORUM_EXPERT.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.FORUM_EXPERT);
      }
    }

    // RISING_STAR - 1000+ total XP
    const totalXP = await prisma.xPEvent.aggregate({
      where: { userId },
      _sum: { points: true },
    });

    if ((totalXP._sum.points || 0) >= 1000) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.RISING_STAR.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.RISING_STAR.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.RISING_STAR);
      }
    }

    // XP_LEGEND - 5000+ total XP
    if ((totalXP._sum.points || 0) >= 5000) {
      const hasBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId: BADGES.XP_LEGEND.id,
          },
        },
      });
      if (!hasBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeId: BADGES.XP_LEGEND.id,
            earnedAt: new Date(),
          },
        });
        awardedBadges.push(BADGES.XP_LEGEND);
      }
    }

    return awardedBadges;
  } catch (err) {
    console.error('Error evaluating badges:', err);
    return [];
  }
}

/**
 * GET /api/leaderboard
 * Get leaderboard with top users by XP
 */
export async function getLeaderboard(req, res) {
  try {
    const { limit = 50, timeframe = 'all' } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 500);

    let dateFilter = {};
    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneWeekAgo } };
    } else if (timeframe === 'monthly') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: oneMonthAgo } };
    }

    // Get top users with XP
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        rank: true,
        userBadges: {
          select: {
            badgeId: true,
          },
        },
        xpEvents: {
          where: dateFilter,
          select: {
            points: true,
          },
        },
      },
      orderBy: {
        xpEvents: {
          _sum: {
            points: 'desc',
          },
        },
      },
      take: parsedLimit,
    });

    // Calculate XP and add rank
    const leaderboardWithXP = leaderboard.map((user, index) => {
      const totalXP = user.xpEvents.reduce((sum, event) => sum + event.points, 0);
      return {
        rank: index + 1,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rank: user.rank,
        },
        xp: totalXP,
        badgesCount: user.userBadges.length,
      };
    });

    res.json({
      timeframe,
      leaderboard: leaderboardWithXP,
      total: leaderboardWithXP.length,
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

/**
 * GET /api/leaderboard/user/:userId/badges
 * Get all badges earned by a user
 */
export async function getUserBadges(req, res) {
  try {
    const { userId } = req.params;

    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: {
        badgeId: true,
        earnedAt: true,
      },
    });

    const badgesWithDetails = userBadges.map((ub) => {
      const badgeInfo = Object.values(BADGES).find((b) => b.id === ub.badgeId);
      return {
        ...badgeInfo,
        earnedAt: ub.earnedAt,
      };
    });

    res.json({
      userId,
      badges: badgesWithDetails,
      total: badgesWithDetails.length,
    });
  } catch (err) {
    console.error('Error fetching user badges:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

/**
 * GET /api/leaderboard/badges/all
 * Get all available badges
 */
export async function getAllBadges(req, res) {
  try {
    const badges = Object.values(BADGES);
    res.json({
      badges,
      total: badges.length,
    });
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

/**
 * GET /api/leaderboard/user/:userId/rank
 * Get user's rank and stats
 */
export async function getUserRank(req, res) {
  try {
    const { userId } = req.params;

    // Get user's total XP
    const xpStats = await prisma.xPEvent.aggregate({
      where: { userId },
      _sum: { points: true },
      _count: true,
    });

    const totalXP = xpStats._sum.points || 0;

    // Count how many users have more XP
    const usersWithMoreXP = await prisma.user.count({
      where: {
        xpEvents: {
          some: {
            points: { gt: 0 },
          },
        },
      },
    });

    // Get user rank more accurately
    const allUsersXP = await prisma.xPEvent.groupBy({
      by: ['userId'],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: 'desc',
        },
      },
    });

    const userRank = allUsersXP.findIndex((u) => u.userId === userId) + 1;

    // Get user's badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatar: true,
        rank: true,
      },
    });

    res.json({
      user,
      xp: totalXP,
      rank: userRank || 'Unranked',
      badgesCount: userBadges.length,
      totalContributions: xpStats._count,
    });
  } catch (err) {
    console.error('Error fetching user rank:', err);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
}

/**
 * GET /api/leaderboard/stats
 * Get overall leaderboard statistics
 */
export async function getLeaderboardStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();

    const totalXP = await prisma.xPEvent.aggregate({
      _sum: { points: true },
    });

    const totalPosts = await prisma.post.count();
    const totalComments = await prisma.comment.count();
    const totalStudyGroups = await prisma.studyGroup.count();
    const totalMessages = await prisma.message.count();

    res.json({
      stats: {
        totalUsers,
        totalXP: totalXP._sum.points || 0,
        totalPosts,
        totalComments,
        totalStudyGroups,
        totalMessages,
      },
    });
  } catch (err) {
    console.error('Error fetching leaderboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
