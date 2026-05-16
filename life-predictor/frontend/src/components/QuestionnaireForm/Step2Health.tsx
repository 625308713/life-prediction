import { useLanguage } from "../../hooks/useLanguage";
import type { QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

const chronicOptions = [
  "chronicHypertension", "chronicDiabetes", "chronicHeartDisease", "chronicStroke",
  "chronicCopd", "chronicKidney", "chronicLiver", "chronicArthritis", "chronicCancer", "chronicOther",
] as const;

export default function Step2Health({ data, onChange }: Props) {
  const { t } = useLanguage();

  const toggleChronic = (key: string) => {
    const diseases = [...data.chronicDiseases];
    if (diseases.includes(key)) {
      onChange("chronicDiseases", diseases.filter((d) => d !== key));
    } else {
      onChange("chronicDiseases", [...diseases, key]);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.chronicDiseases} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.chronicDiseasesDesc}</p>
        <div className="grid grid-cols-2 gap-2">
          {chronicOptions.map((key) => (
            <label key={key}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                data.chronicDiseases.includes(key as string)
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}>
              <input type="checkbox" checked={data.chronicDiseases.includes(key as string)}
                onChange={() => toggleChronic(key as string)} className="sr-only" />
              <span>{t.fields[key as keyof typeof t.fields]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.cancerHistory}</label>
        <div className="flex gap-4 mt-2">
          {[true, false].map((v) => (
            <label key={String(v)} className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-colors ${
              data.cancerHistory === v ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
            }`}>
              <input type="radio" name="cancer" checked={data.cancerHistory === v}
                onChange={() => onChange("cancerHistory", v)} className="sr-only" />
              <span className="font-medium">{v ? t.fields.chronicCancer : "否 / No"}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.bloodPressure} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.bloodPressureDesc}</p>
        <select className="input-field" value={data.bloodPressure}
          onChange={(e) => onChange("bloodPressure", e.target.value)}>
          <option value="normal">{t.fields.bpNormal}</option>
          <option value="elevated">{t.fields.bpElevated}</option>
          <option value="stage1">{t.fields.bpStage1}</option>
          <option value="stage2">{t.fields.bpStage2}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fields.bloodSugar} <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.bloodSugarDesc}</p>
        <select className="input-field" value={data.bloodSugar}
          onChange={(e) => onChange("bloodSugar", e.target.value)}>
          <option value="normal">{t.fields.bsNormal}</option>
          <option value="prediabetes">{t.fields.bsPrediabetes}</option>
          <option value="diabetes">{t.fields.bsDiabetes}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.cholesterol}</label>
        <select className="input-field" value={data.cholesterolLevel || ""}
          onChange={(e) => onChange("cholesterolLevel", e.target.value || undefined)}>
          <option value="">-- {t.admin.filters.all} --</option>
          <option value="normal">{t.fields.cholesterolNormal}</option>
          <option value="borderline">{t.fields.cholesterolBorderline}</option>
          <option value="high">{t.fields.cholesterolHigh}</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={data.regularCheckup}
            onChange={(e) => onChange("regularCheckup", e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <span className="text-sm font-medium text-gray-700">{t.fields.regularCheckup}</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.fields.medications}</label>
        <p className="text-xs text-gray-400 mb-2">{t.fields.medicationsDesc}</p>
        <input type="text" className="input-field" placeholder="如：降压药，降糖药"
          value={data.currentMedications.join("，")}
          onChange={(e) => onChange("currentMedications", e.target.value ? e.target.value.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [])} />
      </div>
    </div>
  );
}
