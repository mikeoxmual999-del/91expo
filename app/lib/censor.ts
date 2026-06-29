export const chineseTerms = [
  "诈骗",
  "欺诈",
  "违法",
  "黑心",
  "坑人",
  "曝光",
  "举报",
  "犯罪",
  "维权平台",
  "黑名单",
  "骗子",
  "黑幕",
];

export const latinTerms = ["sb", "cnm", "nmsl", "tmd"];

type MaskResult = {
  cleaned: string;
  masked: string[];
};

type ComplianceResult = {
  compliant: boolean;
  reasons: string[];
  suggestion: string;
  flaggedSpans: string[];
};

type Span = {
  start: number;
  end: number;
  value: string;
};

const LATIN_BOUNDARY = "[A-Za-z0-9]";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getToken(text: string, start: number, end: number) {
  let tokenStart = start;
  let tokenEnd = end;

  while (tokenStart > 0 && !/\s/.test(text[tokenStart - 1])) tokenStart -= 1;
  while (tokenEnd < text.length && !/\s/.test(text[tokenEnd])) tokenEnd += 1;

  return text.slice(tokenStart, tokenEnd);
}

function isStandaloneLatinHit(text: string, start: number, end: number, term: string) {
  const token = getToken(text, start, end);
  if (/\d/.test(token)) return false;
  if (/(:\/\/|^www\.|[./\\?#=&_%+-])/.test(token)) return false;

  const stripped = token
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[^A-Za-z0-9]+$/, "");

  return stripped.toLowerCase() === term.toLowerCase();
}

export function maskHardWords(text: string): MaskResult {
  const input = String(text ?? "");
  const spans: Span[] = [];

  for (const term of chineseTerms) {
    let index = input.indexOf(term);
    while (index !== -1) {
      spans.push({ start: index, end: index + term.length, value: term });
      index = input.indexOf(term, index + term.length);
    }
  }

  for (const term of latinTerms) {
    const regex = new RegExp(
      `(?<!${LATIN_BOUNDARY})${escapeRegExp(term)}(?!${LATIN_BOUNDARY})`,
      "gi"
    );

    for (const match of input.matchAll(regex)) {
      const start = match.index ?? -1;
      if (start < 0) continue;

      const end = start + match[0].length;
      if (!isStandaloneLatinHit(input, start, end, term)) continue;

      spans.push({ start, end, value: match[0] });
    }
  }

  if (spans.length === 0) return { cleaned: input, masked: [] };

  const mask = input.split("");
  const masked: string[] = [];

  for (const span of spans) {
    masked.push(span.value);
    for (let i = span.start; i < span.end; i += 1) {
      mask[i] = "※";
    }
  }

  return { cleaned: mask.join(""), masked };
}

function normalizeComplianceResult(value: unknown): ComplianceResult {
  if (!value || typeof value !== "object") {
    throw new Error("Compliance response was not an object");
  }

  const result = value as Partial<ComplianceResult>;
  if (typeof result.compliant !== "boolean") {
    throw new Error("Compliance response missing boolean compliant field");
  }

  return {
    compliant: result.compliant,
    reasons: Array.isArray(result.reasons)
      ? result.reasons.filter((reason): reason is string => typeof reason === "string")
      : [],
    suggestion: typeof result.suggestion === "string" ? result.suggestion : "",
    flaggedSpans: Array.isArray(result.flaggedSpans)
      ? result.flaggedSpans.filter((span): span is string => typeof span === "string" && span.length > 0)
      : [],
  };
}

export async function checkCompliance(text: string): Promise<ComplianceResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            'You are a very lenient compliance judge for a consumer dispute documentation platform. The platform exists so users can record factual complaints about companies, banks, merchants, customer service, fees, refunds, products, contracts, and similar disputes. This is the core purpose and must be allowed. Default to {"compliant": true} unless the post clearly and egregiously violates one of the rules below. When in doubt, allow.\n\nALLOW these as compliant, even when they describe company wrongdoing: factual first-person accounts; dates, amounts, names of institutions, and specific events; phrases like "擅自扣费", "未充分告知", "客服拒绝退款", "要求退还", "多次联系未解决"; neutral documentary descriptions of problems; user demands for refund, explanation, repair, compensation, cancellation, or apology.\n\nONLY mark non-compliant when the post clearly does one of these:\n1. Uses explicitly inflammatory direct accusations such as 诈骗, 欺诈, 犯罪, 黑心, 骗子, 黑幕, or similar as direct attacks. These terms may already be hard-masked before display, so only flag if the remaining framing is still inflammatory, abusive, or accusatory beyond a factual complaint.\n2. Calls for illegal action, violence, threats, doxxing, harassment, brigading, or revenge against a person or company.\n3. States clearly fabricated or defamatory claims as proven facts with no factual grounding, especially broad attacks like "所有员工都是骗子" or "这家公司专门犯罪".\n\nDo NOT block merely because the user says a company did something wrong. Do NOT require legal proof. Do NOT treat specific factual allegations as defamatory when the user provides context such as date, amount, service, transaction, communication, or requested remedy. The example "2026年6月10日，本人在招商银行办理信用卡分期业务，银行在未充分告知手续费标准的情况下，擅自从账户扣取手续费共计850元。多次致电客服要求说明扣费依据，客服以合同条款已说明为由拒绝退款。" is compliant and should pass.\n\nReturn strict JSON only in this exact shape: {"compliant": boolean, "reasons": string[], "suggestion": string, "flaggedSpans": string[]}. If compliant, reasons must be [], suggestion must be "", and flaggedSpans must be []. If non-compliant, reasons must be Mandarin-first, with any English explanation secondary and shorter. suggestion should rewrite the content into neutral, factual, documentary language, using Mandarin when the input is Mandarin. flaggedSpans must contain only the exact problematic substrings copied verbatim from the user input, with no paraphrases and no surrounding safe text.',
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI compliance check failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI compliance response did not include message content");
  }

  return normalizeComplianceResult(JSON.parse(content));
}
