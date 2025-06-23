// AssemblyAI Audio Transcriber Component
import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiMicrophone, HiStop, HiUpload } from "react-icons/hi";
import {
  assemblyAITranscriber,
  TranscriptionResult,
} from "../services/AssemblyAIService";

// Define as propriedades do componente
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
  allowFileUpload?: boolean;
}

// Componente de transcrição de áudio usando AssemblyAI
function WorkingAudioTranscriber({
  onTranscription,
  onStatusChange,
  onNotification,
  disabled = false,
  showMicTest = true,
  allowFileUpload = true,
}: AudioTranscriberProps) {
  // Estados para controle de gravação e transcrição
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const maxRecordingTimeoutRef = useRef<number | null>(null);
  const previousStatusRef = useRef({
    isRecording: false,
    isTranscribing: false,
    progress: 0,
  });

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
    };
  }, []);

  // Memoize status object to prevent unnecessary re-renders
  const currentStatus = useMemo(
    () => ({
      isRecording,
      isTranscribing,
      progress: transcribeProgress,
    }),
    [isRecording, isTranscribing, transcribeProgress]
  );

  // Atualize o status quando os estados mudarem - com verificação para evitar loop
  useEffect(() => {
    const prevStatus = previousStatusRef.current;

    // Só chama onStatusChange se algo realmente mudou
    if (
      prevStatus.isRecording !== currentStatus.isRecording ||
      prevStatus.isTranscribing !== currentStatus.isTranscribing ||
      prevStatus.progress !== currentStatus.progress
    ) {
      // Atualiza a referência para o próximo ciclo
      previousStatusRef.current = { ...currentStatus };

      // Notifica mudanças para o componente pai
      onStatusChange(currentStatus);
    }
  }, [currentStatus, onStatusChange]);

  // Função para iniciar o simulador de progresso
  const startProgressSimulation = () => {
    // Reinicia o progresso
    setTranscribeProgress(0);

    // Limpa qualquer intervalo existente
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Configura um intervalo para incrementar o progresso até cerca de 95%
    const interval = setInterval(() => {
      setTranscribeProgress((prevProgress) => {
        // Cria uma simulação de progresso não linear
        if (prevProgress < 30) {
          return prevProgress + 3; // Avança mais rápido no início
        } else if (prevProgress < 60) {
          return prevProgress + 2; // Velocidade média
        } else if (prevProgress < 90) {
          return prevProgress + 0.5; // Desacelera
        } else if (prevProgress < 95) {
          return prevProgress + 0.2; // Bem lento perto do final
        }
        return 95; // Máximo antes da conclusão
      });
    }, 200);

    progressIntervalRef.current = interval as unknown as number;
    console.log("Simulação de progresso iniciada");

    // Timeout de segurança para completar o progresso após 30 segundos
    // (AssemblyAI pode demorar para processar arquivos maiores)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      // Se ainda estamos transcrevendo após o timeout
      if (isTranscribing && transcribeProgress >= 94) {
        console.log("Timeout de segurança acionado - completando progresso");
        completeProgress();
        setIsTranscribing(false);
        onNotification({
          type: "error",
          message: "A transcrição demorou muito tempo. Tente novamente.",
        });
      }
    }, 30000) as unknown as number; // 30 segundos de timeout
  };

  // Função para completar o progresso (100%)
  const completeProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setTranscribeProgress(100);
    console.log("Transcrição concluída: 100%");

    // Limpar o progresso após um segundo
    setTimeout(() => {
      setTranscribeProgress(0);
    }, 1000);
  };

  // Função para iniciar gravação de áudio
  const startRecording = async () => {
    try {
      // Verificar se temos a chave da API configurada
      if (!assemblyAITranscriber.hasApiKey()) {
        onNotification({
          type: "error",
          message:
            "Chave da API da AssemblyAI não configurada. Verifique se a variável VITE_ASSEMBLY_API_KEY está definida no arquivo .env.",
        });
        return;
      }

      // Log de debug
      console.log("Iniciando gravação...");

      // Solicitar permissão para usar o microfone com configurações de alta qualidade
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Configurar o MediaRecorder com alta qualidade
      const options = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      };

      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch {
        console.log(
          "Configuração avançada de áudio não suportada, usando padrão"
        );
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Adicionar eventos ao MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(
            `Chunk de áudio capturado: ${(event.data.size / 1024).toFixed(
              2
            )} KB`
          );
        }
      };

      mediaRecorder.onstop = () => {
        setTimeout(() => {
          processAudioForTranscription();
        }, 300);
      };

      // Iniciar a gravação
      mediaRecorder.start(100);
      setIsRecording(true);

      // Configurar a detecção de silêncio para parar automaticamente
      setTimeout(() => {
        detectVoiceActivity();
      }, 500);

      // Configurar o timeout máximo de gravação (10 segundos)
      setMaxRecordingTimeout();

      // Feedback de início de gravação
      const beep = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQufDmlUEBAUit//W5Yi0aDUSj/vC0ZjMiEz6W+uuvaD0vFjaG89+rbFVEHyp66M+lbGBXJx9u3cWfaGRbKRtn1b+apF9WLBpizLmXoGBVLhhgx7WVnWBVLxpiwLGSmF1TMRxgvq6Pl1tTMx1fur2OllhQNCBes6qLkFhONyReqKOIjVdMOyderqeFiFRJPSpeqKKDhVFGQCtfpZ6BglBEQyxgo5x+f05CRy5hnpp8fUxASjBhmJd6ekpATTFik5R4eUdATjNkj5F2d0U9UDVmjI90dUI8UjdnhnxvcD46UzlofHZpbjs4VDxqd3Fkazg2Vj5sc25gZzUzV0JvbmxcYjIxWERyaGhXXC8vWkZzZGVRVi0tXEhzYGFLUCsrXkp0XF1FTCkpX0x2WFg/RicoYE52VFQ5QSQmYVB3T083PCEjYlJ6Sks0NR4hY1N8R0YwMBofZFR+REErKxceZVWARz8nJhMcZlaCSjwjIRAaZ1iGTDgfHA0ZaFmKTjUbFwoXaVqOUTEXEgcValtQUy0TEQQTbF1XVCkPDwIQbWBdViYLDQAOb2JhWCMGCQALcWdmWh8CBQAI"
      );
      beep
        .play()
        .catch((err) => console.log("Não foi possível reproduzir o som:", err));

      console.log("Gravação iniciada. Fale o nome do produto...");
      onNotification({
        type: "success",
        message: "Gravando... Fale o que deseja transcrever.",
      });
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      onNotification({
        type: "error",
        message:
          "Não foi possível acessar o microfone. Verifique as permissões.",
      });
    }
  };

  // Função para configurar o timeout máximo de gravação
  const setMaxRecordingTimeout = () => {
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
      maxRecordingTimeoutRef.current = null;
    }

    maxRecordingTimeoutRef.current = window.setTimeout(() => {
      if (isRecording) {
        console.log(
          "Tempo máximo de gravação atingido (10s), parando automaticamente"
        );
        onNotification({
          type: "success",
          message: "Tempo máximo de gravação atingido. Processando áudio...",
        });
        stopRecording();
      }
    }, 10000) as unknown as number;
  };

  // Função para parar a gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Limpar timeout de gravação máxima
      if (maxRecordingTimeoutRef.current) {
        clearTimeout(maxRecordingTimeoutRef.current);
        maxRecordingTimeoutRef.current = null;
      }

      // Feedback sonoro de fim de gravação
      const beep = new Audio(
        "data:audio/wav;base64,UklGRnYEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoEAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQufDmlUEBAbOz1dWvj3VmSzo2PmV/pcTdyJ5zbWv/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAABAAAAAAABAAAAAAAAAQAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQAAAAEAAAAAAAABAAAAAAAAAQAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABAAAAAAAAAQAAAAEAAAEAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAEAAAEAAAABAAABAAAAAQAAAAIAAAABAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABAAAAAQAAAQAAAQEAAQABAAAAAQAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMCAAAAAQACAAAAAAEAAQAAAAABAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAACAAABAAABAAAAAAEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAEAAAABAAAAAAEAAAAMAAAA"
      );
      beep
        .play()
        .catch(() => console.log("Não foi possível reproduzir o som de fim"));

      // Atualizar estados
      setIsRecording(false);
      setIsTranscribing(true);
      setTranscribeProgress(0);

      console.log("Gravação finalizada, iniciando processamento de áudio...");
      onNotification({
        type: "success",
        message: "Processando áudio...",
      });

      try {
        // Capturar os dados finais antes de parar
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      } catch (err) {
        console.log("Erro ao solicitar dados finais:", err);
      }

      // Pequena pausa para garantir que os dados foram processados
      setTimeout(() => {
        try {
          mediaRecorderRef.current?.stop();
        } catch (err) {
          console.error("Erro ao parar o MediaRecorder:", err);
          // Em caso de erro, tentar processar o áudio mesmo assim
          processAudioForTranscription();
        }
      }, 50);
    }
  };

  // Função para processar o áudio e enviar para transcrição
  const processAudioForTranscription = async () => {
    startProgressSimulation();
    console.log("Iniciando processamento de áudio para transcrição...");

    try {
      // Verificar se temos áudio capturado
      if (audioChunksRef.current.length === 0) {
        console.error("Nenhum áudio capturado para transcrição");
        completeProgress();
        setIsTranscribing(false);
        onNotification({
          type: "error",
          message:
            "Nenhum áudio foi capturado. Tente novamente e fale após iniciar a gravação.",
        });
        return;
      }

      // Criar um blob de áudio para enviar à API
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      console.log(`Tamanho do áudio: ${(audioBlob.size / 1024).toFixed(2)} KB`);

      // Verificar se o áudio é muito pequeno
      if (audioBlob.size < 1024) {
        console.warn(
          "Tamanho do áudio muito pequeno, pode não conter fala detectável"
        );
        onNotification({
          type: "error",
          message:
            "O áudio gravado é muito curto. Por favor, tente novamente e fale por mais tempo.",
        });
        completeProgress();
        setIsTranscribing(false);
        return;
      }

      // Enviar para transcrição usando a AssemblyAI
      console.log("Enviando áudio para transcrição via AssemblyAI...");
      const result: TranscriptionResult =
        await assemblyAITranscriber.transcribeAudio(audioBlob);

      // Processar o resultado
      completeProgress();
      setIsTranscribing(false);

      if (result.success && result.text) {
        console.log(`Transcrição bem-sucedida: "${result.text}"`);
        onTranscription(result.text);
        onNotification({
          type: "success",
          message: `Transcrição: "${result.text}"`,
        });
      } else {
        console.error("Erro na transcrição:", result.error);
        onNotification({
          type: "error",
          message:
            result.error ||
            "Não foi possível transcrever o áudio. Tente novamente.",
        });
      }
    } catch (err) {
      console.error("Erro no processamento do áudio:", err);
      completeProgress();
      setIsTranscribing(false);
      onNotification({
        type: "error",
        message: `Erro ao processar áudio: ${
          err instanceof Error ? err.message : "Erro desconhecido"
        }`,
      });
    }
  };

  // Função para importar um arquivo de áudio
  const importAudioFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      onNotification({
        type: "error",
        message: "Nenhum arquivo selecionado.",
      });
      return;
    }

    // Verificar se é um arquivo de áudio
    if (!file.type.startsWith("audio/")) {
      onNotification({
        type: "error",
        message: "O arquivo selecionado não é um áudio válido.",
      });
      return;
    }

    // Verificar se temos a chave da API configurada
    if (!assemblyAITranscriber.hasApiKey()) {
      onNotification({
        type: "error",
        message:
          "Chave da API da AssemblyAI não configurada. Verifique se a variável VITE_ASSEMBLY_API_KEY está definida no arquivo .env.",
      });
      return;
    }

    console.log(
      `Arquivo de áudio selecionado: ${file.name} (${(file.size / 1024).toFixed(
        2
      )} KB)`
    );
    onNotification({
      type: "success",
      message: `Processando arquivo de áudio: ${file.name}`,
    });

    // Iniciar a transcrição
    setIsTranscribing(true);
    setTranscribeProgress(0);
    startProgressSimulation();

    try {
      // Ler o arquivo como um blob
      const arrayBuffer = await file.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: file.type });

      // Substituir os chunks de áudio pelo arquivo importado
      audioChunksRef.current = [audioBlob];
      console.log(`Áudio importado: ${(audioBlob.size / 1024).toFixed(2)} KB`);

      // Enviar para transcrição
      const result = await assemblyAITranscriber.transcribeAudio(audioBlob);

      completeProgress();
      setIsTranscribing(false);

      if (result.success && result.text) {
        console.log(`Transcrição bem-sucedida: "${result.text}"`);
        onTranscription(result.text);
        onNotification({
          type: "success",
          message: `Transcrição: "${result.text}"`,
        });
      } else {
        onNotification({
          type: "error",
          message:
            result.error || "Erro ao transcrever o áudio. Tente novamente.",
        });
      }
    } catch (err) {
      console.error("Erro ao processar arquivo de áudio:", err);
      completeProgress();
      setIsTranscribing(false);
      onNotification({
        type: "error",
        message: "Erro ao processar o arquivo de áudio. Tente novamente.",
      });
    }

    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Função para ativar o input de arquivo
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Função para detectar silêncio e parar a gravação automaticamente
  const detectVoiceActivity = (): void => {
    if (!mediaRecorderRef.current || !isRecording) return;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let silenceStart: number | null = null;
        const silenceThreshold = 15; // Valor baixo para considerar como silêncio
        const silenceDuration = 1500; // 1.5 segundos de silêncio para parar a gravação automaticamente

        const checkAudioLevel = () => {
          if (!isRecording) {
            // Limpeza se não estiver mais gravando
            stream.getTracks().forEach((track) => track.stop());
            audioContext.close();
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

          if (average < silenceThreshold) {
            // Silêncio detectado
            if (!silenceStart) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart > silenceDuration) {
              // Se o silêncio durou o tempo definido, parar a gravação automaticamente
              console.log(
                "Silêncio detectado por " +
                  silenceDuration +
                  "ms, parando gravação"
              );
              stopRecording();
              stream.getTracks().forEach((track) => track.stop());
              audioContext.close();
              return;
            }
          } else {
            // Som detectado, resetar o temporizador de silêncio
            silenceStart = null;
          }

          // Continuar verificando
          requestAnimationFrame(checkAudioLevel);
        };

        // Iniciar a detecção
        checkAudioLevel();
      })
      .catch((err) => {
        console.error("Erro ao monitorar nível de áudio:", err);
      });
  };

  // Função para testar o microfone
  const testMicrophone = async () => {
    try {
      onNotification({
        type: "success",
        message: "Testando seu microfone. Por favor, aguarde...",
      });

      console.log("Iniciando teste de microfone...");

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Criar um analisador de áudio para verificar o nível de som
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      // Configurar o analisador
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);

      let soundDetected = false;
      let testDuration = 0;
      const maxTestDuration = 5000; // 5 segundos de teste
      const startTime = Date.now();

      // Função para verificar o nível de som
      const checkSound = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        // Calcular o nível médio de som
        const average =
          array.reduce((sum, value) => sum + value, 0) / array.length;
        console.log(`Nível de som: ${average}`);

        // Se detectar som acima de um certo limiar
        if (average > 20) {
          soundDetected = true;
          cleanupAudio();

          onNotification({
            type: "success",
            message: "Microfone está funcionando! Som detectado.",
          });
          return;
        }

        // Verificar se o tempo máximo de teste foi excedido
        testDuration = Date.now() - startTime;
        if (testDuration >= maxTestDuration) {
          cleanupAudio();

          if (!soundDetected) {
            onNotification({
              type: "error",
              message:
                "Não foi detectado som no microfone. Verifique se está mudo ou se está selecionado o dispositivo correto.",
            });
          }
          return;
        }

        // Continuar verificando até encontrar som ou atingir o tempo máximo
        requestAnimationFrame(checkSound);
      };

      // Iniciar a verificação de som
      checkSound();

      // Função para limpar recursos de áudio
      function cleanupAudio() {
        microphone.disconnect();
        stream.getTracks().forEach((track) => track.stop());
        if (audioContext.state !== "closed") {
          audioContext.close();
        }
      }
    } catch (err) {
      console.error("Erro ao testar microfone", err);
      onNotification({
        type: "error",
        message:
          "Não foi possível acessar o microfone para teste. Verifique as permissões do navegador.",
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-1">
        {/* Input de arquivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={importAudioFile}
          accept="audio/*"
          className="hidden"
          disabled={disabled || isRecording || isTranscribing}
        />

        {/* Botão de teste do microfone */}
        {showMicTest && (
          <button
            type="button"
            onClick={testMicrophone}
            className="h-full px-3 flex items-center justify-center transition-colors bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-l"
            disabled={disabled || isRecording || isTranscribing}
            title="Testar microfone"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Botão de upload de arquivo de áudio */}
        {allowFileUpload && (
          <button
            type="button"
            onClick={triggerFileInput}
            className="h-full px-3 flex items-center justify-center transition-colors bg-green-100 hover:bg-green-200 text-green-700"
            disabled={disabled || isRecording || isTranscribing}
            title="Importar arquivo de áudio"
          >
            <HiUpload className="h-5 w-5" />
          </button>
        )}

        {/* Botão de gravação/parar */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`h-full px-4 flex items-center justify-center transition-colors ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          disabled={disabled || isTranscribing}
          title={isRecording ? "Parar gravação" : "Buscar por voz"}
        >
          {isRecording ? (
            <HiStop className="h-5 w-5" />
          ) : (
            <HiMicrophone className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Barra de progresso */}
      {isTranscribing && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${transcribeProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

// Exportação padrão
export default WorkingAudioTranscriber;
