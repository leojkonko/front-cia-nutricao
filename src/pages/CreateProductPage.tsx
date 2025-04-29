import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Notification from "../components/Notification";
import LoadingOverlay from "../components/products/LoadingOverlay";
import ProductForm, {
  ProductFormData,
} from "../components/products/ProductForm";

// URL base da API a partir das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [fromAI, setFromAI] = useState(false);

  // Estado para notificações
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Verificar se há dados pré-preenchidos da busca por IA
  useEffect(() => {
    console.log("Location state:", location.state);

    if (location.state && location.state.prefilledData) {
      console.log("Dados pré-preenchidos:", location.state.prefilledData);

      // Garantir que todos os campos necessários estejam presentes
      const prefilledData: ProductFormData = {
        name: location.state.prefilledData.name || "",
        category: location.state.prefilledData.category || "",
        description: location.state.prefilledData.description || "",
        price: location.state.prefilledData.price || "",
        promotion: location.state.prefilledData.promotion || "",
        imageUrl: location.state.prefilledData.imageUrl || "",
      };

      setInitialData(prefilledData);
      setFromAI(location.state.fromAI || false);

      // Se vier da busca por IA, mostrar uma notificação
      if (location.state.fromAI) {
        setNotification({
          type: "success",
          message:
            "Dados da busca por IA carregados. Complete as informações necessárias para criar o produto.",
        });
      }
    }
  }, [location]);

  // Fechar notificação automaticamente após 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      // Limpar o timer quando o componente desmontar ou quando a notificação mudar
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Manipular envio do formulário
  const handleSubmit = async (formData: ProductFormData) => {
    console.log("Dados a serem enviados:", formData);
    setIsSubmitting(true);
    setNotification(null);

    // Exibir mensagem de carregamento
    setNotification({
      type: "success",
      message: "Enviando dados, aguarde um momento...",
    });

    try {
      console.log("Iniciando requisição para a API...");
      console.log("URL da API:", `${API_BASE_URL}/products`);

      // Preparar dados para envio à API
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price.replace(",", ".")),
        promotion: formData.promotion,
        imageUrl: formData.imageUrl,
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      console.log("Resposta da API:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API:", errorData);
        throw new Error(errorData.message || "Erro ao criar o produto");
      }

      // Produto criado com sucesso
      await response.json(); // Consumir o corpo da resposta
      console.log("Produto criado com sucesso!");

      // Exibir notificação de sucesso
      setNotification({
        type: "success",
        message: "Produto criado com sucesso!",
      });

      // Aguardar 3 segundos antes de redirecionar
      setTimeout(() => {
        navigate("/products", {
          state: { message: "Produto criado com sucesso!" },
        });
      }, 3000);
    } catch (error) {
      console.error("Erro durante a criação do produto:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao criar o produto",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <LoadingOverlay
        isVisible={isSubmitting}
        message="Estamos criando seu produto. Por favor, aguarde um momento."
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Cabeçalho com estilo melhorado */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            {fromAI ? "Criar Produto com IA" : "Criar Novo Produto"}
          </h1>
          <p className="mt-1 text-sm text-green-100">
            {fromAI
              ? "Complete as informações do produto com base nos dados obtidos pela Inteligência Artificial"
              : "Preencha os dados abaixo para adicionar um novo produto ao catálogo da Cia da Nutrição."}
          </p>
        </div>

        <ProductForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialData={initialData || undefined}
        />
      </div>
    </div>
  );
};

export default CreateProductPage;
