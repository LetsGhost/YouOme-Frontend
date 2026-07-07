export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  /** User-facing changes worth surfacing in the dialog. */
  highlights: string[];
  /** Internal/technical changes shown collapsed, low priority for users. */
  minor: string[];
};

// Newest entry first. `version` follows the same SemVer scheme as
// `CHANGELOG.md` / package.json (see that file for the PATCH/MINOR/MAJOR
// rule) and should be bumped in lockstep with it. Not every CHANGELOG.md
// entry needs one here — only add a version once something in it is
// actually worth telling a user about.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v0.14.0",
    date: "2026-07-07",
    title: "Email verification & forgot password",
    highlights: [
      "New accounts now verify their email via a link before they can sign in.",
      "Added \"Forgot password?\" on the sign-in page to reset your password by email.",
    ],
    minor: [
      "Sign-in now offers to resend the verification email if your account isn't verified yet.",
      "You'll get an email whenever your password changes.",
    ],
  },
  {
    version: "v0.11.1",
    date: "2026-07-04",
    title: "Add Expense dialog redesign",
    highlights: [],
    minor: [
      "Redesigned the \"Add Expense\" dialog with avatars for the payer and participants, and icon-labeled fields.",
    ],
  },
  {
    version: "v0.9.0",
    date: "2026-07-04",
    title: "Expense detail view",
    highlights: [
      "Tap any expense in a group's \"Recent Expenses\" list to see a full breakdown: who paid, the date, an overall settlement status, and each participant's share and payment status.",
    ],
    minor: [],
  },
  {
    version: "v0.8.0",
    date: "2026-07-04",
    title: "Welcome back splash",
    highlights: [
      "Signing in now shows a brief spinning-coin splash screen before landing on your dashboard.",
    ],
    minor: [],
  },
  {
    version: "v0.7.2",
    date: "2026-07-04",
    title: "Smoother loading states",
    highlights: [
      "Loading states across the app now show a small spinning-ring indicator instead of a gray placeholder shape, including a new loading indicator on the dashboard.",
    ],
    minor: [],
  },
  {
    version: "v0.7.1",
    date: "2026-07-04",
    title: "Debt board polish",
    highlights: [],
    minor: [
      "Current debts board: the \"Mark as paid\" button now shows a plain checkmark instead of a checkmark-in-a-circle.",
    ],
  },
  {
    version: "v0.7.0",
    date: "2026-07-04",
    title: "Remember me & smoother sessions",
    highlights: [
      "Added a \"Remember me\" checkbox on login for a longer-lived session.",
      "Your session now refreshes automatically when it expires, instead of getting stuck logged out.",
      "Added PWA install support — add YouOme to your phone's home screen like a native app.",
      "Group details header redesigned: a small settings icon next to the group name, and a clickable stack of member avatars that opens a members dialog.",
    ],
    minor: [
      "Group settings page: replaced the \"Back to group\" text button with an icon-only back button.",
    ],
  },
  {
    version: "v0.6.0",
    date: "2026-07-03",
    title: "Edit your profile",
    highlights: [
      "Your name and email on the Settings page are now editable.",
      "Added a \"Change password\" option on the Settings page.",
    ],
    minor: [
      "Removed the redundant \"Clear session & logout\" button from the Danger Zone (logout already lives in the nav).",
    ],
  },
  {
    version: "v0.5.0",
    date: "2026-07-03",
    title: "Redesigned expense cards",
    highlights: [
      "Redesigned the expense cards on the group debt board with a cleaner, more compact layout and a detail view when you tap into one.",
    ],
    minor: [
      "Fixed the expense detail view sometimes showing outdated payment status right after approving or paying from inside it.",
    ],
  },
  {
    version: "v0.4.0",
    date: "2026-07-03",
    title: "Profile & group pictures",
    highlights: [
      "Added profile pictures for you and your groups — upload, view, and remove an avatar from Settings, Group Settings, member lists, and more.",
    ],
    minor: [
      "Uploaded photos are automatically cropped and compressed to keep storage usage low.",
    ],
  },
  {
    version: "v0.3.0",
    date: "2026-07-03",
    title: "Smarter expense splitting",
    highlights: [
      "When splitting an expense equally leaves a leftover cent, you can now choose to absorb it yourself instead of some participants paying slightly more.",
    ],
    minor: [
      "Registration errors now show inline on the form.",
      "Removed a redundant subtitle on the group debt board.",
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-07-03",
    title: "Faster group pages",
    highlights: [
      "Group pages load expenses page-by-page instead of all at once — noticeably faster for groups with a long history.",
      "Recent Expenses and Members are now collapsible sections, so group pages open shorter by default.",
      "The Add Expense dialog opens full-screen on phones for easier input.",
      "You're now automatically signed out if your session expires, instead of the app getting stuck.",
      "Added a friendly error screen for unexpected crashes and a proper \"Page not found\" screen for unknown links.",
      "The app now looks and behaves more like a native app when added to your phone's home screen.",
    ],
    minor: [
      "This changelog dialog now shows past updates collapsed by default.",
      "Removed a redundant subtitle on the group settings page.",
    ],
  },
  {
    version: "v0.1.1",
    date: "2026-07-03",
    title: "Debt board polish",
    highlights: [
      "The group debt board now shows a clear progress badge (Awaiting payment / Awaiting review / partially confirmed / Settled) instead of a raw status label.",
    ],
    minor: [],
  },
  {
    version: "v0.1.0",
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
