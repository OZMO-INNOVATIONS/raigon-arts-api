-- ============================================================================
-- RAIGON ART: Reminders Table Schema, Indexes, Policies & Sync Triggers
-- Specification Version: 2.1.0
-- Project: nhqewkbztfmlophtzqmk
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reminders (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_id VARCHAR(100) DEFAULT '',
    order_id VARCHAR(100) DEFAULT '',
    description TEXT DEFAULT '',
    reminder_date VARCHAR(50) NOT NULL,          -- Format: YYYY-MM-DD
    reminder_time VARCHAR(50) DEFAULT '10:00 AM', -- Format: HH:mm or hh:mm a
    assigned_staff VARCHAR(150) DEFAULT 'Admin',
    priority VARCHAR(50) DEFAULT 'medium',       -- 'low' | 'medium' | 'high' | 'urgent'
    status VARCHAR(50) DEFAULT 'pending',        -- 'pending' | 'completed' | 'overdue'
    is_completed BOOLEAN DEFAULT false,          -- Syncs with status = 'completed'
    completed_at VARCHAR(100) DEFAULT '',        -- ISO8601 timestamp
    completed_by VARCHAR(150) DEFAULT '',        -- Staff / Admin identifier
    notification_triggered BOOLEAN DEFAULT false,
    created_by VARCHAR(150) DEFAULT 'Admin',
    phone VARCHAR(50) DEFAULT '',
    region VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist if table was previously created with older schema
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS customer_id VARCHAR(100) DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS order_id VARCHAR(100) DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS completed_by VARCHAR(150) DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS completed_at VARCHAR(100) DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS notification_triggered BOOLEAN DEFAULT false;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS created_by VARCHAR(150) DEFAULT 'Admin';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS region VARCHAR(100) DEFAULT '';

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders (reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders (status);
CREATE INDEX IF NOT EXISTS idx_reminders_is_completed ON public.reminders (is_completed);
CREATE INDEX IF NOT EXISTS idx_reminders_customer_id ON public.reminders (customer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Permissive Policies for Authenticated, Anon & Service Role
DROP POLICY IF EXISTS "Allow full access for authenticated" ON public.reminders;
CREATE POLICY "Allow full access for authenticated" 
    ON public.reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access for anon" ON public.reminders;
CREATE POLICY "Allow full access for anon" 
    ON public.reminders FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access for service_role" ON public.reminders;
CREATE POLICY "Allow full access for service_role" 
    ON public.reminders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Grants
GRANT ALL ON TABLE public.reminders TO anon, authenticated, service_role, postgres;

-- Date Normalization & Completion Sync Trigger
CREATE OR REPLACE FUNCTION public.normalize_reminder_record()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize reminder_date to YYYY-MM-DD
    IF NEW.reminder_date LIKE '%T%' THEN
        NEW.reminder_date := SPLIT_PART(NEW.reminder_date, 'T', 1);
    END IF;

    -- Synchronize status and is_completed
    IF NEW.status = 'completed' OR NEW.is_completed = true THEN
        NEW.status := 'completed';
        NEW.is_completed := true;
        IF NEW.completed_at IS NULL OR NEW.completed_at = '' THEN
            NEW.completed_at := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
        END IF;
    ELSE
        NEW.is_completed := false;
        IF NEW.status = 'completed' THEN
            NEW.status := 'pending';
        END IF;
    END IF;

    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_reminder_record ON public.reminders;
CREATE TRIGGER trg_normalize_reminder_record
BEFORE INSERT OR UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION public.normalize_reminder_record();

-- Clean up any existing records with ISO dates
UPDATE public.reminders
SET reminder_date = SPLIT_PART(reminder_date, 'T', 1)
WHERE reminder_date LIKE '%T%';

-- Reload Schema Cache in PostgREST
NOTIFY pgrst, 'reload schema';
