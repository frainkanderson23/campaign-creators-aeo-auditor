import { fetchResource } from '@/lib/auditor/fetch';
import { scoreToGrade, type CheckResult, type Finding } from '@/lib/types';

interface BotSpec {
  name: string;
  vendor: string;
  product: string;
}

const BOTS: BotSpec[] = [
  { name: 'GPTBot', vendor: 'OpenAI', product: 'ChatGPT' },
  { name: 'ClaudeBot', vendor: 'Anthropic', product: 'Claude' },
  { name: 'PerplexityBot', vendor: 'Perplexity', product: 'Perplexity' },
  { name: 'Google-Extended', vendor: 'Google', product: 'Gemini / AI Overviews' },
  { name: 'CCBot', vendor: 'Common Crawl', product: 'Common Crawl (LLM training data)' },
  { name: 'Bytespider', vendor: 'ByteDance', product: 'Doubao / TikTok AI' },
];

type Verdict = 'allowed' | 'blocked' | 'absent';

interface RobotsGroup {
  agents: string[];
  rules: Array<{ type: 'allow' | 'disallow'; path: string }>;
}

function parseRobotsTxt(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let pendingAgents: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const sepIdx = line.indexOf(':');
    if (sepIdx === -1) continue;

    const field = line.slice(0, sepIdx).trim().toLowerCase();
    const value = line.slice(sepIdx + 1).trim();
    if (!value) continue;

    if (field === 'user-agent') {
      if (current && current.rules.length > 0) {
        groups.push(current);
        current = null;
        pendingAgents = [];
      }
      pendingAgents.push(value);
      if (!current) {
        current = { agents: [...pendingAgents], rules: [] };
      } else {
        current.agents = [...pendingAgents];
      }
    } else if (field === 'allow' || field === 'disallow') {
      if (!current) {
        current = { agents: [...pendingAgents], rules: [] };
      }
      current.rules.push({ type: field, path: value });
      pendingAgents = [];
    }
  }

  if (current && current.rules.length > 0) groups.push(current);
  return groups;
}

function verdictForBot(bot: BotSpec, groups: RobotsGroup[]): Verdict {
  const matching = groups.filter((g) =>
    g.agents.some((a) => a.toLowerCase() === bot.name.toLowerCase()),
  );

  if (matching.length === 0) return 'absent';

  // If any matching group has Disallow: / for this agent specifically, blocked.
  for (const group of matching) {
    for (const rule of group.rules) {
      if (rule.type === 'disallow' && rule.path === '/') return 'blocked';
    }
  }
  return 'allowed';
}

export async function runCrawlabilityCheck(
  origin: string,
): Promise<Omit<CheckResult, 'id' | 'label' | 'status'>> {
  const robotsUrl = `${origin}/robots.txt`;
  const res = await fetchResource(robotsUrl);

  const findings: Finding[] = [];
  const recommendations: string[] = [];

  // No robots.txt at all → treat all bots as "absent" (neutral) but flag the missing file.
  if (!res || res.status === 404) {
    let score = 0;
    for (let i = 0; i < BOTS.length; i += 1) score += 5;
    findings.push({
      severity: 'info',
      text: 'No robots.txt was found. All AI crawlers are technically allowed by default, but you have no explicit signal.',
    });
    recommendations.push(
      'Publish a robots.txt at /robots.txt with explicit Allow entries for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).',
    );
    return {
      score: Math.min(100, Math.max(0, score)),
      grade: scoreToGrade(Math.min(100, Math.max(0, score))),
      findings,
      recommendations,
    };
  }

  if (!res.ok) {
    findings.push({
      severity: 'warning',
      text: `robots.txt returned HTTP ${res.status}. Crawlers may interpret this as a soft block.`,
    });
    recommendations.push(
      'Serve robots.txt with HTTP 200 and explicit Allow rules for AI bots.',
    );
  }

  const groups = parseRobotsTxt(res.text || '');

  let score = 0;
  for (const bot of BOTS) {
    const verdict = verdictForBot(bot, groups);
    if (verdict === 'allowed') {
      score += 15;
      findings.push({
        severity: 'info',
        text: `${bot.name} (${bot.vendor}) is explicitly allowed — ${bot.product} can discover your content.`,
      });
    } else if (verdict === 'blocked') {
      score -= 10;
      findings.push({
        severity: 'critical',
        text: `${bot.name} (${bot.vendor}) is blocked — ${bot.product} cannot discover your content.`,
      });
      recommendations.push(
        `Remove the Disallow: / rule for ${bot.name} in robots.txt to enable ${bot.product} visibility.`,
      );
    } else {
      score += 5;
      findings.push({
        severity: 'info',
        text: `${bot.name} (${bot.vendor}) is not mentioned in robots.txt — ${bot.product} is technically allowed by default.`,
      });
      recommendations.push(
        `Add an explicit "User-agent: ${bot.name}" block with Allow: / so ${bot.product} has a clear signal.`,
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
