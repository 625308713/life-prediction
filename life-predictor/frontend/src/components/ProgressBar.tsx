import { useLanguage } from "../hooks/useLanguage";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  confidenceLevel: number;
  requiredSteps?: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  confidenceLevel,
  requiredSteps,
}: ProgressBarProps) {
  const { t, language } = useLanguage();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Phase-aware label so "核心 6 步" on the home page stays consistent and the
  // optional booster steps don't look like a sudden jump to 11 required steps.
  let phaseLabel: string;
  if (requiredSteps && currentStep < requiredSteps) {
    phaseLabel =
      language === "en"
        ? `Core step ${currentStep + 1} / ${requiredSteps}`
        : `核心 第 ${currentStep + 1} / ${requiredSteps} 步`;
  } else if (requiredSteps) {
    const boosterTotal = totalSteps - requiredSteps;
    const boosterCur = currentStep - requiredSteps + 1;
    phaseLabel =
      language === "en"
        ? `Optional booster ${boosterCur} / ${boosterTotal}`
        : `进阶 第 ${boosterCur} / ${boosterTotal} 步 · 可选`;
  } else {
    phaseLabel = t.questionnaire.step
      .replace("{current}", String(currentStep + 1))
      .replace("{total}", String(totalSteps));
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm text-ink-faint">
        <span className="font-semibold">{phaseLabel}</span>
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
