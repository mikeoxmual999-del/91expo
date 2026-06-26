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
            'You are a compliance judge for a neutral consumer/business dispute records platform. Judge ONLY whether the submitted post: (a) accuses a company of wrongdoing, (b) claims facts are proven, or (c) rants or uses aggressive non-neutral framing. Be LENIENT: only flag CLEAR violations, give the benefit of the doubt when borderline, and default to compliant when uncertain. Return strict JSON only in this exact shape: {"compliant": boolean, "reasons": string[], "suggestion": string}. If non-compliant, suggestion should rewrite the content in neutral, factual, unproven-claim language.',
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
