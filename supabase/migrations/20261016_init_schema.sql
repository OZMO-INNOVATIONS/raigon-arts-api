-- ========================================================================
-- RAIGON ART - COMPLETE SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATIONS
-- Version: 2.0.0
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & STAFF
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. WORKSHOP SETTINGS / PROFILE
CREATE TABLE IF NOT EXISTS workshop_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    business_name VARCHAR(150) NOT NULL DEFAULT 'Raigon Arts',
    tagline VARCHAR(255) DEFAULT 'Photo Frames & Custom Framing',
    business_phone VARCHAR(20) NOT NULL DEFAULT '8137922114',
    business_email VARCHAR(150) DEFAULT 'orders@raigonarts.com',
    workshop_address TEXT NOT NULL DEFAULT 'Main Workshop, MG Road, Trivandrum',
    gstin VARCHAR(50) DEFAULT '',
    business_hours JSONB DEFAULT '[{"day": "Monday - Saturday", "hours": "9:30 AM – 8:00 PM"}, {"day": "Sunday", "hours": "Closed"}]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FRAME SIZES MASTER CATALOG
CREATE TABLE IF NOT EXISTS frame_sizes_master (
    code VARCHAR(30) PRIMARY KEY, -- e.g. 'FS-01'
    name VARCHAR(100) NOT NULL,   -- e.g. '12 × 18 inch'
    width NUMERIC(6, 2) NOT NULL,
    height NUMERIC(6, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'Inch',
    category VARCHAR(50) NOT NULL DEFAULT 'Standard',
    orders_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS & ORDERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'RA-1001'
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(20) DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    pincode VARCHAR(20) DEFAULT '',
    frame_size_summary VARCHAR(255) NOT NULL DEFAULT '',
    frame_type_summary VARCHAR(255) NOT NULL DEFAULT '',
    qty INTEGER NOT NULL DEFAULT 1,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    advance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance NUMERIC(12, 2) GENERATED ALWAYS AS (total - advance) STORED,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'completed', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_payment ON customers(payment_status);
CREATE INDEX IF NOT EXISTS idx_customers_order_date ON customers(order_date DESC);

-- 5. CUSTOMER PHOTOS (VAULT)
CREATE TABLE IF NOT EXISTS customer_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_photos_customer ON customer_photos(customer_id);

-- 6. CUSTOMER FRAME SPECIFICATIONS
CREATE TABLE IF NOT EXISTS customer_frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    size VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'Inch',
    custom_width VARCHAR(20) DEFAULT '',
    custom_height VARCHAR(20) DEFAULT '',
    frame_type VARCHAR(100) NOT NULL DEFAULT '',
    material VARCHAR(100) NOT NULL DEFAULT '',
    finish VARCHAR(100) NOT NULL DEFAULT '',
    orientation VARCHAR(50) NOT NULL DEFAULT '',
    qty INTEGER NOT NULL DEFAULT 1,
    notes TEXT DEFAULT '',
    photo_name VARCHAR(255),
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_frames_customer ON customer_frames(customer_id);

-- 7. AUDIT & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g. 'CREATED', 'STATUS_CHANGE', 'PAYMENT_RECEIVED'
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. OTP RESET TOKENS (for secure SMS / WhatsApp OTP flow)
CREATE TABLE IF NOT EXISTS otp_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    reset_token VARCHAR(255) UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_tokens(phone);

-- Function & Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workshop_settings_updated_at ON workshop_settings;
CREATE TRIGGER update_workshop_settings_updated_at BEFORE UPDATE ON workshop_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_frame_sizes_updated_at ON frame_sizes_master;
CREATE TRIGGER update_frame_sizes_updated_at BEFORE UPDATE ON frame_sizes_master FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
