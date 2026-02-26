import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Resource categories
export const RESOURCE_CATEGORIES = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    description: 'Algebra, Calculus, Geometry & more',
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Physics, Chemistry, Biology',
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: '🌍',
    description: 'Learn new languages',
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    description: 'Code, Web Dev, Databases',
  },
  {
    id: 'history',
    name: 'History',
    icon: '📚',
    description: 'World history & events',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '📊',
    description: 'Economics, Finance & Management',
  },
  {
    id: 'arts',
    name: 'Arts & Humanities',
    icon: '🎨',
    description: 'Literature, Philosophy & Culture',
  },
  {
    id: 'test-prep',
    name: 'Test Prep',
    icon: '✏️',
    description: 'SAT, ACT, GRE & More',
  },
];

// Sample resources - in production, these would be in database
const DEFAULT_RESOURCES = [
  {
    id: '1',
    title: 'Khan Academy',
    category: 'math',
    description: 'Free online courses in math, science, and more',
    url: 'https://www.khanacademy.org',
    icon: '👨‍🏫',
    rating: 5,
    isPremium: false,
    tags: ['math', 'science', 'free', 'interactive'],
  },
  {
    id: '2',
    title: 'MIT OpenCourseWare',
    category: 'science',
    description: 'Free MIT courses available online',
    url: 'https://ocw.mit.edu',
    icon: '🏛️',
    rating: 5,
    isPremium: false,
    tags: ['science', 'engineering', 'programming', 'free'],
  },
  {
    id: '3',
    title: 'Duolingo',
    category: 'languages',
    description: 'Learn languages through gamified lessons',
    url: 'https://www.duolingo.com',
    icon: '🦉',
    rating: 4,
    isPremium: false,
    tags: ['languages', 'gamified', 'mobile', 'free'],
  },
  {
    id: '4',
    title: 'FreeCodeCamp',
    category: 'programming',
    description: 'Free coding tutorials and certifications',
    url: 'https://www.freecodecamp.org',
    icon: '🎓',
    rating: 5,
    isPremium: false,
    tags: ['programming', 'web-dev', 'free', 'certificates'],
  },
  {
    id: '5',
    title: 'World History Encyclopedia',
    category: 'history',
    description: 'Free encyclopedia of world history',
    url: 'https://www.worldhistory.org',
    icon: '📖',
    rating: 4,
    isPremium: false,
    tags: ['history', 'reference', 'free'],
  },
  {
    id: '6',
    title: 'Codecademy',
    category: 'programming',
    description: 'Interactive coding lessons and projects',
    url: 'https://www.codecademy.com',
    icon: '💡',
    rating: 4,
    isPremium: true,
    tags: ['programming', 'interactive', 'projects'],
  },
  {
    id: '7',
    title: 'PhET Simulations',
    category: 'science',
    description: 'Interactive physics and chemistry simulations',
    url: 'https://phet.colorado.edu',
    icon: '🧪',
    rating: 5,
    isPremium: false,
    tags: ['science', 'physics', 'chemistry', 'interactive', 'free'],
  },
  {
    id: '8',
    title: 'Coursera',
    category: 'business',
    description: 'Online courses from top universities',
    url: 'https://www.coursera.org',
    icon: '🎯',
    rating: 4,
    isPremium: true,
    tags: ['business', 'certificates', 'university-courses'],
  },
];

/**
 * GET /api/resources/categories
 * Get all resource categories
 */
export async function getCategories(req, res) {
  try {
    res.json({ categories: RESOURCE_CATEGORIES });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

/**
 * GET /api/resources
 * Get resources with optional filtering
 */
export async function getResources(req, res) {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedOffset = Math.max(0, parseInt(offset));

    let filtered = DEFAULT_RESOURCES;

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.category === category);
    }

    // Search
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    const total = filtered.length;
    const resources = filtered.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
      resources,
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
}

/**
 * GET /api/resources/:resourceId
 * Get a specific resource
 */
export async function getResourceById(req, res) {
  try {
    const { resourceId } = req.params;
    const resource = DEFAULT_RESOURCES.find((r) => r.id === resourceId);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (err) {
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
}

/**
 * POST /api/resources/:resourceId/save
 * Save a resource to user's library
 */
export async function saveResource(req, res) {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    // Check if resource exists
    const resource = DEFAULT_RESOURCES.find((r) => r.id === resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Save resource
    const saved = await prisma.savedResource.create({
      data: {
        userId,
        url: resource.url,
        title: resource.title,
        description: resource.description,
        thumbnail: resource.icon, // Using icon as thumbnail
        subject: resource.category,
        tags: JSON.stringify(resource.tags || []),
      },
    });

    res.json({ message: 'Resource saved', saved });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Resource already saved' });
    }
    console.error('Error saving resource:', err);
    res.status(500).json({ error: 'Failed to save resource' });
  }
}

/**
 * GET /api/resources/saved/list
 * Get user's saved resources
 */
export async function getSavedResources(req, res) {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const parsedLimit = Math.min(parseInt(limit), 100);
    const parsedOffset = Math.max(0, parseInt(offset));

    const saved = await prisma.savedResource.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        thumbnail: true,
        subject: true,
        tags: true,
        savedAt: true,
      },
      orderBy: { savedAt: 'desc' },
      take: parsedLimit,
      skip: parsedOffset,
    });

    // Transform to match resource format
    const resourcesFormatted = saved.map((s) => {
      // Map saved resource back to DEFAULT_RESOURCES if it matches, for consistency
      const defaultResource = DEFAULT_RESOURCES.find((r) => r.url === s.url);
      return defaultResource || {
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.subject,
        url: s.url,
        icon: s.thumbnail,
        rating: 4,
        isPremium: false,
        tags: (() => {
          try {
            return JSON.parse(s.tags || '[]');
          } catch {
            return [];
          }
        })(),
      };
    });

    const total = await prisma.savedResource.count({
      where: { userId: req.user.id },
    });

    res.json({
      resources: resourcesFormatted,
      total,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  } catch (err) {
    console.error('Error fetching saved resources:', err);
    res.status(500).json({ error: 'Failed to fetch saved resources' });
  }
}

/**
 * DELETE /api/resources/:resourceId/save
 * Remove a resource from user's library
 */
export async function removeSavedResource(req, res) {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    // Find the resource to get its URL
    const resource = DEFAULT_RESOURCES.find((r) => r.id === resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const deleted = await prisma.savedResource.deleteMany({
      where: {
        userId,
        url: resource.url,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Saved resource not found' });
    }

    res.json({ message: 'Resource removed from library', deleted });
  } catch (err) {
    console.error('Error removing resource:', err);
    res.status(500).json({ error: 'Failed to remove resource' });
  }
}

/**
 * POST /api/resources
 * Create a new resource (admin only)
 */
export async function createResource(req, res) {
  try {
    const { title, category, description, url, icon, tags } = req.body;

    // Validate required fields
    if (!title || !category || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, you would save to database
    // For now, just validate and return
    const newResource = {
      id: Date.now().toString(),
      title,
      category,
      description,
      url,
      icon: icon || '📚',
      rating: 4,
      isPremium: false,
      tags: tags || [],
    };

    res.json({
      message: 'Resource created',
      resource: newResource,
    });
  } catch (err) {
    console.error('Error creating resource:', err);
    res.status(500).json({ error: 'Failed to create resource' });
  }
}
