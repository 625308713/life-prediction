import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useLanguage } from "../hooks/useLanguage";
import type { AdminStats } from "../types";

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#ec4899"];

interface Props {
  stats: AdminStats;
}

export default function AdminCharts({ stats }: Props) {
  const { t, language } = useLanguage();

  const ageDistData = [
    { name: "<30", value: stats.ageDistribution.under30 || 0 },
    { name: "30-40", value: stats.ageDistribution["30_40"] || 0 },
    { name: "40-50", value: stats.ageDistribution["40_50"] || 0 },
    { name: "50-60", value: stats.ageDistribution["50_60"] || 0 },
    { name: "60+", value: stats.ageDistribution.above60 || 0 },
  ];

  const genderData = [
    { name: language === "zh" ? "男" : "Male", value: stats.genderDistribution.male },
    { name: language === "zh" ? "女" : "Female", value: stats.genderDistribution.female },
  ];

  const leDistData = [
    { name: "65-70", value: stats.lifeExpectancyDistribution["65_70"] || 0 },
    { name: "70-75", value: stats.lifeExpectancyDistribution["70_75"] || 0 },
    { name: "75-80", value: stats.lifeExpectancyDistribution["75_80"] || 0 },
    { name: "80-85", value: stats.lifeExpectancyDistribution["80_85"] || 0 },
    { name: "85-90", value: stats.lifeExpectancyDistribution["85_90"] || 0 },
    { name: "90+", value: stats.lifeExpectancyDistribution.above90 || 0 },
  ];

  const bmiData = [
    { name: language === "zh" ? "偏瘦" : "Underweight", value: stats.bmiDistribution.underweight || 0 },
    { name: language === "zh" ? "正常" : "Normal", value: stats.bmiDistribution.normal || 0 },
    { name: language === "zh" ? "偏重" : "Overweight", value: stats.bmiDistribution.overweight || 0 },
    { name: language === "zh" ? "肥胖" : "Obese", value: stats.bmiDistribution.obese || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.totalCount}</p>
          <p className="text-xs text-gray-500 mt-1">{t.admin.totalSubmissions}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{stats.todayCount}</p>
          <p className="text-xs text-gray-500 mt-1">{t.admin.todayNew}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.avgLifeExpectancy}</p>
          <p className="text-xs text-gray-500 mt-1">{t.admin.avgLifeExpectancy}</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.avgAge}</p>
          <p className="text-xs text-gray-500 mt-1">{t.admin.avgAge}</p>
        </div>
      </div>

      {/* Daily Trend Line Chart */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.dailyTrend}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.dailySubmissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2}
              dot={{ r: 3 }} name={language === "zh" ? "提交量" : "Submissions"} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution Bar */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.ageDistribution}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Pie */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.genderRatio}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                dataKey="value" label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }>
                {genderData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#3b82f6" : "#f472b6"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Life Expectancy Distribution */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.lifeExpectancyDist}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} name="人数" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BMI Distribution Pie */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.bmiDist}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={bmiData} cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                dataKey="value" label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }>
                {bmiData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 Risks Horizontal Bar */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-4">{t.admin.topRisks}</h3>
          {stats.top10Risks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t.admin.noData}</p>
          ) : (
            <div className="space-y-2">
              {stats.top10Risks.map((risk, i) => {
                const maxCount = stats.top10Risks[0]?.count || 1;
                const width = (risk.count / maxCount) * 100;
                const displayName = t.riskNames[risk.name as keyof typeof t.riskNames] || risk.name;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-6 text-right">{i + 1}</span>
                    <span className="text-xs text-gray-700 w-32 truncate">{displayName}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className="bg-red-400 h-5 rounded-full transition-all flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(width, 2)}%` }}>
                        <span className="text-xs text-white font-medium">{risk.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
