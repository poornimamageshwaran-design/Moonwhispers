export function extractBearerToken(input: string | null | undefined) {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

