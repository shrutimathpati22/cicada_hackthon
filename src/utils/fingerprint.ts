import { AlertSeverity } from '../types/veilwatch';

export async function generatePrivacySafeHash(normalizedString: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizedString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 16)
      .toUpperCase();
  }

  // Deterministic fallback hash if SubtleCrypto is unavailable
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < normalizedString.length; i++) {
    const ch = normalizedString.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
  return combined.padStart(16, '0').slice(0, 16);
}

export function buildNormalizedSignature(params: {
  category: string;
  severity: AlertSeverity;
  componentType: string;
  patternCode: string;
}): string {
  // Strictly non-PII, non-raw-log normalized structural characteristics
  return [
    params.category.trim().toLowerCase(),
    params.severity.trim().toLowerCase(),
    params.componentType.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
    params.patternCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
  ].join('|');
}
