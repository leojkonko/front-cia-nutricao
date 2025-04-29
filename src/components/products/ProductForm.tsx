import React, { useState, useEffect } from "react";
import ProductImagePreview from "./ProductImagePreview";
import {
  HiDocument,
  HiTag,
  HiCurrencyDollar,
  HiGift,
  HiPhotograph,
  HiDocumentText,
  HiExclamation,
} from "react-icons/hi";

// Interface para os erros do formulário
interface FormErrors {
  [key: string]: string;
}

// Interface para os dados do formulário
export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  promotion: string;
  imageUrl: string;
}

// Props do componente
interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: ProductFormData;
  isEditMode?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isEditMode,
}) => {
  // Estado do formulário com valores padrão
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    promotion: initialData?.promotion || "",
    imageUrl: initialData?.imageUrl || "",
  });

  // Atualizar o formulário quando initialData mudar
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        description: initialData.description || "",
        price: initialData.price || "",
        promotion: initialData.promotion || "",
        imageUrl: initialData.imageUrl || "",
      });
    }
  }, [initialData]);

  // Estado para validação
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado para preview da imagem
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Atualizar preview da imagem quando imageUrl mudar ou quando initialData for carregado
  useEffect(() => {
    if (formData.imageUrl?.trim()) {
      setPreviewImage(formData.imageUrl);
    } else {
      setPreviewImage(null);
    }
  }, [formData.imageUrl]);

  // Manipular mudanças nos campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpar erro do campo quando ele for modificado
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "O nome do produto é obrigatório";
    }

    if (!formData.category.trim()) {
      newErrors.category = "A categoria é obrigatória";
    }

    if (!formData.price.trim()) {
      newErrors.price = "O preço é obrigatório";
    } else if (
      isNaN(parseFloat(formData.price.replace(",", "."))) ||
      parseFloat(formData.price.replace(",", ".")) <= 0
    ) {
      newErrors.price = "Informe um preço válido";
    }

    return newErrors;
  };

  // Manipular envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulário enviado, validando...");

    // Validar formulário
    const formErrors = validateForm();
    console.log("Erros de validação:", formErrors);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Chamar função onSubmit passada como prop
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna da esquerda - Informações principais */}
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="text-lg font-medium text-green-800 mb-4 flex items-center">
              <HiDocument className="h-5 w-5 mr-2" />
              Informações Básicas
            </h2>

            {/* Nome do produto com ícone */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do produto *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiDocument className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 py-2 ${
                    errors.name ? "border-red-300 bg-red-50" : ""
                  }`}
                  placeholder="Ex: Whey Protein Concentrado"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <HiExclamation className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Categoria com ícone */}
            <div className="mb-4">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Categoria *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiTag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`pl-10 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 py-2 ${
                    errors.category ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Vitaminas">Vitaminas</option>
                  <option value="Proteínas">Proteínas</option>
                  <option value="Suplementos">Suplementos</option>
                  <option value="Minerais">Minerais</option>
                  <option value="Aminoácidos">Aminoácidos</option>
                  <option value="Outros">Outros</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <HiExclamation className="h-4 w-4 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Preço com ícone */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preço (R$) *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="price"
                  id="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`pl-10 pr-12 shadow-sm focus:ring-green-500 focus:border-green-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 py-2 ${
                    errors.price ? "border-red-300 bg-red-50" : ""
                  }`}
                  placeholder="0,00"
                  aria-describedby="price-currency"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <HiExclamation className="h-4 w-4 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Promoção com estilo de card */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <HiGift className="h-5 w-5 mr-2" />
              Ofertas e Promoções
            </h2>
            <div>
              <label
                htmlFor="promotion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Promoção (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiTag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="promotion"
                  id="promotion"
                  value={formData.promotion}
                  onChange={handleChange}
                  className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 py-2"
                  placeholder="Ex: Leve 2 por R$60,00"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">
                Deixe em branco se não houver promoção para este produto.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna da direita - Descrição e Imagem */}
        <div className="space-y-6">
          {/* Imagem do produto com preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <HiPhotograph className="h-5 w-5 mr-2" />
              Imagem do Produto
            </h2>
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL da imagem (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiPhotograph className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="pl-10 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 py-2"
                  placeholder="https://exemplo.com/imagens/produto.jpg"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">
                URL completa para a imagem do produto.
              </p>

              {/* Preview da imagem */}
              <div className="mt-4 flex justify-center">
                <ProductImagePreview imageUrl={previewImage} />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <HiDocumentText className="h-5 w-5 mr-2" />
              Descrição do Produto
            </h2>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full text-sm border-gray-300 rounded-md text-gray-900 p-2"
                placeholder="Descreva o produto, seus benefícios e indicações..."
              />
              <p className="mt-2 text-xs text-gray-500 italic">
                Uma boa descrição ajuda os funcionários a entender melhor o
                produto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          className="inline-flex items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEditMode
              ? "Salvando..."
              : "Criando..."
            : isEditMode
            ? "Editar Produto"
            : "Criar Produto"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
