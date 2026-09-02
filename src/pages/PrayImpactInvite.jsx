import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Heart, HandHeart, UserPlus, ChevronDown, ChevronUp, Play, CheckCircle2 } from "lucide-react";
import CollectivePrayerButton from "@/components/estuary/CollectivePrayerButton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import PullToRefreshIndicator from "@/components/PullToRefreshIndicator";

const PILLAR_VIDEOS = {
  pray: {
    vimeoId: "1223092130",
    thumbnail:
      "https://i.vimeocdn.com/video/2196287359-7c3c29e67425965de1131539799e17232f73da17af23a1d08479e88d494b8a53-d_1920x1080?region=us",
  },
  love: {
    vimeoId: "1223094407",
    thumbnail:
      "https://i.vimeocdn.com/video/2196287211-6129827a0142a0385ef88a9dfb9ce78c7105582169684eaca1d58c13b591d79f-d_1920x1080?region=us",
  },
  invite: {
    comingSoon: true,
    thumbnail:
      "https://media.base44.com/images/public/6a971a771aed88257dedcb9e/45e93a1d3_comingsoon.jpg",
  },
};

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

  const prayedTodayIds = useMemo(
    () => new Set(prayerLogs.filter((l) => l.date === today).map((l) => l.person_id)),
    [prayerLogs, today]
  );
  const prayedTodayCount = people.filter((p) => prayedTodayIds.has(p.id)).length;

  return (
    <>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h1 className="text-xl font-bold text-foreground">Pray. Love. Invite.</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your daily missional rhythm — pray for your Estuary, love your neighbors, and invite others in.
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
          video={PILLAR_VIDEOS.pray}
        >
          {prayOpen && (
            <div className="space-y-3 pt-1">
              {people.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {people.map((p) => {
                    const prayed = prayedTodayIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 ${
                          prayed
                            ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30"
                            : "border-border bg-background"
                        }`}
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-semibold text-primary">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{p.name}</span>
                        {prayed && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
              <CollectivePrayerButton people={people} prayedIds={prayedTodayIds} />
            </div>
          )}
        </PillarCard>

        {/* Impact pillar */}
        <PillarCard
          icon={HandHeart}
          title="Love"
          stat={`${journal.length}`}
          statLabel="steps of love toward your Estuary"
          actionLabel="Log a step"
          onAction={() => navigate("/my-estuary")}
          video={PILLAR_VIDEOS.love}
        />

        {/* Invite pillar */}
        <PillarCard
          icon={UserPlus}
          title="Invite"
          stat={`${people.length}`}
          statLabel={people.length === 1 ? "person in your Estuary" : "people in your Estuary"}
          actionLabel="Add a person"
          onAction={() => navigate("/my-estuary")}
          video={PILLAR_VIDEOS.invite}
        />
      </div>
    </>
  );
}

function PillarVideo({ video }) {
  const [playing, setPlaying] = useState(false);

  if (!video) return null;

  if (video.commingSoon) {
    return (
      <div className="relative w-full aspect-video bg-black">
        <img src={video.thumbnail} alt="Coming soon" className="w-full h-full object-cover opacity-90" />
        <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">
          Coming soon
        </div>
      </div>
    );
  }

  if (playing) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${video.vimeoId}?autoplay=1&playsinline=1&muted=0&autopause=0`}
        className="w-full aspect-video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        playsInline
        title="Pillar video"
      />
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="relative w-full aspect-video bg-black block group"
    >
      {video.thumbnail ? (
        <img src={video.thumbnail} alt={video.title || "Video"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
      <div className="absolute top-3 left-3">
        <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Play className="h-5 w-5 text-black ml-0.5" fill="currentColor" />
        </div>
      </div>
    </button>
  );
}

function PillarCard({ icon: Icon, title, stat, statLabel, actionLabel, onAction, actionOpen, children, video }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {video && <PillarVideo video={video} />}
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