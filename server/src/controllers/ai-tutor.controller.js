import { PrismaClient } from '@prisma/client';
import { awardXP } from '../services/xp.service.js';

const prisma = new PrismaClient();

// Socratic prompt templates to guide learning
const SOCRATIC_TEMPLATES = [
  "What do you already know about this concept?",
  "Can you explain why that answer makes sense?",
  "Have you encountered a similar problem before?",
  "What would happen if we changed one variable?",
  "Can you break this down into smaller steps?",
  "What are the assumptions here?",
  "Is there a pattern you can identify?",
  "How would you test if your answer is correct?",
  "What's the relationship between these concepts?",
  "Can you approach this from a different angle?",
];

const RESOURCE_MAP = {
  math: [
    { title: "Khan Academy Math", url: "https://www.khanacademy.org/math", name: "Khan Academy" },
    { title: "Desmos Graphing", url: "https://www.desmos.com/calculator", name: "Desmos" },
    { title: "MIT OpenCourseWare Math", url: "https://ocw.mit.edu/search/?q=mathematics", name: "MIT OCW" },
  ],
  science: [
    { title: "Khan Academy Science", url: "https://www.khanacademy.org/science", name: "Khan Academy" },
    { title: "PhET Simulations", url: "https://phet.colorado.edu/", name: "PhET" },
    { title: "MIT OpenCourseWare Science", url: "https://ocw.mit.edu/search/?q=science", name: "MIT OCW" },
  ],
  languages: [
    { title: "Duolingo", url: "https://www.duolingo.com/", name: "Duolingo" },
    { title: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish/", name: "BBC" },
    { title: "Memrise", url: "https://www.memrise.com/", name: "Memrise" },
  ],
  history: [
    { title: "World History Encyclopedia", url: "https://www.worldhistory.org/", name: "WHE" },
    { title: "Khan Academy History", url: "https://www.khanacademy.org/humanities/history", name: "Khan Academy" },
  ],
  programming: [
    { title: "Codecademy", url: "https://www.codecademy.com/", name: "Codecademy" },
    { title: "FreeCodeCamp", url: "https://www.freecodecamp.org/", name: "FreeCodeCamp" },
    { title: "GitHub Learning Lab", url: "https://github.github.io/training-kit/", name: "GitHub" },
  ],
};

/**
 * Start new AI tutor chat session
 * POST /api/ai-tutor/chat/start
 */
export async function startAIChat(req, res) {
  try {
    const { topic, difficulty = 'intermediate' } = req.body;
    const userId = req.user.id;

    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic required (min 3 characters)' });
    }

    const chat = await prisma.aIChat.create({
      data: {
        userId,
        topic: topic.trim(),
        difficulty,
        messages: {
          create: {
            role: 'assistant',
            content: generateInitialMessage(topic, difficulty),
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Award XP for starting a chat
    await awardXP(userId, 'ai_chat_start', 5);

    res.status(201).json(chat);
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ error: 'Failed to start chat' });
  }
}

/**
 * Send message to AI tutor
 * POST /api/ai-tutor/chat/:chatId/message
 */
export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Verify chat belongs to user
    const chat = await prisma.aIChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Add user message
    await prisma.aIChatMessage.create({
      data: {
        role: 'user',
        content: content.trim(),
        chatId,
      },
    });

    // Generate AI response using Socratic method
    const aiResponse = generateSocraticResponse(content, chat.topic, chat.difficulty);

    await prisma.aIChatMessage.create({
      data: {
        role: 'assistant',
        content: aiResponse,
        chatId,
      },
    });

    // Award XP for interaction
    await awardXP(userId, 'ai_chat_message', 3);

    const updatedChat = await prisma.aIChat.findUnique({
      where: { id: chatId },
      include: { messages: true },
    });

    res.json(updatedChat);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * Get conversation history
 * GET /api/ai-tutor/chat/:chatId
 */
export async function getConversation(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await prisma.aIChat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
}

/**
 * End AI chat session
 * POST /api/ai-tutor/chat/:chatId/end
 */
export async function endChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await prisma.aIChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.aIChat.update({
      where: { id: chatId },
      data: {
        endedAt: new Date(),
      },
      include: {
        messages: true,
      },
    });

    // Award bonus XP for completing session
    await awardXP(userId, 'ai_chat_complete', 10);

    res.json(updated);
  } catch (error) {
    console.error('End chat error:', error);
    res.status(500).json({ error: 'Failed to end chat' });
  }
}

/**
 * Get suggested resources for topic
 * GET /api/ai-tutor/resources
 */
export async function getSuggestedResources(req, res) {
  try {
    const { topic = 'general' } = req.query;

    // Match topic to category
    const categoryKey = Object.keys(RESOURCE_MAP).find((key) =>
      topic.toLowerCase().includes(key) || key.includes(topic.toLowerCase())
    ) || 'math';

    const resources = RESOURCE_MAP[categoryKey] || RESOURCE_MAP.math;

    res.json({
      topic,
      category: categoryKey,
      resources,
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
}

/**
 * Helper: Generate initial message
 */
function generateInitialMessage(topic, difficulty) {
  const greetings = [
    `Hello! I'm your AI tutor. Today we're exploring **${topic}**. Let's start by understanding the foundations!`,
    `Welcome! Let's dive into **${topic}**. To get started, can you tell me what you already know about this topic?`,
    `Great choice! We're going to master **${topic}** together. First, ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Helper: Generate Socratic response
 */
function generateSocraticResponse(userMessage, topic, difficulty) {
  const responses = [
    // Encouraging & building on their answer
    `That's a great start! You've identified a key point. Now, ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
    
    // Deepening understanding
    `I like the way you're thinking! Let me challenge you a bit: ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
    
    // Redirecting gently
    `That's interesting! Let me ask you this: ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
    
    // Validating & extending
    `Exactly! You're on the right track. Building on that, ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
    
    // Exploring connections
    `Perfect observation. Here's something to consider: ${SOCRATIC_TEMPLATES[Math.floor(Math.random() * SOCRATIC_TEMPLATES.length)]}`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
