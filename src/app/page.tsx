import { AuditForm } from '@/components/aeo/AuditForm';
import { OpenAIIcon, PerplexityIcon, GoogleAIIcon, ClaudeIcon } from '@/components/aeo/EngineIcons';
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
  { bg: '#10A37F', icon: <OpenAIIcon size={24} />, name: 'ChatGPT (GPT-4o)', desc: 'The most popular AI assistant. If your customers ask ChatGPT for recommendations, will they hear about you?' },
  { bg: '#20808D', icon: <PerplexityIcon size={24} />, name: 'Perplexity', desc: 'The AI-native search engine. Perplexity answers questions with source citations — is your site one of them?' },
  { bg: '#4285F4', icon: <GoogleAIIcon size={24} />, name: 'Google AI Overviews', desc: "Google's AI summaries appear above traditional search results. Missing here means missing where it matters most." },
  { bg: '#D97757', icon: <ClaudeIcon size={24} />, name: 'Claude', desc: "Anthropic's AI assistant is increasingly used for research and business decisions. Are you part of the conversation?" },
];

const REPORT_FEATURES = [
  { title: 'AEO Visibility Score', desc: 'A single score from 0–100 measuring how visible your brand is to AI-powered search engines.' },
  { title: 'Dimension Breakdown', desc: 'Detailed analysis across 6 dimensions: crawlability, schema markup, authority, topical depth, freshness, and brand mentions.' },
  { title: 'AI Engine Comparison', desc: 'See exactly which AI engines cite your brand — and which ones cite your competitors instead.' },
  { title: 'Actionable Recommendations', desc: 'A prioritized 90-day action plan with specific steps to improve your AI visibility.' },
  { title: 'Real AI Responses', desc: 'See the actual prompts we sent to each AI engine and whether your brand appeared in their answers.' },
  { title: 'Competitive Intelligence', desc: 'Discover which competitors are getting cited when AI engines answer questions in your industry.' },
] as const;

const PIPELINE_ICONS: Record<string, React.ReactNode> = {
  '01': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35FFD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  '02': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35FFD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  '03': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35FFD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  '04': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35FFD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
    </svg>
  ),
  '05': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35FFD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

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
            <h2>How the AEO Audit works</h2>
            <p>Five automated stages — no installation, no code, no account required.</p>
          </div>
          <div className={styles.pipeline}>
            {PIPELINE_STAGES.map((s) => (
              <div className={styles.pipeStage} key={s.num}>
                <span className={styles.pipeNum}>{s.num}</span>
                <div className={styles.pipeIcon}>{PIPELINE_ICONS[s.num]}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                <span className={styles.pipeStatus}>Queued</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI ENGINES ── */}
      <section className={styles.sectionTint} id="engines">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>
            <h2>We test your visibility across 4 AI engines</h2>
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
                  {e.icon}
                </div>
                <span className={styles.engineName}>{e.name}</span>
                <p className={styles.engineDesc}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE REPORT ── */}
      <section className={styles.section} id="sample">
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitle}>
            <h2>What you&apos;ll get</h2>
            <p>
              A complete picture of your AI search visibility — and exactly what to do about it.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {REPORT_FEATURES.map((f) => (
              <div className={styles.featureCard} key={f.title}>
                <h4 className={styles.featureTitle}>{f.title}</h4>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
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
