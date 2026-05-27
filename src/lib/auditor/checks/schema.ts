import * as cheerio from 'cheerio';
import { fetchResource } from '@/lib/auditor/fetch';
import { scoreToGrade, type CheckResult, type Finding } from '@/lib/types';

interface SchemaSpec {
  type: string;
  label: string;
  whyItMatters: string;
  requiredKeys?: string[];
}

const SCHEMAS: SchemaSpec[] = [
  {
    type: 'Organization',
    label: 'Organization',
    whyItMatters:
      "AI assistants use Organization schema to understand who you are, what you do, and how to cite you.",
    requiredKeys: ['name'],
  },
  {
    type: 'FAQPage',
    label: 'FAQPage',
    whyItMatters:
      'FAQ schema is the single biggest signal for direct answer surfaces in AI search.',
  },
  {
    type: 'HowTo',
    label: 'HowTo',
    whyItMatters:
      'HowTo schema gives AI assistants structured step-by-step content they can quote.',
  },
  {
    type: 'Article',
    label: 'Article',
    whyItMatters: 'Article schema tells AI which pages are editorial content worth citing.',
  },
  {
    type: 'Person',
    label: 'Author / Person',
    whyItMatters: 'Author markup signals E-E-A-T — who wrote this, why should an AI trust it.',
  },
  {
    type: 'Product',
    label: 'Product',
    whyItMatters: 'Product schema unlocks AI shopping surfaces and direct product answers.',
  },
  {
    type: 'BreadcrumbList',
    label: 'BreadcrumbList',
    whyItMatters: 'Breadcrumbs help AI assistants understand your site hierarchy and topical structure.',
  },
];

interface ExtractedNode {
  type: string;
  raw: Record<string, unknown>;
}

function extractTypes(node: unknown, out: ExtractedNode[]): void {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) extractTypes(item, out);
    return;
  }
  if (typeof node !== 'object') return;

  const obj = node as Record<string, unknown>;

  if ('@graph' in obj) {
    extractTypes(obj['@graph'], out);
  }

  const rawType = obj['@type'];
  if (rawType) {
    const types = Array.isArray(rawType) ? rawType : [rawType];
    for (const t of types) {
      if (typeof t === 'string') out.push({ type: t, raw: obj });
    }
  }

  // Recurse into known nested fields (author, publisher) so e.g. Person nested inside Article gets counted.
  for (const key of ['author', 'publisher', 'creator', 'mainEntity']) {
    if (key in obj) extractTypes(obj[key], out);
  }
}

export async function runSchemaCheck(
  origin: string,
): Promise<Omit<CheckResult, 'id' | 'label' | 'status'>> {
  const res = await fetchResource(origin);

  const findings: Finding[] = [];
  const recommendations: string[] = [];

  if (!res || !res.ok) {
    findings.push({
      severity: 'critical',
      text: `Could not fetch the homepage (status ${res?.status ?? 'unreachable'}). Schema markup could not be evaluated.`,
    });
    recommendations.push(
      'Ensure your homepage returns HTTP 200 to standard user agents so AI crawlers can read it.',
    );
    return {
      score: 0,
      grade: scoreToGrade(0),
      findings,
      recommendations,
    };
  }

  const $ = cheerio.load(res.text);
  const blocks = $('script[type="application/ld+json"]');

  const extracted: ExtractedNode[] = [];
  let parseErrors = 0;

  blocks.each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      extractTypes(parsed, extracted);
    } catch {
      parseErrors += 1;
    }
  });

  if (parseErrors > 0) {
    findings.push({
      severity: 'warning',
      text: `${parseErrors} JSON-LD block(s) failed to parse — invalid JSON breaks structured data for every AI crawler.`,
    });
    recommendations.push(
      'Validate every JSON-LD block with a parser; even one syntax error invalidates an entire block.',
    );
  }

  if (extracted.length === 0) {
    findings.push({
      severity: 'critical',
      text: 'No JSON-LD structured data was found on the homepage.',
    });
    recommendations.push(
      'Add JSON-LD structured data — at minimum Organization on the homepage and Article on content pages.',
    );
    return {
      score: 0,
      grade: scoreToGrade(0),
      findings,
      recommendations,
    };
  }

  const presentTypes = new Set(extracted.map((e) => e.type));

  let score = 0;
  for (const spec of SCHEMAS) {
    if (presentTypes.has(spec.type)) {
      score += 15;
      // Bonus: required keys are populated.
      const node = extracted.find((e) => e.type === spec.type);
      const missingKeys = (spec.requiredKeys ?? []).filter(
        (k) => !node || !(k in node.raw) || !node.raw[k],
      );
      if (missingKeys.length === 0) {
        score += 1; // small bonus for completeness
        findings.push({
          severity: 'info',
          text: `${spec.label} schema is present and complete.`,
        });
      } else {
        findings.push({
          severity: 'warning',
          text: `${spec.label} schema is present but missing: ${missingKeys.join(', ')}.`,
        });
        recommendations.push(
          `Populate ${missingKeys.join(', ')} on your ${spec.label} JSON-LD block.`,
        );
      }
    } else {
      findings.push({
        severity: 'warning',
        text: `${spec.label} schema is missing. ${spec.whyItMatters}`,
      });
      recommendations.push(
        `Add ${spec.label} JSON-LD to your site. ${spec.whyItMatters}`,
      );
    }
  }

  const clamped = Math.min(100, Math.max(0, score));
  return {
    score: clamped,
    grade: scoreToGrade(clamped),
    findings,
    recommendations,
  };
}
