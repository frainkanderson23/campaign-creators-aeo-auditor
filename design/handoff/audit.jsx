/* global React, Icon, STAGES */
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// Sample log messages played out during the simulation
const LOG_SCRIPT = [
  { stage: 0, t: 100, lvl: 'INFO',  msg: 'Audit request received for {DOMAIN}' },
  { stage: 0, t: 400, lvl: 'INFO',  msg: 'Validating domain & DNS records…' },
  { stage: 0, t: 900, lvl: 'OK',    msg: 'Domain verified · queued for processing' },
  { stage: 1, t: 1400, lvl: 'INFO', msg: 'Spawning crawler · respecting robots.txt' },
  { stage: 1, t: 1800, lvl: 'INFO', msg: 'GET / 200 OK · 142ms · 412KB' },
  { stage: 1, t: 2300, lvl: 'INFO', msg: 'Found 47 indexable URLs · 12 sitemaps' },
  { stage: 1, t: 2900, lvl: 'WARN', msg: 'No Organization schema detected' },
  { stage: 1, t: 3400, lvl: 'OK',   msg: 'Crawl complete · 47 pages analyzed' },
  { stage: 2, t: 4000, lvl: 'INFO', msg: 'Probing ChatGPT (GPT-4o)…' },
  { stage: 2, t: 4600, lvl: 'INFO', msg: 'Probing Perplexity (sonar-large)…' },
  { stage: 2, t: 5200, lvl: 'INFO', msg: 'Probing Google AI Overviews…' },
  { stage: 2, t: 5900, lvl: 'INFO', msg: 'Probing Claude (Sonnet)…' },
  { stage: 2, t: 6500, lvl: 'OK',   msg: '12 prompts × 4 engines = 48 responses' },
  { stage: 3, t: 7200, lvl: 'INFO', msg: 'Scoring citation density…' },
  { stage: 3, t: 7700, lvl: 'INFO', msg: 'Cross-referencing competitor visibility…' },
  { stage: 3, t: 8400, lvl: 'INFO', msg: 'Calculating dimension breakdowns…' },
  { stage: 3, t: 9000, lvl: 'OK',   msg: 'Visibility score: 42/100' },
  { stage: 4, t: 9600, lvl: 'INFO', msg: 'Translating findings to plain English…' },
  { stage: 4, t: 10100, lvl: 'INFO', msg: 'Generating prioritized recommendations…' },
  { stage: 4, t: 10700, lvl: 'OK',   msg: 'Report ready · redirecting…' },
];

const TOTAL_MS = 11400;

function AuditProgress({ domain, instant, onComplete, navigate }) {
  const [elapsed, setElapsed] = useStateA(instant ? TOTAL_MS : 0);
  const [logs, setLogs] = useStateA(() => instant ? LOG_SCRIPT.map(l => ({...l, msg: l.msg.replace('{DOMAIN}', domain)})) : []);
  const logRef = useRefA(null);
  const startedAt = useRefA(performance.now());

  // simulate time
  useEffectA(() => {
    if (instant) return;
    startedAt.current = performance.now();
    let raf;
    const tick = () => {
      const t = performance.now() - startedAt.current;
      setElapsed(t);
      if (t < TOTAL_MS + 800) raf = requestAnimationFrame(tick);
      else onComplete();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // append logs as time passes
  useEffectA(() => {
    if (instant) return;
    setLogs((prev) => {
      const next = LOG_SCRIPT.filter(l => l.t <= elapsed).map(l => ({
        ...l, msg: l.msg.replace('{DOMAIN}', domain)
      }));
      if (next.length === prev.length) return prev;
      return next;
    });
  }, [elapsed]);

  // auto-scroll log
  useEffectA(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs.length]);

  // current stage
  const activeIndex = (() => {
    if (elapsed >= TOTAL_MS) return 5;
    if (elapsed < 1400) return 0;
    if (elapsed < 4000) return 1;
    if (elapsed < 7200) return 2;
    if (elapsed < 9600) return 3;
    return 4;
  })();

  const progressPct = Math.min(100, (elapsed / TOTAL_MS) * 100);
  const remaining = Math.max(0, Math.ceil((TOTAL_MS - elapsed) / 1000));
  const initial = (domain || 'x').replace(/^www\./, '').charAt(0).toUpperCase();

  return (
    <div className="audit-page">
      <div className="container">
        <div className="audit-header">
          <div>
            <h1>{domain}</h1>
            <div className="a-meta">
              <span><Icon.Clock /> Started a few seconds ago</span>
              <span style={{ color: 'var(--line-strong)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>audit_id: aud_5kqx8w2n</span>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('home')}>← Run another</button>
        </div>

        <div className="domain-card">
          <div className="dc-favicon">{initial}</div>
          <div style={{ flex: 1 }}>
            <div className="dc-url">https://{domain}</div>
            <div className="dc-meta">
              <span>🌐 Resolved · 1 IP</span>
              <span>🤖 robots.txt OK</span>
              <span>🗺️ sitemap.xml found</span>
            </div>
          </div>
          <div>
            <span style={{
              padding: '6px 12px',
              background: 'var(--accent)',
              color: 'var(--primary)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}>In Progress</span>
          </div>
        </div>

        <div className="audit-pipeline-card">
          <div className="apc-head">
            <h3>
              <Icon.Zap />
              {progressPct >= 100 ? 'Audit complete' : `Auditing… stage ${Math.min(activeIndex + 1, 5)} of 5`}
            </h3>
            <span className="progress-text">
              {Math.round(progressPct)}% · ~{remaining}s remaining
            </span>
          </div>
          <div className="progress-bar">
            <div className="fill" style={{ width: progressPct + '%' }}></div>
          </div>
          <Pipeline activeIndex={activeIndex >= 5 ? 5 : activeIndex} />

          <div className="audit-log" ref={logRef}>
            {logs.map((l, i) => (
              <div className="log-line" key={i}>
                <span className="ts">[{new Date(startedAt.current + l.t).toLocaleTimeString('en-US', { hour12: false })}]</span>
                <span className={`lvl ${l.lvl === 'OK' ? 'ok' : l.lvl === 'WARN' ? 'warn' : ''}`}>{l.lvl.padEnd(4)}</span>
                <span className="msg">{l.msg}</span>
              </div>
            ))}
            {progressPct < 100 && (
              <div className="log-line">
                <span className="ts">[··:··:··]</span>
                <span className="lvl">···</span>
                <span className="msg">awaiting<span className="blinker"></span></span>
              </div>
            )}
          </div>
        </div>

        {/* While processing: educational accordion */}
        {progressPct < 100 ? (
          <div style={{
            background: 'white',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Icon.Sparkle />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>While you wait — why this matters</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { stat: '62%', t: 'of B2B buyers', d: 'start their research in ChatGPT or another AI tool, bypassing Google entirely.' },
                { stat: '0', t: 'second chances', d: 'AI answer engines pick a small set of sources per query. If you\'re not in it, you\'re invisible.' },
                { stat: '3.4×', t: 'CAC improvement', d: 'reported by brands cited consistently across major AI engines vs. those that aren\'t.' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--primary)', lineHeight: 1 }}>{m.stat}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{m.t}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: 4 }}>{m.d}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--accent)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--good)', color: 'white', display: 'grid', placeItems: 'center' }}>
                <Icon.Check />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Your report is ready.</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 4 }}>Auto-redirecting in a moment…</div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={onComplete}>
              View report <Icon.Arrow />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.AuditProgress = AuditProgress;
