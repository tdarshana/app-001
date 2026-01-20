<script lang="ts">
  import { Sparkles, Zap, Users, QrCode } from 'lucide-svelte';

  let joinCode = $state('');

  function handleJoin(e: Event) {
    e.preventDefault();
    if (joinCode.trim()) {
      window.location.href = `/play/${joinCode.toUpperCase()}`;
    }
  }
</script>

<svelte:head>
  <title>QuizSpark - AI-Powered Learning</title>
</svelte:head>

<main class="flex min-h-screen flex-col">
  <!-- Hero Section -->
  <section
    class="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-spark-purple/10 to-background px-4 py-12"
  >
    <div class="mb-8 flex items-center gap-2">
      <Sparkles class="h-12 w-12 text-spark-purple" />
      <h1 class="text-4xl font-bold md:text-6xl">
        <span class="text-gradient">QuizSpark</span>
      </h1>
    </div>

    <p class="mb-8 max-w-md text-center text-lg text-muted-foreground">
      AI-powered interactive learning platform for primary education. Create engaging quizzes in
      seconds!
    </p>

    <!-- Join Game Card -->
    <div class="game-card mb-8 w-full max-w-sm">
      <h2 class="mb-4 text-center text-xl font-semibold">Join a Quiz</h2>
      <form onsubmit={handleJoin} class="flex flex-col gap-4">
        <input
          type="text"
          bind:value={joinCode}
          placeholder="Enter game code"
          class="w-full rounded-xl border-2 border-muted bg-background p-4 text-center text-2xl font-bold uppercase tracking-wider placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal focus:border-primary focus:outline-none"
          maxlength="6"
        />
        <button type="submit" class="btn-game" disabled={!joinCode.trim()}> Join Game </button>
      </form>

      <div class="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <QrCode class="h-4 w-4" />
        <span>Or scan a QR code to join</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-4 sm:flex-row">
      <a
        href="/auth/login"
        class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-background px-8 py-3 font-semibold text-primary transition-all hover:bg-primary/5"
      >
        Sign In
      </a>
      <a
        href="/auth/register"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90"
      >
        Get Started Free
      </a>
    </div>
  </section>

  <!-- Features Section -->
  <section class="bg-muted/50 px-4 py-16">
    <div class="mx-auto max-w-5xl">
      <h2 class="mb-12 text-center text-3xl font-bold">Why Teachers Love QuizSpark</h2>

      <div class="grid gap-8 md:grid-cols-3">
        <div class="game-card text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-spark-purple/10"
          >
            <Sparkles class="h-8 w-8 text-spark-purple" />
          </div>
          <h3 class="mb-2 text-xl font-semibold">AI Quiz Generation</h3>
          <p class="text-muted-foreground">
            Upload any document, URL, or video and get quiz questions instantly powered by AI.
          </p>
        </div>

        <div class="game-card text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-spark-pink/10"
          >
            <Zap class="h-8 w-8 text-spark-pink" />
          </div>
          <h3 class="mb-2 text-xl font-semibold">Engaging Game Modes</h3>
          <p class="text-muted-foreground">
            Race, Tower Defense, Puzzle Quest, and more! Kids learn while having fun.
          </p>
        </div>

        <div class="game-card text-center">
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-spark-blue/10"
          >
            <Users class="h-8 w-8 text-spark-blue" />
          </div>
          <h3 class="mb-2 text-xl font-semibold">Real-Time Dashboard</h3>
          <p class="text-muted-foreground">
            Monitor student progress live, identify struggling students, and provide instant help.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t px-4 py-8">
    <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center gap-2">
        <Sparkles class="h-6 w-6 text-spark-purple" />
        <span class="font-semibold">QuizSpark</span>
      </div>
      <p class="text-sm text-muted-foreground">
        Made with love for educators and students everywhere
      </p>
    </div>
  </footer>
</main>
