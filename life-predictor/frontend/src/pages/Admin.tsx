import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitch from "../components/LanguageSwitch";
import AdminCharts from "../components/AdminCharts";
import type { AdminStats, AdminPredictionList, AdminPrediction } from "../types";

type Tab = "dashboard" | "list";

export default function Admin() {
  const { t, language } = useLanguage();
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("admin_token")
  );
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // List state
  const [predictions, setPredictions] = useState<AdminPredictionList | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    ageMin: "",
    ageMax: "",
    startDate: "",
    endDate: "",
    leMin: "",
    leMax: "",
  });
  const [page, setPage] = useState(1);

  // Detail modal
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, any> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError(t.admin.loginError);
        return;
      }
      const data = await res.json();
      setToken(data.token);
      sessionStorage.setItem("admin_token", data.token);
    } catch {
      setLoginError(t.admin.loginError);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", headers: headers() });
    } catch { /* ignore */ }
    setToken(null);
    sessionStorage.removeItem("admin_token");
    setStats(null);
    setPredictions(null);
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { headers: headers() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setStats(data);
    } catch { /* ignore */ }
    setStatsLoading(false);
  }, [headers]);

  // Fetch list
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (filters.gender) params.set("gender", filters.gender);
      if (filters.ageMin) params.set("ageMin", filters.ageMin);
      if (filters.ageMax) params.set("ageMax", filters.ageMax);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.leMin) params.set("leMin", filters.leMin);
      if (filters.leMax) params.set("leMax", filters.leMax);

      const res = await fetch(`/api/admin/predictions?${params}`, { headers: headers() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setPredictions(data);
    } catch { /* ignore */ }
    setListLoading(false);
  }, [page, filters, headers]);

  // Fetch detail
  const fetchDetail = async (id: string) => {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/predictions/${id}`, { headers: headers() });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setDetailData(data);
    } catch { /* ignore */ }
    setDetailLoading(false);
  };

  // Export CSV
  const exportCSV = async () => {
    try {
      const res = await fetch("/api/admin/predictions/export/csv", { headers: headers() });
      if (res.status === 401) { handleLogout(); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `life_predictions_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!token) return;
    if (tab === "dashboard") fetchStats();
  }, [token, tab, fetchStats]);

  useEffect(() => {
    if (!token) return;
    if (tab === "list") fetchList();
  }, [token, tab, fetchList]);

  // Login page
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.admin.login}</h1>
          </div>
          <form onSubmit={handleLogin} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.admin.password}
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500">{loginError}</p>
            )}
            <button type="submit" className="btn-primary w-full">
              {t.admin.loginBtn}
            </button>
          </form>
          <div className="mt-4 text-center">
            <LanguageSwitch />
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-800">{t.app.title} {t.nav.admin}</h1>
            <nav className="flex gap-1">
              <button
                onClick={() => { setTab("dashboard"); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === "dashboard" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.admin.dashboard}
              </button>
              <button
                onClick={() => { setTab("list"); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === "list" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t.admin.dataList}
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
              {t.admin.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Tab */}
          {tab === "dashboard" && (
            <>
              {statsLoading && (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                </div>
              )}
              {stats && <AdminCharts stats={stats} />}
            </>
          )}

          {/* List Tab */}
          {tab === "list" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="card">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  <select
                    className="input-field text-sm py-2"
                    value={filters.gender}
                    onChange={(e) => { setFilters({ ...filters, gender: e.target.value }); setPage(1); }}
                  >
                    <option value="">{t.admin.filters.gender}: {t.admin.filters.all}</option>
                    <option value="male">{t.admin.filters.male}</option>
                    <option value="female">{t.admin.filters.female}</option>
                  </select>
                  <input
                    type="number" placeholder={t.admin.filters.ageRange + " min"}
                    className="input-field text-sm py-2" value={filters.ageMin}
                    onChange={(e) => { setFilters({ ...filters, ageMin: e.target.value }); setPage(1); }}
                  />
                  <input
                    type="number" placeholder={t.admin.filters.ageRange + " max"}
                    className="input-field text-sm py-2" value={filters.ageMax}
                    onChange={(e) => { setFilters({ ...filters, ageMax: e.target.value }); setPage(1); }}
                  />
                  <input
                    type="date" className="input-field text-sm py-2" value={filters.startDate}
                    onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
                  />
                  <input
                    type="date" className="input-field text-sm py-2" value={filters.endDate}
                    onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
                  />
                  <input
                    type="number" placeholder={t.admin.filters.leRange + " min"}
                    className="input-field text-sm py-2" value={filters.leMin}
                    onChange={(e) => { setFilters({ ...filters, leMin: e.target.value }); setPage(1); }}
                  />
                  <input
                    type="number" placeholder={t.admin.filters.leRange + " max"}
                    className="input-field text-sm py-2" value={filters.leMax}
                    onChange={(e) => { setFilters({ ...filters, leMax: e.target.value }); setPage(1); }}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => {
                      setFilters({ gender: "", ageMin: "", ageMax: "", startDate: "", endDate: "", leMin: "", leMax: "" });
                      setPage(1);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t.admin.filters.reset}
                  </button>
                  <button onClick={exportCSV} className="btn-secondary text-sm py-1.5">
                    {t.admin.exportCSV}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-x-auto">
                {listLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                  </div>
                ) : predictions && predictions.predictions.length > 0 ? (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.id}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.createdAt}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.gender}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.age}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.bmi}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.lifeExpectancy}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.confidence}</th>
                          <th className="py-2 px-2 font-medium">{t.admin.tableHeaders.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.predictions.map((p: AdminPrediction) => (
                          <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 px-2 text-xs text-gray-400 font-mono">
                              {p.id.slice(-8)}
                            </td>
                            <td className="py-2 px-2 text-xs">
                              {new Date(p.createdAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}
                            </td>
                            <td className="py-2 px-2">
                              {p.gender === "male" ? t.admin.filters.male : t.admin.filters.female}
                            </td>
                            <td className="py-2 px-2">{p.age}</td>
                            <td className="py-2 px-2">{p.bmi}</td>
                            <td className="py-2 px-2 font-medium">{p.adjustedMin}-{p.adjustedMax}</td>
                            <td className="py-2 px-2">{p.confidenceLevel}%</td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() => fetchDetail(p.id)}
                                className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                              >
                                {t.admin.detail}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <span className="text-sm text-gray-500">
                        {t.admin.page
                          .replace("{page}", String(predictions.pagination.page))
                          .replace("{total}", String(predictions.pagination.totalPages))}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={predictions.pagination.page <= 1}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={predictions.pagination.page >= predictions.pagination.totalPages}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-400 text-sm">{t.admin.noData}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {detailId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t.admin.detailTitle}</h2>
              <button
                onClick={() => { setDetailId(null); setDetailData(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              {detailLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : detailData ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">{t.steps.step1}</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><span className="text-gray-500">{t.fields.gender}:</span> {(detailData.gender as string) === "male" ? t.fields.genderMale : t.fields.genderFemale}</div>
                      <div><span className="text-gray-500">{t.fields.age}:</span> {detailData.age as number}</div>
                      <div><span className="text-gray-500">BMI:</span> {detailData.bmi as number}</div>
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">维度得分</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {detailData.dimensionScores && Object.entries(detailData.dimensionScores as Record<string, number>).map(([k, v]) => (
                        <div key={k} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{t.dimensionNames[k as keyof typeof t.dimensionNames] || k}</span>
                          <span className={v >= 0 ? "text-green-600" : "text-red-500"}>
                            {v > 0 ? "+" : ""}{v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prediction Results */}
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">预测结果</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-primary-50 rounded text-center">
                        <p className="text-xs text-gray-500">预测寿命</p>
                        <p className="font-bold text-primary-600">{detailData.adjustedMin as number} - {detailData.adjustedMax as number}</p>
                      </div>
                      <div className="p-3 bg-accent-50 rounded text-center">
                        <p className="text-xs text-gray-500">健康寿命</p>
                        <p className="font-bold text-accent-600">{detailData.healthLifespan as number}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <p className="text-xs text-gray-500">置信度</p>
                        <p className="font-bold">{detailData.confidenceLevel as number}%</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Report */}
                  {detailData.aiReport && (
                    <div>
                      <h3 className="font-bold text-gray-700 mb-2">AI报告</h3>
                      <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
                        <ReactMarkdown>{detailData.aiReport as string}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
