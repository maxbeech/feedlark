import { revalidatePath } from "next/cache";

/**
 * Single source of truth for invalidating a workspace's public, ISR-cached
 * surfaces. Call from any server action / route handler that changes data those
 * pages read (posts, votes, statuses, changelog). Pass the board slug too when a
 * specific board listing is affected.
 */
export function revalidatePublicWorkspace(slug: string, boardSlug?: string) {
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/b/${slug}/roadmap`);
  revalidatePath(`/b/${slug}/changelog`);
  if (boardSlug) revalidatePath(`/b/${slug}/${boardSlug}`);
}
