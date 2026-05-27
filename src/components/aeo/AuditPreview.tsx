'use client';

import { useState } from 'react';
import { AuditHeroScore } from './AuditHeroScore';
import { AuditScoreCard } from './AuditScoreCard';
import { ConsultationCTA } from './ConsultationCTA';
import { EmailGateOverlay } from './EmailGateOverlay';
import styles from './AuditPreview.module.css';

const DUMMY_SCORE = 62;
const DUMMY_GRADE = 'C';
const DUMMY_DOMAIN = 'example.com';

const DUMMY_FINDINGS = [
  'Schema coverage: 40% (missing FAQ, HowTo, Article markup)',
  'Citation signals: 3 of 10 priority signals present',
  'Authority score: 58 — content depth needs strengthening',
];

export function AuditPreview() {
  const [showGate, setShowGate] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.heading}>AEO Audit Components — Preview</h1>
        <p className={styles.subhead}>
          Dummy data: score={DUMMY_SCORE}, grade=&apos;{DUMMY_GRADE}&apos;, domain=&apos;{DUMMY_DOMAIN}&apos;
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AuditHeroScore</h2>
        <AuditHeroScore
          score={DUMMY_SCORE}
          grade={DUMMY_GRADE}
          domain={DUMMY_DOMAIN}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AuditScoreCard — Unlocked</h2>
        <AuditScoreCard
          score={DUMMY_SCORE}
          grade={DUMMY_GRADE}
          domain={DUMMY_DOMAIN}
          locked={false}
          findings={DUMMY_FINDINGS}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AuditScoreCard — Locked</h2>
        <AuditScoreCard
          score={DUMMY_SCORE}
          grade={DUMMY_GRADE}
          domain={DUMMY_DOMAIN}
          locked={!unlocked}
          findings={DUMMY_FINDINGS}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ConsultationCTA</h2>
        <ConsultationCTA
          score={DUMMY_SCORE}
          grade={DUMMY_GRADE}
          domain={DUMMY_DOMAIN}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>EmailGateOverlay</h2>
        <button
          type="button"
          className={styles.openButton}
          onClick={() => setShowGate(true)}
        >
          Open EmailGateOverlay
        </button>
        {showGate && (
          <EmailGateOverlay
            onUnlock={(email) => {
              console.log('Unlocked with email:', email);
              setUnlocked(true);
              setShowGate(false);
            }}
          />
        )}
      </section>
    </div>
  );
}

export default AuditPreview;
