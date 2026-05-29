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
  topics: string[],
): string[] {
  const prompts: string[] = [];
  const name = companyName || industry || 'businesses';

  if (industry) {
    prompts.push(`What are the best ${industry} companies or agencies?`);
    prompts.push(`Compare the leading ${industry} solutions available in 2026`);
    prompts.push(`What ${industry} agency would you recommend for growing a business?`);
  }

  for (const topic of topics.slice(0, 3)) {
    prompts.push(`Who are the top ${topic} providers in 2026?`);
    prompts.push(`Which companies are known for ${topic}?`);
    prompts.push(`What companies offer services related to ${topic}?`);
    if (prompts.length >= 6) break;
  }

  if (prompts.length < 6) {
    prompts.push(`What companies offer services similar to ${name}?`);
  }

  return prompts.slice(0, 6);
}

function extractDomainVariants(domainUrl: string, companyName: string): string[] {
  const hostname = domainUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^www\./, '');
  const bare = hostname.split('.')[0];
  const variants = [hostname, bare];
  if (companyName) variants.push(companyName);
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

export async function probeClaudeVisibility(
  domainUrl: string,
  companyName: string,
  industry: string,
  topics: string[],
): Promise<ProbeReport> {
  const client = new Anthropic();
  const variants = extractDomainVariants(domainUrl, companyName);
  const prompts = generatePrompts(companyName, industry, topics);

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
