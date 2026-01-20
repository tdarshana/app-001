import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get all quizzes for a user
export const list = query({
  args: {
    creatorId: v.optional(v.id('users')),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'), v.literal('archived')))
  },
  handler: async (ctx, args) => {
    let quizzes;

    if (args.creatorId) {
      quizzes = await ctx.db
        .query('quizzes')
        .withIndex('by_creator', (q) => q.eq('creatorId', args.creatorId!))
        .collect();
    } else if (args.status) {
      quizzes = await ctx.db
        .query('quizzes')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect();
    } else {
      quizzes = await ctx.db.query('quizzes').collect();
    }

    return quizzes;
  }
});

// Get a single quiz by ID
export const get = query({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Get quiz with questions
export const getWithQuestions = query({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.id);
    if (!quiz) return null;

    const questions = await ctx.db
      .query('questions')
      .withIndex('by_quiz', (q) => q.eq('quizId', args.id))
      .collect();

    // Sort by orderIndex
    questions.sort((a, b) => a.orderIndex - b.orderIndex);

    return { ...quiz, questions };
  }
});

// Create a new quiz
export const create = mutation({
  args: {
    creatorId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    settings: v.object({
      timeLimit: v.optional(v.number()),
      shuffleQuestions: v.boolean(),
      shuffleAnswers: v.boolean(),
      showExplanations: v.boolean(),
      allowHints: v.boolean(),
      passingScore: v.number()
    }),
    metadata: v.object({
      subject: v.optional(v.string()),
      gradeLevel: v.optional(v.number()),
      tags: v.array(v.string()),
      estimatedDuration: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    const quizId = await ctx.db.insert('quizzes', {
      ...args,
      status: 'draft'
    });
    return quizId;
  }
});

// Update a quiz
export const update = mutation({
  args: {
    id: v.id('quizzes'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        timeLimit: v.optional(v.number()),
        shuffleQuestions: v.boolean(),
        shuffleAnswers: v.boolean(),
        showExplanations: v.boolean(),
        allowHints: v.boolean(),
        passingScore: v.number()
      })
    ),
    metadata: v.optional(
      v.object({
        subject: v.optional(v.string()),
        gradeLevel: v.optional(v.number()),
        tags: v.array(v.string()),
        estimatedDuration: v.optional(v.number())
      })
    ),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'), v.literal('archived')))
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return id;
  }
});

// Delete a quiz
export const remove = mutation({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    // Delete all questions for this quiz
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_quiz', (q) => q.eq('quizId', args.id))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete the quiz
    await ctx.db.delete(args.id);
  }
});

// Publish a quiz
export const publish = mutation({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    // Verify quiz has at least one question
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_quiz', (q) => q.eq('quizId', args.id))
      .collect();

    if (questions.length === 0) {
      throw new Error('Cannot publish a quiz with no questions');
    }

    await ctx.db.patch(args.id, { status: 'published' });
    return args.id;
  }
});
