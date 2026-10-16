/**
 * Normalizes a full name into a login username (lowercase, no accents, no spaces/punctuation)
 * Example: "Emna Allegui" -> "emnaallegui"
 * Example: "Eya Ben Saïd" -> "eyabensaid"
 * Example: "Gharbi Aïcha" -> "gharbiaicha"
 */
export function normalizeUsername(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove all spaces and special characters
}

/**
 * Generates a standard member password:
 * Full name without spaces or MAJ + a random 4-digit number (1000-9999)
 * Example: "emnaallegui4819"
 */
export function generateRandom4Digits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateMemberPassword(fullName: string): { username: string; password: string } {
  const username = normalizeUsername(fullName);
  const password = `${username}${generateRandom4Digits()}`;
  return { username, password };
}
