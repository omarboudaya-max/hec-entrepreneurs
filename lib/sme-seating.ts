export type SeatWing = "top-left" | "top-right" | "middle-left" | "middle-right";

export type SeatCategory =
  | "student"        // Choosable by Étudiants (Top-Left outer 2 columns + Middle rows 3..8)
  | "professional"   // Choosable by Professionnels (Middle rows 1..2)
  | "intervenant"    // Top-Left inner 2 columns (Reserved)
  | "club";          // Top-Right 4 columns (Reserved)

export interface SmeSeat {
  id: string;          // Internal unique ID e.g. "MG-R3-C2"
  code: string;        // Place name: "<MOT> <LIGNE>" e.g. "IMPACT 3"
  label: string;       // Place name: "<MOT> <LIGNE>"
  columnWord: string;  // Word representing the column
  lineNumber: number;  // Line number
  wing: SeatWing;
  row: number;         // Line index (1..5 for top wings, 1..8 for middle blocks)
  col: number;         // Column index within wing
  category: SeatCategory;
  preReserved: boolean;
}

/**
 * 15 mots dans le thème de l'entrepreneuriat (1 mot par colonne).
 * Facilement remplaçables dès que la liste finale des 15 mots est communiquée.
 */
export const SME_COLUMN_WORDS: string[] = [
  "AUDACE",       // Col 1 (Aile Gauche - Col 1)
  "VISION",       // Col 2 (Aile Gauche - Col 2)
  "INITIATIVE",   // Col 3 (Aile Gauche - Col 3 Intervenants)
  "SYNERGIE",     // Col 4 (Aile Gauche - Col 4 Intervenants)
  "IMPACT",       // Col 5 (Milieu Gauche - Col 1)
  "INNOVATION",   // Col 6 (Milieu Gauche - Col 2)
  "AMBITION",     // Col 7 (Milieu Gauche - Col 3)
  "LEADERSHIP",   // Col 8 (Milieu Gauche - Col 4)
  "CRÉATIVITÉ",   // Col 9 (Milieu Gauche - Col 5)
  "RÉSILIENCE",   // Col 10 (Milieu Droite - Col 1)
  "PASSION",      // Col 11 (Milieu Droite - Col 2)
  "EXCELLENCE",   // Col 12 (Milieu Droite - Col 3)
  "AVENIR",       // Col 13 (Milieu Droite - Col 4)
  "PROGRÈS",      // Col 14 (Milieu Droite - Col 5)
  "ÉLAN",         // Col 15 (Aile Droite - Réservé Club)
];

// 3 places déjà réservées dans les 2 premières rangées du milieu (Professionnels)
export const PRE_RESERVED_PRO_SEAT_IDS = new Set([
  "MG-R1-C4",
  "MG-R1-C5",
  "MD-R1-C1",
]);

export function generateChapelleSeats(): SmeSeat[] {
  const seats: SmeSeat[] = [];

  // 1. TOP LEFT WING : 4 colonnes verticales de 5 chaises (4 x 5)
  // Colonnes 1 & 2 (externes) : choisissables par les étudiants
  // Colonnes 3 & 4 (internes) : réservées aux intervenants
  for (let col = 1; col <= 4; col++) {
    const isIntervenant = col >= 3;
    const columnWord = SME_COLUMN_WORDS[col - 1];
    for (let row = 1; row <= 5; row++) {
      const id = `AG-C${col}-R${row}`;
      const code = `${columnWord} ${row}`;

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "top-left",
        row,
        col,
        category: isIntervenant ? "intervenant" : "student",
        preReserved: isIntervenant,
      });
    }
  }

  // 2. MIDDLE LEFT (À gauche de la Piste) : 5 colonnes x 8 lignes
  // Lignes 1 & 2 : choisissables uniquement par les Professionnels (avec 2 places déjà réservées)
  // Lignes 3 à 8 : choisissables par les Étudiants
  for (let row = 1; row <= 8; row++) {
    const isProRow = row <= 2;
    for (let col = 1; col <= 5; col++) {
      const id = `MG-R${row}-C${col}`;
      const columnWord = SME_COLUMN_WORDS[4 + (col - 1)]; // Words index 4..8
      const code = `${columnWord} ${row}`;
      const isPreReserved = PRE_RESERVED_PRO_SEAT_IDS.has(id);

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "middle-left",
        row,
        col,
        category: isProRow ? "professional" : "student",
        preReserved: isPreReserved,
      });
    }
  }

  // 3. MIDDLE RIGHT (À droite de la Piste) : 5 colonnes x 8 lignes
  // Lignes 1 & 2 : choisissables uniquement par les Professionnels (avec 1 place déjà réservée -> 3 au total)
  // Lignes 3 à 8 : choisissables par les Étudiants
  for (let row = 1; row <= 8; row++) {
    const isProRow = row <= 2;
    for (let col = 1; col <= 5; col++) {
      const id = `MD-R${row}-C${col}`;
      const columnWord = SME_COLUMN_WORDS[9 + (col - 1)]; // Words index 9..13
      const code = `${columnWord} ${row}`;
      const isPreReserved = PRE_RESERVED_PRO_SEAT_IDS.has(id);

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "middle-right",
        row,
        col,
        category: isProRow ? "professional" : "student",
        preReserved: isPreReserved,
      });
    }
  }

  // 4. TOP RIGHT WING : 4 colonnes verticales de 5 chaises (4 x 5) — Toutes réservées
  for (let col = 1; col <= 4; col++) {
    const columnWord = SME_COLUMN_WORDS[14];
    for (let row = 1; row <= 5; row++) {
      const id = `AD-C${col}-R${row}`;
      const code = `${columnWord} ${col}-${row}`;

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "top-right",
        row,
        col,
        category: "club",
        preReserved: true,
      });
    }
  }

  return seats;
}

export const CHAPELLE_SEATS: SmeSeat[] = generateChapelleSeats();

export const CHAPELLE_SEATS_BY_ID: Record<string, SmeSeat> = Object.fromEntries(
  CHAPELLE_SEATS.map((s) => [s.id, s])
);
