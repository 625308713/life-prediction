import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step3Family({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.parentLongevity} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.parentLongevityDesc}</p>
        <select className="input-field" value={data.parentLongevity}
          onChange={(e) => onChange("parentLongevity", e.target.value)}>
          <option value="both_above_75">{t.fields.parentBothAbove75}</option>
          <option value="one_above_75">{t.fields.parentOneAbove75}</option>
          <option value="both_below_65">{t.fields.parentBothBelow65}</option>
          <option value="other">{t.fields.parentOther}</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.familyMemberAbove90}
            onChange={(e) => onChange("familyMemberAbove90", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.familyAbove90}</span>
        </label>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{t.steps.step3}</label>
        {(["familyAlzheimers", "familyParkinsons", "familyHeartDisease", "familyCancer"] as const).map((field) => (
          <label key={field} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data[field] as boolean}
              onChange={(e) => onChange(field, e.target.checked as QuestionnaireData[typeof field])}
              className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">{t.fields[field]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
