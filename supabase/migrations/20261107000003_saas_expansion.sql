-- ==============================================================================
-- SERVE.AI - SAAS EXPANSION MIGRATION
-- Adds Service Requests, Kitchen Stations, Inventory Recipes, Loyalty System,
-- Table Reservations, Customer Reviews, and Super Admin Subscriptions
-- ==============================================================================

-- 1. KITCHEN STATIONS & ROUTING
CREATE TABLE IF NOT EXISTS public.kitchen_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Pizza & Oven', 'Wok & Chinese', 'Curry & Tandoor', 'Bar & Beverages'
    code VARCHAR(50) NOT NULL,
    printer_ip VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(restaurant_id, code)
);

-- Link menu category to default kitchen station
ALTER TABLE public.menu_categories 
ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES public.kitchen_stations(id) ON DELETE SET NULL;

-- 2. SERVICE REQUESTS (CALL WAITER)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'water', 'extra_plates', 'tissues', 'bill', 'waiter_call', 'assistance'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved'
    notes TEXT,
    assigned_to_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 3. INVENTORY & RECIPES
CREATE TABLE IF NOT EXISTS public.inventory_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'kg', -- 'kg', 'L', 'g', 'ml', 'units'
    current_stock NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    min_threshold NUMERIC(10,2) NOT NULL DEFAULT 5.00,
    cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    supplier_name VARCHAR(255),
    supplier_phone VARCHAR(50),
    expiry_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.inventory_ingredients(id) ON DELETE CASCADE,
    quantity_required NUMERIC(10,3) NOT NULL, -- e.g. 0.200 kg paneer per pizza
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(menu_item_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS public.inventory_wastage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.inventory_ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL, -- 'expired', 'spoiled', 'spillage'
    logged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. LOYALTY & CUSTOMER CRM
CREATE TABLE IF NOT EXISTS public.loyalty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100),
    points_balance INT NOT NULL DEFAULT 0,
    total_spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    visits_count INT NOT NULL DEFAULT 1,
    membership_tier VARCHAR(50) NOT NULL DEFAULT 'Silver', -- 'Silver', 'Gold', 'Platinum'
    stamps_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(restaurant_id, customer_phone)
);

CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    points_required INT NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ADVANCED ORDERING: DINE-IN / TAKEAWAY, SCHEDULED ORDERS & SPLIT BILL
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) NOT NULL DEFAULT 'dine_in', -- 'dine_in', 'takeaway'
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS split_count INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.split_bill_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    share_label VARCHAR(100) NOT NULL, -- 'Guest 1', 'Guest 2' or Customer name
    share_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
    payment_method VARCHAR(50) DEFAULT 'counter',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLE RESERVATIONS & WAITLIST
CREATE TABLE IF NOT EXISTS public.table_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    party_size INT NOT NULL DEFAULT 2,
    reservation_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'seated', 'cancelled', 'no_show'
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    party_size INT NOT NULL DEFAULT 2,
    estimated_wait_minutes INT NOT NULL DEFAULT 15,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- 'waiting', 'notified', 'seated', 'cancelled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CUSTOMER RATINGS & AI SENTIMENT
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) DEFAULT 'Guest',
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    food_rating INT CHECK (food_rating BETWEEN 1 AND 5),
    service_rating INT CHECK (service_rating BETWEEN 1 AND 5),
    ambience_rating INT CHECK (ambience_rating BETWEEN 1 AND 5),
    tags TEXT[], -- e.g. ['Quick Service', 'Delicious Pizza', 'Friendly Staff']
    comment TEXT,
    sentiment VARCHAR(20) DEFAULT 'positive', -- 'positive', 'neutral', 'negative'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. SUPER ADMIN SAAS PLATFORM & MULTI-TENANCY
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_price NUMERIC(10,2) NOT NULL,
    max_tables INT NOT NULL,
    max_orders_per_month INT NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.saas_plans (id, name, monthly_price, max_tables, max_orders_per_month, features) VALUES
    ('starter', 'Starter Plan', 1999.00, 15, 2000, '{"kds": true, "ai_voice": false, "inventory": false, "loyalty": false}'::jsonb),
    ('pro', 'Pro Restaurant', 4999.00, 50, 10000, '{"kds": true, "ai_voice": true, "inventory": true, "loyalty": true, "reservations": true}'::jsonb),
    ('enterprise', 'Franchise & Chain', 9999.00, 999, 999999, '{"kds": true, "ai_voice": true, "inventory": true, "loyalty": true, "reservations": true, "multi_branch": true, "custom_domain": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.restaurant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
    plan_id VARCHAR(50) NOT NULL REFERENCES public.saas_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'trial', 'past_due', 'cancelled'
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '30 days'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. STAFF SHIFTS & ATTENDANCE
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.restaurant_members(id) ON DELETE CASCADE,
    staff_name VARCHAR(100) NOT NULL,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    check_out_time TIMESTAMPTZ,
    shift_name VARCHAR(50) DEFAULT 'Morning Shift', -- 'Morning Shift', 'Evening Shift', 'Full Day'
    status VARCHAR(50) NOT NULL DEFAULT 'on_duty', -- 'on_duty', 'break', 'off_duty'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Realtime Publication additions
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_reservations;

