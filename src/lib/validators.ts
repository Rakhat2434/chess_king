const GMAIL_LOCAL_PART_REGEX = /^[a-z0-9](?:[a-z0-9.]{4,28}[a-z0-9])$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KAZAKHSTAN_PHONE_REGEX = /^7\d{10}$/;
const KAZAKHSTAN_MOBILE_PREFIXES = new Set([
  '700',
  '701',
  '702',
  '705',
  '706',
  '707',
  '708',
  '747',
  '750',
  '751',
  '760',
  '761',
  '762',
  '763',
  '764',
  '771',
  '775',
  '776',
  '777',
  '778',
]);

const BLOCKED_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '20minutemail.com',
  'dispostable.com',
  'example.com',
  'example.net',
  'example.org',
  'fake.com',
  'guerrillamail.com',
  'localhost',
  'mailinator.com',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'test.com',
  'test.kz',
  'yopmail.com',
]);

const BLOCKED_EMAIL_LOCAL_PARTS = [
  /^admin\d*$/,
  /^demo\d*$/,
  /^email\d*$/,
  /^fake\d*$/,
  /^qwerty\d*$/,
  /^test\d*$/,
  /^user\d*$/,
];

function normalizeGmailAddress(value: string): string | null {
  const email = value.trim().toLowerCase();
  const [localPart, domain, ...rest] = email.split('@');

  if (rest.length > 0 || domain !== 'gmail.com') {
    return null;
  }

  if (!GMAIL_LOCAL_PART_REGEX.test(localPart) || localPart.includes('..')) {
    return null;
  }

  const canonicalLocalPart = localPart.replace(/\./g, '');

  if (!/^[a-z0-9]{6,30}$/.test(canonicalLocalPart)) {
    return null;
  }

  return `${canonicalLocalPart}@gmail.com`;
}

export function normalizeEmailAddress(value: string): string | null {
  const email = value.trim().toLowerCase();
  const [localPart, domain, ...rest] = email.split('@');
  const compactLocalPart = localPart?.replace(/[^a-z0-9]/g, '') || '';

  if (
    rest.length > 0 ||
    !localPart ||
    !domain ||
    email.length > 254 ||
    localPart.length > 64 ||
    compactLocalPart.length < 4 ||
    !EMAIL_REGEX.test(email) ||
    localPart.includes('+') ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    BLOCKED_EMAIL_DOMAINS.has(domain) ||
    domain.endsWith('.test') ||
    domain.endsWith('.invalid') ||
    domain.endsWith('.localhost') ||
    domain.includes('..') ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    BLOCKED_EMAIL_LOCAL_PARTS.some((pattern) => pattern.test(compactLocalPart))
  ) {
    return null;
  }

  return domain === 'gmail.com' ? normalizeGmailAddress(email) : email;
}

export function isValidEmailAddress(value: string): boolean {
  return normalizeEmailAddress(value) !== null;
}

export function normalizeKazakhstanPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;

  if (!KAZAKHSTAN_PHONE_REGEX.test(normalized)) {
    return null;
  }

  const operatorPrefix = normalized.slice(1, 4);
  const subscriberNumber = normalized.slice(4);
  const uniqueSubscriberDigits = new Set(subscriberNumber).size;

  if (
    !KAZAKHSTAN_MOBILE_PREFIXES.has(operatorPrefix) ||
    uniqueSubscriberDigits < 3 ||
    /^(\d)\1+$/.test(subscriberNumber) ||
    '0123456789'.includes(subscriberNumber) ||
    '9876543210'.includes(subscriberNumber)
  ) {
    return null;
  }

  return `+${normalized}`;
}

export function isValidKazakhstanPhone(value: string): boolean {
  return normalizeKazakhstanPhone(value) !== null;
}

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return 'Пароль должен содержать минимум 8 символов.';
  }

  if (!/[A-Za-zА-Яа-яЁё]/.test(password)) {
    return 'Пароль должен содержать минимум 1 букву.';
  }

  if (!/\d/.test(password)) {
    return 'Пароль должен содержать минимум 1 цифру.';
  }

  return null;
}
