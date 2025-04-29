import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Notification from "../components/Notification";
import LoadingOverlay from "../components/products/LoadingOverlay";
import ProductForm, {
  ProductFormData,
} from "../components/products/ProductForm";

// URL base da API a partir das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<ProductFormData | null>(null);

  // Estado para notificações
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // Carregar dados do produto ao montar o componente
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);

        if (!response.ok) {
          throw new Error(`Erro ao buscar produto: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.data) {
          throw new Error(data.message || "Erro ao buscar dados do produto");
        }

        // Converter o formato dos dados da API para o formato do formulário
        const product = data.data;
        setProductData({
          name: product.name || "",
          category: product.category || "",
          description: product.description || "",
          // Formatar preço como string para o formulário
          price: product.price?.toString().replace(".", ",") || "",
          promotion: product.promotion || "",
          imageUrl: product.imageUrl || "",
        });
      } catch (error) {
        console.error("Erro ao buscar dados do produto:", error);
        setNotification({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Erro ao buscar dados do produto",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    } else {
      // Se não houver ID, redireciona para a lista de produtos
      navigate("/products");
    }
  }, [id, navigate]);

  // Manipular envio do formulário
  const handleSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setNotification(null);

    // Exibir mensagem de carregamento
    setNotification({
      type: "success",
      message: "Atualizando produto, aguarde um momento...",
    });

    try {
      // Preparar dados para envio à API
      const productPayload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price.replace(",", ".")),
        promotion: formData.promotion,
        imageUrl: formData.imageUrl,
      };

      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar o produto");
      }

      // Produto atualizado com sucesso
      await response.json(); // Consumir o corpo da resposta

      // Exibir notificação de sucesso
      setNotification({
        type: "success",
        message: "Produto atualizado com sucesso!",
      });

      // Manter o estado de submissão como true para o loader continuar visível
      // O loader só será removido após o redirecionamento

      // Aguardar 3 segundos antes de redirecionar (dando tempo para o usuário ver o feedback)
      setTimeout(() => {
        navigate("/products", {
          state: { message: "Produto atualizado com sucesso!" },
        });
      }, 3000);
    } catch (error) {
      console.error("Erro durante a atualização do produto:", error);

      // Exibir notificação de erro
      setNotification({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar o produto",
      });

      // Em caso de erro, remover o loader
      setIsSubmitting(false);
    }
    // Removido o setIsSubmitting(false) do bloco finally para manter o loader ativo até o redirecionamento
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {/* Overlay de carregamento em tela cheia */}
      {(isSubmitting || isLoading) && (
        <LoadingOverlay
          isVisible={true}
          message={
            isLoading
              ? "Carregando dados do produto..."
              : "Estamos atualizando o produto. Por favor, aguarde um momento."
          }
        />
      )}

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
          <h1 className="text-2xl font-bold text-white">Editar Produto</h1>
          <p className="mt-1 text-sm text-blue-100">
            Atualize as informações do produto no catálogo da Cia da Nutrição.
          </p>
        </div>

        {/* Exibir o formulário apenas quando os dados estiverem carregados */}
        {!isLoading && productData && (
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={productData}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  );
};

export default EditProductPage;
