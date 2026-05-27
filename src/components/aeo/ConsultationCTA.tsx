import styles from './ConsultationCTA.module.css';

export interface ConsultationCTAProps {
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function ConsultationCTA({
  heading = 'Want expert help?',
  body = 'Book a free 30-minute AEO strategy call with our team.',
  ctaLabel = 'Book a Free Call',
  ctaHref = '#',
}: ConsultationCTAProps) {
  return (
    <section className={styles.card} aria-label="Consultation call to action">
      <div className={styles.text}>
        <h3 className={styles.heading}>{heading}</h3>
        <p className={styles.body}>{body}</p>
      </div>
      <a
        href={ctaHref}
        className={styles.ctaLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ctaLabel}
      </a>
    </section>
  );
}

export default ConsultationCTA;
