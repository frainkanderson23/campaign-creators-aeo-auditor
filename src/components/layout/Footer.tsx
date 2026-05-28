import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <span className={styles.logoMark} aria-hidden="true" />
              <span className={styles.logoText}>
                <strong className={styles.logoName}>AEO Auditor</strong>
                <small className={styles.logoSub}>by Campaign Creators</small>
              </span>
            </div>
            <p className={styles.tagline}>
              Discover how visible your business is in ChatGPT, Perplexity,
              Google AI Overviews, and other answer engines — in plain English.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className={styles.colHead}>Product</h4>
            <ul className={styles.links}>
              <li><a href="#audit-url" className={styles.link}>Run an audit</a></li>
              <li><a href="#how" className={styles.link}>How it works</a></li>
              <li><a href="#sample" className={styles.link}>Sample report</a></li>
              <li><a href="#" className={styles.link}>Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={styles.colHead}>Company</h4>
            <ul className={styles.links}>
              <li>
                <a
                  href="https://campaigncreators.com/about"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="https://campaigncreators.com/blog"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://campaigncreators.com/contact"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={styles.colHead}>Legal</h4>
            <ul className={styles.links}>
              <li><a href="/privacy" className={styles.link}>Privacy policy</a></li>
              <li><a href="/terms" className={styles.link}>Terms of use</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.copy}>
          <span>© {year} Campaign Creators. All rights reserved.</span>
          <span className={styles.version}>v1.0 · AEO Auditor</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
