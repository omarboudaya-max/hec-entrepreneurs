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
  { name: "Youssef Drira", email: "yousarsif.drira@gmail.com", role: "bureau", poste: "Président", avatar_url: "/team/youssef.JPG" },
  { name: "Yassmin Zghal", email: "yassminzghal7@gmail.com", role: "bureau", poste: "Secrétaire Générale", avatar_url: "/team/yassmin.jpg" },
  { name: "Melek Kammoun", email: "kamounmelek40@gmail.com", role: "bureau", poste: "Trésorier", avatar_url: "/team/melek.jpg" },
  { name: "Nourhene Ben Amor", email: "benamornourhene90@gmail.com", role: "bureau", poste: "Vice-Présidente chargée des Adhérents", avatar_url: "/team/nourhene.jpg" },
  { name: "Noura Derbel", email: "nouraderbel900@gmail.com", role: "bureau", poste: "Vice-Présidente chargée des Relations Extérieures", avatar_url: "/team/noura.jpg" },
  { name: "Ines Trabelsi", email: "inestrabelsi792@gmail.com", role: "bureau", poste: "Vice-Présidente chargée de la Communication", avatar_url: "/team/ines.jpg" },

  // Les Responsables
  { name: "Edam Guermazi", email: "edamguermazi0312@gmail.com", role: "responsable", poste: "Responsable Événements & Projets", avatar_url: null },
  { name: "Rihem Abbessi", email: "abbessirihem55@gmail.com", role: "responsable", poste: "Responsable Développement & Innovation", avatar_url: null },
  { name: "Mohamed Hammemi", email: "hammemimohamed597@gmail.com", role: "responsable", poste: "Trésorier Adjoint", avatar_url: null },
  { name: "Khadija Houidi", email: "khadijahouidi0@gmail.com", role: "responsable", poste: "Responsable Intégration & Expérience Membre", avatar_url: null },
  { name: "Achref Jenni", email: "jenniachref@gmail.com", role: "responsable", poste: "Responsable Protocole Interne", avatar_url: null },
  { name: "Adem Awedi", email: "titantitan009i@gmail.com", role: "responsable", poste: "Responsable Sponsoring", avatar_url: null },
  { name: "Tesnim Mehdi", email: "elmehditesnim@gmail.com", role: "responsable", poste: "Responsable Protocole Externe", avatar_url: null },
  { name: "Omar Boudaya", email: "omarboudaya1@gmail.com", role: "developpeur", poste: "Responsable IT & Développement Web", avatar_url: "/team/omar.jpg" },
  { name: "Eya Cherif", email: "eyacherif001@gmail.com", role: "responsable", poste: "Responsable Planification & Diffusion", avatar_url: "/team/eya.jpg" },
  { name: "Maryem Khelifi", email: "khlifi.maryeem@gmail.com", role: "responsable", poste: "Responsable Création de Contenu", avatar_url: null },

  // Les Membres
  { name: "Adem Kammoun", email: "ademkamoun18@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ahmed Lachiheb", email: "ahmedxlachiheb@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Anis Ayedi", email: "anisayedi535@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Asma Hamda", email: "asma.hamda.2025@ihec.ucar.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Dhia Ourir", email: "dhia.ourir@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Eya Ferjani", email: "eyaferjani79@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Faten Kalia", email: "faten.kalia@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ghadine Swalhia", email: "ghadinesoualhia1@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ibtihel Haddaoui", email: "ibtihel.haddaoui782005@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Jamila Msallem", email: "jamila.msallem@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Jassim Abrougui", email: "mohamedjassim.abrougui.2025@ihec.ucar.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Laameri Touka", email: "toukalaameri833@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Mariem Chaouachi", email: "mariemchaouachi57@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Mariem Khamassi", email: "mariem.khamassi@hec.tn", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Ons Cherni", email: "onscherni18@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
  { name: "Tasnim Daadoucha", email: "tasnimdaadoucha@gmail.com", role: "membre", poste: "Membre", avatar_url: null },
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
