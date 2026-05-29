import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

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

export async function probeOpenAI(
  domain: string,
  companyName: string,
  prompts: string[],
): Promise<ProbeReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { engine: 'ChatGPT', results: [], citedCount: 0, totalPrompts: 0, status: 'missing' };

  const client = new OpenAI({ apiKey });
  const results: ProbeResult[] = [];
  const variants = extractDomainVariants(domain, companyName);

  for (const prompt of prompts) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0]?.message?.content || '';
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
    engine: 'ChatGPT',
    results,
    citedCount,
    totalPrompts: results.length,
    status: citedCount >= 4 ? 'cited' : citedCount >= 1 ? 'partial' : 'missing',
  };
}

export async function probePerplexity(
  domain: string,
  companyName: string,
  prompts: string[],
): Promise<ProbeReport> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return { engine: 'Perplexity', results: [], citedCount: 0, totalPrompts: 0, status: 'missing' };

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.perplexity.ai',
  });
  const results: ProbeResult[] = [];
  const variants = extractDomainVariants(domain, companyName);

  for (const prompt of prompts) {
    try {
      const response = await client.chat.completions.create({
        model: 'sonar',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.choices[0]?.message?.content || '';
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
    engine: 'Perplexity',
    results,
    citedCount,
    totalPrompts: results.length,
    status: citedCount >= 4 ? 'cited' : citedCount >= 1 ? 'partial' : 'missing',
  };
}

export async function probeGoogleAI(
  domain: string,
  companyName: string,
  prompts: string[],
): Promise<ProbeReport> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return { engine: 'Google AI', results: [], citedCount: 0, totalPrompts: 0, status: 'missing' };

  const results: ProbeResult[] = [];
  const domainLower = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
  const nameLower = companyName.toLowerCase();

  for (const prompt of prompts) {
    try {
      const params = new URLSearchParams({
        q: prompt,
        api_key: apiKey,
        engine: 'google',
        gl: 'us',
        hl: 'en',
      });

      const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
      const data = await res.json();

      const aiOverview = data.ai_overview;
      let aiText = '';
      let cited = false;

      if (aiOverview) {
        if (aiOverview.text_blocks) {
          aiText = aiOverview.text_blocks.map((b: { snippet?: string; text?: string }) => b.snippet || b.text || '').join(' ');
        } else if (aiOverview.snippet) {
          aiText = aiOverview.snippet;
        } else if (typeof aiOverview === 'string') {
          aiText = aiOverview;
        } else {
          aiText = JSON.stringify(aiOverview).substring(0, 1000);
        }

        const lower = aiText.toLowerCase();
        cited = lower.includes(domainLower) || lower.includes(nameLower);

        if (!cited && aiOverview.sources) {
          for (const source of aiOverview.sources) {
            if (source.link?.toLowerCase().includes(domainLower) ||
                source.title?.toLowerCase().includes(nameLower)) {
              cited = true;
              break;
            }
          }
        }
      } else {
        aiText = 'No AI Overview appeared for this query';
      }

      results.push({
        prompt,
        response: aiText.substring(0, 500),
        cited,
        mentionedDomains: [],
        snippet: cited ? findSnippet(aiText, [domainLower, nameLower]) : null,
      });
    } catch {
      results.push({ prompt, response: 'Error querying Google', cited: false, mentionedDomains: [], snippet: null });
    }
  }

  const citedCount = results.filter(r => r.cited).length;
  return {
    engine: 'Google AI',
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
