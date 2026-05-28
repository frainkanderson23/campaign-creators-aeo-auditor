'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AuditResultPage.module.css';

interface Props {
  requestData: { id: string; url: string; status: string; created_at: string };
  auditData: {
    id: string; overall_score: number; overall_grade: string;
    answerability_score: number; answerability_grade: string;
    brevity_score: number; brevity_grade: string;
    trust_score: number; trust_grade: string;
    structure_score: number; structure_grade: string;
    freshness_score: number; freshness_grade: string;
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

export default function AuditResultPage({ requestData, auditData }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
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

  const dims = [
    { label: 'Crawlability', score: auditData.answerability_score },
    { label: 'Schema Markup', score: auditData.brevity_score },
    { label: 'Authority & Citation', score: auditData.trust_score },
    { label: 'Topical Authority', score: auditData.structure_score },
    { label: 'Freshness', score: auditData.freshness_score },
    { label: 'Brand Mentions', score: 0 },
  ];

  const engines = [
    { name: 'ChatGPT', bg: '#10A37F', icon: '✦', status: 'PARTIAL' },
    { name: 'Perplexity', bg: '#20808D', icon: '◎', status: 'MISSING' },
    { name: 'Google AI', bg: 'linear-gradient(135deg,#4285F4,#34A853)', icon: '◈', status: 'PARTIAL' },
    { name: 'Claude', bg: '#D97757', icon: '◆', status: 'MISSING' },
  ];

  const samplePrompts = [
    `Best tools for ${domain.split('.')[0]} businesses`,
    `How does ${domain} compare to alternatives?`,
    `What do customers say about ${domain.split('.')[0]}?`,
  ];

  const recs = [
    { priority: 'high', title: 'Add structured data markup', desc: 'Implement JSON-LD schema for your key pages to improve AI engine crawlability and entity recognition.' },
    { priority: 'high', title: 'Build authoritative citations', desc: 'Get mentioned in industry publications and directories that AI engines use as trusted sources.' },
    { priority: 'medium', title: 'Optimize for conversational queries', desc: 'Rewrite key pages to answer questions directly in the first 50 words.' },
    { priority: 'medium', title: 'Increase content freshness', desc: 'Publish or update content weekly to signal active expertise to AI engines.' },
    { priority: 'low', title: 'Establish brand entity', desc: 'Create a Wikipedia-style entity page and ensure NAP consistency across the web.' },
  ];

  const badgeClass = (status: string) =>
    status === 'PARTIAL' ? styles.erBadgePartial : styles.erBadgeMissing;

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
            <button className={styles.btnSecondary}>Share</button>
            <button className={styles.btnSecondary}>Download PDF</button>
            <button className={styles.btnPrimary}>New audit</button>
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
              {dims.map((d) => (
                <div key={d.label} className={styles.dimRow}>
                  <span className={styles.dimLabel}>{d.label}</span>
                  <div className={styles.dimBarWrap}>
                    <div
                      className={`${styles.dimBar} ${dimFillClass(d.score)}`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className={styles.dimScore}>{d.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reportCard}>
            <h3 className={styles.cardTitle}>How each AI engine sees you</h3>
            <div className={styles.engines}>
              {engines.map((eng) => (
                <div key={eng.name} className={styles.engineResult}>
                  <div className={styles.erName}>
                    <span className={styles.erIcon} style={{ background: eng.bg }}>{eng.icon}</span>
                    <span>{eng.name}</span>
                  </div>
                  <span className={`${styles.erBadge} ${badgeClass(eng.status)}`}>{eng.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Prompts */}
        <div className={styles.reportCard} style={{ marginTop: 24 }}>
          <h3 className={styles.cardTitle}>Sample prompts where you&apos;re not cited</h3>
          <div className={styles.prompts}>
            {samplePrompts.map((q) => (
              <div key={q} className={styles.promptRow}>
                <span className={styles.promptQ}>&ldquo;{q}&rdquo;</span>
                <span className={`${styles.erBadge} ${styles.erBadgeMissing}`}>NOT CITED</span>
              </div>
            ))}
          </div>
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
