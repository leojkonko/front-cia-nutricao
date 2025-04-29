import { Link } from "react-router-dom";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  promotion: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductItemProps {
  product: Product;
  onDelete: (id: string) => void;
}

const ProductItem = ({ product, onDelete }: ProductItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await onDelete(product.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmation(false);
  };

  return (
    <li className="hover:bg-gray-50 relative">
      {/* Modal de confirmação de exclusão */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-lg max-w-xs">
            <p className="text-sm text-gray-700 mb-4">
              Tem certeza que deseja excluir <strong>{product.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
                    Excluindo...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {product.imageUrl && (
              <div className="flex-shrink-0 h-12 w-12 mr-3 rounded-md overflow-hidden border border-gray-200">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-center object-cover"
                />
              </div>
            )}
            <div>
              <Link
                to={`/products/${product.id}`}
                className="text-sm font-medium text-green-600 truncate hover:underline"
              >
                {product.name}
              </Link>
              <p className="mt-1 flex items-center text-sm text-gray-500">
                <span className="truncate">{product.category}</span>
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex flex-col items-end">
            <p className="text-sm font-medium text-gray-900">
              R$ {product.price.toFixed(2)}
            </p>
            {product.promotion && (
              <p className="mt-1 text-xs text-green-500">{product.promotion}</p>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p className="truncate">{product.description}</p>
        </div>

        {/* Botões de ação */}
        <div className="mt-3 flex justify-end space-x-2">
          <Link
            to={`/products/edit/${product.id}`}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </Link>
          <button
            onClick={handleDeleteClick}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </li>
  );
};

export default ProductItem;
