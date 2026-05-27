/* global React */
const { useState, useEffect, useRef } = React;

// ─────────────────────────────── ICONS ──────────────────────────────
const Icon = {
  Search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  Arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Globe: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Crawl: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v18"/><path d="M3 12h18"/><circle cx="12" cy="12" r="3"/></svg>,
  Brain: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>,
  Sparkle: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>,
  Doc: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>,
  Warning: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Zap: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  Lock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Clock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Spark: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>,
};

// ─────────────────────────────── HEADER ──────────────────────────────
function Header({ route, navigate }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); navigate('home'); }}>
          <span className="logo-mark"></span>
          <span className="logo-text">
            <strong>AEO Auditor</strong>
            <small>by Campaign Creators</small>
          </span>
        </a>
        <nav className="nav">
          <a href="#how">How it works</a>
          <a href="#engines">AI engines</a>
          <a href="#sample">Sample report</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('privacy'); }}>Resources</a>
        </nav>
        <div className="header-cta">
          <button className="btn btn-ghost" onClick={() => navigate('home')}>Sign in</button>
          <button className="btn btn-primary" onClick={() => {
            const el = document.querySelector('#audit-input');
            if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
            else navigate('home');
          }}>
            Run free audit <Icon.Arrow />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────── FOOTER ──────────────────────────────
function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: 'white' }}>
              <span className="logo-mark"></span>
              <span className="logo-text">
                <strong style={{ color: 'white' }}>AEO Auditor</strong>
                <small style={{ color: 'rgba(255,255,255,.5)' }}>by Campaign Creators</small>
              </span>
            </div>
            <p style={{ marginTop: 18, maxWidth: 320, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,.55)' }}>
              Discover how visible your business is in ChatGPT, Perplexity, Google AI Overviews, and other answer engines — in plain English.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><a href="#">Run an audit</a></li>
              <li><a href="#">How it works</a></li>
              <li><a href="#">Sample report</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#" onClick={(e)=>{e.preventDefault();navigate('privacy');}}>Privacy policy</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault();navigate('terms');}}>Terms of use</a></li>
            </ul>
          </div>
        </div>
        <div className="copy">
          <span>© 2026 Campaign Creators. All rights reserved.</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>v1.0 · AEO Auditor</span>
        </div>
      </div>
    </footer>
  );
}

// shared pipeline stages (used on landing + audit)
const STAGES = [
  { id: 'submit',  num: '01', icon: <Icon.Globe />,   title: 'Domain submitted',   desc: 'We verify the URL and prepare the analysis.' },
  { id: 'crawl',   num: '02', icon: <Icon.Crawl />,   title: 'Site crawl',         desc: 'Scan pages, content, schema, and metadata.' },
  { id: 'probe',   num: '03', icon: <Icon.Brain />,   title: 'AI engine probe',    desc: 'Query ChatGPT, Perplexity, Gemini, Claude.' },
  { id: 'score',   num: '04', icon: <Icon.Sparkle />, title: 'Visibility scoring', desc: 'Calculate citations, mentions, accuracy.' },
  { id: 'report',  num: '05', icon: <Icon.Doc />,     title: 'Report ready',       desc: 'Plain-language findings + next steps.' },
];

Object.assign(window, { React, useState, useEffect, useRef, Icon, Header, Footer, STAGES });
