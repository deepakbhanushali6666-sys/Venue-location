import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password | VENUES LOCATION" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("If an account exists for that email, a password reset link is on its way.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send password reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-[80vh] place-items-center bg-sand px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-panel">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-extrabold text-navy">Forgot password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email and we’ll send you a link to choose a new password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md border border-border bg-secondary p-4 text-sm text-navy">
            If an account exists for <strong>{email.trim()}</strong>, you’ll receive a password
            reset link. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-3">
            <label htmlFor="recovery-email" className="sr-only">
              Email address
            </label>
            <input
              id="recovery-email"
              type="email"
              required
              maxLength={120}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-navy px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/auth" className="font-bold text-gold hover:underline">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
