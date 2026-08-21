export function scorePhraseMatch(target: string, transcript: string): number {
  const targetTokens = tokenize(target);
  const spokenTokens = tokenize(transcript);
  if (targetTokens.length === 0 || spokenTokens.length === 0) return 0;

  const remaining = new Map<string, number>();
  for (const token of targetTokens) remaining.set(token, (remaining.get(token) || 0) + 1);
  let matched = 0;
  for (const token of spokenTokens) {
    const count = remaining.get(token) || 0;
    if (count > 0) {
      matched += 1;
      remaining.set(token, count - 1);
    }
  }
  const precision = matched / spokenTokens.length;
  const recall = matched / targetTokens.length;
  return precision + recall === 0 ? 0 : Number(((2 * precision * recall) / (precision + recall)).toFixed(3));
}

function tokenize(value: string): string[] {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
