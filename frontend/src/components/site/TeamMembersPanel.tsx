import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addTeamMember, listTeamMembers, removeTeamMember, type TeamMember } from "@/lib/api";

export function TeamMembersPanel() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { members: rows } = await listTeamMembers();
      setMembers(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load team members");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    const value = email.trim();
    if (!value) return;
    setBusy(true);
    try {
      await addTeamMember(value);
      setEmail("");
      toast.success("Team access granted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not grant team access");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member: TeamMember) => {
    if (!window.confirm(`Remove team access for ${member.email || member.full_name}?`)) return;
    try {
      await removeTeamMember(member.id);
      toast.success("Team access removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove team access");
    }
  };

  return (
    <section
      id="admin-team-members"
      className="mt-8 scroll-mt-24 rounded-xl border border-border bg-card p-6 shadow-panel"
    >
      <h2 className="font-display text-xl font-extrabold text-navy">Team Member Access</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Team members can view the admin panel and add venue / film shooting location listings, but
        cannot approve, edit or delete anything. The person must sign up on the site first, then add
        their email here.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          placeholder="team.member@example.com"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={busy}
          className="rounded-md bg-gold px-4 py-2 text-sm font-bold text-gold-foreground disabled:opacity-60"
        >
          {busy ? "Adding..." : "Grant team access"}
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-150 text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t border-border">
                <td className="py-3 font-bold text-navy">{member.full_name || "—"}</td>
                <td>{member.email || "—"}</td>
                <td>{member.mobile || "—"}</td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => void remove(member)}
                    aria-label={`Remove team access for ${member.email || member.id}`}
                    title="Remove team access"
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-muted-foreground">
                  No team members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
