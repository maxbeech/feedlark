import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth-form";
import { AcceptInvite } from "@/components/accept-invite";
import { signupAction, logoutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = (await db.select().from(schema.invitations).where(eq(schema.invitations.token, token)).limit(1))[0];
  const ws = inv ? (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, inv.workspaceId)).limit(1))[0] : null;
  const valid = inv && ws && inv.expiresAt >= Math.floor(Date.now() / 1000);
  const user = await getCurrentUser();
  const emailMatches = valid && user && user.email.toLowerCase() === inv!.email.toLowerCase();

  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 glow-brand" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-sand-200 bg-white/90 p-7 shadow-lift backdrop-blur-sm">
          {!valid ? (
            <div className="text-center">
              <h1 className="font-display text-xl font-semibold tracking-tightest text-ink">Invite not found</h1>
              <p className="mt-2 text-sm text-ink-muted">This invite link is invalid or has expired.</p>
              <Link href="/" className="mt-4 inline-block text-sm font-medium text-brand-600">Go to Feedlark</Link>
            </div>
          ) : emailMatches ? (
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Join {ws!.name}</h1>
              <p className="mb-5 mt-1 text-sm text-ink-muted">You&apos;ve been invited to help manage {ws!.name}&apos;s feedback.</p>
              <AcceptInvite token={token} workspaceName={ws!.name} />
            </div>
          ) : user ? (
            <div className="text-center">
              <h1 className="font-display text-xl font-semibold tracking-tightest text-ink">Wrong account</h1>
              <p className="mt-2 text-sm text-ink-muted">This invite is for <span className="font-medium text-ink">{inv!.email}</span>, but you&apos;re logged in as {user.email}.</p>
              <form action={logoutAction} className="mt-4">
                <button className="text-sm font-medium text-brand-600">Log out and switch account</button>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Join {ws!.name}</h1>
              <p className="mb-5 mt-1 text-sm text-ink-muted">Create your account to manage feedback with the team.</p>
              <AuthForm mode="signup" action={signupAction} defaultEmail={inv!.email} hiddenFields={{ inviteToken: token }} joining />
              <p className="mt-4 text-center text-sm text-ink-muted">
                Already have an account? <Link href={`/login?next=/invite/${token}`} className="font-medium text-brand-600">Log in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
