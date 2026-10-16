const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeUsername(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function generateRandom4Digits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const newMembersRaw = `
Emna Allegui	emena.allegui@gmail.com
Ayoub Ajbouni	ayoub.ajbounin2026@ihec.ucar.tn
Molka Ouesleri	ouesletiimolka@gmail.com
Ayet Bouhrira	ayetbouhrira@gmail.com
Chaabane Hanine	haninechaabane07@gmail.com
Rais Sameh	samehrais20@gmail.com
Ghanmi Ranim	ranymghanmy@gmail.com
Amina Chakroun	amina.chakroun2006@gmail.com
Ghattas Rim	ghattasrim1@gmail.com
Ines Nciri	inesnciri014@gmail.com
Ameni Amiri	amounaamiri1210@gmail.com
Boubaker Med Yessine	yessineboubaker30@gmail.com
Ismail Gondech	ismailgondech24@gmail.com
Bouzid Darine	darinebouzid515@gmail.com
Hidri Aya	ayahidri8@gmail.com
Hmidi Nermine	hmidinermine8@gmail.com
Menjel Imene	menjelimene@gmail.com
Zeineb Gharsalli	zeinebgharsalli57@gmail.com
Zitoun Fatma	zitounfatma59@gmail.com
Matmati Azza	matmatiazza13@gmail.com
Derbeli Kacem	kacemderbeli@icloud.com
Laroussi Ons	laroussions1919@gmail.com
Omar Saheb Ettaba	omarsahebettaba@gmail.com
Rabii Chadha	rabiichadha@gmail.com
Omar Ben Youssef	omar.eit55@gmail.com
Elyes Daoud	daoud.elyes01@gmail.com
Kraiem Wejden	wejdenkraiem4@gmail.com
Nessma Ajili	ajilinessma@gmail.com
Touaiti Nesrine	touaitinesrine48@gmail.com
Nasri Mohamed Zied	nasrimohamedzied@gmail.com
Sghairi Mouhyb	sghairimouhib154@gmail.com
Khemirichayma	khemirichayma6@gmail.com
Imen Romdhani	romdhani2005@gmail.com
Ben Chaouech Eya	eyabenchaouech65@gmail.com
Yassmine Saad	saadyassmine885@gmail.com
Yassine Aissa	yassine.aissa.2026@ihec.ucar.tn
Assil Rachdi	acil.rachdi.2026@ihec.ucar.tn
Med Souhaiel Habibi	ghostred080@gmail.com
Yasmine Haouas	yasminehaouas808@gmail.com
Mekni Sarah	meknisarah940@gmail.com
Nesrine Zayene	nesrine.zay555@gmail.com
Chama Hssan	chamahassen82@gmail.com
Dridi Chahd	chahddridi13@gmail.com
Smida Yakine	yakinesmida918@gmail.com
Fatma Ezzahra Jebri	jfatmaezzahra@gmail.com
Chemak Meriam	meriam.chemak.2026@ihec.ucar.tn
Gharbi Aïcha	aichagharbi399@gmail.com
Hamrit Anas	anashamrit8@gmail.com
Ahmed Moncef Soussia	ahmed.moncef.soussia07@gmail.com
Doua Troudi	doua.troudi.2025@ihec.ucar.tn
Eya Ben Saïd	eyabensaid46@gmail.com
Salma Elouadi	2003salma.elouafi@gmail.com
Hafsi Eya	e.hafsii@gmail.com
Aissa Takoua	takwaaissa566@gmail.com
Chiha Roua	chiharoua2@gmail.com
Hedi Sellami	hedisellami123456@gmail.com
Mayssen Mezni	mayssen317@gmail.com
Mohamed Bouhachem	mohamedbouhachem.ihec@gmail.com
Sadok Gharbi	sadokytlcsadok@gmail.com
Tasnim Tiouiri	tiwiritas12345@gmail.com
Balsem Karoui	karouibalsam780@gmail.com
Malak Miled	malakmiled253@gmail.com
Oumaya Alaa	oumayaalaa5@gmail.com
Jalleli Youssef	jalleliyoussef@gmail.com
Fekih Zaineb	zayneblefkih2019@gmail.com
Eya Zaatour	eyazaatour06@gmail.com
Jdidi Eya	eyajdidi2007@gmail.com
Tasnim Rezgui	tasnimrez0123@gmail.com
Youssef Berraies	youssefberraies25@gmail.com
Eya Ben Hamida	eyabenhamida276@gmail.com
Maryem Bouaziz	bouazizmariem36@gmail.com
Wala Torjmen	torjmenwala@gmail.com
Maryam Bahi	maryambahi2007@gmail.com
Skander Bellali	skanderbellali7@gmail.com
Selima Abdelhedi	salima.abdelhedi@gmail.com
`;

async function main() {
  console.log("=== Initialisation de la configuration des comptes membres ===");

  // 1. Parse New Members
  const newMembers = newMembersRaw
    .trim()
    .split("\n")
    .map(line => {
      const [name, email] = line.split("\t").map(s => s?.trim());
      return {
        fullName: name,
        email: email.toLowerCase(),
        username: normalizeUsername(name),
        password: `${normalizeUsername(name)}${generateRandom4Digits()}`,
        role: "membre",
        poste: "Nouveau Membre",
      };
    })
    .filter(m => m.fullName && m.email);

  console.log(`Nombre de nouveaux membres à intégrer : ${newMembers.length}`);

  // 2. Fetch Existing Profiles
  const { data: existingProfiles, error: fetchErr } = await sb
    .from("club_profiles")
    .select("id, full_name, email, role, poste")
    .order("created_at", { ascending: true });

  if (fetchErr) {
    console.error("Erreur lors de la récupération des membres existants :", fetchErr);
    process.exit(1);
  }

  console.log(`Nombre de membres existants trouvés : ${existingProfiles.length}`);

  const existingMembersWithCreds = existingProfiles.map(p => {
    const username = normalizeUsername(p.full_name);
    const password = `${username}${generateRandom4Digits()}`;
    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email.toLowerCase(),
      username,
      password,
      role: p.role,
      poste: p.poste,
    };
  });

  // Fetch all auth users to check if user already exists
  const { data: authList, error: authListErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const authUsersByEmail = new Map();
  if (authList && authList.users) {
    for (const u of authList.users) {
      if (u.email) {
        authUsersByEmail.set(u.email.toLowerCase(), u);
      }
    }
  }

  // 3. Process 75 New Members
  console.log("\n--- Traitement des 75 Nouveaux Membres ---");
  const processedNewMembers = [];

  for (const [index, m] of newMembers.entries()) {
    try {
      let userId = null;
      const existingAuth = authUsersByEmail.get(m.email);

      if (existingAuth) {
        // User already exists in auth: update password and metadata
        userId = existingAuth.id;
        const { error: updateErr } = await sb.auth.admin.updateUserById(userId, {
          password: m.password,
          user_metadata: {
            full_name: m.fullName,
            username: m.username,
            role: m.role,
            poste: m.poste,
          },
        });
        if (updateErr) {
          console.warn(`[${index + 1}/${newMembers.length}] Attention mise à jour auth pour ${m.fullName}:`, updateErr.message);
        } else {
          console.log(`[${index + 1}/${newMembers.length}] Compte existant mis à jour : ${m.fullName} (${m.username})`);
        }
      } else {
        // Create user in auth
        const { data: createData, error: createErr } = await sb.auth.admin.createUser({
          email: m.email,
          password: m.password,
          email_confirm: true,
          user_metadata: {
            full_name: m.fullName,
            username: m.username,
            role: m.role,
            poste: m.poste,
          },
        });

        if (createErr || !createData.user) {
          console.error(`[${index + 1}/${newMembers.length}] Erreur création auth ${m.fullName}:`, createErr?.message);
          continue;
        }
        userId = createData.user.id;
        console.log(`[${index + 1}/${newMembers.length}] Nouveau compte créé : ${m.fullName} (${m.username})`);
      }

      // Upsert into club_profiles
      const { error: profileErr } = await sb
        .from("club_profiles")
        .upsert({
          id: userId,
          email: m.email,
          full_name: m.fullName,
          role: m.role,
          poste: m.poste,
        });

      if (profileErr) {
        console.warn(`Attention profil pour ${m.fullName}:`, profileErr.message);
      }

      processedNewMembers.push({
        ...m,
        id: userId,
      });
    } catch (err) {
      console.error(`Exception pour ${m.fullName}:`, err);
    }
  }

  // 4. Update Existing 32 Members' Passwords
  console.log("\n--- Mise à jour des mots de passe des 32 Membres Actuels ---");
  const processedExistingMembers = [];

  for (const [index, p] of existingMembersWithCreds.entries()) {
    try {
      const { error: updateErr } = await sb.auth.admin.updateUserById(p.id, {
        password: p.password,
        user_metadata: {
          full_name: p.fullName,
          username: p.username,
          role: p.role,
          poste: p.poste,
        },
      });

      if (updateErr) {
        console.warn(`[${index + 1}/${existingMembersWithCreds.length}] Erreur auth update pour ${p.fullName}:`, updateErr.message);
      } else {
        console.log(`[${index + 1}/${existingMembersWithCreds.length}] Mot de passe mis à jour : ${p.fullName} (${p.username}) -> ${p.password}`);
      }

      processedExistingMembers.push(p);
    } catch (err) {
      console.error(`Exception mise à jour ${p.fullName}:`, err);
    }
  }

  // 5. Generate .env format block
  console.log("\n--- Écriture des identifiants dans .env.local ---");

  let envBlock = "\n# ==============================================================================\n";
  envBlock += "# HEC ENTREPRENEURS - IDENTIFIANTS INTRANET (GENERES LE " + new Date().toISOString() + ")\n";
  envBlock += "# FORMAT : USERNAME | NOM_COMPLET | EMAIL | MOT_DE_PASSE | ROLE | POSTE\n";
  envBlock += "# ==============================================================================\n\n";

  envBlock += "# --- NOUVEAUX MEMBRES (" + processedNewMembers.length + ") ---\n";
  for (const m of processedNewMembers) {
    envBlock += `MEMBER_CRED_${m.username.toUpperCase()}="${m.username} | ${m.fullName} | ${m.email} | ${m.password} | ${m.role} | ${m.poste}"\n`;
  }

  envBlock += "\n# --- MEMBRES ACTUELS (" + processedExistingMembers.length + ") ---\n";
  for (const m of processedExistingMembers) {
    envBlock += `MEMBER_CRED_${m.username.toUpperCase()}="${m.username} | ${m.fullName} | ${m.email} | ${m.password} | ${m.role} | ${m.poste}"\n`;
  }

  // Append to .env.local
  const cleanBaseEnv = envContent
    .split("# ==============================================================================")[0]
    .trim();

  const newEnvLocalContent = `${cleanBaseEnv}\n${envBlock}`;
  fs.writeFileSync(envPath, newEnvLocalContent, "utf8");
  console.log("Fichier .env.local mis à jour avec succès.");

  // Also write to .env if it exists or create it
  const rootEnvPath = path.join(__dirname, "..", ".env");
  fs.writeFileSync(rootEnvPath, newEnvLocalContent, "utf8");
  console.log("Fichier .env mis à jour avec succès.");

  // Create human-readable markdown table artifact
  let mdReport = "# Identifiants d'Accès Intranet — Club HEC Entrepreneurs\n\n";
  mdReport += "> **Format des identifiants :**\n";
  mdReport += "> - **Nom d'utilisateur :** Nom complet sans espaces ni majuscules\n";
  mdReport += "> - **Mot de passe initial :** Nom complet sans espaces + 4 chiffres aléatoires\n";
  mdReport += "> - **Changement autonome :** Les membres peuvent changer leur mot de passe depuis leur profil ou l'écran de connexion avec réception d'un email de confirmation.\n\n";

  mdReport += "## 1. Nouveaux Membres (Titre : Nouveau Membre)\n\n";
  mdReport += "| Nom Complet | Nom d'utilisateur (Username) | Email | Mot de Passe Initial | Titre |\n";
  mdReport += "| :--- | :--- | :--- | :--- | :--- |\n";
  for (const m of processedNewMembers) {
    mdReport += `| **${m.fullName}** | \`${m.username}\` | \`${m.email}\` | \`${m.password}\` | ${m.poste} |\n`;
  }

  mdReport += "\n## 2. Membres du Bureau, Responsables & Anciens Membres\n\n";
  mdReport += "| Nom Complet | Nom d'utilisateur (Username) | Email | Mot de Passe Initial | Rôle | Poste |\n";
  mdReport += "| :--- | :--- | :--- | :--- | :--- | :--- |\n";
  for (const m of processedExistingMembers) {
    mdReport += `| **${m.fullName}** | \`${m.username}\` | \`${m.email}\` | \`${m.password}\` | ${m.role} | ${m.poste} |\n`;
  }

  const reportPath = path.join(__dirname, "..", "MEMBRES_IDENTIFIANTS_2026.md");
  fs.writeFileSync(reportPath, mdReport, "utf8");
  console.log(`Rapport généré : ${reportPath}`);

  console.log("\n=== Terminé avec succès ! ===");
  console.log(`Total Nouveaux Membres intégrés : ${processedNewMembers.length}`);
  console.log(`Total Membres Actuels mis à jour : ${processedExistingMembers.length}`);
}

main().catch(err => {
  console.error("Erreur critique dans le script :", err);
  process.exit(1);
});
