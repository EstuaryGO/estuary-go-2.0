import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Send, Loader2 } from "lucide-react";

export default function QuickLogBox({ people }) {
  const { user } = useAuth();
  const [personId, setPersonId] = useState("");
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: () => {
      const person = people.find((p) => p.id === personId);
      return base44.entities.EstuaryJournalEntry.create({
        person_id: personId,
        person_name: person?.name || "",
        content: content.trim(),
        submitter_email: user?.email || "",
        submitter_name: user?.full_name || "",
      });
    },
    onSuccess: (_data, _vars) => {
      qc.invalidateQueries({ queryKey: ["journalEntries", personId] });
      qc.invalidateQueries({ queryKey: ["estuaryJournalAll"] });
      setContent("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!personId || !content.trim() || addMutation.isPending) return;
    addMutation.mutate();
  };

  const hasPeople = people.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-bold text-foreground">Share a GO! Story</h2>
      <p className="text-xs text-muted-foreground -mt-1">
        God is at work in the ordinary moments of our lives. We'd love to hear what you're seeing.
      </p>
      <p className="text-xs text-muted-foreground">
        Share a story of what God has been doing, a conversation that encouraged you, or a step of obedience you've taken with someone Jesus has placed in your life.
      </p>

      {!hasPeople ? (
        <p className="text-sm text-muted-foreground py-3 text-center">
          Add someone to your Estuary first to share your story.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select a person…</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="text-xs font-semibold text-foreground">What has God been doing?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about a moment, conversation, prayer, or step you've taken recently."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!personId || !content.trim() || addMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Share Your Story
            </button>
          </div>
        </form>
      )}
    </div>
  );
}