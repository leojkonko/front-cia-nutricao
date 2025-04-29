import { Link } from "react-router-dom";
import { useState } from "react";
import ProductItem, { Product } from "./ProductItem";
import Notification from "../Notification";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  onProductDeleted?: (id: string) => void; // Callback opcional para quando um produto for excluído
}

const ProductList = ({
  products,
  isLoading,
  onProductDeleted,
}: ProductListProps) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Função para excluir um produto
  const handleDeleteProduct = async (id: string) => {
    try {
      // URL base da API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Enviar requisição DELETE para a API
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir o produto");
      }

      // Notificar usuário do sucesso
      setNotification({
        type: "success",
        message: "Produto excluído com sucesso!",
      });

      // Limpar notificação após 5 segundos
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      // Notificar o componente pai (se fornecido)
      if (onProductDeleted) {
        onProductDeleted(id);
      }
    } catch (error) {
      console.error("Erro ao excluir produto:", error);

      // Notificar usuário do erro
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao excluir o produto",
      });

      // Limpar notificação após 5 segundos
      setTimeout(() => {
        setNotification(null);
      }, 5000);

      throw error; // Re-throw para que o componente ProductItem possa lidar com o erro
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Carregando produtos...
        </h3>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-2 text-lg font-medium">Nenhum produto encontrado</p>
        <p className="mt-1">
          Tente refinar sua busca ou adicione um novo produto.
        </p>
        <div className="mt-6">
          <Link
            to="/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              className="h-4 w-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Adicionar Produto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ul className="divide-y divide-gray-200">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
