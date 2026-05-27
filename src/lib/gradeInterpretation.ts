export function getGradeInterpretation(grade: string): string {
  switch (grade) {
    case 'A':
      return 'Excellent AEO optimization. Your site is well-positioned for AI-driven search and answer engines.';
    case 'B':
      return 'Good AEO foundation. A few targeted improvements will push you into the top tier.';
    case 'C':
      return 'Moderate AEO presence. Significant opportunities exist to improve AI discoverability.';
    case 'D':
      return 'Weak AEO signals. Your site is largely invisible to AI answer engines.';
    case 'F':
      return 'Critical AEO gaps. Immediate action required to establish AI search visibility.';
    default:
      return `Unknown grade: ${grade}`;
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-yellow-600';
    case 'D':
      return 'text-orange-600';
    case 'F':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}
