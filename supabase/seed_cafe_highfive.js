import {
  CAFE_HIGHFIVE_RESTAURANT,
  CAFE_HIGHFIVE_CATEGORIES,
  CAFE_HIGHFIVE_MENU_ITEMS,
  CAFE_HIGHFIVE_TABLES,
} from '../webapp/src/lib/mockData.js';

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'ykkqtgkovgyuolhrcqzm';

async function seedCafeHighfive() {
  console.log('Seeding Cafe Highfive into live database...');

  // 1. Restaurant
  const resSql = `
    INSERT INTO public.restaurants (
      id, name, slug, legal_name, gstin, phone, email, address, city, state, postal_code, logo_url, banner_url
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Cafe Highfive',
      'cafe-highfive',
      'Cafe Highfive Specialty Coffee & Bistro Pvt Ltd',
      '29AABCH5555R1Z9',
      '+91 98888 55555',
      'hello@cafehighfive.com',
      '#55, 12th Main Road, HAL 2nd Stage, Indiranagar',
      'Bangalore',
      'Karnataka',
      '560038',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80'
    ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    INSERT INTO public.restaurant_settings (
      restaurant_id, is_gst_registered, cgst_rate, sgst_rate, packaging_fee_rate,
      enable_voice_announcements, voice_language, self_seating_enabled, wifi_ssid, wifi_password, spin_wheel_enabled, games_enabled
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      true, 2.50, 2.50, 15.00, true, 'en-IN', true, 'CafeHighfive_Guest_5G', 'specialtycoffee2026', true, true
    ) ON CONFLICT (restaurant_id) DO UPDATE SET 
      self_seating_enabled = true,
      wifi_ssid = 'CafeHighfive_Guest_5G',
      wifi_password = 'specialtycoffee2026';
  `;

  // 2. Tables & QR Tokens
  const tablesSql = CAFE_HIGHFIVE_TABLES.map((t, idx) => `
    DO $$
    DECLARE
      v_tbl_id UUID;
    BEGIN
      INSERT INTO public.tables (
        restaurant_id, table_number, section, capacity, is_occupied
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        '${t.tableNumber}',
        '${t.section}',
        ${t.capacity},
        ${t.isOccupied}
      ) ON CONFLICT (restaurant_id, table_number) DO UPDATE SET is_occupied = EXCLUDED.is_occupied
      RETURNING id INTO v_tbl_id;

      INSERT INTO public.table_qr_tokens (
        table_id, restaurant_id, secure_token, qr_code_url, is_active
      ) VALUES (
        v_tbl_id,
        '00000000-0000-0000-0000-000000000001',
        '${t.token}',
        '${t.qrUrl}',
        true
      ) ON CONFLICT (secure_token) DO NOTHING;
    END $$;
  `).join('\n');

  // 3. Menu items
  const menuSql = CAFE_HIGHFIVE_MENU_ITEMS.map((item, idx) => `
    INSERT INTO public.menu_items (
      id, restaurant_id, name, description, price, is_veg, is_available, is_bestseller, image_url, preparation_time_minutes
    ) VALUES (
      '00000000-0000-0000-0001-${(idx + 1).toString().padStart(12, '0')}',
      '00000000-0000-0000-0000-000000000001',
      '${item.name.replace(/'/g, "''")}',
      '${(item.description || '').replace(/'/g, "''")}',
      ${item.price},
      ${item.isVeg !== false},
      true,
      ${item.isBestseller === true},
      '${item.imageUrl}',
      12
    ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `).join('\n');

  const fullSql = `${resSql}\n${tablesSql}\n${menuSql}`;

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: fullSql }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to seed Cafe Highfive:', errorText);
    process.exit(1);
  }

  console.log('✅ Cafe Highfive tables, tokens, and menu items seeded successfully!');
}

seedCafeHighfive().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

