export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};

// Newest entry first. `version` just needs to change whenever you want the
// dialog to resurface — it doesn't have to match package.json.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2026.07.03",
    date: "2026-07-03",
    title: "What's new",
    changes: [
      "Added a Changelog dialog to the dashboard so you always know what's new.",
    ],
  },
];

export const CURRENT_CHANGELOG_VERSION = CHANGELOG[0].version;
