import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, durationMs: number) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0); // in ms
  const [playbackTime, setPlaybackTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setRecordedBlob(null);
      setDuration(0);
      chunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        onRecordingComplete(blob, duration);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = window.setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);
      
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current && recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
      };
      audio.ontimeupdate = () => {
        setPlaybackTime(audio.currentTime * 1000);
      };
      audioRef.current = audio;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setDuration(0);
    setPlaybackTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-xl shadow-sm relative overflow-hidden group">
      {/* Background recording pulse */}
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-full h-full bg-destructive/5 animate-pulse" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="text-3xl font-mono font-medium tracking-wider">
          {recordedBlob ? formatTime(playbackTime || duration) : formatTime(duration)}
        </div>

        {!recordedBlob ? (
          isRecording ? (
            <Button 
              size="lg" 
              variant="destructive" 
              className="w-20 h-20 rounded-full rounded-xl animate-in zoom-in" 
              onClick={stopRecording}
              disabled={disabled}
            >
              <Square className="w-8 h-8 fill-current" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              className={cn("w-20 h-20 rounded-full", disabled ? "" : "hover:bg-primary/90 hover:scale-105 transition-all shadow-md")}
              onClick={startRecording}
              disabled={disabled}
            >
              <Mic className="w-8 h-8" />
            </Button>
          )
        ) : (
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-12 h-12 rounded-full" 
              onClick={resetRecording}
              disabled={disabled}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              className="w-16 h-16 rounded-full shadow-sm" 
              onClick={togglePlayback}
              disabled={disabled}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </Button>
          </div>
        )}

        <div className="text-sm font-medium text-muted-foreground h-5">
          {isRecording ? (
            <span className="text-destructive animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Recording
            </span>
          ) : recordedBlob ? (
            "Ready to submit"
          ) : (
            "Click to start speaking"
          )}
        </div>
      </div>
    </div>
  );
}
