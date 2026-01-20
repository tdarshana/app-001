<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLParagraphElement> & {
    children?: import('svelte').Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</p>
