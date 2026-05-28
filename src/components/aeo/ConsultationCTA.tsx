'use client';

import { ArrowRight } from 'lucide-react';
import styles from './ConsultationCTA.module.css';

export interface ConsultationCTAProps {
  heading?: string;
  body?: string;
  ctaLabel?: string;
}

export function ConsultationCTA({
  heading = 'Want help executing on this plan?',
  body = 'Book a free 30-minute strategy call — we’ll walk through your report and map out the fastest path to a citation-worthy site.',
  ctaLabel = 'Book a Free Consultation',
}: ConsultationCTAProps) {
  function handleClick() {
    const url = process.env.NEXT_PUBLIC_BOOKING_URL;
    if (!url) {
      console.warn(
        '[ConsultationCTA] NEXT_PUBLIC_BOOKING_URL is not set; ignoring click.',
      );
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <section className={styles.card} aria-label="Consultation call to action">
      <div className={styles.text}>
        <h3 className={styles.heading}>{heading}</h3>
        <p className={styles.body}>{body}</p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className={styles.ctaButton}
      >
        {ctaLabel}
        <ArrowRight width={16} height={16} aria-hidden />
      </button>
    </section>
  );
}

export default ConsultationCTA;
