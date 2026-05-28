import Link from 'next/link';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="AEO Auditor home">
          <span className={styles.logoMark} aria-hidden="true" />
          <span className={styles.logoText}>
            <strong className={styles.logoName}>AEO Auditor</strong>
            <small className={styles.logoSub}>by Campaign Creators</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <a className={styles.navLink} href="#how">How it works</a>
          <a className={styles.navLink} href="#engines">AI engines</a>
          <a className={styles.navLink} href="#sample">Sample report</a>
          <a
            className={styles.navLink}
            href="https://campaigncreators.com/blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resources
          </a>
        </nav>

        <div className={styles.ctas}>
          <a
            className={styles.ctaGhost}
            href="https://app.campaigncreators.com"
            rel="noopener noreferrer"
          >
            Sign in
          </a>
          <a className={styles.ctaPrimary} href="#audit-url">
            Run free audit
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
