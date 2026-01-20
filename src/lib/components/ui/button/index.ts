import { tv, type VariantProps } from 'tailwind-variants';
import Root from './button.svelte';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      // Custom QuizSpark variants
      game: 'bg-gradient-to-r from-spark-purple to-spark-pink text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
      correct: 'bg-green-500 hover:bg-green-600 text-white',
      wrong: 'bg-red-500 hover:bg-red-600 text-white',
      answer:
        'border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 text-left h-auto py-4 px-6 justify-start'
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-lg px-8',
      xl: 'h-14 rounded-xl px-10 text-lg',
      icon: 'h-10 w-10'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});

export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  class?: string;
};

export { Root, Root as Button };
