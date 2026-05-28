import type { Metadata } from 'next';
import { AuditResultPage } from '@/components/aeo';

type PageProps = {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<{ demo?: string; state?: string }>;
};

const VALID_STATES = ['loading', 'failed', 'preview', 'unlocked'] as const;
type ValidState = (typeof VALID_STATES)[number];

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { auditId } = await params;
  const sp = await searchParams;
  const domain =
    sp.demo !== undefined || !auditId.includes('.')
      ? 'example.com'
      : auditId;
  return {
    title: `${domain} AEO Report | Campaign Creators`,
  };
}

export default async function AuditPage({ params, searchParams }: PageProps) {
  const { auditId } = await params;
  const sp = await searchParams;

  const rawState = sp.state as ValidState | undefined;
  const state: ValidState =
    rawState !== undefined && VALID_STATES.includes(rawState)
      ? rawState
      : 'preview';

  return (
    <AuditResultPage
      auditId={auditId}
      state={state}
      score={62}
      grade="C"
      domain="example.com"
    />
  );
}
