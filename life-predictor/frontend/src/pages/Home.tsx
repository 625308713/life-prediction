import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useQuestionnaire } from "../hooks/useQuestionnaire";
import LanguageSwitch from "../components/LanguageSwitch";
import ProgressBar from "../components/ProgressBar";
import Step1Basic from "../components/QuestionnaireForm/Step1Basic";
import Step2Health from "../components/QuestionnaireForm/Step2Health";
import Step3Family from "../components/QuestionnaireForm/Step3Family";
import Step4Lifestyle from "../components/QuestionnaireForm/Step4Lifestyle";
import Step5Mental from "../components/QuestionnaireForm/Step5Mental";
import Step6Environment from "../components/QuestionnaireForm/Step6Environment";
import Step7Behavior from "../components/QuestionnaireForm/Step7Behavior";
import Step8Sleep from "../components/QuestionnaireForm/Step8Sleep";
import Step9Immune from "../components/QuestionnaireForm/Step9Immune";
import Step10Medical from "../components/QuestionnaireForm/Step10Medical";
import Step11Advanced from "../components/QuestionnaireForm/Step11Advanced";
import type { QuestionnaireData } from "../types";

const TOTAL_STEPS = 11;
const REQUIRED_STEPS = 6; // Steps 0-5 are required

const stepComponents = [
  Step1Basic,
  Step2Health,
  Step3Family,
  Step4Lifestyle,
  Step5Mental,
  Step6Environment,
  Step7Behavior,
  Step8Sleep,
  Step9Immune,
  Step10Medical,
  Step11Advanced,
];

const stepKeys: (keyof typeof import("../i18n/zh").steps)[] = [
  "step1", "step2", "step3", "step4", "step5", "step6",
  "step7", "step8", "step9", "step10", "step11",
];

function getConfidenceLevel(data: QuestionnaireData, currentStep: number): number {
  let confidence = 60;
  const filledCore = Math.min(currentStep + 1, REQUIRED_STEPS);
  confidence += filledCore * 4;

  // Check advanced fields (steps 7-11)
  const advancedFields: (keyof QuestionnaireData)[] = [
    "selfDisciplineScore", "positiveAgingAttitude", "readingHabit", "highRiskBehaviors",
    "bedtimeRange", "untreatedSleepApnea", "moderateNapping", "preSleepScreenTime",
    "frequentIllness", "autoimmuneDisease", "chronicInflammation",
    "distanceToHospital", "commercialInsurance", "recentCheckupCount", "hasFamilyDoctor",
    "restingHeartRate", "vo2maxLevel", "gripStrength", "unintendedWeightLoss",
  ];
  const filledAdvanced = advancedFields.filter(
    (f) => data[f] !== undefined && data[f] !== null && data[f] !== ""
  ).length;
  confidence += filledAdvanced;
  return Math.min(95, confidence);
}

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data, currentStep, updateField, nextStep, prevStep, goToStep, clearSaved } =
    useQuestionnaire();
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  const confidenceLevel = getConfidenceLevel(data, currentStep);
  const StepComponent = stepComponents[currentStep];
  const isOptional = currentStep >= REQUIRED_STEPS;
  const displayOptional = currentStep >= REQUIRED_STEPS;

  const handleStart = () => {
    setStarted(true);
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      setStarted(false);
      return;
    }
    prevStep();
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "提交失败");
      }

      const result = await res.json();
      clearSaved();
      navigate(`/result/${result.id}`, { state: { result } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // Landing page
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute top-4 right-4">
          <LanguageSwitch />
        </div>
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">⌛</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t.app.title}
          </h1>
          <p className="text-lg text-gray-600 mb-2">{t.app.subtitle}</p>
          <p className="text-sm text-gray-400 mb-8">{t.app.description}</p>
          <button onClick={handleStart} className="btn-primary text-lg px-10 py-4">
            {t.app.startBtn}
          </button>
          <p className="text-xs text-gray-400 mt-4">{t.app.estimatedTime}</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>{t.app.privacyNote}</span>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">{t.questionnaire.title}</h1>
          <LanguageSwitch />
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            confidenceLevel={confidenceLevel}
          />
        </div>
      </div>

      {/* Step Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Step Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {t.steps[stepKeys[currentStep]]}
            </h2>
            {displayOptional && (
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {t.questionnaire.optional}
              </span>
            )}
          </div>

          {/* Step Component */}
          <div className="card">
            <StepComponent data={data} onChange={updateField} />
          </div>

          {/* Optional Steps Toggle (between step 5 and 6) */}
          {currentStep === REQUIRED_STEPS - 1 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="text-sm text-blue-700 font-medium flex items-center gap-2 w-full"
              >
                <span>{showOptional ? "▲" : "▼"}</span>
                <span>
                  {showOptional
                    ? t.questionnaire.collapseOptional
                    : t.questionnaire.expandOptional}
                </span>
              </button>
              {showOptional && (
                <div className="mt-3 text-xs text-blue-600">
                  <p className="font-medium mb-1">{t.questionnaire.optionalTitle}</p>
                  <p>{t.questionnaire.optionalDesc}</p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button onClick={handlePrev} className="btn-secondary">
              {currentStep === 0 ? t.nav.home : t.questionnaire.prev}
            </button>

            {currentStep < TOTAL_STEPS - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                {t.questionnaire.next}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary bg-green-600 hover:bg-green-700 active:bg-green-800"
              >
                {submitting ? t.questionnaire.submitting : t.questionnaire.submit}
              </button>
            )}
          </div>

          {/* Completion Preview on last step */}
          {currentStep === TOTAL_STEPS - 1 && (
            <div className="mt-6 card bg-gray-50 text-center">
              <p className="text-sm font-medium text-gray-700">
                {t.questionnaire.completePreview}
              </p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{confidenceLevel}%</p>
              <p className="text-xs text-gray-400 mt-1">{t.questionnaire.submitConfirmDesc}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
