export function getGradeInterpretation(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'Exceptional AEO performance. Your content is optimally structured for AI discovery.';
    case 'A':
      return 'Strong AEO performance. Minor improvements could push you to exceptional.';
    case 'B':
      return 'Good AEO foundation. Several opportunities exist to improve AI visibility.';
    case 'C':
      return 'Moderate AEO presence. Significant gaps are limiting your AI discoverability.';
    case 'D':
      return 'Weak AEO signals. Your content struggles to surface in AI-generated answers.';
    case 'F':
      return 'Critical AEO deficiencies. Immediate action needed to improve AI discoverability.';
    default:
      return 'Unknown grade.';
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'text-emerald-600';
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-lime-600';
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
