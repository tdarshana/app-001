<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: import('svelte').Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
