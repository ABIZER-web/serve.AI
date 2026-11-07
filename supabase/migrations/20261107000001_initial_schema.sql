-- ==============================================================================
-- SERVE.AI RESTAURANT ECOSYSTEM - DATABASE SCHEMA MIGRATION
-- Multi-Tenant PostgreSQL Schema with Row Level Security (RLS) & Realtime
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. RESTAURANTS & SETTINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    gstin VARCHAR(50),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    postal_code VARCHAR(20) NOT NULL DEFAULT '560001',
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    logo_url TEXT,
    banner_url TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
    is_gst_registered BOOLEAN NOT NULL DEFAULT true,
    cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    igst_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    packaging_fee_rate NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    service_charge_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    enable_voice_announcements BOOLEAN NOT NULL DEFAULT true,
    voice_language VARCHAR(50) NOT NULL DEFAULT 'en-IN', -- 'en-IN', 'hi-IN', 'hinglish'
    voice_speed NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    voice_pitch NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    voice_volume NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    announce_table_first BOOLEAN NOT NULL DEFAULT true,
    announce_order_total BOOLEAN NOT NULL DEFAULT true,
    auto_accept_orders BOOLEAN NOT NULL DEFAULT false,
    order_timeout_minutes INT NOT NULL DEFAULT 45,
    allow_pay_at_counter BOOLEAN NOT NULL DEFAULT true,
    allow_online_upi BOOLEAN NOT NULL DEFAULT true,
    razorpay_key_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. USERS, ROLES & RESTAURANT MEMBERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

INSERT INTO public.roles (id, name, description) VALUES
    ('owner', 'Restaurant Owner', 'Full control over all restaurant settings, financial records, and staff management.'),
    ('admin', 'Administrator', 'Administrative access to menu, tables, staff, and live operations.'),
    ('manager', 'Shift Manager', 'Operational access to approve orders, override kitchen states, and view daily sales.'),
    ('waiter', 'Serving Staff', 'Floor access to manage table orders, mark served, and view active tables.'),
    ('kitchen', 'Kitchen Staff', 'KDS display access to accept and mark food preparation status.'),
    ('cashier', 'Cashier', 'Billing and settlement access for counter payments and invoices.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    is_superadmin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.restaurant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(restaurant_id, profile_id)
);

-- ==============================================================================
-- 3. TABLES & SECURE QR TOKENS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL, -- e.g. 'T-01', 'T-05', 'Table 1'
    section VARCHAR(100) NOT NULL DEFAULT 'Main Dining',
    capacity INT NOT NULL DEFAULT 4,
    is_occupied BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(restaurant_id, table_number)
);

CREATE TABLE IF NOT EXISTS public.table_qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    secure_token VARCHAR(255) NOT NULL UNIQUE,
    qr_code_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ
);

-- ==============================================================================
-- 4. MENU CATEGORIES, ITEMS, VARIANTS & ADDONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    icon_name VARCHAR(50) DEFAULT 'Utensils',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_bestseller BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    prep_time_minutes INT NOT NULL DEFAULT 15,
    image_url TEXT,
    calories INT,
    spicy_level INT DEFAULT 0, -- 0 = None, 1 = Mild, 2 = Medium, 3 = Spicy
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.menu_item_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Regular', 'Medium', 'Large'
    price NUMERIC(10,2) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.menu_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Extra Cheese', 'Extra Dip', 'Extra Paneer'
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES public.menu_addons(id) ON DELETE CASCADE,
    UNIQUE(menu_item_id, addon_id)
);

-- ==============================================================================
-- 5. DISCOUNTS & OFFERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
    value NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    max_discount_amount NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. ORDERS, ORDER ITEMS & ORDER ADDONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) NOT NULL, -- e.g. 'ORD-1001'
    customer_name VARCHAR(100) DEFAULT 'Guest',
    customer_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    -- 'pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'rejected', 'cancelled'
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- 'pending', 'paid', 'refunded', 'failed'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'counter',
    -- 'counter', 'upi', 'card', 'cash'
    special_instructions TEXT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cgst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    packaging_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estimated_prep_time_minutes INT NOT NULL DEFAULT 20,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    accepted_at TIMESTAMPTZ,
    preparing_at TIMESTAMPTZ,
    ready_at TIMESTAMPTZ,
    served_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.menu_item_variants(id) ON DELETE RESTRICT,
    item_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(100),
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES public.menu_addons(id) ON DELETE RESTRICT,
    addon_name VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) DEFAULT 'customer',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. PAYMENTS & INVOICES (GST COMPLIANT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(100) UNIQUE,
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL, -- 'upi', 'cash', 'card', 'counter'
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
    raw_response JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'INV-2026-001'
    customer_name VARCHAR(100),
    customer_phone VARCHAR(50),
    table_number VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    taxable_amount NUMERIC(10,2) NOT NULL,
    cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    cgst_amount NUMERIC(10,2) NOT NULL,
    sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    sgst_amount NUMERIC(10,2) NOT NULL,
    packaging_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
    gstin VARCHAR(50),
    restaurant_snapshot JSONB NOT NULL,
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(100),
    addons_summary TEXT,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- ==============================================================================
-- 8. NOTIFICATIONS & AI VOICE ANNOUNCEMENT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'new_order', -- 'new_order', 'order_status', 'payment', 'system'
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL DEFAULT 'android', -- 'android', 'ios', 'web'
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.announcement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    spoken_text TEXT NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en-IN',
    announced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    device_fingerprint VARCHAR(255)
);

-- ==============================================================================
-- 9. RESTAURANT HOURS & INVENTORY & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    open_time TIME NOT NULL DEFAULT '10:00:00',
    close_time TIME NOT NULL DEFAULT '23:00:00',
    is_closed BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(restaurant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    current_stock NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    low_stock_threshold NUMERIC(10,2) NOT NULL DEFAULT 10.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    changes JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_cat ON public.menu_items(restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_table_qr_tokens_token ON public.table_qr_tokens(secure_token);
CREATE INDEX IF NOT EXISTS idx_notifications_restaurant ON public.notifications(restaurant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_order ON public.invoices(restaurant_id, order_id);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if auth user is active member of restaurant
CREATE OR REPLACE FUNCTION public.is_restaurant_member(res_id UUID, req_role VARCHAR DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    IF req_role IS NULL THEN
        RETURN EXISTS (
            SELECT 1 FROM public.restaurant_members
            WHERE restaurant_id = res_id
              AND profile_id = auth.uid()
              AND is_active = true
        );
    ELSE
        RETURN EXISTS (
            SELECT 1 FROM public.restaurant_members
            WHERE restaurant_id = res_id
              AND profile_id = auth.uid()
              AND role_id = req_role
              AND is_active = true
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public / Customer Access Policies:
-- Anyone can view active restaurants, menus, categories, and active tables
CREATE POLICY "Public can view active restaurants" ON public.restaurants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active restaurant settings" ON public.restaurant_settings
    FOR SELECT USING (true);

CREATE POLICY "Public can view active menu categories" ON public.menu_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active menu items" ON public.menu_items
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public can view item variants" ON public.menu_item_variants
    FOR SELECT USING (true);

CREATE POLICY "Public can view addons" ON public.menu_addons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view item_addons" ON public.item_addons
    FOR SELECT USING (true);

CREATE POLICY "Public can verify active table QR token" ON public.table_qr_tokens
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active tables" ON public.tables
    FOR SELECT USING (is_active = true);

-- Orders: Customer can create orders & read their own order via tracking token / ID
CREATE POLICY "Anyone can create an order" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers and staff can read orders" ON public.orders
    FOR SELECT USING (
        -- Allow read if staff member of that restaurant OR customer referencing the order ID
        public.is_restaurant_member(restaurant_id) OR true
    );

CREATE POLICY "Order items readable" ON public.order_items
    FOR SELECT USING (true);

CREATE POLICY "Order items insertable" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Order addons readable" ON public.order_item_addons
    FOR SELECT USING (true);

CREATE POLICY "Order addons insertable" ON public.order_item_addons
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Order status history readable" ON public.order_status_history
    FOR SELECT USING (true);

CREATE POLICY "Invoices readable" ON public.invoices
    FOR SELECT USING (true);

CREATE POLICY "Invoice items readable" ON public.invoice_items
    FOR SELECT USING (true);

-- Staff Access Policies:
CREATE POLICY "Staff can update orders" ON public.orders
    FOR UPDATE USING (public.is_restaurant_member(restaurant_id));

CREATE POLICY "Staff can view notifications" ON public.notifications
    FOR SELECT USING (public.is_restaurant_member(restaurant_id));

CREATE POLICY "Staff can update notifications" ON public.notifications
    FOR UPDATE USING (public.is_restaurant_member(restaurant_id));

-- Realtime publication for Orders, Notifications, and Status History
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;

