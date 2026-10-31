-- ============================================================================
-- RAIGON ART: Trash & Soft Delete Migration for Customers & Reminders
-- 14-Day Auto-Purge Lifecycle Support
-- ============================================================================

-- 1. Add soft delete columns to customers table
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_customers_is_deleted ON public.customers(is_deleted);
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON public.customers(deleted_at);

-- 2. Add soft delete columns to reminders table
ALTER TABLE public.reminders
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_reminders_is_deleted ON public.reminders(is_deleted);
CREATE INDEX IF NOT EXISTS idx_reminders_deleted_at ON public.reminders(deleted_at);
