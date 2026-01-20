<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: import('svelte').Snippet;
  };

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('flex items-center p-6 pt-0', className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
