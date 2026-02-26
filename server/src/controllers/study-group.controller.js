import { PrismaClient } from '@prisma/client';
import { awardXP } from '../services/xp.service.js';

const prisma = new PrismaClient();

/**
 * Get all study groups (with pagination and search)
 * GET /api/groups
 */
export async function getStudyGroups(req, res) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    const groups = await prisma.studyGroup.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true } },
        channels: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.studyGroup.count({
      where: {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      },
    });

    // Add isMember flag
    const groupsWithMembership = groups.map((group) => ({
      ...group,
      isMember: group.members.some((m) => m.id === userId),
      memberCount: group.members.length,
    }));

    res.json({
      data: groupsWithMembership,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

/**
 * Get single study group
 * GET /api/groups/:groupId
 */
export async function getGroupById(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: {
          select: { id: true, name: true, avatar: true, xp: true },
        },
        channels: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some((m) => m.id === userId);
    const isAdmin = group.creator.id === userId;

    res.json({
      ...group,
      isMember,
      isAdmin,
      memberCount: group.members.length,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
}

/**
 * Create new study group
 * POST /api/groups
 */
export async function createStudyGroup(req, res) {
  try {
    const { name, description, category, isPublic = true } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ error: 'Group name must be at least 3 characters' });
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        category: category || 'general',
        subject: category || 'general',
        isPublic,
        ownerId: userId,
        members: {
          connect: { id: userId },
        },
        channels: {
          create: {
            name: 'general',
            description: 'General discussion',
            isPrivate: false,
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
        channels: true,
      },
    });

    // Award XP for creating group
    await awardXP(userId, 'create_study_group', 25);

    res.status(201).json({
      ...group,
      isMember: true,
      isAdmin: true,
      memberCount: 1,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
}

/**
 * Update study group
 * PUT /api/groups/:groupId
 */
export async function updateStudyGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { name, description, category, isPublic } = req.body;
    const userId = req.user.id;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: 'Only group creator can edit' });
    }

    const updated = await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        name: name || group.name,
        description: description !== undefined ? description : group.description,
        category: category || group.category,
        isPublic: isPublic !== undefined ? isPublic : group.isPublic,
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
}

/**
 * Delete study group
 * DELETE /api/groups/:groupId
 */
export async function deleteStudyGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: 'Only group creator can delete' });
    }

    await prisma.studyGroup.delete({
      where: { id: groupId },
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
}

/**
 * Get group members
 * GET /api/groups/:groupId/members
 */
export async function getGroupMembers(req, res) {
  try {
    const { groupId } = req.params;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            avatar: true,
            xp: true,
            email: true,
          },
          orderBy: { xp: 'desc' },
        },
        creator: { select: { id: true } },
      },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      members: group.members,
      creatorId: group.creator.id,
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
}

/**
 * Invite user to group
 * POST /api/groups/:groupId/invite
 */
export async function inviteToGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: 'Only group creator can invite' });
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (invitedUser.id === userId) {
      return res.status(400).json({ error: 'Cannot invite yourself' });
    }

    const isMember = await prisma.studyGroup.findFirst({
      where: {
        id: groupId,
        members: { some: { id: invitedUser.id } },
      },
    });

    if (isMember) {
      return res.status(400).json({ error: 'User already in group' });
    }

    // Add user to group
    const updated = await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: invitedUser.id },
        },
      },
      include: {
        members: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
}

/**
 * Leave group
 * POST /api/groups/:groupId/leave
 */
export async function leaveGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId === userId) {
      return res.status(400).json({ error: 'Creator cannot leave group' });
    }

    await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
}

/**
 * Remove member from group
 * DELETE /api/groups/:groupId/members/:memberId
 */
export async function removeGroupMember(req, res) {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: 'Only group creator can remove members' });
    }

    if (memberId === group.ownerId) {
      return res.status(400).json({ error: 'Cannot remove group creator' });
    }

    await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

/**
 * Get all channels in group
 * GET /api/groups/:groupId/channels
 */
export async function getChannels(req, res) {
  try {
    const { groupId } = req.params;

    const channels = await prisma.channel.findMany({
      where: { groupId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

/**
 * Create new channel
 * POST /api/groups/:groupId/channels
 */
export async function createChannel(req, res) {
  try {
    const { groupId } = req.params;
    const { name, description, isPrivate = false } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Channel name must be at least 2 characters' });
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: { members: { select: { id: true } } },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some((m) => m.id === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    const channel = await prisma.channel.create({
      data: {
        name: name.toLowerCase(),
        description,
        isPrivate,
        groupId,
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
}

/**
 * Get messages from channel
 * GET /api/channels/:channelId/messages
 */
export async function getMessages(req, res) {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.message.count({
      where: { channelId },
    });

    res.json({
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

/**
 * Send message to channel
 * POST /api/channels/:channelId/messages
 */
export async function sendMessage(req, res) {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: { group: { include: { members: { select: { id: true } } } } },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const isMember = channel.group.members.some((m) => m.id === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        channelId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Award XP for messaging
    await awardXP(userId, 'group_message', 2);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * Delete message
 * DELETE /api/messages/:messageId
 */
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.authorId !== userId) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
}
