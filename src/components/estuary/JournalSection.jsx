import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";
import { Notebook, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function JournalSection({ personId, personName }) {
  const { user } = useAuth();
  const [entry, setEntry] = useState("");
  const [expanded, setExpanded] = useState(true);
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: ["journalEntries", personId],
    queryFn: () => base44.entities.EstuaryJournalEntry.filter({ person_id: personId }, "-created_date"),
  });

  const addMutation = useMutation({
    mutationFn: (content) => base44.entities.EstuaryJournalEntry.create({
      person_id: personId,
      person_name: personName || "",
      content,
      submitter_email: user?.email || "",
      submitter_name: user?.full_name || "",
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journalEntries", personId] });
      setEntry("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EstuaryJournalEntry.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journalEntries", personId] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entry.trim()) return;
    addMutation.mutate(entry.trim());
  };

  return (
    <div className="space-y-3">
      {/* New entry input */}
      <form id="tour-journal" onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Record a step you've taken toward this person..."
          rows={2}
          className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
        <button
          type="submit"
          disabled={addMutation.isPending || !entry.trim()}
          className="self-end flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Previous entries toggle */}
      {entries.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <Notebook className="h-3.5 w-3.5" />
            {entries.length} previous {entries.length === 1 ? "entry" : "entries"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <div className="space-y-2">
              {entries.map((e) => (
                <div key={e.id} className="group flex gap-2 bg-secondary/40 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{e.content}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {format(new Date(e.created_date), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(e.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 self-start"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}