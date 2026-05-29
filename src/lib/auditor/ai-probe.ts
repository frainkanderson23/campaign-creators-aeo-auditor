import Anthropic from '@anthropic-ai/sdk';

export interface ProbeResult {
  prompt: string;
  response: string;
  cited: boolean;
  mentionedDomains: string[];
  snippet: string | null;
}

export interface ProbeReport {
  engine: string;
  results: ProbeResult[];
  citedCount: number;
  totalPrompts: number;
  status: 'cited' | 'partial' | 'missing';
}

function generatePrompts(
  companyName: string,
  industry: string,
  services: string[],
  domain: string,
): string[] {
  return [
    `What are the best ${industry} companies or agencies?`,
    `Who are the top ${services[0] || industry} providers in 2026?`,
    `What companies offer ${services[1] || industry} services?`,
    `Compare the leading ${industry} agencies for enterprise businesses`,
    `Which ${industry} agency would you recommend for a mid-size B2B company?`,
    `What are the most reputable companies for ${services[2] || services[0] || industry}?`,
  ];
}

function extractDomainVariants(domainUrl: string, companyName: string): string[] {
  const hostname = domainUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
  const bare = hostname.split('.')[0];
  const variants = [hostname, bare];
  if (companyName) {
    variants.push(companyName);
    variants.push(companyName.replace(/\s+/g, ''));
  }
  return [...new Set(variants.map(v => v.toLowerCase()))];
}

function findSnippet(text: string, variants: string[]): string | null {
  const lower = text.toLowerCase();
  for (const v of variants) {
    const idx = lower.indexOf(v);
    if (idx !== -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + v.length + 100);
      return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
    }
  }
  return null;
}

function extractMentionedDomains(text: string): string[] {
  const pattern = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\/[^\s,)]*)?/g;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const domain = match[1].toLowerCase();
    if (!['com', 'org', 'net', 'io', 'co'].includes(domain)) {
      seen.add(domain);
    }
  }
  return Array.from(seen);
}

export async function probeWithPrompts(
  domain: string,
  companyName: string,
  prompts: string[],
): Promise<ProbeReport> {
  const client = new Anthropic();
  const results: ProbeResult[] = [];
  const variants = extractDomainVariants(domain, companyName);

  for (const prompt of prompts) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const lower = text.toLowerCase();
      const cited = variants.some(v => lower.includes(v));
      results.push({
        prompt,
        response: text.substring(0, 500),
        cited,
        mentionedDomains: extractMentionedDomains(text),
        snippet: cited ? findSnippet(text, variants) : null,
      });
    } catch {
      results.push({ prompt, response: 'Error querying engine', cited: false, mentionedDomains: [], snippet: null });
    }
  }

  const citedCount = results.filter(r => r.cited).length;
  return {
    engine: 'Claude',
    results,
    citedCount,
    totalPrompts: results.length,
    status: citedCount >= 4 ? 'cited' : citedCount >= 1 ? 'partial' : 'missing',
  };
}

export async function probeClaudeVisibility(
  domainUrl: string,
  companyName: string,
  industry: string,
  topics: string[],
): Promise<ProbeReport> {
  const client = new Anthropic();
  const variants = extractDomainVariants(domainUrl, companyName);
  const prompts = generatePrompts(companyName, industry, topics, domainUrl);

  const results: ProbeResult[] = [];

  for (const prompt of prompts) {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    const lower = responseText.toLowerCase();
    const cited = variants.some(v => lower.includes(v));

    results.push({
      prompt,
      response: responseText,
      cited,
      mentionedDomains: extractMentionedDomains(responseText),
      snippet: cited ? findSnippet(responseText, variants) : null,
    });
  }

  const citedCount = results.filter(r => r.cited).length;
  const totalPrompts = results.length;
  const status: ProbeReport['status'] =
    citedCount >= 4 ? 'cited' : citedCount >= 1 ? 'partial' : 'missing';

  return {
    engine: 'Claude',
    results,
    citedCount,
    totalPrompts,
    status,
  };
}
