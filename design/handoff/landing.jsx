/* global React, Icon, STAGES */
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

function Landing({ navigate, startAudit, tweaks }) {
  const [domain, setDomain] = useStateL('');
  const [touched, setTouched] = useStateL(false);
  const inputRef = useRefL(null);

  const cleanDomain = (raw) => raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();

  const isValid = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(cleanDomain(domain));

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    startAudit(cleanDomain(domain));
  };

  const tryExample = (d) => {
    setDomain(d);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
        </div>
        <div className="container hero-inner">
          <span className="eyebrow">
            <span className="pulse"></span>
            <span><strong style={{ color: 'var(--ink)', fontWeight: 600 }}>62%</strong> of B2B buyers now start research in ChatGPT</span>
          </span>

          <h1>
            Are you invisible to <span className="accent">AI search?</span>
          </h1>
          <p className="lede">
            ChatGPT, Perplexity and Google AI Overviews are answering questions about your industry right now.
            Find out if your business is being cited — or if your competitors are.
          </p>

          <form className="audit-form" onSubmit={submit}>
            <span className="prefix">https://</span>
            <input
              id="audit-input"
              ref={inputRef}
              type="text"
              placeholder="yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="off"
              spellCheck="false"
            />
            <button className="submit" type="submit" disabled={!isValid && touched && domain.length > 0}>
              Audit my site <Icon.Arrow />
            </button>
          </form>
          {touched && domain.length > 0 && !isValid && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--bad)', fontFamily: 'var(--font-mono)' }}>
              ↑ Enter a valid domain (e.g. example.com)
            </div>
          )}

          <div className="hero-meta">
            <span className="item"><Icon.Lock /> Free · No signup</span>
            <span className="dot"></span>
            <span className="item"><Icon.Clock /> Results in ~90 seconds</span>
            <span className="dot"></span>
            <span className="item"><Icon.Spark /> Plain-English report</span>
          </div>

          <div style={{ marginTop: 28, fontSize: 13, color: 'var(--ink-3)' }}>
            Try an example:&nbsp;
            {['stripe.com', 'shopify.com', 'hubspot.com'].map((d, i) => (
              <span key={d}>
                {i > 0 && <span style={{ color: 'var(--line-strong)', margin: '0 8px' }}>·</span>}
                <button
                  onClick={() => tryExample(d)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: 13, padding: 0, cursor: 'pointer' }}
                >
                  {d}
                </button>
              </span>
            ))}
          </div>

          {/* Pipeline preview card */}
          <PipelinePreview domain={domain || 'yourcompany.com'} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section section-tint" id="how">
        <div className="container">
          <div className="section-title">
            <span className="kicker">The pipeline</span>
            <h2>From URL to actionable answers in 90 seconds</h2>
            <p>Five automated stages — no installation, no code, no account required.</p>
          </div>
          <Pipeline activeIndex={-1} />
        </div>
      </section>

      {/* ── AI ENGINES ── */}
      <section className="section" id="engines">
        <div className="container">
          <div className="section-title">
            <span className="kicker">Coverage</span>
            <h2>We test the engines your customers actually use</h2>
            <p>Real prompts. Real answers. We measure when, where, and how your brand appears.</p>
          </div>
          <div className="engines">
            <EngineLogo bg="#10A37F" label="GPT" name="ChatGPT" meta="OpenAI · 800M+ users" />
            <EngineLogo bg="#20808D" label="P" name="Perplexity" meta="Answer engine" />
            <EngineLogo bg="linear-gradient(135deg,#4285F4,#34A853)" label="G" name="Google AI Overviews" meta="Search Generative" />
            <EngineLogo bg="#D97757" label="C" name="Claude" meta="Anthropic" />
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ── */}
      <section className="section section-cream" id="sample">
        <div className="container">
          <div className="section-title">
            <span className="kicker">Your report</span>
            <h2>The questions every executive needs answered</h2>
            <p>No technical jargon. No SEO acronyms. Just the numbers that matter and what to do next.</p>
          </div>
          <div className="learn-grid">
            <div className="learn-list">
              <LearnItem n="01" h="Where do we stand right now?" p="A single 0–100 AEO Visibility Score, benchmarked against your industry." />
              <LearnItem n="02" h="What are competitors getting cited for?" p="See the prompts where rival brands appear — and you don't." />
              <LearnItem n="03" h="Why are AI engines ignoring us?" p="Plain explanations of the structural reasons (and the easy fixes)." />
              <LearnItem n="04" h="What's the dollar cost of doing nothing?" p="An estimate of pipeline at risk, based on your industry and traffic." />
              <LearnItem n="05" h="What do we fix first?" p="A prioritized 30/60/90 day plan — High/Medium/Low effort tagged." />
            </div>
            <ReportPreview />
          </div>
        </div>
      </section>

      {/* ── URGENCY / CTA ── */}
      <section className="section">
        <div className="container">
          <div className="cta-card">
            <h2>The shift to AI search is happening — with or without you.</h2>
            <p>
              Every day your brand is missing from AI answers is a day a competitor's brand isn't.
              The audit is free. The report is yours to keep. The clock is ticking.
            </p>
            <div className="cta-btns">
              <button className="btn btn-primary btn-lg" onClick={() => document.querySelector('#audit-input')?.focus()}>
                Audit your site free <Icon.Arrow />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => startAudit('example.com', true)}>
                See a sample report
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PipelinePreview({ domain }) {
  return (
    <div className="pipeline-preview" style={{ marginTop: 56, textAlign: 'left' }}>
      <div className="pp-head">
        <span className="pp-url"><Icon.Globe /> {domain}</span>
        <span className="pp-status">
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--ink-3)' }}></span>
          Ready to audit
        </span>
      </div>
      <Pipeline activeIndex={-1} compact />
    </div>
  );
}

function Pipeline({ activeIndex, compact }) {
  return (
    <div className="pipeline" style={compact ? { boxShadow: 'none', border: '1px dashed var(--line)', background: 'var(--accent)' } : {}}>
      {STAGES.map((s, i) => {
        const state = activeIndex < 0 ? 'idle' : i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'idle';
        return (
          <div className="pipe-stage" data-state={state} key={s.id}>
            <span className="pipe-num">{s.num}</span>
            <div className="pipe-icon">
              {state === 'done' ? <Icon.Check /> : s.icon}
            </div>
            <h4>{s.title}</h4>
            <p>{s.desc}</p>
            <span className="pipe-status">
              {state === 'done' && <><Icon.Check /> Complete</>}
              {state === 'active' && <><span className="spinner"></span> Running…</>}
              {state === 'idle' && <>Queued</>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EngineLogo({ bg, label, name, meta }) {
  return (
    <div className="engine">
      <div className="e-logo" style={{ background: bg }}>{label}</div>
      <div>
        <span className="e-name">{name}</span>
        <span className="e-meta">{meta}</span>
      </div>
    </div>
  );
}

function LearnItem({ n, h, p }) {
  return (
    <div className="learn-item">
      <div className="li-ic">{n}</div>
      <div>
        <h4>{h}</h4>
        <p>{p}</p>
      </div>
    </div>
  );
}

function ReportPreview() {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: 'var(--shadow-2)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>AEO Visibility Report</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 4 }}>yourcompany.com</div>
        </div>
        <div style={{
          padding: '4px 10px',
          background: '#FEF3C7',
          color: '#92400E',
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 4,
          letterSpacing: '0.08em',
        }}>NEEDS WORK</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
          42<span style={{ fontSize: 22, color: 'var(--ink-3)', fontWeight: 500 }}>/100</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          Your brand appears in <strong>2 of 12</strong> tested AI answers.
          <br />Industry average: <strong>57</strong>.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Crawlability', val: 78, cls: 'good' },
          { label: 'Schema markup', val: 35, cls: 'bad' },
          { label: 'Citation worthiness', val: 52, cls: 'warn' },
          { label: 'Brand mentions', val: 28, cls: 'bad' },
        ].map(d => (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 36px', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{d.label}</span>
            <div className="dim-bar"><div className={`dim-fill ${d.cls}`} style={{ width: d.val + '%' }}></div></div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right', color: 'var(--ink)' }}>{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.Landing = Landing;
