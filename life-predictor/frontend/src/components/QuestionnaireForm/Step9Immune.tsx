import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step9Immune({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.frequentIllness ?? false}
            onChange={(e) => onChange("frequentIllness", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.frequentIllness}</span>
            <p className="text-xs text-gray-400">{t.fields.frequentIllnessDesc}</p>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.autoimmuneDisease ?? false}
            onChange={(e) => onChange("autoimmuneDisease", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.autoimmuneDisease}</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.chronicInflammation ?? false}
            onChange={(e) => onChange("chronicInflammation", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.chronicInflammation}</span>
        </label>
      </div>
    </div>
  );
}
