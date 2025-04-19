
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VideoUploadForm from "./VideoUploadForm";
import VideoList from "./VideoList";

export default function VideosSection() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Videos</CardTitle>
        <CardDescription>Upload and manage your videos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <VideoUploadForm />
        <VideoList />
      </CardContent>
    </Card>
  );
}
