import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

export default function Step1Basic({ data, onChange }: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.age} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.ageDesc}</p>
        <input
          type="number"
          className="input-field"
          value={data.age}
          min={18}
          max={120}
          onChange={(e) => onChange("age", parseInt(e.target.value) || 18)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.gender} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4 mt-2">
          <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            data.gender === "male" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input type="radio" name="gender" value="male" checked={data.gender === "male"}
              onChange={() => onChange("gender", "male")} className="sr-only" />
            <span className="text-2xl">♂</span>
            <span className="font-medium">{t.fields.genderMale}</span>
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            data.gender === "female" ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input type="radio" name="gender" value="female" checked={data.gender === "female"}
              onChange={() => onChange("gender", "female")} className="sr-only" />
            <span className="text-2xl">♀</span>
            <span className="font-medium">{t.fields.genderFemale}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.fields.height} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">{t.fields.heightDesc}</p>
          <input type="number" className="input-field" value={data.heightCm} min={100} max={250}
            onChange={(e) => onChange("heightCm", parseFloat(e.target.value) || 170)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.fields.weight} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">{t.fields.weightDesc}</p>
          <input type="number" className="input-field" value={data.weightKg} min={30} max={300}
            onChange={(e) => onChange("weightKg", parseFloat(e.target.value) || 65)} />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <span className="text-sm text-gray-500">BMI: </span>
        <span className="text-lg font-bold text-primary-600">{data.bmi}</span>
        <span className="text-xs text-gray-400 ml-2">
          {data.bmi < 18.5 ? "(偏瘦)" : data.bmi < 24 ? "(正常)" : data.bmi < 28 ? "(偏重)" : "(肥胖)"}
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.waist} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.waistDesc}</p>
        <input type="number" className="input-field" value={data.waistCm} min={50} max={200}
          onChange={(e) => onChange("waistCm", parseFloat(e.target.value) || 80)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.ethnicity}</label>
        <select className="input-field" value={data.ethnicity}
          onChange={(e) => onChange("ethnicity", e.target.value)}>
          <option value="east_asian">{t.fields.ethnicityEastAsian}</option>
          <option value="other">{t.fields.ethnicityOther}</option>
        </select>
      </div>
    </div>
  );
}
