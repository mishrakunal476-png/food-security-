const CONCERNING_PHRASES = [
  'mold',
  'mould',
  'spoiled',
  'rotten',
  'sour smelling',
  'left out overnight',
  'left unrefrigerated',
  'unrefrigerated',
  'temperature unknown',
  'unknown temperature',
  'past expiry',
  'expired',
  'cross-contamination',
  'cross contamination',
  'contamination',
] as const;

/** Detect a short set of concerning phrases for a human review prompt only; this is not a food-safety assessment. */
export function getSafetyConcernFlags(...details: string[]): string[] {
  const normalized = details.join(' ').toLocaleLowerCase();
  return CONCERNING_PHRASES.filter((phrase) => normalized.includes(phrase));
}
