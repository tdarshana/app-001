import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal('student'),
      v.literal('teacher'),
      v.literal('admin'),
      v.literal('parent')
    ),
    profile: v.object({
      grade: v.optional(v.number()),
      school: v.optional(v.string()),
      bio: v.optional(v.string()),
      preferences: v.object({
        theme: v.union(v.literal('light'), v.literal('dark'), v.literal('system')),
        soundEnabled: v.boolean(),
        musicEnabled: v.boolean(),
        hapticEnabled: v.boolean(),
        language: v.string()
      })
    }),
    // Convex Auth fields
    tokenIdentifier: v.optional(v.string())
  })
    .index('by_email', ['email'])
    .index('by_token', ['tokenIdentifier']),

  // Quizzes
  quizzes: defineTable({
    creatorId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    sourceType: v.optional(
      v.union(
        v.literal('manual'),
        v.literal('ai_document'),
        v.literal('ai_url'),
        v.literal('ai_video')
      )
    ),
    sourceReference: v.optional(v.string()),
    settings: v.object({
      timeLimit: v.optional(v.number()),
      shuffleQuestions: v.boolean(),
      shuffleAnswers: v.boolean(),
      showExplanations: v.boolean(),
      allowHints: v.boolean(),
      passingScore: v.number()
    }),
    status: v.union(v.literal('draft'), v.literal('published'), v.literal('archived')),
    metadata: v.object({
      subject: v.optional(v.string()),
      gradeLevel: v.optional(v.number()),
      tags: v.array(v.string()),
      estimatedDuration: v.optional(v.number())
    })
  })
    .index('by_creator', ['creatorId'])
    .index('by_status', ['status']),

  // Questions
  questions: defineTable({
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
    timeLimit: v.number(),
    orderIndex: v.number()
  }).index('by_quiz', ['quizId']),

  // Quiz Sessions (live games)
  sessions: defineTable({
    quizId: v.id('quizzes'),
    hostId: v.id('users'),
    classId: v.optional(v.string()),
    accessCode: v.string(),
    gameMode: v.union(
      v.literal('race'),
      v.literal('tower_defense'),
      v.literal('puzzle'),
      v.literal('adventure')
    ),
    status: v.union(
      v.literal('waiting'),
      v.literal('active'),
      v.literal('paused'),
      v.literal('completed')
    ),
    settings: v.object({
      teamMode: v.boolean(),
      allowLateJoin: v.boolean(),
      showLeaderboard: v.boolean(),
      maxParticipants: v.optional(v.number())
    }),
    currentQuestionIndex: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number())
  })
    .index('by_access_code', ['accessCode'])
    .index('by_host', ['hostId'])
    .index('by_status', ['status']),

  // Session Participants
  participants: defineTable({
    sessionId: v.id('sessions'),
    userId: v.optional(v.id('users')),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    score: v.number(),
    correctAnswers: v.number(),
    streak: v.number(),
    isConnected: v.boolean()
  }).index('by_session', ['sessionId']),

  // Responses (answers during sessions)
  responses: defineTable({
    sessionId: v.id('sessions'),
    participantId: v.id('participants'),
    questionId: v.id('questions'),
    answerIndex: v.number(),
    isCorrect: v.boolean(),
    pointsEarned: v.number(),
    timeTaken: v.number(),
    hintsUsed: v.number()
  })
    .index('by_session', ['sessionId'])
    .index('by_participant', ['participantId']),

  // Student Progress (gamification)
  studentProgress: defineTable({
    userId: v.id('users'),
    totalXp: v.number(),
    level: v.number(),
    coins: v.number(),
    streakDays: v.number(),
    lastActivityDate: v.optional(v.number()),
    achievements: v.array(v.string()),
    inventory: v.array(
      v.object({
        itemId: v.string(),
        acquiredAt: v.number()
      })
    ),
    stats: v.object({
      gamesPlayed: v.number(),
      questionsAnswered: v.number(),
      correctAnswers: v.number(),
      totalTimePlayed: v.number()
    })
  }).index('by_user', ['userId']),

  // Classes (for teachers)
  classes: defineTable({
    teacherId: v.id('users'),
    name: v.string(),
    gradeLevel: v.optional(v.number()),
    subject: v.optional(v.string()),
    joinCode: v.string()
  })
    .index('by_teacher', ['teacherId'])
    .index('by_join_code', ['joinCode']),

  // Class Members
  classMembers: defineTable({
    classId: v.id('classes'),
    userId: v.id('users'),
    role: v.union(v.literal('student'), v.literal('co_teacher'))
  })
    .index('by_class', ['classId'])
    .index('by_user', ['userId']),

  // Subscriptions (Stripe)
  subscriptions: defineTable({
    userId: v.id('users'),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
    plan: v.union(v.literal('free'), v.literal('teacher'), v.literal('school')),
    status: v.union(
      v.literal('active'),
      v.literal('canceled'),
      v.literal('past_due'),
      v.literal('trialing')
    ),
    currentPeriodEnd: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_stripe_customer', ['stripeCustomerId'])
});
