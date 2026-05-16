import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step10Medical({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.distanceToHospital}</label>
        <select className="input-field" value={data.distanceToHospital || ""}
          onChange={(e) => onChange("distanceToHospital", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="under_30min">{t.fields.distanceUnder30min}</option>
          <option value="over_30min">{t.fields.distanceOver30min}</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.commercialInsurance ?? false}
            onChange={(e) => onChange("commercialInsurance", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.commercialInsurance}</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.recentCheckupCount}</label>
        <input type="number" className="input-field" value={data.recentCheckupCount ?? ""} min={0} max={50}
          placeholder="如：3"
          onChange={(e) => onChange("recentCheckupCount", e.target.value ? parseInt(e.target.value) : undefined)} />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.hasFamilyDoctor ?? false}
            onChange={(e) => onChange("hasFamilyDoctor", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.hasFamilyDoctor}</span>
        </label>
      </div>
    </div>
  );
}
