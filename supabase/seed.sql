-- ========================================================================
-- RAIGON ART - SEED DATA
-- Default Admin User, Workshop Settings, Frame Sizes Master, Sample Customers
-- ========================================================================

-- 1. Insert Default Admin User
-- Password: "securePassword123" (bcrypt hash with 10 rounds: $2a$10$wK1B3o8o8WfQ6eX0/39z7.L21m4wSvyf0Wc23sM/C62cR47Vj0QcK)
INSERT INTO users (id, name, email, phone, password_hash, role, is_active)
VALUES (
    'e4b17b62-6029-4d64-83b1-3e4b3c076591',
    'Raigon Admin',
    'admin@gmail.com',
    '8137922114',
    '$2a$10$Q4Q2j/aT1b/1aZJbN06ahe4rD4Uo3E1z8wZJ9Z8lB9yX9Z8lB9yX9',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Workshop Profile / Settings
INSERT INTO workshop_settings (
    id,
    business_name,
    tagline,
    business_phone,
    business_email,
    workshop_address,
    gstin,
    business_hours
)
VALUES (
    'default',
    'Raigon Arts',
    'Photo Frames & Custom Framing',
    '8137922114',
    'orders@raigonarts.com',
    'Main Workshop, MG Road, Trivandrum',
    '32AAAAA0000A1Z5',
    '[{"day": "Monday - Saturday", "hours": "9:30 AM – 8:00 PM"}, {"day": "Sunday", "hours": "Closed"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    tagline = EXCLUDED.tagline,
    business_phone = EXCLUDED.business_phone,
    business_email = EXCLUDED.business_email,
    workshop_address = EXCLUDED.workshop_address,
    gstin = EXCLUDED.gstin,
    business_hours = EXCLUDED.business_hours;

-- 3. Insert Master Frame Sizes Catalog
INSERT INTO frame_sizes_master (code, name, width, height, unit, category, orders_count, is_active, sort_order)
VALUES 
    ('FS-01', '4 × 6 inch', 4.0, 6.0, 'Inch', 'Standard', 14, true, 1),
    ('FS-02', '5 × 7 inch', 5.0, 7.0, 'Inch', 'Standard', 28, true, 2),
    ('FS-03', '6 × 8 inch', 6.0, 8.0, 'Inch', 'Standard', 19, true, 3),
    ('FS-04', '8 × 10 inch', 8.0, 10.0, 'Inch', 'Standard', 35, true, 4),
    ('FS-05', '8 × 12 inch (A4)', 8.0, 12.0, 'Inch', 'Standard', 48, true, 5),
    ('FS-06', '10 × 12 inch', 10.0, 12.0, 'Inch', 'Standard', 22, true, 6),
    ('FS-07', '12 × 15 inch', 12.0, 15.0, 'Inch', 'Standard', 18, true, 7),
    ('FS-08', '12 × 18 inch (A3)', 12.0, 18.0, 'Inch', 'Standard', 65, true, 8),
    ('FS-09', '16 × 20 inch', 16.0, 20.0, 'Inch', 'Large', 30, true, 9),
    ('FS-10', '16 × 24 inch', 16.0, 24.0, 'Inch', 'Large', 42, true, 10),
    ('FS-11', '20 × 24 inch', 20.0, 24.0, 'Inch', 'Large', 21, true, 11),
    ('FS-12', '20 × 30 inch', 20.0, 30.0, 'Inch', 'Large', 17, true, 12),
    ('FS-13', '24 × 36 inch', 24.0, 36.0, 'Inch', 'Canvas/Poster', 25, true, 13)
ON CONFLICT (code) DO NOTHING;

-- 4. Sample Customers
INSERT INTO customers (
    id, name, city, phone, alt_phone, address, pincode,
    frame_size_summary, frame_type_summary, qty,
    total, advance, payment_status, status,
    order_date, expected_delivery, created_by
) VALUES 
(
    'RA-1001',
    'Ananthu Krishnan',
    'Trivandrum',
    '9876543210',
    '9876543211',
    'TC 14/230, Kowdiar, Trivandrum',
    '695003',
    '12 × 18 inch',
    'Teak Wood Moulding',
    2,
    4500.00,
    2000.00,
    'Partial',
    'inProgress',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '6 days',
    'e4b17b62-6029-4d64-83b1-3e4b3c076591'
),
(
    'RA-1002',
    'Deepa Varma',
    'Ernakulam',
    '9447112233',
    '',
    'Panampilly Nagar, Kochi',
    '682036',
    '8 × 12 inch',
    'Minimalist Matte Black',
    1,
    3200.00,
    3200.00,
    'Paid',
    'pending',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '8 days',
    'e4b17b62-6029-4d64-83b1-3e4b3c076591'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Sample Frames for RA-1001
INSERT INTO customer_frames (
    customer_id, size, unit, custom_width, custom_height,
    frame_type, material, finish, orientation, qty, notes, photo_name, photo_url
) VALUES (
    'RA-1001',
    '12 × 18 inch',
    'Inch',
    '',
    '',
    'Teak Wood Moulding',
    'Teak Wood Moulding',
    'Walnut Brown',
    'Landscape (Horizontal)',
    2,
    'Anti-glare acrylic sheet required',
    'Family_Portrait.jpg',
    'https://cdn.raigonart.com/customers/RA-1001/frames/frame_1.webp'
);

-- 6. Sample Frames for RA-1002
INSERT INTO customer_frames (
    customer_id, size, unit, custom_width, custom_height,
    frame_type, material, finish, orientation, qty, notes, photo_name, photo_url
) VALUES (
    'RA-1002',
    '8 × 12 inch',
    'Inch',
    '',
    '',
    'Minimalist Matte Black',
    'Synthetic Moulding',
    'Matte Black',
    'Portrait (Vertical)',
    1,
    'Include white mount 1.5 inch',
    'deepa_art.jpg',
    'https://cdn.raigonart.com/customers/RA-1002/frames/deepa_art.webp'
);
