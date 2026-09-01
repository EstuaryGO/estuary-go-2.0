import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoCard from "../components/VideoCard";
import VideoPlayerModal from "../components/VideoPlayerModal";

export default function GuideTraining() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos", "GO! Guide Training"],
    queryFn: () => base44.entities.Video.filter({ category: "GO! Guide Training" })
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card animate-pulse">
              <div className="aspect-video bg-muted rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No guide training videos yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onClick={setSelectedVideo} />
          ))}
        </div>
      )}

      <VideoPlayerModal video={selectedVideo} open={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
}