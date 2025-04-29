// Simple AssemblyAI Transcriber Component without imports
import React from "react";

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
const AssemblyAITranscriberComponent = (props: AudioTranscriberProps) => {
  // Declare a transcription function
  const handleTranscription = () => {
    // Send notification
    props.onNotification({
      type: "success",
      message: "Conversão de áudio para texto configurada com AssemblyAI",
    });

    // Update status
    props.onStatusChange({
      isRecording: false,
      isTranscribing: false,
      progress: 0,
    });

    // Send mock transcription
    props.onTranscription(
      "Simulação de transcrição de áudio usando AssemblyAI"
    );
  };

  return (
    <button
      onClick={handleTranscription}
      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
      disabled={props.disabled}
    >
      🎤 Falar
    </button>
  );
};

export default AssemblyAITranscriberComponent;
