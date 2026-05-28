import { AuditForm } from '@/components/aeo/AuditForm';
import styles from './page.module.css';

const SUBTITLE =
  'ChatGPT, Perplexity, and Google AI Overviews are answering questions about your industry right now. Find out if your business is being cited — or if your competitors are.';

const TRUST_SIGNALS = [
  '10,000+ businesses audited',
  'Free instant report',
  'No credit card required',
] as const;

export default function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true">
        <div className={styles.heroGrid} />
      </div>
      <div className={styles.container}>
        <span className={styles.eyebrow}>
          <span className={styles.pulse} aria-hidden="true" />
          <span>
            <strong className={styles.eyebrowStrong}>62%</strong> of B2B buyers
            now start research in ChatGPT
          </span>
        </span>

        <h1 className={styles.heading}>
          Is Your Business Invisible to AI Search?
        </h1>
        <p className={styles.subtitle}>{SUBTITLE}</p>

        <div className={styles.formWrap}>
          <AuditForm />
        </div>

        <ul className={styles.trustRow} aria-label="Trust signals">
          {TRUST_SIGNALS.map((signal, idx) => (
            <li key={signal} className={styles.trustItem}>
              {idx > 0 && (
                <span className={styles.trustDot} aria-hidden="true" />
              )}
              <span>{signal}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
