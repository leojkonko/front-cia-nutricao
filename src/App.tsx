import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://vite.dev"
                target="_blank"
                className="hover:scale-110 transition-transform"
              >
                <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
              </a>
              <a
                href="https://react.dev"
                target="_blank"
                className="hover:scale-110 transition-transform"
              >
                <img
                  src={reactLogo}
                  className="h-16 w-16 animate-spin-slow"
                  alt="React logo"
                />
              </a>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Vite + React + Tailwind CSS
                </h1>
                <p className="text-gray-600">Projeto de Nutrição</p>
              </div>
              <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCount((count) => count + 1)}
                    className="btn"
                  >
                    Contador: {count}
                  </button>
                </div>
                <p className="mt-4 text-center text-gray-500 text-sm">
                  Edite{" "}
                  <code className="text-sm font-bold text-gray-900">
                    src/App.tsx
                  </code>{" "}
                  e salve para testar HMR
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
