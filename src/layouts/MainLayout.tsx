import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HiHome,
  HiShoppingBag,
  HiDocumentAdd,
  HiCloudUpload,
  HiQuestionMarkCircle,
  HiUser,
  HiMenu,
  HiX,
} from "react-icons/hi";

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-green-600">
                  Cia da Nutrição
                  {/* <span className="ml-2 text-sm font-medium text-gray-500">
                    Sistema Interno
                  </span> */}
                </Link>
              </div>
            </div>

            {/* Desktop menu */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link
                to="/products"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActivePath("/products")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiShoppingBag className="mr-1 h-5 w-5" />
                Consulta de Produtos
              </Link>
              <Link
                to="/products/create"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActivePath("/products/create")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiDocumentAdd className="mr-1 h-5 w-5" />
                Criar Produto
              </Link>
              <Link
                to="/products/import"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActivePath("/products/import")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiCloudUpload className="mr-1 h-5 w-5" />
                Importar Produtos
              </Link>
              <Link
                to="/ai-search"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActivePath("/ai-search")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiQuestionMarkCircle className="mr-1 h-5 w-5" />
                Busca IA
              </Link>
              {/* <div className="ml-4">
                <span className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <HiUser className="mr-2 -ml-1 h-4 w-4" />
                    Funcionário
                  </button>
                </span>
              </div> */}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <span className="sr-only">Abrir menu</span>
                {isMobileMenuOpen ? (
                  <HiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <HiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/products"
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActivePath("/products")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiShoppingBag className="mr-2 h-5 w-5" />
                Consulta de Produtos
              </Link>
              <Link
                to="/products/create"
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActivePath("/products/create")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiDocumentAdd className="mr-2 h-5 w-5" />
                Criar Produto
              </Link>
              <Link
                to="/products/import"
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActivePath("/products/import")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiCloudUpload className="mr-2 h-5 w-5" />
                Importar Produtos
              </Link>
              <Link
                to="/ai-search"
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActivePath("/ai-search")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <HiQuestionMarkCircle className="mr-2 h-5 w-5" />
                Busca IA
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <HiUser className="h-10 w-10 text-gray-400" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    Funcionário
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    funcionario@cianutricao.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
            &copy; 2025 Cia da Nutrição - Sistema Interno para Funcionários
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
