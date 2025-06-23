import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AISearchPage from "./pages/AISearchPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/ai-search" replace />} />
        <Route path="ai-search" element={<AISearchPage />} />
        <Route path="*" element={<Navigate to="/ai-search" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
