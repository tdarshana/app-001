import { z } from 'zod';

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  grade?: number;
  school?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  language: string;
}

// Student progress / gamification
export interface StudentProgress {
  _id: string;
  userId: string;
  totalXp: number;
  level: number;
  coins: number;
  streakDays: number;
  lastActivityDate?: number;
  achievements: string[];
  inventory: InventoryItem[];
  stats: StudentStats;
}

export interface InventoryItem {
  itemId: string;
  acquiredAt: number;
}

export interface StudentStats {
  gamesPlayed: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalTimePlayed: number;
  quizzesCreated?: number;
  quizzesHosted?: number;
}

// Validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  profile: z
    .object({
      grade: z.number().min(1).max(12).optional(),
      school: z.string().max(200).optional(),
      bio: z.string().max(500).optional()
    })
    .optional()
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  soundEnabled: z.boolean().optional(),
  musicEnabled: z.boolean().optional(),
  hapticEnabled: z.boolean().optional(),
  language: z.string().max(10).optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
