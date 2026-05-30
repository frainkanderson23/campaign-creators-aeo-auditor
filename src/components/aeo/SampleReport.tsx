'use client';

import { useState } from 'react';
import styles from './SampleReport.module.css';

const TABS = [
  { key: 'score', label: 'Visibility score', icon: 'chart-bar' },
  { key: 'dims', label: 'Dimensions', icon: 'adjustments' },
  { key: 'engines', label: 'AI engines', icon: 'cpu' },
  { key: 'probes', label: 'Probe results', icon: 'message-dots' },
  { key: 'competitors', label: 'Competitors', icon: 'users' },
  { key: 'plan', label: 'Action plan', icon: 'checklist' },
] as const;

type TabKey = typeof TABS[number]['key'];

export function SampleReport() {
  const [active, setActive] = useState<TabKey>('score');

  return (
    <div className={styles.dash}>
      <div className={styles.nav}>
        <div className={styles.navHead}>
          <span className={styles.navDot} />
          <span className={styles.navTitle}>Sample report</span>
        </div>
        {TABS.map((t) => (
          <div
            key={t.key}
            className={`${styles.tab} ${active === t.key ? styles.tabActive : ''}`}
            onClick={() => setActive(t.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActive(t.key)}
          >
            <i className={`ti ti-${t.icon}`} aria-hidden="true" />
            {t.label}
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        {active === 'score' && <ScorePanel />}
        {active === 'dims' && <DimsPanel />}
        {active === 'engines' && <EnginesPanel />}
        {active === 'probes' && <ProbesPanel />}
        {active === 'competitors' && <CompetitorsPanel />}
        {active === 'plan' && <PlanPanel />}
      </div>
    </div>
  );
}

function ScorePanel() {
  return (
    <>
      <h3 className={styles.panelTitle}>AEO visibility score</h3>
      <div className={styles.ringRow}>
        <div className={styles.ringWrap}>
          <svg width="90" height="90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#sampleGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="153.3" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            <defs>
              <linearGradient id="sampleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.ringInner}>
            <span className={styles.ringNum}>39</span>
            <span className={styles.ringOf}>/100</span>
          </div>
        </div>
        <div className={styles.ringInfo}>
          <span className={styles.gradeBad}>Critical</span>
          <span className={styles.ringText}>Your brand is nearly invisible to AI search. Competitors are being cited while you are not.</span>
          <span className={styles.ringMeta}>2 of 40 AI prompts cited your brand</span>
        </div>
      </div>
      <div className={styles.metricRow}>
        <div className={styles.metric}><p className={styles.metricLabel}>Citation rate</p><p className={`${styles.metricVal} ${styles.red}`}>2/40</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Engines citing you</p><p className={`${styles.metricVal} ${styles.amber}`}>1 of 4</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Top weakness</p><p className={styles.metricVal} style={{ fontSize: 15 }}>Freshness</p></div>
      </div>
      <div className={styles.insightRow}>
        <div className={styles.insight}><i className="ti ti-alert-triangle" aria-hidden="true" style={{ color: '#DC2626' }} /><div><p className={styles.insightTitle}>Zero organic CTR protection</p><p className={styles.insightDesc}>61% CTR drop when AI Overviews appear.</p></div></div>
        <div className={styles.insight}><i className="ti ti-trending-down" aria-hidden="true" style={{ color: '#B45309' }} /><div><p className={styles.insightTitle}>Traffic at risk</p><p className={styles.insightDesc}>73% of B2B sites lost traffic to AI search.</p></div></div>
        <div className={styles.insight}><i className="ti ti-target" aria-hidden="true" style={{ color: '#185FA5' }} /><div><p className={styles.insightTitle}>Missed conversions</p><p className={styles.insightDesc}>AI visitors convert 4.4x higher than organic.</p></div></div>
        <div className={styles.insight}><i className="ti ti-clock" aria-hidden="true" style={{ color: '#0F6E56' }} /><div><p className={styles.insightTitle}>Time to results</p><p className={styles.insightDesc}>90 days to measurable AI visibility.</p></div></div>
      </div>
    </>
  );
}

function DimsPanel() {
  const dims = [
    { name: 'Crawlability', score: 70, good: true },
    { name: 'Structure', score: 100, good: true },
    { name: 'Trust', score: 100, good: true },
    { name: 'Freshness', score: 0, good: false },
    { name: 'Schema', score: 100, good: true },
  ];
  return (
    <>
      <h3 className={styles.panelTitle}>What&apos;s driving your score</h3>
      <div className={styles.dimList}>
        {dims.map((d) => (
          <div key={d.name} className={styles.dim}>
            <span className={styles.dimName}>{d.name}</span>
            <div className={styles.dimBar}><div className={`${styles.dimFill} ${d.good ? styles.dimGood : styles.dimBad}`} style={{ width: `${d.score}%` }} /></div>
            <span className={styles.dimScore}>{d.score}</span>
          </div>
        ))}
      </div>
      <div className={styles.metricRow} style={{ marginTop: 16 }}>
        <div className={styles.metric}><p className={styles.metricLabel}>Pages crawled</p><p className={`${styles.metricVal} ${styles.teal}`}>47</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Schema types</p><p className={`${styles.metricVal} ${styles.teal}`}>3</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Last updated</p><p className={styles.metricVal} style={{ fontSize: 14 }}>6+ months</p></div>
      </div>
      <div className={styles.insightRow}>
        <div className={styles.insight}><i className="ti ti-calendar-x" aria-hidden="true" style={{ color: '#DC2626' }} /><div><p className={styles.insightTitle}>Stale content detected</p><p className={styles.insightDesc}>No updates in 6+ months signals inactivity to AI.</p></div></div>
        <div className={styles.insight}><i className="ti ti-code" aria-hidden="true" style={{ color: '#0F6E56' }} /><div><p className={styles.insightTitle}>Schema markup present</p><p className={styles.insightDesc}>Organization, WebSite, and FAQ schema found.</p></div></div>
      </div>
    </>
  );
}

function EnginesPanel() {
  const engines = [
    { name: 'ChatGPT', bg: '#10A37F', letter: 'G', status: 'Partial', badge: 'partial' },
    { name: 'Perplexity', bg: '#20808D', letter: 'P', status: 'Cited', badge: 'cited' },
    { name: 'Google AI', bg: '#4285F4', letter: 'G', status: 'Missing', badge: 'missing' },
    { name: 'Claude', bg: '#D97757', letter: 'C', status: 'Missing', badge: 'missing' },
  ];
  return (
    <>
      <h3 className={styles.panelTitle}>How each AI engine sees you</h3>
      <div className={styles.engList}>
        {engines.map((e) => (
          <div key={e.name} className={styles.eng}>
            <div className={styles.engLeft}>
              <div className={styles.engDot} style={{ background: e.bg }}>{e.letter}</div>
              <span className={styles.engName}>{e.name}</span>
            </div>
            <span className={`${styles.engBadge} ${styles[`badge${e.badge.charAt(0).toUpperCase() + e.badge.slice(1)}`]}`}>{e.status}</span>
          </div>
        ))}
      </div>
      <div className={styles.metricRow} style={{ marginTop: 16 }}>
        <div className={styles.metric}><p className={styles.metricLabel}>Engines cited</p><p className={`${styles.metricVal} ${styles.teal}`}>1 of 4</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Best engine</p><p className={styles.metricVal} style={{ fontSize: 14 }}>Perplexity</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Worst engine</p><p className={styles.metricVal} style={{ fontSize: 14 }}>Google AI</p></div>
      </div>
      <div className={styles.insightRow}>
        <div className={styles.insight}><i className="ti ti-search" aria-hidden="true" style={{ color: '#185FA5' }} /><div><p className={styles.insightTitle}>Perplexity finds you</p><p className={styles.insightDesc}>Source-citation engines favor structured content.</p></div></div>
        <div className={styles.insight}><i className="ti ti-eye-off" aria-hidden="true" style={{ color: '#DC2626' }} /><div><p className={styles.insightTitle}>Invisible to Google AI</p><p className={styles.insightDesc}>82% of B2B queries now trigger AI Overviews.</p></div></div>
      </div>
    </>
  );
}

function ProbesPanel() {
  const prompts = [
    { text: '"Best marketing automation agencies?"', result: '0/4', bad: true },
    { text: '"Top HubSpot partners in 2026?"', result: '1/4', bad: false },
    { text: '"Compare leading inbound agencies"', result: '0/4', bad: true },
    { text: '"Recommend an agency for B2B?"', result: '1/4', bad: false },
    { text: '"Best tools for lead generation?"', result: '0/4', bad: true },
    { text: '"Marketing for growing companies?"', result: '0/4', bad: true },
  ];
  return (
    <>
      <h3 className={styles.panelTitle}>AI probe results</h3>
      <div className={styles.promptList}>
        {prompts.map((p) => (
          <div key={p.text} className={styles.prompt}>
            <span className={styles.promptText}>{p.text}</span>
            <span className={`${styles.engBadge} ${p.bad ? styles.badgeMissing : styles.badgePartial}`}>{p.result}</span>
          </div>
        ))}
      </div>
      <div className={styles.metricRow} style={{ marginTop: 14 }}>
        <div className={styles.metric}><p className={styles.metricLabel}>Prompts tested</p><p className={styles.metricVal}>40</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Times cited</p><p className={`${styles.metricVal} ${styles.red}`}>2</p></div>
        <div className={styles.metric}><p className={styles.metricLabel}>Citation rate</p><p className={`${styles.metricVal} ${styles.red}`}>5%</p></div>
      </div>
    </>
  );
}

function CompetitorsPanel() {
  const comps = [
    { rank: '1', name: 'HubSpot', domain: 'hubspot.com', count: '32/40' },
    { rank: '2', name: 'Salesforce', domain: 'salesforce.com', count: '24/40' },
    { rank: '3', name: 'Marketo', domain: 'marketo.com', count: '18/40' },
  ];
  return (
    <>
      <h3 className={styles.panelTitle}>Who&apos;s winning your AI traffic</h3>
      <div className={styles.compList}>
        {comps.map((c) => (
          <div key={c.domain} className={styles.comp}>
            <span className={styles.compRank}>{c.rank}</span>
            <div className={styles.compInfo}><span className={styles.compName}>{c.name}</span><span className={styles.compDomain}>{c.domain}</span></div>
            <span className={styles.compCount}>{c.count}</span>
          </div>
        ))}
        <div className={styles.compDivider} />
        <div className={`${styles.comp} ${styles.compYou}`}>
          <span className={styles.compRankYou}>--</span>
          <div className={styles.compInfo}><span className={styles.compNameYou}>Your brand</span><span className={styles.compDomainYou}>yourbrand.com</span></div>
          <span className={styles.compCountYou}>2/40</span>
        </div>
      </div>
      <div className={styles.insightRow} style={{ marginTop: 14 }}>
        <div className={styles.insight}><i className="ti ti-trophy" aria-hidden="true" style={{ color: '#DC2626' }} /><div><p className={styles.insightTitle}>HubSpot dominates</p><p className={styles.insightDesc}>Cited in 80% of prompts your buyers are asking.</p></div></div>
        <div className={styles.insight}><i className="ti ti-arrow-down-right" aria-hidden="true" style={{ color: '#B45309' }} /><div><p className={styles.insightTitle}>Outranked by 3</p><p className={styles.insightDesc}>Every competitor above captures traffic you&apos;re missing.</p></div></div>
      </div>
    </>
  );
}

function PlanPanel() {
  const recs = [
    { num: 1, title: 'Add structured data markup', desc: 'Implement JSON-LD schema for key pages.', pri: 'high' },
    { num: 2, title: 'Build authoritative citations', desc: 'Get mentioned in publications AI engines trust.', pri: 'high' },
    { num: 3, title: 'Optimize for conversational queries', desc: 'Answer questions in the first 50 words.', pri: 'med' },
    { num: 4, title: 'Increase content freshness', desc: 'Publish weekly to signal active expertise.', pri: 'med' },
    { num: 5, title: 'Establish brand entity', desc: 'Create entity pages, ensure NAP consistency.', pri: 'low' },
  ];
  return (
    <>
      <h3 className={styles.panelTitle}>Your 90-day action plan</h3>
      <div className={styles.recList}>
        {recs.map((r) => (
          <div key={r.num} className={styles.rec}>
            <span className={styles.recNum}>{r.num}</span>
            <div className={styles.recContent}><p className={styles.recTitle}>{r.title}</p><p className={styles.recDesc}>{r.desc}</p></div>
            <span className={`${styles.recPri} ${r.pri === 'high' ? styles.priHigh : r.pri === 'med' ? styles.priMed : styles.priLow}`}>{r.pri}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default SampleReport;
