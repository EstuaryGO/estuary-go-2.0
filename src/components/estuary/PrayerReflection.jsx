import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Heart, Send, CheckCircle2, Loader2 } from "lucide-react";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function PrayerReflection({ person }) {
  const [praying, setPraying] = useState(false);
  const [reflection, setReflection] = useState("");
  const qc = useQueryClient();
  const today = todayStr();

  const { data: logs = [] } = useQuery({
    queryKey: ["prayerLogs", person.id],
    queryFn: () => base44.entities.PrayerLog.filter({ person_id: person.id }, "-created_date"),
  });

  const todayLog = logs.find((l) => l.date === today);

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.PrayerLog.create({
        person_id: person.id,
        person_name: person.name,
        reflection: reflection.trim() || undefined,
        date: today,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prayerLogs", person.id] });
      qc.invalidateQueries({ queryKey: ["prayerLogsToday"] });
      setReflection("");
      setPraying(false);
    },
  });

  if (todayLog) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 px-3 py-2.5">
        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400">Prayed for {person.name} today</p>
          {todayLog.reflection && (
            <p className="text-xs text-foreground/80 mt-1 whitespace-pre-wrap">{todayLog.reflection}</p>
          )}
        </div>
      </div>
    );
  }

  if (praying) {
    return (
      <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-3">
        <p className="text-xs font-semibold text-foreground">What is the Lord telling you during prayer?</p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your reflection (optional)…"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setPraying(false);
              setReflection("");
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 hover:bg-primary/90"
          >
            {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPraying(true)}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
    >
      <Heart className="h-4 w-4 fill-primary" />
      I prayed for {person.name}
    </button>
  );
}