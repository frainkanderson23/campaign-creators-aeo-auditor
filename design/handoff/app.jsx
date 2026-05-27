/* global React, Header, Footer, Landing, AuditProgress, Report, Policy,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSlider */
const { useState: useStateApp, useEffect: useEffectApp } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#2563EB",
  "accentTheme": "blue",
  "heroVariant": "split",
  "pipelineColor": "blue",
  "showLog": true,
  "fastMode": false
}/*EDITMODE-END*/;

const ACCENT_THEMES = {
  blue:   { primary: '#2563EB', secondary: '#6366F1', accent: '#EFF6FF', p700: '#1D4ED8', p900: '#1E3A8A' },
  indigo: { primary: '#4F46E5', secondary: '#8B5CF6', accent: '#EEF2FF', p700: '#4338CA', p900: '#312E81' },
  teal:   { primary: '#0D9488', secondary: '#06B6D4', accent: '#ECFEFF', p700: '#0F766E', p900: '#134E4A' },
  slate:  { primary: '#0F172A', secondary: '#475569', accent: '#F1F5F9', p700: '#1E293B', p900: '#020617' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateApp('home');
  const [domain, setDomain] = useStateApp('');
  const [instantReport, setInstantReport] = useStateApp(false);

  // Apply theme tweak
  useEffectApp(() => {
    const theme = ACCENT_THEMES[t.accentTheme] || ACCENT_THEMES.blue;
    const r = document.documentElement;
    r.style.setProperty('--primary', theme.primary);
    r.style.setProperty('--primary-700', theme.p700);
    r.style.setProperty('--primary-900', theme.p900);
    r.style.setProperty('--secondary', theme.secondary);
    r.style.setProperty('--accent', theme.accent);
  }, [t.accentTheme]);

  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const startAudit = (d, asSample) => {
    setDomain(d);
    setInstantReport(!!asSample);
    setRoute(asSample ? 'report' : 'audit');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
      <Header route={route} navigate={navigate} />

      {/* Route tabs (visible UI for navigation during the prototype) */}
      <RouteTabs route={route} navigate={navigate} domain={domain} />

      <main style={{ flex: 1 }}>
        {route === 'home'    && <Landing navigate={navigate} startAudit={startAudit} tweaks={t} />}
        {route === 'audit'   && (
          <AuditProgress
            domain={domain || 'yourcompany.com'}
            instant={t.fastMode}
            onComplete={() => setRoute('report')}
            navigate={navigate}
          />
        )}
        {route === 'report'  && <Report domain={domain || 'yourcompany.com'} navigate={navigate} />}
        {route === 'privacy' && <Policy kind="privacy" navigate={navigate} />}
        {route === 'terms'   && <Policy kind="terms" navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor
          label="Accent palette"
          value={t.accentTheme}
          options={['blue', 'indigo', 'teal', 'slate']}
          onChange={(v) => setTweak('accentTheme', v)}
        />
        <TweakSection label="Audit simulation" />
        <TweakToggle
          label="Fast mode (skip animation)"
          value={t.fastMode}
          onChange={(v) => setTweak('fastMode', v)}
        />
        <TweakSection label="Navigate" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['home',    'Landing'],
            ['audit',   'In progress'],
            ['report',  'Report'],
            ['privacy', 'Privacy'],
            ['terms',   'Terms'],
          ].map(([r, label]) => (
            <button
              key={r}
              onClick={() => {
                if (r === 'audit') setDomain(domain || 'yourcompany.com');
                if (r === 'report') setDomain(domain || 'yourcompany.com');
                navigate(r);
              }}
              style={{
                padding: '8px 10px',
                background: route === r ? 'var(--primary)' : 'rgba(255,255,255,.5)',
                color: route === r ? 'white' : '#29261b',
                border: '0.5px solid rgba(0,0,0,.06)',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
              {label}
            </button>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
}

function RouteTabs({ route, navigate, domain }) {
  // mimic an in-app "url bar" so reviewers can see we're modeling separate routes
  const routes = [
    { id: 'home',    path: '/' },
    { id: 'audit',   path: domain ? `/app/audit/${domain}` : '/app/audit/...' },
    { id: 'report',  path: domain ? `/app/audit/${domain}/report` : '/app/audit/.../report' },
    { id: 'privacy', path: '/privacy-policy' },
    { id: 'terms',   path: '/terms-of-use' },
  ];
  const current = routes.find(r => r.id === route)?.path ?? '/';
  return (
    <div style={{
      borderBottom: '1px solid var(--line)',
      background: 'rgba(255,255,255,.5)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 64, zIndex: 30,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, height: 38 }}>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Route</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--primary)',
          padding: '4px 10px',
          background: 'var(--accent)',
          borderRadius: 4,
        }}>{current}</span>
        <span style={{ flex: 1 }}></span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Prototype</span>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
