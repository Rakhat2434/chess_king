const GMAIL_LOCAL_PART_REGEX = /^[a-z0-9](?:[a-z0-9.]{4,28}[a-z0-9])$/;
const KAZAKHSTAN_PHONE_REGEX = /^7\d{10}$/;

export function normalizeGmailAddress(value: string): string | null {
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

export function isValidGmailAddress(value: string): boolean {
  return normalizeGmailAddress(value) !== null;
}

export function normalizeKazakhstanPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;

  if (!KAZAKHSTAN_PHONE_REGEX.test(normalized)) {
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
