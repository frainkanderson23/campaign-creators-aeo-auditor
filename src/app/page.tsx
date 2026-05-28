import { AuditForm } from '@/components/aeo/AuditForm';
import styles from './page.module.css';

const PIPELINE_STAGES = [
  {
    num: '01',
    title: 'Domain submitted',
    desc: 'We verify the URL and prepare the analysis.',
  },
  {
    num: '02',
    title: 'Site crawl',
    desc: 'Scan pages, content, schema, and metadata.',
  },
  {
    num: '03',
    title: 'AI engine probe',
    desc: 'Query ChatGPT, Perplexity, Gemini, Claude.',
  },
  {
    num: '04',
    title: 'Visibility scoring',
    desc: 'Calculate citations, mentions, accuracy.',
  },
  {
    num: '05',
    title: 'Report ready',
    desc: 'Plain-language findings + next steps.',
  },
] as const;

const AI_ENGINES = [
  { bg: '#10A37F', label: 'GPT', name: 'ChatGPT', meta: 'OpenAI · 800M+ users' },
  { bg: '#20808D', label: 'P', name: 'Perplexity', meta: 'Answer engine' },
  { bg: 'linear-gradient(135deg,#4285F4,#34A853)', label: 'G', name: 'Google AI Overviews', meta: 'Search Generative' },
  { bg: '#D97757', label: 'C', name: 'Claude', meta: 'Anthropic' },
] as const;

const LEARN_ITEMS = [
  { n: '01', h: 'Where do we stand right now?', p: 'A single 0–100 AEO Visibility Score, benchmarked against your industry.' },
  { n: '02', h: 'What are competitors getting cited for?', p: "See the prompts where rival brands appear — and you don't." },
  { n: '03', h: 'Why are AI engines ignoring us?', p: 'Plain explanations of the structural reasons (and the easy fixes).' },
  { n: '04', h: 'What's the dollar cost of doing nothing?', p: 'An estimate of pipeline at risk, based on your industry and traffic.' },
  { n: '05', h: 'What do we fix first?', p: 'A prioritized 30/60/90 day plan — High/Medium/Low effort tagged.' },
] as const;

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroGrid} />
        </div>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            <span>
              <strong className={styles.eyebrowStrong}>62%</strong> of B2B buyers
              now start research in ChatGPT
            </span>
          </span>

          <h1 className={styles.heading}>
            Are you invisible to{' '}
            <span className={styles.headingAccent}>AI search?</span>
          </h1>
          <p className={styles.subtitle}>
            ChatGPT, Perplexity and Google AI Overviews are answering questions
            about your industry right now. Find out if your business is being
            cited — or if your competitors are.
          </p>

          <div className={styles.formWrap}>
            <AuditForm />
          </div>

          <ul className={styles.trustRow} aria-label="Trust signals">
            <li className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Free · No signup
            </li>
            <li className={styles.trustDot} aria-hidden="true" />
            <li className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Results in ~90 seconds
            </li>
            <li className={styles.trustDot} aria-hidden="true" />
            <li className={styles.trustItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              Plain-English report
            </li>
          </ul>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.sectionTint} id="how">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>
            <span className={styles.kicker}>The pipeline</span>
            <h2>From URL to actionable answers in 90 seconds</h2>
            <p>Five automated stages — no installation, no code, no account required.</p>
          </div>
          <div className={styles.pipeline}>
            {PIPELINE_STAGES.map((s) => (
              <div className={styles.pipeStage} key={s.num}>
                <span className={styles.pipeNum}>{s.num}</span>
                <div className={styles.pipeIcon} />
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className={styles.pipeStatus}>Queued</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ENGINES ── */}
      <section className={styles.section} id="engines">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>
            <span className={styles.kicker}>Coverage</span>
            <h2>We test the engines your customers actually use</h2>
            <p>Real prompts. Real answers. We measure when, where, and how your brand appears.</p>
          </div>
          <div className={styles.engines}>
            {AI_ENGINES.map((e) => (
              <div className={styles.engine} key={e.name}>
                <div
                  className={styles.engineLogo}
                  style={{ background: e.bg }}
                  aria-hidden="true"
                >
                  {e.label}
                </div>
                <div>
                  <span className={styles.engineName}>{e.name}</span>
                  <span className={styles.engineMeta}>{e.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ── */}
      <section className={styles.sectionCream} id="sample">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>
            <span className={styles.kicker}>Your report</span>
            <h2>The questions every executive needs answered</h2>
            <p>
              No technical jargon. No SEO acronyms. Just the numbers that matter
              and what to do next.
            </p>
          </div>
          <div className={styles.learnGrid}>
            <ul className={styles.learnList}>
              {LEARN_ITEMS.map((item) => (
                <li key={item.n} className={styles.learnItem}>
                  <div className={styles.learnItemNum}>{item.n}</div>
                  <div>
                    <h4 className={styles.learnItemHead}>{item.h}</h4>
                    <p className={styles.learnItemText}>{item.p}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Report preview card */}
            <div className={styles.reportPreview}>
              <div className={styles.reportPreviewHead}>
                <div>
                  <div className={styles.reportLabel}>AEO Visibility Report</div>
                  <div className={styles.reportDomain}>yourcompany.com</div>
                </div>
                <div className={styles.reportBadge}>NEEDS WORK</div>
              </div>
              <div className={styles.reportScore}>
                <div className={styles.reportScoreNum}>
                  42<span className={styles.reportScoreTotal}>/100</span>
                </div>
                <p className={styles.reportScoreSub}>
                  Your brand appears in <strong>2 of 12</strong> tested AI
                  answers.
                  <br />
                  Industry average: <strong>57</strong>.
                </p>
              </div>
              <div className={styles.reportBars}>
                {[
                  { label: 'Crawlability', val: 78, cls: 'good' },
                  { label: 'Schema markup', val: 35, cls: 'bad' },
                  { label: 'Citation worthiness', val: 52, cls: 'warn' },
                  { label: 'Brand mentions', val: 28, cls: 'bad' },
                ].map((d) => (
                  <div key={d.label} className={styles.reportBar}>
                    <span className={styles.reportBarLabel}>{d.label}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.barFill} ${styles['barFill_' + d.cls]}`}
                        style={{ width: d.val + '%' }}
                      />
                    </div>
                    <span className={styles.barVal}>{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaHeading}>
              The shift to AI search is happening — with or without you.
            </h2>
            <p className={styles.ctaText}>
              Every day your brand is missing from AI answers is a day a
              competitor's brand isn't. The audit is free. The report is yours to
              keep. The clock is ticking.
            </p>
            <div className={styles.ctaBtns}>
              <a href="#audit-url" className={styles.ctaBtnPrimary}>
                Audit your site free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </a>
              <button className={styles.ctaBtnOutline} type="button">
                See a sample report
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
