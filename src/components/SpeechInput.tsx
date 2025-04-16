
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpeechInputProps {
  onTranscript: (text: string) => void;
  isAppending?: boolean;
  className?: string;
}

const SpeechInput = ({ onTranscript, isAppending = true, className = "" }: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
    };
  }, []);
  
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
    
    if (isPaused) {
      // Resume from pause
      resumeListening();
      return;
    }
    
    setIsListening(true);
    setIsLoading(true);
    setIsPaused(false);
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Clear any previous transcript if we're not appending
    if (!isAppending) {
      transcriptRef.current = "";
    }
    
    recognition.onresult = (event) => {
      const latestTranscript = event.results[0][0].transcript;
      
      // If appending, combine with previous transcript
      if (isAppending) {
        // Add space if needed
        if (transcriptRef.current && !transcriptRef.current.endsWith(' ') && !latestTranscript.startsWith(' ')) {
          transcriptRef.current += ' ';
        }
        
        // Append new transcript
        transcriptRef.current += latestTranscript;
        onTranscript(transcriptRef.current);
      } else {
        transcriptRef.current = latestTranscript;
        onTranscript(latestTranscript);
      }
      
      setIsLoading(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsLoading(false);
      setIsListening(false);
      setIsPaused(false);
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      // Only set isListening to false if we're not paused
      if (!isPaused) {
        setIsListening(false);
      }
      setIsLoading(false);
    };
    
    recognition.start();
  };
  
  const pauseListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  };
  
  const resumeListening = () => {
    setIsPaused(false);
    setIsListening(true);
    setIsLoading(true);
    
    // Re-initialize recognition for resume
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      const latestTranscript = event.results[0][0].transcript;
      
      // Always append after a pause
      if (transcriptRef.current && !transcriptRef.current.endsWith(' ') && !latestTranscript.startsWith(' ')) {
        transcriptRef.current += ' ';
      }
      
      transcriptRef.current += latestTranscript;
      onTranscript(transcriptRef.current);
      
      setIsLoading(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error on resume', event.error);
      setIsLoading(false);
      setIsListening(false);
      setIsPaused(false);
      toast({
        title: "Speech Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      if (!isPaused) {
        setIsListening(false);
      }
      setIsLoading(false);
    };
    
    recognition.start();
  };
  
  const stopListening = () => {
    setIsListening(false);
    setIsPaused(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  // Determine button action based on current state
  const handleButtonClick = () => {
    if (isListening && !isPaused) {
      pauseListening();
    } else if (isPaused) {
      resumeListening();
    } else {
      startListening();
    }
  };
  
  // Determine which icon to show
  const renderIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (isPaused) {
      return <Play className="h-4 w-4 text-green-500" />;
    } else if (isListening) {
      return <Pause className="h-4 w-4 text-amber-500" />;
    } else {
      return <Mic className="h-4 w-4" />;
    }
  };
  
  // Button title changes based on state
  const getButtonTitle = () => {
    if (isPaused) return "Resume recording";
    if (isListening) return "Pause recording";
    return "Start recording";
  };
  
  return (
    <div className={`flex gap-1 ${className}`}>
      <Button 
        type="button"
        variant={isListening || isPaused ? "default" : "ghost"} 
        size="sm"
        onClick={handleButtonClick}
        title={getButtonTitle()}
        className={`${isListening && !isPaused ? "bg-amber-500 hover:bg-amber-600" : ""} ${isPaused ? "bg-green-500 hover:bg-green-600" : ""}`}
      >
        {renderIcon()}
      </Button>
      
      {(isListening || isPaused) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={stopListening}
          title="Stop recording"
          className="text-red-500 hover:text-red-600"
        >
          <MicOff className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SpeechInput;
