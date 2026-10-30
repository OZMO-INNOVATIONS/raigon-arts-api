-- ============================================================================
-- RAIGON ARTS: Reminders Table & Customer Priority / Region Enhancements
-- Migration: 20261030_reminders_and_enhancements.sql
-- ============================================================================

-- 1. ADD REGION AND PRIORITY TO CUSTOMERS TABLE
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';

CREATE INDEX IF NOT EXISTS idx_customers_region ON customers(region);
CREATE INDEX IF NOT EXISTS idx_customers_priority ON customers(priority);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- 2. CREATE REMINDERS TABLE
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id VARCHAR(50) DEFAULT '',
    description TEXT DEFAULT '',
    reminder_date VARCHAR(20) NOT NULL, -- Format: YYYY-MM-DD
    reminder_time VARCHAR(20) NOT NULL, -- Format: HH:mm
    assigned_staff VARCHAR(150) DEFAULT 'Unassigned',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    completed_by VARCHAR(150) DEFAULT '',
    completed_at VARCHAR(50) DEFAULT '',
    notification_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_priority ON reminders(priority);
CREATE INDEX IF NOT EXISTS idx_reminders_customer_id ON reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_reminders_assigned_staff ON reminders(assigned_staff);

-- 3. ROW LEVEL SECURITY (RLS) FOR REMINDERS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Allow authenticated users full access on reminders'
    ) THEN
        CREATE POLICY "Allow authenticated users full access on reminders"
            ON reminders
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Allow service_role full access on reminders'
    ) THEN
        CREATE POLICY "Allow service_role full access on reminders"
            ON reminders
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'Allow anon select on reminders'
    ) THEN
        CREATE POLICY "Allow anon select on reminders"
            ON reminders
            FOR ALL
            TO anon
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
