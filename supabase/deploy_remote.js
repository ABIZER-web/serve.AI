import fs from 'fs';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ykkqtgkovgyuolhrcqzm';

async function testConnection() {
  console.log('Testing connection to Supabase Management API for project:', PROJECT_REF);
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'SELECT current_database(), version();'
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error:', res.status, errorText);
    process.exit(1);
  }

  const data = await res.json();
  console.log('✅ Connected successfully! Database info:', data);
}

testConnection().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});

