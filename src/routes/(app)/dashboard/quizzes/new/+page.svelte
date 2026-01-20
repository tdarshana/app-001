<script lang="ts">
  import {
    Sparkles,
    ArrowLeft,
    Upload,
    Link,
    FileText,
    Wand2,
    Loader2,
    Plus,
    Trash2
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Card from '$lib/components/ui/card';
  import type { CreateQuestionInput } from '$lib/types/quiz';

  type GenerationMethod = 'manual' | 'document' | 'url' | 'ai';

  let title = $state('');
  let description = $state('');
  let method = $state<GenerationMethod>('manual');
  let sourceUrl = $state('');
  let isGenerating = $state(false);
  let questions = $state<CreateQuestionInput[]>([]);

  // Quiz settings
  let shuffleQuestions = $state(false);
  let shuffleAnswers = $state(false);
  let showExplanations = $state(true);
  let allowHints = $state(true);
  let passingScore = $state(60);

  const methods = [
    {
      value: 'manual',
      label: 'Manual',
      icon: FileText,
      description: 'Create questions yourself'
    },
    {
      value: 'document',
      label: 'Document',
      icon: Upload,
      description: 'Upload PDF, DOCX, or TXT'
    },
    {
      value: 'url',
      label: 'Website',
      icon: Link,
      description: 'Extract from any URL'
    },
    {
      value: 'ai',
      label: 'AI Topic',
      icon: Wand2,
      description: 'Generate from a topic'
    }
  ] as const;

  function addQuestion() {
    questions = [
      ...questions,
      {
        type: 'mcq',
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        hints: [],
        difficulty: 'medium',
        points: 10,
        timeLimit: 30
      }
    ];
  }

  function removeQuestion(index: number) {
    questions = questions.filter((_, i) => i !== index);
  }

  function updateQuestion(index: number, field: keyof CreateQuestionInput, value: unknown) {
    questions = questions.map((q, i) => (i === index ? { ...q, [field]: value } : q));
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    questions = questions.map((q, i) => {
      if (i !== questionIndex) return q;
      const newOptions = [...q.options];
      newOptions[optionIndex] = value;
      return { ...q, options: newOptions };
    });
  }

  async function generateQuestions() {
    if (!title.trim()) return;

    isGenerating = true;

    try {
      // TODO: Call AI service to generate questions
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated questions
      questions = [
        {
          type: 'mcq',
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          explanation: '2 + 2 equals 4',
          hints: ['Count on your fingers'],
          difficulty: 'easy',
          points: 10,
          timeLimit: 30
        },
        {
          type: 'mcq',
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          explanation: 'Paris is the capital city of France',
          hints: ['It has the Eiffel Tower'],
          difficulty: 'easy',
          points: 10,
          timeLimit: 30
        }
      ];
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      isGenerating = false;
    }
  }

  async function handleSave() {
    // TODO: Save quiz to Convex
    console.log('Saving quiz:', {
      title,
      description,
      questions,
      settings: {
        shuffleQuestions,
        shuffleAnswers,
        showExplanations,
        allowHints,
        passingScore
      }
    });
  }
</script>

<svelte:head>
  <title>Create Quiz - QuizSpark</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b bg-card">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <div class="flex items-center gap-4">
        <a
          href="/dashboard"
          class="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft class="h-5 w-5" />
          Back
        </a>
        <h1 class="text-xl font-semibold">Create New Quiz</h1>
      </div>

      <Button onclick={handleSave} disabled={!title.trim() || questions.length === 0}>
        Save Quiz
      </Button>
    </div>
  </header>

  <main class="mx-auto max-w-5xl px-4 py-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Main Content -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Basic Info -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Quiz Details</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div>
              <label for="title" class="mb-2 block text-sm font-medium">Title</label>
              <Input id="title" bind:value={title} placeholder="Enter quiz title..." />
            </div>
            <div>
              <label for="description" class="mb-2 block text-sm font-medium"
                >Description (optional)</label
              >
              <Textarea
                id="description"
                bind:value={description}
                placeholder="What is this quiz about?"
                rows={3}
              />
            </div>
          </Card.Content>
        </Card.Root>

        <!-- Generation Method -->
        <Card.Root>
          <Card.Header>
            <Card.Title>How would you like to create questions?</Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {#each methods as m}
                <button
                  type="button"
                  class="flex flex-col items-center rounded-xl border-2 p-4 transition-all {method ===
                  m.value
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'}"
                  onclick={() => (method = m.value)}
                >
                  <m.icon
                    class="mb-2 h-8 w-8 {method === m.value ? 'text-primary' : 'text-muted-foreground'}"
                  />
                  <span class="text-sm font-medium">{m.label}</span>
                  <span class="mt-1 text-xs text-muted-foreground">{m.description}</span>
                </button>
              {/each}
            </div>

            <!-- Method-specific inputs -->
            {#if method === 'url'}
              <div class="mt-4">
                <label for="sourceUrl" class="mb-2 block text-sm font-medium">Website URL</label>
                <div class="flex gap-2">
                  <Input
                    id="sourceUrl"
                    bind:value={sourceUrl}
                    placeholder="https://example.com/article"
                    class="flex-1"
                  />
                  <Button onclick={generateQuestions} disabled={!sourceUrl.trim() || isGenerating}>
                    {#if isGenerating}
                      <Loader2 class="h-4 w-4 animate-spin" />
                    {:else}
                      <Wand2 class="h-4 w-4" />
                    {/if}
                    Generate
                  </Button>
                </div>
              </div>
            {:else if method === 'document'}
              <div class="mt-4">
                <label class="mb-2 block text-sm font-medium">Upload Document</label>
                <div
                  class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted p-8 transition-colors hover:border-primary/50"
                >
                  <Upload class="mb-2 h-10 w-10 text-muted-foreground" />
                  <p class="text-sm text-muted-foreground">
                    Drag & drop or click to upload PDF, DOCX, or TXT
                  </p>
                </div>
              </div>
            {:else if method === 'ai'}
              <div class="mt-4">
                <label for="aiTopic" class="mb-2 block text-sm font-medium">Topic</label>
                <div class="flex gap-2">
                  <Input
                    id="aiTopic"
                    bind:value={title}
                    placeholder="e.g., Multiplication tables for grade 3"
                    class="flex-1"
                  />
                  <Button onclick={generateQuestions} disabled={!title.trim() || isGenerating}>
                    {#if isGenerating}
                      <Loader2 class="h-4 w-4 animate-spin" />
                    {:else}
                      <Sparkles class="h-4 w-4" />
                    {/if}
                    Generate
                  </Button>
                </div>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>

        <!-- Questions -->
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between">
              <Card.Title>Questions ({questions.length})</Card.Title>
              <Button variant="outline" size="sm" onclick={addQuestion}>
                <Plus class="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            {#if questions.length === 0}
              <div class="py-8 text-center text-muted-foreground">
                <FileText class="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No questions yet</p>
                <p class="text-sm">Add questions manually or generate them with AI</p>
              </div>
            {:else}
              <div class="space-y-6">
                {#each questions as question, qIndex}
                  <div class="rounded-lg border p-4">
                    <div class="mb-4 flex items-start justify-between">
                      <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium">
                        Question {qIndex + 1}
                      </span>
                      <button
                        type="button"
                        class="text-muted-foreground hover:text-destructive"
                        onclick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="space-y-4">
                      <div>
                        <label class="mb-1 block text-sm font-medium">Question Text</label>
                        <Textarea
                          value={question.text}
                          oninput={(e) => updateQuestion(qIndex, 'text', e.currentTarget.value)}
                          placeholder="Enter your question..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <label class="mb-2 block text-sm font-medium">Answer Options</label>
                        <div class="space-y-2">
                          {#each question.options as option, oIndex}
                            <div class="flex items-center gap-2">
                              <button
                                type="button"
                                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors {question.correctAnswer ===
                                oIndex
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : 'border-muted hover:border-green-500'}"
                                onclick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              >
                                {String.fromCharCode(65 + oIndex)}
                              </button>
                              <Input
                                value={option}
                                oninput={(e) => updateOption(qIndex, oIndex, e.currentTarget.value)}
                                placeholder="Option {String.fromCharCode(65 + oIndex)}"
                                class="flex-1"
                              />
                            </div>
                          {/each}
                        </div>
                        <p class="mt-2 text-xs text-muted-foreground">
                          Click the letter to mark the correct answer
                        </p>
                      </div>

                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <label class="mb-1 block text-sm font-medium">Difficulty</label>
                          <select
                            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            value={question.difficulty}
                            onchange={(e) =>
                              updateQuestion(qIndex, 'difficulty', e.currentTarget.value)}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium">Points</label>
                          <Input
                            type="number"
                            value={question.points}
                            oninput={(e) =>
                              updateQuestion(qIndex, 'points', parseInt(e.currentTarget.value) || 10)}
                            min="1"
                            max="100"
                          />
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium">Time (sec)</label>
                          <Input
                            type="number"
                            value={question.timeLimit}
                            oninput={(e) =>
                              updateQuestion(
                                qIndex,
                                'timeLimit',
                                parseInt(e.currentTarget.value) || 30
                              )}
                            min="5"
                            max="300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Sidebar - Settings -->
      <div class="space-y-6">
        <Card.Root>
          <Card.Header>
            <Card.Title>Quiz Settings</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <label class="flex items-center justify-between">
              <span class="text-sm">Shuffle Questions</span>
              <input
                type="checkbox"
                bind:checked={shuffleQuestions}
                class="h-5 w-5 rounded border-input"
              />
            </label>

            <label class="flex items-center justify-between">
              <span class="text-sm">Shuffle Answers</span>
              <input
                type="checkbox"
                bind:checked={shuffleAnswers}
                class="h-5 w-5 rounded border-input"
              />
            </label>

            <label class="flex items-center justify-between">
              <span class="text-sm">Show Explanations</span>
              <input
                type="checkbox"
                bind:checked={showExplanations}
                class="h-5 w-5 rounded border-input"
              />
            </label>

            <label class="flex items-center justify-between">
              <span class="text-sm">Allow Hints</span>
              <input
                type="checkbox"
                bind:checked={allowHints}
                class="h-5 w-5 rounded border-input"
              />
            </label>

            <div>
              <label class="mb-2 block text-sm">Passing Score (%)</label>
              <Input type="number" bind:value={passingScore} min="0" max="100" />
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Preview</Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Questions</span>
                <span class="font-medium">{questions.length}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total Points</span>
                <span class="font-medium">{questions.reduce((sum, q) => sum + q.points, 0)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Est. Duration</span>
                <span class="font-medium">
                  {Math.ceil(questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)} min
                </span>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </main>
</div>
