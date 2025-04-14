
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import EmotionTrackingSlider from "@/components/EmotionTrackingSlider";
import { Loader2 } from "lucide-react";

type JournalEntryFormProps = {
  onSubmit: (data: any) => Promise<any>;
  loading: boolean;
  selectedPrompt?: string;
};

export const JournalEntryForm = ({ 
  onSubmit, 
  loading, 
  selectedPrompt = "" 
}: JournalEntryFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      wentWell: "",
      wentBadly: "",
      gratitude: "",
      challenge: "",
      tomorrowPlan: "",
      mood: 5,
      water: 4,
      sleep: 7,
      exercise: 3,
      mindfulness: 5,
      kindness: 5,
      positivity: 6,
      confidence: 5,
    }
  });

  // If there's a selected prompt, set initial focus to the relevant field
  useEffect(() => {
    if (selectedPrompt) {
      // For simplicity, we'll add the prompt to the "What went well" field
      // You could enhance this with more sophisticated prompt-to-field mapping
      setValue("wentWell", selectedPrompt + "\n\nMy thoughts: ");
    }
  }, [selectedPrompt, setValue]);

  const mood = watch("mood");
  const sleep = watch("sleep");
  const water = watch("water");
  const exercise = watch("exercise");
  const mindfulness = watch("mindfulness");
  const kindness = watch("kindness");
  const positivity = watch("positivity");
  const confidence = watch("confidence");

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="mood">Today's Overall Mood</Label>
              <EmotionTrackingSlider 
                value={mood} 
                onChange={(value) => setValue("mood", value)} 
                min={1} 
                max={10}
                lowLabel="Not Great"
                highLabel="Excellent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleep">Hours of Sleep</Label>
                <EmotionTrackingSlider 
                  value={sleep} 
                  onChange={(value) => setValue("sleep", value)} 
                  min={0} 
                  max={12}
                  lowLabel="0 hrs"
                  highLabel="12+ hrs"
                  step={0.5}
                />
              </div>

              <div>
                <Label htmlFor="water">Water Intake</Label>
                <EmotionTrackingSlider 
                  value={water} 
                  onChange={(value) => setValue("water", value)} 
                  min={0} 
                  max={8}
                  lowLabel="None"
                  highLabel="8+ cups"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exercise">Exercise Today</Label>
                <EmotionTrackingSlider 
                  value={exercise} 
                  onChange={(value) => setValue("exercise", value)} 
                  min={0} 
                  max={7}
                  lowLabel="None"
                  highLabel="Lots"
                />
              </div>

              <div>
                <Label htmlFor="mindfulness">Mindfulness Practice</Label>
                <EmotionTrackingSlider 
                  value={mindfulness} 
                  onChange={(value) => setValue("mindfulness", value)} 
                  min={0} 
                  max={10}
                  lowLabel="None"
                  highLabel="Lots"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kindness">Acts of Kindness</Label>
                <EmotionTrackingSlider 
                  value={kindness} 
                  onChange={(value) => setValue("kindness", value)} 
                  min={0} 
                  max={10}
                  lowLabel="None"
                  highLabel="Many"
                />
              </div>

              <div>
                <Label htmlFor="positivity">Positive Thoughts</Label>
                <EmotionTrackingSlider 
                  value={positivity} 
                  onChange={(value) => setValue("positivity", value)} 
                  min={0} 
                  max={10}
                  lowLabel="Few"
                  highLabel="Many"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confidence">Confidence Level</Label>
              <EmotionTrackingSlider 
                value={confidence} 
                onChange={(value) => setValue("confidence", value)} 
                min={0} 
                max={10}
                lowLabel="Low"
                highLabel="High"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label htmlFor="wentWell" className="text-base font-semibold">
            What went well today?
          </Label>
          <Textarea
            id="wentWell"
            placeholder="Share positive experiences or achievements from today..."
            className="h-24 mt-2"
            {...register("wentWell", { required: "Please share something that went well today" })}
          />
          {errors.wentWell && (
            <p className="text-red-500 text-sm mt-1">{errors.wentWell.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="wentBadly" className="text-base font-semibold">
            What was challenging today?
          </Label>
          <Textarea
            id="wentBadly"
            placeholder="What difficulties or challenges did you face today?"
            className="h-24 mt-2"
            {...register("wentBadly")}
          />
        </div>

        <div>
          <Label htmlFor="gratitude" className="text-base font-semibold">
            What are you grateful for today?
          </Label>
          <Textarea
            id="gratitude"
            placeholder="List things you're thankful for..."
            className="h-24 mt-2"
            {...register("gratitude", { required: "Please share something you're grateful for" })}
          />
          {errors.gratitude && (
            <p className="text-red-500 text-sm mt-1">{errors.gratitude.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="challenge" className="text-base font-semibold">
            What's one challenge you want to overcome?
          </Label>
          <Textarea
            id="challenge"
            placeholder="Share a challenge you're facing or want to tackle..."
            className="h-24 mt-2"
            {...register("challenge")}
          />
        </div>

        <div>
          <Label htmlFor="tomorrowPlan" className="text-base font-semibold">
            What are you looking forward to tomorrow?
          </Label>
          <Textarea
            id="tomorrowPlan"
            placeholder="Share your plans or hopes for tomorrow..."
            className="h-24 mt-2"
            {...register("tomorrowPlan", { required: "Please share something for tomorrow" })}
          />
          {errors.tomorrowPlan && (
            <p className="text-red-500 text-sm mt-1">{errors.tomorrowPlan.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Journal Entry"
          )}
        </Button>
      </div>
    </form>
  );
};
