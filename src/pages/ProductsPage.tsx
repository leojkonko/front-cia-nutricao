import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiPencil,
  HiTrash,
  HiSearch,
  HiPlus,
  HiInformationCircle,
} from "react-icons/hi";
import Notification from "../components/Notification";

// URL base da API a partir das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface para representar um produto
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  promotion?: string;
  imageUrl?: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Estado para notificações
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    fetchProducts();

    // Verificar se há mensagem de estado na navegação
    if (location.state?.message) {
      setNotification({
        message: location.state.message,
        type: "success",
      });

      // Limpar o estado da localização
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Buscar produtos da API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Erro ao buscar produtos");
      }

      setProducts(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao buscar produtos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fechar notificação
  const closeNotification = () => {
    setNotification(null);
  };

  // Filtrar produtos pelo termo de busca
  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Formatar preço para exibição
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <Link
          to="/products/create"
          className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-800 focus:outline-none focus:border-green-800 focus:ring focus:ring-green-300 disabled:opacity-25 transition"
        >
          <HiPlus className="mr-2 h-5 w-5" />
          Novo Produto
        </Link>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <HiInformationCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-semibold mb-2">
              Nenhum produto encontrado
            </p>
            <p>
              {searchTerm
                ? "Tente usar termos diferentes na busca"
                : "Comece adicionando produtos ao catálogo"}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Produto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Preço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Promoção
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.imageUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.imageUrl}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://via.placeholder.com/40?text=";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/products/${product.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-green-600"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.category || "Sem categoria"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.promotion || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-gray-500 hover:text-gray-700"
                          title="Ver detalhes"
                        >
                          <HiInformationCircle className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <HiPencil className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            /* Implementar lógica para excluir produto */
                            alert(
                              `Excluir produto ${product.id} não implementado`
                            );
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
