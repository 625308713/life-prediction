const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-4-20250514";

interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

function getAIConfig(): AIConfig | null {
  if (!AI_API_BASE_URL || !AI_API_KEY) {
    return null;
  }
  return {
    baseUrl: AI_API_BASE_URL,
    apiKey: AI_API_KEY,
    model: AI_MODEL,
  };
}

const SYSTEM_PROMPT = `你是一位权威的健康与长寿研究专家，拥有流行病学、预防医学和行为医学背景。
请根据用户提供的健康数据，生成一份专业、温暖、有洞察力的寿命分析报告。

报告结构（Markdown格式）：
## 您的健康长寿画像
（2-3句总体评价，包含预测寿命区间，语气专业且有温度）

## 您的长寿优势
（列出3-5个积极因素，每条50字左右，结合具体数据）

## 值得关注的风险因素
（列出3-5个风险，每条50字左右，避免引发焦虑，客观专业）

## 最值得优先改善的3件事
（具体可行的建议，每条100字左右，包含科学依据）

## 关于您的预测寿命
（对预测结果的解读，强调这是概率区间而非命运，每个人都有改变的能力）

注意：
- 语气温暖专业，不要过分悲观或过分乐观
- 多引用具体的数字和科学研究
- 建议要具体可行，不要泛泛而谈
- 最后加一句鼓励性结语
- 使用中文回复`;

export interface PredictionSummary {
  gender: string;
  age: number;
  bmi: number;
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

export function buildUserMessage(
  data: Record<string, unknown>,
  result: PredictionSummary
): string {
  return `以下是一位用户的健康评估数据摘要：

**基础信息：**
- 性别：${data.gender === "male" ? "男性" : "女性"}
- 年龄：${data.age}岁
- BMI：${data.bmi}
- 腰围：${data.waistCm}cm

**预测结果：**
- 预测寿命区间：${result.adjustedMin} - ${result.adjustedMax} 岁
- 健康寿命：${result.healthLifespan} 岁
- 置信度：${result.confidenceLevel}%
- 同性别同龄百分位：${result.percentile}%

**各维度得分：**
${Object.entries(result.dimensionScores)
  .map(([key, value]) => `- ${key}：${value > 0 ? "+" : ""}${value}`)
  .join("\n")}

**长寿优势因素：**
${result.topStrengths.join("、") || "无显著优势"}

**风险因素：**
${result.topRisks.join("、") || "无显著风险"}

**改善潜力：**
改善TOP3风险因素后，预计可增加 ${result.potentialGain} 年

**完整原始数据：**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

请根据以上数据生成个性化的寿命分析报告。`;
}

export async function generateAIReport(
  data: Record<string, unknown>,
  result: PredictionSummary,
  onProgress?: (chunk: string) => void
): Promise<string | null> {
  const config = getAIConfig();
  if (!config) {
    console.warn("[AI] AI_API_KEY or AI_API_BASE_URL not configured, skipping AI report generation");
    return null;
  }

  const userMessage = buildUserMessage(data, result);

  try {
    const url = `${config.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2048,
        temperature: 0.7,
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
          const parsed = JSON.parse(dataStr) as {
            choices?: { delta?: { content?: string } }[];
          };
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
  }
}
