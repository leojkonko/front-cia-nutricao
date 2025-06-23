// Remove duplicate declarations
import React, { useState, useRef, useEffect } from "react";
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
  allowFileUpload?: boolean; // Nova propriedade para controlar se o botão de upload é exibido
}

const AudioTranscriberWithImport: React.FC<AudioTranscriberProps> = ({
  onTranscription,
  onStatusChange,
  onNotification,
  disabled = false,
  showMicTest = true,
  allowFileUpload = true, // Por padrão, permitir upload de arquivo
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
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input de arquivo

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

    // Define um novo timeout (10 segundos)
    maxRecordingTimeoutRef.current = window.setTimeout(() => {
      if (isRecording) {
        console.log(
          "Tempo máximo de gravação atingido (10s), parando automaticamente"
        );
        onNotification({
          type: "success", // Usamos success em vez de info pois a interface não suporta "info"
          message: "Tempo máximo de gravação atingido. Processando áudio...",
        });
        stopRecording();
      }
    }, 10000) as unknown as number;
  };

  // Atualiza a referência quando a prop mudar
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Atualiza o status sempre que os estados relacionados mudam
  useEffect(() => {
    // Usa a referência para evitar dependência direta
    onStatusChangeRef.current({
      isRecording,
      isTranscribing,
      progress: transcribeProgress,
    });
  }, [isRecording, isTranscribing, transcribeProgress]);

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

    // Salva a referência do intervalo
    progressIntervalRef.current = interval as unknown as number;
    console.log("Simulação de progresso iniciada");

    // Configura um timeout de segurança para garantir que o progresso chegue a 100%
    // mesmo se a transcrição falhar ou demorar muito
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      // Verifica se ainda estamos transcrevendo e o progresso está próximo de 95%
      if (isTranscribing && transcribeProgress >= 94) {
        console.log("Timeout de segurança acionado - completando progresso");
        completeProgress();
        setIsTranscribing(false);
        onNotification({
          type: "error",
          message:
            "A transcrição demorou muito tempo. Tente novamente ou digite sua busca.",
        });
      }
    }, 10000) as unknown as number; // 10 segundos de timeout
  };

  // Função para parar o simulador de progresso e completar a 100%
  const completeProgress = () => {
    // Limpa o intervalo existente
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Define o progresso como 100%
    setTranscribeProgress(100);
    console.log("Transcrição concluída: 100%");

    // Após 1 segundo, limpa o progresso (para dar tempo do usuário ver que chegou a 100%)
    setTimeout(() => {
      setTranscribeProgress(0);
    }, 1000);
  };

  // Função para importar arquivo de áudio
  const importAudioFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("Nenhum arquivo selecionado");
      return;
    }

    try {
      console.log(
        `Importando arquivo de áudio: ${file.name} (${(
          file.size / 1024
        ).toFixed(2)} KB)`
      );

      // Verificar se é um arquivo de áudio válido
      if (!file.type.startsWith("audio/")) {
        onNotification({
          type: "error",
          message: "Por favor, selecione um arquivo de áudio válido.",
        });
        return;
      }

      // Notificar o usuário
      onNotification({
        type: "success",
        message: `Arquivo selecionado: ${file.name}. Processando áudio...`,
      });

      // Converter o arquivo para Blob
      const audioBlob = new Blob([await file.arrayBuffer()], {
        type: file.type,
      });

      // Substituir os chunks de áudio pelo novo Blob
      audioChunksRef.current = [audioBlob];

      // Iniciar a transcrição do áudio importado
      setIsTranscribing(true);
      transcribeAudio();

      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao processar arquivo de áudio importado:", error);
      onNotification({
        type: "error",
        message:
          "Erro ao processar o arquivo de áudio. Tente novamente com outro arquivo.",
      });
    }
  };

  // Função para ativar o input de arquivo quando o botão for clicado
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Função para iniciar gravação de áudio
  const startRecording = async () => {
    try {
      // Reset the recognition flag when starting a new recording
      isRecognitionStarted = false;

      // Verificar se o navegador suporta a API de reconhecimento de fala
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        onNotification({
          type: "error",
          message:
            "Seu navegador não suporta reconhecimento de fala. Use Chrome ou Edge para esta funcionalidade.",
        });
        return;
      }

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
        // Fallback para configuração padrão se as opções não forem suportadas
        console.log(
          "Configuração avançada de áudio não suportada, usando padrão"
        );
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Adicionar eventos
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(
            `Chunk de áudio capturado: ${(event.data.size / 1024).toFixed(
              2
            )} KB`
          );
        }
      }; // Como estamos utilizando start com parâmetro, vamos definir o event listener
      // antes de iniciar e também garantir que os dados sejam capturados no stop
      mediaRecorder.onstop = () => {
        // Não chamamos requestData() aqui porque o MediaRecorder já está inativo
        // quando o evento onstop é disparado
        setTimeout(() => {
          transcribeAudio();
        }, 300); // Um atraso maior para garantir que todos os dados foram processados
      };

      // Configurar para solicitar dados a cada 100ms para melhor qualidade
      mediaRecorder.start(100);
      setIsRecording(true);

      // Iniciar a detecção de voz para parar automaticamente quando o usuário ficar em silêncio
      setTimeout(() => {
        detectVoiceActivity();
      }, 500);

      // Configurar o timeout máximo de gravação
      setMaxRecordingTimeout();

      // Feedback visual/auditivo para indicar início da gravação
      const beep = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQufDmlUEBAUit//W5Yi0aDUSj/vC0ZjMiEz6W+uuvaD0vFjaG89+rbFVEHyp66M+lbGBXJx9u3cWfaGRbKRtn1b+apF9WLBpizLmXoGBVLhhgx7WVnWBVLxpiwLGSmF1TMRxgvq6Pl1tTMx1fur2OllhQNCBes6qLkFhONyReqKOIjVdMOyderqeFiFRJPSpeqKKDhVFGQCtfpZ6BglBEQyxgo5x+f05CRy5hnpp8fUxASjBhmJd6ekpATTFik5R4eUdATjNkj5F2d0U9UDVmjI90dUI8UjdnhnxvcD46UzlofHZpbjs4VDxqd3Fkazg2Vj5sc25gZzUzV0JvbmxcYjIxWERyaGhXXC8vWkZzZGVRVi0tXEhzYGFLUCsrXkp0XF1FTCkpX0x2WFg/RicoYE52VFQ5QSQmYVB3T083PCEjYlJ6Sks0NR4hY1N8R0YwMBofZFR+REErKxceZVWARz8nJhMcZlaCSjwjIRAaZ1iGTDgfHA0ZaFmKTjUbFwoXaVqOUTEXEgcValtQUy0TEQQTbF1XVCkPDwIQbWBdViYLDQAOb2JhWCMGCQALcWdmWh8CBQAI"
      );
      beep.play().catch((error) => {
        console.log("Não foi possível reproduzir o som de início:", error);
      });

      console.log("Gravação iniciada. Fale o nome do produto...");
      onNotification({
        type: "success",
        message: "Gravando... Fale o nome do produto.",
      });
      setMaxRecordingTimeout(); // Configura o timeout máximo de gravação
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      onNotification({
        type: "error",
        message:
          "Não foi possível acessar o microfone. Verifique as permissões.",
      });
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Limpar o timeout de gravação máxima
      if (maxRecordingTimeoutRef.current) {
        clearTimeout(maxRecordingTimeoutRef.current);
        maxRecordingTimeoutRef.current = null;
      }

      // Damos um feedback auditivo para indicar que terminou a gravação
      const beep = new Audio(
        "data:audio/wav;base64,UklGRnYEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoEAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQufDmlUEBAbOz1dWvj3VmSzo2PmV/pcTdyJ5zbWv/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAABAAAAAAABAAAAAAAAAQAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQAAAAEAAAAAAAABAAAAAAAAAQAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABAAAAAAAAAQAAAAEAAAEAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAEAAAEAAAABAAABAAAAAQAAAAIAAAABAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAABAAAAAQAAAQAAAQEAAQABAAAAAQAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMCAAAAAQACAAAAAAEAAQAAAAABAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAACAAABAAABAAAAAAEAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAEAAAABAAAAAAEAAAAMAAAA"
      );
      beep.play().catch(() => {
        console.log("Não foi possível reproduzir o som de fim");
      }); // Importante: Primeiro atualizamos os estados ANTES de parar o MediaRecorder
      setIsRecording(false);
      setIsTranscribing(true);
      setTranscribeProgress(0);
      console.log("Gravação finalizada, iniciando processamento de áudio...");
      onNotification({
        type: "success",
        message: "Processando áudio...",
      });

      try {
        // Importante: Forçar a captura de dados antes de parar o MediaRecorder
        // Só chamar se o estado ainda for "recording" para evitar erros
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      } catch (error) {
        console.log("Erro ao solicitar dados finais:", error);
      }

      // Pequena pausa antes de parar a gravação para garantir que o requestData seja processado
      setTimeout(() => {
        try {
          // Apenas então paramos a gravação
          // O evento onstop do MediaRecorder vai cuidar de chamar transcribeAudio
          console.log(
            "Parando MediaRecorder e solicitando captura final dos dados..."
          );
          mediaRecorderRef.current?.stop();
        } catch (error) {
          console.error("Erro ao parar o MediaRecorder:", error);
          // Em caso de erro, tentar chamar a transcrição diretamente
          transcribeAudio();
        }
      }, 50);
    }
  };

  // Função para transcrever áudio usando Web Speech API
  const transcribeAudio = async () => {
    // Iniciar a simulação de progresso
    startProgressSimulation();
    console.log("Iniciando transcrição de áudio...");

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

      // Criar o blob de áudio a partir dos chunks capturados
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      console.log(`Áudio capturado: ${(audioBlob.size / 1024).toFixed(2)} KB`);

      // Se o tamanho do áudio for muito pequeno, pode não haver fala detectável
      const isAudioTooSmall = audioBlob.size < 1024; // menos de 1KB
      if (isAudioTooSmall) {
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
      } // Tentar transcrever usando a Web Speech API
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Reset the recognition started flag when creating a new recognition instance
      // Reset the global recognition started flag
      isRecognitionStarted = false;

      // Configurações da API de reconhecimento
      recognition.lang = "pt-BR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3; // Aumentar alternativas para melhorar chances de reconhecimento
      recognition.continuous = false; // Usar File API para fazer uma solução alternativa quando a Web Speech API falhar
      if (audioBlob.size > 1024) {
        // Se tiver áudio suficiente
        // Criar um URL para reproduzir o áudio para a API (isso pode melhorar a captura)
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);

        // Vamos usar uma abordagem onde reproduzimos o áudio para a API ouvir
        // Isso pode contornar problemas em alguns navegadores
        audio.addEventListener("canplaythrough", () => {
          // Iniciar reconhecimento antes de reproduzir o áudio,
          // mas apenas se ainda não tiver sido iniciado
          try {
            startRecognitionSafely(recognition);
          } catch (error) {
            console.error("Erro ao iniciar reconhecimento:", error);
            // Continuar com a reprodução do áudio mesmo se falhar o reconhecimento
          }

          // Pequeno atraso para sincronizar
          setTimeout(() => {
            audio
              .play()
              .catch((e) => console.error("Erro ao reproduzir áudio:", e));
          }, 100);

          // Limpar URL quando terminar
          audio.onended = () => {
            URL.revokeObjectURL(audioURL);
          };
        });
      } else {
        // Se o áudio for pequeno demais, tente reconhecimento direto
        try {
          startRecognitionSafely(recognition);
        } catch (error) {
          console.error(
            "Erro ao iniciar reconhecimento para áudio pequeno:",
            error
          );
          // Se falhar, podemos avançar para a próxima etapa
          completeProgress();
          setIsTranscribing(false);
          onNotification({
            type: "error",
            message:
              "Erro ao processar áudio. Tente novamente ou digite sua busca.",
          });
          return;
        }
      }

      console.log("Configuração da API de reconhecimento:", {
        lang: recognition.lang,
        interimResults: recognition.interimResults,
        maxAlternatives: recognition.maxAlternatives,
        continuous: recognition.continuous,
      });
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Registrar informações detalhadas dos resultados para diagnóstico
        console.log("Evento onresult recebido:", {
          resultIndex: event.resultIndex,
          hasResults:
            !!event.results && !!event.results[0] && !!event.results[0][0],
          confidence: event.results[0] ? event.results[0][0].confidence : "N/A",
        });

        // Completar o progresso para 100%
        completeProgress();

        const transcript = event.results[0][0].transcript;
        console.log(`Transcrição concluída: "${transcript}"`);

        // Passar o texto transcrito para o componente pai
        onTranscription(transcript);

        setIsTranscribing(false);
        onNotification({
          type: "success",
          message: `Transcrição: "${transcript}"`,
        });
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error(`Erro no reconhecimento de fala: ${event.error}`);

        // Se for erro de "no-speech", tentar uma solução alternativa
        if (
          (event.error === "no-speech" || event.error === "aborted") &&
          audioBlob.size > 1024
        ) {
          console.log(
            `Erro ${event.error} detectado, tentando solução alternativa`
          );

          // Pequena pausa antes de tentar novamente
          setTimeout(() => {
            try {
              // Implementar uma abordagem alternativa para o reconhecimento
              const audioURL = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioURL);

              // Criar uma nova instância do reconhecedor com configurações diferentes
              const altRecognition = new (window.SpeechRecognition ||
                window.webkitSpeechRecognition)();
              altRecognition.lang = "pt-BR";
              altRecognition.interimResults = false;
              altRecognition.maxAlternatives = 5; // Aumentar ainda mais as alternativas
              altRecognition.continuous = true; // Modo contínuo para tentar pegar qualquer fala

              let hasResult = false;

              altRecognition.onresult = (e: SpeechRecognitionEvent) => {
                hasResult = true;
                // Completar o progresso para 100%
                completeProgress();

                const transcript = e.results[0][0].transcript;
                console.log(
                  `Transcrição alternativa bem-sucedida: "${transcript}"`
                );

                // Passar o texto transcrito para o componente pai
                onTranscription(transcript);

                setIsTranscribing(false);
                onNotification({
                  type: "success",
                  message: `Transcrição: "${transcript}"`,
                });

                // Limpar recursos
                URL.revokeObjectURL(audioURL);
              };

              altRecognition.onerror = (e: SpeechRecognitionErrorEvent) => {
                if (!hasResult) {
                  console.error(
                    "Erro na abordagem alternativa de reconhecimento:",
                    e.error
                  );
                  completeProgress();
                  setIsTranscribing(false);
                  onNotification({
                    type: "error",
                    message:
                      "Não foi possível reconhecer sua fala. Tente novamente ou digite sua busca.",
                  });
                }
                // Limpar recursos
                URL.revokeObjectURL(audioURL);
              };

              altRecognition.onend = () => {
                if (!hasResult) {
                  completeProgress();
                  setIsTranscribing(false);
                  onNotification({
                    type: "error",
                    message:
                      "Não foi possível reconhecer sua fala. Tente falar mais claramente ou digite sua busca.",
                  });
                }
                // Limpar recursos
                URL.revokeObjectURL(audioURL);
              }; // Iniciar o reconhecimento
              isRecognitionStarted = false; // Reset the flag for the alternative recognition
              startRecognitionSafely(altRecognition);

              // Reproduzir o áudio após um pequeno atraso
              setTimeout(() => {
                audio.play().catch((playError) => {
                  console.error(
                    "Erro ao reproduzir áudio para reconhecimento alternativo:",
                    playError
                  );
                });
              }, 500);

              // Definir um tempo limite para o reconhecimento alternativo
              setTimeout(() => {
                if (!hasResult) {
                  altRecognition.stop();
                  URL.revokeObjectURL(audioURL);
                }
              }, 7000);
            } catch (setupError) {
              console.error(
                "Erro ao configurar reconhecimento alternativo:",
                setupError
              );
              completeProgress();
              setIsTranscribing(false);
              onNotification({
                type: "error",
                message:
                  "Ocorreu um erro ao processar o áudio. Tente novamente.",
              });
            }
          }, 500); // Esperar meio segundo antes de tentar novamente

          return;
        }

        // Para outros erros, continua com o comportamento padrão
        // Parar o simulador de progresso em caso de erro
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Completar o progresso para 100% mesmo em caso de erro
        completeProgress();
        setIsTranscribing(false);

        // Mensagens personalizadas para diferentes tipos de erro
        let errorMessage = "Erro ao transcrever o áudio. Tente novamente.";

        if (event.error === "no-speech") {
          errorMessage =
            "Nenhuma fala detectada. Verifique se o microfone está funcionando e tente falar mais alto.";
        } else if (event.error === "audio-capture") {
          errorMessage =
            "Não foi possível capturar áudio. Verifique se o microfone está conectado e funcionando.";
        } else if (event.error === "not-allowed") {
          errorMessage =
            "Permissão para usar o microfone negada. Verifique as configurações do seu navegador.";
        } else if (event.error === "network") {
          errorMessage =
            "Erro de rede ao processar o áudio. Verifique sua conexão com a internet.";
        } else if (event.error === "aborted") {
          errorMessage = "Reconhecimento de fala interrompido.";
        }

        onNotification({
          type: "error",
          message: errorMessage,
        });
      };
      recognition.onend = () => {
        console.log(
          "Evento onend recebido - Reconhecimento de fala finalizado"
        );

        // Se a transcrição terminou sem resultado nem erro, consideramos como não tendo reconhecido o áudio
        if (isTranscribing) {
          console.log(
            "Reconhecimento finalizado sem resultados ou erros explícitos"
          );
          completeProgress();
          setIsTranscribing(false);

          // Tentar verificar o nível de áudio para diagnóstico
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
              analyser.getByteFrequencyData(dataArray);

              // Calcular o nível médio de áudio
              const average =
                dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
              console.log(`Diagnóstico de áudio - Nível médio: ${average}`);

              // Limpar recursos
              setTimeout(() => {
                microphone.disconnect();
                stream.getTracks().forEach((track) => track.stop());
                audioContext.close();
              }, 500);

              if (average < 10) {
                onNotification({
                  type: "error",
                  message:
                    "Não foi detectado áudio suficiente. Verifique se seu microfone está funcionando e fale mais alto.",
                });
              } else {
                onNotification({
                  type: "error",
                  message:
                    "Não foi possível reconhecer o áudio. Tente falar mais claramente ou verificar a configuração de idioma do navegador.",
                });
              }
            })
            .catch((err) => {
              console.error("Erro no diagnóstico de áudio:", err);
              onNotification({
                type: "error",
                message:
                  "Não foi possível reconhecer o áudio. Tente falar mais claramente ou mais perto do microfone.",
              });
            });
        }
      }; // Iniciar o reconhecimento de fala
      try {
        startRecognitionSafely(recognition);
      } catch (error) {
        console.error("Error starting recognition:", error);
        // If failed, try to recover
        completeProgress();
        setIsTranscribing(false);
        onNotification({
          type: "error",
          message: "Erro ao iniciar reconhecimento. Tente novamente.",
        });
        return;
      }

      // Configuramos um timer de segurança adicional para fechar o reconhecimento
      // caso demore muito (complementando o timeout já existente)
      setTimeout(() => {
        if (isTranscribing) {
          console.log("Forçando o término do reconhecimento após timeout");
          recognition.stop();
        }
      }, 8000); // 8 segundos é tempo suficiente para a maioria dos casos
    } catch (error) {
      console.error("Erro ao iniciar reconhecimento de fala:", error);
      // Fornecer mais detalhes sobre o erro para diagnóstico
      console.log("Detalhes do erro:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack available",
      });

      // Parar o simulador de progresso em caso de erro
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Completar o progresso mesmo em caso de erro
      completeProgress();
      setIsTranscribing(false);
      onNotification({
        type: "error",
        message: `Erro ao processar áudio: ${
          error instanceof Error ? error.message : String(error)
        }. Tente digitar sua busca.`,
      });
    }
  };

  // Função para testar se o microfone está funcionando corretamente
  const testMicrophone = async () => {
    try {
      // Limpar notificações anteriores
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
          // Limiar de detecção pode precisar de ajuste
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
    } catch (error) {
      console.error("Erro ao testar microfone:", error);
      onNotification({
        type: "error",
        message:
          "Não foi possível acessar o microfone para teste. Verifique as permissões do navegador.",
      });
    }
  };

  // Função para detectar quando o usuário parou de falar (Voice Activity Detection)
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
      .catch((error) => {
        console.error("Erro ao monitorar nível de áudio:", error);
      });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importAudioFile}
        accept="audio/*"
        className="hidden"
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
      <div className={showMicTest ? "border-l border-gray-300" : ""}>
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
    </div>
  );
};

export default AudioTranscriberWithImport;
