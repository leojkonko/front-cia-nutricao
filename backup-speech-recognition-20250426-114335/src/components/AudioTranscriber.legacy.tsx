// LEGACY COMPONENT - KEPT FOR REFERENCE ONLY
// This file is a backup of the original AudioTranscriber component
// that used the Web Speech API instead of AssemblyAI
// Use AudioTranscriberWithAssemblyAI.tsx instead

// Remove duplicate declarations
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { HiMicrophone, HiStop, HiUpload } from "react-icons/hi";

// Global flag to track if recognition is already started
let isRecognitionStarted = false;

// Safe recognition start function to prevent double-starting
const startRecognitionSafely = (recognition: SpeechRecognition): boolean => {
  if (isRecognitionStarted) {
    console.log("Recognition already started, skipping start() call");
    return false;
  }

  isRecognitionStarted = true;
  try {
    recognition.start();
    console.log("Recognition started safely");
    return true;
  } catch (error) {
    console.error("Error starting recognition:", error);
    isRecognitionStarted = false; // Reset flag on error
    return false;
  }
};

// Adicionando tipos para os eventos de reconhecimento de fala
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: unknown;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// Declarando as interfaces para o Web Speech API
declare global {
  interface Window {
    // Using constructors instead of 'any'
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface AudioTranscriberProps {
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
  showMicTest?: boolean;
  allowFileUpload?: boolean; // Nova propriedade para controlar se o upload de arquivo é permitido
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscription,
  onStatusChange,
  onNotification,
  disabled = false,
  showMicTest = true,
  allowFileUpload = true, // Habilitado por padrão
}) => {
  // Estados para controle de gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const maxRecordingTimeoutRef = useRef<number | null>(null);
  // Efeito para limpar intervalos e timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (maxRecordingTimeoutRef.current) {
        clearTimeout(maxRecordingTimeoutRef.current);
        maxRecordingTimeoutRef.current = null;
      }
      // Reset the recognition flag when component unmounts
      isRecognitionStarted = false;
    };
  }, []);

  // Atualização segura do status sem causar loops infinitos
  const onStatusChangeRef = useRef(onStatusChange);

  // Função para configurar um timeout máximo de gravação
  const setMaxRecordingTimeout = () => {
    // Limpa qualquer timeout existente
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
      maxRecordingTimeoutRef.current = null;
    }

    // Configura um novo timeout (10 segundos)
    maxRecordingTimeoutRef.current = window.setTimeout(() => {
      if (isRecording) {
        console.log("Tempo máximo de gravação atingido (10s)");
        stopRecording();
      }
    }, 10000) as unknown as number;
  };

  // Cache the onStatusChange function ref
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Sempre atualize o status quando isRecording, isTranscribing ou transcribeProgress mudarem
  useEffect(() => {
    onStatusChangeRef.current({
      isRecording,
      isTranscribing,
      progress: transcribeProgress,
    });
  }, [isRecording, isTranscribing, transcribeProgress]);

  // Função para iniciar o processo de transcrição por voz
  const startRecording = async () => {
    try {
      // Verificar se o navegador suporta a API de reconhecimento de fala
      if (
        !("SpeechRecognition" in window) &&
        !("webkitSpeechRecognition" in window)
      ) {
        alert(
          "Seu navegador não suporta reconhecimento de fala. Tente o Google Chrome."
        );
        onNotification({
          type: "error",
          message:
            "Seu navegador não suporta reconhecimento de fala. Tente o Google Chrome.",
        });
        return;
      }

      // Criar um novo objeto de reconhecimento
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configurar as opções
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      // Flag para controlar se o reconhecimento já forneceu um resultado final
      let hasFinalResult = false;

      // Evento quando um resultado é obtido
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = "";
        let isFinal = false;

        // Extrair a transcrição do resultado
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          isFinal = event.results[i].isFinal;
        }

        // Se temos um resultado final, parar a gravação
        if (isFinal && !hasFinalResult) {
          hasFinalResult = true;
          console.log("Resultado final:", transcript);
          onTranscription(transcript);
          stopRecording();
        }
      };

      // Evento quando ocorre um erro
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erro no reconhecimento de fala:", event);
        isRecognitionStarted = false; // Reset flag on error
        setIsRecording(false);
        setIsTranscribing(false);
        setTranscribeProgress(0);
        if (event.error === "no-speech") {
          onNotification({
            type: "error",
            message: "Nenhuma fala detectada. Tente novamente.",
          });
        } else {
          onNotification({
            type: "error",
            message: `Erro no reconhecimento de fala: ${event.error}`,
          });
        }
      };

      // Evento quando o reconhecimento termina
      recognition.onend = () => {
        console.log("Reconhecimento de fala finalizado");
        isRecognitionStarted = false; // Reset flag when recognition ends

        // Se não tivemos um resultado final, informar o usuário
        if (!hasFinalResult) {
          onNotification({
            type: "error",
            message:
              "Não conseguimos entender o que você disse. Tente novamente mais devagar e claramente.",
          });
        }

        // Apenas mude o estado se ainda estivermos gravando
        if (isRecording) {
          setIsRecording(false);
          setIsTranscribing(false);
          setTranscribeProgress(0);
        }
      };

      // Iniciar a gravação
      setIsRecording(true);
      setTranscribeProgress(0);

      // Função de inicialização segura
      const started = startRecognitionSafely(recognition);
      if (!started) {
        onNotification({
          type: "error",
          message:
            "Não foi possível iniciar o reconhecimento de fala. Tente novamente.",
        });
        return;
      }

      console.log("Gravação iniciada. Fale o nome do produto...");
      onNotification({
        type: "success",
        message: "Gravando... Fale o nome do produto.",
      });

      // Configurar um timeout máximo
      setMaxRecordingTimeout();
    } catch (error) {
      console.error("Erro ao acessar o reconhecimento de fala:", error);
      onNotification({
        type: "error",
        message:
          "Erro ao iniciar o reconhecimento de fala. Tente novamente mais tarde.",
      });
      setIsRecording(false);
      setIsTranscribing(false);
      setTranscribeProgress(0);
    }
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (isRecording) {
      console.log("Parando a gravação...");
      setIsRecording(false);

      // Limpar o timeout de gravação máxima
      if (maxRecordingTimeoutRef.current) {
        clearTimeout(maxRecordingTimeoutRef.current);
        maxRecordingTimeoutRef.current = null;
      }

      // As ações restantes são tratadas pelos eventos onend e onresult
    }
  };

  // Função auxiliar para testar o microfone
  const testMicrophone = async () => {
    try {
      console.log("Testando acesso ao microfone...");
      onNotification({
        type: "success",
        message: "Testando seu microfone...",
      });

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Verificar se o microfone está captando áudio
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      microphone.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Verificar o nível de áudio por 3 segundos
      let soundDetected = false;
      let testTime = 0;
      const checkAudio = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

        console.log(`Nível de áudio: ${average}`);

        if (average > 30) {
          soundDetected = true;
          clearInterval(checkAudio);
          stream.getTracks().forEach((track) => track.stop());
          onNotification({
            type: "success",
            message: "Microfone funcionando! Som detectado.",
          });
        }

        testTime += 500;
        if (testTime >= 3000) {
          clearInterval(checkAudio);
          stream.getTracks().forEach((track) => track.stop());

          if (!soundDetected) {
            onNotification({
              type: "error",
              message: "Nenhum som detectado. Verifique seu microfone.",
            });
          }
        }
      }, 500);
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      onNotification({
        type: "error",
        message:
          "Não foi possível acessar seu microfone. Verifique as permissões do navegador.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isTranscribing}
        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
        aria-label={isRecording ? "Parar gravação" : "Gravar voz"}
      >
        {isRecording ? (
          <HiStop className="h-5 w-5" />
        ) : (
          <HiMicrophone className="h-5 w-5" />
        )}
      </button>

      {showMicTest && (
        <button
          type="button"
          onClick={testMicrophone}
          disabled={disabled || isRecording || isTranscribing}
          className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md"
          aria-label="Testar microfone"
        >
          Testar Mic
        </button>
      )}
    </>
  );
};

export default AudioTranscriber;
