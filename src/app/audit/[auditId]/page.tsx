import type { Metadata } from 'next';
import { AuditResultPage } from '@/components/aeo';
import type { AuditState, CategoryScore } from '@/components/aeo';

type SearchParams = { demo?: string; state?: string };

type PageProps = {
  params: Promise<{ auditId: string }>;
  searchParams: Promise<SearchParams>;
};

const VALID_STATES: readonly AuditState[] = [
  'loading',
  'failed',
  'preview',
  'unlocked',
];

function resolveState(sp: SearchParams): AuditState {
  const raw = sp.demo ?? sp.state;
  if (raw && (VALID_STATES as readonly string[]).includes(raw)) {
    return raw as AuditState;
  }
  return 'preview';
}

function buildCategoryScores(state: AuditState): CategoryScore[] {
  const locked = state === 'preview';
  return [
    { label: 'Structured Data', score: 71, grade: 'C', locked },
    { label: 'Content Authority', score: 55, grade: 'D', locked },
    { label: 'Citations & Mentions', score: 80, grade: 'B', locked },
    { label: 'Technical SEO', score: 48, grade: 'F', locked },
    { label: 'Topical Coverage', score: 62, grade: 'C', locked },
  ];
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  await searchParams;
  const domain = 'example.com';
  return {
    title: `${domain} AEO Report | Campaign Creators`,
  };
}

export default async function AuditResultRoute({
  params,
  searchParams,
}: PageProps) {
  await params;
  const sp = await searchParams;
  const state = resolveState(sp);
  const score = 62;
  const grade = 'C';
  const domain = 'example.com';
  const categoryScores = buildCategoryScores(state);

  return (
    <AuditResultPage
      state={state}
      score={score}
      grade={grade}
      domain={domain}
      categoryScores={categoryScores}
    />
  );
}
