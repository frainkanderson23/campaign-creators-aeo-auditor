import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, cta }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
      }}
    >
      <Icon size={32} color="var(--color-text-secondary)" aria-hidden />
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--font-size-lg)',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>
      <p
        className="muted"
        style={{
          fontSize: 'var(--font-size-md)',
          maxWidth: '32rem',
          margin: 0,
        }}
      >
        {description}
      </p>
      {cta && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button variant="primary" onClick={cta.onClick}>
            {cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
