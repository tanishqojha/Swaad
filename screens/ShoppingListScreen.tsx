import { EmptyState } from '@/components/EmptyState';

/**
 * The shopping list for missing ingredients, with a running total against the
 * stated budget (PRD section 5 step 5). It is a list, never a cart -- there is
 * nothing to buy in-app (Design.md section 7).
 */
export function ShoppingListScreen() {
  return (
    <EmptyState
      icon="cart-outline"
      title="No shopping list yet"
      body="Pick a recipe that needs a few extra ingredients and the list will show up here, priced against your budget."
    />
  );
}
