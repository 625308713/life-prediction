import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step5Mental({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Happiness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.happinessScore} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.happinessDesc}</p>
        <div className="flex items-center gap-4">
          <input type="range" min={1} max={10} value={data.happinessScore}
            onChange={(e) => onChange("happinessScore", parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
          <span className="text-2xl font-bold text-primary-600 w-10 text-center">{data.happinessScore}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1 - 最低</span>
          <span>10 - 最高</span>
        </div>
      </div>

      {/* Chronic Stress */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.chronicStress}
            onChange={(e) => onChange("chronicStress", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.chronicStress}</span>
            <p className="text-xs text-gray-400">{t.fields.chronicStressDesc}</p>
          </div>
        </label>
      </div>

      {/* Depression */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.depressionTendency}
            onChange={(e) => onChange("depressionTendency", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.depressionTendency}</span>
            <p className="text-xs text-gray-400">{t.fields.depressionTendencyDesc}</p>
          </div>
        </label>
      </div>

      {/* Stable Partner */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.stablePartner}
            onChange={(e) => onChange("stablePartner", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.stablePartner}</span>
        </label>
      </div>

      {/* Social Activity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.socialActivity} <span className="text-red-500">*</span>
        </label>
        <select className="input-field" value={data.socialActivity}
          onChange={(e) => onChange("socialActivity", e.target.value)}>
          <option value="high">{t.fields.socialHigh}</option>
          <option value="moderate">{t.fields.socialModerate}</option>
          <option value="isolated">{t.fields.socialIsolated}</option>
        </select>
      </div>

      {/* Sense of Purpose */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.senseOfPurpose}
            onChange={(e) => onChange("senseOfPurpose", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.senseOfPurpose}</span>
        </label>
      </div>

      {/* Education */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.educationLevel}</label>
        <select className="input-field" value={data.educationLevel || ""}
          onChange={(e) => onChange("educationLevel", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="below_bachelor">{t.fields.educationBelowBachelor}</option>
          <option value="bachelor_plus">{t.fields.educationBachelorPlus}</option>
        </select>
      </div>
    </div>
  );
}
