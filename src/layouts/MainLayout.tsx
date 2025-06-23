import { Outlet } from "react-router-dom";
import { HiQuestionMarkCircle } from "react-icons/hi";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-xl font-bold text-green-600 flex items-center">
                  <HiQuestionMarkCircle className="mr-2 h-6 w-6" />
                  Cia da Nutrição - Busca Inteligente
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 Cia da Nutrição - Sistema de Busca Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
