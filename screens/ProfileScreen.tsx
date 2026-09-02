import { EmptyState } from '@/components/EmptyState';

/**
 * Local preferences only -- default dietary filter, city tier for pricing.
 * There are no accounts in v1 (PRD section 3 non-goal), so nothing here signs
 * anybody in.
 */
export function ProfileScreen() {
  return (
    <EmptyState
      icon="person-outline"
      title="Your preferences"
      body="Set a default diet and your city tier here, so Swaad starts every search closer to what you actually cook."
    />
  );
}
