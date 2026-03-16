"use client";

interface VideoSectionProps {
  videos: { type: string; url: string }[];
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

export default function VideoSection({ videos }: VideoSectionProps) {
  if (videos.length === 0) return null;

  return (
    <div className="space-y-6">
      {videos.map((video, index) => {
        if (video.type === "youtube") {
          const videoId = getYouTubeId(video.url);
          if (!videoId) return null;

          return (
            <div
              key={index}
              className="aspect-video rounded-2xl overflow-hidden bg-secondary shadow-sm"
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={`Video ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          );
        }

        if (video.type === "local") {
          return (
            <div key={index} className="rounded-2xl overflow-hidden shadow-sm">
              <video
                controls
                preload="metadata"
                className="w-full rounded-2xl"
              >
                <source src={video.url} />
              </video>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
