<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from 'svelte-sonner';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />

<div class="safe-area-all min-h-screen">
  {@render children()}
</div>
