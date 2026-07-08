/**
 * Crystal Jade Palace domain types (docs §8.4). The Home dining preview (§5.1
 * S5) reads a slice of the `restaurant` singleton, not `homePage`.
 */

/** Michelin / accolade / private-dining credential (docs §5.1 S5, §8.4). */
export type CredentialRow = {
  label: string;
  value: string;
  detail?: string;
};

/** The fields the Home dining preview needs from the `restaurant` singleton. */
export type RestaurantPreview = {
  name: string;
  lede: string;
  credentials: CredentialRow[];
};
