/**
 * Display name for the navbar account box.
 *
 * Takes the first word only, then caps it at 8 characters, so a long name
 * cannot stretch the compact nav box.
 */
export function shortenUsername(name: string, maxLength = 8) {
  const firstWord = name.trim().split(/\s+/)[0] ?? "";

  if (firstWord.length <= maxLength) return firstWord;

  return firstWord.slice(0, maxLength);
}
