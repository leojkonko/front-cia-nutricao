import { useState } from "react";
import Notification from "../components/Notification";
import LoadingOverlay from "../components/products/LoadingOverlay";
import {
  HiInformationCircle,
  HiDownload,
  HiUpload,
  HiCheckCircle,
} from "react-icons/hi";

const ImportProductsPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Manipular quando o arquivo for selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Verificar tipo de arquivo
    const fileType = selectedFile.type;
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
    ];

    if (!validTypes.includes(fileType) && !selectedFile.name.endsWith(".csv")) {
      setNotification({
        type: "error",
        message:
          "Formato de arquivo inválido. Por favor, envie um arquivo Excel (.xls, .xlsx) ou CSV.",
      });
      return;
    }

    setFile(selectedFile);

    // Aqui você pode adicionar um preview dos dados (mock para demonstração)
    if (selectedFile.name.endsWith(".csv") || fileType.includes("csv")) {
      // Simulando leitura de CSV para preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split("\n").filter((line) => line.trim());
          const headers = lines[0].split(",");

          const data = lines.slice(1, 6).map((line) => {
            const values = line.split(",");
            const obj: { [key: string]: string } = {};
            headers.forEach((header, i) => {
              obj[header.trim()] = values[i]?.trim() || "";
            });
            return obj;
          });

          setPreviewData(data);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Mock de dados para Excel (para demonstração)
      setPreviewData([
        { nome: "Whey Protein", categoria: "Proteínas", preco: "99,90" },
        { nome: "Creatina", categoria: "Suplementos", preco: "59,90" },
        { nome: "BCAA", categoria: "Aminoácidos", preco: "45,90" },
      ]);
    }
  };

  // Manipular o envio do arquivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setNotification({
        type: "error",
        message: "Por favor, selecione um arquivo para importar.",
      });
      return;
    }

    setIsLoading(true);

    // Simulando um upload e processamento de arquivo
    setTimeout(() => {
      setIsLoading(false);
      setNotification({
        type: "success",
        message:
          "Produtos importados com sucesso! 15 produtos foram adicionados ao catálogo.",
      });
      setFile(null);
      setPreviewData(null);

      // Resetar o input de arquivo
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <LoadingOverlay
        isVisible={isLoading}
        message="Importando produtos. Por favor, aguarde..."
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
          <h1 className="text-2xl font-bold text-white">Importar Produtos</h1>
          <p className="mt-1 text-sm text-green-100">
            Importe produtos em massa a partir de arquivos Excel ou CSV para o
            catálogo da Cia da Nutrição.
          </p>
        </div>

        <div className="p-6">
          {/* Instruções */}
          <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
              <HiInformationCircle className="h-5 w-5 mr-2" />
              Como funciona a importação
            </h2>
            <ul className="list-disc pl-6 text-sm text-blue-700 space-y-1">
              <li>
                Prepare uma planilha Excel (.xls, .xlsx) ou arquivo CSV com os
                dados dos produtos
              </li>
              <li>
                O arquivo deve conter as colunas: nome, categoria, descrição,
                preço, promoção (opcional) e imageUrl (opcional)
              </li>
              <li>
                Selecione o arquivo preparado e clique em "Importar Produtos"
              </li>
              <li>
                O sistema validará os dados e adicionará os produtos ao catálogo
              </li>
            </ul>

            <div className="mt-4">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <HiDownload className="h-4 w-4 mr-1" />
                Baixar modelo de planilha para importação
              </a>
            </div>
          </div>

          {/* Formulário de upload */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo para importação
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                    >
                      <span>Selecione um arquivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">Excel ou CSV até 10MB</p>
                </div>
              </div>

              {file && (
                <div className="mt-3 text-sm text-gray-500 flex items-center">
                  <HiCheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  Arquivo selecionado:{" "}
                  <span className="font-medium ml-1">{file.name}</span>
                </div>
              )}
            </div>

            {/* Preview dos dados */}
            {previewData && previewData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Pré-visualização dos dados
                </h3>
                <div className="border rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  Exibindo os primeiros 5 registros do arquivo. A importação
                  incluirá todos os registros válidos.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => {
                  setFile(null);
                  setPreviewData(null);
                  const fileInput = document.getElementById(
                    "file-upload"
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
              >
                Limpar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!file || isLoading}
              >
                {isLoading ? "Processando..." : "Importar Produtos"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportProductsPage;
