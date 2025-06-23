import React, { useState, useCallback } from "react";
import SimpleAudioTranscriber from "../components/SimpleAudioTranscriber";

interface Notification {
  type: "success" | "error";
  message: string;
}

const TranscriptionDemo: React.FC = () => {
  const [transcription, setTranscription] = useState("");
  const [status, setStatus] = useState({
    isRecording: false,
    isTranscribing: false,
    progress: 0,
  });
  const [notification, setNotification] = useState<Notification | null>(null);

  // Função para lidar com a transcrição (memoizada para evitar recriações desnecessárias)
  const handleTranscription = useCallback((text: string) => {
    setTranscription(text);
  }, []);

  // Função para lidar com notificações (memoizada para evitar recriações desnecessárias)
  const handleNotification = useCallback((notification: Notification) => {
    setNotification(notification);

    // Limpar a notificação após 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  }, []);

  // Função para lidar com mudanças de status (memoizada para evitar recriações desnecessárias)
  const handleStatusChange = useCallback(
    (newStatus: {
      isRecording: boolean;
      isTranscribing: boolean;
      progress: number;
    }) => {
      setStatus(newStatus);
    },
    []
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Exemplo de Transcrição com AssemblyAI
      </h1>

      {/* Componente de transcrição */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Transcrição de Áudio</h2>{" "}
        <p className="text-gray-600 mb-4">
          Grave sua voz ou importe um arquivo de áudio para testar a transcrição
          usando a API da AssemblyAI.
        </p>{" "}
        <SimpleAudioTranscriber
          onTranscription={handleTranscription}
          onStatusChange={handleStatusChange}
          onNotification={handleNotification}
          allowFileUpload={true}
          showMicTest={true}
        />
      </div>

      {/* Status atual */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p>
            <span className="font-medium">Gravando:</span>{" "}
            <span
              className={status.isRecording ? "text-red-600" : "text-gray-600"}
            >
              {status.isRecording ? "Sim" : "Não"}
            </span>
          </p>
          <p>
            <span className="font-medium">Transcrevendo:</span>{" "}
            <span
              className={
                status.isTranscribing ? "text-blue-600" : "text-gray-600"
              }
            >
              {status.isTranscribing ? "Sim" : "Não"}
            </span>
          </p>
          <p>
            <span className="font-medium">Progresso:</span>{" "}
            <span className="text-gray-600">{status.progress}%</span>
          </p>
        </div>
      </div>

      {/* Resultado da transcrição */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Resultado da Transcrição</h2>
        <div className="bg-white border border-gray-300 p-4 rounded-md min-h-[100px]">
          {transcription ? (
            <p className="text-gray-800">{transcription}</p>
          ) : (
            <p className="text-gray-400 italic">
              A transcrição aparecerá aqui quando estiver disponível...
            </p>
          )}
        </div>
      </div>

      {/* Notificação */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg max-w-md ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Informações sobre a AssemblyAI */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Sobre a AssemblyAI</h2>
        <p className="text-gray-700 mb-2">
          Estamos usando a AssemblyAI como serviço de transcrição de áudio
          porque oferece:
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Melhor precisão de reconhecimento de fala</li>
          <li>Excelente suporte para português brasileiro</li>
          <li>Processamento rápido e confiável</li>
          <li>Funciona com qualquer navegador e dispositivo</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          Para mais informações sobre como configurar, consulte o arquivo{" "}
          <a href="#" className="text-blue-600 underline">
            AssemblyAI-Setup.md
          </a>{" "}
          na pasta docs.
        </p>
      </div>
    </div>
  );
};

export default TranscriptionDemo;
