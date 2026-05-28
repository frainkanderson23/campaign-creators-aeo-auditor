import styles from './ConsultationCTA.module.css';

export function ConsultationCTA() {
  return (
    <section className={styles.card} aria-label="Consultation call to action">
      <div className={styles.text}>
        <h3 className={styles.heading}>Ready to Improve Your AEO Score?</h3>
        <p className={styles.body}>
          Campaign Creators has helped 200+ B2B brands become AI-visible. Book a
          free 30-minute strategy call and we&apos;ll map out the fastest path to a
          citation-worthy site.
        </p>
      </div>
      <a href="/contact" className={styles.ctaLink}>
        Book a Free Consultation
      </a>
    </section>
  );
}

export default ConsultationCTA;
