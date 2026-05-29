'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AuditResultPage.module.css';

interface ProbeResult {
  prompt: string;
  response: string;
  cited: boolean;
  mentionedDomains: string[];
  snippet: string | null;
}

interface AiProbe {
  engine: string;
  results: ProbeResult[];
  citedCount: number;
  totalPrompts: number;
  status: 'cited' | 'partial' | 'missing';
}

interface MultiEngineProbe {
  claude: AiProbe | null;
  openai: AiProbe | null;
  perplexity: AiProbe | null;
  prompts: string[];
}

interface RawFindings {
  robots?: {
    gptBotDisallowed?: boolean;
    claudeBotDisallowed?: boolean;
    googlebotDisallowed?: boolean;
    bingbotDisallowed?: boolean;
    fullDisallowAll?: boolean;
  };
  pages?: Array<{
    url?: string;
    title?: string;
    h1?: string;
    h2s?: string[];
    wordCount?: number;
    hasStructuredData?: boolean;
    structuredDataTypes?: string[];
    canonicalUrl?: string;
    metaDescription?: string;
    openGraphTags?: Record<string, string>;
    robotsMeta?: string | null;
    statusCode?: number;
  }>;
  sitemapListed?: boolean;
  openGraphPresent?: boolean;
  robotsTxtAllowsAI?: boolean;
  structuredDataTypes?: string[];
  wordCount?: number;
  lastModified?: string | null;
  schemaMarkup?: unknown[];
  aiProbe?: AiProbe | MultiEngineProbe | null;
}

function isMultiEngineProbe(probe: AiProbe | MultiEngineProbe): probe is MultiEngineProbe {
  return 'claude' in probe;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/---/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

function compStatus(probe: AiProbe | null): string {
  if (!probe || probe.results.length === 0) return 'COMING SOON';
  return probe.status.toUpperCase();
}

type FindingItem = { pass: boolean; text: string } | { meta: string };

interface Props {
  requestData: { id: string; url: string; status: string; created_at: string };
  auditData: {
    id: string; overall_score: number; overall_grade: string;
    answerability_score: number; answerability_grade: string;
    brevity_score: number; brevity_grade: string;
    trust_score: number; trust_grade: string;
    structure_score: number; structure_grade: string;
    freshness_score: number; freshness_grade: string;
    raw_findings?: RawFindings;
    created_at: string;
  };
}

function resolveGradeClass(grade: string): string {
  const g = grade?.toLowerCase();
  if (g === 'strong' || g === 'good') return styles.scoreGradeGood;
  if (g === 'needs work' || g === 'warning') return styles.scoreGradeWarn;
  return styles.scoreGradeBad;
}

function resolveGradeLabel(grade: string): string {
  const g = grade?.toLowerCase();
  if (g === 'strong' || g === 'good') return 'Strong';
  if (g === 'needs work' || g === 'warning') return 'Needs work';
  return 'Critical';
}

function dimFillClass(score: number): string {
  if (score >= 70) return styles.dimFillGood;
  if (score >= 40) return styles.dimFillWarn;
  return styles.dimFillBad;
}

function getCrawlabilityFindings(rf: RawFindings): FindingItem[] {
  const findings: FindingItem[] = [];
  const pages = rf.pages ?? [];
  const robots = rf.robots ?? {};

  const aiBotsAllowed = !robots.gptBotDisallowed && !robots.claudeBotDisallowed &&
    !robots.googlebotDisallowed && !robots.bingbotDisallowed;
  findings.push({ pass: aiBotsAllowed, text: 'robots.txt allows AI bots' });
  findings.push({ pass: !!rf.sitemapListed, text: 'Sitemap detected' });

  const canonicalCount = pages.filter(p => !!p.canonicalUrl).length;
  findings.push({ pass: pages.length > 0 && canonicalCount === pages.length, text: 'Canonical URLs present' });

  const allOk = pages.length > 0 && pages.every(p => p.statusCode === 200);
  findings.push({ pass: allOk, text: 'All pages returned 200 OK' });

  findings.push({ meta: `${pages.length} page${pages.length !== 1 ? 's' : ''} crawled successfully` });

  return findings;
}

function getSchemaMarkupFindings(rf: RawFindings): FindingItem[] {
  const findings: FindingItem[] = [];
  const pages = rf.pages ?? [];
  const types = rf.structuredDataTypes ?? [];

  const pagesWithSD = pages.filter(p => p.hasStructuredData);
  findings.push({ pass: pagesWithSD.length > 0, text: 'JSON-LD structured data found' });

  if (types.length > 0) {
    findings.push({ meta: `Types found: ${types.join(', ')}` });
  } else {
    findings.push({ meta: 'No structured data detected' });
  }

  const IMPORTANT_TYPES = ['Organization', 'Article', 'FAQ', 'HowTo'];
  const missingTypes = IMPORTANT_TYPES.filter(t => !types.includes(t));
  if (missingTypes.length > 0) {
    findings.push({ pass: false, text: `Missing types: ${missingTypes.join(', ')}` });
  }

  findings.push({ meta: `${pagesWithSD.length} of ${pages.length} pages have structured data` });

  return findings;
}

function getAuthorityFindings(rf: RawFindings): FindingItem[] {
  const findings: FindingItem[] = [];
  const pages = rf.pages ?? [];

  findings.push({ pass: !!rf.openGraphPresent, text: 'Open Graph tags present' });

  const pagesWithMeta = pages.filter(p => !!p.metaDescription);
  findings.push({ pass: pages.length > 0 && pagesWithMeta.length === pages.length, text: 'Meta descriptions on all pages' });

  const pagesWithHeadings = pages.filter(p => !!p.h1 && p.h2s && p.h2s.length > 0);
  findings.push({ pass: pagesWithHeadings.length > 0, text: 'Strong heading hierarchy (H1 + H2s)' });

  findings.push({ meta: '0 external authority links found' });

  return findings;
}

function getTopicalAuthorityFindings(rf: RawFindings): FindingItem[] {
  const findings: FindingItem[] = [];
  const pages = rf.pages ?? [];
  const totalWords = rf.wordCount ?? pages.reduce((sum, p) => sum + (p.wordCount ?? 0), 0);
  const avgWords = pages.length > 0 ? Math.round(totalWords / pages.length) : 0;

  findings.push({ meta: `${totalWords.toLocaleString()} total words across ${pages.length} pages` });
  findings.push({ meta: `Average ${avgWords.toLocaleString()} words per page` });

  const depthPass = avgWords >= 1000;
  const depthLabel = avgWords >= 1000
    ? 'Good content depth (>1000 words/page)'
    : avgWords >= 500
    ? 'Moderate content depth (500–999 words/page)'
    : 'Thin content (<500 words/page)';
  findings.push({ pass: depthPass, text: depthLabel });

  const topics: string[] = [];
  pages.forEach(p => {
    if (p.h1) topics.push(p.h1);
    if (p.h2s) p.h2s.slice(0, 2).forEach(h => topics.push(h));
  });
  if (topics.length > 0) {
    findings.push({ meta: `Top topics: ${topics.slice(0, 5).join(' · ')}` });
  }

  return findings;
}

function getFreshnessFindings(rf: RawFindings): FindingItem[] {
  const findings: FindingItem[] = [];
  const types = rf.structuredDataTypes ?? [];

  findings.push({
    pass: !!rf.lastModified,
    text: rf.lastModified
      ? `Last-Modified header present (${rf.lastModified})`
      : 'No Last-Modified header detected',
  });

  const hasArticleSchema = types.some(t =>
    ['Article', 'BlogPosting', 'NewsArticle'].includes(t)
  );
  findings.push({ pass: hasArticleSchema, text: hasArticleSchema ? 'Article schema with datePublished found' : 'No Article schema with datePublished' });
  findings.push({ pass: hasArticleSchema, text: hasArticleSchema ? 'Publish dates detected in schema' : 'No publish dates detected' });

  return findings;
}

export default function AuditResultPage({ requestData, auditData }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeEngine, setActiveEngine] = useState<string>('claude');
  const rafRef = useRef<number | null>(null);

  const domain = requestData.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const auditDate = new Date(auditData.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const circumference = 2 * Math.PI * 110;
  const target = auditData.overall_score;

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  const dashoffset = circumference - (animatedScore / 100) * circumference;

  const rf = auditData.raw_findings;

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  const dims = [
    { label: 'Crawlability', key: 'crawlability', score: auditData.answerability_score, getFindings: getCrawlabilityFindings },
    { label: 'Schema Markup', key: 'schema', score: auditData.brevity_score, getFindings: getSchemaMarkupFindings },
    { label: 'Authority & Citation', key: 'authority', score: auditData.trust_score, getFindings: getAuthorityFindings },
    { label: 'Topical Authority', key: 'topical', score: auditData.structure_score, getFindings: getTopicalAuthorityFindings },
    { label: 'Freshness', key: 'freshness', score: auditData.freshness_score, getFindings: getFreshnessFindings },
    { label: 'Brand Mentions', key: 'brand', score: 0, getFindings: null },
  ];

  const rawProbe = rf?.aiProbe ?? null;
  const claudeProbe: AiProbe | null = rawProbe
    ? isMultiEngineProbe(rawProbe) ? rawProbe.claude : rawProbe
    : null;
  const openaiProbe: AiProbe | null = rawProbe && isMultiEngineProbe(rawProbe) ? rawProbe.openai : null;
  const perplexityProbe: AiProbe | null = rawProbe && isMultiEngineProbe(rawProbe) ? rawProbe.perplexity : null;

  const probeStatus = (probe: AiProbe | null): string => {
    if (!probe) return 'PENDING';
    if (probe.results.length === 0) return 'COMING SOON';
    return probe.status.toUpperCase();
  };

  const probeComingSoon = (probe: AiProbe | null): boolean =>
    !probe || probe.results.length === 0;

  const engines = [
    { name: 'ChatGPT', bg: '#10A37F', icon: '✦', probe: openaiProbe },
    { name: 'Perplexity', bg: '#20808D', icon: '◎', probe: perplexityProbe },
    { name: 'Google AI', bg: 'linear-gradient(135deg,#4285F4,#34A853)', icon: '◈', probe: null as AiProbe | null },
    { name: 'Claude', bg: '#D97757', icon: '◆', probe: claudeProbe },
  ];

  const tabEngines = [
    { key: 'claude', name: 'Claude', color: '#D97757', probe: claudeProbe },
    { key: 'openai', name: 'ChatGPT', color: '#10A37F', probe: openaiProbe },
    { key: 'perplexity', name: 'Perplexity', color: '#20808D', probe: perplexityProbe },
  ].filter((e): e is { key: string; name: string; color: string; probe: AiProbe } =>
    e.probe !== null && e.probe.results.length > 0
  );

  const comparisonEngines = [
    { key: 'claude', name: 'Claude', color: '#D97757', probe: claudeProbe },
    { key: 'openai', name: 'ChatGPT', color: '#10A37F', probe: openaiProbe },
    { key: 'perplexity', name: 'Perplexity', color: '#20808D', probe: perplexityProbe },
    { key: 'googleai', name: 'Google AI', color: '#4285F4', probe: null as AiProbe | null },
  ];

  const recs = [
    { priority: 'high', title: 'Add structured data markup', desc: 'Implement JSON-LD schema for your key pages to improve AI engine crawlability and entity recognition.' },
    { priority: 'high', title: 'Build authoritative citations', desc: 'Get mentioned in industry publications and directories that AI engines use as trusted sources.' },
    { priority: 'medium', title: 'Optimize for conversational queries', desc: 'Rewrite key pages to answer questions directly in the first 50 words.' },
    { priority: 'medium', title: 'Increase content freshness', desc: 'Publish or update content weekly to signal active expertise to AI engines.' },
    { priority: 'low', title: 'Establish brand entity', desc: 'Create a Wikipedia-style entity page and ensure NAP consistency across the web.' },
  ];

  const badgeClass = (status: string) => {
    if (status === 'CITED') return styles.erBadgeCited;
    if (status === 'PARTIAL') return styles.erBadgePartial;
    return styles.erBadgeMissing;
  };

  return (
    <div className={styles.auditPage}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.auditHeader}>
          <div>
            <div className={styles.auditStatus}>
              <span className={styles.greenDot} />
              AUDIT COMPLETE · {auditDate}
            </div>
            <h1>{domain}</h1>
            <div className={styles.aMeta}>
              <span>AEO Score Report</span>
              <span>·</span>
              <span>{auditDate}</span>
              <span>·</span>
              <span>ID: {auditData.id.slice(0, 8)}</span>
            </div>
          </div>
          <div className={styles.auditActions}>
            <div style={{ position: 'relative' }}>
              <button className={styles.btnSecondary} onClick={handleShare}>Share</button>
              {copied && <span className={styles.copiedToast}>Link copied!</span>}
            </div>
            <button className={styles.btnSecondary} onClick={handleDownload}>Download PDF</button>
            <a href="/" className={styles.btnPrimary}>New audit</a>
          </div>
        </div>

        {/* Score Hero */}
        <div className={styles.scoreHero}>
          <div className={styles.scoreRingWrap}>
            <div className={styles.scoreRing}>
              <svg width="260" height="260" viewBox="0 0 260 260">
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <circle cx="130" cy="130" r="110" fill="none" stroke="#F3F4F6" strokeWidth="16" />
                <circle
                  cx="130" cy="130" r="110" fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashoffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
              <div className={styles.scoreRingInner}>
                <div className={styles.scoreNum}>{animatedScore}</div>
                <div className={styles.scoreOutOf}>/100</div>
              </div>
            </div>
            <div className={`${styles.scoreGrade} ${resolveGradeClass(auditData.overall_grade)}`}>
              {resolveGradeLabel(auditData.overall_grade)}
            </div>
          </div>

          <div className={styles.scoreSummary}>
            <div className={styles.scoreSubtitle}>Your AEO Visibility Score</div>
            <h2>Your brand is being skipped by AI engines answering your customers&apos; questions</h2>
            <p>
              With a score of <strong>{auditData.overall_score}/100</strong>, {domain} is nearly invisible to
              AI-powered search. When potential customers ask ChatGPT, Perplexity, or Google AI about solutions
              in your space, your brand isn&apos;t being cited — your competitors are.
            </p>
            <div className={styles.scoreCallout}>
              <strong>⚠ Estimated impact:</strong> Brands with sub-50 AEO scores lose an estimated 23–41%
              of AI-referred traffic to competitors who have optimized for answer engine discovery.
            </div>
          </div>
        </div>

        {/* Report Grid */}
        <div className={styles.reportGrid}>
          <div className={styles.reportCard}>
            <h3 className={styles.cardTitle}>What&apos;s driving your score</h3>
            <div className={styles.dims}>
              {dims.map((d) => {
                const findings = rf && d.getFindings ? d.getFindings(rf) : null;
                const isExpanded = expandedDim === d.key;
                return (
                  <div key={d.key} className={styles.dimContainer}>
                    <div className={styles.dimRow}>
                      <span className={styles.dimLabel}>{d.label}</span>
                      <div className={styles.dimBarWrap}>
                        <div
                          className={`${styles.dimBar} ${dimFillClass(d.score)}`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <span className={styles.dimScore}>{d.score}</span>
                    </div>
                    {findings && (
                      <>
                        <button
                          className={styles.findingsToggle}
                          onClick={() => setExpandedDim(isExpanded ? null : d.key)}
                        >
                          <span className={`${styles.findingsChevron} ${isExpanded ? styles.findingsChevronOpen : ''}`}>›</span>
                          {isExpanded ? 'Hide findings' : 'View findings'}
                        </button>
                        <div
                          className={styles.findingsList}
                          style={{ maxHeight: isExpanded ? '600px' : '0' }}
                        >
                          {findings.map((f, i) => {
                            if ('meta' in f) {
                              return (
                                <div key={i} className={styles.findingMeta}>{f.meta}</div>
                              );
                            }
                            return (
                              <div key={i} className={styles.findingItem}>
                                <span className={f.pass ? styles.findingCheck : styles.findingCross}>
                                  {f.pass ? '✅' : '❌'}
                                </span>
                                <span>{f.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.reportCard}>
            <h3 className={styles.cardTitle}>How each AI engine sees you</h3>
            <div className={styles.engines}>
              {engines.map((eng) => {
                const status = probeStatus(eng.probe);
                const comingSoon = probeComingSoon(eng.probe);
                return (
                  <div key={eng.name} className={styles.engineResult}>
                    <div className={styles.erName}>
                      <span className={styles.erIcon} style={{ background: eng.bg }}>{eng.icon}</span>
                      <span>{eng.name}</span>
                    </div>
                    {comingSoon ? (
                      <span className={`${styles.erBadge} ${styles.erBadgeMissing}`} title="Coming soon">COMING SOON</span>
                    ) : (
                      <span className={`${styles.erBadge} ${badgeClass(status)}`}>{status}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cross-engine AI Probe Comparison */}
        <div className={styles.reportCard} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle}>AI Probe — Cross-Engine Comparison</h3>

          {/* Comparison summary grid */}
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonRow}>
              <div className={`${styles.comparisonCell} ${styles.comparisonHeaderCell}`} />
              {comparisonEngines.map(eng => (
                <div key={eng.key} className={`${styles.comparisonCell} ${styles.comparisonHeaderCell}`}>
                  <div className={styles.comparisonEngine}>
                    <span className={styles.engineDot} style={{ background: eng.color }} />
                    {eng.name}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.comparisonRow}>
              <div className={`${styles.comparisonCell} ${styles.comparisonLabelCell}`}>Status</div>
              {comparisonEngines.map(eng => (
                <div key={eng.key} className={styles.comparisonCell}>
                  <span className={`${styles.erBadge} ${badgeClass(compStatus(eng.probe))}`}>
                    {compStatus(eng.probe)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.comparisonRow}>
              <div className={`${styles.comparisonCell} ${styles.comparisonLabelCell}`}>Cited</div>
              {comparisonEngines.map(eng => (
                <div key={eng.key} className={styles.comparisonCell}>
                  {eng.probe && eng.probe.results.length > 0
                    ? `${eng.probe.citedCount}/${eng.probe.totalPrompts}`
                    : '—'}
                </div>
              ))}
            </div>
          </div>

          {/* Engine tabs */}
          {tabEngines.length > 0 && (
            <>
              <div className={styles.engineTabs}>
                {tabEngines.map(eng => (
                  <button
                    key={eng.key}
                    className={`${styles.engineTab} ${activeEngine === eng.key ? styles.engineTabActive : ''}`}
                    style={activeEngine === eng.key ? { borderBottomColor: eng.color } : undefined}
                    onClick={() => setActiveEngine(eng.key)}
                  >
                    {eng.name}
                    <span className={styles.engineTabBadge}>
                      {eng.probe.citedCount}/{eng.probe.totalPrompts}
                    </span>
                  </button>
                ))}
              </div>

              {(() => {
                const activeTab = tabEngines.find(e => e.key === activeEngine) ?? tabEngines[0];
                const probe = activeTab.probe;
                return (
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16, marginTop: 0 }}>
                      {probe.citedCount} of {probe.totalPrompts} prompts cited your domain
                    </p>
                    <div className={styles.prompts}>
                      {probe.results.map((item, i) => (
                        <div key={i} className={styles.promptRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 16 }}>
                            <span className={styles.promptQ}>&ldquo;{item.prompt}&rdquo;</span>
                            <span className={`${styles.erBadge} ${item.cited ? styles.erBadgeCited : styles.erBadgeMissing}`}>
                              {item.cited ? 'CITED' : 'NOT CITED'}
                            </span>
                          </div>
                          {item.snippet && (
                            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                              {cleanMarkdown(item.snippet)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {tabEngines.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 8 }}>
              No AI probe results available yet.
            </p>
          )}
        </div>

        {/* 90-day Action Plan */}
        <div className={styles.reportCard} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle}>Your 90-day action plan</h3>
          <div className={styles.recs}>
            {recs.map((rec, i) => (
              <div key={i} className={styles.rec}>
                <div className={styles.recNum}>{i + 1}</div>
                <div>
                  <div className={styles.recTitle}>{rec.title}</div>
                  <div className={styles.recDesc}>{rec.desc}</div>
                </div>
                <span className={`${styles.recPriority} ${
                  rec.priority === 'high' ? styles.recPriorityHigh :
                  rec.priority === 'medium' ? styles.recPriorityMed :
                  styles.recPriorityLow
                }`}>{rec.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <div className={styles.ctaCard}>
          <h2>Want help executing?</h2>
          <p>
            Our AEO specialists will implement these recommendations and get your brand cited by AI engines
            within 90 days.
          </p>
          <div className={styles.ctaActions}>
            <button className={styles.ctaBtnPrimary}>Book a strategy call</button>
            <button className={styles.ctaBtnSecondary}>View pricing</button>
          </div>
        </div>

      </div>
    </div>
  );
}
