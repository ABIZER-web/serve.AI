-- ==============================================================================
-- SERVE.AI SEED DATA: "Food House" Demo Restaurant
-- ==============================================================================

DO $$
DECLARE
    v_res_id UUID := '11111111-1111-1111-1111-111111111111';
    v_cat_starters UUID := '22222222-2222-2222-2222-222222222201';
    v_cat_main UUID := '22222222-2222-2222-2222-222222222202';
    v_cat_pizza UUID := '22222222-2222-2222-2222-222222222203';
    v_cat_burgers UUID := '22222222-2222-2222-2222-222222222204';
    v_cat_indian UUID := '22222222-2222-2222-2222-222222222205';
    v_cat_chinese UUID := '22222222-2222-2222-2222-222222222206';
    v_cat_beverages UUID := '22222222-2222-2222-2222-222222222207';
    v_cat_desserts UUID := '22222222-2222-2222-2222-222222222208';

    v_item_paneer_pizza UUID := '33333333-3333-3333-3333-333333333301';
    v_item_margherita UUID := '33333333-3333-3333-3333-333333333302';
    v_item_burger UUID := '33333333-3333-3333-3333-333333333303';
    v_item_coffee UUID := '33333333-3333-3333-3333-333333333304';
    v_item_fries UUID := '33333333-3333-3333-3333-333333333305';
    v_item_pasta UUID := '33333333-3333-3333-3333-333333333306';
    v_item_noodles UUID := '33333333-3333-3333-3333-333333333307';
    v_item_biryani UUID := '33333333-3333-3333-3333-333333333308';
    v_item_thali UUID := '33333333-3333-3333-3333-333333333309';

    v_table_5 UUID;
    v_table_8 UUID;
    v_table_2 UUID;
    v_table_7 UUID;
    v_table_4 UUID;
    v_table_3 UUID;

    v_addon_cheese UUID := '44444444-4444-4444-4444-444444444401';
    v_addon_toppings UUID := '44444444-4444-4444-4444-444444444402';
    v_addon_dip UUID := '44444444-4444-4444-4444-444444444403';

    v_order_1001 UUID := '55555555-5555-5555-5555-555555555501';
    v_order_item_pizza UUID;
    v_order_item_coffee UUID;
    v_order_item_fries UUID;

    v_t INT;
    v_t_id UUID;
    v_t_num VARCHAR;
BEGIN
    -- 1. Create Restaurant "Food House"
    INSERT INTO public.restaurants (
        id, name, slug, legal_name, gstin, phone, email, address, city, state, postal_code, logo_url, banner_url
    ) VALUES (
        v_res_id,
        'Food House',
        'food-house',
        'Food House Gourmet Pvt Ltd',
        '29AABCU9603R1ZM',
        '+91 98765 43210',
        'contact@foodhouse.in',
        '#42, 100 Feet Road, Indiranagar',
        'Bangalore',
        'Karnataka',
        '560038',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
    ) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 2. Restaurant Settings
    INSERT INTO public.restaurant_settings (
        restaurant_id, is_gst_registered, cgst_rate, sgst_rate, packaging_fee_rate, 
        enable_voice_announcements, voice_language, voice_speed, voice_volume, announce_table_first, announce_order_total
    ) VALUES (
        v_res_id, true, 2.50, 2.50, 0.00, true, 'en-IN', 1.00, 1.00, true, true
    ) ON CONFLICT (restaurant_id) DO NOTHING;

    -- 3. Create Tables T-01 to T-10 with Secure Tokens
    FOR v_t IN 1..10 LOOP
        v_t_num := 'T-' || LPAD(v_t::TEXT, 2, '0');
        v_t_id := gen_random_uuid();

        INSERT INTO public.tables (id, restaurant_id, table_number, section, capacity, is_occupied)
        VALUES (v_t_id, v_res_id, v_t_num, CASE WHEN v_t <= 5 THEN 'Main Dining' ELSE 'Balcony Terrace' END, 4, (v_t IN (2, 5, 7, 8)))
        ON CONFLICT (restaurant_id, table_number) DO UPDATE SET capacity = EXCLUDED.capacity
        RETURNING id INTO v_t_id;

        IF v_t = 5 THEN v_table_5 := v_t_id; END IF;
        IF v_t = 8 THEN v_table_8 := v_t_id; END IF;
        IF v_t = 2 THEN v_table_2 := v_t_id; END IF;
        IF v_t = 7 THEN v_table_7 := v_t_id; END IF;
        IF v_t = 4 THEN v_table_4 := v_t_id; END IF;
        IF v_t = 3 THEN v_table_3 := v_t_id; END IF;

        -- Unique token per table
        INSERT INTO public.table_qr_tokens (table_id, restaurant_id, secure_token, qr_code_url, is_active)
        VALUES (v_t_id, v_res_id, 'TOKEN_FOOD_HOUSE_' || v_t_num || '_SECURE_KEY', 
                'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' || 'https://serveai.restaurant/r/food-house/table/' || v_t_num || '?token=TOKEN_FOOD_HOUSE_' || v_t_num || '_SECURE_KEY', 
                true)
        ON CONFLICT (secure_token) DO NOTHING;
    END LOOP;

    -- 4. Menu Categories
    INSERT INTO public.menu_categories (id, restaurant_id, name, description, display_order, icon_name) VALUES
        (v_cat_starters, v_res_id, 'Starters', 'Crispy appetizers and finger foods', 1, 'Salad'),
        (v_cat_main, v_res_id, 'Main Course', 'Hearty meals and curated curries', 2, 'Utensils'),
        (v_cat_pizza, v_res_id, 'Pizza', 'Stone-baked artisan pizzas', 3, 'Pizza'),
        (v_cat_burgers, v_res_id, 'Burgers', 'Grilled patties with gourmet sauces', 4, 'Sandwich'),
        (v_cat_indian, v_res_id, 'Indian', 'Authentic traditional Indian flavours', 5, 'Soup'),
        (v_cat_chinese, v_res_id, 'Chinese', 'Wok-tossed noodles and manchurian', 6, 'Flame'),
        (v_cat_beverages, v_res_id, 'Beverages', 'Cold brews, shakes, and mocktails', 7, 'Coffee'),
        (v_cat_desserts, v_res_id, 'Desserts', 'Decadent sweet endings', 8, 'Cake')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Addons
    INSERT INTO public.menu_addons (id, restaurant_id, name, price, is_veg) VALUES
        (v_addon_cheese, v_res_id, 'Extra Cheese', 40.00, true),
        (v_addon_toppings, v_res_id, 'Extra Toppings', 30.00, true),
        (v_addon_dip, v_res_id, 'Garlic Mayo Dip', 25.00, true)
    ON CONFLICT (id) DO NOTHING;

    -- 6. Menu Items
    -- Pizza: Paneer Pizza (Bestseller)
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_paneer_pizza, v_res_id, v_cat_pizza, 'Paneer Pizza', 'Crispy crust topped with spiced paneer cubes, bell peppers, mozzarella and herbs.', 249.00, true, true, 18, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Variants for Paneer Pizza
    INSERT INTO public.menu_item_variants (menu_item_id, name, price, is_default, display_order) VALUES
        (v_item_paneer_pizza, 'Regular (7")', 149.00, false, 1),
        (v_item_paneer_pizza, 'Medium (9")', 249.00, true, 2),
        (v_item_paneer_pizza, 'Large (12")', 349.00, false, 3)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.item_addons (menu_item_id, addon_id) VALUES
        (v_item_paneer_pizza, v_addon_cheese),
        (v_item_paneer_pizza, v_addon_toppings)
    ON CONFLICT DO NOTHING;

    -- Pizza: Margherita Pizza (Bestseller)
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_margherita, v_res_id, v_cat_pizza, 'Margherita Pizza', 'Classic Italian pizza with rich San Marzano tomato puree, basil, and molten mozzarella.', 199.00, true, true, 15, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Burger: Veg Burger (Bestseller)
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_burger, v_res_id, v_cat_burgers, 'Veg Burger', 'Crispy herb potato patty served with lettuce, tomatoes, and secret chipotle mayo.', 149.00, true, true, 12, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Beverage: Cold Coffee
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_coffee, v_res_id, v_cat_beverages, 'Cold Coffee', 'Thick blended creamy espresso with chilled milk and chocolate drizzle.', 89.00, true, true, 5, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Starters: French Fries
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_fries, v_res_id, v_cat_starters, 'French Fries', 'Golden salted crispy french potato fries with peri-peri seasoning sprinkle.', 100.00, true, false, 8, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Starters: Pasta Alfredo
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_pasta, v_res_id, v_cat_starters, 'Pasta Alfredo', 'Creamy penne tossed in parmesan cheese sauce with sauteed mushrooms.', 229.00, true, false, 15, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281724?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Chinese: Veg Hakka Noodles
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_noodles, v_res_id, v_cat_chinese, 'Veg Hakka Noodles', 'Wok tossed noodles with crunchy cabbage, bell peppers, carrots, and spring onions.', 189.00, true, false, 14, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- Indian: Special Thali
    INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, base_price, is_veg, is_bestseller, prep_time_minutes, image_url)
    VALUES (v_item_thali, v_res_id, v_cat_indian, 'Special Royal Thali', 'Paneer butter masala, dal makhani, 2 butter naans, jeera rice, salad and gulab jamun.', 299.00, true, true, 20, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Seed Sample Order #ORD-1001 for Table T-05
    -- 2 x Paneer Pizza, 1 x Cold Coffee, 1 x French Fries
    INSERT INTO public.orders (
        id, restaurant_id, table_id, order_number, customer_name, customer_phone,
        status, payment_status, payment_method, special_instructions,
        subtotal, discount_amount, taxable_amount, cgst_amount, sgst_amount, grand_total,
        estimated_prep_time_minutes
    ) VALUES (
        v_order_1001, v_res_id, v_table_5, 'ORD-1001', 'Rahul Sharma', '+91 99887 76655',
        'preparing', 'paid', 'upi', 'Less spicy, extra cheese on the pizza please.',
        687.00, 50.00, 637.00, 15.93, 15.93, 668.00,
        18
    ) ON CONFLICT (id) DO NOTHING;

    -- Line Items for ORD-1001
    INSERT INTO public.order_items (id, order_id, menu_item_id, item_name, variant_name, unit_price, quantity, total_price)
    VALUES 
        (gen_random_uuid(), v_order_1001, v_item_paneer_pizza, 'Paneer Pizza', 'Medium (9")', 249.00, 2, 498.00),
        (gen_random_uuid(), v_order_1001, v_item_coffee, 'Cold Coffee', 'Standard', 89.00, 1, 89.00),
        (gen_random_uuid(), v_order_1001, v_item_fries, 'French Fries', 'Standard', 100.00, 1, 100.00)
    ON CONFLICT DO NOTHING;

    -- Seed Sample Invoice INV-2026-001
    INSERT INTO public.invoices (
        restaurant_id, order_id, invoice_number, customer_name, customer_phone, table_number,
        subtotal, discount_amount, taxable_amount, cgst_rate, cgst_amount, sgst_rate, sgst_amount,
        packaging_fee, grand_total, payment_method, payment_status, gstin, restaurant_snapshot
    ) VALUES (
        v_res_id, v_order_1001, 'INV-2026-001', 'Rahul Sharma', '+91 99887 76655', 'T-05',
        687.00, 50.00, 637.00, 2.50, 15.93, 2.50, 15.93,
        0.00, 668.00, 'UPI (PhonePe)', 'paid', '29AABCU9603R1ZM',
        '{"name":"Food House","address":"#42, 100 Feet Road, Indiranagar, Bangalore","phone":"+91 98765 43210"}'::jsonb
    ) ON CONFLICT (order_id) DO NOTHING;

END $$;

