import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner Sign In | VENUES LOCATION" },
      {
        name: "description",
        content: "Sign in to the VENUES LOCATION owner dashboard to manage your venue, enquiries and subscription.",
      },
      { property: "og:title", content: "Owner Sign In | VENUES LOCATION" },
      { property: "og:description", content: "Manage your venue listing, leads and subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const mobile = String(form.get("mobile") ?? "").trim();
    const acceptedTerms = form.get("acceptTerms") === "on";

    if (!email || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters");
      return;
    }
    if (mode === "signup" && !acceptedTerms) {
      toast.error("Please accept the Terms & Conditions and Privacy Policy to continue");
      return;
    }

    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, mobile },
        },
      });
      setBusy(false);
      if (error) return void toast.error(error.message);
      if (!data.session) {
        setPendingConfirm(true);
        toast.success("Check your email to confirm your account");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return void toast.error(error.message);
    }
  };

  const googleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Google sign-in failed. Please try again.");
  };

  const field = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold";

  return (
    <div className="grid min-h-[80vh] place-items-center bg-sand px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-panel">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-extrabold text-navy">
          {mode === "signin" ? "Owner Sign In" : "Create your owner account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your venue listing, enquiries and subscription.
        </p>

        {pendingConfirm ? (
          <div className="mt-6 rounded-md border border-border bg-secondary p-4 text-sm text-navy">
            We've sent a confirmation link to your email. Click it to activate your account, then sign in.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <input name="fullName" placeholder="Full Name" className={field} maxLength={80} />
                <input name="mobile" placeholder="Mobile Number" className={field} maxLength={15} />
              </>
            )}
            <input name="email" type="email" placeholder="Email Address" className={field} maxLength={120} />
            <input name="password" type="password" placeholder="Password" className={field} maxLength={72} />
            {mode === "signup" && (
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  name="acceptTerms"
                  type="checkbox"
                  required
                  className="mt-0.5 size-4 shrink-0 accent-gold"
                />
                <span>
                  I have read and agree to the VenuesLocation{" "}
                  <Link to="/terms" target="_blank" className="font-bold text-navy hover:text-gold">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" target="_blank" className="font-bold text-navy hover:text-gold">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-navy px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide text-navy-foreground disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={googleSignIn}
          className="w-full rounded-md border border-border px-6 py-3 text-sm font-bold text-navy hover:bg-secondary"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New venue owner?" : "Already registered?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setPendingConfirm(false);
            }}
            className="font-bold text-gold"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
