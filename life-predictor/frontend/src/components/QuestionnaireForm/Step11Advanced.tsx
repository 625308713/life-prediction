import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step11Advanced({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.restingHeartRate}</label>
        <input type="number" className="input-field" value={data.restingHeartRate ?? ""} min={30} max={200}
          placeholder="如：65"
          onChange={(e) => onChange("restingHeartRate", e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.vo2maxLevel}</label>
        <select className="input-field" value={data.vo2maxLevel || ""}
          onChange={(e) => onChange("vo2maxLevel", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="excellent">{t.fields.vo2maxExcellent}</option>
          <option value="good">{t.fields.vo2maxGood}</option>
          <option value="average">{t.fields.vo2maxAverage}</option>
          <option value="poor">{t.fields.vo2maxPoor}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.gripStrength}</label>
        <select className="input-field" value={data.gripStrength || ""}
          onChange={(e) => onChange("gripStrength", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="strong">{t.fields.gripStrong}</option>
          <option value="normal">{t.fields.gripNormal}</option>
          <option value="weak">{t.fields.gripWeak}</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.unintendedWeightLoss ?? false}
            onChange={(e) => onChange("unintendedWeightLoss", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.unintendedWeightLoss}</span>
            <p className="text-xs text-gray-400">{t.fields.unintendedWeightLossDesc}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
