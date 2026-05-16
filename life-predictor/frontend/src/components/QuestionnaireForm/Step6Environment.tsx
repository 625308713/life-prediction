import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step6Environment({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* High Risk Occupation */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.highRiskOccupation}
            onChange={(e) => onChange("highRiskOccupation", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.highRiskOccupation}</span>
            <p className="text-xs text-gray-400">{t.fields.highRiskOccupationDesc}</p>
          </div>
        </label>
      </div>

      {/* Weekly Work Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.weeklyWorkHours}</label>
        <input type="number" className="input-field" value={data.weeklyWorkHours ?? ""} min={0} max={120}
          placeholder="如：40"
          onChange={(e) => onChange("weeklyWorkHours", e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      {/* Noise */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.longTermNoise}
            onChange={(e) => onChange("longTermNoise", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.longTermNoise}</span>
            <p className="text-xs text-gray-400">{t.fields.longTermNoiseDesc}</p>
          </div>
        </label>
      </div>

      {/* Income */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.incomeLevel}</label>
        <select className="input-field" value={data.incomeLevel || ""}
          onChange={(e) => onChange("incomeLevel", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="low">{t.fields.incomeLow}</option>
          <option value="medium">{t.fields.incomeMedium}</option>
          <option value="high">{t.fields.incomeHigh}</option>
        </select>
      </div>
    </div>
  );
}
