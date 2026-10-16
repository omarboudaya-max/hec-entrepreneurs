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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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

function normalizeUsername(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function run() {
  const { data: existingProfiles, error } = await sb
    .from('club_profiles')
    .select('id, full_name, email, role, poste')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching existing profiles:', error);
    return;
  }

  console.log(`Found ${existingProfiles.length} existing profiles:`);
  for (const p of existingProfiles) {
    console.log(`- ${p.full_name} | ${p.email} | ${p.role} | ${p.poste}`);
  }
}

run();
