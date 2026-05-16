import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step8Sleep({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.bedtimeRange}</label>
        <select className="input-field" value={data.bedtimeRange || ""}
          onChange={(e) => onChange("bedtimeRange", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="before_22">{t.fields.bedtimeBefore22}</option>
          <option value="22_23">{t.fields.bedtime22to23}</option>
          <option value="23_24">{t.fields.bedtime23to24}</option>
          <option value="after_24">{t.fields.bedtimeAfter24}</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.untreatedSleepApnea ?? false}
            onChange={(e) => onChange("untreatedSleepApnea", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.untreatedSleepApnea}</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.moderateNapping ?? false}
            onChange={(e) => onChange("moderateNapping", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.moderateNapping}</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.preSleepScreenTime ?? false}
            onChange={(e) => onChange("preSleepScreenTime", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.preSleepScreenTime}</span>
        </label>
      </div>
    </div>
  );
}
