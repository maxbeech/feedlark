import { describe, it, expect } from "vitest";
import { filterSortPosts, type FilterablePost } from "@/lib/board-filter";
import { parseInline } from "@/components/markdown";

const P = (over: Partial<FilterablePost>): FilterablePost => ({
  id: "x", title: "t", body: "", status: "open", voteCount: 0, pinned: false, createdAt: 0, ...over,
});

describe("filterSortPosts", () => {
  const posts = [
    P({ id: "a", title: "Dark mode", voteCount: 10, status: "open", createdAt: 1 }),
    P({ id: "b", title: "Slack integration", voteCount: 50, status: "planned", createdAt: 2 }),
    P({ id: "c", title: "CSV export", voteCount: 5, status: "complete", createdAt: 3 }),
    P({ id: "d", title: "Closed idea", voteCount: 99, status: "closed", createdAt: 4 }),
    P({ id: "e", title: "Pinned note", voteCount: 1, status: "open", pinned: true, createdAt: 0 }),
  ];

  it("excludes closed posts always", () => {
    expect(filterSortPosts(posts, {}).find((p) => p.id === "d")).toBeUndefined();
  });

  it("sorts by votes (top) with pinned first", () => {
    const top = filterSortPosts(posts, { sort: "top" });
    expect(top[0].id).toBe("e"); // pinned wins regardless of votes
    expect(top[1].id).toBe("b"); // then highest votes
  });

  it("sorts by newest", () => {
    const recent = filterSortPosts(posts, { sort: "new" });
    expect(recent[0].id).toBe("e"); // pinned still first
    expect(recent[1].id).toBe("c"); // newest non-pinned
  });

  it("filters by status", () => {
    const planned = filterSortPosts(posts, { status: "planned" });
    expect(planned.map((p) => p.id)).toEqual(["b"]);
  });

  it("searches title + body, case-insensitive", () => {
    expect(filterSortPosts(posts, { query: "csv" }).map((p) => p.id)).toEqual(["c"]);
    expect(filterSortPosts(posts, { query: "INTEGRATION" }).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("markdown parseInline", () => {
  it("parses bold", () => {
    expect(parseInline("a **b** c")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " c" },
    ]);
  });
  it("parses links and neutralises non-http/non-root hrefs (XSS-safe)", () => {
    expect(parseInline("[ok](https://x.test)")).toEqual([{ type: "link", value: "ok", href: "https://x.test" }]);
    // A javascript: URL must be rewritten to "#".
    expect(parseInline("[bad](javascript:alert(1))")[0]).toEqual({ type: "link", value: "bad", href: "#" });
  });
  it("plain text passes through", () => {
    expect(parseInline("just text")).toEqual([{ type: "text", value: "just text" }]);
  });
});
