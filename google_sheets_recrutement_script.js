/**
 * =========================================================
 * SCRIPT COMPLET DU SHEET PRINCIPAL (AVEC N8N & 20 QUESTIONS)
 * =========================================================
 *  - doPost()            : reçoit les 24 champs du site web + n8n
 *  - setupTout()         : installation / mise à jour (exécuter UNE SEULE FOIS dans l'éditeur)
 *  - setupSheetPrincipal(): met à jour l'onglet 'Candidats' avec les nouveaux entêtes
 *  - creerTemplateFiche(): génère la fiche candidat détaillée avec l'évaluation
 *  - creerSheetResume()  : génère la feuille résumé des entretiens pour n8n
 */

const ONGLET_PRINCIPAL = 'Candidats';   // Nom exact de l'onglet principal

/* ---------- 1. RÉCEPTION DES CANDIDATURES DU SITE WEB ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Évite les collisions si plusieurs candidats soumettent en même temps
  try {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_PRINCIPAL);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      if (sheet) {
        sheet.setName(ONGLET_PRINCIPAL);
      } else {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(ONGLET_PRINCIPAL);
      }
    }
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.fullName || "",
      data.education || "",
      data.email || "",
      data.phone || "",
      data.facebook || "",
      data.availableTime || "",
      data.availableExams || "",
      data.otherEngagements || "",
      data.associativeExp || "",
      data.projectContribution || "",
      data.projectDetails || "",
      data.sponsorRelations || "",
      data.certifications || "",
      data.skills || "",
      data.portfolioLink || "",
      data.whyJoin || "",
      data.strategicAxis || "",
      data.contributionDomain || "",
      data.firstChoiceProject || "",
      data.howDidYouKnow || "",
      data.hasProjectIdea || "",
      data.entrepreneurshipInterest || "",
      data.interviewDate || "",
      data.interviewTime || "",
      data.submittedAt || new Date().toISOString() // Horodatage unique
    ]);

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err).setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}

/* ---------- 2. INSTALLATION / MISE À JOUR ---------- */
function setupTout() {
  setupSheetPrincipal();
  const template = creerTemplateFiche();
  const resume = creerSheetResume();
  const msg =
    'ID_TEMPLATE        : ' + template.getId() + '\n' +
    'ID_SHEET_RESUME    : ' + resume.getId() + '\n' +
    'ID_SHEET_PRINCIPAL : ' + SpreadsheetApp.getActive().getId();
  Logger.log(msg);
  SpreadsheetApp.getUi().alert('Installation / Mise à jour terminée – notez ces IDs pour n8n :\n\n' + msg);
}

/* ---------- 3. MISE EN PAGE DU SHEET PRINCIPAL ---------- */
function setupSheetPrincipal() {
  const sh = SpreadsheetApp.getActive().getSheetByName(ONGLET_PRINCIPAL);
  if (!sh) throw new Error('Onglet "' + ONGLET_PRINCIPAL + '" introuvable');

  const entetes = [
    'fullName', 'education', 'email', 'phone', 'facebook',
    'availableTime', 'availableExams', 'otherEngagements', 'associativeExp',
    'projectContribution', 'projectDetails', 'sponsorRelations', 'certifications',
    'skills', 'portfolioLink', 'whyJoin', 'strategicAxis', 'contributionDomain',
    'firstChoiceProject', 'howDidYouKnow', 'hasProjectIdea', 'entrepreneurshipInterest',
    'interviewDate', 'interviewTime', 'submittedAt',
    'id', 'status', 'sheetId', 'sheetUrl', 'reminderSent', 'interviewDone'
  ];

  sh.getRange(1, 1, 1, entetes.length).setValues([entetes])
    .setFontWeight('bold').setBackground('#0b3d6e').setFontColor('#ffffff');
  sh.setFrozenRows(1);

  const nbLignes = sh.getMaxRows();

  // Colonne 31 (AE) = case à cocher "interviewDone"
  sh.getRange(2, 31, nbLignes - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireCheckbox().build());

  // Formatage texte brut (@) pour téléphone (D), date (W) et heure (X)
  sh.getRange(2, 4, nbLignes - 1, 1).setNumberFormat('@');   // D phone
  sh.getRange(2, 23, nbLignes - 1, 1).setNumberFormat('@');  // W interviewDate
  sh.getRange(2, 24, nbLignes - 1, 1).setNumberFormat('@');  // X interviewTime

  // Mise en forme conditionnelle selon la colonne 27 (status: AA = $AA2)
  const plage = sh.getRange(2, 1, nbLignes - 1, entetes.length);
  const regles = [
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$AA2="Confirmé"')
      .setBackground('#b7e1cd').setRanges([plage]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$AA2="Terminé"')
      .setBackground('#c9daf8').setRanges([plage]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$AA2="En attente"')
      .setBackground('#fff2cc').setRanges([plage]).build(),
  ];
  sh.setConditionalFormatRules(regles);
}

/* ---------- 4. TEMPLATE FICHE INDIVIDUELLE (POUR N8N) ---------- */
function creerTemplateFiche() {
  const ss = SpreadsheetApp.create('TEMPLATE – Fiche candidat');
  const sh = ss.getSheets()[0].setName('Fiche');

  sh.getRange('A1:B1').merge().setValue('FICHE CANDIDAT HEC ENTREPRENEURS')
    .setFontSize(16).setFontWeight('bold').setFontColor('#ffffff')
    .setBackground('#0b3d6e').setHorizontalAlignment('center');

  // Bloc infos candidat (rempli automatiquement par n8n)
  const infos = [
    'ID', 'Nom complet', 'Email', 'Téléphone', 'Facebook', 'Formation',
    'Temps disponible', 'Dispo examens', 'Autres engagements', 'Expérience associative',
    'Contribution projet', 'Détails du projet', 'Relations sponsors', 'Formations / Certifs',
    'Compétences', 'Portfolio', 'Pourquoi rejoindre', 'Axe stratégique',
    'Domaines contribution', 'Projet prioritaire', 'Source découverte', 'Idée de projet',
    'Intérêt entrepreneuriat', "Date de l'entretien", "Heure de l'entretien"
  ];

  sh.getRange(3, 1, infos.length, 1).setValues(infos.map(x => [x]))
    .setFontWeight('bold').setBackground('#eef2f7');

  const startEvalRow = 3 + infos.length + 1; // Ligne d'évaluation après la liste des infos

  // Bloc évaluation (rempli par l'évaluateur, lu par n8n)
  sh.getRange('A' + startEvalRow + ':B' + startEvalRow).merge().setValue('ÉVALUATION DE L\'ENTRETIEN')
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#1e8e3e')
    .setHorizontalAlignment('center');

  const evals = ['Évaluateur', 'Communication (/5)', 'Motivation (/5)', 'Compétences (/5)',
                 'Projet (/5)', 'Note globale (/20)', 'Décision', 'Commentaires'];

  const evalStartRow = startEvalRow + 1;
  sh.getRange(evalStartRow, 1, evals.length, 1).setValues(evals.map(x => [x]))
    .setFontWeight('bold').setBackground('#e6f4ea');

  // Validation des notes 0 à 5
  sh.getRange(evalStartRow + 1, 2, 4, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberBetween(0, 5).setAllowInvalid(false).build());

  // Note globale automatique (Somme des 4 critères)
  const noteRow = evalStartRow + 5;
  sh.getRange('B' + noteRow).setFormula('=IF(COUNT(B' + (evalStartRow + 1) + ':B' + (evalStartRow + 4) + ')=0,"",SUM(B' + (evalStartRow + 1) + ':B' + (evalStartRow + 4) + '))').setFontWeight('bold');

  // Décision
  const decisionRow = evalStartRow + 6;
  sh.getRange('B' + decisionRow).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Retenu', 'En attente', 'Non retenu'], true).build());

  const commentRow = evalStartRow + 7;
  sh.getRange('B' + commentRow).setWrap(true);

  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 400);
  sh.getRange(3, 1, infos.length, 2).setBorder(true, true, true, true, true, true, '#d0d7e1', SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(evalStartRow, 1, evals.length, 2).setBorder(true, true, true, true, true, true, '#c3e6cb', SpreadsheetApp.BorderStyle.SOLID);
  sh.getRange(3, 2, infos.length, 1).setWrap(true);

  return ss;
}

/* ---------- 5. SHEET RÉSUMÉ (POUR N8N) ---------- */
function creerSheetResume() {
  const ss = SpreadsheetApp.create('Resumé des entretiens');
  const sh = ss.getSheets()[0].setName('Resumé');

  const entetes = ['id', 'fullName', 'email', 'phone', 'interviewDate', 'interviewTime', 'evaluateur',
                   'communication', 'motivation', 'competences', 'projet', 'noteGlobale', 'decision',
                   'commentaires', 'lienFiche', 'lienCopieCompleted', 'dateCompletion'];
  sh.getRange(1, 1, 1, entetes.length).setValues([entetes])
    .setFontWeight('bold').setBackground('#0b3d6e').setFontColor('#ffffff');
  sh.setFrozenRows(1);

  const plage = sh.getRange('A2:Q2000');
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$M2="Retenu"')
      .setBackground('#b7e1cd').setRanges([plage]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$M2="Non retenu"')
      .setBackground('#f4c7c3').setRanges([plage]).build(),
  ]);
  return ss;
}
