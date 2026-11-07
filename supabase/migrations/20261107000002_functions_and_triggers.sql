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

