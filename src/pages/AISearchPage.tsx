import { useState, useCallback } from "react";
import {
  HiSearch,
  HiInformationCircle,
  HiCheckCircle,
  HiExclamation,
} from "react-icons/hi";
import Notification from "../components/Notification";
import LoadingOverlay from "../components/products/LoadingOverlay";
import { BasicAudioTranscriberNew as BasicAudioTranscriber } from "../components/BasicAudioTranscriberNew";

// URL do webhook para busca de produtos
const AI_SEARCH_URL = import.meta.env.VITE_AI_SEARCH_URL;

interface AISearchResult {
  benefits: string[];
  contraindications: string[];
  origin: string;
  purpose: string;
}

interface NotificationType {
  type: "success" | "error";
  message: string;
}

const AISearchPage = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<AISearchResult | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Estados para controle de status de gravação
  const [transcribeStatus, setTranscribeStatus] = useState({
    isRecording: false,
    isTranscribing: false,
    progress: 0,
  });

  // Função para realizar a busca
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setNotification({
        type: "error",
        message: "Por favor, digite o nome de um produto para buscar.",
      });
      return;
    }

    setIsLoading(true);
    setSearchResult(null);
    setNotification(null);

    try {
      // Fazer requisição POST com productName no payload
      const response = await fetch(AI_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          productName: query.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Falha ao buscar informações sobre o produto"
        );
      }

      console.log("Resposta da API:", data);
      setSearchResult(data.message);
      setNotification({
        type: "success",
        message: `Informações encontradas para "${query}"`,
      });
    } catch (error) {
      console.error("Erro durante a busca IA:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao buscar informações sobre o produto",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para receber o texto transcrito (memoizado para evitar recriações desnecessárias)
  const handleTranscription = useCallback((text: string) => {
    setQuery(text);
  }, []);

  // Handler para atualizar o status da transcrição (memoizado para evitar recriações desnecessárias)
  const handleStatusChange = useCallback(
    (status: {
      isRecording: boolean;
      isTranscribing: boolean;
      progress: number;
    }) => {
      setTranscribeStatus(status);
    },
    []
  );

  // Handler para lidar com notificações (memoizado para evitar recriações desnecessárias)
  const handleNotification = useCallback((notif: NotificationType) => {
    setNotification(notif);
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <LoadingOverlay
        isVisible={isLoading || transcribeStatus.isTranscribing}
        message={
          transcribeStatus.isTranscribing
            ? "Convertendo áudio para texto..."
            : "Nossa IA está analisando o produto. Por favor, aguarde..."
        }
        progress={transcribeStatus.progress}
        showProgress={transcribeStatus.isTranscribing}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Busca Inteligente</h1>
          <p className="mt-1 text-sm text-green-100">
            Use nossa Inteligência Artificial para obter informações detalhadas
            sobre produtos nutricionais
          </p>
        </div>

        <div className="p-6">
          {/* Instruções */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
              <HiInformationCircle className="h-5 w-5 mr-2" /> Como funciona a
              busca inteligente
            </h2>
            <p className="text-sm text-blue-700 mb-2">
              Nossa Inteligência Artificial fornece informações detalhadas sobre
              produtos nutricionais, incluindo:
            </p>
            <ul className="list-disc pl-6 text-sm text-blue-700 space-y-1 mb-2">
              <li>Benefícios para saúde e bem-estar</li>
              <li>Possíveis contraindicações</li>
              <li>Origem do produto</li>
              <li>Finalidade e usos recomendados</li>
            </ul>
            <p className="text-sm text-blue-700 mt-2 pt-2 border-t border-blue-100">
              <strong>Dica:</strong> Você pode usar o botão de microfone para
              realizar a busca por voz. Recomendamos testar seu microfone antes
              de fazer a pesquisa. Se ocorrer algum problema, verifique se seu
              navegador (Chrome ou Edge recomendados) tem permissão para acessar
              o microfone.
            </p>
          </div>

          {/* Formulário de busca com botão de gravação */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
              <div className="pl-4">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome de um produto (ex: Whey Protein, Creatina, Chá de Boldo...)"
                className="flex-grow px-4 py-3 focus:outline-none text-gray-600"
              />

              {/* Componente de transcrição de áudio */}
              <BasicAudioTranscriber
                onTranscription={handleTranscription}
                onStatusChange={handleStatusChange}
                onNotification={handleNotification}
                disabled={isLoading}
              />

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 focus:outline-none"
                disabled={
                  isLoading ||
                  transcribeStatus.isRecording ||
                  transcribeStatus.isTranscribing
                }
              >
                {isLoading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>

          {/* Resultados da busca */}
          {searchResult && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-green-50 border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-green-800">
                  Informações sobre {query}
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Benefícios */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-3 flex items-center">
                    <HiCheckCircle className="h-5 w-5 mr-2 text-green-700" />
                    Benefícios
                  </h3>
                  <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                    {searchResult.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                {/* Contraindicações */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center">
                    <HiExclamation className="h-5 w-5 mr-2 text-red-700" />
                    Contraindicações
                  </h3>
                  <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                    {searchResult.contraindications.map(
                      (contraindication, index) => (
                        <li key={index}>{contraindication}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* Origem */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-3">
                    Origem
                  </h3>
                  <p className="text-sm text-gray-700">{searchResult.origin}</p>
                </div>

                {/* Finalidade */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <h3 className="text-lg font-medium text-yellow-800 mb-3">
                    Finalidade
                  </h3>
                  <p className="text-sm text-gray-700">
                    {searchResult.purpose}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  Informações geradas por Inteligência Artificial. Consulte um
                  profissional da saúde antes de tomar decisões baseadas nestas
                  informações.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISearchPage;
