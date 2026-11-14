export type SeatWing = "top-left" | "top-right" | "middle-left" | "middle-right";

export type SeatCategory =
  | "student"        // Choosable by Étudiants (Top-Left outer 2 columns + Middle rows 3..9)
  | "professional"   // Choosable by Professionnels (Middle rows 1..2)
  | "both"           // Choosable by both Étudiants and Professionnels (Top-Right 8x4)
  | "intervenant"    // Top-Left inner 2 columns (Reserved)
  | "reserved";      // Middle row 0 (Reserved)

export interface SmeSeat {
  id: string;          // Internal unique ID e.g. "MG-R3-C2"
  code: string;        // Place name: "<MOT> <LIGNE>" e.g. "IMPACT 3"
  label: string;       // Place name: "<MOT> <LIGNE>"
  columnWord: string;  // Word representing the column
  lineNumber: number;  // Line number
  wing: SeatWing;
  row: number;         // Line index (1..8 for top wings, 1..9 for middle blocks)
  col: number;         // Column index within wing (1..4)
  category: SeatCategory;
  preReserved: boolean;
}

/**
 * Mots dans le thème de l'entrepreneuriat (1 mot par colonne).
 * Les mots des colonnes ayant déjà des inscrits (VISION, AMBITION, CRÉATIVITÉ, RÉSILIENCE, PASSION)
 * sont strictement conservés sur leurs colonnes respectives.
 */
export const TOP_LEFT_COLUMN_WORDS = [
  "AUDACE",       // Aile Gauche - Col 1 (Étudiants)
  "VISION",       // Aile Gauche - Col 2 (Étudiants — conserve VISION 1)
  "INITIATIVE",   // Aile Gauche - Col 3 (Réservé Intervenants)
  "SYNERGIE",     // Aile Gauche - Col 4 (Réservé Intervenants)
];

export const MIDDLE_LEFT_COLUMN_WORDS = [
  "IMPACT",       // Milieu Gauche - Col 1
  "INNOVATION",   // Milieu Gauche - Col 2
  "AMBITION",     // Milieu Gauche - Col 3 (conserve AMBITION 5)
  "CRÉATIVITÉ",   // Milieu Gauche - Col 4 (conserve CRÉATIVITÉ 3 & CRÉATIVITÉ 4)
];

export const MIDDLE_RIGHT_COLUMN_WORDS = [
  "RÉSILIENCE",   // Milieu Droite - Col 1 (conserve RÉSILIENCE 3 & RÉSILIENCE 4)
  "PASSION",      // Milieu Droite - Col 2 (conserve PASSION 3)
  "EXCELLENCE",   // Milieu Droite - Col 3
  "AVENIR",       // Milieu Droite - Col 4
];

export const TOP_RIGHT_COLUMN_WORDS = [
  "LEADERSHIP",   // Aile Droite - Col 1 (Étudiants & Pros)
  "PROGRÈS",      // Aile Droite - Col 2 (Étudiants & Pros)
  "ÉLAN",         // Aile Droite - Col 3 (Étudiants & Pros)
  "RÉUSSITE",     // Aile Droite - Col 4 (Étudiants & Pros)
];

export function generateChapelleSeats(): SmeSeat[] {
  const seats: SmeSeat[] = [];

  // 1. TOP LEFT WING : 4 colonnes verticales de 8 chaises (8 x 4) — Toutes réservées
  for (let col = 1; col <= 4; col++) {
    const columnWord = TOP_LEFT_COLUMN_WORDS[col - 1];
    for (let row = 1; row <= 8; row++) {
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
        category: "reserved",
        preReserved: true,
      });
    }
  }

  // 2. MIDDLE LEFT (À gauche de la Piste) : 4 colonnes x 9 lignes (Ligne 0 réservée + Lignes 1 à 8)
  // Ligne 0 : "<MOT> 0" — réservée
  // Lignes 1 & 2 : choisissables par les Professionnels (toutes disponibles)
  // Lignes 3 à 8 : choisissables par les Étudiants
  for (let row = 0; row <= 8; row++) {
    const isRowZero = row === 0;
    const isProRow = row === 1 || row === 2;
    for (let col = 1; col <= 4; col++) {
      const id = `MG-R${row}-C${col}`;
      const columnWord = MIDDLE_LEFT_COLUMN_WORDS[col - 1];
      const code = `${columnWord} ${row}`;

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "middle-left",
        row,
        col,
        category: isRowZero ? "reserved" : isProRow ? "professional" : "student",
        preReserved: isRowZero,
      });
    }
  }

  // 3. MIDDLE RIGHT (À droite de la Piste) : 4 colonnes x 9 lignes (Ligne 0 réservée + Lignes 1 à 8)
  // Ligne 0 : "<MOT> 0" — réservée
  // Lignes 1 & 2 : choisissables par les Professionnels (toutes disponibles)
  // Lignes 3 à 8 : choisissables par les Étudiants
  for (let row = 0; row <= 8; row++) {
    const isRowZero = row === 0;
    const isProRow = row === 1 || row === 2;
    for (let col = 1; col <= 4; col++) {
      const id = `MD-R${row}-C${col}`;
      const columnWord = MIDDLE_RIGHT_COLUMN_WORDS[col - 1];
      const code = `${columnWord} ${row}`;

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "middle-right",
        row,
        col,
        category: isRowZero ? "reserved" : isProRow ? "professional" : "student",
        preReserved: isRowZero,
      });
    }
  }

  // 4. TOP RIGHT WING : 4 colonnes verticales de 8 chaises (8 x 4) — Accessibles aux Étudiants ET Professionnels
  for (let col = 1; col <= 4; col++) {
    const columnWord = TOP_RIGHT_COLUMN_WORDS[col - 1];
    for (let row = 1; row <= 8; row++) {
      const id = `AD-C${col}-R${row}`;
      const code = `${columnWord} ${row}`;

      seats.push({
        id,
        code,
        label: code,
        columnWord,
        lineNumber: row,
        wing: "top-right",
        row,
        col,
        category: "both",
        preReserved: false,
      });
    }
  }

  return seats;
}

export const CHAPELLE_SEATS: SmeSeat[] = generateChapelleSeats();

export const CHAPELLE_SEATS_BY_ID: Record<string, SmeSeat> = Object.fromEntries(
  CHAPELLE_SEATS.map((s) => [s.id, s])
);
