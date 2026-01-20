# CLAUDE.md - QuizSpark Development Guide

## Project Overview

QuizSpark is an AI-powered interactive learning platform for primary education (ages 5-12). It generates MCQs from uploaded content (documents, URLs, videos) and delivers engaging quiz experiences to students via QR codes or web links. Teachers can monitor student performance in real-time through an interactive dashboard.

### Core Value Proposition

- **AI Content Generation**: Upload any document/URL → Get quiz questions instantly
- **Kid-Friendly Gamification**: Multiple game modes with animations and rewards
- **Real-Time Monitoring**: Teachers see student progress live
- **Easy Access**: Students join via QR code or simple web link

### Tech Stack Summary

- **Frontend**: SvelteKit 2.x + Svelte 5 (Runes) + shadcn-svelte + Tailwind CSS
- **Backend**: SvelteKit API routes + Drizzle ORM + PostgreSQL
- **Real-time**: Socket.io (separate server)
- **AI Service**: Python FastAPI + LangChain + Claude/OpenAI
- **Mobile**: Capacitor 6 (iOS & Android native deployment)
- **Infrastructure**: Vercel/Cloudflare + Neon/Supabase + Upstash Redis

-----

## Architecture Principles

### 1. Svelte 5 Runes Usage (CRITICAL)

**Always use Svelte 5 runes for reactivity. Never use legacy reactive statements.**

```svelte
<script lang="ts">
  // ✅ CORRECT: Use runes
  let count = $state(0);
  let doubled = $derived(count * 2);
  let items = $state<string[]>([]);

  $effect(() => {
    console.log('Count changed:', count);
    // Cleanup function (optional)
    return () => console.log('Cleaning up');
  });

  // ❌ WRONG: Legacy reactive statements (DO NOT USE)
  // $: doubled = count * 2;
  // let count = 0; // without $state
</script>
```

### 2. Props Pattern

```svelte
<script lang="ts">
  // Define props interface
  interface Props {
    title: string;
    score?: number;
    variant?: 'default' | 'success' | 'error';
    class?: string;
    children?: import('svelte').Snippet;
    onclick?: (e: MouseEvent) => void;
  }

  // Destructure with defaults
  let {
    title,
    score = 0,
    variant = 'default',
    class: className,
    children,
    onclick
  }: Props = $props();
</script>
```

### 3. Component Structure Template

Every component should follow this structure:

```svelte
<!-- src/lib/components/quiz/QuestionCard.svelte -->
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { fly, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import type { Question } from '$lib/types/quiz';

  // ============ PROPS ============
  interface Props {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    onAnswer: (answerIndex: number) => void;
    disabled?: boolean;
    class?: string;
  }

  let {
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
    disabled = false,
    class: className
  }: Props = $props();

  // ============ STATE ============
  let selectedAnswer = $state<number | null>(null);
  let hasAnswered = $state(false);

  // ============ DERIVED ============
  let progress = $derived((questionNumber / totalQuestions) * 100);
  let canSubmit = $derived(selectedAnswer !== null && !hasAnswered);

  // ============ EFFECTS ============
  $effect(() => {
    // Reset state when question changes
    selectedAnswer = null;
    hasAnswered = false;
  });

  // ============ HANDLERS ============
  function handleSelect(index: number) {
    if (disabled || hasAnswered) return;
    selectedAnswer = index;
  }

  function handleSubmit() {
    if (!canSubmit) return;
    hasAnswered = true;
    onAnswer(selectedAnswer!);
  }
</script>

<Card.Root class={cn('w-full max-w-2xl mx-auto', className)}>
  <Card.Header>
    <div class="flex justify-between items-center">
      <Card.Title>Question {questionNumber} of {totalQuestions}</Card.Title>
      <span class="text-sm text-muted-foreground">{Math.round(progress)}%</span>
    </div>
    <!-- Progress bar -->
    <div class="h-2 bg-muted rounded-full overflow-hidden">
      <div
        class="h-full bg-primary transition-all duration-300"
        style="width: {progress}%"
      />
    </div>
  </Card.Header>

  <Card.Content>
    <h2 class="text-xl font-semibold mb-6">{question.text}</h2>

    <div class="grid gap-3">
      {#each question.options as option, i}
        <button
          class={cn(
            'p-4 rounded-lg border-2 text-left transition-all',
            'hover:border-primary hover:bg-primary/5',
            selectedAnswer === i && 'border-primary bg-primary/10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onclick={() => handleSelect(i)}
          {disabled}
        >
          <span class="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
          {option}
        </button>
      {/each}
    </div>
  </Card.Content>

  <Card.Footer>
    <Button
      class="w-full"
      disabled={!canSubmit}
      onclick={handleSubmit}
    >
      Submit Answer
    </Button>
  </Card.Footer>
</Card.Root>
```

-----

## Directory Structure

```
quizspark/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn-svelte (DO NOT EDIT)
│   │   │   ├── quiz/                 # Quiz components
│   │   │   ├── game/                 # Game mode components
│   │   │   ├── animations/           # Animation components
│   │   │   ├── dashboard/            # Teacher dashboard
│   │   │   └── layout/               # Layout components
│   │   ├── server/                   # Server-only code
│   │   │   ├── db/                   # Drizzle ORM
│   │   │   ├── auth.ts
│   │   │   └── ai.ts
│   │   ├── stores/                   # Svelte stores (.svelte.ts)
│   │   ├── types/                    # TypeScript types
│   │   ├── utils/                    # Utility functions
│   │   ├── capacitor/                # Capacitor-specific utilities
│   │   └── config/                   # Constants & config
│   ├── routes/
│   │   ├── (auth)/                   # Auth routes (login, register)
│   │   ├── (app)/                    # Authenticated routes
│   │   ├── (play)/                   # Student gameplay routes
│   │   └── api/                      # API endpoints
│   ├── app.html
│   ├── app.css
│   └── hooks.server.ts
├── static/
│   ├── animations/                   # Lottie JSON files
│   ├── sounds/                       # Audio files
│   └── images/
├── android/                          # Capacitor Android project
├── ios/                              # Capacitor iOS project
├── apps/realtime/                    # Socket.io server
├── packages/
│   ├── shared/                       # Shared types & utils
│   └── ai-service/                   # Python AI microservice
├── capacitor.config.ts               # Capacitor configuration
├── svelte.config.js                  # SvelteKit configuration
├── vite.config.ts                    # Vite bundler configuration
├── CLAUDE.md                         # This file
└── README.md
```

### Key Directories Explained

| Directory | Purpose | When to Modify |
|-----------|---------|----------------|
| `src/lib/components/ui/` | shadcn-svelte base components | Run `npx shadcn-svelte add <component>` |
| `src/lib/components/quiz/` | Quiz-related components | Building quiz features |
| `src/lib/components/game/` | Game mode implementations | Adding/modifying game modes |
| `src/lib/components/animations/` | Celebration/feedback animations | Adding visual feedback |
| `src/lib/server/db/` | Database schema and queries | Modifying data model |
| `src/lib/stores/` | Global state management | Adding app-wide state |
| `src/lib/capacitor/` | Capacitor plugin wrappers | Adding native functionality |
| `src/routes/api/` | Backend API endpoints | Adding API functionality |
| `src/routes/(app)/` | Teacher/admin pages | Building dashboard features |
| `src/routes/(play)/` | Student gameplay pages | Building student experience |
| `android/` | Capacitor Android project | Native Android customization |
| `ios/` | Capacitor iOS project | Native iOS customization |

-----

## Code Patterns

### API Route Pattern (+server.ts)

```typescript
// src/routes/api/quizzes/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { quizzes } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateAuth } from '$lib/server/auth';
import { createQuizSchema } from '$lib/types/quiz';

// GET /api/quizzes
export const GET: RequestHandler = async ({ locals, url }) => {
  // 1. Authenticate
  const user = await validateAuth(locals);
  if (!user) {
    throw error(401, { message: 'Unauthorized' });
  }

  // 2. Parse query params
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
  const offset = Number(url.searchParams.get('offset')) || 0;

  // 3. Query database
  const results = await db.query.quizzes.findMany({
    where: eq(quizzes.creatorId, user.id),
    limit,
    offset,
    orderBy: [desc(quizzes.createdAt)],
    with: {
      questions: true
    }
  });

  // 4. Return response
  return json({
    quizzes: results,
    pagination: { limit, offset }
  });
};

// POST /api/quizzes
export const POST: RequestHandler = async ({ request, locals }) => {
  // 1. Authenticate
  const user = await validateAuth(locals);
  if (!user) {
    throw error(401, { message: 'Unauthorized' });
  }

  // 2. Parse and validate body
  const body = await request.json();
  const parseResult = createQuizSchema.safeParse(body);

  if (!parseResult.success) {
    throw error(400, {
      message: 'Validation error',
      errors: parseResult.error.flatten()
    });
  }

  // 3. Create record
  const [quiz] = await db.insert(quizzes).values({
    ...parseResult.data,
    creatorId: user.id
  }).returning();

  // 4. Return created resource
  return json({ quiz }, { status: 201 });
};
```

### Page Load Pattern (+page.server.ts)

```typescript
// src/routes/(app)/quizzes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { quizzes } from '$lib/server/db/schema';
import { createQuizSchema } from '$lib/types/quiz';

export const load: PageServerLoad = async ({ locals }) => {
  // Auth check handled by layout
  const userQuizzes = await db.query.quizzes.findMany({
    where: eq(quizzes.creatorId, locals.user.id),
    orderBy: [desc(quizzes.createdAt)]
  });

  const form = await superValidate(zod(createQuizSchema));

  return {
    quizzes: userQuizzes,
    form
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await superValidate(request, zod(createQuizSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const [quiz] = await db.insert(quizzes).values({
      ...form.data,
      creatorId: locals.user.id
    }).returning();

    return message(form, { type: 'success', text: 'Quiz created!' });
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const quizId = formData.get('quizId') as string;

    await db.delete(quizzes)
      .where(and(
        eq(quizzes.id, quizId),
        eq(quizzes.creatorId, locals.user.id)
      ));

    return { success: true };
  }
};
```

### Store Pattern (Svelte 5 Class-Based)

```typescript
// src/lib/stores/game.svelte.ts
import type { Question, Participant, GameMode } from '$lib/types/game';

class GameState {
  // ============ STATE ============
  sessionId = $state<string | null>(null);
  accessCode = $state<string | null>(null);
  status = $state<'idle' | 'waiting' | 'active' | 'paused' | 'completed'>('idle');
  gameMode = $state<GameMode>('race');

  currentQuestionIndex = $state(0);
  questions = $state<Question[]>([]);
  participants = $state<Participant[]>([]);

  myScore = $state(0);
  streak = $state(0);
  correctAnswers = $state(0);

  // Timer
  timeRemaining = $state(0);

  // ============ DERIVED ============
  currentQuestion = $derived(this.questions[this.currentQuestionIndex] ?? null);
  totalQuestions = $derived(this.questions.length);
  isLastQuestion = $derived(this.currentQuestionIndex >= this.questions.length - 1);
  progress = $derived(
    this.totalQuestions > 0
      ? ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100
      : 0
  );

  leaderboard = $derived(
    [...this.participants]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((p, i) => ({ ...p, rank: i + 1 }))
  );

  accuracy = $derived(
    this.currentQuestionIndex > 0
      ? Math.round((this.correctAnswers / this.currentQuestionIndex) * 100)
      : 0
  );

  // ============ METHODS ============
  initialize(data: {
    sessionId: string;
    accessCode: string;
    questions: Question[];
    gameMode: GameMode;
  }) {
    this.sessionId = data.sessionId;
    this.accessCode = data.accessCode;
    this.questions = data.questions;
    this.gameMode = data.gameMode;
    this.status = 'waiting';
    this.currentQuestionIndex = 0;
    this.myScore = 0;
    this.streak = 0;
    this.correctAnswers = 0;
  }

  start() {
    this.status = 'active';
    this.startTimer();
  }

  submitAnswer(isCorrect: boolean, points: number) {
    if (isCorrect) {
      this.myScore += points;
      this.streak += 1;
      this.correctAnswers += 1;
    } else {
      this.streak = 0;
    }
  }

  nextQuestion() {
    if (!this.isLastQuestion) {
      this.currentQuestionIndex += 1;
      this.resetTimer();
    } else {
      this.complete();
    }
  }

  complete() {
    this.status = 'completed';
    this.stopTimer();
  }

  reset() {
    this.sessionId = null;
    this.accessCode = null;
    this.status = 'idle';
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.participants = [];
    this.myScore = 0;
    this.streak = 0;
    this.correctAnswers = 0;
    this.stopTimer();
  }

  updateParticipants(participants: Participant[]) {
    this.participants = participants;
  }

  // Timer methods
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  private startTimer() {
    this.timeRemaining = this.currentQuestion?.timeLimit ?? 30;
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining -= 1;
      } else {
        this.handleTimeout();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private resetTimer() {
    this.stopTimer();
    this.startTimer();
  }

  private handleTimeout() {
    this.submitAnswer(false, 0);
    this.nextQuestion();
  }
}

// Export singleton instance
export const gameState = new GameState();
```

### Socket Integration Pattern

```typescript
// src/lib/stores/socket.svelte.ts
import { io, type Socket } from 'socket.io-client';
import { browser } from '$app/environment';
import { PUBLIC_SOCKET_URL } from '$env/static/public';
import { gameState } from './game.svelte';
import type {
  JoinSessionData,
  AnswerResultData,
  LeaderboardData
} from '$lib/types/socket';

class SocketManager {
  socket = $state<Socket | null>(null);
  connected = $state(false);
  error = $state<string | null>(null);

  connect(sessionId: string, userId: string, displayName: string) {
    if (!browser || this.socket) return;

    this.socket = io(PUBLIC_SOCKET_URL, {
      auth: { userId },
      query: { sessionId, displayName },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      this.error = null;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      this.error = err.message;
      console.error('Socket connection error:', err);
    });

    // Game events
    this.socket.on('game:started', () => {
      gameState.start();
    });

    this.socket.on('game:question', (data: { questionIndex: number }) => {
      gameState.currentQuestionIndex = data.questionIndex;
    });

    this.socket.on('answer:result', (data: AnswerResultData) => {
      gameState.submitAnswer(data.isCorrect, data.points);
    });

    this.socket.on('leaderboard:update', (data: LeaderboardData) => {
      gameState.updateParticipants(data.participants);
    });

    this.socket.on('game:completed', () => {
      gameState.complete();
    });
  }

  joinSession(data: JoinSessionData) {
    this.socket?.emit('session:join', data);
  }

  submitAnswer(questionId: string, answerIndex: number, timeTaken: number) {
    this.socket?.emit('answer:submit', {
      questionId,
      answerIndex,
      timeTaken
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
  }
}

export const socketManager = new SocketManager();
```

-----

## Capacitor Integration

### Capacitor Configuration

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quizspark.app',
  appName: 'QuizSpark',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    // For development with live reload
    // url: 'http://192.168.1.x:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

### Common Capacitor Commands

```bash
# Initial setup
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# Development workflow
npm run build              # Build SvelteKit for production
npx cap sync               # Sync web assets + plugins to native
npx cap open android       # Open Android Studio
npx cap open ios           # Open Xcode

# Run on device/emulator
npx cap run android        # Build and run on Android
npx cap run ios            # Build and run on iOS simulator

# Live reload during development
npx cap run android --livereload --external
npx cap run ios --livereload --external

# Copy only (faster than sync)
npx cap copy                # Copy web assets only (no plugin sync)

# Update native plugins
npx cap update
```

### Platform Detection Pattern

```typescript
// src/lib/capacitor/platform.ts
import { Capacitor } from '@capacitor/core';

export const platform = {
  isNative: Capacitor.isNativePlatform(),
  isWeb: !Capacitor.isNativePlatform(),
  isAndroid: Capacitor.getPlatform() === 'android',
  isIOS: Capacitor.getPlatform() === 'ios',
  platform: Capacitor.getPlatform() // 'web' | 'android' | 'ios'
};

// Usage in components
// import { platform } from '$lib/capacitor/platform';
// if (platform.isNative) { ... }
```

### Safe Area Handling

```svelte
<!-- src/lib/components/layout/SafeArea.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { SafeArea } from '@capacitor-community/safe-area';
  import { platform } from '$lib/capacitor/platform';

  let insets = $state({ top: 0, bottom: 0, left: 0, right: 0 });

  onMount(async () => {
    if (platform.isNative) {
      const result = await SafeArea.getSafeAreaInsets();
      insets = result.insets;
    }
  });
</script>

<div
  style="
    padding-top: {insets.top}px;
    padding-bottom: {insets.bottom}px;
    padding-left: {insets.left}px;
    padding-right: {insets.right}px;
  "
>
  <slot />
</div>
```

### Capacitor Plugin Patterns

```typescript
// src/lib/capacitor/haptics.ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { platform } from './platform';

export const haptics = {
  async impact(style: 'light' | 'medium' | 'heavy' = 'medium') {
    if (!platform.isNative) return;

    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };

    await Haptics.impact({ style: styleMap[style] });
  },

  async notification(type: 'success' | 'warning' | 'error') {
    if (!platform.isNative) return;

    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error
    };

    await Haptics.notification({ type: typeMap[type] });
  },

  async vibrate() {
    if (!platform.isNative) return;
    await Haptics.vibrate();
  }
};

// Usage: haptics.impact('heavy') on correct answer
// Usage: haptics.notification('error') on wrong answer
```

```typescript
// src/lib/capacitor/camera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { platform } from './platform';

export async function takePhoto(): Promise<string | null> {
  if (!platform.isNative) {
    // Fallback to file input on web
    return null;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    return image.dataUrl ?? null;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
}

export async function pickImage(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });

    return image.dataUrl ?? null;
  } catch (error) {
    console.error('Image picker error:', error);
    return null;
  }
}
```

```typescript
// src/lib/capacitor/push-notifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { platform } from './platform';

export async function initPushNotifications() {
  if (!platform.isNative) return;

  // Request permission
  const permStatus = await PushNotifications.requestPermissions();

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
  }

  // Handle registration
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success:', token.value);
    // Send token to your server
  });

  // Handle incoming notifications
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  // Handle notification tap
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action:', notification);
    // Navigate based on notification data
  });
}
```

### QR Code Scanner (for joining quizzes)

```typescript
// src/lib/capacitor/scanner.ts
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { platform } from './platform';

export async function scanQRCode(): Promise<string | null> {
  if (!platform.isNative) {
    // Use web-based scanner or return null
    return null;
  }

  // Check/request permission
  const { camera } = await BarcodeScanner.requestPermissions();
  if (camera !== 'granted') {
    throw new Error('Camera permission denied');
  }

  // Start scanning
  const { barcodes } = await BarcodeScanner.scan({
    formats: ['QR_CODE']
  });

  if (barcodes.length > 0) {
    return barcodes[0].rawValue;
  }

  return null;
}
```

### SvelteKit Static Adapter for Capacitor

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA fallback for Capacitor
      precompress: false,
      strict: true
    }),
    // Required for Capacitor
    prerender: {
      entries: []
    }
  }
};

export default config;
```

### Essential Capacitor Plugins

```bash
# Core plugins
npm install @capacitor/app           # App lifecycle, back button
npm install @capacitor/haptics       # Vibration feedback
npm install @capacitor/keyboard      # Keyboard events
npm install @capacitor/status-bar    # Status bar styling
npm install @capacitor/splash-screen # Splash screen control
npm install @capacitor/preferences   # Key-value storage

# Media & Hardware
npm install @capacitor/camera        # Camera & photo library
npm install @capacitor-mlkit/barcode-scanning  # QR scanner

# Push & Notifications
npm install @capacitor/push-notifications  # Push notifications
npm install @capacitor/local-notifications # Local notifications

# Community plugins
npm install @capacitor-community/safe-area  # Safe area insets
```

-----

## Database Schema (Drizzle ORM)

```typescript
// src/lib/server/db/schema.ts
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin', 'parent']);
export const quizStatusEnum = pgEnum('quiz_status', ['draft', 'published', 'archived']);
export const sessionStatusEnum = pgEnum('session_status', ['waiting', 'active', 'paused', 'completed']);
export const questionTypeEnum = pgEnum('question_type', ['mcq', 'true_false', 'fill_blank', 'matching']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').notNull().default('student'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  profile: jsonb('profile').$type<{
    grade?: number;
    school?: string;
    preferences?: Record<string, unknown>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Schools
export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subdomain: text('subdomain').unique(),
  branding: jsonb('branding').$type<{
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Classes
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id),
  teacherId: uuid('teacher_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  gradeLevel: integer('grade_level'),
  subject: text('subject'),
  joinCode: text('join_code').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Quizzes
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sourceType: text('source_type').$type<'manual' | 'ai_document' | 'ai_url' | 'ai_video'>(),
  sourceReference: text('source_reference'),
  settings: jsonb('settings').$type<{
    timeLimit?: number;
    shuffleQuestions?: boolean;
    shuffleAnswers?: boolean;
    showExplanations?: boolean;
    allowHints?: boolean;
    passingScore?: number;
  }>().default({}),
  status: quizStatusEnum('status').default('draft'),
  metadata: jsonb('metadata').$type<{
    subject?: string;
    gradeLevel?: number;
    tags?: string[];
    estimatedDuration?: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Questions
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  type: questionTypeEnum('type').notNull().default('mcq'),
  text: text('text').notNull(),
  options: jsonb('options').$type<string[]>().notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  explanation: text('explanation'),
  hints: jsonb('hints').$type<string[]>().default([]),
  mediaUrl: text('media_url'),
  difficulty: difficultyEnum('difficulty').default('medium'),
  points: integer('points').default(10),
  timeLimit: integer('time_limit').default(30),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Quiz Sessions
export const quizSessions = pgTable('quiz_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  classId: uuid('class_id').references(() => classes.id),
  accessCode: text('access_code').unique().notNull(),
  gameMode: text('game_mode').$type<'race' | 'tower_defense' | 'puzzle' | 'adventure'>().default('race'),
  status: sessionStatusEnum('status').default('waiting'),
  settings: jsonb('settings').$type<{
    teamMode?: boolean;
    allowLateJoin?: boolean;
    showLeaderboard?: boolean;
    maxParticipants?: number;
  }>().default({}),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Responses
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => quizSessions.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => users.id).notNull(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  answerIndex: integer('answer_index').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: integer('points_earned').default(0),
  timeTaken: integer('time_taken'), // milliseconds
  hintsUsed: integer('hints_used').default(0),
  answeredAt: timestamp('answered_at').defaultNow().notNull()
});

// Student Progress (Gamification)
export const studentProgress = pgTable('student_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  totalXp: integer('total_xp').default(0),
  level: integer('level').default(1),
  coins: integer('coins').default(0),
  streakDays: integer('streak_days').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  achievements: jsonb('achievements').$type<string[]>().default([]),
  inventory: jsonb('inventory').$type<{ itemId: string; acquiredAt: string }[]>().default([]),
  stats: jsonb('stats').$type<{
    gamesPlayed: number;
    questionsAnswered: number;
    correctAnswers: number;
    totalTimePlayed: number;
  }>().default({
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    totalTimePlayed: 0
  }),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  quizzes: many(quizzes),
  classes: many(classes),
  progress: one(studentProgress, {
    fields: [users.id],
    references: [studentProgress.userId]
  })
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  creator: one(users, {
    fields: [quizzes.creatorId],
    references: [users.id]
  }),
  questions: many(questions),
  sessions: many(quizSessions)
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id]
  })
}));

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizSessions.quizId],
    references: [quizzes.id]
  }),
  host: one(users, {
    fields: [quizSessions.hostId],
    references: [users.id]
  }),
  responses: many(responses)
}));
```

-----

## shadcn-svelte Usage

### Installing Components

```bash
# Initialize (first time only)
npx shadcn-svelte@latest init

# Add components as needed
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add card
npx shadcn-svelte@latest add dialog
npx shadcn-svelte@latest add input
npx shadcn-svelte@latest add select
npx shadcn-svelte@latest add tabs
npx shadcn-svelte@latest add toast
npx shadcn-svelte@latest add progress
npx shadcn-svelte@latest add avatar
npx shadcn-svelte@latest add badge
```

### Component Import Patterns

```svelte
<script lang="ts">
  // Single exports
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';

  // Namespace imports (compound components)
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Select from '$lib/components/ui/select';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
</script>

<!-- Usage -->
<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    <Input placeholder="Enter text..." />
  </Card.Content>
  <Card.Footer class="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Submit</Button>
  </Card.Footer>
</Card.Root>

<Dialog.Root>
  <Dialog.Trigger asChild let:builder>
    <Button builders={[builder]}>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>Dialog description here.</Dialog.Description>
    </Dialog.Header>
    <!-- Content -->
    <Dialog.Footer>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### Custom Variants

Extend button variants in `src/lib/components/ui/button/index.ts`:

```typescript
import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      // Custom variants for QuizSpark
      game: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all',
      correct: 'bg-green-500 hover:bg-green-600 text-white',
      wrong: 'bg-red-500 hover:bg-red-600 text-white',
      answer: 'border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 text-left h-auto py-4 px-6'
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      xl: 'h-14 rounded-lg px-10 text-lg',
      icon: 'h-10 w-10'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});
```

-----

## Animation Patterns

### Svelte Transitions

```svelte
<script lang="ts">
  import { fly, scale, fade, slide } from 'svelte/transition';
  import { elasticOut, quintOut, backOut } from 'svelte/easing';

  let showResult = $state(false);
  let isCorrect = $state(false);
</script>

{#if showResult}
  <div
    class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    in:scale={{ duration: 400, easing: elasticOut, start: 0.5 }}
    out:fade={{ duration: 200 }}
  >
    {#if isCorrect}
      <div class="text-6xl">🎉</div>
    {:else}
      <div class="text-6xl">💪</div>
    {/if}
  </div>
{/if}

<!-- Answer options with staggered animation -->
{#each options as option, i}
  <button
    in:fly={{ y: 20, delay: i * 100, duration: 300 }}
    class="answer-option"
  >
    {option}
  </button>
{/each}
```

### Lottie Animations

```svelte
<script lang="ts">
  import '@lottiefiles/lottie-player';

  let showCelebration = $state(false);

  function playCelebration() {
    showCelebration = true;
    setTimeout(() => showCelebration = false, 2000);
  }
</script>

{#if showCelebration}
  <div class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <lottie-player
      src="/animations/celebration.json"
      background="transparent"
      speed="1"
      style="width: 300px; height: 300px"
      autoplay
    />
  </div>
{/if}
```

### CSS Keyframe Animations (Tailwind)

```css
/* app.css */
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

.animate-pulse-glow {
  animation: pulse-glow 1.5s ease-in-out infinite;
}
```

-----

## Common Tasks

### 1. Creating a New Feature Component

1. Create file in appropriate directory:
   ```
   src/lib/components/quiz/NewFeature.svelte
   ```
2. Follow the component template structure
3. Add types if needed in `src/lib/types/`
4. Import and use in routes

### 2. Adding a New API Endpoint

1. Create route file:
   ```
   src/routes/api/[resource]/+server.ts
   ```
2. Export handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Always validate auth and input
4. Use Drizzle for database operations

### 3. Adding a New Page

1. Create route folder:
   ```
   src/routes/(app)/new-page/+page.svelte
   src/routes/(app)/new-page/+page.server.ts
   ```
2. Add load function for data fetching
3. Add form actions if needed
4. Implement UI with shadcn components

### 4. Generating Quiz from Content

API flow:

1. `POST /api/upload` - Upload file, get reference
2. `POST /api/quizzes/generate` - Send reference + options
3. AI service processes and returns questions
4. `POST /api/quizzes` - Save generated quiz

### 5. Starting a Live Quiz Session

1. Teacher creates session: `POST /api/sessions`
2. System generates access code and QR
3. Students join via code or QR scan
4. Teacher starts game via socket event
5. Real-time updates flow through Socket.io

-----

## Environment Variables

```bash
# .env (local development)
# .env.production (production)

# Database
DATABASE_URL="postgresql://user:pass@host:5432/quizspark"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_TRUST_HOST="true"

# AI Service
AI_SERVICE_URL="http://localhost:8000"
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Real-time (public = accessible in browser)
PUBLIC_SOCKET_URL="http://localhost:3001"

# File Storage
S3_ENDPOINT="https://..."
S3_BUCKET="quizspark-uploads"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
PUBLIC_CDN_URL="https://cdn.quizspark.com"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="QuizSpark <hello@quizspark.com>"
```

-----

## Testing

```bash
# Unit tests (Vitest)
pnpm test
pnpm test:watch
pnpm test:coverage

# E2E tests (Playwright)
pnpm test:e2e
pnpm test:e2e:ui

# Type checking
pnpm check

# Linting
pnpm lint
pnpm lint:fix
```

### Test File Naming

- Unit tests: `*.test.ts` or `*.spec.ts`
- Component tests: `ComponentName.test.ts`
- E2E tests: `tests/*.spec.ts`

-----

## Deployment

### Vercel (Recommended)

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1'], // US East
      split: true // Enable ISR
    })
  }
};
```

### Cloudflare Pages

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
```

-----

## Performance Guidelines

1. **Use `{#key}` blocks** for resetting component state
2. **Lazy load** heavy components with dynamic imports
3. **Optimize images** - use WebP, proper sizing
4. **Minimize bundle** - check with `pnpm build && pnpm preview`
5. **Use streaming** for large data loads
6. **Cache API responses** with appropriate headers

-----

## Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Provide alt text for images
- Maintain color contrast ratios (WCAG AA)
- Support screen readers (ARIA labels)
- Allow font size adjustments
- Provide audio descriptions for animations

-----

## Security Checklist

- [ ] Validate all user input (Zod schemas)
- [ ] Sanitize HTML content
- [ ] Use parameterized database queries (Drizzle handles this)
- [ ] Implement rate limiting on API routes
- [ ] Set secure cookie options
- [ ] Validate file uploads (type, size)
- [ ] Use CSRF protection (SvelteKit handles this)
- [ ] Never expose sensitive data in client bundle

-----

## Troubleshooting

### "Cannot find module '$lib/…'"

- Verify `svelte.config.js` has correct alias config
- Run `pnpm check` to verify TypeScript setup

### Hydration Mismatch

- Ensure consistent state between server and client
- Use `browser` check for client-only code:
  ```typescript
  import { browser } from '$app/environment';
  if (browser) { /* client-only code */ }
  ```

### Socket Connection Issues

- Check CORS settings on socket server
- Verify `PUBLIC_SOCKET_URL` environment variable
- Check network tab for connection errors

### Database Connection Errors

- Verify `DATABASE_URL` format
- Check connection pooling limits
- Ensure database is accessible from deployment environment

### Capacitor Issues

**Build fails with "webDir not found"**
- Ensure you run `npm run build` before `npx cap sync`
- Verify `webDir` in `capacitor.config.ts` matches build output

**Plugins not working**
- Run `npx cap sync` after installing new plugins
- Check native project has plugin dependencies (Android: check `build.gradle`)

**Live reload not working**
- Ensure device/emulator is on same network as dev machine
- Update `server.url` in `capacitor.config.ts` with your local IP
- For Android, enable cleartext: `server.cleartext: true`

**iOS build fails**
- Run `pod install` in the `ios/App` directory
- Ensure Xcode command line tools are installed

**Android back button doesn't work**
```typescript
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    window.history.back();
  } else {
    App.exitApp();
  }
});
```

-----

## Quick Reference

### Svelte 5 Runes

| Rune | Purpose | Example |
|------|---------|---------|
| `$state` | Reactive state | `let count = $state(0)` |
| `$derived` | Computed value | `let double = $derived(count * 2)` |
| `$effect` | Side effects | `$effect(() => { ... })` |
| `$props` | Component props | `let { x } = $props()` |
| `$bindable` | Two-way binding | `let { value = $bindable() } = $props()` |

### SvelteKit Files

| File | Purpose |
|------|---------|
| `+page.svelte` | Page component |
| `+page.ts` | Client-side load |
| `+page.server.ts` | Server-side load + actions |
| `+layout.svelte` | Layout component |
| `+layout.server.ts` | Layout data loading |
| `+server.ts` | API endpoint |
| `+error.svelte` | Error page |

### HTTP Status Codes

| Code | When to Use |
|------|-------------|
| 200 | Successful GET/PUT |
| 201 | Successful POST (created) |
| 204 | Successful DELETE |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 500 | Server error |
