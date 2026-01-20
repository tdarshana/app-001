<script lang="ts">
  import { Sparkles, Loader2, Mail, Lock } from 'lucide-svelte';

  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function handleLogin(e: Event) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    isLoading = true;
    error = null;

    try {
      // TODO: Implement authentication with Convex Auth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to sign in';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - QuizSpark</title>
</svelte:head>

<main
  class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-spark-purple/10 to-background px-4"
>
  <a href="/" class="mb-8 flex items-center gap-2">
    <Sparkles class="h-10 w-10 text-spark-purple" />
    <span class="text-3xl font-bold text-gradient">QuizSpark</span>
  </a>

  <div class="game-card w-full max-w-sm">
    <h1 class="mb-6 text-center text-2xl font-bold">Welcome Back!</h1>

    <form onsubmit={handleLogin} class="flex flex-col gap-4">
      <div>
        <label for="email" class="mb-2 block text-sm font-medium">Email</label>
        <div class="relative">
          <Mail
            class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            class="w-full rounded-xl border-2 border-muted bg-background py-3 pl-12 pr-4 focus:border-primary focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label for="password" class="mb-2 block text-sm font-medium">Password</label>
        <div class="relative">
          <Lock
            class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            class="w-full rounded-xl border-2 border-muted bg-background py-3 pl-12 pr-4 focus:border-primary focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      <div class="text-right">
        <a href="/auth/forgot-password" class="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>

      {#if error}
        <div class="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          {error}
        </div>
      {/if}

      <button type="submit" class="btn-game" disabled={!email.trim() || !password || isLoading}>
        {#if isLoading}
          <Loader2 class="h-5 w-5 animate-spin" />
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-muted-foreground">Don't have an account?</span>
      <a href="/auth/register" class="ml-1 font-medium text-primary hover:underline">
        Sign up free
      </a>
    </div>
  </div>

  <div class="mt-6 text-center">
    <a href="/" class="text-sm text-muted-foreground hover:text-primary"> ← Back to home </a>
  </div>
</main>
