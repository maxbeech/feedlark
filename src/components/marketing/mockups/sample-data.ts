/**
 * Single source of truth for the data shown in every marketing mockup, so the
 * hero board, roadmap, changelog and loop demo all feel like the same product.
 * This is illustrative product data (not live metrics) used only in mockups.
 */
export type MockStatus = "open" | "under_review" | "planned" | "in_progress" | "complete";

export type MockPost = {
  id: string;
  title: string;
  votes: number;
  status: MockStatus;
  comments: number;
};

export const MOCK_POSTS: MockPost[] = [
  { id: "dark-mode", title: "Dark mode for the dashboard", votes: 213, status: "in_progress", comments: 18 },
  { id: "slack", title: "Slack alerts for new feedback", votes: 168, status: "planned", comments: 9 },
  { id: "csv", title: "Export every request to CSV", votes: 96, status: "under_review", comments: 4 },
  { id: "sso", title: "Single sign-on (SAML)", votes: 74, status: "open", comments: 6 },
  { id: "api", title: "Public REST API & webhooks", votes: 51, status: "open", comments: 3 },
];

export const MOCK_STATUS_LABEL: Record<MockStatus, string> = {
  open: "Open",
  under_review: "Reviewing",
  planned: "Planned",
  in_progress: "In progress",
  complete: "Shipped",
};

export const MOCK_CHANGELOG = [
  { title: "Dark mode is here", category: "new" as const, when: "2 days ago", body: "You asked, we shipped. The whole dashboard now follows your system theme." },
  { title: "Faster board loading", category: "improved" as const, when: "1 week ago", body: "Public boards render up to 2x quicker, especially on mobile." },
];
