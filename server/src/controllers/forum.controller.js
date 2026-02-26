import { PrismaClient } from '@prisma/client';
import { awardXP } from '../services/xp.service.js';

const prisma = new PrismaClient();

/**
 * Get all forum categories
 * GET /api/forum/categories
 */
export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

/**
 * Get posts by category
 * GET /api/forum/categories/:categorySlug/posts
 */
export async function getPostsByCategory(req, res) {
  try {
    const { categorySlug } = req.params;
    const { sort = 'new', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find category
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build sort option
    let orderBy = { createdAt: 'desc' };
    if (sort === 'hot') {
      orderBy = { votes: { _count: 'desc' } };
    } else if (sort === 'top') {
      orderBy = [
        { votes: { _count: 'desc' } },
        { createdAt: 'desc' },
      ];
    }

    // Fetch posts
    const posts = await prisma.post.findMany({
      where: { categoryId: category.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            xp: true,
          },
        },
        category: { select: { name: true, slug: true } },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
        tags: true,
      },
      orderBy,
      skip,
      take: parseInt(limit),
    });

    // Get total count
    const total = await prisma.post.count({
      where: { categoryId: category.id },
    });

    const postsWithVotes = posts.map((post) => ({
      ...post,
      upvotes: post._count.votes,
      commentCount: post._count.comments,
    }));

    res.json({
      data: postsWithVotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

/**
 * Get single post with comments
 * GET /api/forum/posts/:postId
 */
export async function getPost(req, res) {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            xp: true,
            streak: true,
          },
        },
        category: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                xp: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                votes: true,
              },
            },
            votes: true,
          },
          where: { parentId: null },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      ...post,
      upvotes: post._count.votes,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

/**
 * Create new post
 * POST /api/forum/posts
 */
export async function createPost(req, res) {
  try {
    const { title, content, categoryId, type = 'text', resourceUrl, tags } = req.body;
    const userId = req.user.id;

    // Validate
    if (!title || !content || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        type,
        resourceUrl,
        categoryId,
        authorId: userId,
        tags: {
          create: (tags || []).map((tag) => ({ name: tag })),
        },
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
      },
    });

    // Award XP for creating post
    await awardXP(userId, 'create_post', 15);

    // Award first post badge if this is their first
    const postCount = await prisma.post.count({ where: { authorId: userId } });
    if (postCount === 1) {
      await prisma.badge.upsert({
        where: { userId_name: { userId, name: 'First Post' } },
        update: {},
        create: { userId, name: 'First Post' },
      });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

/**
 * Update post
 * PUT /api/forum/posts/:postId
 */
export async function updatePost(req, res) {
  try {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        tags: tags ? {
          deleteMany: {},
          create: tags.map((tag) => ({ name: tag })),
        } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
}

/**
 * Delete post
 * DELETE /api/forum/posts/:postId
 */
export async function deletePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

/**
 * Create comment on post
 * POST /api/forum/posts/:postId/comments
 */
export async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    // Check post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if parentId is valid if replying
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, xp: true },
        },
      },
    });

    // Award XP for commenting
    await awardXP(userId, 'post_comment', 8);

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

/**
 * Delete comment
 * DELETE /api/forum/comments/:commentId
 */
export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}

/**
 * Vote on post
 * POST /api/forum/posts/:postId/vote
 */
export async function voteOnPost(req, res) {
  try {
    const { postId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId === userId) {
      return res.status(400).json({ error: 'Cannot vote on your own post' });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: { authorId_postId: { authorId: userId, postId } },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Update vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
      }
    } else {
      // Create vote
      await prisma.vote.create({
        data: {
          value,
          authorId: userId,
          postId,
        },
      });

      // Award XP if upvote to post author
      if (value === 1) {
        await awardXP(post.authorId, 'receive_upvote_post', 5);
      }
    }

    const votes = await prisma.vote.findMany({
      where: { postId },
    });

    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;

    res.json({ upvotes, downvotes, score: upvotes - downvotes });
  } catch (error) {
    console.error('Vote on post error:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
}

/**
 * Vote on comment
 * POST /api/forum/comments/:commentId/vote
 */
export async function voteOnComment(req, res) {
  try {
    const { commentId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId === userId) {
      return res.status(400).json({ error: 'Cannot vote on your own comment' });
    }

    const existingVote = await prisma.vote.findUnique({
      where: { authorId_commentId: { authorId: userId, commentId } },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
      }
    } else {
      await prisma.vote.create({
        data: {
          value,
          authorId: userId,
          commentId,
        },
      });

      if (value === 1) {
        await awardXP(comment.authorId, 'receive_upvote_comment', 3);
      }
    }

    const votes = await prisma.vote.findMany({
      where: { commentId },
    });

    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;

    res.json({ upvotes, downvotes, score: upvotes - downvotes });
  } catch (error) {
    console.error('Vote on comment error:', error);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
}
