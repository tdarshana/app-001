<script lang="ts">
  import { Plus, Search, Folder, Play, Edit2, Trash2, MoreVertical } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';

  let searchQuery = $state('');

  // Mock data - will come from Convex
  const mockQuizzes = [
    {
      id: '1',
      title: 'Math Multiplication Tables',
      description: 'Practice multiplication facts from 1-12',
      questionCount: 20,
      status: 'published',
      plays: 48,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Science: Solar System',
      description: 'Learn about planets, moons, and stars',
      questionCount: 15,
      status: 'published',
      plays: 32,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      title: 'English Vocabulary - Grade 4',
      description: 'New vocabulary words for this month',
      questionCount: 25,
      status: 'draft',
      plays: 0,
      createdAt: '2024-01-18'
    },
    {
      id: '4',
      title: 'History: Ancient Egypt',
      description: 'Explore the wonders of ancient Egypt',
      questionCount: 18,
      status: 'published',
      plays: 24,
      createdAt: '2024-01-10'
    },
    {
      id: '5',
      title: 'Geography Quiz',
      description: 'Countries, capitals, and continents',
      questionCount: 30,
      status: 'archived',
      plays: 156,
      createdAt: '2023-12-01'
    }
  ];

  const filteredQuizzes = $derived(
    mockQuizzes.filter(
      (q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  }
</script>

<svelte:head>
  <title>My Quizzes - QuizSpark</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b bg-card">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <div class="flex items-center gap-4">
        <a href="/dashboard" class="text-muted-foreground hover:text-foreground">Dashboard</a>
        <span class="text-muted-foreground">/</span>
        <h1 class="text-xl font-semibold">My Quizzes</h1>
      </div>

      <a href="/dashboard/quizzes/new">
        <Button variant="game">
          <Plus class="h-5 w-5" />
          Create Quiz
        </Button>
      </a>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8">
    <!-- Search & Filters -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-sm">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          bind:value={searchQuery}
          placeholder="Search quizzes..."
          class="pl-10"
        />
      </div>

      <div class="flex gap-2">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="ghost" size="sm">Published</Button>
        <Button variant="ghost" size="sm">Drafts</Button>
        <Button variant="ghost" size="sm">Archived</Button>
      </div>
    </div>

    <!-- Quizzes Grid -->
    {#if filteredQuizzes.length === 0}
      <Card.Root class="py-12 text-center">
        <Folder class="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 class="mb-2 text-lg font-medium">No quizzes found</h3>
        <p class="mb-4 text-muted-foreground">
          {searchQuery ? 'Try a different search term' : 'Create your first quiz to get started'}
        </p>
        {#if !searchQuery}
          <a href="/dashboard/quizzes/new">
            <Button variant="game">
              <Plus class="h-5 w-5" />
              Create Quiz
            </Button>
          </a>
        {/if}
      </Card.Root>
    {:else}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredQuizzes as quiz}
          <Card.Root class="group transition-shadow hover:shadow-lg">
            <Card.Header class="pb-3">
              <div class="flex items-start justify-between">
                <Badge variant={getStatusBadge(quiz.status)}>{quiz.status}</Badge>
                <button
                  class="rounded-lg p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                >
                  <MoreVertical class="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <Card.Title class="line-clamp-1">{quiz.title}</Card.Title>
              <Card.Description class="line-clamp-2">{quiz.description}</Card.Description>
            </Card.Header>
            <Card.Content>
              <div class="flex items-center justify-between text-sm text-muted-foreground">
                <span>{quiz.questionCount} questions</span>
                <span>{quiz.plays} plays</span>
              </div>
            </Card.Content>
            <Card.Footer class="gap-2">
              <a href="/dashboard/quizzes/{quiz.id}" class="flex-1">
                <Button variant="outline" class="w-full" size="sm">
                  <Edit2 class="h-4 w-4" />
                  Edit
                </Button>
              </a>
              {#if quiz.status === 'published'}
                <a href="/dashboard/quizzes/{quiz.id}/host" class="flex-1">
                  <Button variant="default" class="w-full" size="sm">
                    <Play class="h-4 w-4" />
                    Host
                  </Button>
                </a>
              {:else if quiz.status === 'draft'}
                <Button variant="default" class="flex-1" size="sm">
                  Publish
                </Button>
              {/if}
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {/if}
  </main>
</div>
