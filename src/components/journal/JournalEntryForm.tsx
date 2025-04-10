
import { useState, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { JournalEntry } from "@/types/journal";
import { Droplet, Clock, HeartPulse, Mic, MicOff, Save, Loader2 } from "lucide-react";
import { warningToast } from "@/components/ui/toast-extensions";
import { useToast } from "@/hooks/use-toast";

type JournalEntryFormProps = {
  onSubmit: (entry: Omit<JournalEntry, "id" | "childId" | "date" | "completed">) => Promise<JournalEntry | null>;
  loading: boolean;
};

export const JournalEntryForm = ({ onSubmit, loading }: JournalEntryFormProps) => {
  const { toast } = useToast();
  const [mood, setMood] = useState(5);
  const [water, setWater] = useState(4);
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(3);
  const [mindfulness, setMindfulness] = useState(5);
  const [kindness, setKindness] = useState(5);
  const [positivity, setPositivity] = useState(6);
  const [confidence, setConfidence] = useState(5);
  
  const [wentWell, setWentWell] = useState("");
  const [wentBadly, setWentBadly] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [challenge, setChallenge] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  
  const [activeRecordingField, setActiveRecordingField] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const resetForm = () => {
    setMood(5);
    setWater(4);
    setSleep(7);
    setExercise(3);
    setMindfulness(5);
    setKindness(5);
    setPositivity(6);
    setConfidence(5);
    setWentWell("");
    setWentBadly("");
    setGratitude("");
    setChallenge("");
    setTomorrowPlan("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = {
      mood,
      water,
      sleep,
      exercise,
      mindfulness,
      kindness,
      positivity,
      confidence,
      wentWell,
      wentBadly,
      gratitude,
      challenge,
      tomorrowPlan,
    };
    
    const result = await onSubmit(entry);
    if (result) {
      resetForm();
    }
  };
  
  const startSpeechRecognition = (field: string) => {
    if (isListening) {
      stopSpeechRecognition();
      return;
    }
    
    setIsInitializing(true);
    setActiveRecordingField(field);
    
    try {
      // Browser support check
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        warningToast({
          title: "Speech Recognition Not Available",
          description: "Your browser doesn't support speech recognition."
        });
        setIsInitializing(false);
        setActiveRecordingField(null);
        return;
      }
      
      // Initialize speech recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setIsInitializing(false);
        console.log("Speech recognition started");
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setActiveRecordingField(null);
        console.log("Speech recognition ended");
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        warningToast({
          title: "Speech Recognition Error",
          description: event.error === 'not-allowed' 
            ? "Microphone access was denied. Please allow microphone access."
            : `Error: ${event.error}`
        });
        setIsListening(false);
        setIsInitializing(false);
        setActiveRecordingField(null);
      };
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        
        console.log("Speech recognition result", transcript);
        
        // Update the active field with the transcribed text
        updateFieldWithTranscript(field, transcript);
      };
      
      // Start listening
      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      warningToast({
        title: "Speech Recognition Error",
        description: "Could not start speech recognition."
      });
      setIsListening(false);
      setIsInitializing(false);
      setActiveRecordingField(null);
    }
  };
  
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setActiveRecordingField(null);
  };
  
  const updateFieldWithTranscript = (field: string, transcript: string) => {
    switch (field) {
      case "wentWell":
        setWentWell(transcript);
        break;
      case "wentBadly":
        setWentBadly(transcript);
        break;
      case "gratitude":
        setGratitude(transcript);
        break;
      case "challenge":
        setChallenge(transcript);
        break;
      case "tomorrowPlan":
        setTomorrowPlan(transcript);
        break;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Date</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>My Mood Today:</Label>
                  <span>{mood}/10</span>
                </div>
                <Slider
                  value={[mood]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setMood(value[0])}
                  className="mb-1"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>😢</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="flex items-center">
                    <Droplet className="w-4 h-4 mr-1" /> Water Intake:
                  </Label>
                  <span>{water} glasses</span>
                </div>
                <Slider
                  value={[water]}
                  min={0}
                  max={8}
                  step={1}
                  onValueChange={(value) => setWater(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Sleep Hours:
                  </Label>
                  <span>{sleep} hours</span>
                </div>
                <Slider
                  value={[sleep]}
                  min={0}
                  max={12}
                  step={0.5}
                  onValueChange={(value) => setSleep(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="flex items-center">
                    <HeartPulse className="w-4 h-4 mr-1" /> Exercise Level:
                  </Label>
                  <span>{exercise}/10</span>
                </div>
                <Slider
                  value={[exercise]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setExercise(value[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My Daily Trackers</CardTitle>
            <CardDescription>
              How did you do with these important activities today?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Mindfulness Practice:</Label>
                  <span>{mindfulness}/10</span>
                </div>
                <Slider
                  value={[mindfulness]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setMindfulness(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Kind Actions:</Label>
                  <span>{kindness}/10</span>
                </div>
                <Slider
                  value={[kindness]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setKindness(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Positivity Level:</Label>
                  <span>{positivity}/10</span>
                </div>
                <Slider
                  value={[positivity]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setPositivity(value[0])}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Confidence Level:</Label>
                  <span>{confidence}/10</span>
                </div>
                <Slider
                  value={[confidence]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setConfidence(value[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Journal Reflection</CardTitle>
          <CardDescription>
            Share your thoughts about today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="wentWell" className="block mb-2">
                What went well today?
              </Label>
              <div className="flex">
                <Textarea
                  id="wentWell"
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="I'm proud of..."
                  className="min-h-24 sprout-input flex-1"
                  maxLength={2000}
                />
                <Button
                  type="button"
                  variant={activeRecordingField === "wentWell" ? "default" : "outline"}
                  className={`ml-2 ${activeRecordingField === "wentWell" ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={() => startSpeechRecognition("wentWell")}
                  disabled={isListening && activeRecordingField !== "wentWell"}
                >
                  {isInitializing && activeRecordingField === "wentWell" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isListening && activeRecordingField === "wentWell" ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="wentBadly" className="block mb-2">
                What didn't go so well?
              </Label>
              <div className="flex">
                <Textarea
                  id="wentBadly"
                  value={wentBadly}
                  onChange={(e) => setWentBadly(e.target.value)}
                  placeholder="I struggled with..."
                  className="min-h-24 sprout-input flex-1"
                  maxLength={2000}
                />
                <Button
                  type="button"
                  variant={activeRecordingField === "wentBadly" ? "default" : "outline"}
                  className={`ml-2 ${activeRecordingField === "wentBadly" ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={() => startSpeechRecognition("wentBadly")}
                  disabled={isListening && activeRecordingField !== "wentBadly"}
                >
                  {isInitializing && activeRecordingField === "wentBadly" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isListening && activeRecordingField === "wentBadly" ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gratitude" className="block mb-2">
                  3 things I'm thankful for:
                </Label>
                <div className="flex">
                  <Textarea
                    id="gratitude"
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="I'm thankful for..."
                    className="min-h-24 sprout-input flex-1"
                    maxLength={2000}
                  />
                  <Button
                    type="button"
                    variant={activeRecordingField === "gratitude" ? "default" : "outline"}
                    className={`ml-2 ${activeRecordingField === "gratitude" ? "bg-red-500 hover:bg-red-600" : ""}`}
                    onClick={() => startSpeechRecognition("gratitude")}
                    disabled={isListening && activeRecordingField !== "gratitude"}
                  >
                    {isInitializing && activeRecordingField === "gratitude" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isListening && activeRecordingField === "gratitude" ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="challenge" className="block mb-2">
                  Today's challenge:
                </Label>
                <div className="flex">
                  <Textarea
                    id="challenge"
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="I found it difficult to..."
                    className="min-h-24 sprout-input flex-1"
                    maxLength={2000}
                  />
                  <Button
                    type="button"
                    variant={activeRecordingField === "challenge" ? "default" : "outline"}
                    className={`ml-2 ${activeRecordingField === "challenge" ? "bg-red-500 hover:bg-red-600" : ""}`}
                    onClick={() => startSpeechRecognition("challenge")}
                    disabled={isListening && activeRecordingField !== "challenge"}
                  >
                    {isInitializing && activeRecordingField === "challenge" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isListening && activeRecordingField === "challenge" ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tomorrowPlan" className="block mb-2">
                  Tomorrow's plan:
                </Label>
                <div className="flex">
                  <Textarea
                    id="tomorrowPlan"
                    value={tomorrowPlan}
                    onChange={(e) => setTomorrowPlan(e.target.value)}
                    placeholder="Tomorrow I will..."
                    className="min-h-24 sprout-input flex-1"
                    maxLength={2000}
                  />
                  <Button
                    type="button"
                    variant={activeRecordingField === "tomorrowPlan" ? "default" : "outline"}
                    className={`ml-2 ${activeRecordingField === "tomorrowPlan" ? "bg-red-500 hover:bg-red-600" : ""}`}
                    onClick={() => startSpeechRecognition("tomorrowPlan")}
                    disabled={isListening && activeRecordingField !== "tomorrowPlan"}
                  >
                    {isInitializing && activeRecordingField === "tomorrowPlan" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isListening && activeRecordingField === "tomorrowPlan" ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={resetForm}>
          Reset
        </Button>
        <Button className="sprout-button" type="submit" disabled={loading || isListening}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Journal Entry"}
        </Button>
      </div>
    </form>
  );
};
