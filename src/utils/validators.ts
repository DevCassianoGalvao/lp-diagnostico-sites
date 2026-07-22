export function isValidEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidWhatsapp(value: string) {
  const digits = brazilianPhoneDigits(value);
  return digits.length === 10 || digits.length === 11;
}

export function formatWhatsapp(value: string) {
  const digits = brazilianPhoneDigits(value);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const subscriber = digits.slice(2);
  if (subscriber.length <= 4) return `(${areaCode}) ${subscriber}`;

  const prefixLength = subscriber.length <= 8 ? 4 : 5;
  return `(${areaCode}) ${subscriber.slice(0, prefixLength)}-${subscriber.slice(prefixLength)}`;
}

function brazilianPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  return withoutCountryCode.slice(0, 11);
}
