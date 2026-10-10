const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const defaultPassword = "HecMember2026!";

const officialMembers = [
  // Bureau Exécutif
  { name: "Youssef Drira", email: "youssef.drira@hec.tn", role: "bureau", poste: "Président", avatar_url: "/team/youssef.JPG" },
  { name: "Yassmin Zghal", email: "yassmin.zghal@hec.tn", role: "bureau", poste: "Secrétaire Générale", avatar_url: "/team/yassmin.jpg" },
  { name: "Melek Kammoun", email: "melek.kammoun@hec.tn", role: "bureau", poste: "Trésorier", avatar_url: "/team/melek.jpg" },
  { name: "Nourhene Ben Amor", email: "nourhene.benamor@hec.tn", role: "bureau", poste: "Vice-Présidente chargée des Adhérents", avatar_url: "/team/nourhene.jpg" },
  { name: "Noura Derbel", email: "noura.derbel@hec.tn", role: "bureau", poste: "Vice-Présidente chargée des Relations Extérieures", avatar_url: "/team/noura.jpg" },
  { name: "Ines Trabelsi", email: "ines.trabelsi@hec.tn", role: "bureau", poste: "Vice-Présidente chargée de la Communication", avatar_url: "/team/ines.jpg" },

  // Les Responsables
  { name: "Edam Guermazi", email: "edam.guermazi@hec.tn", role: "responsable", poste: "Responsable Événements & Projets", avatar_url: null },
  { name: "Rihem Abbessi", email: "rihem.abbessi@hec.tn", role: "responsable", poste: "Responsable Développement & Innovation", avatar_url: null },
  { name: "Mohamed Hammemi", email: "mohamed.hammemi@hec.tn", role: "responsable", poste: "Trésorier Adjoint", avatar_url: null },
  { name: "Khadija Houidi", email: "khadija.houidi@hec.tn", role: "responsable", poste: "Responsable Intégration & Expérience Membre", avatar_url: null },
  { name: "Achref Jenni", email: "achref.jenni@hec.tn", role: "responsable", poste: "Responsable Protocole Interne", avatar_url: null },
  { name: "Adem Awedi", email: "adem.awedi@hec.tn", role: "responsable", poste: "Responsable Sponsoring", avatar_url: null },
  { name: "Tesnim Mehdi", email: "tesnim.mehdi@hec.tn", role: "responsable", poste: "Responsable Protocole Externe", avatar_url: null },
  { name: "Omar Boudaya", email: "omarboudaya1@gmail.com", role: "developpeur", poste: "Responsable IT & Développement Web", avatar_url: "/team/omar.jpg" },
  { name: "Eya Cherif", email: "eya.cherif@hec.tn", role: "responsable", poste: "Responsable Planification & Diffusion", avatar_url: "/team/eya.jpg" },
  { name: "Maryem Khelifi", email: "maryem.khelifi@hec.tn", role: "responsable", poste: "Responsable Création de Contenu", avatar_url: null },

  // Les Membres
  { name: "Adem Kammoun", email: "adem.kammoun@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ahmed Lachiheb", email: "ahmed.lachiheb@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Anis Ayedi", email: "anis.ayedi@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Asma Hamda", email: "asma.hamda@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Dhia Ourir", email: "dhia.ourir@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Eya Ferjani", email: "eya.ferjani@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Faten Kalia", email: "faten.kalia@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ghadine Swalhia", email: "ghadine.swalhia@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ibtihel Haddaoui", email: "ibtihel.haddaoui@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Jamila Msallem", email: "jamila.msallem@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Jassim Abrougui", email: "jassim.abrougui@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Laameri Touka", email: "laameri.touka@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Mariem Chaouachi", email: "mariem.chaouachi@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Mariem Khamassi", email: "mariem.khamassi@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ons Cherni", email: "ons.cherni@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Tasnim Daadoucha", email: "tasnim.daadoucha@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ziada Moslem", email: "ziada.moslem@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
];

async function seed() {
  console.log("Checking existing profiles in Supabase...");
  const { data: existingProfiles, error: fetchErr } = await supabase
    .from("club_profiles")
    .select("*");

  if (fetchErr) {
    console.error("Error fetching club profiles:", fetchErr);
    return;
  }

  console.log(`Found ${existingProfiles.length} existing profiles.`);
  const emailMap = new Map(existingProfiles.map(p => [p.email.toLowerCase(), p]));
  const nameMap = new Map(existingProfiles.map(p => [p.full_name.toLowerCase(), p]));

  for (const m of officialMembers) {
    const existing = emailMap.get(m.email.toLowerCase()) || nameMap.get(m.name.toLowerCase());
    if (existing) {
      console.log(`User ${m.name} (${m.email}) already exists.`);
      const updates = {};
      if (!existing.poste || existing.poste === 'Membre' || existing.poste === 'Lead Développeur') {
        updates.poste = m.poste;
      }
      if (m.avatar_url && !existing.avatar_url) {
        updates.avatar_url = m.avatar_url;
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from("club_profiles").update(updates).eq("id", existing.id);
        console.log(`Updated ${m.name}:`, updates);
      }
      continue;
    }

    console.log(`Creating auth user for ${m.name} (${m.email})...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: m.email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: m.name,
        role: m.role,
        poste: m.poste
      }
    });

    if (authError || !authData?.user) {
      console.error(`Failed to create auth user for ${m.name}:`, authError?.message);
      continue;
    }

    const userId = authData.user.id;

    const { error: profileErr } = await supabase
      .from("club_profiles")
      .upsert({
        id: userId,
        email: m.email,
        full_name: m.name,
        role: m.role,
        poste: m.poste,
        avatar_url: m.avatar_url
      });

    if (profileErr) {
      console.error(`Failed to insert profile for ${m.name}:`, profileErr.message);
    } else {
      console.log(`Successfully created profile for ${m.name}!`);
    }
  }

  // Also remove test dummy accounts if desired
  const dummyEmails = ['membre@test.com', 'responsable@test.com', 'bureau@test.com'];
  for (const de of dummyEmails) {
    const dummy = emailMap.get(de);
    if (dummy) {
      console.log(`Deleting test account ${de}...`);
      await supabase.auth.admin.deleteUser(dummy.id);
    }
  }

  console.log("Seeding completed successfully!");
}

seed().catch(console.error);
