-- ========================================================================
-- RAIGON ART - 45-DAY DATA RETENTION POLICY & AUTOMATED PURGE FUNCTION
-- ========================================================================

-- 1. Add retention settings columns to workshop_settings
ALTER TABLE workshop_settings 
ADD COLUMN IF NOT EXISTS data_retention_days INTEGER NOT NULL DEFAULT 45;

ALTER TABLE workshop_settings 
ADD COLUMN IF NOT EXISTS auto_cleanup_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE workshop_settings 
ADD COLUMN IF NOT EXISTS retention_target VARCHAR(30) NOT NULL DEFAULT 'all';

-- 2. PostgreSQL Function to execute automatic cleanup
CREATE OR REPLACE FUNCTION purge_expired_customer_data(p_retention_days INT DEFAULT NULL)
RETURNS TABLE (
    deleted_customers_count INT,
    deleted_photos_count INT,
    cutoff_timestamp TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_days INT;
    v_target VARCHAR(30);
    v_cutoff TIMESTAMPTZ;
    v_deleted_cust INT := 0;
    v_deleted_photos INT := 0;
BEGIN
    -- Determine retention days from parameter or workshop_settings
    IF p_retention_days IS NOT NULL THEN
        v_days := p_retention_days;
    ELSE
        SELECT COALESCE(data_retention_days, 45), COALESCE(retention_target, 'all')
        INTO v_days, v_target
        FROM workshop_settings 
        WHERE id = 'default';
        
        IF v_days IS NULL THEN
            v_days := 45;
        END IF;
    END IF;

    v_cutoff := CURRENT_TIMESTAMP - (v_days || ' days')::INTERVAL;

    -- Count photos to be deleted
    SELECT COUNT(*) INTO v_deleted_photos
    FROM customer_photos cp
    JOIN customers c ON c.id = cp.customer_id
    WHERE c.order_date < v_cutoff::DATE OR c.created_at < v_cutoff;

    -- Delete customer records (CASCADE will automatically delete customer_photos and customer_frames)
    IF v_target = 'all' OR v_target IS NULL THEN
        WITH deleted AS (
            DELETE FROM customers
            WHERE order_date < v_cutoff::DATE OR created_at < v_cutoff
            RETURNING id
        )
        SELECT COUNT(*) INTO v_deleted_cust FROM deleted;
    ELSE
        -- photos_only: delete photos only, keep order records
        DELETE FROM customer_photos
        WHERE customer_id IN (
            SELECT id FROM customers
            WHERE order_date < v_cutoff::DATE OR created_at < v_cutoff
        );
    END IF;

    -- Return stats
    deleted_customers_count := v_deleted_cust;
    deleted_photos_count := v_deleted_photos;
    cutoff_timestamp := v_cutoff;
    RETURN NEXT;
END;
$$;
