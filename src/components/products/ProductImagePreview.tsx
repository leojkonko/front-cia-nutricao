import React from "react";
import { HiPhotograph } from "react-icons/hi";

interface ProductImagePreviewProps {
  imageUrl: string | null;
}

const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({
  imageUrl,
}) => {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-lg border border-gray-200">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Preview do produto"
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/300x300?text=Imagem+não+encontrada";
            e.currentTarget.alt = "Imagem não disponível";
          }}
        />
      ) : (
        <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <HiPhotograph className="h-16 w-16 mb-2" />
          <p className="text-sm">Sem imagem</p>
          <p className="text-xs mt-1">Adicione uma URL para ver o preview</p>
        </div>
      )}
    </div>
  );
};

export default ProductImagePreview;
