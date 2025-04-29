// Basic Speech Recognition Component
import { useState, useRef, useEffect } from "react";
import { HiMicrophone, HiStop } from "react-icons/hi";

// Define component props
interface BasicAudioTranscriberProps {
  onTranscription: (text: string) => void;
  onStatusChange: (status: {
    isRecording: boolean;
    isTranscribing: boolean;
    progress: number;
  }) => void;
  onNotification: (notification: {
    type: "success" | "error";
    message: string;
  }) => void;
  disabled?: boolean;
}

// Speech recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// Use Web Speech API if available
const SpeechRecognitionAPI: { new (): SpeechRecognition } | null =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition ||
  null;

function BasicAudioTranscriber({
  onTranscription,
  onStatusChange,
  onNotification,
  disabled = false,
}: BasicAudioTranscriberProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTextRef = useRef<string>("");

  // Update status when recording state changes
  useEffect(() => {
    onStatusChange({
      isRecording,
      isTranscribing: false,
      progress: 0,
    });
  }, [isRecording, onStatusChange]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    // Check if browser supports speech recognition
    if (!SpeechRecognitionAPI) {
      onNotification({
        type: "error",
        message:
          "Seu navegador não suporta reconhecimento de fala. Tente usar Chrome ou Edge.",
      });
      return;
    }

    try {
      // Create new recognition instance
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;

      if (!recognition) {
        throw new Error("Falha ao criar instância de reconhecimento de fala");
      }

      // Configure recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "pt-BR"; // Set language to Brazilian Portuguese

      // Reset accumulated text
      accumulatedTextRef.current = "";

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        let isFinal = false;

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          isFinal = event.results[i].isFinal;

          if (isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update accumulated text
        if (finalTranscript) {
          accumulatedTextRef.current += finalTranscript + " ";
        }

        // Send current text to parent
        const currentText = accumulatedTextRef.current + interimTranscript;
        if (currentText) {
          onTranscription(currentText.trim());
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        onNotification({
          type: "error",
          message: `Erro no reconhecimento de fala: ${event.error}`,
        });
        setIsRecording(false);
      };

      // Handle recognition end
      recognition.onend = () => {
        // If we still have text, send the final version
        if (accumulatedTextRef.current) {
          onTranscription(accumulatedTextRef.current.trim());
        }
        setIsRecording(false);
      };

      // Start recording
      recognition.start();
      setIsRecording(true);
      onNotification({
        type: "success",
        message: "Gravando... Fale o que deseja transcrever.",
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      onNotification({
        type: "error",
        message: "Não foi possível iniciar o reconhecimento de fala.",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      onNotification({
        type: "success",
        message: "Gravação finalizada.",
      });
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`h-full px-4 flex items-center justify-center transition-colors ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
        disabled={disabled}
        title={isRecording ? "Parar gravação" : "Buscar por voz"}
      >
        {isRecording ? (
          <HiStop className="h-5 w-5" />
        ) : (
          <HiMicrophone className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export { BasicAudioTranscriber };
export default BasicAudioTranscriber;
