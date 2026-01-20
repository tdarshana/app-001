<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { badgeVariants, type BadgeProps } from './index';
  import type { HTMLAttributes } from 'svelte/elements';

  type Props = BadgeProps &
    HTMLAttributes<HTMLDivElement> & {
      children?: import('svelte').Snippet;
    };

  let { class: className, variant = 'default', children, ...restProps }: Props = $props();
</script>

<div class={cn(badgeVariants({ variant }), className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>
