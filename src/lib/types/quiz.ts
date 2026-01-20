import { z } from 'zod';

// Enums
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'matching';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizStatus = 'draft' | 'published' | 'archived';
export type SessionStatus = 'waiting' | 'active' | 'paused' | 'completed';
export type GameMode = 'race' | 'tower_defense' | 'puzzle' | 'adventure';

// Question
export interface Question {
  _id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  hints: string[];
  mediaUrl?: string;
  difficulty: Difficulty;
  points: number;
  timeLimit: number;
  orderIndex: number;
}

// Quiz
export interface Quiz {
  _id: string;
  creatorId: string;
  title: string;
  description?: string;
  sourceType?: 'manual' | 'ai_document' | 'ai_url' | 'ai_video';
  sourceReference?: string;
  settings: QuizSettings;
  status: QuizStatus;
  metadata: QuizMetadata;
  createdAt: number;
  updatedAt: number;
}

export interface QuizSettings {
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showExplanations: boolean;
  allowHints: boolean;
  passingScore: number;
}

export interface QuizMetadata {
  subject?: string;
  gradeLevel?: number;
  tags: string[];
  estimatedDuration?: number;
}

// Session
export interface QuizSession {
  _id: string;
  quizId: string;
  hostId: string;
  classId?: string;
  accessCode: string;
  gameMode: GameMode;
  status: SessionStatus;
  settings: SessionSettings;
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
}

export interface SessionSettings {
  teamMode: boolean;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
  maxParticipants?: number;
}

// Participant
export interface Participant {
  id: string;
  userId?: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  correctAnswers: number;
  streak: number;
  rank?: number;
}

// Response
export interface QuizResponse {
  _id: string;
  sessionId: string;
  participantId: string;
  questionId: string;
  answerIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
  hintsUsed: number;
  answeredAt: number;
}

// Zod Schemas for validation
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  settings: z
    .object({
      timeLimit: z.number().min(10).max(3600).optional(),
      shuffleQuestions: z.boolean().default(false),
      shuffleAnswers: z.boolean().default(false),
      showExplanations: z.boolean().default(true),
      allowHints: z.boolean().default(true),
      passingScore: z.number().min(0).max(100).default(60)
    })
    .default({}),
  metadata: z
    .object({
      subject: z.string().optional(),
      gradeLevel: z.number().min(1).max(12).optional(),
      tags: z.array(z.string()).default([])
    })
    .default({})
});

export const createQuestionSchema = z.object({
  type: z.enum(['mcq', 'true_false', 'fill_blank', 'matching']).default('mcq'),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
  hints: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  points: z.number().min(1).max(100).default(10),
  timeLimit: z.number().min(5).max(300).default(30)
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
