import * as crypto from 'crypto';

/**
 * Escape unsafe characters.
 */
export function escapeRegexSpecialCharacters(string: string): string {
  return string.toString().replace(/[<>*()?+]/g, '\\$&');
}

/**
 * Generate a random alphanumeric string.
 */
export function generateRandomAlphanumericString(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateRandomAlphanumeric(): string {
  return Math.random().toString(36).slice(2,6).toUpperCase();
}

/**
 * Generate a random numeric string.
 */
export function generateRandomNumericString(length = 4): string {
  if (isNaN(length)) {
    throw new TypeError('Length must be a number');
  }
  if (length < 1) {
    throw new RangeError('Length must be at least 1');
  }
  const possible = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return code;
}
