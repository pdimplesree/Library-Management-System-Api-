export function extractStudentId(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';

  try {
    const parsed = JSON.parse(rawValue);
    const candidate = parsed.studentId || parsed.student_id || parsed.rollNumber || parsed.rollNo || parsed.id;
    if (candidate) return String(candidate).trim().toUpperCase();
  } catch {
    // Non-JSON barcode values are handled below.
  }

  try {
    const parsedUrl = new URL(rawValue);
    const candidate = parsedUrl.searchParams.get('studentId')
      || parsedUrl.searchParams.get('student_id')
      || parsedUrl.searchParams.get('rollNo')
      || parsedUrl.searchParams.get('id');
    if (candidate) return candidate.trim().toUpperCase();
  } catch {
    // A plain barcode value is not a URL.
  }

  const match = rawValue.toUpperCase().match(/\b[A-Z0-9]{8,20}\b/);
  return match ? match[0] : rawValue.toUpperCase();
}
