const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

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

const BANNER_IMAGE_PATH = 'C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\ae1dfc10-bb17-4a11-855f-b126a6a5f43f\\hec_inside_banner_1793186184659.jpg';

async function main() {
  console.log('--- 1. UPLOADING BANNER TO SUPABASE STORAGE ---');
  let bannerUrl = null;
  try {
    if (fs.existsSync(BANNER_IMAGE_PATH)) {
      const fileBuffer = fs.readFileSync(BANNER_IMAGE_PATH);
      const fileName = `hec_inside_banner_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await sb.storage
        .from('portail-media')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadErr) {
        console.warn('Storage upload error (fallback without image):', uploadErr.message);
      } else {
        const { data: { publicUrl } } = sb.storage.from('portail-media').getPublicUrl(fileName);
        bannerUrl = publicUrl;
        console.log('Banner uploaded successfully:', bannerUrl);
      }
    } else {
      console.log('Banner file not found at path, skipping upload.');
    }
  } catch (err) {
    console.warn('Could not upload banner:', err.message);
  }

  console.log('\n--- 2. CREATING / SYNCING 6 SESSIONS IN CLUB_EVENTS ---');
  const sessions = [
    {
      title: 'HEC INSIDE — 03 : Trésorerie',
      description: `Animateur : Melek Kamoun (Trésorier)\n\nThématique : Maîtriser les ressources\nComprenez la gestion budgétaire, le suivi des dépenses et la planification financière au sein du club.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-10-29',
      start_time: '21:00:00',
      end_time: '22:00:00',
      event_type: 'workshop',
      created_by: 'a9534c33-167c-4561-a88d-50035414c201' // Melek Kammoun
    },
    {
      title: 'HEC INSIDE — 05 : Relations Externes',
      description: `Animatrice : Noura Derbel (Vice-présidente chargée des relations externes)\n\nThématique : Construire des opportunités\nExplorez la prospection, les partenariats, le sponsoring et les techniques de négociation.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-10-30',
      start_time: '20:00:00',
      end_time: '21:00:00',
      event_type: 'workshop',
      created_by: '45c6cd48-05ed-4c89-8a88-4defd72093e1' // Noura Derbel
    },
    {
      title: 'HEC INSIDE — 02 : Secrétariat',
      description: `Animatrice : Yassmin Zghal (Secrétaire Générale)\n\nThématique : Structurer l'organisation\nExplorez la gestion administrative, les comptes rendus de réunion et le suivi des décisions.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-10-30',
      start_time: '21:00:00',
      end_time: '22:00:00',
      event_type: 'workshop',
      created_by: '02e91f9d-9615-42d0-9cd9-55a0b1c23275' // Yassmin Zghal
    },
    {
      title: 'HEC INSIDE — 04 : Ressources Humaines',
      description: `Animatrice : Nourhene Ben Amor (Vice-présidente chargée des adhérents)\n\nThématique : Faire grandir les membres\nDécouvrez le recrutement, l'intégration, la motivation et le développement des compétences.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-11-01',
      start_time: '20:00:00',
      end_time: '21:00:00',
      event_type: 'workshop',
      created_by: 'dd9c5276-cb76-4df3-8a7d-a85b3f9216f2' // Nourhene Ben Amor
    },
    {
      title: 'HEC INSIDE — 01 : Coordination Stratégique',
      description: `Animateur : Youssef Drira (Président)\n\nThématique : Comprendre la vision\nDécouvrez les priorités du mandat, la prise de décision stratégique et la coordination des équipes.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-11-01',
      start_time: '21:00:00',
      end_time: '22:00:00',
      event_type: 'workshop',
      created_by: 'd04ad345-2fe5-4aa9-8efb-fc7f721d9a65' // Youssef Drira
    },
    {
      title: 'HEC INSIDE — 06 : Communication',
      description: `Animatrice : Ines Trabelsi (Vice-présidente chargée de la communication)\n\nThématique : Donner vie à l'identité du club\nDécouvrez la stratégie de communication, l'identité visuelle et la valorisation des projets.\n\nProgramme d'immersion HEC INSIDE (Session de 60 minutes).\nPrésence obligatoire pour tous les nouveaux membres.`,
      location: 'En ligne (Google Meet)',
      event_date: '2026-11-02',
      start_time: '20:00:00',
      end_time: '21:00:00',
      event_type: 'workshop',
      created_by: 'cf284cdd-d71f-4294-8903-fcc437484964' // Ines Trabelsi
    }
  ];

  // Check existing events to avoid duplicate insertion
  const { data: existingEvents } = await sb
    .from('club_events')
    .select('id, title, event_date');

  const createdEvents = [];
  for (const session of sessions) {
    const existing = existingEvents?.find(e => e.title === session.title && e.event_date === session.event_date);
    if (existing) {
      console.log(`Event already exists: "${session.title}" (ID: ${existing.id}) -> updating details`);
      const { data: updated, error: updErr } = await sb
        .from('club_events')
        .update({
          description: session.description,
          location: session.location,
          start_time: session.start_time,
          end_time: session.end_time,
          event_type: session.event_type
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (updErr) console.error('Error updating event:', updErr);
      else createdEvents.push(updated);
    } else {
      const { data: inserted, error: insErr } = await sb
        .from('club_events')
        .insert(session)
        .select()
        .single();
      if (insErr) {
        console.error('Error inserting event:', session.title, insErr);
      } else {
        console.log(`Event created: "${session.title}" (ID: ${inserted.id}) on ${session.event_date}`);
        createdEvents.push(inserted);
      }
    }
  }

  console.log('\n--- 3. CREATING ANNOUNCEMENT IN PORTAIL ---');
  const announcementContent = `🏛️ **HEC INSIDE**
*Entrez dans les coulisses. Comprenez la vision.*
**Six départements. Une même vision. Une ambition collective.**

---

### 💡 Le concept
Derrière chaque réussite se cache une équipe organisée autour d’une ambition commune.

**HEC INSIDE** est un programme d’immersion permettant aux nouveaux membres de découvrir le fonctionnement interne de **HEC Entrepreneurs** et de comprendre la contribution de chaque département.

À travers **six sessions immersives et interactives de 60 minutes**, partez à la découverte des six départements de HEC Entrepreneurs : Coordination stratégique, Secrétariat, Trésorerie, Ressources humaines, Relations externes et Communication.

Chaque session présente les missions, les outils et les méthodes de travail d’un département, ainsi que ses interactions avec les autres équipes.

---

### 🔍 Les six sessions de HEC INSIDE

• **01 — Coordination stratégique : comprendre la vision**
Découvrez les priorités du mandat, la prise de décision et la coordination des équipes.

• **02 — Secrétariat : structurer l’organisation**
Explorez la gestion administrative, les comptes rendus et le suivi des décisions.

• **03 — Trésorerie : maîtriser les ressources**
Comprenez la gestion budgétaire, le suivi des dépenses et la planification financière.

• **04 — Ressources humaines : faire grandir les membres**
Découvrez le recrutement, l’intégration, la motivation et le développement des compétences.

• **05 — Relations externes : construire des opportunités**
Explorez la prospection, les partenariats, le sponsoring et la négociation.

• **06 — Communication : donner vie à l’identité du club**
Découvrez la stratégie de communication, l’identité visuelle et la valorisation des projets.

---

### 📅 Le programme officiel des sessions

• **Trésorerie** : Jeudi 29 Octobre à 21h00
  👤 *Melek Kamoun — Trésorier*

• **Relations externes** : Vendredi 30 Octobre à 20h00
  👤 *Noura Derbel — Vice-présidente chargée des relations externes*

• **Secrétariat** : Vendredi 30 Octobre à 21h00
  👤 *Yassmin Zghal — Secrétaire Générale*

• **Relations humaines** : Dimanche 1er Novembre à 20h00
  👤 *Nourhene Ben Amor — Vice-présidente chargée des adhérents*

• **Coordination stratégique** : Dimanche 1er Novembre à 21h00
  👤 *Youssef Drira — Président*

• **Communication** : Lundi 2 Novembre à 20h00
  👤 *Ines Trabelsi — Vice-présidente chargée de la communication*

📍 **Format :** En ligne (Google Meet) — Liens transmis avant chaque session.

---

### ✨ Une immersion concrète
Des échanges interactifs et des mises en situation permettront aux membres de découvrir les réalités de chaque département et de comprendre l’importance de la collaboration.

### 🎯 Les objectifs
Permettre à chaque membre de comprendre le fonctionnement du club, d’identifier les responsabilités des départements et de collaborer efficacement avec les différentes équipes.

### 🚀 L’ambition de HEC INSIDE
Comprendre le club, trouver sa place et contribuer à une ambition commune.

**HEC INSIDE — Six départements. Une même vision. Une ambition collective.**

---
👉 **Confirmation de présence obligatoire :** Les 6 sessions sont disponibles dès à présent dans la rubrique **Calendrier & Présences** du Portail. Merci à chaque membre de s'y rendre et de confirmer sa présence pour chacune des sessions !`;

  // Check if announcement already exists
  const { data: existingAnn } = await sb
    .from('announcements')
    .select('id, content')
    .ilike('content', '%HEC INSIDE%')
    .limit(1);

  let announcementId = null;
  if (existingAnn && existingAnn.length > 0) {
    announcementId = existingAnn[0].id;
    console.log(`Announcement already exists (ID: ${announcementId}) -> updating`);
    const { error: updAnnErr } = await sb
      .from('announcements')
      .update({
        content: announcementContent,
        image_url: bannerUrl,
        link_url: '/portail/calendrier',
        link_title: 'Confirmer ma présence aux sessions (Calendrier)'
      })
      .eq('id', announcementId);
    if (updAnnErr) console.error('Error updating announcement:', updAnnErr);
    else console.log('Announcement updated successfully.');
  } else {
    const { data: newAnn, error: insAnnErr } = await sb
      .from('announcements')
      .insert({
        author_id: 'd04ad345-2fe5-4aa9-8efb-fc7f721d9a65', // Youssef Drira (Président)
        content: announcementContent,
        image_url: bannerUrl,
        link_url: '/portail/calendrier',
        link_title: 'Confirmer ma présence aux sessions (Calendrier)'
      })
      .select()
      .single();
    if (insAnnErr) {
      console.error('Error creating announcement:', insAnnErr);
    } else {
      announcementId = newAnn.id;
      console.log('Announcement created successfully with ID:', announcementId);
    }
  }

  console.log('\n--- 4. BROADCASTING EMAIL TO ALL CLUB MEMBERS ---');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });

    const { data: profiles, error: profErr } = await sb
      .from('club_profiles')
      .select('email');

    if (profErr || !profiles) {
      console.error('Error fetching member emails:', profErr);
      return;
    }

    const emailList = profiles
      .map(p => p.email?.trim().toLowerCase())
      .filter(e => e && e.includes('@'));

    console.log(`Sending broadcast to ${emailList.length} members...`);

    const adminEmail = env.GMAIL_USER || 'hecentrepreneurs8@gmail.com';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #07070a; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 620px; margin: 30px auto; background-color: #111116; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
          .header { text-align: center; padding: 35px 25px 25px; background: linear-gradient(180deg, rgba(147, 51, 234, 0.2) 0%, rgba(17, 17, 22, 0) 100%); border-bottom: 1px solid rgba(255,255,255,0.06); }
          .badge { display: inline-block; padding: 5px 14px; border-radius: 999px; background: rgba(147, 51, 234, 0.25); border: 1px solid rgba(147, 51, 234, 0.45); color: #c084fc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 8px 0 0; color: #a1a1aa; font-size: 13px; }
          .content { padding: 30px 25px; }
          .banner-img { width: 100%; border-radius: 12px; margin-bottom: 22px; border: 1px solid rgba(255,255,255,0.1); }
          .message-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 22px; line-height: 1.7; font-size: 14px; color: #d4d4d8; }
          .schedule-card { margin: 15px 0; background: rgba(147, 51, 234, 0.06); border: 1px solid rgba(147, 51, 234, 0.2); border-radius: 10px; padding: 12px 16px; }
          .schedule-title { font-weight: 700; color: #e9d5ff; font-size: 14px; }
          .schedule-meta { font-size: 12px; color: #a1a1aa; margin-top: 4px; }
          .cta-container { text-align: center; margin-top: 30px; }
          .cta-btn { display: inline-block; padding: 15px 32px; background: linear-gradient(135deg, #9333ea, #6366f1); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 12px; box-shadow: 0 8px 25px rgba(147, 51, 234, 0.35); }
          .footer { text-align: center; padding: 25px 20px; color: #71717a; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">Programme HEC INSIDE</div>
            <h1>HEC INSIDE — Six Départements. Une Vision.</h1>
            <p>Club HEC Entrepreneurs • IHEC Carthage</p>
          </div>
          <div class="content">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="HEC INSIDE Banner" class="banner-img" />` : ''}
            <div class="message-box">
              <p>Bonjour à toutes et à tous,</p>
              <p>Nous avons le plaisir de vous annoncer le lancement officiel de <strong>HEC INSIDE</strong>, notre grand programme d'immersion conçu pour vous ouvrir les coulisses de chaque département du club !</p>
              
              <p>À travers <strong>six sessions de 60 minutes</strong>, partez à la rencontre de nos responsables, découvrez les méthodes, les outils et les missions de chaque équipe :</p>
              
              <div class="schedule-card">
                <div class="schedule-title">03 — Trésorerie : Maîtriser les ressources</div>
                <div class="schedule-meta">📅 <strong>Jeudi 29 Octobre à 21h00</strong> • Animé par Melek Kamoun (Trésorier)</div>
              </div>

              <div class="schedule-card">
                <div class="schedule-title">05 — Relations Externes : Construire des opportunités</div>
                <div class="schedule-meta">📅 <strong>Vendredi 30 Octobre à 20h00</strong> • Animé par Noura Derbel (VP Relations Extérieures)</div>
              </div>

              <div class="schedule-card">
                <div class="schedule-title">02 — Secrétariat : Structurer l'organisation</div>
                <div class="schedule-meta">📅 <strong>Vendredi 30 Octobre à 21h00</strong> • Animé par Yassmin Zghal (Secrétaire Générale)</div>
              </div>

              <div class="schedule-card">
                <div class="schedule-title">04 — Ressources Humaines : Faire grandir les membres</div>
                <div class="schedule-meta">📅 <strong>Dimanche 1er Novembre à 20h00</strong> • Animé par Nourhene Ben Amor (VP Adhérents)</div>
              </div>

              <div class="schedule-card">
                <div class="schedule-title">01 — Coordination Stratégique : Comprendre la vision</div>
                <div class="schedule-meta">📅 <strong>Dimanche 1er Novembre à 21h00</strong> • Animé par Youssef Drira (Président)</div>
              </div>

              <div class="schedule-card">
                <div class="schedule-title">06 — Communication : Donner vie à l'identité du club</div>
                <div class="schedule-meta">📅 <strong>Lundi 2 Novembre à 20h00</strong> • Animé par Ines Trabelsi (VP Communication)</div>
              </div>

              <p style="margin-top: 18px;">📍 <strong>Format :</strong> En ligne (Google Meet).<br/>
              ⚠️ <strong>Important :</strong> La confirmation de votre présence est requise pour chaque session sur l'Intranet officiel.</p>
            </div>

            <div class="cta-container">
              <a href="https://hec-entrepreneurs.vercel.app/portail/calendrier" class="cta-btn" target="_blank">
                Confirmer ma présence dans le Calendrier &rarr;
              </a>
            </div>
          </div>
          <div class="footer">
            Cet email a été envoyé aux membres enregistrés sur l'Intranet de HEC Entrepreneurs.<br/>
            &copy; 2026 HEC Entrepreneurs IHEC Carthage. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"HEC Entrepreneurs (Intranet)" <${adminEmail}>`,
      to: adminEmail,
      bcc: emailList,
      subject: `[HEC Entrepreneurs] Annonce Officielle : Programme HEC INSIDE & Calendrier des 6 Sessions`,
      html: emailHtml,
    });

    console.log(`Broadcast email dispatched successfully to ${emailList.length} members! Message ID:`, info.messageId);
  } catch (emailErr) {
    console.error('Email broadcast failed:', emailErr.message);
  }

  console.log('\n=== ALL COMPLETED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
