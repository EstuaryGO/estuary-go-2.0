import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Heart, Footprints, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import PrayerReflection from "@/components/estuary/PrayerReflection";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function PrayImpactInvite() {
  const navigate = useNavigate();
  const [prayOpen, setPrayOpen] = useState(false);
  const today = todayStr();

  const { data: people = [], refetch } = useQuery({
    queryKey: ["estuaryPeople", "pray"],
    queryFn: () => base44.entities.EstuaryPerson.list("-created_date"),
  });

  const { data: prayerLogs = [] } = useQuery({
    queryKey: ["prayerLogsToday"],
    queryFn: () => base44.entities.PrayerLog.list("-created_date"),
  });

  const { data: journal = [] } = useQuery({
    queryKey: ["estuaryJournalAll"],
    queryFn: () => base44.entities.EstuaryJournalEntry.list("-created_date", 200),
  });

  const handleRefresh = async () => {
    await refetch();
  };
  const { isRefreshing, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh });

  const prayedTodayCount = useMemo(() => {
    const ids = new Set(prayerLogs.filter((l) => l.date === today).map((l) => l.person_id));
    return people.filter((p) => ids.has(p.id)).length;
  }, [prayerLogs, people, today]);

  return (
    <>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h1 className="text-xl font-bold text-foreground">Pray. Impact. Invite.</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your daily missional rhythm — pray for your Estuary, take steps of impact, and invite others in.
          </p>
        </div>

        {/* Pray pillar */}
        <PillarCard
          icon={Heart}
          title="Pray"
          stat={`${prayedTodayCount} of ${people.length}`}
          statLabel="in your Estuary prayed for today"
          actionLabel="Pray now"
          actionOpen={prayOpen}
          onAction={() => setPrayOpen((o) => !o)}
        >
          {prayOpen && (
            <div className="space-y-3 pt-1">
              {people.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Your Estuary is empty. Add someone to pray for.
                </p>
              ) : (
                people.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate flex-1">{p.name}</p>
                    </div>
                    <PrayerReflection person={p} />
                  </div>
                ))
              )}
            </div>
          )}
        </PillarCard>

        {/* Impact pillar */}
        <PillarCard
          icon={Footprints}
          title="Impact"
          stat={`${journal.length}`}
          statLabel="steps taken toward your Estuary"
          actionLabel="Log a step"
          onAction={() => navigate("/my-estuary")}
        />

        {/* Invite pillar */}
        <PillarCard
          icon={UserPlus}
          title="Invite"
          stat={`${people.length}`}
          statLabel={people.length === 1 ? "person in your Estuary" : "people in your Estuary"}
          actionLabel="Add a person"
          onAction={() => navigate("/my-estuary")}
        />
      </div>
    </>
  );
}

function PillarCard({ icon: Icon, title, stat, statLabel, actionLabel, onAction, actionOpen, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stat}</span> {statLabel}
          </p>
        </div>
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors shrink-0"
        >
          {actionOpen !== undefined ? (
            actionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          ) : null}
          {actionLabel}
        </button>
      </div>
      {children && <div className="px-5 pb-4 pt-1 border-t border-border">{children}</div>}
    </div>
  );
}