import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number; // Valor de progresso de 0 a 100
  showProgress?: boolean; // Controle de exibição da barra de progresso
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Estamos criando seu produto. Por favor, aguarde um momento.",
  progress = 0,
  showProgress = false,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo com opacidade */}
      <div className="absolute inset-0 bg-gray-900 opacity-60"></div>

      {/* Conteúdo central com opacidade 100% */}
      <div className="relative bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-auto">
        <div className="inline-block animate-spin h-16 w-16 border-8 border-green-500 border-t-transparent rounded-full mb-4"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Processando...</h3>
        <p className="text-gray-600 mb-3">{message}</p>

        {showProgress && (
          <div className="w-full mt-4">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{progress}% concluído</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
