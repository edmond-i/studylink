import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const BADGES_BY_NAME = Object.values(BADGES).reduce((acc, badge) => {
  acc[badge.name] = badge;
  return acc;
}, {});

async function upsertBadge(userId, badge) {
  const result = await prisma.badge.upsert({
    where: { userId_name: { userId, name: badge.name } },
    update: {},
    create: {
      userId,
      name: badge.name,
      icon: badge.icon,
    },
  });

  return result;
}

export async function evaluateAndAwardBadges(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: { select: { id: true } },
        comments: { select: { id: true } },
        createdGroups: { select: { id: true } },
        messages: { select: { id: true } },
        aiChats: { select: { id: true } },
      },
    });

    if (!user) return [];

    const awarded = [];

    if (user.posts.length > 0) awarded.push(await upsertBadge(userId, BADGES.FIRST_POST));
    if (user.comments.length > 0) awarded.push(await upsertBadge(userId, BADGES.FIRST_COMMENT));
    if (user.createdGroups.length > 0) {
      awarded.push(await upsertBadge(userId, BADGES.STUDY_GROUP_CREATOR));
    }
    if (user.messages.length >= 50) awarded.push(await upsertBadge(userId, BADGES.CHAT_MASTER));
    if (user.aiChats.length >= 10) awarded.push(await upsertBadge(userId, BADGES.KNOWLEDGE_SEEKER));

    const commentUpvotes = await prisma.vote.count({
      where: {
        value: 1,
        comment: {
          authorId: userId,
        },
      },
    });
    if (commentUpvotes >= 20) awarded.push(await upsertBadge(userId, BADGES.HELPFUL_SOUL));

    const forumXP = await prisma.xPEvent.aggregate({
      where: {
        userId,
        action: {
          in: ['create_post', 'post_comment', 'receive_upvote_post', 'receive_upvote_comment'],
        },
      },
      _sum: { points: true },
    });
    if ((forumXP._sum.points || 0) >= 500) awarded.push(await upsertBadge(userId, BADGES.FORUM_EXPERT));

    if (user.xp >= 1000) awarded.push(await upsertBadge(userId, BADGES.RISING_STAR));
    if (user.xp >= 5000) awarded.push(await upsertBadge(userId, BADGES.XP_LEGEND));

    const usersAhead = await prisma.user.count({
      where: { xp: { gt: user.xp } },
    });
    if (usersAhead + 1 <= 10) awarded.push(await upsertBadge(userId, BADGES.TOP_10));

    return awarded.map((badge) => BADGES_BY_NAME[badge.name]).filter(Boolean);
  } catch (err) {
    console.error('Error evaluating badges:', err);
    return [];
  }
}

export async function getLeaderboard(req, res) {
  try {
    const { limit = 50, timeframe = 'all' } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 500);

    if (timeframe === 'weekly' || timeframe === 'monthly') {
      const startDate = new Date();
      if (timeframe === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30);
      }

      const grouped = await prisma.xPEvent.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: startDate } },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: parsedLimit,
      });

      const userIds = grouped.map((row) => row.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          avatar: true,
          rank: true,
          _count: { select: { badges: true } },
        },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      const leaderboard = grouped
        .map((row, index) => {
          const user = userMap.get(row.userId);
          if (!user) return null;

          return {
            rank: index + 1,
            user: {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              rank: user.rank,
            },
            xp: row._sum.points || 0,
            badgesCount: user._count.badges,
          };
        })
        .filter(Boolean);

      return res.json({
        timeframe,
        leaderboard,
        total: leaderboard.length,
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        rank: true,
        xp: true,
        _count: { select: { badges: true } },
      },
      orderBy: { xp: 'desc' },
      take: parsedLimit,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        rank: user.rank,
      },
      xp: user.xp,
      badgesCount: user._count.badges,
    }));

    res.json({
      timeframe: 'all',
      leaderboard,
      total: leaderboard.length,
    });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

export async function getUserBadges(req, res) {
  try {
    const { userId } = req.params;
    const badges = await prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    const detailed = badges.map((badge) => {
      const meta = BADGES_BY_NAME[badge.name];
      return {
        id: badge.id,
        name: badge.name,
        icon: badge.icon || meta?.icon || '🏅',
        description: meta?.description || 'Achievement unlocked',
        rarity: meta?.rarity || 'common',
        earnedAt: badge.earnedAt,
      };
    });

    res.json({
      userId,
      badges: detailed,
      total: detailed.length,
    });
  } catch (err) {
    console.error('Error fetching user badges:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

export async function getAllBadges(req, res) {
  try {
    const badges = Object.values(BADGES);
    res.json({ badges, total: badges.length });
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
}

export async function getUserRank(req, res) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatar: true,
        rank: true,
        xp: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usersAhead = await prisma.user.count({
      where: { xp: { gt: user.xp } },
    });
    const badgesCount = await prisma.badge.count({ where: { userId } });
    const totalContributions = await prisma.xPEvent.count({ where: { userId } });

    res.json({
      user,
      xp: user.xp,
      rank: usersAhead + 1,
      badgesCount,
      totalContributions,
    });
  } catch (err) {
    console.error('Error fetching user rank:', err);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
}

export async function getLeaderboardStats(req, res) {
  try {
    const [totalUsers, totalPosts, totalComments, totalStudyGroups, totalMessages, totalXPAggregate] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.studyGroup.count(),
        prisma.message.count(),
        prisma.user.aggregate({ _sum: { xp: true } }),
      ]);

    res.json({
      stats: {
        totalUsers,
        totalXP: totalXPAggregate._sum.xp || 0,
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
