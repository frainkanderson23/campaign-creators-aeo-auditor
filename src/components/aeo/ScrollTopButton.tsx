'use client';

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Scrolls the window to the top with smooth behavior. Used by CTA blocks
 * that want the visitor returned to the AuditForm at the page top.
 */
export function ScrollTopButton({ children, className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => document.getElementById('audit-url')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
    >
      {children}
    </button>
  );
}
