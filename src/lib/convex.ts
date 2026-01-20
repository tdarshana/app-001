import { ConvexClient } from 'convex/browser';
import { browser } from '$app/environment';

// Convex URL - will be set from environment
const CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL as string | undefined;

// Create the Convex client (only on client-side with valid URL)
export const convex = browser && CONVEX_URL ? new ConvexClient(CONVEX_URL) : null;

// Helper to ensure client is available
export function getConvex() {
  if (!convex) {
    throw new Error('Convex client not initialized. Make sure PUBLIC_CONVEX_URL is set.');
  }
  return convex;
}
