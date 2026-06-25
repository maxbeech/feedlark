import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  bigint,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Timestamps are stored as Unix epoch SECONDS (bigint) to keep the whole app's
// date handling identical to the previous SQLite schema (plain numbers, never
// Date objects). Default = now() in epoch seconds.
const now = sql`(extract(epoch from now()))::bigint`;
const epoch = (name: string) => bigint(name, { mode: "number" });

/** Admin accounts (workspace owners / team members). */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  // New signups start unverified and must confirm their email before logging in.
  emailVerified: boolean("email_verified").notNull().default(false),
  // Bumped on password reset / "log out everywhere"; embedded in every session
  // JWT so older tokens stop validating (stateless session revocation).
  sessionEpoch: integer("session_epoch").notNull().default(0),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

/** A customer's Feedlark space. Plan gates premium features. */
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  plan: text("plan").notNull().default("free"), // free | pro
  brandingRemoved: boolean("branding_removed").notNull().default(false),
  customDomain: text("custom_domain"),
  aiEnabled: boolean("ai_enabled").notNull().default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  accentColor: text("accent_color").notNull().default("#f97316"),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  slugIdx: uniqueIndex("workspaces_slug_idx").on(t.slug),
  ownerIdx: index("workspaces_owner_idx").on(t.ownerId),
  customDomainIdx: uniqueIndex("workspaces_custom_domain_idx").on(t.customDomain),
}));

/** Team seats (the billable unit — never per voter). */
export const workspaceMembers = pgTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("admin"), // owner | admin
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("members_ws_user_idx").on(t.workspaceId, t.userId),
}));

/** Pending team invitations (a teammate accepts via a tokenised link). */
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"), // admin (owner is never invited)
  token: text("token").notNull(),
  invitedByUserId: text("invited_by_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: epoch("created_at").notNull().default(now),
  expiresAt: epoch("expires_at").notNull(),
}, (t) => ({
  tokenIdx: uniqueIndex("invitations_token_idx").on(t.token),
  wsEmailIdx: uniqueIndex("invitations_ws_email_idx").on(t.workspaceId, t.email),
}));

/** A feedback board within a workspace (unlimited on every plan). */
export const boards = pgTable("boards", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  isPrivate: boolean("is_private").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: epoch("created_at").notNull().default(now),
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
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  status: text("status").notNull().default("open"),
  authorName: text("author_name").notNull().default("Anonymous"),
  authorEmail: text("author_email"),
  pinned: boolean("pinned").notNull().default(false),
  voteCount: integer("vote_count").notNull().default(0),
  shippedChangelogId: text("shipped_changelog_id"),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  boardIdx: index("posts_board_idx").on(t.boardId),
  wsStatusIdx: index("posts_ws_status_idx").on(t.workspaceId, t.status),
}));

/** One vote per voter per post. Voter is anonymous (cookie id), email optional. */
export const votes = pgTable("votes", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  voterKey: text("voter_key").notNull(), // anon cookie id or email
  voterEmail: text("voter_email"),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("votes_post_voter_idx").on(t.postId, t.voterKey),
  postIdx: index("votes_post_idx").on(t.postId),
}));

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorName: text("author_name").notNull().default("Anonymous"),
  authorEmail: text("author_email"),
  isAdmin: boolean("is_admin").notNull().default(false),
  // Internal team notes (Pro): visible only in the dashboard, never on public pages.
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  postIdx: index("comments_post_idx").on(t.postId),
}));

export const changelogEntries = pgTable("changelog_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  body: text("body").notNull().default(""),
  category: text("category").notNull().default("new"), // new | improved | fixed
  linkedPostId: text("linked_post_id"),
  publishedAt: epoch("published_at"),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  uniq: uniqueIndex("changelog_ws_slug_idx").on(t.workspaceId, t.slug),
  wsIdx: index("changelog_ws_idx").on(t.workspaceId),
}));

/**
 * "You asked -> We shipped" notify queue. One row per voter/commenter to notify
 * when a post ships; drained in the background into sent/failed with retries.
 */
export const shipNotifications = pgTable("ship_notifications", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  postId: text("post_id").notNull(),
  changelogId: text("changelog_id").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  status: text("status").notNull().default("pending"), // pending | sent | failed | suppressed
  subject: text("subject").notNull().default(""),
  body: text("body").notNull().default(""),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  sentAt: epoch("sent_at"),
  createdAt: epoch("created_at").notNull().default(now),
}, (t) => ({
  postIdx: index("ship_notif_post_idx").on(t.postId),
  statusIdx: index("ship_notif_status_idx").on(t.status),
}));

/** Webhook idempotency ledger: a Stripe event.id is processed at most once. */
export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(), // Stripe event.id
  type: text("type").notNull(),
  createdAt: epoch("created_at").notNull().default(now),
});

/**
 * Emails that opted out (or hard-bounced/complained). The notification drainer
 * skips any recipient listed here, satisfying one-click unsubscribe + reputation.
 */
export const emailSuppressions = pgTable("email_suppressions", {
  email: text("email").primaryKey(),
  reason: text("reason").notNull().default("unsubscribe"), // unsubscribe | bounce | complaint
  createdAt: epoch("created_at").notNull().default(now),
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
