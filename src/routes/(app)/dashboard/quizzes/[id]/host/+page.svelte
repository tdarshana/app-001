<script lang="ts">
  import { page } from '$app/stores';
  import {
    Play,
    Pause,
    SkipForward,
    Users,
    Trophy,
    QrCode,
    Copy,
    Check,
    StopCircle,
    Clock
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  // Mock data - will come from Convex
  const accessCode = 'ABC123';
  const quizTitle = 'Math Multiplication Tables';

  let gameStatus = $state<'waiting' | 'active' | 'paused' | 'completed'>('waiting');
  let currentQuestionIndex = $state(0);
  let copied = $state(false);

  const mockParticipants = [
    { id: '1', name: 'Alex', score: 85, streak: 3, isConnected: true },
    { id: '2', name: 'Jamie', score: 72, streak: 1, isConnected: true },
    { id: '3', name: 'Sam', score: 68, streak: 0, isConnected: true },
    { id: '4', name: 'Taylor', score: 55, streak: 2, isConnected: false },
    { id: '5', name: 'Jordan', score: 45, streak: 0, isConnected: true }
  ];

  const mockQuestions = [
    { id: '1', text: 'What is 7 × 8?', answeredCount: 5, correctCount: 4 },
    { id: '2', text: 'What is 9 × 6?', answeredCount: 0, correctCount: 0 },
    { id: '3', text: 'What is 12 × 5?', answeredCount: 0, correctCount: 0 }
  ];

  const participants = $derived(
    [...mockParticipants].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }))
  );

  const currentQuestion = $derived(mockQuestions[currentQuestionIndex]);
  const connectedCount = $derived(mockParticipants.filter((p) => p.isConnected).length);
  const progress = $derived(((currentQuestionIndex + 1) / mockQuestions.length) * 100);

  async function copyCode() {
    await navigator.clipboard.writeText(accessCode);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function startGame() {
    gameStatus = 'active';
  }

  function pauseGame() {
    gameStatus = 'paused';
  }

  function resumeGame() {
    gameStatus = 'active';
  }

  function nextQuestion() {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      currentQuestionIndex += 1;
    } else {
      gameStatus = 'completed';
    }
  }

  function endGame() {
    gameStatus = 'completed';
  }
</script>

<svelte:head>
  <title>Host Quiz - QuizSpark</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b bg-card">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <div>
        <h1 class="text-xl font-semibold">{quizTitle}</h1>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <Users class="h-4 w-4" />
          {connectedCount} participants connected
        </div>
      </div>

      <div class="flex items-center gap-2">
        {#if gameStatus === 'waiting'}
          <Button onclick={startGame} variant="game">
            <Play class="h-5 w-5" />
            Start Game
          </Button>
        {:else if gameStatus === 'active'}
          <Button onclick={pauseGame} variant="outline">
            <Pause class="h-5 w-5" />
            Pause
          </Button>
          <Button onclick={nextQuestion} variant="default">
            <SkipForward class="h-5 w-5" />
            Next Question
          </Button>
        {:else if gameStatus === 'paused'}
          <Button onclick={resumeGame} variant="game">
            <Play class="h-5 w-5" />
            Resume
          </Button>
        {/if}

        {#if gameStatus !== 'completed'}
          <Button onclick={endGame} variant="destructive">
            <StopCircle class="h-5 w-5" />
            End Game
          </Button>
        {/if}
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8">
    {#if gameStatus === 'waiting'}
      <!-- Waiting Room -->
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Join Info -->
        <Card.Root class="flex flex-col items-center justify-center p-8">
          <h2 class="mb-4 text-xl font-semibold">Join this quiz!</h2>

          <div class="mb-4 rounded-2xl bg-white p-4 shadow-lg">
            <div class="flex h-48 w-48 items-center justify-center rounded-xl bg-muted">
              <QrCode class="h-32 w-32 text-muted-foreground" />
            </div>
          </div>

          <p class="mb-2 text-muted-foreground">or enter the code:</p>

          <div class="flex items-center gap-2">
            <div class="rounded-xl bg-muted px-6 py-3 text-3xl font-bold tracking-widest">
              {accessCode}
            </div>
            <Button variant="outline" size="icon" onclick={copyCode}>
              {#if copied}
                <Check class="h-5 w-5 text-green-500" />
              {:else}
                <Copy class="h-5 w-5" />
              {/if}
            </Button>
          </div>

          <p class="mt-4 text-sm text-muted-foreground">
            Go to <span class="font-medium">quizspark.com</span> and enter the code
          </p>
        </Card.Root>

        <!-- Participants List -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Users class="h-5 w-5" />
              Participants ({mockParticipants.length})
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {#if mockParticipants.length === 0}
              <div class="py-8 text-center text-muted-foreground">
                Waiting for participants to join...
              </div>
            {:else}
              <div class="space-y-2">
                {#each mockParticipants as participant}
                  <div
                    class="flex items-center justify-between rounded-lg border p-3 {participant.isConnected
                      ? ''
                      : 'opacity-50'}"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-spark-purple/10 font-bold text-spark-purple"
                      >
                        {participant.name[0]}
                      </div>
                      <span class="font-medium">{participant.name}</span>
                    </div>
                    <Badge variant={participant.isConnected ? 'success' : 'secondary'}>
                      {participant.isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </div>
    {:else if gameStatus === 'completed'}
      <!-- Results Screen -->
      <Card.Root class="mx-auto max-w-2xl">
        <Card.Header class="text-center">
          <Trophy class="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <Card.Title class="text-2xl">Game Complete!</Card.Title>
          <Card.Description>Final Leaderboard</Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="space-y-3">
            {#each participants.slice(0, 10) as participant}
              <div
                class="flex items-center justify-between rounded-lg border p-4 {participant.rank <=
                3
                  ? 'bg-gradient-to-r from-yellow-50 to-transparent'
                  : ''}"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full font-bold {participant.rank ===
                    1
                      ? 'bg-yellow-500 text-white'
                      : participant.rank === 2
                        ? 'bg-gray-400 text-white'
                        : participant.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted'}"
                  >
                    {participant.rank}
                  </div>
                  <span class="font-medium">{participant.name}</span>
                </div>
                <span class="text-xl font-bold text-gradient">{participant.score}</span>
              </div>
            {/each}
          </div>
        </Card.Content>
        <Card.Footer class="justify-center">
          <a href="/dashboard" class="btn-game"> Back to Dashboard </a>
        </Card.Footer>
      </Card.Root>
    {:else}
      <!-- Active Game -->
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Current Question -->
        <div class="lg:col-span-2">
          <Card.Root>
            <Card.Header>
              <div class="flex items-center justify-between">
                <Badge variant="secondary">
                  Question {currentQuestionIndex + 1} of {mockQuestions.length}
                </Badge>
                <div class="flex items-center gap-2 text-muted-foreground">
                  <Clock class="h-4 w-4" />
                  <span>30s</span>
                </div>
              </div>
              <div class="mt-4">
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: {progress}%"></div>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <h2 class="text-2xl font-bold">{currentQuestion.text}</h2>

              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="rounded-xl border-2 bg-card p-4 text-center">
                  <p class="text-3xl font-bold text-gradient">{currentQuestion.answeredCount}</p>
                  <p class="text-sm text-muted-foreground">Answered</p>
                </div>
                <div class="rounded-xl border-2 bg-card p-4 text-center">
                  <p class="text-3xl font-bold text-spark-green">
                    {currentQuestion.answeredCount > 0
                      ? Math.round(
                          (currentQuestion.correctCount / currentQuestion.answeredCount) * 100
                        )
                      : 0}%
                  </p>
                  <p class="text-sm text-muted-foreground">Correct</p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Leaderboard -->
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Trophy class="h-5 w-5 text-yellow-500" />
              Leaderboard
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="space-y-2">
              {#each participants.slice(0, 5) as participant}
                <div
                  class="flex items-center justify-between rounded-lg p-2 {participant.rank <= 3
                    ? 'bg-muted'
                    : ''}"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold {participant.rank ===
                      1
                        ? 'bg-yellow-500 text-white'
                        : participant.rank === 2
                          ? 'bg-gray-400 text-white'
                          : participant.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-muted'}"
                    >
                      {participant.rank}
                    </span>
                    <span class="font-medium">{participant.name}</span>
                    {#if participant.streak > 0}
                      <span class="text-xs">🔥{participant.streak}</span>
                    {/if}
                  </div>
                  <span class="font-bold">{participant.score}</span>
                </div>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    {/if}
  </main>
</div>
