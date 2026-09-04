// After running schema.sql, run this once with Node to insert seed users with the right bcrypt hash.
// node scripts/seedUsers.js
// (uses the same .env as the server)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const supabase = require('../src/config/supabase');

(async () => {
  const hash = await bcrypt.hash('password123', 10);
  const rows = [
    { email: 'employee@claimdesk.com', name: 'Riya Sharma', role: 'employee', department: 'Sales' },
    { email: 'director@claimdesk.com', name: 'Anil Verma',  role: 'director', department: 'Management' },
    { email: 'accounts@claimdesk.com', name: 'Meera Iyer',   role: 'accounts', department: 'Finance' },
  ];
  for (const r of rows) {
    const { error } = await supabase
      .from('users')
      .upsert([{ ...r, password_hash: hash }], { onConflict: 'email' });
    if (error) console.error(r.email, error.message);
    else console.log('seeded:', r.email);
  }
  process.exit(0);
})();