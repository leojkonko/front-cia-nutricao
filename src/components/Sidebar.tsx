import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";
import {
  HiHome,
  HiShoppingBag,
  HiUpload,
  HiQuestionMarkCircle,
} from "react-icons/hi";

const Sidebar = () => {
  const location = useLocation();

  // Array com itens de navegação
  const navigationItems = [
    {
      name: "Home",
      href: "/",
      icon: <HiHome className="h-6 w-6" />,
    },
    {
      name: "Produtos",
      href: "/products",
      icon: <HiShoppingBag className="h-6 w-6" />,
    },
    {
      name: "Importar Produtos",
      href: "/products/import",
      icon: <HiUpload className="h-6 w-6" />,
    },
    {
      name: "Busca Inteligente",
      href: "/ai-search",
      icon: <HiQuestionMarkCircle className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="px-6 pt-8 pb-6">
        <img src={Logo} alt="Cia da Nutrição" className="h-10" />
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <div
                className={`mr-3 ${
                  isActive
                    ? "text-green-600"
                    : "text-gray-400 group-hover:text-gray-500"
                }`}
              >
                {item.icon}
              </div>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
              CN
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Cia da Nutrição</p>
            <p className="text-xs text-gray-500">Painel administrativo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
