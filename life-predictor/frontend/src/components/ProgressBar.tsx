import { useLanguage } from "../hooks/useLanguage";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  confidenceLevel: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  confidenceLevel,
}: ProgressBarProps) {
  const { t } = useLanguage();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {t.questionnaire.step
            .replace("{current}", String(currentStep + 1))
            .replace("{total}", String(totalSteps))}
        </span>
        <span>
          {t.questionnaire.confidence}: {Math.round(confidenceLevel)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-primary-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`step-indicator ${
              i < currentStep
                ? "step-done"
                : i === currentStep
                ? "step-active"
                : "step-pending"
            }`}
          >
            {i < currentStep ? "✓" : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
