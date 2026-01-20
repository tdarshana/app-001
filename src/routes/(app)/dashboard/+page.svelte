<script lang="ts">
  import { Plus, Sparkles, Play, BarChart3, Users, Folder } from 'lucide-svelte';
  import * as Card from '$lib/components/ui/card';

  // Mock data - will be replaced with Convex queries
  const stats = {
    totalQuizzes: 12,
    totalSessions: 48,
    totalStudents: 156,
    avgScore: 78
  };

  const recentQuizzes = [
    { id: '1', title: 'Math Multiplication Tables', questions: 10, status: 'published', plays: 24 },
    { id: '2', title: 'Science: Solar System', questions: 15, status: 'published', plays: 18 },
    { id: '3', title: 'English Vocabulary Quiz', questions: 20, status: 'draft', plays: 0 }
  ];
</script>

<svelte:head>
  <title>Dashboard - QuizSpark</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b bg-card">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <div class="flex items-center gap-2">
        <Sparkles class="h-8 w-8 text-spark-purple" />
        <span class="text-2xl font-bold text-gradient">QuizSpark</span>
      </div>

      <div class="flex items-center gap-4">
        <a href="/dashboard/quizzes/new" class="btn-game">
          <Plus class="h-5 w-5" />
          Create Quiz
        </a>
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-spark-purple text-white"
        >
          T
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Welcome back, Teacher!</h1>
      <p class="text-muted-foreground">Here's what's happening with your quizzes.</p>
    </div>

    <!-- Stats Grid -->
    <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card.Root>
        <Card.Content class="flex items-center gap-4 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-spark-purple/10">
            <Folder class="h-6 w-6 text-spark-purple" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Quizzes</p>
            <p class="text-2xl font-bold">{stats.totalQuizzes}</p>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Content class="flex items-center gap-4 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-spark-pink/10">
            <Play class="h-6 w-6 text-spark-pink" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Sessions Hosted</p>
            <p class="text-2xl font-bold">{stats.totalSessions}</p>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Content class="flex items-center gap-4 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-spark-blue/10">
            <Users class="h-6 w-6 text-spark-blue" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Students Reached</p>
            <p class="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root>
        <Card.Content class="flex items-center gap-4 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-spark-green/10">
            <BarChart3 class="h-6 w-6 text-spark-green" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Avg. Score</p>
            <p class="text-2xl font-bold">{stats.avgScore}%</p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Recent Quizzes -->
    <Card.Root>
      <Card.Header>
        <div class="flex items-center justify-between">
          <Card.Title>Recent Quizzes</Card.Title>
          <a href="/dashboard/quizzes" class="text-sm text-primary hover:underline">View all</a>
        </div>
      </Card.Header>
      <Card.Content>
        <div class="space-y-4">
          {#each recentQuizzes as quiz}
            <div
              class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <h3 class="font-medium">{quiz.title}</h3>
                <p class="text-sm text-muted-foreground">
                  {quiz.questions} questions • {quiz.plays} plays
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium {quiz.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'}"
                >
                  {quiz.status}
                </span>
                <a
                  href="/dashboard/quizzes/{quiz.id}"
                  class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Edit
                </a>
                {#if quiz.status === 'published'}
                  <a
                    href="/dashboard/quizzes/{quiz.id}/host"
                    class="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Host
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </main>
</div>
