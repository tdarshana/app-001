<script lang="ts">
  import { page } from '$app/stores';
  import { Sparkles, Loader2 } from 'lucide-svelte';

  let displayName = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  const code = $derived($page.params.code?.toUpperCase() ?? '');

  async function handleJoin(e: Event) {
    e.preventDefault();
    if (!displayName.trim()) return;

    isLoading = true;
    error = null;

    try {
      // TODO: Call Convex to join session
      // const result = await convex.mutation(api.sessions.join, {
      //   accessCode: code,
      //   displayName: displayName.trim()
      // });
      // Redirect to game page
      // window.location.href = `/play/${code}/game`;

      // Temporary: just show loading
      await new Promise((resolve) => setTimeout(resolve, 1000));
      error = 'Game session not found. Please check the code and try again.';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to join game';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Join Quiz - QuizSpark</title>
</svelte:head>

<main
  class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-spark-purple/10 to-background px-4"
>
  <div class="mb-8 flex items-center gap-2">
    <Sparkles class="h-10 w-10 text-spark-purple" />
    <span class="text-3xl font-bold text-gradient">QuizSpark</span>
  </div>

  <div class="game-card w-full max-w-sm">
    <div class="mb-6 text-center">
      <p class="text-sm text-muted-foreground">Joining game</p>
      <p class="text-3xl font-bold tracking-wider">{code}</p>
    </div>

    <form onsubmit={handleJoin} class="flex flex-col gap-4">
      <div>
        <label for="displayName" class="mb-2 block text-sm font-medium">Your Nickname</label>
        <input
          id="displayName"
          type="text"
          bind:value={displayName}
          placeholder="Enter your nickname"
          class="w-full rounded-xl border-2 border-muted bg-background p-4 text-lg focus:border-primary focus:outline-none"
          maxlength="20"
          disabled={isLoading}
        />
      </div>

      {#if error}
        <div class="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          {error}
        </div>
      {/if}

      <button type="submit" class="btn-game" disabled={!displayName.trim() || isLoading}>
        {#if isLoading}
          <Loader2 class="h-5 w-5 animate-spin" />
          Joining...
        {:else}
          Join Game
        {/if}
      </button>
    </form>

    <div class="mt-6 text-center">
      <a href="/" class="text-sm text-muted-foreground hover:text-primary"> ← Back to home </a>
    </div>
  </div>
</main>
