export function cleanText(value: string, max = 120) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function firstName(value: string) {
  const clean = cleanText(value, 40).toLocaleLowerCase("pt-BR");
  return clean.replace(/\b([\p{L}])/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

export function businessName(value: string) {
  return cleanText(value, 80);
}
