export function getGradeInterpretation(grade: string): string {
  switch (grade) {
    case 'A':
      return 'Excellent AEO optimisation — your content is highly discoverable by AI engines.';
    case 'B':
      return 'Good AEO foundation with room for targeted improvements.';
    case 'C':
      return 'Moderate AEO signals detected — structured improvements will drive results.';
    case 'D':
      return 'Weak AEO presence — significant gaps need addressing to surface in AI answers.';
    case 'F':
      return 'Critical AEO deficiencies — your content is unlikely to be cited by AI engines.';
    default:
      return 'Unknown grade.';
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-500';
    case 'B':
      return 'text-lime-500';
    case 'C':
      return 'text-yellow-500';
    case 'D':
      return 'text-orange-500';
    case 'F':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}
