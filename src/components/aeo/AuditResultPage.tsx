'use client';

import { useEffect, useRef } from 'react';
import styles from './AuditResultPage.module.css';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
export interface AuditRequestRow {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  email?: string | null;
  created_at?: string | null;
}

export interface AuditResultRow {
  id: string;
  audit_request_id: string;
  overall_score: number | null;
  overall_grade: string | null;
  answerability_score: number | null;
  answerability_grade: string | null;
  brevity_score: number | null;
  brevity_grade: string | null;
  trust_score: number | null;
  trust_grade: string | null;
  structure_score: number | null;
  structure_grade: string | null;
  freshness_score: number | null;
  freshness_grade: string | null;
  created_at?: string | null;
}

interface Props {
  requestData: AuditRequestRow;
  auditData: AuditResultRow;
}

// ──────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────
const RING_RADIUS = 110;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const DIMENSIONS = [
  { key: 'answerability', label: 'Crawlability' },
  { key: 'brevity',       label: 'Schema Markup' },
  { key: 'trust',         label: 'Authority & Citation' },
  { key: 'structure',     label: 'Topical Authority' },
  { key: 'freshness',     label: 'Freshness Signals' },
  { key: 'brand',         label: 'Brand Mentions' },
] as const;

const ENGINES = [
  { name: 'ChatGPT (GPT-4o)',  status: 'partial'  as const },
  { name: 'Perplexity AI',     status: 'missing'  as const },
  { name: 'Google AI Overview',status: 'partial'  as const },
  { name: 'Claude AI',         status: 'missing'  as const },
];

const SAMPLE_PROMPTS = [
  'Best marketing agencies for SaaS companies',
  'How to improve conversion rates for B2B software',
  'Top content marketing strategies for tech startups',
];

function clamp(v: number | null | undefined): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function domainFromUrl(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function gradeStyle(grade: string | null): string {
  switch ((grade ?? 'F').toUpperCase()) {
    case 'A+': return styles.gradeAPlus;
    case 'A':  return styles.gradeA;
    case 'B':  return styles.gradeB;
    case 'C':  return styles.gradeC;
    case 'D':  return styles.gradeD;
    default:   return styles.gradeF;
  }
}

function barFillStyle(score: number): string {
  if (score >= 70) return styles.dimFillHigh;
  if (score >= 45) return styles.dimFillMid;
  return styles.dimFillLow;
}

function deriveRecommendations(data: AuditResultRow) {
  const dims = [
    { label: 'Crawlability',         score: clamp(data.answerability_score), key: 'crawl' },
    { label: 'Schema Markup',        score: clamp(data.brevity_score),        key: 'schema' },
    { label: 'Authority & Citation', score: clamp(data.trust_score),          key: 'authority' },
    { label: 'Topical Authority',    score: clamp(data.structure_score),       key: 'structure' },
    { label: 'Freshness Signals',    score: clamp(data.freshness_score),       key: 'freshness' },
  ];

  const ALL_RECS: Record<string, { title: string; desc: string; priority: 'high' | 'medium' | 'low' }> = {
    crawl:     { title: 'Allow AI crawlers in robots.txt', desc: 'Add GPTBot, ClaudeBot, and PerplexityBot to your robots.txt allow list and submit your sitemap to major AI index endpoints.', priority: 'high' },
    schema:    { title: 'Implement structured data markup', desc: 'Add JSON-LD schema markup (Organization, FAQ, Article, BreadcrumbList) to your key pages so AI models can parse entity relationships.', priority: 'high' },
    authority: { title: 'Build citation-worthy content', desc: 'Publish original research, data studies, or expert interviews that AI training corpora can cite. Earn backlinks from authoritative domains.', priority: 'medium' },
    structure: { title: 'Deepen topical coverage', desc: 'Create a pillar-and-cluster content architecture. Cover sub-topics exhaustively so AI models recognize your site as a topical authority.', priority: 'medium' },
    freshness: { title: 'Update content regularly', desc: 'Add a "Last updated" timestamp to key pages, publish monthly insight posts, and refresh statistics. AI models weigh recency when generating answers.', priority: 'low' },
  };

  const BRAND_REC = { title: 'Establish brand mention strategy', desc: 'Build brand mentions in press, directories, and community forums. Direct brand search signals and co-citations help AI models recognize your entity. (Phase 2 analysis)', priority: 'low' as const };

  const sorted = [...dims].sort((a, b) => a.score - b.score);
  const recs = sorted.map(d => ({ ...ALL_RECS[d.key], key: d.key }));
  recs.push(BRAND_REC);

  return recs.slice(0, 5);
}

function priorityStyle(p: 'high' | 'medium' | 'low'): string {
  return p === 'high' ? styles.recHigh : p === 'medium' ? styles.recMedium : styles.recLow;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export function AuditResultPage({ requestData, auditData }: Props) {
  const fillRef = useRef<SVGCircleElement>(null);
  const overallScore = clamp(auditData.overall_score);
  const domain = domainFromUrl(requestData.url);
  const auditDate = requestData.created_at
    ? new Date(requestData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Today';
  const recommendations = deriveRecommendations(auditData);

  useEffect(() => {
    if (!fillRef.current) return;
    const offset = RING_CIRCUMFERENCE - (overallScore / 100) * RING_CIRCUMFERENCE;
    fillRef.current.style.strokeDasharray = String(RING_CIRCUMFERENCE);
    fillRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (fillRef.current) fillRef.current.style.strokeDashoffset = String(offset);
      });
    });
  }, [overallScore]);

  const overallGrade = auditData.overall_grade ?? 'F';

  return (
    <div className={styles.auditPage}>
      {/* Header */}
      <header className={styles.auditHeader}>
        <div className={styles.auditHeaderMeta}>
          <h1 className={styles.auditDomain}>{domain}</h1>
          <p className={styles.auditDate}>AEO Audit Report · {auditDate}</p>
        </div>
        <div className={styles.auditActions}>
          <a href="#action-plan" className={`${styles.auditBtn} ${styles.auditBtnPrimary}`}>
            View Action Plan
          </a>
          <a href="#" className={`${styles.auditBtn} ${styles.auditBtnOutline}`} onClick={e => e.preventDefault()}>
            Download PDF
          </a>
        </div>
      </header>

      {/* Score Hero */}
      <section className={styles.scoreHero}>
        <div className={styles.scoreRing}>
          <svg viewBox="0 0 260 260">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <circle
              className={styles.scoreRingTrack}
              cx="130" cy="130" r={RING_RADIUS}
            />
            <circle
              ref={fillRef}
              className={styles.scoreRingFill}
              cx="130" cy="130" r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE}
            />
          </svg>
          <div className={styles.scoreRingInner}>
            <span className={styles.scoreNum}>{overallScore}</span>
            <span className={styles.scoreNumSub}>/100</span>
            <span className={`${styles.scoreGrade} ${gradeStyle(overallGrade)}`}>
              Grade {overallGrade}
            </span>
          </div>
        </div>

        <div className={styles.scoreSummary}>
          <h2>Your AEO Score: {overallScore}/100</h2>
          <p>
            {domain} {overallScore >= 70
              ? 'is performing well in AI search, but there are key areas to improve to maximize citation frequency.'
              : overallScore >= 45
              ? 'has moderate AI search visibility. Significant improvements are available across multiple dimensions.'
              : 'has low AI search visibility. Your content is rarely surfaced in AI-generated answers — this is an opportunity.'}
          </p>
          <div className={styles.scoreCallout}>
            <strong>What this means for you:</strong>
            {overallScore >= 70
              ? 'You appear in roughly 30–50% of relevant AI responses. Strategic improvements could push you into the top tier.'
              : overallScore >= 45
              ? 'You appear in roughly 10–30% of relevant AI responses. Following the action plan below could double that within 90 days.'
              : 'You are missing from most AI-generated answers in your niche. The good news: early movers who fix this now gain lasting competitive advantage.'}
          </div>
        </div>
      </section>

      {/* Report Grid */}
      <div className={styles.reportGrid}>

        {/* Dimension Scores */}
        <div className={`${styles.reportCard} ${styles.reportCardFull}`}>
          <h3>What's driving your score</h3>
          <ul className={styles.dimList}>
            {DIMENSIONS.map(({ key, label }) => {
              const isPlaceholder = key === 'brand';
              const score = isPlaceholder ? 0 : clamp((auditData as Record<string, number | null | undefined>)[`${key}_score`]);
              const displayScore = isPlaceholder ? '—' : score;
              return (
                <li key={key} className={styles.dimRow}>
                  <div className={styles.dimRowHeader}>
                    <span className={styles.dimLabel}>
                      {label}
                      {isPlaceholder && (
                        <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                          Phase 2
                        </span>
                      )}
                    </span>
                    <span className={styles.dimScore}>
                      {displayScore}{typeof displayScore === 'number' ? '/100' : ''}
                    </span>
                  </div>
                  <div className={styles.dimBar}>
                    {!isPlaceholder && (
                      <div
                        className={`${styles.dimFill} ${barFillStyle(score)}`}
                        style={{ width: `${score}%` }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Engine Results */}
        <div className={styles.reportCard}>
          <h3>How each AI engine sees you</h3>
          <ul className={styles.engineList}>
            {ENGINES.map(({ name, status }) => (
              <li key={name} className={styles.engineResult}>
                <span className={styles.engineName}>{name}</span>
                <span className={`${styles.erBadge} ${
                  status === 'cited'   ? styles.erCited :
                  status === 'partial' ? styles.erPartial :
                                        styles.erMissing
                }`}>
                  {status === 'cited' ? '✓ Cited' : status === 'partial' ? '~ Partial' : '✗ Missing'}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.engineNote}>
            Live engine sampling coming in Phase 2. Results above are indicative based on your score profile.
          </p>
        </div>

        {/* Sample Prompts */}
        <div className={styles.reportCard}>
          <h3>Sample prompts AI users ask</h3>
          <ul className={styles.promptList}>
            {SAMPLE_PROMPTS.map((prompt) => (
              <li key={prompt} className={styles.promptRow}>
                <span className={styles.promptText}>"{prompt}"</span>
                <span className={`${styles.erBadge} ${styles.erNotCited}`}>
                  ✗ Not Cited
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.engineNote}>
            Prompt sampling is placeholder — personalised prompts coming in Phase 2.
          </p>
        </div>

        {/* Action Plan */}
        <div id="action-plan" className={`${styles.reportCard} ${styles.reportCardFull}`}>
          <h3>90-day action plan</h3>
          <ol className={styles.recs}>
            {recommendations.map((rec, i) => (
              <li key={rec.key ?? i} className={styles.rec}>
                <span className={styles.recNum}>{i + 1}</span>
                <div className={styles.recBody}>
                  <p className={styles.recTitle}>
                    {rec.title}
                    <span className={`${styles.recPriority} ${priorityStyle(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </p>
                  <p className={styles.recDesc}>{rec.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

      </div>

      {/* CTA Card */}
      <div className={styles.ctaCard}>
        <div className={styles.ctaText}>
          <h2>Want expert help implementing this?</h2>
          <p>Our team has helped 50+ B2B companies become the top cited source in their niche.</p>
        </div>
        <div className={styles.ctaButtons}>
          <a
            href="https://www.campaigncreators.com/contact"
            className={styles.ctaBtnPrimary}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Strategy Call
          </a>
          <button className={styles.ctaBtnSecondary} onClick={() => window.print()}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}