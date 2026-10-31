/**
 * =========================================================================
 * GOOGLE APPS SCRIPT : FEUILLE GOOGLE SHEETS "HEC DOCTORIALES SERIES 2026"
 * =========================================================================
 *
 * COMMENT CONNECTER VOTRE GOOGLE SHEET EN 1 MINUTE :
 * 1. Créez un nouveau Google Sheet sur https://sheets.new
 * 2. Dans le menu en haut, cliquez sur : Extensions > Apps Script
 * 3. Effacez tout le code présent et collez l'intégralité de ce fichier.
 * 4. (Optionnel) Cliquez sur "Exécuter" (fonction `setupSheetDoctoriales`) pour créer
 *    immédiatement les colonnes colorées (ou laissez le script les créer tout seul à la 1re inscription).
 * 5. Cliquez en haut à droite sur : Déployer > Nouveau déploiement
 *    - Cliquez sur la roue dentée (Sélectionner le type) > "Application Web"
 *    - Exécuter en tant que : "Moi"
 *    - Qui a accès : "Tout le monde" (TRÈS IMPORTANT)
 *    - Cliquez sur "Déployer" (autorisez l'accès si Google le demande)
 * 6. Copiez l'URL de l'application Web (`https://script.google.com/macros/s/.../exec`)
 *    et envoyez-la moi (ou mettez-la dans `NEXT_PUBLIC_DOCTORIALES_SHEETS_URL`).
 */

const NOM_ONGLET = "Inscriptions Doctoriales";

const ENTETES = [
  "ID Pass",
  "Date d'inscription",
  "Nom et Prénom",
  "Adresse e-mail",
  "Statut",
  "Établissement",
  "Niveau d'études",
  "Formation / Spécialité",
  "Jeudi Matin (Sessions)",
  "Jeudi Après-midi (Session)",
  "Vendredi 09h00 - 10h30 / 12h30",
  "Vendredi 11h00 - 12h30",
  "Atelier IA & Prise de décision",
  "PC Portable & Chargeur",
  "Prérequis Confirmés",
  "Récapitulatif Complet des Sessions"
];

function getOrSetupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(NOM_ONGLET);

  if (!sheet) {
    sheet = ss.getSheets()[0];
    if (sheet && sheet.getLastRow() === 0) {
      sheet.setName(NOM_ONGLET);
    } else {
      sheet = ss.insertSheet(NOM_ONGLET);
    }
  }

  // Si la première ligne est vide, on crée et formate les en-têtes
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ENTETES.length)
      .setValues([ENTETES])
      .setFontWeight("bold")
      .setBackground("#4c1d95")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, ENTETES.length, 180);
    sheet.setColumnWidth(3, 220); // Nom et Prénom
    sheet.setColumnWidth(4, 240); // Email
    sheet.setColumnWidth(9, 280); // Jeudi Matin
    sheet.setColumnWidth(16, 380); // Récapitulatif
  }

  return sheet;
}

function setupSheetDoctoriales() {
  const sheet = getOrSetupSheet();
  Logger.log("✅ Feuille '" + sheet.getName() + "' configurée avec succès !");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getOrSetupSheet();
    const data = JSON.parse(e.postData.contents);

    const jeudiMatinStr = Array.isArray(data.sessionsJeudiMatin)
      ? data.sessionsJeudiMatin.join(" | ")
      : (data.sessionsJeudiMatin || "");

    const row = [
      data.registrationId || "",
      data.submittedAt || new Date().toLocaleString("fr-FR", { timeZone: "Africa/Tunis" }),
      data.fullName || "",
      data.email || "",
      data.status || "",
      data.institution || "",
      data.educationLevel || "",
      data.specialty || "",
      jeudiMatinStr,
      data.sessionJeudiApresMidi || "",
      data.sessionVendredi09h || "",
      data.sessionVendredi11h || "",
      data.isManagementWorkshop ? "Oui (09h00 - 12h30)" : "Non",
      data.hasLaptopAndCharger || "Non applicable",
      data.isManagementWorkshop ? (data.confirmedPrerequisites ? "Oui" : "Non") : "Non applicable",
      data.sessionChoice || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, registrationId: data.registrationId })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
