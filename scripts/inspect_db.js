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

async function inspect() {
  const { data: profiles, error } = await sb.from('club_profiles').select('id, email, full_name, role, poste');
  console.log('Total profiles:', profiles?.length, 'Error:', error);
  console.log('\n--- Non-Member Profiles ---');
  profiles?.filter(p => p.role !== 'membre').forEach(p => {
    console.log(`${p.id} | ${p.role.padEnd(12)} | ${p.full_name.padEnd(25)} | ${p.poste.padEnd(30)} | ${p.email}`);
  });
  return;



  const { data: announcements } = await sb.from('announcements').select('id, author_id, content, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('\nRecent Announcements:', JSON.stringify(announcements, null, 2));

  const { data: events } = await sb.from('club_events').select('*').order('event_date', { ascending: false }).limit(10);
  console.log('\nRecent Events:', JSON.stringify(events, null, 2));
}

inspect();
