import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiPencil,
  HiTag,
  HiCurrencyDollar,
  HiGift,
} from "react-icons/hi";
import Notification from "../components/Notification";
import LoadingOverlay from "../components/products/LoadingOverlay";

// URL base da API a partir das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  promotion: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
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

        setProduct(data.data);
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
      fetchProduct();
    }
  }, [id]);

  // Fechar notificação automaticamente após 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Formatar preço para exibição
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <LoadingOverlay
        isVisible={isLoading}
        message="Carregando detalhes do produto..."
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Links de navegação / Cabeçalho */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/products"
              className="inline-flex items-center text-white hover:text-green-100"
            >
              <HiArrowLeft className="mr-2 h-5 w-5" />
              Voltar para lista
            </Link>
            {product && (
              <Link
                to={`/products/edit/${id}`}
                className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-md text-white text-sm hover:bg-opacity-30"
              >
                <HiPencil className="mr-1 h-4 w-4" />
                Editar
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">
            {isLoading
              ? "Carregando..."
              : product?.name || "Detalhes do produto"}
          </h1>
        </div>

        {!isLoading && product && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Imagem do produto */}
              <div className="flex justify-center items-start">
                {product.imageUrl ? (
                  <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-auto max-h-96 object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x400?text=Imagem+não+disponível";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md h-64 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
                    <p className="text-gray-400">Sem imagem disponível</p>
                  </div>
                )}
              </div>

              {/* Informações do produto */}
              <div className="space-y-6">
                {/* Categoria */}
                <div className="flex items-center">
                  <HiTag className="h-5 w-5 text-green-600 mr-2" />
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {product.category || "Sem categoria"}
                  </span>
                </div>

                {/* Preço */}
                <div className="flex items-start">
                  <HiCurrencyDollar className="h-6 w-6 text-green-600 mr-2 mt-1" />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {formatPrice(product.price)}
                    </h2>
                    {product.promotion && (
                      <div className="mt-1 inline-flex items-center">
                        <HiGift className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-600 font-medium">
                          {product.promotion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {product.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Descrição
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Datas */}
                <div className="pt-4 mt-4 border-t border-gray-200 text-xs text-gray-500 grid grid-cols-2 gap-2">
                  <div>
                    <p>Criado em:</p>
                    <p>{new Date(product.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p>Atualizado em:</p>
                    <p>{new Date(product.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
