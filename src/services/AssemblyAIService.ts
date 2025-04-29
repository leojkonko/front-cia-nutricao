// Assembly AI Transcription Service Implementation
import { AssemblyAI } from 'assemblyai';
import { logEnvironmentVariableInfo } from '../utils/assemblyAIDebug';

// Constantes
const ENV_API_KEY = import.meta.env.VITE_ASSEMBLY_API_KEY; // Obter a chave da variável de ambiente

// Interface para o resultado da transcrição
export interface TranscriptionResult {
    text: string;
    confidence: number;
    success: boolean;
    error?: string;
}

// Classe para gerenciar a transcrição com AssemblyAI
export class AssemblyAITranscriber {
    private client: AssemblyAI;
    private apiKey: string;

    constructor(apiKey?: string) {
        // Usar apenas a chave do arquivo .env
        this.apiKey = apiKey || ENV_API_KEY || '';

        // Log detalhado para debug
        console.log('Chave API da AssemblyAI:', this.apiKey ? 'Configurada' : 'Não configurada');
        console.log('Variável de ambiente VITE_ASSEMBLY_API_KEY:', ENV_API_KEY ? 'Definida' : 'Não definida');

        // Log avançado para debug de ambiente
        logEnvironmentVariableInfo();

        if (!this.apiKey) {
            console.error('AVISO: Chave da API da AssemblyAI não encontrada no .env! Configure a variável VITE_ASSEMBLY_API_KEY.');
        }

        // Inicializar o cliente AssemblyAI
        this.client = new AssemblyAI({ apiKey: this.apiKey });
    }

    // Método para verificar se a chave da API está configurada
    public hasApiKey(): boolean {
        return !!this.apiKey;
    }

    // Método para transcrever um blob de áudio
    public async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
        try {
            // Verificar se temos uma chave da API válida
            if (!this.hasApiKey()) {
                console.error('Transcrição falhou: Chave de API não configurada');
                throw new Error('Chave da API da AssemblyAI não encontrada no arquivo .env. Configure a variável VITE_ASSEMBLY_API_KEY para usar essa funcionalidade.');
            }

            // Log de debug
            console.log(`Tamanho do áudio: ${(audioBlob.size / 1024).toFixed(2)} KB, tipo: ${audioBlob.type}`);

            // Converter Blob para File para upload
            const file = new File([audioBlob], 'audio.wav', { type: audioBlob.type });

            console.log('Iniciando transcrição com AssemblyAI...', {
                apiKeyLength: this.apiKey.length,
                fileSize: file.size,
                fileType: file.type
            });

            try {
                // Na versão 4.0.0 do SDK, passamos o arquivo diretamente
                const result = await this.client.transcripts.transcribe({
                    audio: file,
                    language_code: 'pt' // Código de idioma para Português
                });

                // Verificar se temos um resultado válido
                if (!result.text) {
                    console.error('Transcrição falhou: Resposta sem texto', result);
                    throw new Error('Não foi possível obter uma transcrição do áudio');
                }

                console.log('Transcrição concluída com sucesso:', result.text);

                // Retornar o resultado formatado
                return {
                    text: result.text,
                    confidence: result.confidence || 0,
                    success: true
                };
            } catch (apiError) {
                console.error('Erro na chamada da API AssemblyAI:', apiError);
                throw new Error(`Erro na API: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro na transcrição com AssemblyAI:', error);
            return {
                text: '',
                confidence: 0,
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido na transcrição'
            };
        }
    }
}

// Instância padrão para uso em toda a aplicação
export const assemblyAITranscriber = new AssemblyAITranscriber();
