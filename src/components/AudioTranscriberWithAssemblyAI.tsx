// Assembly AI Transcriber Component using environment variable
import AssemblyAITranscriberComponent from "./AssemblyAITranscriberComponent";

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

// Componente de transcrição de áudio usando AssemblyAI (wrapper for backward compatibility)
function AudioTranscriberWithAssemblyAI(props: AudioTranscriberProps) {
  return <AssemblyAITranscriberComponent {...props} />;
}

// Export the component
export default AudioTranscriberWithAssemblyAI;
