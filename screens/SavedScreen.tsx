import { EmptyState } from '@/components/EmptyState';

/**
 * Saved/favourite recipes. Saving itself is a P1 item (PRD section 7
 * Nice-to-Have), so this tab is a shell until Phase 2 -- the tab exists now
 * because Design.md section 4 specifies a fixed 4-tab bar.
 */
export function SavedScreen() {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="Nothing saved yet"
      body="Recipes you save will collect here, so a dish that worked once is easy to find again."
    />
  );
}
