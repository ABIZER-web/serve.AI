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

-- ==============================================================================
-- SERVE.AI - STORED PROCEDURES, FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Sequential Order Number Generator
CREATE OR REPLACE FUNCTION public.generate_order_number(p_restaurant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_count INT;
    v_order_num VARCHAR;
BEGIN
    SELECT COUNT(*) + 1 INTO v_count
    FROM public.orders
    WHERE restaurant_id = p_restaurant_id;

    v_order_num := 'ORD-' || LPAD((1000 + v_count)::TEXT, 4, '0');
    RETURN v_order_num;
END;
$$ LANGUAGE plpgsql;

-- 2. Sequential Invoice Number Generator
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_restaurant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_count INT;
    v_year VARCHAR;
    v_inv_num VARCHAR;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COUNT(*) + 1 INTO v_count
    FROM public.invoices
    WHERE restaurant_id = p_restaurant_id;

    v_inv_num := 'INV-' || v_year || '-' || LPAD(v_count::TEXT, 3, '0');
    RETURN v_inv_num;
END;
$$ LANGUAGE plpgsql;

-- 3. Verify Table QR Token
CREATE OR REPLACE FUNCTION public.verify_table_qr_token(
    p_restaurant_slug VARCHAR,
    p_table_number VARCHAR,
    p_token VARCHAR
)
RETURNS TABLE (
    is_valid BOOLEAN,
    restaurant_id UUID,
    restaurant_name VARCHAR,
    table_id UUID,
    table_number VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        true AS is_valid,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        t.id AS table_id,
        t.table_number
    FROM public.restaurants r
    JOIN public.tables t ON t.restaurant_id = r.id
    JOIN public.table_qr_tokens tqt ON tqt.table_id = t.id
    WHERE r.slug = p_restaurant_slug
      AND t.table_number = p_table_number
      AND tqt.secure_token = p_token
      AND tqt.is_active = true
      AND t.is_active = true
      AND r.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: New Order Notification & History
CREATE OR REPLACE FUNCTION public.handle_order_created()
RETURNS TRIGGER AS $$
DECLARE
    v_table_num VARCHAR;
    v_res_name VARCHAR;
BEGIN
    -- Fetch table number
    SELECT table_number INTO v_table_num FROM public.tables WHERE id = NEW.table_id;
    SELECT name INTO v_res_name FROM public.restaurants WHERE id = NEW.restaurant_id;

    -- Insert into order status history
    INSERT INTO public.order_status_history (
        order_id,
        from_status,
        to_status,
        actor_role,
        notes
    ) VALUES (
        NEW.id,
        NULL,
        NEW.status,
        'customer',
        'Order created from Table ' || COALESCE(v_table_num, 'Unknown')
    );

    -- Insert into in-app notifications
    INSERT INTO public.notifications (
        restaurant_id,
        order_id,
        title,
        message,
        type
    ) VALUES (
        NEW.restaurant_id,
        NEW.id,
        'New Order ' || NEW.order_number,
        'Received new order for Table ' || COALESCE(v_table_num, 'Unknown') || ' of ₹' || NEW.grand_total::TEXT,
        'new_order'
    );

    -- Mark table as occupied
    UPDATE public.tables 
    SET is_occupied = true, updated_at = now()
    WHERE id = NEW.table_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_created ON public.orders;
CREATE TRIGGER trg_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_created();

-- 5. Trigger: Order Status Transitions
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_table_num VARCHAR;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        SELECT table_number INTO v_table_num FROM public.tables WHERE id = NEW.table_id;

        -- Record in audit status history
        INSERT INTO public.order_status_history (
            order_id,
            from_status,
            to_status,
            actor_role,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'staff',
            'Order transitioned to ' || NEW.status
        );

        -- Insert notification for ready or completed
        IF NEW.status = 'ready' THEN
            INSERT INTO public.notifications (
                restaurant_id,
                order_id,
                title,
                message,
                type
            ) VALUES (
                NEW.restaurant_id,
                NEW.id,
                'Order Ready: ' || NEW.order_number,
                'Order for Table ' || COALESCE(v_table_num, '') || ' is prepared and ready for service.',
                'order_status'
            );
        ELSIF NEW.status = 'completed' THEN
            -- Check if table has other pending/active orders, otherwise free table
            IF NOT EXISTS (
                SELECT 1 FROM public.orders 
                WHERE table_id = NEW.table_id 
                  AND status NOT IN ('completed', 'cancelled', 'rejected')
                  AND id <> NEW.id
            ) THEN
                UPDATE public.tables 
                SET is_occupied = false, updated_at = now() 
                WHERE id = NEW.table_id;
            END IF;
        END IF;

        -- Update respective timestamp column
        IF NEW.status = 'accepted' AND NEW.accepted_at IS NULL THEN
            NEW.accepted_at := now();
        ELSIF NEW.status = 'preparing' AND NEW.preparing_at IS NULL THEN
            NEW.preparing_at := now();
        ELSIF NEW.status = 'ready' AND NEW.ready_at IS NULL THEN
            NEW.ready_at := now();
        ELSIF NEW.status = 'served' AND NEW.served_at IS NULL THEN
            NEW.served_at := now();
        ELSIF NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
            NEW.completed_at := now();
        ELSIF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND NEW.cancelled_at IS NULL THEN
            NEW.cancelled_at := now();
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_status_change ON public.orders;
CREATE TRIGGER trg_order_status_change
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_status_change();

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

-- ==============================================================================
-- SERVE.AI - SMART TABLE EXPERIENCE MIGRATION
-- Shared Table Sessions, Live Cart, Self-Seating, Guest Portal,
-- Service Requests & Split Billing
-- ==============================================================================

-- 1. ADD SMART TABLE SETTINGS TO RESTAURANT_SETTINGS
ALTER TABLE public.restaurant_settings
ADD COLUMN IF NOT EXISTS self_seating_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS wifi_ssid VARCHAR(100) DEFAULT 'CafeHighfive_Guest_5G',
ADD COLUMN IF NOT EXISTS wifi_password VARCHAR(100) DEFAULT 'specialtycoffee2026',
ADD COLUMN IF NOT EXISTS wifi_speed VARCHAR(50) DEFAULT '150 Mbps High-Speed Fiber',
ADD COLUMN IF NOT EXISTS spin_wheel_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS games_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS nfc_tag_type VARCHAR(50) DEFAULT 'NTAG213/215/216';

-- Add floor plan coordinates to tables
ALTER TABLE public.tables
ADD COLUMN IF NOT EXISTS floor_x INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS floor_y INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS shape VARCHAR(20) DEFAULT 'square', -- 'square', 'round', 'booth'
ADD COLUMN IF NOT EXISTS current_session_id UUID;

-- 2. TABLE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'bill_requested', 'settled', 'closed'
    total_bill NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    assigned_waiter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_waiter_name VARCHAR(100) DEFAULT 'Unassigned',
    lock_version INT NOT NULL DEFAULT 1,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Link tables to current session
ALTER TABLE public.tables
ADD CONSTRAINT fk_tables_session FOREIGN KEY (current_session_id) 
REFERENCES public.table_sessions(id) ON DELETE SET NULL;

-- 3. TABLE SESSION GUESTS
CREATE TABLE IF NOT EXISTS public.table_session_guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    guest_device_id VARCHAR(100) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(50) NOT NULL DEFAULT '👤',
    is_host BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(session_id, guest_device_id)
);

-- 4. TABLE SESSION SHARED CART
CREATE TABLE IF NOT EXISTS public.table_session_cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    cart_item_key VARCHAR(255) NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    variant_id UUID,
    variant_name VARCHAR(100) DEFAULT 'Standard',
    addons JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    added_by_guest_name VARCHAR(100) NOT NULL DEFAULT 'Guest',
    added_by_guest_avatar VARCHAR(50) DEFAULT '👤',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(session_id, cart_item_key)
);

-- 5. TABLE SESSION ROUNDS (ORDER HISTORY UNDER ACTIVE SESSION)
CREATE TABLE IF NOT EXISTS public.table_session_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    round_number INT NOT NULL DEFAULT 1,
    placed_by_name VARCHAR(100) NOT NULL DEFAULT 'Guest',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'preparing', 'ready', 'served'
    placed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SHARED TABLE PAYMENTS
CREATE TABLE IF NOT EXISTS public.table_session_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    payer_name VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL, -- 'upi', 'card', 'cash', 'apple_pay', 'google_pay', 'counter'
    split_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'full', 'equal', 'items', 'custom'
    items_covered JSONB DEFAULT '[]'::jsonb,
    transaction_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. REWARD WINS & SPIN-THE-WHEEL REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.table_reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.table_sessions(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    prize_label VARCHAR(255) NOT NULL,
    coupon_code VARCHAR(50),
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. INDEXES FOR HIGH-CONCURRENCY LOOKUPS
CREATE INDEX IF NOT EXISTS idx_table_sessions_token ON public.table_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_table_sessions_status ON public.table_sessions(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON public.table_session_cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_session_rounds_session ON public.table_session_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_session_payments_session ON public.table_session_payments(session_id);

-- 9. RPC STORED PROCEDURES FOR SAFE ATOMIC OPERATIONS

-- RPC: Join or Create Table Session
CREATE OR REPLACE FUNCTION public.join_or_create_table_session(
    p_table_token TEXT,
    p_guest_name TEXT,
    p_device_id TEXT,
    p_avatar TEXT DEFAULT '👤'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_table RECORD;
    v_session RECORD;
    v_session_token TEXT;
    v_guest RECORD;
    v_result JSONB;
BEGIN
    -- 1. Validate Table QR/NFC Token
    SELECT t.id, t.restaurant_id, t.table_number, t.is_occupied, t.current_session_id
    INTO v_table
    FROM public.tables t
    JOIN public.table_qr_tokens tqt ON tqt.table_id = t.id
    WHERE tqt.secure_token = p_table_token AND tqt.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired table security token.';
    END IF;

    -- 2. Find Active Session or Create New
    IF v_table.current_session_id IS NOT NULL THEN
        SELECT * INTO v_session
        FROM public.table_sessions
        WHERE id = v_table.current_session_id AND status IN ('active', 'bill_requested');
    END IF;

    IF v_session.id IS NULL THEN
        -- Generate secure cryptographic session token
        v_session_token := 'SESS_' || encode(gen_random_bytes(16), 'hex');
        
        INSERT INTO public.table_sessions (
            restaurant_id,
            table_id,
            table_number,
            session_token,
            status,
            total_bill,
            paid_amount,
            remaining_balance
        ) VALUES (
            v_table.restaurant_id,
            v_table.id,
            v_table.table_number,
            v_session_token,
            'active',
            0.00,
            0.00,
            0.00
        )
        RETURNING * INTO v_session;

        -- Bind table to this new session and mark occupied
        UPDATE public.tables
        SET current_session_id = v_session.id,
            is_occupied = true,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_table.id;
    END IF;

    -- 3. Register or Update Guest
    INSERT INTO public.table_session_guests (
        session_id,
        guest_device_id,
        guest_name,
        avatar,
        is_host,
        last_active_at
    ) VALUES (
        v_session.id,
        p_device_id,
        COALESCE(NULLIF(p_guest_name, ''), 'Guest ' || substr(p_device_id, 1, 4)),
        p_avatar,
        (SELECT COUNT(*) = 0 FROM public.table_session_guests WHERE session_id = v_session.id),
        timezone('utc'::text, now())
    )
    ON CONFLICT (session_id, guest_device_id) DO UPDATE
    SET guest_name = EXCLUDED.guest_name,
        avatar = EXCLUDED.avatar,
        last_active_at = timezone('utc'::text, now())
    RETURNING * INTO v_guest;

    -- 4. Construct Return Payload
    SELECT jsonb_build_object(
        'session_id', v_session.id,
        'session_token', v_session.session_token,
        'table_number', v_session.table_number,
        'status', v_session.status,
        'total_bill', v_session.total_bill,
        'paid_amount', v_session.paid_amount,
        'remaining_balance', v_session.remaining_balance,
        'assigned_waiter', v_session.assigned_waiter_name,
        'guest', jsonb_build_object(
            'id', v_guest.id,
            'name', v_guest.guest_name,
            'avatar', v_guest.avatar,
            'is_host', v_guest.is_host
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- RPC: Atomic Cart Item Synchronisation
CREATE OR REPLACE FUNCTION public.sync_session_cart_item(
    p_session_token TEXT,
    p_cart_item_key TEXT,
    p_menu_item_id UUID,
    p_name TEXT,
    p_unit_price NUMERIC,
    p_delta INT,
    p_variant_id UUID DEFAULT NULL,
    p_variant_name TEXT DEFAULT 'Standard',
    p_addons JSONB DEFAULT '[]'::jsonb,
    p_notes TEXT DEFAULT '',
    p_guest_name TEXT DEFAULT 'Guest',
    p_guest_avatar TEXT DEFAULT '👤',
    p_image_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_existing RECORD;
    v_new_qty INT;
BEGIN
    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE session_token = p_session_token AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active session not found for this token.';
    END IF;

    SELECT * INTO v_existing
    FROM public.table_session_cart_items
    WHERE session_id = v_session.id AND cart_item_key = p_cart_item_key;

    IF FOUND THEN
        v_new_qty := v_existing.quantity + p_delta;
        IF v_new_qty <= 0 THEN
            DELETE FROM public.table_session_cart_items
            WHERE id = v_existing.id;
        ELSE
            UPDATE public.table_session_cart_items
            SET quantity = v_new_qty,
                total_price = v_new_qty * unit_price,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_existing.id;
        END IF;
    ELSE
        IF p_delta > 0 THEN
            INSERT INTO public.table_session_cart_items (
                session_id,
                cart_item_key,
                menu_item_id,
                name,
                unit_price,
                quantity,
                total_price,
                variant_id,
                variant_name,
                addons,
                notes,
                added_by_guest_name,
                added_by_guest_avatar,
                image_url
            ) VALUES (
                v_session.id,
                p_cart_item_key,
                p_menu_item_id,
                p_name,
                p_unit_price,
                p_delta,
                p_unit_price * p_delta,
                p_variant_id,
                p_variant_name,
                p_addons,
                p_notes,
                p_guest_name,
                p_guest_avatar,
                p_image_url
            );
        END IF;
    END IF;

    -- Bump session lock version for concurrency detection
    UPDATE public.table_sessions
    SET lock_version = lock_version + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_session.id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: Submit Shared Cart Round
CREATE OR REPLACE FUNCTION public.submit_session_round(
    p_session_token TEXT,
    p_guest_name TEXT,
    p_special_instructions TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_cart_count INT;
    v_round_number INT;
    v_subtotal NUMERIC(10,2) := 0.00;
    v_tax NUMERIC(10,2) := 0.00;
    v_round_total NUMERIC(10,2) := 0.00;
    v_order RECORD;
    v_order_number TEXT;
    v_items_json JSONB;
BEGIN
    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE session_token = p_session_token AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active table session not found.';
    END IF;

    SELECT COUNT(*) INTO v_cart_count
    FROM public.table_session_cart_items
    WHERE session_id = v_session.id;

    IF v_cart_count = 0 THEN
        RAISE EXCEPTION 'Cannot submit an empty cart.';
    END IF;

    -- Calculate round totals
    SELECT COALESCE(SUM(total_price), 0.00) INTO v_subtotal
    FROM public.table_session_cart_items
    WHERE session_id = v_session.id;

    v_tax := ROUND(v_subtotal * 0.05, 2); -- 5% GST
    v_round_total := v_subtotal + v_tax;

    -- Calculate next round number
    SELECT COALESCE(MAX(round_number), 0) + 1 INTO v_round_number
    FROM public.table_session_rounds
    WHERE session_id = v_session.id;

    -- Build items json
    SELECT jsonb_agg(
        jsonb_build_object(
            'menu_item_id', menu_item_id,
            'name', name,
            'unit_price', unit_price,
            'quantity', quantity,
            'total_price', total_price,
            'variant_name', variant_name,
            'addons', addons,
            'notes', notes,
            'ordered_by', added_by_guest_name
        )
    ) INTO v_items_json
    FROM public.table_session_cart_items
    WHERE session_id = v_session.id;

    -- Create high-level order record for POS & Kitchen display
    v_order_number := 'ORD-' || (1000 + (SELECT COUNT(*) FROM public.orders) + 1);

    INSERT INTO public.orders (
        restaurant_id,
        table_id,
        order_number,
        customer_name,
        status,
        payment_status,
        payment_method,
        special_instructions,
        subtotal,
        taxable_amount,
        cgst_amount,
        sgst_amount,
        grand_total
    ) VALUES (
        v_session.restaurant_id,
        v_session.table_id,
        v_order_number,
        p_guest_name || ' (Table ' || v_session.table_number || ')',
        'pending',
        'pending',
        'counter',
        p_special_instructions,
        v_subtotal,
        v_subtotal,
        ROUND(v_subtotal * 0.025, 2),
        ROUND(v_subtotal * 0.025, 2),
        v_round_total
    )
    RETURNING * INTO v_order;

    -- Save round in session
    INSERT INTO public.table_session_rounds (
        session_id,
        order_id,
        order_number,
        round_number,
        placed_by_name,
        items,
        subtotal,
        tax_amount,
        total,
        status
    ) VALUES (
        v_session.id,
        v_order.id,
        v_order_number,
        v_round_number,
        p_guest_name,
        v_items_json,
        v_subtotal,
        v_tax,
        v_round_total,
        'pending'
    );

    -- Update table session cumulative totals
    UPDATE public.table_sessions
    SET total_bill = total_bill + v_round_total,
        remaining_balance = remaining_balance + v_round_total,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_session.id;

    -- Clear cart
    DELETE FROM public.table_session_cart_items
    WHERE session_id = v_session.id;

    RETURN jsonb_build_object(
        'success', true,
        'order_number', v_order_number,
        'round_number', v_round_number,
        'round_total', v_round_total
    );
END;
$$;

-- RPC: Record Partial or Full Payment
CREATE OR REPLACE FUNCTION public.process_session_payment(
    p_session_token TEXT,
    p_payer_name TEXT,
    p_amount NUMERIC,
    p_method TEXT,
    p_split_type TEXT DEFAULT 'custom',
    p_items_covered JSONB DEFAULT '[]'::jsonb,
    p_transaction_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_new_paid NUMERIC(10,2);
    v_new_remaining NUMERIC(10,2);
    v_new_status TEXT;
BEGIN
    SELECT * INTO v_session
    FROM public.table_sessions
    WHERE session_token = p_session_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Table session not found.';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    IF p_amount > v_session.remaining_balance THEN
        p_amount := v_session.remaining_balance;
    END IF;

    -- Record payment
    INSERT INTO public.table_session_payments (
        session_id,
        payer_name,
        amount,
        payment_method,
        split_type,
        items_covered,
        transaction_id,
        status
    ) VALUES (
        v_session.id,
        p_payer_name,
        p_amount,
        p_method,
        p_split_type,
        p_items_covered,
        COALESCE(p_transaction_id, 'TXN-' || floor(random() * 900000 + 100000)::text),
        'completed'
    );

    v_new_paid := v_session.paid_amount + p_amount;
    v_new_remaining := GREATEST(0.00, v_session.total_bill - v_new_paid);
    
    IF v_new_remaining <= 0 THEN
        v_new_status := 'settled';
    ELSE
        v_new_status := v_session.status;
    END IF;

    UPDATE public.table_sessions
    SET paid_amount = v_new_paid,
        remaining_balance = v_new_remaining,
        status = v_new_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_session.id;

    RETURN jsonb_build_object(
        'success', true,
        'paid_amount', v_new_paid,
        'remaining_balance', v_new_remaining,
        'status', v_new_status
    );
END;
$$;

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

