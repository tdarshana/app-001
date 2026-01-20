<script lang="ts">
  import { page } from '$app/stores';
  import { fly, scale, fade } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import { Trophy, Clock, Zap, CheckCircle, XCircle, ArrowRight } from 'lucide-svelte';
  import { haptics } from '$lib/capacitor/haptics';

  // Mock game data - will come from Convex real-time subscription
  const mockQuestions = [
    {
      id: '1',
      text: 'What is 7 × 8?',
      options: ['54', '56', '62', '48'],
      correctAnswer: 1,
      timeLimit: 30,
      points: 10
    },
    {
      id: '2',
      text: 'What is the largest planet in our solar system?',
      options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
      correctAnswer: 1,
      timeLimit: 30,
      points: 10
    },
    {
      id: '3',
      text: 'Which animal is known as the "King of the Jungle"?',
      options: ['Tiger', 'Elephant', 'Lion', 'Gorilla'],
      correctAnswer: 2,
      timeLimit: 30,
      points: 10
    }
  ];

  let currentQuestionIndex = $state(0);
  let selectedAnswer = $state<number | null>(null);
  let hasAnswered = $state(false);
  let isCorrect = $state(false);
  let showResult = $state(false);
  let score = $state(0);
  let streak = $state(0);
  let timeRemaining = $state(30);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let gameCompleted = $state(false);

  const currentQuestion = $derived(mockQuestions[currentQuestionIndex]);
  const progress = $derived(((currentQuestionIndex + 1) / mockQuestions.length) * 100);
  const isLastQuestion = $derived(currentQuestionIndex >= mockQuestions.length - 1);

  $effect(() => {
    // Start timer when question changes
    startTimer();

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  });

  function startTimer() {
    timeRemaining = currentQuestion?.timeLimit ?? 30;

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
      if (timeRemaining > 0 && !hasAnswered) {
        timeRemaining -= 1;
      } else if (timeRemaining === 0 && !hasAnswered) {
        handleTimeout();
      }
    }, 1000);
  }

  function handleTimeout() {
    hasAnswered = true;
    isCorrect = false;
    showResult = true;
    streak = 0;
    haptics.wrongAnswer();
  }

  async function handleSelect(index: number) {
    if (hasAnswered) return;

    selectedAnswer = index;
    hasAnswered = true;

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Check answer
    isCorrect = index === currentQuestion.correctAnswer;

    if (isCorrect) {
      // Calculate points based on time remaining
      const timeBonus = Math.floor((timeRemaining / currentQuestion.timeLimit) * 5);
      const points = currentQuestion.points + timeBonus;
      score += points;
      streak += 1;
      await haptics.correctAnswer();
    } else {
      streak = 0;
      await haptics.wrongAnswer();
    }

    showResult = true;
  }

  function nextQuestion() {
    if (isLastQuestion) {
      gameCompleted = true;
      return;
    }

    // Reset state
    selectedAnswer = null;
    hasAnswered = false;
    showResult = false;
    isCorrect = false;
    currentQuestionIndex += 1;
  }

  function getOptionClass(index: number) {
    if (!hasAnswered) {
      return selectedAnswer === index ? 'border-primary bg-primary/10' : 'border-muted';
    }

    if (index === currentQuestion.correctAnswer) {
      return 'border-green-500 bg-green-500/10';
    }

    if (index === selectedAnswer && !isCorrect) {
      return 'border-red-500 bg-red-500/10';
    }

    return 'border-muted opacity-50';
  }
</script>

<svelte:head>
  <title>Playing Quiz - QuizSpark</title>
</svelte:head>

{#if gameCompleted}
  <!-- Game Complete Screen -->
  <main
    class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-spark-purple/20 to-background px-4"
    in:scale={{ duration: 500, easing: elasticOut }}
  >
    <div class="game-card w-full max-w-md text-center">
      <div class="mb-6">
        <Trophy class="mx-auto h-20 w-20 text-yellow-500" />
      </div>
      <h1 class="mb-2 text-3xl font-bold">Quiz Complete!</h1>
      <p class="mb-6 text-muted-foreground">Great job! Here's how you did:</p>

      <div class="mb-8 grid grid-cols-2 gap-4">
        <div class="rounded-xl bg-muted p-4">
          <p class="text-3xl font-bold text-gradient">{score}</p>
          <p class="text-sm text-muted-foreground">Points</p>
        </div>
        <div class="rounded-xl bg-muted p-4">
          <p class="text-3xl font-bold text-spark-green">
            {Math.round((score / (mockQuestions.length * 10)) * 100)}%
          </p>
          <p class="text-sm text-muted-foreground">Accuracy</p>
        </div>
      </div>

      <div class="space-y-3">
        <a href="/" class="btn-game block w-full"> Play Again </a>
        <a
          href="/"
          class="block w-full rounded-xl border-2 border-muted py-3 font-medium transition-colors hover:bg-muted"
        >
          Back to Home
        </a>
      </div>
    </div>
  </main>
{:else}
  <!-- Game Play Screen -->
  <main class="flex min-h-screen flex-col bg-background">
    <!-- Top Bar -->
    <header class="border-b bg-card px-4 py-3">
      <div class="mx-auto flex max-w-2xl items-center justify-between">
        <!-- Score -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 rounded-full bg-spark-purple/10 px-3 py-1">
            <Zap class="h-4 w-4 text-spark-purple" />
            <span class="font-bold">{score}</span>
          </div>
          {#if streak > 1}
            <div
              class="flex items-center gap-1 rounded-full bg-spark-orange/10 px-3 py-1"
              in:scale={{ duration: 300 }}
            >
              <span class="text-sm">🔥 {streak}</span>
            </div>
          {/if}
        </div>

        <!-- Progress -->
        <div class="text-sm text-muted-foreground">
          {currentQuestionIndex + 1} / {mockQuestions.length}
        </div>

        <!-- Timer -->
        <div
          class="flex items-center gap-1 rounded-full px-3 py-1 {timeRemaining <= 10
            ? 'bg-red-100 text-red-600'
            : 'bg-muted'}"
        >
          <Clock class="h-4 w-4" />
          <span class="font-mono font-bold">{timeRemaining}s</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mx-auto mt-3 max-w-2xl">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: {progress}%"></div>
        </div>
      </div>
    </header>

    <!-- Question Content -->
    <div class="flex flex-1 flex-col px-4 py-8">
      <div class="mx-auto w-full max-w-2xl flex-1">
        <!-- Question Text -->
        {#key currentQuestionIndex}
          <div
            class="mb-8 text-center"
            in:fly={{ y: 20, duration: 400, delay: 100 }}
          >
            <h2 class="text-2xl font-bold md:text-3xl">{currentQuestion.text}</h2>
          </div>

          <!-- Options -->
          <div class="grid gap-3">
            {#each currentQuestion.options as option, i}
              <button
                class="btn-answer {getOptionClass(i)}"
                onclick={() => handleSelect(i)}
                disabled={hasAnswered}
                in:fly={{ y: 20, duration: 300, delay: 150 + i * 50 }}
              >
                <span
                  class="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold {hasAnswered &&
                  i === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-500 text-white'
                    : hasAnswered && i === selectedAnswer && !isCorrect
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-current'}"
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span class="text-lg">{option}</span>

                {#if hasAnswered && i === currentQuestion.correctAnswer}
                  <CheckCircle class="ml-auto h-6 w-6 text-green-500" />
                {:else if hasAnswered && i === selectedAnswer && !isCorrect}
                  <XCircle class="ml-auto h-6 w-6 text-red-500" />
                {/if}
              </button>
            {/each}
          </div>
        {/key}
      </div>

      <!-- Result & Next Button -->
      {#if showResult}
        <div
          class="mx-auto w-full max-w-2xl"
          in:fly={{ y: 20, duration: 300 }}
        >
          <div
            class="mb-4 rounded-xl p-4 text-center {isCorrect
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'}"
          >
            {#if isCorrect}
              <p class="text-lg font-bold">🎉 Correct!</p>
              <p class="text-sm">+{currentQuestion.points} points</p>
            {:else if selectedAnswer === null}
              <p class="text-lg font-bold">⏰ Time's up!</p>
              <p class="text-sm">The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}</p>
            {:else}
              <p class="text-lg font-bold">Not quite!</p>
              <p class="text-sm">The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}</p>
            {/if}
          </div>

          <button class="btn-game w-full" onclick={nextQuestion}>
            {isLastQuestion ? 'See Results' : 'Next Question'}
            <ArrowRight class="h-5 w-5" />
          </button>
        </div>
      {/if}
    </div>
  </main>
{/if}

<!-- Celebration Animation -->
{#if showResult && isCorrect}
  <div
    class="pointer-events-none fixed inset-0 z-50"
    in:scale={{ duration: 400, easing: elasticOut, start: 0.5 }}
    out:fade={{ duration: 200 }}
  >
    <div class="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-8xl">
      🎉
    </div>
  </div>
{/if}
