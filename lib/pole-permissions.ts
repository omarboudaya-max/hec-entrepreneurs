// Shared Pole and Department Permissions Configuration

export const POLE_OPTIONS = [
  "Tous",
  "Général",
  "Sponsoring",
  "Projets & Événements",
  "Communication",
  "IT & Web",
  "Protocole",
] as const;

export type PoleType = typeof POLE_OPTIONS[number];

/**
 * Checks if the user is a super-viewer who can view all poles:
 * - Lead Développeur (Omar Boudaya)
 * - Président (Youssef Drira)
 * - Responsable Événements (Edam Guermazi)
 */
export function canSeeAllPoles(
  userEmail?: string | null,
  poste?: string | null,
  role?: string | null
): boolean {
  if (!userEmail && !poste && !role) return false;
  const email = (userEmail || "").toLowerCase().trim();
  const p = (poste || "").toLowerCase().trim();
  const r = (role || "").toLowerCase().trim();

  // 1. Développeur
  if (r === "developpeur" || email.includes("omarboudaya") || p.includes("développeur") || p.includes("developer")) {
    return true;
  }

  // 2. Président (exclude Vice-Président)
  if (email.includes("yousarsif.drira") || email.includes("youssefdrira")) {
    return true;
  }
  if ((p.includes("président") || p.includes("president")) && !p.includes("vice")) {
    return true;
  }

  // 3. Responsable Événements & Projets (Edam Guermazi)
  if (email.includes("edamguermazi") || p.includes("événement") || p.includes("evenement")) {
    return true;
  }

  return false;
}

/**
 * Returns the list of poles a user is authorized to browse and filter by.
 * "Tous" and "Général" are always visible to everyone.
 * Department poles are only returned for the respective VP, responsibles, or super-viewers.
 */
export function getAllowedPolesForUser(
  userEmail?: string | null,
  poste?: string | null,
  role?: string | null
): string[] {
  // If super-viewer, return all poles with "Tous" and "Général" leading
  if (canSeeAllPoles(userEmail, poste, role)) {
    return [...POLE_OPTIONS];
  }

  const email = (userEmail || "").toLowerCase().trim();
  const p = (poste || "").toLowerCase().trim();

  // Everyone can see "Tous" and "Général" (second after Tous)
  const allowed = ["Tous", "Général"];

  // 1. Pôle Sponsoring / Relations Extérieures
  // VP: Noura Derbel, Responsable: Adem Awedi
  if (
    email.includes("nouraderbel") ||
    email.includes("titantitan009i") ||
    email.includes("ademawedi") ||
    p.includes("sponsoring") ||
    p.includes("relations extérieures") ||
    p.includes("relations exterieures")
  ) {
    allowed.push("Sponsoring");
  }

  // 2. Pôle Communication
  // VP: Ines Trabelsi, Responsables: Eya Cherif, Maryem Khelifi
  if (
    email.includes("inestrabelsi") ||
    email.includes("eyacherif") ||
    email.includes("khlifi.maryeem") ||
    email.includes("maryemkhelifi") ||
    p.includes("communication") ||
    p.includes("diffusion") ||
    p.includes("création de contenu") ||
    p.includes("creation de contenu")
  ) {
    allowed.push("Communication");
  }

  // 3. Pôle Protocole
  // Responsables: Achref Jenni, Tesnim Mehdi
  // + VP Adhérents Nourhene Ben Amor (granted access to Protocole as requested)
  if (
    email.includes("benamornourhene") ||
    email.includes("nourhenebenamor") ||
    p.includes("adhérent") ||
    p.includes("adherent") ||
    email.includes("jenniachref") ||
    email.includes("achrefjenni") ||
    email.includes("elmehditesnim") ||
    email.includes("tesnimmehdi") ||
    p.includes("protocole")
  ) {
    allowed.push("Protocole");
  }

  // 4. Pôle IT & Web
  if (p.includes("it") || p.includes("web") || p.includes("technique")) {
    allowed.push("IT & Web");
  }

  // 5. Pôle Projets & Événements (if additional event committee members)
  if (p.includes("projet") || p.includes("event")) {
    allowed.push("Projets & Événements");
  }

  return allowed;
}

/**
 * Checks whether a given task is visible to a user.
 * A task is visible if:
 * 1. User is a super-viewer (Dev, President, Responsable Événements)
 * 2. Task pole is 'Général' (visible to everyone)
 * 3. Task is directly assigned to the user
 * 4. User belongs to the department corresponding to task.pole
 */
export function isTaskVisibleToUser(
  task: { pole?: string | null; assigned_to?: string | null },
  userId?: string | null,
  userEmail?: string | null,
  poste?: string | null,
  role?: string | null
): boolean {
  if (canSeeAllPoles(userEmail, poste, role)) return true;
  if (!task.pole || task.pole === "Général") return true;
  if (userId && task.assigned_to === userId) return true;

  const allowedPoles = getAllowedPolesForUser(userEmail, poste, role);
  return allowedPoles.includes(task.pole);
}
