import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const authError =
      url.searchParams.get("error_description") ??
      new URLSearchParams(url.hash.slice(1)).get("error_description");
    if (authError) setRecoveryError(authError.replace(/\+/g, " "));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setHasSession(Boolean(session));
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setRecoveryError(error.message);
      setHasSession(Boolean(data.session));
      setChecking(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");
    if (password.length < 6) {
      toast.error("Choose a password with at least 6 characters");
      return;
    }
    if (password !== confirmation) {
      toast.error("The passwords do not match");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setCompleted(true);
      toast.success("Your password has been updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your password");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <main className="grid min-h-[80vh] place-items-center bg-sand px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-panel">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-extrabold text-navy">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Set a new password for your VENUES LOCATION account.
        </p>

        {checking ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            Verifying your reset link...
          </p>
        ) : recoveryError ? (
          <div role="alert" className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {recoveryError}
          </div>
        ) : completed ? (
          <div className="mt-6 rounded-md border border-border bg-secondary p-4 text-sm text-navy">
            Your password has been changed. You can now sign in with your new password.
          </div>
        ) : hasSession ? (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-3">
            <label htmlFor="new-password" className="sr-only">
              New password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              required
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              placeholder="New password (at least 6 characters)"
              className={field}
            />
            <label htmlFor="confirm-password" className="sr-only">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-navy px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground disabled:opacity-60"
            >
              {busy ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-md border border-border bg-secondary p-4 text-sm text-navy">
            This reset link is invalid or has expired. Request a new link to continue.
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {completed ? (
            <button
              type="button"
              onClick={() => void navigate({ to: "/auth" })}
              className="font-bold text-gold hover:underline"
            >
              Go to sign in
            </button>
          ) : (
            <Link to="/forgot-password" className="font-bold text-gold hover:underline">
              Request another reset link
            </Link>
          )}
        </p>
      </section>
    </main>
  );
}
