import {
  probeClaudeVisibility,
  probeOpenAI,
  probePerplexity,
  probeGoogleAI,
  type ProbeReport,
} from '@/lib/auditor/ai-probe';
import type { CheckResult } from '@/lib/types';

// Engine weights within the AI Citation score:
//   Claude     30% — authoritative, trained on high-quality web data
//   ChatGPT    30% — highest consumer usage
//   Perplexity 25% — real-time web citations, high intent queries
//   Google AI  15% — lower weight due to AI Overview availability variance
const ENGINE_WEIGHTS = {
  Claude:     0.30,
  ChatGPT:    0.30,
  Perplexity: 0.25,
  'Google AI': 0.15,
};

function probeToScore(report: ProbeReport): number {
  if (report.totalPrompts === 0) return 0;
  return Math.round((report.citedCount / report.totalPrompts) * 100);
}

function probeToStatus(report: ProbeReport): string {
  if (report.status === 'cited')   return 'Cited by AI';
  if (report.status === 'partial') return 'Partially cited';
  return 'Not found';
}

export async function runAiCitationCheck(
  origin: string,
): Promise<Omit<CheckResult, 'id' | 'label' | 'status'>> {
  // Derive a simple company name from the domain
  const hostname = origin.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  const companyName = hostname.split('.')[0];

  // Generic industry/topics — will be improved when we pass company metadata
  const industry = 'digital marketing';
  const topics   = ['marketing automation', 'HubSpot', 'lead generation'];

  const prompts10 = [
    `What are the best ${industry} companies or agencies?`,
    `Who are the top ${topics[0]} providers in 2026?`,
    `What companies offer ${topics[1]} services?`,
    `Compare the leading ${industry} agencies for enterprise businesses`,
    `Which ${industry} agency would you recommend for a mid-size B2B company?`,
    `What are the most reputable companies for ${topics[2]}?`,
    `What ${industry} tools or platforms do experts recommend?`,
    `Who are the emerging leaders in ${topics[0]}?`,
    `What should I look for when choosing a ${industry} partner?`,
    `Best ${topics[1]} solutions for growing companies`,
  ];

  // Run all 4 probes in parallel
  const [claude, chatgpt, perplexity, googleAI] = await Promise.allSettled([
    probeClaudeVisibility(origin, companyName, industry, topics),
    probeOpenAI(origin, companyName, prompts10),
    probePerplexity(origin, companyName, prompts10),
    probeGoogleAI(origin, companyName, prompts10),
  ]);

  const reports: ProbeReport[] = [
    claude.status     === 'fulfilled' ? claude.value     : { engine: 'Claude',     results: [], citedCount: 0, totalPrompts: 0, status: 'missing' },
    chatgpt.status    === 'fulfilled' ? chatgpt.value    : { engine: 'ChatGPT',    results: [], citedCount: 0, totalPrompts: 0, status: 'missing' },
    perplexity.status === 'fulfilled' ? perplexity.value : { engine: 'Perplexity', results: [], citedCount: 0, totalPrompts: 0, status: 'missing' },
    googleAI.status   === 'fulfilled' ? googleAI.value   : { engine: 'Google AI',  results: [], citedCount: 0, totalPrompts: 0, status: 'missing' },
  ];

  // Weighted composite score
  const weightedScore = reports.reduce((sum, report) => {
    const weight = ENGINE_WEIGHTS[report.engine as keyof typeof ENGINE_WEIGHTS] ?? 0;
    return sum + probeToScore(report) * weight;
  }, 0);

  const score = Math.round(weightedScore);

  const findings = reports.map((r) => ({
    severity: (r.status === 'missing' ? 'critical' : r.status === 'partial' ? 'warning' : 'info') as 'critical' | 'warning' | 'info',
    text: `${r.engine}: ${probeToStatus(r)} — ${r.citedCount}/${r.totalPrompts} prompts`,
  }));

  const recommendations: string[] = [];
  const missingEngines = reports.filter(r => r.status === 'missing').map(r => r.engine);
  if (missingEngines.length > 0) {
    recommendations.push(
      `Not cited by: ${missingEngines.join(', ')}. Build topical authority content targeting your core service categories.`
    );
  }
  const partialEngines = reports.filter(r => r.status === 'partial').map(r => r.engine);
  if (partialEngines.length > 0) {
    recommendations.push(
      `Partially cited by: ${partialEngines.join(', ')}. Increase brand mention frequency across authoritative third-party sources.`
    );
  }
  if (score >= 60) {
    recommendations.push('Strong AI citation presence. Focus on maintaining freshness and expanding topical coverage.');
  }

  const grade =
    score >= 90 ? 'A' :
    score >= 80 ? 'B' :
    score >= 70 ? 'C' :
    score >= 60 ? 'D' : 'F';

  return { score, grade, findings, recommendations };
}
