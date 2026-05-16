import { Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./hooks/useLanguage";
import Home from "./pages/Home";
import Result from "./pages/Result";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result/:id" element={<Result />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LanguageProvider>
  );
}
