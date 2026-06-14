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
      <div className="flex items-center justify-between text-sm text-ink-faint">
        <span className="font-semibold">
          {t.questionnaire.step
            .replace("{current}", String(currentStep + 1))
            .replace("{total}", String(totalSteps))}
        </span>
        <span>
          {t.questionnaire.confidence}: {Math.round(confidenceLevel)}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-400 transition-all duration-500 ease-out"
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
