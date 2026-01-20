<script lang="ts">
  import { Sparkles, Loader2, Mail, Lock, User, GraduationCap, Users } from 'lucide-svelte';

  type Role = 'teacher' | 'student' | 'parent';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let role = $state<Role>('teacher');
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  const roles = [
    { value: 'teacher', label: 'Teacher', icon: GraduationCap, description: 'Create and host quizzes' },
    { value: 'student', label: 'Student', icon: User, description: 'Join and play quizzes' },
    { value: 'parent', label: 'Parent', icon: Users, description: 'Monitor your child' }
  ] as const;

  async function handleRegister(e: Event) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    isLoading = true;
    error = null;

    try {
      // TODO: Implement registration with Convex Auth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to onboarding or dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create account';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign Up - QuizSpark</title>
</svelte:head>

<main
  class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-spark-purple/10 to-background px-4 py-12"
>
  <a href="/" class="mb-8 flex items-center gap-2">
    <Sparkles class="h-10 w-10 text-spark-purple" />
    <span class="text-3xl font-bold text-gradient">QuizSpark</span>
  </a>

  <div class="game-card w-full max-w-md">
    <h1 class="mb-6 text-center text-2xl font-bold">Create Your Account</h1>

    <form onsubmit={handleRegister} class="flex flex-col gap-4">
      <!-- Role Selection -->
      <div>
        <label class="mb-2 block text-sm font-medium">I am a...</label>
        <div class="grid grid-cols-3 gap-2">
          {#each roles as roleOption}
            <button
              type="button"
              class="flex flex-col items-center rounded-xl border-2 p-3 transition-all {role === roleOption.value
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-primary/50'}"
              onclick={() => (role = roleOption.value)}
            >
              <roleOption.icon
                class="mb-1 h-6 w-6 {role === roleOption.value ? 'text-primary' : 'text-muted-foreground'}"
              />
              <span class="text-sm font-medium">{roleOption.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <div>
        <label for="name" class="mb-2 block text-sm font-medium">Full Name</label>
        <div class="relative">
          <User class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Your name"
            class="w-full rounded-xl border-2 border-muted bg-background py-3 pl-12 pr-4 focus:border-primary focus:outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label for="email" class="mb-2 block text-sm font-medium">Email</label>
        <div class="relative">
          <Mail class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
          <Lock class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="At least 8 characters"
            class="w-full rounded-xl border-2 border-muted bg-background py-3 pl-12 pr-4 focus:border-primary focus:outline-none"
            minlength="8"
            disabled={isLoading}
          />
        </div>
      </div>

      {#if error}
        <div class="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        class="btn-game"
        disabled={!name.trim() || !email.trim() || password.length < 8 || isLoading}
      >
        {#if isLoading}
          <Loader2 class="h-5 w-5 animate-spin" />
          Creating account...
        {:else}
          Create Account
        {/if}
      </button>

      <p class="text-center text-xs text-muted-foreground">
        By signing up, you agree to our
        <a href="/terms" class="underline hover:text-primary">Terms of Service</a>
        and
        <a href="/privacy" class="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </form>

    <div class="mt-6 text-center text-sm">
      <span class="text-muted-foreground">Already have an account?</span>
      <a href="/auth/login" class="ml-1 font-medium text-primary hover:underline"> Sign in </a>
    </div>
  </div>

  <div class="mt-6 text-center">
    <a href="/" class="text-sm text-muted-foreground hover:text-primary"> ← Back to home </a>
  </div>
</main>
