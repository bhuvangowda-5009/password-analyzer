// Top common password roots & keyboard walks
const COMMON_PATTERNS = [
  'password', 'qwerty', '123456', '12345678', 'admin', 'welcome',
  'iloveyou', 'abc123', 'monkey', 'dragon', 'football', 'master',
  'letmein', 'shadow', 'trustno1', 'princess', 'football'
];

// Calculate Shannon entropy in bits: E = L * log2(R)
export function calculateEntropy(password) {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;

  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy);
}

// Convert seconds into human-readable duration
export function formatCrackTime(seconds) {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`; if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`; if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`; if (seconds < 31536000 * 1000000) return `${Math.round(seconds / (31536000 * 1000))}k years`;
  return 'Millions of years';
}

// Estimate crack time assuming an offline fast-hash attack (~10 billion guesses/sec)
export function estimateCrackTime(password) {
  if (!password) return 'Instant';

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 'Instant';

  const guessesPerSecond = 1e10; // 10 GH/s GPU hash cluster benchmark
  const totalCombinations = Math.pow(poolSize, password.length);
  const seconds = (totalCombinations / 2) / guessesPerSecond;

  return formatCrackTime(seconds);
}

// Check dictionary lists, sequential walk patterns, and repeats
export function checkCommonPatterns(password) {
  if (!password) return null;
  const lower = password.toLowerCase();

  for (const pattern of COMMON_PATTERNS) {
    if (lower.includes(pattern)) {
      return `Contains predictable pattern "\${pattern}"`;
    }
  }

  // 3+ identical repeating characters (e.g., 'aaa')
  if (/(.)\1{2,}/.test(password)) {
    return 'Contains repeating character sequence';
  }

  // Sequential numbers (e.g., '123', '789')
  if (/(012|123|234|345|456|567|678|789)/.test(password)) {
    return 'Contains sequential digits';
  }

  return null;
}

// Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
export function generateSecurePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}