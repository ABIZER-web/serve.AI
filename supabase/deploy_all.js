import fs from 'fs';
import path from 'path';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ykkqtgkovgyuolhrcqzm';

async function executeSql(query, description) {
  console.log(`\n⏳ Running: ${description}...`);
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Failed: ${description}`);
    console.error(`Status: ${res.status}`, errorText);
    throw new Error(`Execution error: ${errorText}`);
  }

  const result = await res.json();
  console.log(`✅ Success: ${description}`);
  return result;
}

async function runDeployments() {
  console.log('====================================================');
  console.log('🚀 SERVE.AI - LIVE SUPABASE DATABASE DEPLOYMENT');
  console.log(`Project: ${PROJECT_REF}`);
  console.log('====================================================');

  // Step 1: Initial Schema
  let sql1 = fs.readFileSync('supabase/migrations/20261107000001_initial_schema.sql', 'utf8');
  // Make realtime publication safe using function replacer to avoid $$ escaping
  sql1 = sql1.replace(
    /ALTER PUBLICATION supabase_realtime ADD TABLE public\.orders;[\s\S]*?ALTER PUBLICATION supabase_realtime ADD TABLE public\.tables;/,
    () => `DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;`
  );
  await executeSql(sql1, '1/5: Initial Schema (Restaurants, Tables, QR Tokens, Menus, Orders, RLS)');

  // Step 2: Functions and triggers
  const sql2 = fs.readFileSync('supabase/migrations/20261107000002_functions_and_triggers.sql', 'utf8');
  await executeSql(sql2, '2/5: Database Functions, Triggers & Financial Calculations');

  // Step 3: SaaS Expansion
  const sql3 = fs.readFileSync('supabase/migrations/20261107000003_saas_expansion.sql', 'utf8');
  await executeSql(sql3, '3/5: SaaS Expansion (Kitchen Stations, Service Requests, Inventory, Loyalty, Waitlist)');

  // Step 4: Smart Table Experience
  const sql4 = fs.readFileSync('supabase/migrations/20261107000004_smart_table_experience.sql', 'utf8');
  await executeSql(sql4, '4/5: Smart Table Experience (Shared Sessions, Live Cart, Split Payments, RPCs)');

  // Step 5: Enable Realtime on Smart Table tables
  const realtimeSql = `
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.table_sessions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.table_session_cart_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.table_session_rounds;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
`;
  await executeSql(realtimeSql, 'Realtime WebSocket PubSub configuration on table sessions & carts');

  // Step 6: Seed Food House & Cafe Highfive Demo Data
  const seedSql = fs.readFileSync('supabase/seed.sql', 'utf8');
  await executeSql(seedSql, '5/5: Seed Initial Menus, Tables, and Demo Orders');

  // Step 7: Verification Query
  const verifyRes = await executeSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `, 'Verifying live table deployment');

  const tableNames = verifyRes.map(t => t.table_name);
  console.log('\n====================================================');
  console.log(`🎉 LIVE DEPLOYMENT COMPLETE! ${tableNames.length} TABLES VERIFIED:`);
  console.log('====================================================');
  console.log(tableNames.join(', '));
}

runDeployments().catch(err => {
  console.error('\nDeployment stopped due to error:', err);
  process.exit(1);
});
