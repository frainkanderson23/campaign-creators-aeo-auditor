import type { Metadata } from 'next';
import { AuditResultPage } from '@/components/aeo';

type PageProps = {
  params: Promise<{ auditId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await params;
  return {
    title: 'AEO Report | Campaign Creators',
  };
}

export default async function AuditResultRoute({ params }: PageProps) {
  await params;
  return <AuditResultPage />;
}
