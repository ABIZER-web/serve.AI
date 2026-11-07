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

