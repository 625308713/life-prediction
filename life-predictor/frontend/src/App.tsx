import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./hooks/useLanguage";
import Home from "./pages/Home";

const Result = lazy(() => import("./pages/Result"));
const Share = lazy(() => import("./pages/Share"));
const Admin = lazy(() => import("./pages/Admin"));
const Legal = lazy(() => import("./pages/Legal"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-surface">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/share/:id" element={<Share />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/disclaimer" element={<Legal />} />
            <Route path="/advertising" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </LanguageProvider>
  );
}
