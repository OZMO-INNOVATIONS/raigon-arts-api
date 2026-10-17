import { getDbPool, isDbConnected } from './pool.js';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import {
  User,
  WorkshopSettings,
  FrameSizeMaster,
  CustomerResponseDTO,
  CustomerFilters,
  PaginatedCustomersResult,
  DashboardStats,
  ReportsSummary,
  OrderStatus,
  PaymentStatus,
  CustomerFrameDTO,
  CustomerPhotoRow,
} from '../types/index.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

// Pre-seeded default data for development/fallback mode
const initialAdminHash = bcrypt.hashSync('securePassword123', 10);

const store = {
  users: [
    {
      id: 'e4b17b62-6029-4d64-83b1-3e4b3c076591',
      name: 'Raigon Admin',
      email: 'admin@gmail.com',
      phone: '8137922114',
      password_hash: initialAdminHash,
      role: 'admin' as const,
      is_active: true,
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  workshopSettings: {
    id: 'default',
    business_name: 'Raigon Arts',
    tagline: 'Photo Frames & Custom Framing',
    business_phone: '8137922114',
    business_email: 'orders@raigonarts.com',
    workshop_address: 'Main Workshop, MG Road, Trivandrum',
    gstin: '32AAAAA0000A1Z5',
    business_hours: [
      { day: 'Monday - Saturday', hours: '9:30 AM – 8:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ],
    data_retention_days: 45,
    auto_cleanup_enabled: true,
    retention_target: 'all',
  } as WorkshopSettings,
  frameSizes: [
    { code: 'FS-01', name: '4 × 6 inch', width: 4.0, height: 6.0, unit: 'Inch', category: 'Standard', orders_count: 14, is_active: true, sort_order: 1 },
    { code: 'FS-02', name: '5 × 7 inch', width: 5.0, height: 7.0, unit: 'Inch', category: 'Standard', orders_count: 28, is_active: true, sort_order: 2 },
    { code: 'FS-03', name: '6 × 8 inch', width: 6.0, height: 8.0, unit: 'Inch', category: 'Standard', orders_count: 19, is_active: true, sort_order: 3 },
    { code: 'FS-04', name: '8 × 10 inch', width: 8.0, height: 10.0, unit: 'Inch', category: 'Standard', orders_count: 35, is_active: true, sort_order: 4 },
    { code: 'FS-05', name: '8 × 12 inch (A4)', width: 8.0, height: 12.0, unit: 'Inch', category: 'Standard', orders_count: 48, is_active: true, sort_order: 5 },
    { code: 'FS-06', name: '10 × 12 inch', width: 10.0, height: 12.0, unit: 'Inch', category: 'Standard', orders_count: 22, is_active: true, sort_order: 6 },
    { code: 'FS-07', name: '12 × 15 inch', width: 12.0, height: 15.0, unit: 'Inch', category: 'Standard', orders_count: 18, is_active: true, sort_order: 7 },
    { code: 'FS-08', name: '12 × 18 inch (A3)', width: 12.0, height: 18.0, unit: 'Inch', category: 'Standard', orders_count: 65, is_active: true, sort_order: 8 },
    { code: 'FS-09', name: '16 × 20 inch', width: 16.0, height: 20.0, unit: 'Inch', category: 'Large', orders_count: 30, is_active: true, sort_order: 9 },
    { code: 'FS-10', name: '16 × 24 inch', width: 16.0, height: 24.0, unit: 'Inch', category: 'Large', orders_count: 42, is_active: true, sort_order: 10 },
    { code: 'FS-11', name: '20 × 24 inch', width: 20.0, height: 24.0, unit: 'Inch', category: 'Large', orders_count: 21, is_active: true, sort_order: 11 },
    { code: 'FS-12', name: '20 × 30 inch', width: 20.0, height: 30.0, unit: 'Inch', category: 'Large', orders_count: 17, is_active: true, sort_order: 12 },
    { code: 'FS-13', name: '24 × 36 inch', width: 24.0, height: 36.0, unit: 'Inch', category: 'Canvas/Poster', orders_count: 25, is_active: true, sort_order: 13 },
  ] as FrameSizeMaster[],
  customers: [
    {
      id: 'RA-1001',
      name: 'Ananthu Krishnan',
      city: 'Trivandrum',
      phone: '9876543210',
      altPhone: '9876543211',
      address: 'TC 14/230, Kowdiar, Trivandrum',
      pincode: '695003',
      photoCount: 2,
      photoNames: ['Family_Portrait.jpg', 'Painting.jpg'],
      photoUrls: [
        'https://cdn.raigonart.com/customers/RA-1001/photos/Family_Portrait.webp',
        'https://cdn.raigonart.com/customers/RA-1001/photos/Painting.webp',
      ],
      photoSizeLabels: ['2.4 MB', '3.1 MB'],
      frameSize: '12 × 18 inch',
      frameType: 'Teak Wood Moulding',
      qty: 2,
      total: 4500,
      advance: 2000,
      balance: 2500,
      paymentStatus: 'Partial' as PaymentStatus,
      status: 'inProgress' as OrderStatus,
      orderDate: new Date(Date.now() - 86400000).toISOString(),
      expectedDelivery: new Date(Date.now() + 6 * 86400000).toISOString(),
      frames: [
        {
          id: 'f1837482-9428-4ef3-8419-f01837264819',
          size: '12 × 18 inch',
          unit: 'Inch',
          customWidth: '',
          customHeight: '',
          frameType: 'Teak Wood Moulding',
          material: 'Teak Wood Moulding',
          finish: 'Walnut Brown',
          orientation: 'Landscape (Horizontal)',
          qty: 2,
          notes: 'Anti-glare acrylic sheet required',
          photoName: 'Family_Portrait.jpg',
          photoUrl: 'https://cdn.raigonart.com/customers/RA-1001/frames/frame_1.webp',
        },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'RA-1002',
      name: 'Deepa Varma',
      city: 'Ernakulam',
      phone: '9447112233',
      altPhone: '',
      address: 'Panampilly Nagar, Kochi',
      pincode: '682036',
      photoCount: 1,
      photoNames: ['deepa_art.jpg'],
      photoUrls: ['https://cdn.raigonart.com/customers/RA-1002/photos/deepa_art.webp'],
      photoSizeLabels: ['1.8 MB'],
      frameSize: '8 × 12 inch',
      frameType: 'Minimalist Matte Black',
      qty: 1,
      total: 3200,
      advance: 3200,
      balance: 0,
      paymentStatus: 'Paid' as PaymentStatus,
      status: 'pending' as OrderStatus,
      orderDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 8 * 86400000).toISOString(),
      frames: [
        {
          id: 'f9823741-1122-4ef3-9999-a83726194819',
          size: '8 × 12 inch',
          unit: 'Inch',
          customWidth: '',
          customHeight: '',
          frameType: 'Minimalist Matte Black',
          material: 'Synthetic Moulding',
          finish: 'Matte Black',
          orientation: 'Portrait (Vertical)',
          qty: 1,
          notes: 'Include white mount 1.5 inch',
          photoName: 'deepa_art.jpg',
          photoUrl: 'https://cdn.raigonart.com/customers/RA-1002/frames/deepa_art.webp',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as CustomerResponseDTO[],
  customerPhotos: [
    {
      id: 'p1',
      customer_id: 'RA-1001',
      file_name: 'Family_Portrait.jpg',
      file_url: 'https://cdn.raigonart.com/customers/RA-1001/photos/Family_Portrait.webp',
      thumbnail_url: 'https://cdn.raigonart.com/customers/RA-1001/photos/Family_Portrait_thumb.webp',
      file_size_bytes: 2516582,
      mime_type: 'image/webp',
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p2',
      customer_id: 'RA-1001',
      file_name: 'Painting.jpg',
      file_url: 'https://cdn.raigonart.com/customers/RA-1001/photos/Painting.webp',
      thumbnail_url: 'https://cdn.raigonart.com/customers/RA-1001/photos/Painting_thumb.webp',
      file_size_bytes: 3250585,
      mime_type: 'image/webp',
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p3',
      customer_id: 'RA-1002',
      file_name: 'deepa_art.jpg',
      file_url: 'https://cdn.raigonart.com/customers/RA-1002/photos/deepa_art.webp',
      thumbnail_url: 'https://cdn.raigonart.com/customers/RA-1002/photos/deepa_art_thumb.webp',
      file_size_bytes: 1887436,
      mime_type: 'image/webp',
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
  ] as CustomerPhotoRow[],
  otpTokens: [] as Array<{
    phone: string;
    otp: string;
    resetToken?: string;
    isVerified: boolean;
    expiresAt: Date;
  }>,
  activityLogs: [] as Array<{
    id: string;
    customer_id?: string;
    action: string;
    details: any;
    created_at: string;
  }>,
};

function mapDbCustomerToDTO(
  c: any,
  photos: any[] = [],
  frames: any[] = []
): CustomerResponseDTO {
  const photoNames = (photos || []).map((p: any) => p.file_name);
  const photoUrls = (photos || []).map((p: any) => p.file_url);
  const photoSizeLabels = (photos || []).map((p: any) => {
    const mb = ((p.file_size_bytes || 0) / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  });

  const parsedFrames: CustomerFrameDTO[] = (frames || []).map((f: any) => ({
    id: f.id,
    size: f.size || '',
    unit: f.unit || 'Inch',
    customWidth: f.custom_width || '',
    customHeight: f.custom_height || '',
    frameType: f.frame_type || '',
    material: f.material || '',
    finish: f.finish || '',
    orientation: f.orientation || '',
    qty: f.qty || 1,
    notes: f.notes || '',
    photoName: f.photo_name || undefined,
    photoUrl: f.photo_url || undefined,
  }));

  const total = Number(c.total) || 0;
  const advance = Number(c.advance) || 0;
  const balance = c.balance !== undefined && c.balance !== null ? Number(c.balance) : total - advance;

  return {
    id: c.id,
    name: c.name || '',
    city: c.city || '',
    phone: c.phone || '',
    altPhone: c.alt_phone || '',
    address: c.address || '',
    pincode: c.pincode || '',
    photoCount: photoNames.length,
    photoNames,
    photoUrls,
    photoSizeLabels,
    frameSize: c.frame_size_summary || '',
    frameType: c.frame_type_summary || '',
    qty: c.qty || 1,
    total,
    advance,
    balance,
    paymentStatus: c.payment_status || 'Unpaid',
    status: c.status || 'pending',
    orderDate: c.order_date ? new Date(c.order_date).toISOString() : new Date().toISOString(),
    expectedDelivery: c.expected_delivery ? new Date(c.expected_delivery).toISOString() : null,
    frames: parsedFrames,
    createdAt: c.created_at || new Date().toISOString(),
    updatedAt: c.updated_at || new Date().toISOString(),
  };
}

// ==========================================
// DB SERVICE FACADE
// ==========================================

export const db = {
  // --- AUTH & USERS ---
  users: {
    async findByIdentifier(identifier: string): Promise<User | null> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            'SELECT * FROM users WHERE (email = $1 OR phone = $1) AND is_active = true LIMIT 1',
            [identifier]
          );
          return res.rows[0] || null;
        } catch (e) {
          logger.error('Error finding user in PostgreSQL:', e);
        }
      }

      // Supabase Client alternative
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb
            .from('users')
            .select('*')
            .or(`email.eq.${identifier},phone.eq.${identifier}`)
            .eq('is_active', true)
            .maybeSingle();
          if (data) return data as User;
        } catch (e) {
          logger.error('Error finding user in Supabase:', e);
        }
      }

      // Fallback
      const found = store.users.find(
        (u) => (u.email === identifier || u.phone === identifier) && u.is_active
      );
      return found || null;
    },

    async findById(id: string): Promise<User | null> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
          return res.rows[0] || null;
        } catch (e) {
          logger.error('Error finding user by id:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb.from('users').select('*').eq('id', id).maybeSingle();
          if (data) return data as User;
        } catch (e) {
          logger.error('Error in Supabase findById:', e);
        }
      }

      return store.users.find((u) => u.id === id) || null;
    },

    async updateLastLogin(id: string): Promise<void> {
      const now = new Date().toISOString();
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          await pool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, id]);
          return;
        } catch (e) {
          logger.error('Error updating last login:', e);
        }
      }

      const u = store.users.find((user) => user.id === id);
      if (u) u.last_login_at = now;
    },

    async updatePassword(phone: string, newPasswordHash: string): Promise<boolean> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE phone = $2 RETURNING id',
            [newPasswordHash, phone]
          );
          return (res.rowCount ?? 0) > 0;
        } catch (e) {
          logger.error('Error updating password in DB:', e);
        }
      }

      const u = store.users.find((user) => user.phone === phone);
      if (u) {
        u.password_hash = newPasswordHash;
        u.updated_at = new Date().toISOString();
        return true;
      }
      return false;
    },
  },

  // --- OTP MANAGEMENT ---
  otp: {
    async saveOtp(phone: string, otp: string, expiresAt: Date): Promise<void> {
      store.otpTokens = store.otpTokens.filter((item) => item.phone !== phone);
      store.otpTokens.push({
        phone,
        otp,
        isVerified: false,
        expiresAt,
      });
    },

    async verifyOtp(phone: string, otp: string, resetToken: string): Promise<boolean> {
      const record = store.otpTokens.find(
        (item) => item.phone === phone && item.otp === otp && item.expiresAt > new Date()
      );
      if (!record) return false;

      record.isVerified = true;
      record.resetToken = resetToken;
      return true;
    },

    async validateResetToken(phone: string, resetToken: string): Promise<boolean> {
      const record = store.otpTokens.find(
        (item) =>
          item.phone === phone &&
          item.resetToken === resetToken &&
          item.isVerified &&
          item.expiresAt > new Date()
      );
      return !!record;
    },

    async consumeResetToken(phone: string): Promise<void> {
      store.otpTokens = store.otpTokens.filter((item) => item.phone !== phone);
    },
  },

  // --- WORKSHOP SETTINGS ---
  settings: {
    async getProfile(): Promise<WorkshopSettings> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query('SELECT * FROM workshop_settings WHERE id = $1 LIMIT 1', ['default']);
          if (res.rows[0]) return res.rows[0];
        } catch (e) {
          logger.error('Error fetching workshop settings from DB:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb.from('workshop_settings').select('*').eq('id', 'default').maybeSingle();
          if (data) return data as WorkshopSettings;
        } catch (e) {
          logger.error('Error fetching workshop settings from Supabase:', e);
        }
      }

      return store.workshopSettings;
    },

    async updateProfile(updates: Partial<WorkshopSettings>): Promise<WorkshopSettings> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            `UPDATE workshop_settings SET
              business_name = COALESCE($1, business_name),
              tagline = COALESCE($2, tagline),
              business_phone = COALESCE($3, business_phone),
              business_email = COALESCE($4, business_email),
              workshop_address = COALESCE($5, workshop_address),
              gstin = COALESCE($6, gstin),
              business_hours = COALESCE($7, business_hours),
              data_retention_days = COALESCE($8, data_retention_days),
              auto_cleanup_enabled = COALESCE($9, auto_cleanup_enabled),
              retention_target = COALESCE($10, retention_target),
              updated_at = NOW()
            WHERE id = 'default' RETURNING *`,
            [
              updates.business_name,
              updates.tagline,
              updates.business_phone,
              updates.business_email,
              updates.workshop_address,
              updates.gstin,
              updates.business_hours ? JSON.stringify(updates.business_hours) : null,
              updates.data_retention_days,
              updates.auto_cleanup_enabled,
              updates.retention_target,
            ]
          );
          if (res.rows[0]) return res.rows[0];
        } catch (e) {
          logger.error('Error updating workshop settings:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb
            .from('workshop_settings')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', 'default')
            .select()
            .maybeSingle();
          if (data) return data as WorkshopSettings;
        } catch (e) {
          logger.error('Error updating workshop settings in Supabase:', e);
        }
      }

      store.workshopSettings = {
        ...store.workshopSettings,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return store.workshopSettings;
    },
  },

  // --- FRAME SIZES MASTER CATALOG ---
  frameSizes: {
    async list(activeOnly = false): Promise<FrameSizeMaster[]> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const sql = activeOnly
            ? 'SELECT * FROM frame_sizes_master WHERE is_active = true ORDER BY sort_order ASC, code ASC'
            : 'SELECT * FROM frame_sizes_master ORDER BY sort_order ASC, code ASC';
          const res = await pool.query(sql);
          return res.rows;
        } catch (e) {
          logger.error('Error fetching frame sizes from PostgreSQL:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          let query = sb.from('frame_sizes_master').select('*').order('sort_order', { ascending: true });
          if (activeOnly) query = query.eq('is_active', true);
          const { data } = await query;
          if (data) return data as FrameSizeMaster[];
        } catch (e) {
          logger.error('Error fetching frame sizes from Supabase:', e);
        }
      }

      let list = store.frameSizes;
      if (activeOnly) {
        list = list.filter((s) => s.is_active);
      }
      return list.sort((a, b) => a.sort_order - b.sort_order);
    },

    async findByCode(code: string): Promise<FrameSizeMaster | null> {
      const list = await this.list(false);
      return list.find((s) => s.code.toLowerCase() === code.toLowerCase()) || null;
    },

    async create(size: FrameSizeMaster): Promise<FrameSizeMaster> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            `INSERT INTO frame_sizes_master (code, name, width, height, unit, category, orders_count, is_active, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
              size.code,
              size.name,
              size.width,
              size.height,
              size.unit || 'Inch',
              size.category || 'Standard',
              size.orders_count || 0,
              size.is_active ?? true,
              size.sort_order || store.frameSizes.length + 1,
            ]
          );
          return res.rows[0];
        } catch (e) {
          logger.error('Error inserting frame size in DB:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb.from('frame_sizes_master').insert(size).select().maybeSingle();
          if (data) return data as FrameSizeMaster;
        } catch (e) {
          logger.error('Error creating frame size in Supabase:', e);
        }
      }

      store.frameSizes.push(size);
      return size;
    },

    async update(code: string, updates: Partial<FrameSizeMaster>): Promise<FrameSizeMaster | null> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            `UPDATE frame_sizes_master SET
              name = COALESCE($1, name),
              width = COALESCE($2, width),
              height = COALESCE($3, height),
              unit = COALESCE($4, unit),
              category = COALESCE($5, category),
              is_active = COALESCE($6, is_active),
              sort_order = COALESCE($7, sort_order),
              updated_at = NOW()
            WHERE LOWER(code) = LOWER($8) RETURNING *`,
            [
              updates.name,
              updates.width,
              updates.height,
              updates.unit,
              updates.category,
              updates.is_active,
              updates.sort_order,
              code,
            ]
          );
          return res.rows[0] || null;
        } catch (e) {
          logger.error('Error updating frame size in DB:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data } = await sb
            .from('frame_sizes_master')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .ilike('code', code)
            .select()
            .maybeSingle();
          if (data) return data as FrameSizeMaster;
        } catch (e) {
          logger.error('Error updating frame size in Supabase:', e);
        }
      }

      const idx = store.frameSizes.findIndex((s) => s.code.toLowerCase() === code.toLowerCase());
      if (idx === -1) return null;
      store.frameSizes[idx] = { ...store.frameSizes[idx], ...updates, updated_at: new Date().toISOString() };
      return store.frameSizes[idx];
    },

    async delete(code: string): Promise<boolean> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query('DELETE FROM frame_sizes_master WHERE LOWER(code) = LOWER($1)', [code]);
          return (res.rowCount ?? 0) > 0;
        } catch (e) {
          logger.error('Error deleting frame size from DB:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb.from('frame_sizes_master').delete().ilike('code', code);
        } catch (e) {
          logger.error('Error deleting frame size from Supabase:', e);
        }
      }

      const initialLen = store.frameSizes.length;
      store.frameSizes = store.frameSizes.filter((s) => s.code.toLowerCase() !== code.toLowerCase());
      return store.frameSizes.length < initialLen;
    },
  },

  // --- CUSTOMERS & ORDERS ---
  customers: {
    async getNextId(): Promise<string> {
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          const res = await pool.query(
            `SELECT id FROM customers WHERE id ~ '^RA-[0-9]+$' ORDER BY CAST(SUBSTRING(id FROM 4) AS INTEGER) DESC LIMIT 1`
          );
          if (res.rows[0]) {
            const lastNum = parseInt(res.rows[0].id.replace('RA-', ''), 10);
            return `RA-${lastNum + 1}`;
          }
          return 'RA-1001';
        } catch (e) {
          logger.error('Error querying next ID from DB:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('customers')
            .select('id')
            .order('id', { ascending: false })
            .limit(100);

          if (!error && data && data.length > 0) {
            const ids = data
              .map((c: any) => {
                const match = c.id?.match(/^RA-(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((n: number) => !isNaN(n) && n > 0);
            if (ids.length > 0) {
              const max = Math.max(...ids);
              return `RA-${max + 1}`;
            }
          }
        } catch (e) {
          logger.error('Error querying next ID from Supabase:', e);
        }
      }

      // Memory fallback
      const ids = store.customers
        .map((c) => parseInt(c.id.replace('RA-', ''), 10))
        .filter((n) => !isNaN(n));
      const max = ids.length ? Math.max(...ids) : 1000;
      return `RA-${max + 1}`;
    },

    async findCustomers(filters: CustomerFilters): Promise<PaginatedCustomersResult> {
      const page = Math.max(1, filters.page || 1);
      const limit = Math.max(1, filters.limit || 10);
      const offset = (page - 1) * limit;

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          let query = sb
            .from('customers')
            .select(
              `
              *,
              customer_photos (*),
              customer_frames (*)
            `,
              { count: 'exact' }
            );

          if (filters.search) {
            const q = filters.search.trim();
            query = query.or(`id.ilike.%${q}%,name.ilike.%${q}%,phone.ilike.%${q}%`);
          }
          if (filters.status) {
            query = query.eq('status', filters.status);
          }
          if (filters.paymentStatus) {
            query = query.eq('payment_status', filters.paymentStatus);
          }
          if (filters.startDate) {
            query = query.gte('order_date', filters.startDate.slice(0, 10));
          }
          if (filters.endDate) {
            query = query.lte('order_date', filters.endDate.slice(0, 10));
          }

          const sortCol =
            filters.sortBy === 'orderDate'
              ? 'order_date'
              : filters.sortBy === 'total'
              ? 'total'
              : filters.sortBy === 'name'
              ? 'name'
              : 'created_at';
          query = query.order(sortCol, { ascending: filters.sortOrder === 'asc' });
          query = query.range(offset, offset + limit - 1);

          const { data, count, error } = await query;
          if (!error && data && (data.length > 0 || store.customers.length === 0)) {
            const { data: allCusts } = await sb.from('customers').select('status');
            const statuses = allCusts || [];
            const statusCounts = {
              all: statuses.length,
              pending: statuses.filter((c: any) => c.status === 'pending').length,
              inProgress: statuses.filter((c: any) => c.status === 'inProgress').length,
              completed: statuses.filter((c: any) => c.status === 'completed').length,
              cancelled: statuses.filter((c: any) => c.status === 'cancelled').length,
            };

            const total = count ?? data.length;
            const totalPages = Math.ceil(total / limit) || 1;
            const paginatedData = data.map((c: any) =>
              mapDbCustomerToDTO(c, c.customer_photos, c.customer_frames)
            );

            return {
              success: true,
              meta: {
                total,
                page,
                limit,
                totalPages,
                statusCounts,
              },
              data: paginatedData,
            };
          }
        } catch (e) {
          logger.error('Error fetching customers from Supabase:', e);
        }
      }

      // Filter in-memory or database fallback
      let list = [...store.customers];

      // Search (id, name, phone)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        );
      }

      // Status
      if (filters.status) {
        list = list.filter((c) => c.status === filters.status);
      }

      // Payment Status
      if (filters.paymentStatus) {
        list = list.filter((c) => c.paymentStatus === filters.paymentStatus);
      }

      // Date range
      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        list = list.filter((c) => new Date(c.orderDate).getTime() >= start);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime();
        list = list.filter((c) => new Date(c.orderDate).getTime() <= end);
      }

      // Sort
      const sortBy = filters.sortBy || 'orderDate';
      const sortOrder = filters.sortOrder || 'desc';
      list.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';
        if (typeof valA === 'string' && valA.includes('T')) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      // Calculate status counts from full list (not paginated)
      const allCustomers = store.customers;
      const statusCounts = {
        all: allCustomers.length,
        pending: allCustomers.filter((c) => c.status === 'pending').length,
        inProgress: allCustomers.filter((c) => c.status === 'inProgress').length,
        completed: allCustomers.filter((c) => c.status === 'completed').length,
        cancelled: allCustomers.filter((c) => c.status === 'cancelled').length,
      };

      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginatedData = list.slice(offset, offset + limit);

      return {
        success: true,
        meta: {
          total,
          page,
          limit,
          totalPages,
          statusCounts,
        },
        data: paginatedData,
      };
    },

    async findById(id: string): Promise<CustomerResponseDTO | null> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('customers')
            .select(
              `
              *,
              customer_photos (*),
              customer_frames (*)
            `
            )
            .ilike('id', id)
            .maybeSingle();

          if (!error && data) {
            return mapDbCustomerToDTO(data, data.customer_photos, data.customer_frames);
          }
        } catch (e) {
          logger.error('Error fetching customer by id from Supabase:', e);
        }
      }

      const found = store.customers.find((c) => c.id.toLowerCase() === id.toLowerCase());
      return found || null;
    },

    async createCustomer(
      customerData: any,
      photos: Array<{ name: string; url: string; thumbnailUrl?: string; sizeBytes: number; mimeType: string }>,
      frames: CustomerFrameDTO[]
    ): Promise<CustomerResponseDTO> {
      const id = customerData.id || (await this.getNextId());
      const total = Number(customerData.total) || 0;
      const advance = Number(customerData.advance) || 0;
      const balance = total - advance;

      let paymentStatus: PaymentStatus = 'Unpaid';
      if (advance >= total && total > 0) {
        paymentStatus = 'Paid';
      } else if (advance > 0) {
        paymentStatus = 'Partial';
      }

      // Derive summaries
      const frameSizes = frames.map((f) => f.size).filter(Boolean);
      const frameTypes = frames.map((f) => f.frameType || f.material).filter(Boolean);
      const frameSizeSummary = customerData.frameSize || frameSizes.join(', ') || 'Standard';
      const frameTypeSummary = customerData.frameType || frameTypes.join(', ') || 'Custom Framing';
      const qty = customerData.qty || (frames.length > 0 ? frames.reduce((acc, f) => acc + (f.qty || 1), 0) : 1);

      const photoNames = photos.map((p) => p.name);
      const photoUrls = photos.map((p) => p.url);
      const photoSizeLabels = photos.map((p) => {
        const mb = (p.sizeBytes / (1024 * 1024)).toFixed(1);
        return `${mb} MB`;
      });

      const newCustomer: CustomerResponseDTO = {
        id,
        name: customerData.name || '',
        city: customerData.city || '',
        phone: customerData.phone || '',
        altPhone: customerData.altPhone || '',
        address: customerData.address || '',
        pincode: customerData.pincode || '',
        photoCount: photos.length,
        photoNames,
        photoUrls,
        photoSizeLabels,
        frameSize: frameSizeSummary,
        frameType: frameTypeSummary,
        qty,
        total,
        advance,
        balance,
        paymentStatus: customerData.paymentStatus || paymentStatus,
        status: (customerData.status as OrderStatus) || 'pending',
        orderDate: customerData.orderDate || new Date().toISOString(),
        expectedDelivery: customerData.expectedDelivery || null,
        frames: frames.map((f) => ({
          ...f,
          id: f.id || `frame-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Persist directly to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const insertPayload: any = {
            id,
            name: newCustomer.name,
            city: newCustomer.city,
            phone: newCustomer.phone,
            alt_phone: newCustomer.altPhone,
            address: newCustomer.address,
            pincode: newCustomer.pincode,
            frame_size_summary: newCustomer.frameSize,
            frame_type_summary: newCustomer.frameType,
            qty: newCustomer.qty,
            total: newCustomer.total,
            advance: newCustomer.advance,
            payment_status: newCustomer.paymentStatus,
            status: newCustomer.status,
            order_date: newCustomer.orderDate ? newCustomer.orderDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            expected_delivery: newCustomer.expectedDelivery ? newCustomer.expectedDelivery.slice(0, 10) : null,
            created_by: customerData.createdBy || null,
          };

          const { error: custErr } = await sb.from('customers').insert(insertPayload);
          if (custErr) {
            logger.error('Error inserting customer into Supabase:', custErr);
          } else {
            if (photos.length > 0) {
              const photoInserts = photos.map((p, idx) => ({
                customer_id: id,
                file_name: p.name,
                file_url: p.url,
                thumbnail_url: p.thumbnailUrl || null,
                file_size_bytes: p.sizeBytes,
                mime_type: p.mimeType,
                sort_order: idx,
              }));
              const { error: photoErr } = await sb.from('customer_photos').insert(photoInserts);
              if (photoErr) logger.error('Error inserting customer photos into Supabase:', photoErr);
            }

            if (frames.length > 0) {
              const frameInserts = frames.map((f) => ({
                customer_id: id,
                size: f.size,
                unit: f.unit || 'Inch',
                custom_width: f.customWidth || '',
                custom_height: f.customHeight || '',
                frame_type: f.frameType || '',
                material: f.material || '',
                finish: f.finish || '',
                orientation: f.orientation || '',
                qty: f.qty || 1,
                notes: f.notes || '',
                photo_name: f.photoName || null,
                photo_url: f.photoUrl || null,
              }));
              const { error: frameErr } = await sb.from('customer_frames').insert(frameInserts);
              if (frameErr) logger.error('Error inserting customer frames into Supabase:', frameErr);
            }

            await sb.from('activity_logs').insert({
              customer_id: id,
              user_id: customerData.createdBy || null,
              action: 'CREATED',
              details: { customerId: id, name: newCustomer.name, total: newCustomer.total, advance: newCustomer.advance },
            });
          }
        } catch (e) {
          logger.error('Supabase createCustomer exception:', e);
        }
      }

      // 2. Also keep in-memory cache synchronized
      store.customers.unshift(newCustomer);

      photos.forEach((p, idx) => {
        store.customerPhotos.push({
          id: `p-${Date.now()}-${idx}`,
          customer_id: id,
          file_name: p.name,
          file_url: p.url,
          thumbnail_url: p.thumbnailUrl || null,
          file_size_bytes: p.sizeBytes,
          mime_type: p.mimeType,
          sort_order: idx,
          created_at: new Date().toISOString(),
        });
      });

      return newCustomer;
    },

    async updateCustomer(
      id: string,
      updates: any,
      newPhotos?: Array<{ name: string; url: string; thumbnailUrl?: string; sizeBytes: number; mimeType: string }>,
      newFrames?: CustomerFrameDTO[]
    ): Promise<CustomerResponseDTO | null> {
      const idx = store.customers.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
      const current = idx !== -1 ? store.customers[idx] : null;

      const total = updates.total !== undefined ? Number(updates.total) : current?.total || 0;
      const advance = updates.advance !== undefined ? Number(updates.advance) : current?.advance || 0;
      const balance = total - advance;

      let paymentStatus = updates.paymentStatus || current?.paymentStatus || 'Unpaid';
      if (updates.advance !== undefined || updates.total !== undefined) {
        if (advance >= total && total > 0) paymentStatus = 'Paid';
        else if (advance > 0) paymentStatus = 'Partial';
        else paymentStatus = 'Unpaid';
      }

      let photoNames = current ? [...current.photoNames] : [];
      let photoUrls = current ? [...current.photoUrls] : [];
      let photoSizeLabels = current ? [...current.photoSizeLabels] : [];

      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach((p, pIdx) => {
          photoNames.push(p.name);
          photoUrls.push(p.url);
          const mb = (p.sizeBytes / (1024 * 1024)).toFixed(1);
          photoSizeLabels.push(`${mb} MB`);

          store.customerPhotos.push({
            id: `p-${Date.now()}-${pIdx}`,
            customer_id: id,
            file_name: p.name,
            file_url: p.url,
            thumbnail_url: p.thumbnailUrl || null,
            file_size_bytes: p.sizeBytes,
            mime_type: p.mimeType,
            sort_order: store.customerPhotos.length,
            created_at: new Date().toISOString(),
          });
        });
      }

      // Update Supabase
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const dbUpdates: any = {
            updated_at: new Date().toISOString(),
          };
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.city !== undefined) dbUpdates.city = updates.city;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.altPhone !== undefined) dbUpdates.alt_phone = updates.altPhone;
          if (updates.address !== undefined) dbUpdates.address = updates.address;
          if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode;
          if (updates.total !== undefined) dbUpdates.total = Number(updates.total);
          if (updates.advance !== undefined) dbUpdates.advance = Number(updates.advance);
          if (paymentStatus !== undefined) dbUpdates.payment_status = paymentStatus;
          if (updates.status !== undefined) dbUpdates.status = updates.status;
          if (updates.frameSize !== undefined) dbUpdates.frame_size_summary = updates.frameSize;
          if (updates.frameType !== undefined) dbUpdates.frame_type_summary = updates.frameType;
          if (updates.qty !== undefined) dbUpdates.qty = updates.qty;
          if (updates.orderDate !== undefined) dbUpdates.order_date = updates.orderDate.slice(0, 10);
          if (updates.expectedDelivery !== undefined) {
            dbUpdates.expected_delivery = updates.expectedDelivery ? updates.expectedDelivery.slice(0, 10) : null;
          }

          await sb.from('customers').update(dbUpdates).ilike('id', id);

          if (newPhotos && newPhotos.length > 0) {
            const photoInserts = newPhotos.map((p, pIdx) => ({
              customer_id: id,
              file_name: p.name,
              file_url: p.url,
              thumbnail_url: p.thumbnailUrl || null,
              file_size_bytes: p.sizeBytes,
              mime_type: p.mimeType,
              sort_order: photoNames.length + pIdx,
            }));
            await sb.from('customer_photos').insert(photoInserts);
          }

          if (newFrames && newFrames.length > 0) {
            await sb.from('customer_frames').delete().ilike('customer_id', id);
            const frameInserts = newFrames.map((f) => ({
              customer_id: id,
              size: f.size,
              unit: f.unit || 'Inch',
              custom_width: f.customWidth || '',
              custom_height: f.customHeight || '',
              frame_type: f.frameType || '',
              material: f.material || '',
              finish: f.finish || '',
              orientation: f.orientation || '',
              qty: f.qty || 1,
              notes: f.notes || '',
              photo_name: f.photoName || null,
              photo_url: f.photoUrl || null,
            }));
            await sb.from('customer_frames').insert(frameInserts);
          }

          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'UPDATED',
            details: { updates: Object.keys(updates) },
          });
        } catch (e) {
          logger.error('Supabase updateCustomer exception:', e);
        }
      }

      if (idx === -1) {
        return null;
      }

      const updated: CustomerResponseDTO = {
        ...current!,
        ...updates,
        total,
        advance,
        balance,
        paymentStatus,
        photoCount: photoNames.length,
        photoNames,
        photoUrls,
        photoSizeLabels,
        frames: newFrames && newFrames.length > 0 ? newFrames : current!.frames,
        updatedAt: new Date().toISOString(),
      };

      store.customers[idx] = updated;
      return updated;
    },

    async updateStatus(id: string, status: OrderStatus): Promise<CustomerResponseDTO | null> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb
            .from('customers')
            .update({ status, updated_at: new Date().toISOString() })
            .ilike('id', id);

          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'STATUS_CHANGE',
            details: { status },
          });
        } catch (e) {
          logger.error('Error updating status in Supabase:', e);
        }
      }

      const customer = await this.findById(id);
      if (!customer) return null;
      return this.updateCustomer(id, { status });
    },

    async updatePayment(
      id: string,
      advance: number,
      paymentStatus: PaymentStatus
    ): Promise<CustomerResponseDTO | null> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb
            .from('customers')
            .update({ advance, payment_status: paymentStatus, updated_at: new Date().toISOString() })
            .ilike('id', id);

          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'PAYMENT_RECEIVED',
            details: { advance, paymentStatus },
          });
        } catch (e) {
          logger.error('Error updating payment in Supabase:', e);
        }
      }

      const customer = await this.findById(id);
      if (!customer) return null;
      return this.updateCustomer(id, { advance, paymentStatus });
    },

    async deleteCustomer(id: string): Promise<boolean> {
      let supabaseDeleted = false;
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { error } = await sb.from('customers').delete().ilike('id', id);
          if (!error) {
            supabaseDeleted = true;
            await sb.from('activity_logs').insert({
              customer_id: id,
              action: 'DELETED',
              details: { id },
            });
          }
        } catch (e) {
          logger.error('Error deleting customer from Supabase:', e);
        }
      }

      const initial = store.customers.length;
      store.customers = store.customers.filter((c) => c.id.toLowerCase() !== id.toLowerCase());
      store.customerPhotos = store.customerPhotos.filter(
        (p) => p.customer_id.toLowerCase() !== id.toLowerCase()
      );
      return store.customers.length < initial || supabaseDeleted;
    },

    async deletePhoto(customerId: string, photoId: string): Promise<boolean> {
      let supabaseDeleted = false;
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { error } = await sb
            .from('customer_photos')
            .delete()
            .ilike('customer_id', customerId)
            .or(`id.eq.${photoId},file_name.eq.${photoId}`);
          if (!error) supabaseDeleted = true;
        } catch (e) {
          logger.error('Error deleting photo from Supabase:', e);
        }
      }

      const photoIdx = store.customerPhotos.findIndex(
        (p) =>
          p.customer_id.toLowerCase() === customerId.toLowerCase() &&
          (p.id === photoId || p.file_name === photoId)
      );

      if (photoIdx !== -1) {
        const [removed] = store.customerPhotos.splice(photoIdx, 1);
        const cust = store.customers.find((c) => c.id.toLowerCase() === customerId.toLowerCase());
        if (cust) {
          const nameIdx = cust.photoNames.indexOf(removed.file_name);
          if (nameIdx !== -1) {
            cust.photoNames.splice(nameIdx, 1);
            cust.photoUrls.splice(nameIdx, 1);
            cust.photoSizeLabels.splice(nameIdx, 1);
            cust.photoCount = cust.photoNames.length;
          }
        }
        return true;
      }
      return supabaseDeleted;
    },

    async getPhotos(customerId: string) {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('customer_photos')
            .select('*')
            .ilike('customer_id', customerId)
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            return data;
          }
        } catch (e) {
          logger.error('Error fetching customer photos from Supabase:', e);
        }
      }

      return store.customerPhotos.filter(
        (p) => p.customer_id.toLowerCase() === customerId.toLowerCase()
      );
    },

    async getAllForExport(): Promise<CustomerResponseDTO[]> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('customers')
            .select(
              `
              *,
              customer_photos (*),
              customer_frames (*)
            `
            )
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data.map((c: any) => mapDbCustomerToDTO(c, c.customer_photos, c.customer_frames));
          }
        } catch (e) {
          logger.error('Error exporting customers from Supabase:', e);
        }
      }

      return [...store.customers];
    },
  },

  // --- DASHBOARD ANALYTICS ---
  dashboard: {
    async getStats(): Promise<DashboardStats> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data: customers, error } = await sb
            .from('customers')
            .select('id, name, phone, frame_size_summary, frame_type_summary, qty, total, advance, balance, status, order_date')
            .order('created_at', { ascending: false });

          if (!error && customers && customers.length > 0) {
            const totalCustomers = customers.length;
            const totalRevenue = customers.reduce((acc: number, c: any) => acc + (Number(c.total) || 0), 0);
            const totalAdvance = customers.reduce((acc: number, c: any) => acc + (Number(c.advance) || 0), 0);
            const pendingBalance = totalRevenue - totalAdvance;

            const statusCounts = {
              pending: customers.filter((c: any) => c.status === 'pending').length,
              inProgress: customers.filter((c: any) => c.status === 'inProgress').length,
              completed: customers.filter((c: any) => c.status === 'completed').length,
              cancelled: customers.filter((c: any) => c.status === 'cancelled').length,
            };

            const recentOrders = customers.slice(0, 10).map((c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              frameSize: c.frame_size_summary,
              frameType: c.frame_type_summary,
              qty: c.qty,
              total: Number(c.total) || 0,
              status: c.status,
              orderDate: c.order_date,
            }));

            return {
              totalCustomers,
              totalRevenue,
              totalAdvance,
              pendingBalance,
              statusCounts,
              recentOrders,
            };
          }
        } catch (e) {
          logger.error('Supabase dashboard.getStats exception:', e);
        }
      }

      const customers = store.customers;
      const totalCustomers = customers.length;
      const totalRevenue = customers.reduce((acc, c) => acc + (c.total || 0), 0);
      const totalAdvance = customers.reduce((acc, c) => acc + (c.advance || 0), 0);
      const pendingBalance = totalRevenue - totalAdvance;

      const statusCounts = {
        pending: customers.filter((c) => c.status === 'pending').length,
        inProgress: customers.filter((c) => c.status === 'inProgress').length,
        completed: customers.filter((c) => c.status === 'completed').length,
        cancelled: customers.filter((c) => c.status === 'cancelled').length,
      };

      const recentOrders = customers.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        frameSize: c.frameSize,
        frameType: c.frameType,
        qty: c.qty,
        total: c.total,
        status: c.status,
        orderDate: c.orderDate,
      }));

      return {
        totalCustomers,
        totalRevenue,
        totalAdvance,
        pendingBalance,
        statusCounts,
        recentOrders,
      };
    },
  },

  // --- REPORTS ---
  reports: {
    async getSummary(period: string = 'month1'): Promise<ReportsSummary> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data: customers, error } = await sb
            .from('customers')
            .select('id, total, advance, status, frame_size_summary, qty, order_date');

          if (!error && customers && customers.length > 0) {
            let list = customers;
            if (period === 'month1') {
              const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
              list = customers.filter((c: any) => (c.order_date || '') >= cutoff);
            }

            const orderCount = list.length;
            const grossSales = list.reduce((acc: number, c: any) => acc + (Number(c.total) || 0), 0);
            const advanceCollected = list.reduce((acc: number, c: any) => acc + (Number(c.advance) || 0), 0);
            const outstandingBalance = grossSales - advanceCollected;

            const sizeMap = new Map<string, { count: number; revenue: number }>();
            list.forEach((c: any) => {
              const size = c.frame_size_summary || 'Standard';
              const cur = sizeMap.get(size) || { count: 0, revenue: 0 };
              cur.count += c.qty || 1;
              cur.revenue += Number(c.total) || 0;
              sizeMap.set(size, cur);
            });

            const topSellingSizes = Array.from(sizeMap.entries())
              .map(([size, stat]) => ({
                size,
                count: stat.count,
                revenue: stat.revenue,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            const statusBreakdown = {
              completed: list.filter((c: any) => c.status === 'completed').length,
              inProgress: list.filter((c: any) => c.status === 'inProgress').length,
              pending: list.filter((c: any) => c.status === 'pending').length,
              cancelled: list.filter((c: any) => c.status === 'cancelled').length,
            };

            return {
              period,
              orderCount,
              grossSales,
              advanceCollected,
              outstandingBalance,
              topSellingSizes,
              statusBreakdown,
            };
          }
        } catch (e) {
          logger.error('Supabase reports.getSummary exception:', e);
        }
      }

      const customers = store.customers;
      const orderCount = customers.length;
      const grossSales = customers.reduce((acc, c) => acc + (c.total || 0), 0);
      const advanceCollected = customers.reduce((acc, c) => acc + (c.advance || 0), 0);
      const outstandingBalance = grossSales - advanceCollected;

      // Top selling frame sizes tally
      const sizeMap = new Map<string, { count: number; revenue: number }>();
      customers.forEach((c) => {
        const size = c.frameSize || 'Standard';
        const cur = sizeMap.get(size) || { count: 0, revenue: 0 };
        cur.count += c.qty || 1;
        cur.revenue += c.total || 0;
        sizeMap.set(size, cur);
      });

      const topSellingSizes = Array.from(sizeMap.entries())
        .map(([size, stat]) => ({
          size,
          count: stat.count,
          revenue: stat.revenue,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const statusBreakdown = {
        completed: customers.filter((c) => c.status === 'completed').length,
        inProgress: customers.filter((c) => c.status === 'inProgress').length,
        pending: customers.filter((c) => c.status === 'pending').length,
        cancelled: customers.filter((c) => c.status === 'cancelled').length,
      };

      return {
        period,
        orderCount,
        grossSales,
        advanceCollected,
        outstandingBalance,
        topSellingSizes,
        statusBreakdown,
      };
    },
  },
};
