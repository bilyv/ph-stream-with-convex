import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { VideoPlayer } from "./VideoPlayer";
import { useState } from "react";

export function VideoGallery() {
  const videos = useQuery(api.videos.listVideos) || [];
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  if (selectedVideo) {
    const video = videos.find(v => v._id === selectedVideo);
    if (video) {
      return (
        <VideoPlayer
          video={video}
          onBack={() => setSelectedVideo(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Video Gallery</h2>
        <p className="text-red-200">Discover and watch premium video content</p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Videos Available</h3>
          <p className="text-red-200">Check back later for new content!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-red-800 hover:border-red-600 transition-colors cursor-pointer group"
              onClick={() => setSelectedVideo(video._id)}
            >
              <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                {video.url ? (
                  <video
                    src={video.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    preload="metadata"
                  />
                ) : (
                  <div className="text-red-400 text-4xl">🎬</div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-red-200 text-sm mb-3 line-clamp-3">
                  {video.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{video.uploaderName}</span>
                  <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                </div>
                {video.fileSize && (
                  <div className="mt-2 text-xs text-gray-500">
                    {formatFileSize(video.fileSize)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
