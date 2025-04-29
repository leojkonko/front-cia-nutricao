// Basic Speech Recognition Component using named export
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

// Add a type check helper
const isSpeechRecognitionSupported = (): boolean => {
  return SpeechRecognitionAPI !== null;
};

export function BasicAudioTranscriberNew({
  onTranscription,
  onStatusChange,
  onNotification,
  disabled = false,
}: BasicAudioTranscriberProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedTextRef = useRef<string>("");

  // Check browser compatibility on mount
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API não suportada neste navegador");
      onNotification({
        type: "error",
        message:
          "Seu navegador pode não suportar reconhecimento de fala. Recomendamos usar Chrome ou Edge.",
      });
    }
  }, [onNotification]);

  // Update status when recording state changes
  useEffect(() => {
    onStatusChange({
      isRecording,
      isTranscribing: false,
      progress: 0,
    });
  }, [isRecording, onStatusChange]);

  // Check browser compatibility on mount
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API não suportada neste navegador");
    }
  }, []);

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
      }; // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);

        let errorMessage = "Erro no reconhecimento de fala.";
        let helpMessage = "";

        // Personalizar mensagens de erro
        switch (event.error) {
          case "not-allowed":
            errorMessage = "Permissão para usar o microfone foi negada.";
            helpMessage =
              "Verifique as configurações de permissão do seu navegador e permita o acesso ao microfone.";
            break;
          case "no-speech":
            errorMessage = "Nenhuma fala foi detectada.";
            helpMessage =
              "Verifique se seu microfone está funcionando e se você está falando próximo a ele.";
            break;
          case "network":
            errorMessage = "Erro de conexão à rede.";
            helpMessage = "Verifique sua conexão com a internet.";
            break;
          case "aborted":
            errorMessage = "Reconhecimento de fala foi interrompido.";
            break;
          default:
            errorMessage = `Erro no reconhecimento de fala: ${event.error}`;
            helpMessage =
              "Tente novamente ou use a digitação no campo de busca.";
        }

        onNotification({
          type: "error",
          message: helpMessage
            ? `${errorMessage} ${helpMessage}`
            : errorMessage,
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
      }; // Start recording
      recognition.start();
      setIsRecording(true);
      onNotification({
        type: "success",
        message:
          "Gravando... Fale o que você deseja buscar. Clique no botão vermelho para parar.",
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
        message:
          "Gravação finalizada. O texto transcrito aparece na caixa de busca.",
      });
    }
  };
  return (
    // <div className="flex items-center">
    <div
      className={`flex items-center h-12 ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`h-full px-4 flex items-center justify-center transition-colors cursor-pointer`}
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
