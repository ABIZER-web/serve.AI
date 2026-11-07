const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ykkqtgkovgyuolhrcqzm';

async function verify() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        SELECT 
          (SELECT COUNT(*) FROM public.restaurants) AS restaurants_count,
          (SELECT COUNT(*) FROM public.tables) AS tables_count,
          (SELECT COUNT(*) FROM public.table_qr_tokens) AS qr_tokens_count,
          (SELECT COUNT(*) FROM public.menu_categories) AS categories_count,
          (SELECT COUNT(*) FROM public.menu_items) AS menu_items_count,
          (SELECT COUNT(*) FROM public.orders) AS orders_count;
      `
    }),
  });

  const data = await res.json();
  console.log('Live Database Counts:', data);
}

verify().catch(e => console.error(e));

