
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define explicit interface for video records
interface VideoRecord {
  id: string;
  filename: string;
  url: string;
  created_at: string;
}

export default function VideoList() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Use proper type casting with Supabase query
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          setVideos([]);
        } else {
          setVideos(data as VideoRecord[] || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><LoadingSpinner size={32} /></div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No videos uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <video src={video.url} controls className="w-full h-auto" />
          <div className="p-3">
            <p className="text-sm text-gray-700 truncate" title={video.filename}>
              {video.filename}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(video.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
