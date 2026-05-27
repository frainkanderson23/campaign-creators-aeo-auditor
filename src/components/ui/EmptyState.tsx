import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <section className={styles.root} aria-live="polite">
      <span className={styles.iconWrap} aria-hidden>
        {icon}
      </span>
      <h2 className={styles.heading}>{heading}</h2>
      {body && <p className={styles.body}>{body}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}

export default EmptyState;
