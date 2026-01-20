<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { buttonVariants, type ButtonProps } from './index';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Props = ButtonProps &
    HTMLButtonAttributes & {
      children?: import('svelte').Snippet;
    };

  let {
    class: className,
    variant = 'default',
    size = 'default',
    children,
    ...restProps
  }: Props = $props();
</script>

<button class={cn(buttonVariants({ variant, size }), className)} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</button>
