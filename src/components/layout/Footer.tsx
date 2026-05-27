import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <span className={styles.copy}>
          © {year} Campaign Creators. All rights reserved.
        </span>
        <nav className={styles.links} aria-label="Legal">
          <a className={styles.link} href="/privacy">
            Privacy Policy
          </a>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <a className={styles.link} href="/terms">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
