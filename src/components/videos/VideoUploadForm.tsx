
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type FormData = {
  video: FileList;
};

export default function VideoUploadForm() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setUploading(true);
      const file = data.video[0];
      const path = `${Date.now()}_${file.name}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      // Get URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from("videos")
        .getPublicUrl(path);

      if (urlError || !publicUrl) {
        throw new Error("Could not retrieve video URL");
      }

      // Insert record
      const { error: dbError } = await supabase.from("videos").insert({
        filename: file.name,
        url: publicUrl
      });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Video uploaded successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      reset();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-4">
        <input 
          type="file" 
          accept="video/*" 
          className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-sprout-purple/10 file:text-sprout-purple hover:file:bg-sprout-purple/20"
          {...register("video", { required: true })} 
        />
        <Button type="submit" disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
