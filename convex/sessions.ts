import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Generate a random 6-character access code
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Get session by access code
export const getByAccessCode = query({
  args: { accessCode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_code', (q) => q.eq('accessCode', args.accessCode.toUpperCase()))
      .first();

    if (!session) return null;

    // Get the quiz details
    const quiz = await ctx.db.get(session.quizId);

    return { ...session, quiz };
  }
});

// Get session by ID with full details
export const get = query({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    const quiz = await ctx.db.get(session.quizId);
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_session', (q) => q.eq('sessionId', args.id))
      .collect();

    return { ...session, quiz, participants };
  }
});

// Get active sessions for a host
export const listByHost = query({
  args: { hostId: v.id('users') },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_host', (q) => q.eq('hostId', args.hostId))
      .collect();

    // Get quiz details for each session
    const sessionsWithQuiz = await Promise.all(
      sessions.map(async (session) => {
        const quiz = await ctx.db.get(session.quizId);
        return { ...session, quiz };
      })
    );

    return sessionsWithQuiz;
  }
});

// Create a new session
export const create = mutation({
  args: {
    quizId: v.id('quizzes'),
    hostId: v.id('users'),
    classId: v.optional(v.string()),
    gameMode: v.union(
      v.literal('race'),
      v.literal('tower_defense'),
      v.literal('puzzle'),
      v.literal('adventure')
    ),
    settings: v.object({
      teamMode: v.boolean(),
      allowLateJoin: v.boolean(),
      showLeaderboard: v.boolean(),
      maxParticipants: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    // Generate a unique access code
    let accessCode = generateAccessCode();
    let existing = await ctx.db
      .query('sessions')
      .withIndex('by_access_code', (q) => q.eq('accessCode', accessCode))
      .first();

    // Regenerate if collision (rare)
    while (existing) {
      accessCode = generateAccessCode();
      existing = await ctx.db
        .query('sessions')
        .withIndex('by_access_code', (q) => q.eq('accessCode', accessCode))
        .first();
    }

    const sessionId = await ctx.db.insert('sessions', {
      ...args,
      accessCode,
      status: 'waiting',
      currentQuestionIndex: 0
    });

    return { sessionId, accessCode };
  }
});

// Start a session
export const start = mutation({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'active',
      startedAt: Date.now()
    });
  }
});

// Pause a session
export const pause = mutation({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'paused' });
  }
});

// Resume a session
export const resume = mutation({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'active' });
  }
});

// Move to next question
export const nextQuestion = mutation({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) throw new Error('Session not found');

    await ctx.db.patch(args.id, {
      currentQuestionIndex: session.currentQuestionIndex + 1
    });
  }
});

// End a session
export const end = mutation({
  args: { id: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: 'completed',
      endedAt: Date.now()
    });
  }
});

// Join a session as participant
export const join = mutation({
  args: {
    accessCode: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    userId: v.optional(v.id('users'))
  },
  handler: async (ctx, args) => {
    // Find the session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_code', (q) => q.eq('accessCode', args.accessCode.toUpperCase()))
      .first();

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'completed') {
      throw new Error('Session has ended');
    }

    if (session.status === 'active' && !session.settings.allowLateJoin) {
      throw new Error('Session has already started');
    }

    // Check max participants
    if (session.settings.maxParticipants) {
      const participants = await ctx.db
        .query('participants')
        .withIndex('by_session', (q) => q.eq('sessionId', session._id))
        .collect();

      if (participants.length >= session.settings.maxParticipants) {
        throw new Error('Session is full');
      }
    }

    // Create participant
    const participantId = await ctx.db.insert('participants', {
      sessionId: session._id,
      userId: args.userId,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      score: 0,
      correctAnswers: 0,
      streak: 0,
      isConnected: true
    });

    return { participantId, sessionId: session._id };
  }
});

// Get leaderboard for a session
export const getLeaderboard = query({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect();

    // Sort by score descending
    return participants
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({ ...p, rank: index + 1 }));
  }
});
