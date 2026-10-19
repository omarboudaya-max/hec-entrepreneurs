// Member Hierarchy Sorting Utility
// Ensures Youssef Drira (Président) is always #1, followed by Bureau Exécutif,
// Responsables, Membres, and finally Nouveaux Membres.

export function getMemberSortRank(member: {
  email?: string | null;
  role?: string | null;
  poste?: string | null;
  full_name?: string | null;
}): number {
  const email = (member.email || "").toLowerCase().trim();
  const poste = (member.poste || "").toLowerCase().trim();
  const role = (member.role || "").toLowerCase().trim();
  const name = (member.full_name || "").toLowerCase().trim();

  // 1. Président (Youssef Drira) -> Absolute #1 Top Priority
  if (
    email.includes("yousarsif.drira") ||
    email.includes("youssefdrira") ||
    name.includes("youssef drira") ||
    (poste.includes("président") && !poste.includes("vice")) ||
    (poste.includes("president") && !poste.includes("vice"))
  ) {
    return 1;
  }

  // 2. Bureau Exécutif
  if (
    role === "bureau" ||
    poste.includes("vice-présidente") ||
    poste.includes("vice-president") ||
    poste.includes("secrétaire générale") ||
    (poste.includes("trésorier") && !poste.includes("adjoint"))
  ) {
    if (poste.includes("secrétaire") || email.includes("yassminzghal")) return 2;
    if (poste.includes("trésorier") || email.includes("kamounmelek")) return 3;
    if (poste.includes("adhérent") || email.includes("benamornourhene")) return 4;
    if (poste.includes("relations") || email.includes("nouraderbel")) return 5;
    if (poste.includes("communication") || email.includes("inestrabelsi")) return 6;
    return 9;
  }

  // 3. Lead Développeur
  if (
    role === "developpeur" ||
    email.includes("omarboudaya") ||
    poste.includes("développeur") ||
    poste.includes("developer")
  ) {
    return 10;
  }

  // 4. Responsables
  if (
    role === "responsable" ||
    poste.startsWith("responsable") ||
    poste.includes("adjoint")
  ) {
    if (poste.includes("événement") || email.includes("edamguermazi")) return 15;
    if (poste.includes("innovation") || email.includes("abbessirihem")) return 16;
    if (poste.includes("trésorier adjoint") || email.includes("hammemimohamed")) return 17;
    if (poste.includes("intégration") || email.includes("khadijahouidi")) return 18;
    if (poste.includes("protocole interne") || email.includes("jenniachref")) return 19;
    if (poste.includes("protocole externe") || email.includes("elmehditesnim")) return 20;
    if (poste.includes("sponsoring") || email.includes("ademawedi")) return 21;
    if (poste.includes("planification") || email.includes("eyacherif")) return 22;
    if (poste.includes("création") || email.includes("maryemkhelifi")) return 23;
    return 29;
  }

  // 5. Anciens Membres (Regular Membres)
  const isNouveau =
    role === "nouveau_membre" ||
    poste.includes("nouveau membre");

  if (!isNouveau && role === "membre") {
    return 50;
  }

  // 6. Nouveaux Membres
  return 100;
}

export function sortClubProfiles<T extends {
  email?: string | null;
  role?: string | null;
  poste?: string | null;
  full_name?: string | null;
  created_at?: string;
}>(profiles: T[]): T[] {
  return [...profiles].sort((a, b) => {
    const rankA = getMemberSortRank(a);
    const rankB = getMemberSortRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Inside the same rank, preserve seniority / creation order
    if (a.created_at && b.created_at) {
      const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (timeDiff !== 0) return timeDiff;
    }

    return (a.full_name || "").localeCompare(b.full_name || "", "fr");
  });
}
