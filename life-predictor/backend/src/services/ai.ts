const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "";

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

function getAIConfig(): AIConfig | null {
  if (!AI_API_BASE_URL || !AI_API_KEY || !AI_MODEL) {
    return null;
  }
  return {
    baseUrl: AI_API_BASE_URL,
    apiKey: AI_API_KEY,
    model: AI_MODEL,
  };
}

export function isAIReportEnabled(): boolean {
  return getAIConfig() !== null;
}

export type ReportLanguage = "zh" | "en";

const SYSTEM_PROMPTS: Record<ReportLanguage, string> = {
  zh: `你是一位谨慎、温暖的健康教育顾问，熟悉流行病学、预防医学和行为改变方法。
请根据用户提供的健康数据，生成一份专业、克制、有洞察力的 LifeScore 健康寿命画像解读。

报告结构（Markdown格式）：
## 您的健康长寿画像
（2-3句总体评价，可以提到估计区间，但要强调这是问卷生成的概率画像，不是诊断或确定预言）

## 您的长寿优势
（列出3-5个积极因素，每条50字左右，结合具体数据）

## 值得关注的风险因素
（列出3-5个风险，每条50字左右，避免引发焦虑，客观专业）

## 最值得优先改善的3件事
（具体可行的建议，每条100字左右，优先给小行动，不给治疗方案）

## 如何理解这个结果区间
（说明 LifeScore 是健康教育和自我观察工具，结果区间是基于问卷信号的估计，不代表医学诊断）

注意：
- 语气温暖专业，不要过分悲观或过分乐观
- 可以解释公开健康常识，但不要编造具体研究、论文名或夸大因果
- 建议要具体可行，不要泛泛而谈
- 如果涉及血压、血糖、体重快速变化、长期不适或严重症状，提醒用户咨询医生
- 最后加一句鼓励性结语
- 使用中文回复`,
  en: `You are a careful, warm health-education advisor familiar with epidemiology, preventive medicine, and behavior-change methods.
Based on the user's health data, write a professional, measured, insightful interpretation of their LifeScore health-span profile.

Report structure (Markdown):
## Your Health-Span Profile
(2-3 sentences of overall assessment; you may mention the estimated range, but stress that this is a probability-based profile from a questionnaire, not a diagnosis or a fixed prediction)

## Your Longevity Strengths
(3-5 positive factors, about 25 words each, grounded in the actual data)

## Risk Factors Worth Watching
(3-5 risks, about 25 words each, objective and professional without causing anxiety)

## The 3 Highest-Priority Improvements
(Specific, doable suggestions, about 50 words each; prefer small actions, never treatment plans)

## How to Read This Result Range
(Explain that LifeScore is a health-education and self-reflection tool; the range is an estimate from questionnaire signals, not a medical diagnosis)

Notes:
- Warm and professional tone; neither overly pessimistic nor overly optimistic
- You may explain public health knowledge, but never invent specific studies, paper titles, or overstate causality
- Suggestions must be concrete and actionable, not generic
- If blood pressure, blood sugar, rapid weight change, ongoing discomfort, or serious symptoms are involved, remind the user to consult a clinician
- End with one encouraging closing line
- Respond in English`,
};

export interface PredictionSummary {
  gender: string;
  age: number;
  bmi: number;
  baselineLifeExpectancy: number;
  adjustedLifeExpectancy: number;
  baseLifeExpectancy: number;
  adjustedMin: number;
  adjustedMax: number;
  healthLifespan: number;
  dimensionScores: Record<string, number>;
  topRisks: string[];
  topStrengths: string[];
  potentialGain: number;
  confidenceLevel: number;
  percentile: number;
}

// Only fields the scoring algorithm actually consumes are forwarded to the
// third-party AI endpoint. Free-text and unused questionnaire fields stay local.
const AI_INPUT_FIELDS = [
  "age",
  "gender",
  "bmi",
  "waistCm",
  "region",
  "diagnosedConditions",
  "chronicDiseases",
  "cancerHistory",
  "bloodPressure",
  "bloodPressureKnown",
  "bpSystolic",
  "bpDiastolic",
  "bloodSugar",
  "bloodSugarKnown",
  "a1c",
  "fastingGlucose",
  "ldlCholesterol",
  "cholesterolLevel",
  "regularCheckup",
  "parentLongevity",
  "familyMemberAbove90",
  "familyAlzheimers",
  "familyParkinsons",
  "familyHeartDisease",
  "familyCancer",
  "smokingStatus",
  "smokingAmount",
  "alcoholConsumption",
  "alcoholPattern",
  "exerciseFrequency",
  "activityMinutesPerWeek",
  "muscleStrengthening",
  "sedentaryHours",
  "dietPattern",
  "dietFruitVegDays",
  "processedFoodFrequency",
  "sleepHours",
  "sleepDurationRange",
  "sleepQuality",
  "snoreOrApnea",
  "untreatedSleepApnea",
  "bedtimeRange",
  "happinessScore",
  "chronicStress",
  "stressFrequency",
  "depressionTendency",
  "stablePartner",
  "socialActivity",
  "socialConnection",
  "senseOfPurpose",
  "purposeLevel",
  "educationLevel",
  "highRiskOccupation",
  "weeklyWorkHours",
  "longTermNoise",
  "airPollutionExposure",
  "secondhandSmoke",
  "frequentIllness",
  "autoimmuneDisease",
  "chronicInflammation",
  "distanceToHospital",
  "commercialInsurance",
  "recentCheckupCount",
  "hasFamilyDoctor",
  "cancerScreeningStatus",
  "dentalCheckup",
  "restingHeartRate",
  "vo2maxLevel",
  "gripStrength",
  "climbThreeFloors",
  "walkingPace",
  "unintendedWeightLoss",
  "highRiskBehaviors",
] as const;

function pickAIInputFields(
  data: Record<string, unknown>
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const field of AI_INPUT_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === "") continue;
    if (value === "unknown" || value === "not_sure" || value === "prefer_not") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    picked[field] = value;
  }
  return picked;
}

export function buildUserMessage(
  data: Record<string, unknown>,
  result: PredictionSummary,
  language: ReportLanguage = "zh"
): string {
  const answers = pickAIInputFields(data);
  const answersJson = JSON.stringify(answers, null, 2);
  const dimensions = Object.entries(result.dimensionScores)
    .map(([key, value]) => `- ${key}：${value > 0 ? "+" : ""}${value}`)
    .join("\n");

  if (language === "en") {
    return `Here is a summary of one user's health assessment:

**Basics:**
- Gender: ${data.gender === "male" ? "male" : "female"}
- Age: ${data.age}
- BMI: ${data.bmi}
- Waist: ${data.waistCm} cm

**LifeScore result summary:**
- Estimated result range: ${result.adjustedMin} - ${result.adjustedMax} years
- Healthy lifespan: ${result.healthLifespan} years
- Confidence: ${result.confidenceLevel}%
- Same-gender peer percentile: ${result.percentile}%

**Dimension scores:**
${dimensions}

**Longevity strengths:**
${result.topStrengths.join(", ") || "No notable strengths"}

**Risk factors:**
${result.topRisks.join(", ") || "No notable risks"}

**Improvement potential:**
Addressing the top 3 risks could theoretically unlock about ${result.potentialGain} years.

**Questionnaire answers (relevant fields only):**
\`\`\`json
${answersJson}
\`\`\`

Please write the personalized LifeScore interpretation based on this data.`;
  }

  return `以下是一位用户的健康评估数据摘要：

**基础信息：**
- 性别：${data.gender === "male" ? "男性" : "女性"}
- 年龄：${data.age}岁
- BMI：${data.bmi}
- 腰围：${data.waistCm}cm

**LifeScore 结果摘要：**
- 估计结果区间：${result.adjustedMin} - ${result.adjustedMax} 岁
- 健康寿命：${result.healthLifespan} 岁
- 置信度：${result.confidenceLevel}%
- 同性别同龄百分位：${result.percentile}%

**各维度得分：**
${dimensions}

**长寿优势因素：**
${result.topStrengths.join("、") || "无显著优势"}

**风险因素：**
${result.topRisks.join("、") || "无显著风险"}

**改善潜力：**
优先处理TOP3风险因素后，理论改善空间约 ${result.potentialGain} 年

**问卷作答摘要（仅含参与计算的字段）：**
\`\`\`json
${answersJson}
\`\`\`

请根据以上数据生成个性化的 LifeScore 解读报告。`;
}

export async function generateAIReport(
  data: Record<string, unknown>,
  result: PredictionSummary,
  language: ReportLanguage = "zh",
  onProgress?: (chunk: string) => void
): Promise<string | null> {
  const config = getAIConfig();
  if (!config) {
    console.warn("[AI] AI_API_BASE_URL, AI_API_KEY, or AI_MODEL not configured, skipping AI report generation");
    return null;
  }

  const userMessage = buildUserMessage(data, result, language);

  // A hung upstream request must never hold a connection (and a provider
  // concurrency slot) open indefinitely.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    // Tolerate base URLs given with or without a trailing /v1.
    const normalizedBase = config.baseUrl
      .replace(/\/+$/, "")
      .replace(/\/v1$/, "");
    const url = `${normalizedBase}/v1/chat/completions`;

    const response = await fetch(url, {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[language] },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2048,
        // Reasoning-style models reject non-default temperatures, so only
        // send one when explicitly configured via AI_TEMPERATURE.
        ...(process.env.AI_TEMPERATURE
          ? { temperature: parseFloat(process.env.AI_TEMPERATURE) }
          : {}),
        stream: !!onProgress,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[AI] API request failed: ${response.status} ${errorText}`
      );
      return null;
    }

    if (!onProgress) {
      const json = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      return json.choices?.[0]?.message?.content || null;
    }

    // Streaming mode
    const reader = response.body?.getReader();
    if (!reader) return null;

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            onProgress(content);
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }

    return fullContent || null;
  } catch (error) {
    console.error("[AI] Report generation failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
