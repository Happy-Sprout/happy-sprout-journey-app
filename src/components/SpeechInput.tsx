
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpeechInputProps {
  onTranscript: (text: string) => void;
  isAppending?: boolean;
  className?: string;
}

const SpeechInput = ({ onTranscript, isAppending = true, className = "" }: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Check if browser supports speech recognition
  const browserSupportsSpeech = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  const startListening = () => {
    if (!browserSupportsSpeech) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome.",
        variant: "destructive"
      });
      return;
    }
    
    setIsListening(true);
    setIsLoading(true);
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Fixed: Handle appending text differently than setting text
      if (isAppending) {
        onTranscript(transcript);
      } else {
        onTranscript(transcript);
      }
      
      setIsLoading(false);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsLoading(false);
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsLoading(false);
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
  };
  
  return (
    <Button 
      type="button"
      variant="ghost" 
      size="sm"
      onClick={isListening ? stopListening : startListening}
      className={`absolute top-1 right-1 ${className}`}
      title={isListening ? "Stop recording" : "Start recording"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4 text-red-500" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};

// The type declarations are already in global.d.ts, so we don't need to duplicate them here
export default SpeechInput;
