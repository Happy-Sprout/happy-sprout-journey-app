
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import EmotionTrackingSlider from "@/components/EmotionTrackingSlider";
import SpeechInput from "@/components/SpeechInput";
import { Loader2 } from "lucide-react";

type JournalEntryFormProps = {
  onSubmit: (data: any) => Promise<any>;
  loading: boolean;
  selectedPrompt?: string;
};

// SEL area to form field mapping
const selFieldMap: Record<string, keyof JournalFormValues> = {
  "Self-Awareness": "wentWell",
  "Self-Management": "challenge",
  "Social Awareness": "gratitude", 
  "Relationship Skills": "wentBadly",
  "Responsible Decision-Making": "tomorrowPlan"
};

type JournalFormValues = {
  wentWell: string;
  wentBadly: string;
  gratitude: string;
  challenge: string;
  tomorrowPlan: string;
  mood: number;
  water: number;
  sleep: number;
  exercise: number;
  mindfulness: number;
  kindness: number;
  positivity: number;
  confidence: number;
};

export const JournalEntryForm = ({ 
  onSubmit, 
  loading, 
  selectedPrompt = "" 
}: JournalEntryFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm<JournalFormValues>({
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
      // Find appropriate field based on prompt content or mapping
      // Default to "wentWell" if no specific mapping exists
      const targetField = "wentWell";
      const currentValue = getValues(targetField);
      const promptText = `${selectedPrompt}\n\nMy thoughts: `;
      
      // Only update if the field is empty or doesn't already contain the prompt
      if (!currentValue.includes(promptText)) {
        setValue(targetField, promptText);
      }
    }
  }, [selectedPrompt, setValue, getValues]);

  // Create handlers for speech input for each field
  const handleSpeechInput = (field: keyof JournalFormValues) => (text: string) => {
    const currentValue = getValues(field);
    setValue(field, currentValue ? `${currentValue} ${text}` : text);
  };

  const mood = watch("mood");
  const sleep = watch("sleep");
  const water = watch("water");
  const exercise = watch("exercise");
  const mindfulness = watch("mindfulness");
  const kindness = watch("kindness");
  const positivity = watch("positivity");
  const confidence = watch("confidence");

  const handleFormSubmit = async (data: JournalFormValues) => {
    try {
      // Include any additional data needed for the payload
      const payload = {
        ...data,
        promptUsed: selectedPrompt || null
      };
      await onSubmit(payload);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4">Daily Wellness Trackers</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="mood">Today's Overall Mood</Label>
                <EmotionTrackingSlider 
                  value={mood} 
                  onChange={(value) => setValue("mood", value)} 
                  min={1} 
                  max={10}
                  leftLabel="Not Great"
                  rightLabel="Excellent"
                  label="Mood"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sleep">Hours of Sleep</Label>
                  <EmotionTrackingSlider 
                    value={sleep} 
                    onChange={(value) => setValue("sleep", value)} 
                    min={0} 
                    max={12}
                    leftLabel="0 hrs"
                    rightLabel="12+ hrs"
                    step={0.5}
                    label="Sleep"
                  />
                </div>

                <div>
                  <Label htmlFor="water">Water Intake</Label>
                  <EmotionTrackingSlider 
                    value={water} 
                    onChange={(value) => setValue("water", value)} 
                    min={0} 
                    max={8}
                    leftLabel="None"
                    rightLabel="8+ cups"
                    label="Water"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="exercise">Exercise Today</Label>
                  <EmotionTrackingSlider 
                    value={exercise} 
                    onChange={(value) => setValue("exercise", value)} 
                    min={0} 
                    max={7}
                    leftLabel="None"
                    rightLabel="Lots"
                    label="Exercise"
                  />
                </div>

                <div>
                  <Label htmlFor="mindfulness">Mindfulness Practice</Label>
                  <EmotionTrackingSlider 
                    value={mindfulness} 
                    onChange={(value) => setValue("mindfulness", value)} 
                    min={0} 
                    max={10}
                    leftLabel="None"
                    rightLabel="Lots"
                    label="Mindfulness"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="kindness">Acts of Kindness</Label>
                  <EmotionTrackingSlider 
                    value={kindness} 
                    onChange={(value) => setValue("kindness", value)} 
                    min={0} 
                    max={10}
                    leftLabel="None"
                    rightLabel="Many"
                    label="Kindness"
                  />
                </div>

                <div>
                  <Label htmlFor="positivity">Positive Thoughts</Label>
                  <EmotionTrackingSlider 
                    value={positivity} 
                    onChange={(value) => setValue("positivity", value)} 
                    min={0} 
                    max={10}
                    leftLabel="Few"
                    rightLabel="Many"
                    label="Positivity"
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
                  leftLabel="Low"
                  rightLabel="High"
                  label="Confidence"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Journal Reflection</h3>
        <div className="space-y-6">
          <div className="relative">
            <Label htmlFor="wentWell" className="text-base font-semibold">
              What went well today?
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="wentWell"
                placeholder="Share positive experiences or achievements from today..."
                className="h-24 pr-10"
                {...register("wentWell", { required: "Please share something that went well today" })}
              />
              <SpeechInput 
                onTranscript={(text) => handleSpeechInput("wentWell")(text)} 
              />
            </div>
            {errors.wentWell && (
              <p className="text-red-500 text-sm mt-1">{errors.wentWell.message}</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="wentBadly" className="text-base font-semibold">
              What was challenging today?
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="wentBadly"
                placeholder="What difficulties or challenges did you face today?"
                className="h-24 pr-10"
                {...register("wentBadly")}
              />
              <SpeechInput 
                onTranscript={(text) => handleSpeechInput("wentBadly")(text)} 
              />
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="gratitude" className="text-base font-semibold">
              What are you grateful for today?
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="gratitude"
                placeholder="List things you're thankful for..."
                className="h-24 pr-10"
                {...register("gratitude", { required: "Please share something you're grateful for" })}
              />
              <SpeechInput 
                onTranscript={(text) => handleSpeechInput("gratitude")(text)} 
              />
            </div>
            {errors.gratitude && (
              <p className="text-red-500 text-sm mt-1">{errors.gratitude.message}</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="challenge" className="text-base font-semibold">
              What's one challenge you want to overcome?
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="challenge"
                placeholder="Share a challenge you're facing or want to tackle..."
                className="h-24 pr-10"
                {...register("challenge")}
              />
              <SpeechInput 
                onTranscript={(text) => handleSpeechInput("challenge")(text)} 
              />
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="tomorrowPlan" className="text-base font-semibold">
              What are you looking forward to tomorrow?
            </Label>
            <div className="relative mt-2">
              <Textarea
                id="tomorrowPlan"
                placeholder="Share your plans or hopes for tomorrow..."
                className="h-24 pr-10"
                {...register("tomorrowPlan", { required: "Please share something for tomorrow" })}
              />
              <SpeechInput 
                onTranscript={(text) => handleSpeechInput("tomorrowPlan")(text)} 
              />
            </div>
            {errors.tomorrowPlan && (
              <p className="text-red-500 text-sm mt-1">{errors.tomorrowPlan.message}</p>
            )}
          </div>
        </div>
      </section>

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
