import styles from './Header.module.css';

export function Header() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? '#';

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <a
          className={styles.brand}
          href="https://campaigncreators.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Campaign Creators home (opens in a new tab)"
        >
          <span className={styles.brandMark} aria-hidden="true">
            CC
          </span>
          <span className={styles.brandText}>Campaign Creators</span>
        </a>

        <a
          className={styles.cta}
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book a Consultation (opens in a new tab)"
        >
          Book a Consultation
        </a>
      </div>
    </header>
  );
}

export default Header;
