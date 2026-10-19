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

// Mapping of Name -> New Email
const memberEmailUpdates = [
  { name: "Youssef Drira", oldEmail: "youssef.drira@hec.tn", newEmail: "yousarsif.drira@gmail.com" },
  { name: "Nourhene Ben Amor", oldEmail: "nourhene.benamor@hec.tn", newEmail: "benamornourhene90@gmail.com" },
  { name: "Yassmin Zghal", oldEmail: "yassmin.zghal@hec.tn", newEmail: "yassminzghal7@gmail.com" },
  { name: "Noura Derbel", oldEmail: "noura.derbel@hec.tn", newEmail: "nouraderbel900@gmail.com" },
  { name: "Melek Kammoun", oldEmail: "melek.kammoun@hec.tn", newEmail: "kamounmelek40@gmail.com" },
  { name: "Ines Trabelsi", oldEmail: "ines.trabelsi@hec.tn", newEmail: "inestrabelsi792@gmail.com" },
  { name: "Omar Boudaya", oldEmail: "omarboudaya1@gmail.com", newEmail: "omarboudaya1@gmail.com" },
  { name: "Eya Cherif", oldEmail: "eya.cherif@hec.tn", newEmail: "eyacherif001@gmail.com" },
  { name: "Edam Guermazi", oldEmail: "edam.guermazi@hec.tn", newEmail: "edamguermazi0312@gmail.com" },
  { name: "Mohamed Hammemi", oldEmail: "mohamed.hammemi@hec.tn", newEmail: "hammemimohamed597@gmail.com" },
  { name: "Adem Awedi", oldEmail: "adem.awedi@hec.tn", newEmail: "titantitan009i@gmail.com" },
  { name: "Adem Kammoun", oldEmail: "adem.kammoun@hec.tn", newEmail: "ademkamoun18@gmail.com" },
  { name: "Ghadine Swalhia", oldEmail: "ghadine.swalhia@hec.tn", newEmail: "ghadinesoualhia1@gmail.com" },
  { name: "Eya Ferjani", oldEmail: "eya.ferjani@hec.tn", newEmail: "eyaferjani79@gmail.com" },
  { name: "Tesnim Mehdi", oldEmail: "tesnim.mehdi@hec.tn", newEmail: "elmehditesnim@gmail.com" },
  { name: "Jassim Abrougui", oldEmail: "jassim.abrougui@hec.tn", newEmail: "mohamedjassim.abrougui.2025@ihec.ucar.tn" },
  { name: "Asma Hamda", oldEmail: "asma.hamda@hec.tn", newEmail: "asma.hamda.2025@ihec.ucar.tn" },
  { name: "Anis Ayedi", oldEmail: "anis.ayedi@hec.tn", newEmail: "anisayedi535@gmail.com" },
  { name: "Tasnim Daadoucha", oldEmail: "tasnim.daadoucha@hec.tn", newEmail: "tasnimdaadoucha@gmail.com" },
  { name: "Ahmed Lachiheb", oldEmail: "ahmed.lachiheb@hec.tn", newEmail: "ahmedxlachiheb@gmail.com" },
  { name: "Rihem Abbessi", oldEmail: "rihem.abbessi@hec.tn", newEmail: "abbessirihem55@gmail.com" },
  { name: "Ibtihel Haddaoui", oldEmail: "ibtihel.haddaoui@hec.tn", newEmail: "ibtihel.haddaoui782005@gmail.com" },
  { name: "Khadija Houidi", oldEmail: "khadija.houidi@hec.tn", newEmail: "khadijahouidi0@gmail.com" },
  { name: "Maryem Khelifi", oldEmail: "maryem.khelifi@hec.tn", newEmail: "khlifi.maryeem@gmail.com" },
  { name: "Dhia Ourir", oldEmail: "dhia.ourir@hec.tn", newEmail: "dhia.ourir@gmail.com" },
  { name: "Ons Cherni", oldEmail: "ons.cherni@hec.tn", newEmail: "onscherni18@gmail.com" },
  { name: "Mariem Chaouachi", oldEmail: "mariem.chaouachi@hec.tn", newEmail: "mariemchaouachi57@gmail.com" },
  { name: "Achref Jenni", oldEmail: "achref.jenni@hec.tn", newEmail: "jenniachref@gmail.com" },
  { name: "Jamila Msallem", oldEmail: "jamila.msallem@hec.tn", newEmail: "jamila.msallem@gmail.com" },
  { name: "Laameri Touka", oldEmail: "laameri.touka@hec.tn", newEmail: "toukalaameri833@gmail.com" }
];

async function updateEmails() {
  console.log("=== Updating Old Members Emails in Supabase ===");

  // 1. Fetch current profiles
  const { data: profiles, error: profErr } = await sb
    .from("club_profiles")
    .select("*");

  if (profErr) {
    console.error("Error fetching club_profiles:", profErr);
    return;
  }

  // 2. Fetch auth users
  const { data: authData, error: authErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) {
    console.error("Error fetching auth users:", authErr);
    return;
  }
  const authUsers = authData?.users || [];
  console.log(`Total profiles: ${profiles.length}, Total auth users: ${authUsers.length}`);

  for (const item of memberEmailUpdates) {
    const profile = profiles.find(
      p => p.full_name?.toLowerCase().trim() === item.name.toLowerCase().trim() ||
           p.email?.toLowerCase().trim() === item.oldEmail.toLowerCase().trim()
    );

    if (!profile) {
      console.warn(`[NOT FOUND] Profile not found for: ${item.name}`);
      continue;
    }

    const authUser = authUsers.find(
      u => u.id === profile.id ||
           u.email?.toLowerCase().trim() === item.oldEmail.toLowerCase().trim() ||
           u.email?.toLowerCase().trim() === item.newEmail.toLowerCase().trim()
    );

    console.log(`Updating ${item.name}: ${profile.email} -> ${item.newEmail}`);

    // Update Auth User
    if (authUser) {
      const { error: authUpdateErr } = await sb.auth.admin.updateUserById(authUser.id, {
        email: item.newEmail,
        email_confirm: true,
      });
      if (authUpdateErr) {
        console.error(`  Auth update failed for ${item.name}:`, authUpdateErr.message);
      } else {
        console.log(`  Auth updated successfully for ${item.name}`);
      }
    } else {
      console.warn(`  Auth user not found for ${item.name} (profile id: ${profile.id})`);
    }

    // Update club_profiles
    const { error: profileUpdateErr } = await sb
      .from("club_profiles")
      .update({ email: item.newEmail })
      .eq("id", profile.id);

    if (profileUpdateErr) {
      console.error(`  club_profiles update failed for ${item.name}:`, profileUpdateErr.message);
    } else {
      console.log(`  club_profiles updated successfully for ${item.name}`);
    }
  }

  console.log("\n=== Finished updating Supabase database ===");
}

updateEmails().catch(err => {
  console.error("Fatal error:", err);
});
