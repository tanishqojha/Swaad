import { EmptyState } from '@/components/EmptyState';

/**
 * Entry point for the input flow: ingredients -> budget -> meal type ->
 * dietary filters -> 2-3 ranked results (PRD section 5). The flow screens land
 * here in the next task; this is the shell.
 */
export function HomeScreen() {
  return (
    <EmptyState
      icon="restaurant-outline"
      title="What's in your kitchen?"
      body="Tell Swaad what you have, what you can spend and what you feel like eating, and it will find a few dishes you can actually cook tonight."
    />
  );
}
