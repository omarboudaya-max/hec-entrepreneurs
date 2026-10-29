/**
 * =========================================================================
 * GOOGLE APPS SCRIPT : CRÉATION AUTOMATIQUE DU FORMULAIRE "HEC DOCTORIALES"
 * =========================================================================
 * 
 * Événement : HEC Doctoriales - Atelier IA et Prise de Décisions à l'IHEC
 * 
 * INSTRUCTIONS POUR L'UTILISATION :
 * 1. Ouvrez https://script.google.com/
 * 2. Créez un "Nouveau projet".
 * 3. Collez l'intégralité de ce code.
 * 4. Cliquez sur "Exécuter" (fonction 'creerGoogleFormDoctoriales').
 * 5. Donnez les autorisations demandées à Google.
 * 6. Les liens du Google Form et de la feuille de réponses Google Sheets s'afficheront dans les logs !
 */

function creerGoogleFormDoctoriales() {
  const formTitle = "HEC Doctoriales : Atelier IA et Prise de Décisions à l'IHEC";
  
  // 1. Création du formulaire Google Forms
  const form = FormApp.create(formTitle);
  
  // Description détaillée avec consignes & prérequis (Chrome & Zip)
  form.setDescription(
    "Bienvenue à l'atelier 'IA et Prise de Décisions' organisé dans le cadre des HEC Doctoriales à l'IHEC Carthage.\n\n" +
    "⏱️ Durée de l'atelier : 3 heures complètes de formation pratique et d'études de cas décisionnelles.\n" +
    "📍 Lieu : IHEC Carthage.\n" +
    "⚠️ NB : Inscription obligatoire (places limitées).\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🔴 PRÉREQUIS TECHNIQUES INDISPENSABLES POUR CHAQUE PARTICIPANT :\n" +
    "1. Disposer d'un ordinateur portable fonctionnel avec son chargeur.\n" +
    "2. Télécharger et installer Google Chrome : https://www.google.com/chrome/\n" +
    "3. Installer un outil de décompression d'archives Zip (ex: 7-Zip https://www.7-zip.org/ ou WinRAR) pour ouvrir les ressources de l'atelier.\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "Merci de renseigner soigneusement les questions ci-dessous pour valider votre place."
  );
  
  form.setConfirmationMessage(
    "Votre inscription à l'atelier 'IA et Prise de Décisions' (HEC Doctoriales) a bien été enregistrée !\n\n" +
    "Rappel important : Pensez à venir avec votre ordinateur portable, chargeur, et assurez-vous d'avoir téléchargé Google Chrome et un outil Zip."
  );
  
  form.setAllowResponseEdits(false);
  form.setProgressBar(true);

  // Question 1 : Nom et prénom
  const q1 = form.addTextItem();
  q1.setTitle("1. Nom et prénom")
    .setHelpText("Veuillez saisir votre nom complet (Ex: Mohamed Ben Salah)")
    .setRequired(true);

  // Question 2 : Adresse e-mail
  const q2 = form.addTextItem();
  q2.setTitle("2. Adresse e-mail")
    .setHelpText("Adresse e-mail valide pour recevoir la confirmation et les ressources de l'atelier")
    .setRequired(true);

  // Question 3 : Statut
  const q3 = form.addMultipleChoiceItem();
  q3.setTitle("3. Statut")
    .setChoiceValues([
      "Étudiant(e)",
      "Docteur",
      "Enseignant(e)-chercheur(se)"
    ])
    .showOtherOption(true) // Option 'Autre'
    .setRequired(true);

  // Question 4 : Niveau d’études
  const q4 = form.addMultipleChoiceItem();
  q4.setTitle("4. Niveau d’études")
    .setChoiceValues([
      "Licence L1",
      "Licence L2",
      "Licence L3",
      "Master M1",
      "Master M2",
      "Doctorat"
    ])
    .showOtherOption(true) // Option 'Autre'
    .setRequired(true);

  // Question 5 : Formation ou spécialité
  const q5 = form.addMultipleChoiceItem();
  q5.setTitle("5. Formation ou spécialité")
    .setChoiceValues([
      "Marketing",
      "Management",
      "Entrepreneuriat",
      "Comptabilité",
      "Finance",
      "Informatique et technologies de l’information"
    ])
    .showOtherOption(true) // Option 'Autre'
    .setRequired(true);

  // Question 6 : Disposez-vous d’un ordinateur portable et de son chargeur ?
  const q6 = form.addMultipleChoiceItem();
  q6.setTitle("6. Disposez-vous d’un ordinateur portable et de son chargeur ?")
    .setHelpText("L'atelier comprend des cas pratiques sur machine.")
    .setChoiceValues([
      "Oui",
      "Non"
    ])
    .setRequired(true);

  // Question 7 : Pouvez-vous participer pendant les trois heures complètes ?
  const q7 = form.addMultipleChoiceItem();
  q7.setTitle("7. Pouvez-vous participer pendant les trois heures complètes ?")
    .setHelpText("Une présence continue est requise pour bénéficier pleinement de l'atelier.")
    .setChoiceValues([
      "Oui",
      "Non",
      "Pas encore sûr(e)"
    ])
    .setRequired(true);

  // Question 8 : Quelle est votre langue préférée pour l’atelier ?
  const q8 = form.addMultipleChoiceItem();
  q8.setTitle("8. Quelle est votre langue préférée pour l’atelier ? (NB: Inscription obligatoire)")
    .setChoiceValues([
      "Français",
      "Arabe",
      "Anglais"
    ])
    .setRequired(true);

  // Question 9 (Checklist Prérequis Chrome & Zip)
  const q9 = form.addCheckboxItem();
  q9.setTitle("Prérequis indispensables : Google Chrome & Utilitaire Zip")
    .setHelpText("Cochez la case ci-dessous pour confirmer que vous aurez bien Google Chrome et un outil Zip installés sur votre PC pour l'atelier.")
    .setChoiceValues([
      "J'ai bien noté et je m'engage à télécharger Google Chrome et un outil Zip avant de venir à l'atelier."
    ])
    .setRequired(true);

  // 2. Création automatique de la feuille Google Sheets pour les réponses
  const ss = SpreadsheetApp.create("HEC Doctoriales 2026 - Réponses Formulaire IA");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const editUrl = form.getEditUrl();
  const publishedUrl = form.getPublishedUrl();
  const sheetUrl = ss.getUrl();

  Logger.log("=================================================");
  Logger.log("✅ Google Form créé avec succès !");
  Logger.log("🔗 Lien pour partager aux participants : " + publishedUrl);
  Logger.log("✏️ Lien pour modifier le formulaire : " + editUrl);
  Logger.log("📊 Lien de la feuille Google Sheets : " + sheetUrl);
  Logger.log("=================================================");
}
