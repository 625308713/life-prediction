import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step7Behavior({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.selfDisciplineScore}</label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.selfDisciplineDesc}</p>
        <div className="flex items-center gap-4">
          <input type="range" min={1} max={10} value={data.selfDisciplineScore ?? 5}
            onChange={(e) => onChange("selfDisciplineScore", parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
          <span className="text-2xl font-bold text-primary-600 w-10 text-center">{data.selfDisciplineScore ?? "-"}</span>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.positiveAgingAttitude ?? false}
            onChange={(e) => onChange("positiveAgingAttitude", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.positiveAgingAttitude}</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.readingHabit ?? false}
            onChange={(e) => onChange("readingHabit", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.readingHabit}</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.highRiskBehaviors ?? false}
            onChange={(e) => onChange("highRiskBehaviors", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">{t.fields.highRiskBehaviors}</span>
            <p className="text-xs text-gray-400">{t.fields.highRiskBehaviorsDesc}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
