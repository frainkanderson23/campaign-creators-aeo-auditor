/* global React, Icon */
const { useState: useStateR, useEffect: useEffectR } = React;

function Report({ domain, navigate }) {
  const [animatedScore, setAnimatedScore] = useStateR(0);
  const score = 42;
  const radius = 110;
  const circ = 2 * Math.PI * radius;

  useEffectR(() => {
    let raf;
    let start;
    const dur = 1400;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const offset = circ - (animatedScore / 100) * circ;
  const grade = score < 40 ? { cls: 'bad', label: 'Critical' } : score < 70 ? { cls: 'warn', label: 'Needs work' } : { cls: 'good', label: 'Strong' };
  const initial = (domain || 'x').replace(/^www\./, '').charAt(0).toUpperCase();

  return (
    <div className="audit-page">
      <div className="container">
        {/* Header */}
        <div className="audit-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--good)' }}></span>
              AUDIT COMPLETE · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <h1>{domain}</h1>
            <div className="a-meta">
              <span><Icon.Clock /> Generated in 11 seconds</span>
              <span style={{ color: 'var(--line-strong)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>audit_id: aud_5kqx8w2n</span>
              <span style={{ color: 'var(--line-strong)' }}>·</span>
              <span>47 pages analyzed · 12 prompts × 4 engines</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline">Share</button>
            <button className="btn btn-outline">Download PDF</button>
            <button className="btn btn-primary" onClick={() => navigate('home')}>New audit</button>
          </div>
        </div>

        {/* Score hero */}
        <div className="score-hero">
          <div className="score-ring">
            <svg width="260" height="260" viewBox="0 0 260 260">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
              </defs>
              <circle className="ring-bg" cx="130" cy="130" r={radius} fill="none" strokeWidth="14" />
              <circle
                className="ring-fill"
                cx="130" cy="130" r={radius}
                fill="none" strokeWidth="14"
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-ring-inner">
              <div className="score-num">{animatedScore}<span className="score-total">/100</span></div>
              <span className={`score-grade ${grade.cls}`}>{grade.label}</span>
            </div>
          </div>
          <div className="score-summary">
            <div className="cap" style={{ color: 'var(--ink-3)', marginBottom: 8 }}>Your AEO Visibility Score</div>
            <h2>Your brand is being skipped in 10 of 12 AI answers we tested.</h2>
            <p>
              {domain} appeared in only <strong>17%</strong> of AI-generated answers about your industry.
              The average company in your category scores <strong>57</strong>. Top performers score <strong>78+</strong>.
              The gap isn't visibility — it's structured, citable content AI engines can trust.
            </p>
            <div className="score-callout">
              <Icon.Warning />
              <div>
                <strong>Estimated impact:</strong> based on category search volume, every month at this score costs you an estimated <strong>$18K–$42K</strong> in pipeline that's going to competitors who <em>are</em> being cited.
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown + Engines */}
        <div className="report-grid">
          <div className="report-card">
            <h3>What's driving your score</h3>
            <p className="rc-sub">Six dimensions AI engines use to decide which sources to cite.</p>
            <div className="dim-list">
              {[
                { l: 'Crawlability', s: '✓ Bots can read your pages', v: 78, c: 'good' },
                { l: 'Schema markup', s: 'Missing Organization, FAQ, Product', v: 35, c: 'bad' },
                { l: 'Citation worthiness', s: 'Light on data, sources, definitions', v: 52, c: 'warn' },
                { l: 'Brand mentions on 3rd-party sites', s: 'Below category average', v: 28, c: 'bad' },
                { l: 'Topical authority', s: 'Strong in 2 of 6 priority topics', v: 61, c: 'warn' },
                { l: 'Freshness signals', s: 'Dates absent on most pages', v: 18, c: 'bad' },
              ].map(d => (
                <div className="dim-row" key={d.l}>
                  <div className="dim-label">
                    {d.l}
                    <small>{d.s}</small>
                  </div>
                  <div className="dim-bar">
                    <div className={`dim-fill ${d.c}`} style={{ width: d.v + '%' }}></div>
                  </div>
                  <div className="dim-value">{d.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="report-card">
            <h3>How each AI engine sees you</h3>
            <p className="rc-sub">12 industry prompts tested per engine.</p>
            <div>
              {[
                { logo: 'GPT', bg: '#10A37F', name: 'ChatGPT', detail: 'Cited in 3 of 12 prompts', badge: 'partial' },
                { logo: 'P',   bg: '#20808D', name: 'Perplexity', detail: 'Cited in 1 of 12 prompts', badge: 'missing' },
                { logo: 'G',   bg: 'linear-gradient(135deg,#4285F4,#34A853)', name: 'Google AI Overviews', detail: 'Mentioned in 4 of 12 prompts', badge: 'partial' },
                { logo: 'C',   bg: '#D97757', name: 'Claude', detail: 'Cited in 0 of 12 prompts', badge: 'missing' },
              ].map(e => (
                <div className="engine-result" key={e.name}>
                  <div className="er-left">
                    <div className="e-logo" style={{ background: e.bg }}>{e.logo}</div>
                    <div>
                      <span className="er-name">{e.name}</span>
                      <div className="er-detail">{e.detail}</div>
                    </div>
                  </div>
                  <span className={`er-badge ${e.badge}`}>
                    {e.badge === 'cited' ? 'CITED' : e.badge === 'partial' ? 'PARTIAL' : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 18,
              padding: '14px 16px',
              background: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
            }}>
              <strong>Competitor benchmark:</strong> two of your direct competitors are cited in <strong>9+ of 12</strong> prompts across all four engines.
            </div>
          </div>
        </div>

        {/* Sample prompts */}
        <div className="report-card" style={{ marginBottom: 24 }}>
          <h3>Sample prompts where you're not showing up</h3>
          <p className="rc-sub">Real questions your potential customers are asking AI engines — and who's getting cited instead.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {[
              { q: '"What\'s the best platform for marketing automation in 2026?"', winners: ['hubspot.com', 'marketo.com', 'activecampaign.com'] },
              { q: '"How do I track ROI from content marketing?"', winners: ['semrush.com', 'ahrefs.com'] },
              { q: '"Top inbound marketing agencies for SaaS"', winners: ['neilpatel.com', 'singlegrain.com', 'directiveconsulting.com'] },
            ].map((p, i) => (
              <div key={i} style={{
                padding: 16,
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontStyle: 'italic' }}>{p.q}</div>
                  <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--ink-3)' }}>
                    AI cited: {p.winners.map((w, j) => (
                      <span key={w} style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                        {j > 0 && ', '}{w}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  background: '#FEE2E2',
                  color: '#991B1B',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}>NOT CITED</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="report-card" style={{ marginBottom: 24 }}>
          <h3>Your 90-day action plan</h3>
          <p className="rc-sub">Prioritized by impact on your visibility score. Most can be done without engineering.</p>
          <div className="recs" style={{ marginTop: 18 }}>
            {[
              { n: '01', h: 'Add Organization & FAQ schema across the site', p: 'AI engines rely on structured data to confidently cite a source. This is the single biggest lever for your score.', pri: 'high' },
              { n: '02', h: 'Publish 4 definitional cornerstone pages', p: 'Pages that clearly answer "what is X" rank consistently in AI answers. We\'ve identified the top 4 topics for your industry.', pri: 'high' },
              { n: '03', h: 'Add visible publish & update dates to every page', p: 'Freshness signals influence which sources AI engines trust. Most of your pages currently have no date at all.', pri: 'med' },
              { n: '04', h: 'Pursue 6 strategic citation placements', p: 'Industry roundups, comparison pages, and "best of" lists where your competitors appear and you don\'t.', pri: 'med' },
              { n: '05', h: 'Reframe your product pages around customer questions', p: 'Each page should answer one concrete question with a definitive opinion AI can quote.', pri: 'low' },
            ].map(r => (
              <div className="rec" key={r.n}>
                <div className="rec-num">{r.n}</div>
                <div>
                  <h4>{r.h}</h4>
                  <p>{r.p}</p>
                </div>
                <span className={`rec-priority ${r.pri}`}>
                  {r.pri === 'high' ? 'High impact' : r.pri === 'med' ? 'Medium' : 'Low / quick'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="cta-card">
          <h2>Want help executing on this plan?</h2>
          <p>
            Campaign Creators has helped 200+ B2B brands become AI-visible.
            Book a 30-minute strategy call — we'll walk through your report and map out the fastest path to a citation-worthy site.
          </p>
          <div className="cta-btns">
            <button className="btn btn-primary btn-lg">
              Book strategy call <Icon.Arrow />
            </button>
            <button className="btn btn-outline btn-lg">
              Download full PDF report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Report = Report;
