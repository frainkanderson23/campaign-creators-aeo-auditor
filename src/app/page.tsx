import { AuditForm } from '@/components/aeo/AuditForm';
import styles from './page.module.css';

const SUBTITLE =
  'Find out how visible your business is to AI-powered search engines like ChatGPT, Perplexity, and Google SGE — and get a free AEO score in seconds.';

export default function Home() {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          Is Your Business Invisible to AI Search?
        </h1>
        <p className={styles.subtitle}>{SUBTITLE}</p>
        <div className={styles.formWrap}>
          <AuditForm />
        </div>
      </div>
    </main>
  );
}
