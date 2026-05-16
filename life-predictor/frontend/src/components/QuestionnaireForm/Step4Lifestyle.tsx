import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step4Lifestyle({ data, onChange }: Props) {
  const { t } = useLanguage();

  const selectField = (field: keyof QuestionnaireData) => (
    <select className="input-field" value={String(data[field] ?? "")}
      onChange={(e) => onChange(field, e.target.value as QuestionnaireData[typeof field])}>
    </select>
  );

  return (
    <div className="space-y-5">
      {/* Smoking */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.smokingStatus} <span className="text-red-500">*</span>
        </label>
        <select className="input-field" value={data.smokingStatus}
          onChange={(e) => onChange("smokingStatus", e.target.value)}>
          <option value="never">{t.fields.smokingNever}</option>
          <option value="quit_10y_plus">{t.fields.smokingQuit10yPlus}</option>
          <option value="quit_under_10y">{t.fields.smokingQuitUnder10y}</option>
          <option value="current_light">{t.fields.smokingCurrentLight}</option>
          <option value="current_heavy">{t.fields.smokingCurrentHeavy}</option>
        </select>
      </div>

      {/* Alcohol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.alcoholConsumption} <span className="text-red-500">*</span>
        </label>
        <select className="input-field" value={data.alcoholConsumption}
          onChange={(e) => onChange("alcoholConsumption", e.target.value)}>
          <option value="never">{t.fields.alcoholNever}</option>
          <option value="occasional">{t.fields.alcoholOccasional}</option>
          <option value="weekly_moderate">{t.fields.alcoholWeeklyModerate}</option>
          <option value="daily_heavy">{t.fields.alcoholDailyHeavy}</option>
        </select>
      </div>

      {/* Exercise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.exerciseFrequency} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.exerciseDesc}</p>
        <select className="input-field" value={data.exerciseFrequency}
          onChange={(e) => onChange("exerciseFrequency", e.target.value)}>
          <option value="three_plus">{t.fields.exerciseThreePlus}</option>
          <option value="one_to_two">{t.fields.exerciseOneToTwo}</option>
          <option value="rarely">{t.fields.exerciseRarely}</option>
        </select>
      </div>

      {/* Sedentary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.sedentaryHours} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.sedentaryDesc}</p>
        <select className="input-field" value={data.sedentaryHours}
          onChange={(e) => onChange("sedentaryHours", e.target.value)}>
          <option value="under_4">{t.fields.sedentaryUnder4}</option>
          <option value="four_to_eight">{t.fields.sedentary4to8}</option>
          <option value="above_8">{t.fields.sedentaryAbove8}</option>
        </select>
      </div>

      {/* Diet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.dietPattern} <span className="text-red-500">*</span>
        </label>
        <select className="input-field" value={data.dietPattern}
          onChange={(e) => onChange("dietPattern", e.target.value)}>
          <option value="balanced">{t.fields.dietBalanced}</option>
          <option value="high_meat_salt">{t.fields.dietHighMeatSalt}</option>
          <option value="veggie_rich">{t.fields.dietVeggieRich}</option>
        </select>
      </div>

      {/* Sleep */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.sleepHours} <span className="text-red-500">*</span>
        </label>
        <input type="number" className="input-field" value={data.sleepHours} min={0} max={24} step={0.5}
          onChange={(e) => onChange("sleepHours", parseFloat(e.target.value) || 7)} />
      </div>

      {/* Water */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.waterIntake}</label>
        <select className="input-field" value={data.waterIntake || ""}
          onChange={(e) => onChange("waterIntake", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="adequate">{t.fields.waterAdequate}</option>
          <option value="inadequate">{t.fields.waterInadequate}</option>
        </select>
      </div>
    </div>
  );
}
