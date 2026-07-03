export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  /** User-facing changes worth surfacing in the dialog. */
  highlights: string[];
  /** Internal/technical changes shown collapsed, low priority for users. */
  minor: string[];
};

// Newest entry first. `version` just needs to change whenever you want the
// dialog to resurface — it doesn't have to match package.json.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2026.07.03",
    date: "2026-07-03",
    title: "What's new",
    highlights: [
      "You can now delete an expense, not just edit it.",
      "Group debts can now be deleted from a group.",
      "The home page shows a live debt board with your overall balance across groups.",
      "Added a light/dark theme toggle in the app shell.",
      "Settling up: once every participant confirms a payment, the expense is automatically marked as settled.",
      "Added this Changelog dialog so you always know what's new.",
    ],
    minor: [
      "Faster initial load via route-level lazy loading and font/preconnect tuning.",
      "Network requests now time out cleanly instead of hanging indefinitely.",
      "Various UI polish: refreshed icons and layout in the group debt widget, simplified home page welcome text, consistent theme variables across pages.",
      "Backend: tightened expense-delete authorization checks.",
      "Backend: adjusted API rate limits for better throughput.",
    ],
  },
];

export const CURRENT_CHANGELOG_VERSION = CHANGELOG[0].version;
