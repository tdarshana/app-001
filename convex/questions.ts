import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get all questions for a quiz
export const listByQuiz = query({
  args: { quizId: v.id('quizzes') },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query('questions')
      .withIndex('by_quiz', (q) => q.eq('quizId', args.quizId))
      .collect();

    // Sort by orderIndex
    return questions.sort((a, b) => a.orderIndex - b.orderIndex);
  }
});

// Get a single question
export const get = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Create a new question
export const create = mutation({
  args: {
    quizId: v.id('quizzes'),
    type: v.union(
      v.literal('mcq'),
      v.literal('true_false'),
      v.literal('fill_blank'),
      v.literal('matching')
    ),
    text: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.optional(v.string()),
    hints: v.array(v.string()),
    mediaUrl: v.optional(v.string()),
    difficulty: v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
    points: v.number(),
    timeLimit: v.number()
  },
  handler: async (ctx, args) => {
    // Get the current max orderIndex for this quiz
    const existingQuestions = await ctx.db
      .query('questions')
      .withIndex('by_quiz', (q) => q.eq('quizId', args.quizId))
      .collect();

    const maxOrderIndex =
      existingQuestions.length > 0
        ? Math.max(...existingQuestions.map((q) => q.orderIndex))
        : -1;

    const questionId = await ctx.db.insert('questions', {
      ...args,
      orderIndex: maxOrderIndex + 1
    });

    return questionId;
  }
});

// Batch create questions (for AI-generated quizzes)
export const createBatch = mutation({
  args: {
    quizId: v.id('quizzes'),
    questions: v.array(
      v.object({
        type: v.union(
          v.literal('mcq'),
          v.literal('true_false'),
          v.literal('fill_blank'),
          v.literal('matching')
        ),
        text: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.number(),
        explanation: v.optional(v.string()),
        hints: v.array(v.string()),
        difficulty: v.union(v.literal('easy'), v.literal('medium'), v.literal('hard')),
        points: v.number(),
        timeLimit: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const questionIds = [];

    for (let i = 0; i < args.questions.length; i++) {
      const questionId = await ctx.db.insert('questions', {
        quizId: args.quizId,
        ...args.questions[i],
        orderIndex: i
      });
      questionIds.push(questionId);
    }

    return questionIds;
  }
});

// Update a question
export const update = mutation({
  args: {
    id: v.id('questions'),
    type: v.optional(
      v.union(
        v.literal('mcq'),
        v.literal('true_false'),
        v.literal('fill_blank'),
        v.literal('matching')
      )
    ),
    text: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctAnswer: v.optional(v.number()),
    explanation: v.optional(v.string()),
    hints: v.optional(v.array(v.string())),
    mediaUrl: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal('easy'), v.literal('medium'), v.literal('hard'))),
    points: v.optional(v.number()),
    timeLimit: v.optional(v.number())
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

// Delete a question
export const remove = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  }
});

// Reorder questions
export const reorder = mutation({
  args: {
    questionIds: v.array(v.id('questions'))
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.questionIds.length; i++) {
      await ctx.db.patch(args.questionIds[i], { orderIndex: i });
    }
  }
});
