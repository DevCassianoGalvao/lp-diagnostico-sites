export function cleanText(value: string, max = 120) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function firstName(value: string) {
  const clean = editableText(value, 40).toLocaleLowerCase("pt-BR");
  return clean.replace(/(^|[^\p{L}\p{M}])(\p{L})/gu, (_, separator: string, letter: string) => (
    separator + letter.toLocaleUpperCase("pt-BR")
  ));
}

export function businessName(value: string) {
  return editableText(value, 80);
}

export function editableText(value: string, max = 180) {
  return value
    .replace(/[<>]/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/^ +/, "")
    .slice(0, max);
}
