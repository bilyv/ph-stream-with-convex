import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AdminPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.videos.generateUploadUrl);
  const uploadVideo = useMutation(api.videos.uploadVideo);
  const deleteVideo = useMutation(api.videos.deleteVideo);
  const videos = useQuery(api.videos.listVideos) || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedFile) {
      toast.error("Please fill in all fields and select a video file");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }

      const { storageId } = json;

      // Step 3: Save video metadata to database
      await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        storageId,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      await deleteVideo({ videoId: videoId as any });
      toast.success("Video deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-900 rounded-lg p-6 border border-red-800">
        <h2 className="text-2xl font-bold text-white mb-6">Upload New Video</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-red-200 mb-2">
              Video Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
              placeholder="Enter video title..."
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-red-200 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-black border border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors resize-none"
              placeholder="Enter video description..."
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-red-200 mb-2">
              Video File
            </label>
            <input
              type="file"
              id="video"
              ref={fileInputRef}
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 rounded-lg bg-black border border-red-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700 transition-colors"
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-red-200">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading || !title.trim() || !description.trim() || !selectedFile}
            className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border border-red-800">
        <h2 className="text-2xl font-bold text-white mb-6">Uploaded Videos</h2>
        
        {videos.length === 0 ? (
          <p className="text-red-200 text-center py-8">No videos uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video._id} className="bg-black rounded-lg p-4 border border-red-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                    <p className="text-red-200 mb-2">{video.description}</p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Uploaded by: {video.uploaderName}</p>
                      <p>Date: {new Date(video.uploadedAt).toLocaleDateString()}</p>
                      {video.fileSize && <p>Size: {formatFileSize(video.fileSize)}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
