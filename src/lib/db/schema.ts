import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/** Admin accounts (workspace owners / team members). */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  // New signups start unverified and must confirm their email before logging in.
  // Existing rows are backfilled to verified at migration time so nobody is locked out.
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  // Bumped on password reset / "log out everywhere"; embedded in every session
  // JWT so older tokens stop validating (stateless session revocation).
  sessionEpoch: integer("session_epoch").notNull().default(0),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

/** A customer's Feedlark space. Plan gates premium features. */
export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  plan: text("plan").notNull().default("free"), // free | pro
  brandingRemoved: integer("branding_removed", { mode: "boolean" }).notNull().default(false),
  customDomain: text("custom_domain"),
  aiEnabled: integer("ai_enabled", { mode: "boolean" }).notNull().default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  accentColor: text("accent_color").notNull().default("#f97316"),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  slugIdx: uniqueIndex("workspaces_slug_idx").on(t.slug),
  ownerIdx: index("workspaces_owner_idx").on(t.ownerId),
}));

/** Team seats (the billable unit — never per voter). */
export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("admin"), // owner | admin
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("members_ws_user_idx").on(t.workspaceId, t.userId),
}));

/** Pending team invitations (a teammate accepts via a tokenised link). */
export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"), // admin (owner is never invited)
  token: text("token").notNull(),
  invitedByUserId: text("invited_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull().default(now),
  expiresAt: integer("expires_at").notNull(),
}, (t) => ({
  tokenIdx: uniqueIndex("invitations_token_idx").on(t.token),
  wsEmailIdx: uniqueIndex("invitations_ws_email_idx").on(t.workspaceId, t.email),
}));

/** A feedback board within a workspace (unlimited on every plan). */
export const boards = sqliteTable("boards", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("boards_ws_slug_idx").on(t.workspaceId, t.slug),
}));

export const POST_STATUSES = [
  "open",
  "under_review",
  "planned",
  "in_progress",
  "complete",
  "closed",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

/** A feature request / idea / bug submitted to a board. */
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  status: text("status").notNull().default("open"),
  authorName: text("author_name").notNull().default("Anonymous"),
  authorEmail: text("author_email"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  voteCount: integer("vote_count").notNull().default(0),
  shippedChangelogId: text("shipped_changelog_id"),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  boardIdx: index("posts_board_idx").on(t.boardId),
  wsStatusIdx: index("posts_ws_status_idx").on(t.workspaceId, t.status),
}));

/** One vote per voter per post. Voter is anonymous (cookie id), email optional. */
export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  voterKey: text("voter_key").notNull(), // anon cookie id or email
  voterEmail: text("voter_email"),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("votes_post_voter_idx").on(t.postId, t.voterKey),
  postIdx: index("votes_post_idx").on(t.postId),
}));

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorName: text("author_name").notNull().default("Anonymous"),
  authorEmail: text("author_email"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  // Internal team notes (Pro): visible only in the dashboard, never on public pages.
  isInternal: integer("is_internal", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  postIdx: index("comments_post_idx").on(t.postId),
}));

export const changelogEntries = sqliteTable("changelog_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  body: text("body").notNull().default(""),
  category: text("category").notNull().default("new"), // new | improved | fixed
  linkedPostId: text("linked_post_id"),
  publishedAt: integer("published_at"),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("changelog_ws_slug_idx").on(t.workspaceId, t.slug),
  wsIdx: index("changelog_ws_idx").on(t.workspaceId),
}));

/**
 * "You asked -> We shipped" notify records. One row per voter/commenter we
 * notified when a post shipped. Real data derived from real votes/comments;
 * status reflects whether email actually sent (graceful without an email provider).
 */
export const shipNotifications = sqliteTable("ship_notifications", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull(),
  changelogId: text("changelog_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  // This row is a work item, not just an audit log: enqueued as `pending`, drained
  // by a background drainer (after() + cron) into sent/failed with retries.
  status: text("status").notNull().default("pending"), // pending | sent | failed | suppressed
  subject: text("subject").notNull().default(""),
  body: text("body").notNull().default(""),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  sentAt: integer("sent_at"),
  createdAt: integer("created_at").notNull().default(now),
}, (t) => ({
  postIdx: index("ship_notif_post_idx").on(t.postId),
  statusIdx: index("ship_notif_status_idx").on(t.status),
}));

/** Webhook idempotency ledger: a Stripe event.id is processed at most once. */
export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(), // Stripe event.id
  type: text("type").notNull(),
  createdAt: integer("created_at").notNull().default(now),
});

/**
 * Emails that opted out (or hard-bounced/complained). The notification drainer
 * skips any recipient listed here, satisfying one-click unsubscribe + reputation.
 */
export const emailSuppressions = sqliteTable("email_suppressions", {
  email: text("email").primaryKey(),
  reason: text("reason").notNull().default("unsubscribe"), // unsubscribe | bounce | complaint
  createdAt: integer("created_at").notNull().default(now),
});

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ChangelogEntry = typeof changelogEntries.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type ShipNotification = typeof shipNotifications.$inferSelect;
