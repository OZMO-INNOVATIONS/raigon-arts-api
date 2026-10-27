import { getDbPool, isDbConnected } from './pool.js';
import { getSupabase, isSupabaseConfigured } from '../config/supabase.js';
import { config } from '../config/env.js';
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
    { code: 'FS-01', name: '4 × 6 inch', width: 4.0, height: 6.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 1 },
    { code: 'FS-02', name: '5 × 7 inch', width: 5.0, height: 7.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 2 },
    { code: 'FS-03', name: '6 × 8 inch', width: 6.0, height: 8.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 3 },
    { code: 'FS-04', name: '8 × 10 inch', width: 8.0, height: 10.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 4 },
    { code: 'FS-05', name: '8 × 12 inch (A4)', width: 8.0, height: 12.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 5 },
    { code: 'FS-06', name: '10 × 12 inch', width: 10.0, height: 12.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 6 },
    { code: 'FS-07', name: '12 × 15 inch', width: 12.0, height: 15.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 7 },
    { code: 'FS-08', name: '12 × 18 inch (A3)', width: 12.0, height: 18.0, unit: 'Inch', category: 'Standard', orders_count: 0, is_active: true, sort_order: 8 },
    { code: 'FS-09', name: '16 × 20 inch', width: 16.0, height: 20.0, unit: 'Inch', category: 'Large', orders_count: 0, is_active: true, sort_order: 9 },
    { code: 'FS-10', name: '16 × 24 inch', width: 16.0, height: 24.0, unit: 'Inch', category: 'Large', orders_count: 0, is_active: true, sort_order: 10 },
    { code: 'FS-11', name: '20 × 24 inch', width: 20.0, height: 24.0, unit: 'Inch', category: 'Large', orders_count: 0, is_active: true, sort_order: 11 },
    { code: 'FS-12', name: '20 × 30 inch', width: 20.0, height: 30.0, unit: 'Inch', category: 'Large', orders_count: 0, is_active: true, sort_order: 12 },
    { code: 'FS-13', name: '24 × 36 inch', width: 24.0, height: 36.0, unit: 'Inch', category: 'Canvas/Poster', orders_count: 0, is_active: true, sort_order: 13 },
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
        'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Family_Portrait.webp',
        'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Painting.webp',
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
          photoUrl: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/frames/frame_1.webp',
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
      photoUrls: ['https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1002/photos/deepa_art.webp'],
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
          photoUrl: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1002/frames/deepa_art.webp',
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
      file_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Family_Portrait.webp',
      thumbnail_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Family_Portrait.webp',
      file_size_bytes: 2516582,
      mime_type: 'image/webp',
      sort_order: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p2',
      customer_id: 'RA-1001',
      file_name: 'Painting.jpg',
      file_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Painting.webp',
      thumbnail_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1001/photos/Painting.webp',
      file_size_bytes: 3250585,
      mime_type: 'image/webp',
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p3',
      customer_id: 'RA-1002',
      file_name: 'deepa_art.jpg',
      file_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1002/photos/deepa_art.webp',
      thumbnail_url: 'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/customers/RA-1002/photos/deepa_art.webp',
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

let cachedStats: { data: DashboardStats; expiresAt: number } | null = null;
export function invalidateStatsCache(): void {
  cachedStats = null;
}

function normalizePhotoUrl(url: string | null | undefined): string {
  if (!url) return '';
  let clean = url.trim();
  if (clean.includes('cdn.raigonart.com/')) {
    clean = clean.replace(
      'https://cdn.raigonart.com/',
      'https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/'
    );
  }
  if (clean.includes('localhost:10000/uploads/') || clean.includes('localhost:5001/uploads/')) {
    const publicHost = process.env.RENDER_EXTERNAL_URL || 'https://raigon-arts-api-1a3z.onrender.com';
    clean = clean.replace(/http:\/\/localhost:(?:10000|5001)\/uploads\//, `${publicHost}/uploads/`);
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.startsWith('/uploads/')) {
    const publicHost = process.env.RENDER_EXTERNAL_URL || (config.isDev ? `http://localhost:${config.port}` : 'https://raigon-arts-api-1a3z.onrender.com');
    return `${publicHost}${clean}`;
  }
  if (clean.startsWith('customers/')) {
    return `https://nhqewkbztfmlophtzqmk.supabase.co/storage/v1/object/public/raigon-art-storage/${clean}`;
  }
  return clean;
}

function mapDbCustomerToDTO(
  c: any,
  photos: any[] = [],
  frames: any[] = []
): CustomerResponseDTO {
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
    photoUrl: normalizePhotoUrl(f.photo_url) || undefined,
  }));

  let photoNames = (photos || []).map((p: any) => p.file_name);
  let photoUrls = (photos || []).map((p: any) => normalizePhotoUrl(p.file_url)).filter(Boolean);
  let photoSizeLabels = (photos || []).map((p: any) => {
    const mb = ((p.file_size_bytes || 0) / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  });

  // If customer has no photos in customer_photos, but frames have photos, fallback to frame photos
  if (photoUrls.length === 0 && parsedFrames.length > 0) {
    for (const f of parsedFrames) {
      if (f.photoUrl) {
        photoUrls.push(f.photoUrl);
        photoNames.push(f.photoName || 'frame_photo.webp');
        photoSizeLabels.push('High-Res Photo');
      }
    }
  }

  const total = Number(c.total) || 0;
  const advance = Number(c.advance) || 0;
  const balance = c.balance !== undefined && c.balance !== null ? Number(c.balance) : total - advance;
  const photoCount = Math.max(photoNames.length, photoUrls.length, Number(c.photo_count) || 0);

  return {
    id: c.id,
    name: c.name || '',
    city: c.city || '',
    phone: c.phone || '',
    altPhone: c.alt_phone || '',
    address: c.address || '',
    pincode: c.pincode || '',
    photoCount,
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

function normalizeSizeString(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/x/g, '×')
    .trim();
}

function extractDimensions(s: string | undefined | null): Array<[number, number]> {
  if (!s) return [];
  const norm = normalizeSizeString(s);
  const regex = /(\d+(?:\.\d+)?)\s*(?:[×*]|\s+by\s+)\s*(\d+(?:\.\d+)?)/gi;
  const results: Array<[number, number]> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(norm)) !== null) {
    results.push([Number(match[1]), Number(match[2])]);
  }
  return results;
}

function matchesFrameSize(size: FrameSizeMaster, customer: any): boolean {
  if (customer.status === 'cancelled') return false;

  const w = Number(size.width);
  const h = Number(size.height);
  const sCode = normalizeSizeString(size.code);
  const sName = normalizeSizeString(size.name);

  // 1. Check individual customer frames
  const frames = customer.customer_frames || customer.frames || [];
  for (const f of frames) {
    const cw = Number(f.custom_width ?? f.customWidth);
    const ch = Number(f.custom_height ?? f.customHeight);
    if (cw && ch && ((cw === w && ch === h) || (cw === h && ch === w))) {
      return true;
    }

    const fSize = normalizeSizeString(f.size);
    if (fSize && fSize !== 'standard') {
      if (fSize === sCode || fSize === sName) return true;
      const dims = extractDimensions(fSize);
      for (const [dw, dh] of dims) {
        if ((dw === w && dh === h) || (dw === h && dh === w)) return true;
      }
    }
  }

  // 2. Check customer-level summary
  const summary = customer.frame_size_summary || customer.frameSize;
  if (summary) {
    const sNorm = normalizeSizeString(summary);
    if (sNorm && sNorm !== 'standard') {
      if (sNorm === sCode || sNorm === sName) return true;
      const dims = extractDimensions(sNorm);
      for (const [dw, dh] of dims) {
        if ((dw === w && dh === h) || (dw === h && dh === w)) return true;
      }
    }
  }

  return false;
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseOrderDay(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    const parts = dateVal.slice(0, 10).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
      if (pool) {
        try {
          await pool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, id]);
        } catch (e) {
          logger.error('Error updating last login:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb.from('users').update({ last_login_at: now }).eq('id', id);
        } catch (e) {
          logger.error('Error updating last login in Supabase:', e);
        }
      }

      const u = store.users.find((user) => user.id === id);
      if (u) u.last_login_at = now;
    },

    async updatePassword(phone: string, newPasswordHash: string): Promise<boolean> {
      let updatedInDb = false;

      const pool = getDbPool();
      if (pool) {
        try {
          const res = await pool.query(
            `UPDATE users SET password_hash = $1, updated_at = NOW()
             WHERE phone = $2 OR phone = $3 OR phone = $4 OR email = $2
             RETURNING id`,
            [newPasswordHash, phone, `+91${phone}`, `91${phone}`]
          );
          if ((res.rowCount ?? 0) > 0) {
            updatedInDb = true;
          }
        } catch (e) {
          logger.error('Error updating password in DB pool:', e);
        }
      }

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data: userMatches } = await sb
            .from('users')
            .select('id, phone')
            .or(`phone.eq.${phone},phone.eq.+91${phone},phone.eq.91${phone},email.eq.${phone}`);

          if (userMatches && userMatches.length > 0) {
            const userIds = userMatches.map((u: any) => u.id);
            const { error: sbUpdateErr } = await sb
              .from('users')
              .update({
                password_hash: newPasswordHash,
                updated_at: new Date().toISOString(),
              })
              .in('id', userIds);

            if (!sbUpdateErr) {
              updatedInDb = true;
            } else {
              logger.error('Error updating password in Supabase:', sbUpdateErr);
            }
          }
        } catch (e) {
          logger.error('Supabase updatePassword exception:', e);
        }
      }

      const u = store.users.find(
        (user) =>
          user.phone === phone ||
          user.phone === `+91${phone}` ||
          user.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') ||
          user.email.toLowerCase() === phone.toLowerCase()
      );
      if (u) {
        u.password_hash = newPasswordHash;
        u.updated_at = new Date().toISOString();
        return true;
      }

      return updatedInDb;
    },
  },

  // --- OTP MANAGEMENT ---
  otp: {
    async saveOtp(phone: string, otp: string, expiresAt: Date): Promise<void> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb.from('otp_tokens').delete().eq('phone', phone);
          const { error } = await sb.from('otp_tokens').insert({
            phone,
            otp_code: otp,
            is_verified: false,
            expires_at: expiresAt.toISOString(),
          });
          if (error) logger.error('Error saving OTP to Supabase:', error);
        } catch (e) {
          logger.error('Supabase saveOtp exception:', e);
        }
      }

      store.otpTokens = store.otpTokens.filter((item) => item.phone !== phone);
      store.otpTokens.push({
        phone,
        otp,
        isVerified: false,
        expiresAt,
      });
    },

    async verifyOtp(phone: string, otp: string, resetToken: string): Promise<boolean> {
      let sbVerified = false;
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('otp_tokens')
            .select('*')
            .eq('phone', phone)
            .eq('otp_code', otp)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            await sb
              .from('otp_tokens')
              .update({ is_verified: true, reset_token: resetToken })
              .eq('id', data.id);
            sbVerified = true;
          }
        } catch (e) {
          logger.error('Supabase verifyOtp exception:', e);
        }
      }

      const record = store.otpTokens.find(
        (item) => item.phone === phone && item.otp === otp && item.expiresAt > new Date()
      );
      if (record) {
        record.isVerified = true;
        record.resetToken = resetToken;
        return true;
      }

      return sbVerified;
    },

    async validateResetToken(phone: string, resetToken: string): Promise<boolean> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('otp_tokens')
            .select('id')
            .eq('phone', phone)
            .eq('reset_token', resetToken)
            .eq('is_verified', true)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

          if (!error && data) return true;
        } catch (e) {
          logger.error('Supabase validateResetToken exception:', e);
        }
      }

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
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb.from('otp_tokens').delete().eq('phone', phone);
        } catch (e) {
          logger.error('Supabase consumeResetToken exception:', e);
        }
      }

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
          const { data, error } = await sb
            .from('workshop_settings')
            .upsert({
              id: 'default',
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .select()
            .maybeSingle();
          if (!error && data) return data as WorkshopSettings;
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
    async syncOrdersCount(): Promise<FrameSizeMaster[]> {
      try {
        const pool = getDbPool();
        let activeCustomers: any[] = [];
        if (isSupabaseConfigured()) {
          const sb = getSupabase();
          const { data } = await sb
            .from('customers')
            .select('id, status, frame_size_summary, customer_frames(*)')
            .neq('status', 'cancelled');
          if (data) activeCustomers = data;
        } else if (pool && isDbConnected()) {
          const custRes = await pool.query(`
            SELECT c.id, c.status, c.frame_size_summary,
                   COALESCE(json_agg(f.*) FILTER (WHERE f.id IS NOT NULL), '[]') as customer_frames
            FROM customers c
            LEFT JOIN customer_frames f ON f.customer_id = c.id
            WHERE c.status != 'cancelled'
            GROUP BY c.id, c.status, c.frame_size_summary
          `);
          activeCustomers = custRes.rows;
        } else {
          activeCustomers = store.customers.filter((c) => c.status !== 'cancelled');
        }

        let sizes: FrameSizeMaster[] = store.frameSizes;
        if (pool && isDbConnected()) {
          const res = await pool.query('SELECT * FROM frame_sizes_master ORDER BY sort_order ASC, code ASC');
          if (res.rows && res.rows.length > 0) sizes = res.rows;
        } else if (isSupabaseConfigured()) {
          const sb = getSupabase();
          const { data } = await sb.from('frame_sizes_master').select('*').order('sort_order', { ascending: true });
          if (data && data.length > 0) sizes = data as FrameSizeMaster[];
        }

        for (const size of sizes) {
          const matching = activeCustomers.filter((c) => matchesFrameSize(size, c));
          size.orders_count = matching.length;
        }

        for (const s of sizes) {
          const stored = store.frameSizes.find((item) => item.code.toLowerCase() === s.code.toLowerCase());
          if (stored) stored.orders_count = s.orders_count;
        }

        if (isSupabaseConfigured()) {
          const sb = getSupabase();
          await Promise.all(
            sizes.map((s) =>
              sb.from('frame_sizes_master').update({ orders_count: s.orders_count }).eq('code', s.code)
            )
          ).catch((e) => logger.error('Error updating orders_count in Supabase:', e));
        } else if (pool && isDbConnected()) {
          await Promise.all(
            sizes.map((s) =>
              pool.query('UPDATE frame_sizes_master SET orders_count = $1 WHERE code = $2', [s.orders_count, s.code])
            )
          ).catch((e) => logger.error('Error updating orders_count in PG:', e));
        }

        return sizes;
      } catch (err) {
        logger.error('Error syncing frame size orders count:', err);
        return store.frameSizes;
      }
    },

    async list(activeOnly = false): Promise<FrameSizeMaster[]> {
      const sizes = await db.frameSizes.syncOrdersCount();
      const filtered = activeOnly ? sizes.filter((s) => s.is_active) : sizes;
      return filtered.sort((a, b) => a.sort_order - b.sort_order);
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
      if (pool) {
        try {
          const res = await pool.query(
            `SELECT id FROM customers WHERE id ~* '^RA-[0-9]+$' ORDER BY CAST(SUBSTRING(id FROM 4) AS INTEGER) DESC LIMIT 1`
          );
          if (res.rows[0]) {
            const lastNum = parseInt(res.rows[0].id.replace(/RA-/i, ''), 10);
            return `RA-${lastNum + 1}`;
          }
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
            .limit(10000);

          if (!error && data && data.length > 0) {
            const ids = data
              .map((c: any) => {
                const match = c.id?.match(/^RA-(\d+)$/i);
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
        .map((c) => {
          const match = c.id?.match(/^RA-(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
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
            const endIso = filters.endDate.includes('T')
              ? filters.endDate
              : `${filters.endDate.slice(0, 10)}T23:59:59.999Z`;
            query = query.lte('order_date', endIso);
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
          if (!error && data) {
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
        const endIso = filters.endDate.includes('T')
          ? filters.endDate
          : `${filters.endDate.slice(0, 10)}T23:59:59.999Z`;
        const end = new Date(endIso).getTime();
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
          const isUuid = (val: any) =>
            typeof val === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
          const safeCreatedBy = isUuid(customerData.createdBy) ? customerData.createdBy : null;

          let targetId = id;
          const insertPayload: any = {
            id: targetId,
            name: newCustomer.name || 'Customer',
            city: newCustomer.city || '',
            phone: newCustomer.phone || '0000000000',
            alt_phone: newCustomer.altPhone || '',
            address: newCustomer.address || '',
            pincode: newCustomer.pincode || '',
            frame_size_summary: newCustomer.frameSize || 'Standard',
            frame_type_summary: newCustomer.frameType || 'Wooden Frame',
            qty: newCustomer.qty || 1,
            total: newCustomer.total || 0,
            advance: newCustomer.advance || 0,
            payment_status: newCustomer.paymentStatus || 'Unpaid',
            status: newCustomer.status || 'pending',
            order_date: newCustomer.orderDate ? newCustomer.orderDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
            expected_delivery: newCustomer.expectedDelivery ? newCustomer.expectedDelivery.slice(0, 10) : null,
            created_by: safeCreatedBy,
          };

          let { error: custErr } = await sb.from('customers').insert(insertPayload);

          // If duplicate key conflict occurs, fetch a fresh sequential ID and retry
          if (custErr && custErr.code === '23505') {
            logger.warn(`ID collision on ${targetId}. Fetching fresh ID from Supabase...`);
            targetId = await this.getNextId();
            insertPayload.id = targetId;
            newCustomer.id = targetId;
            const retryRes = await sb.from('customers').insert(insertPayload);
            custErr = retryRes.error;
          }

          if (custErr) {
            logger.error('Error inserting customer into Supabase:', custErr);
          } else {
            if (photos.length > 0) {
              const photoInserts = photos.map((p, idx) => ({
                customer_id: targetId,
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
                customer_id: targetId,
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
              customer_id: targetId,
              user_id: safeCreatedBy,
              action: 'CREATED',
              details: { customerId: targetId, name: newCustomer.name, total: newCustomer.total, advance: newCustomer.advance },
            });
          }
        } catch (e) {
          logger.error('Supabase createCustomer exception:', e);
        }
      }

      // 2. Also keep in-memory cache synchronized
      store.customers.unshift(newCustomer);
      db.frameSizes.syncOrdersCount().catch(() => {});

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

      invalidateStatsCache();
      return newCustomer;
    },

    async updateCustomer(
      id: string,
      updates: any,
      newPhotos?: Array<{ name: string; url: string; thumbnailUrl?: string; sizeBytes: number; mimeType: string }>,
      newFrames?: CustomerFrameDTO[]
    ): Promise<CustomerResponseDTO | null> {
      // 1. Fetch current customer state (checks Supabase, then memory)
      const current = await this.findById(id);
      if (!current) {
        return null;
      }

      const total = updates.total !== undefined ? Number(updates.total) : current.total;
      const advance = updates.advance !== undefined ? Number(updates.advance) : current.advance;
      const balance = total - advance;

      let paymentStatus: PaymentStatus = updates.paymentStatus || current.paymentStatus;
      if (updates.advance !== undefined || updates.total !== undefined) {
        if (!updates.paymentStatus) {
          if (advance >= total && total > 0) paymentStatus = 'Paid';
          else if (advance > 0) paymentStatus = 'Partial';
          else paymentStatus = 'Unpaid';
        }
      }

      let frameSizeSummary = updates.frameSize || current.frameSize;
      let frameTypeSummary = updates.frameType || current.frameType;
      let qty = updates.qty !== undefined ? Number(updates.qty) : current.qty;

      if (newFrames && Array.isArray(newFrames) && newFrames.length > 0) {
        const sizes = newFrames.map((f) => f.size).filter(Boolean);
        const types = newFrames.map((f) => f.frameType || f.material).filter(Boolean);
        if (!updates.frameSize && sizes.length > 0) frameSizeSummary = sizes.join(', ');
        if (!updates.frameType && types.length > 0) frameTypeSummary = types.join(', ');
        if (updates.qty === undefined) qty = newFrames.reduce((acc, f) => acc + (f.qty || 1), 0);
      }

      // 2. Persist update directly to Supabase
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
          dbUpdates.frame_size_summary = frameSizeSummary;
          dbUpdates.frame_type_summary = frameTypeSummary;
          dbUpdates.qty = qty;
          if (updates.orderDate !== undefined) dbUpdates.order_date = updates.orderDate.slice(0, 10);
          if (updates.expectedDelivery !== undefined) {
            dbUpdates.expected_delivery = updates.expectedDelivery ? updates.expectedDelivery.slice(0, 10) : null;
          }

          const { error: updateErr } = await sb
            .from('customers')
            .update(dbUpdates)
            .or(`id.eq.${id},id.ilike.${id}`);

          if (updateErr) {
            logger.error('Error updating customer row in Supabase:', updateErr);
          }

          if (newPhotos && newPhotos.length > 0) {
            const currentPhotoCount = current.photoCount || 0;
            const photoInserts = newPhotos.map((p, pIdx) => ({
              customer_id: id,
              file_name: p.name,
              file_url: p.url,
              thumbnail_url: p.thumbnailUrl || null,
              file_size_bytes: p.sizeBytes,
              mime_type: p.mimeType,
              sort_order: currentPhotoCount + pIdx,
            }));
            const { error: photoErr } = await sb.from('customer_photos').insert(photoInserts);
            if (photoErr) logger.error('Error inserting customer photos into Supabase:', photoErr);
          }

          if (newFrames && Array.isArray(newFrames) && newFrames.length > 0) {
            await sb.from('customer_frames').delete().or(`customer_id.eq.${id},customer_id.ilike.${id}`);
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
            const { error: frameErr } = await sb.from('customer_frames').insert(frameInserts);
            if (frameErr) logger.error('Error inserting customer frames into Supabase:', frameErr);
          }

          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'UPDATED',
            details: { updates: Object.keys(updates) },
          });

          const refreshed = await this.findById(id);
          if (refreshed) {
            const memIdx = store.customers.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
            if (memIdx !== -1) {
              store.customers[memIdx] = refreshed;
            } else {
              store.customers.unshift(refreshed);
            }
            return refreshed;
          }
        } catch (e) {
          logger.error('Supabase updateCustomer exception:', e);
        }
      }

      // 3. Keep in-memory store synchronized
      let photoNames = [...current.photoNames];
      let photoUrls = [...current.photoUrls];
      let photoSizeLabels = [...current.photoSizeLabels];

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

      const updatedDTO: CustomerResponseDTO = {
        ...current,
        ...updates,
        frameSize: frameSizeSummary,
        frameType: frameTypeSummary,
        qty,
        total,
        advance,
        balance,
        paymentStatus,
        status: updates.status || current.status,
        photoCount: photoNames.length,
        photoNames,
        photoUrls,
        photoSizeLabels,
        frames: newFrames && newFrames.length > 0 ? newFrames : current.frames,
        updatedAt: new Date().toISOString(),
      };

      const memIdx = store.customers.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
      if (memIdx !== -1) {
        store.customers[memIdx] = updatedDTO;
      } else {
        store.customers.unshift(updatedDTO);
      }
      db.frameSizes.syncOrdersCount().catch(() => {});
      invalidateStatsCache();

      return updatedDTO;
    },

    async updateStatus(id: string, status: OrderStatus): Promise<CustomerResponseDTO | null> {
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'STATUS_CHANGE',
            details: { status },
          });
        } catch (e) {
          logger.error('Error logging status change in Supabase:', e);
        }
      }

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
          await sb.from('activity_logs').insert({
            customer_id: id,
            action: 'PAYMENT_RECEIVED',
            details: { advance, paymentStatus },
          });
        } catch (e) {
          logger.error('Error logging payment received in Supabase:', e);
        }
      }

      return this.updateCustomer(id, { advance, paymentStatus });
    },

    async deleteCustomer(id: string): Promise<boolean> {
      let wasDeleted = false;
      const cleanId = id.trim();

      // 1. Direct PostgreSQL pool execution if connected
      const pool = getDbPool();
      if (pool && isDbConnected()) {
        try {
          await pool.query('DELETE FROM customer_photos WHERE LOWER(TRIM(customer_id)) = LOWER(TRIM($1))', [cleanId]);
          await pool.query('DELETE FROM customer_frames WHERE LOWER(TRIM(customer_id)) = LOWER(TRIM($1))', [cleanId]);
          await pool.query('DELETE FROM activity_logs WHERE LOWER(TRIM(customer_id)) = LOWER(TRIM($1))', [cleanId]);
          const res = await pool.query('DELETE FROM customers WHERE LOWER(TRIM(id)) = LOWER(TRIM($1))', [cleanId]);
          if ((res.rowCount ?? 0) > 0) {
            wasDeleted = true;
          }
        } catch (e) {
          logger.error('Error deleting customer from PostgreSQL pool:', e);
        }
      }

      // 2. Supabase PostgREST client execution
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          // Clear dependent records first to ensure no foreign key deferrals
          await sb.from('customer_photos').delete().or(`customer_id.eq.${cleanId},customer_id.ilike.${cleanId}`);
          await sb.from('customer_frames').delete().or(`customer_id.eq.${cleanId},customer_id.ilike.${cleanId}`);
          await sb.from('activity_logs').delete().or(`customer_id.eq.${cleanId},customer_id.ilike.${cleanId}`);

          const { error } = await sb.from('customers').delete().or(`id.eq.${cleanId},id.ilike.${cleanId}`);
          if (!error) {
            wasDeleted = true;
            await sb.from('activity_logs').insert({
              customer_id: cleanId,
              action: 'DELETED',
              details: { id: cleanId },
            });
          } else {
            logger.error('Error deleting customer from Supabase:', error);
          }
        } catch (e) {
          logger.error('Error deleting customer from Supabase:', e);
        }
      }

      // 3. Clear from in-memory cache
      const initial = store.customers.length;
      store.customers = store.customers.filter((c) => c.id.toLowerCase() !== cleanId.toLowerCase());
      store.customerPhotos = store.customerPhotos.filter(
        (p) => p.customer_id.toLowerCase() !== cleanId.toLowerCase()
      );
      if (store.customers.length < initial) {
        wasDeleted = true;
      }

      if (wasDeleted) {
        db.frameSizes.syncOrdersCount().catch(() => {});
        invalidateStatsCache();
      }

      return wasDeleted;
    },

    async deletePhoto(customerId: string, photoId: string): Promise<boolean> {
      let supabaseDeleted = false;
      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(photoId);
          let query = sb.from('customer_photos').delete().or(`customer_id.eq.${customerId},customer_id.ilike.${customerId}`);
          if (isUuid) {
            query = query.eq('id', photoId);
          } else {
            query = query.or(`file_name.eq.${photoId},file_url.ilike.%${photoId}%`);
          }
          const { error } = await query;
          if (!error) supabaseDeleted = true;
          else logger.error('Error deleting photo from Supabase:', error);
        } catch (e) {
          logger.error('Error deleting photo from Supabase:', e);
        }
      }

      const photoIdx = store.customerPhotos.findIndex(
        (p) =>
          p.customer_id.toLowerCase() === customerId.toLowerCase() &&
          (p.id === photoId || p.file_name === photoId || p.file_url.includes(photoId))
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
      // 1. High-performance memory cache check (30-second TTL)
      if (cachedStats && cachedStats.expiresAt > Date.now()) {
        return cachedStats.data;
      }

      let result: DashboardStats | null = null;

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

            result = {
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

      if (!result) {
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

        result = {
          totalCustomers,
          totalRevenue,
          totalAdvance,
          pendingBalance,
          statusCounts,
          recentOrders,
        };
      }

      // Cache for 30 seconds
      cachedStats = { data: result, expiresAt: Date.now() + 30000 };
      return result;
    },
  },

  // --- REPORTS ---
  reports: {
    async getSummary(period: string = 'month1'): Promise<ReportsSummary> {
      let rawCustomers: any[] = [];

      if (isSupabaseConfigured()) {
        try {
          const sb = getSupabase();
          const { data, error } = await sb
            .from('customers')
            .select('id, total, advance, status, frame_size_summary, qty, order_date');
          if (!error && data) rawCustomers = data;
        } catch (e) {
          logger.error('Supabase reports.getSummary exception:', e);
        }
      }

      const pool = getDbPool();
      if (rawCustomers.length === 0 && pool && isDbConnected()) {
        try {
          const res = await pool.query(
            'SELECT id, total, advance, status, frame_size_summary, qty, order_date FROM customers'
          );
          if (res.rows) rawCustomers = res.rows;
        } catch (e) {
          logger.error('PG pool reports.getSummary exception:', e);
        }
      }

      if (rawCustomers.length === 0) {
        rawCustomers = store.customers.map((c) => ({
          id: c.id,
          total: c.total,
          advance: c.advance,
          status: c.status,
          frame_size_summary: c.frameSize,
          qty: c.qty,
          order_date: c.orderDate,
        }));
      }

      // Date window setup using timezone-safe local dates
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endExclusive = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      let daysBack = 29;
      let bucketDays = 5;
      if (period === 'month2') {
        daysBack = 59;
        bucketDays = 10;
      }

      const startDate = period === 'allTime'
        ? new Date(2000, 0, 1)
        : new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysBack);

      // Filter customers within the window
      const inWindow = rawCustomers.filter((c: any) => {
        const orderDay = parseOrderDay(c.order_date || c.orderDate);
        if (!orderDay) return false;
        return orderDay >= startDate && orderDay < endExclusive;
      });

      // Filter billable customers (exclude cancelled from revenue / order count)
      const billable = inWindow.filter((c: any) => c.status !== 'cancelled');

      const orderCount = billable.length;
      const grossSales = billable.reduce((acc: number, c: any) => acc + (Number(c.total) || 0), 0);
      const advanceCollected = billable.reduce((acc: number, c: any) => acc + (Number(c.advance) || 0), 0);
      const outstandingBalance = grossSales - advanceCollected;

      const sizeMap = new Map<string, { count: number; revenue: number }>();
      billable.forEach((c: any) => {
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
        completed: inWindow.filter((c: any) => c.status === 'completed').length,
        inProgress: inWindow.filter((c: any) => c.status === 'inProgress').length,
        pending: inWindow.filter((c: any) => c.status === 'pending').length,
        cancelled: inWindow.filter((c: any) => c.status === 'cancelled').length,
      };

      // Trajectory and dailyData computation (cleanly handles missing days as 0)
      const dailyData: Array<{ date: string; revenue: number; orderCount: number }> = [];
      const curDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      while (curDay <= today) {
        const dateStr = formatLocalDate(curDay);
        const dayOrders = billable.filter((c: any) => {
          const d = parseOrderDay(c.order_date || c.orderDate);
          return d !== null && d.getTime() === curDay.getTime();
        });

        dailyData.push({
          date: dateStr,
          revenue: dayOrders.reduce((sum: number, c: any) => sum + (Number(c.total) || 0), 0),
          orderCount: dayOrders.length,
        });

        curDay.setDate(curDay.getDate() + 1);
      }

      const labels: string[] = [];
      const values: number[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatShort = (d: Date) => `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;

      if (period === 'allTime') {
        const curMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let firstMonth = new Date(curMonth);
        billable.forEach((c: any) => {
          const d = parseOrderDay(c.order_date || c.orderDate);
          if (d) {
            const m = new Date(d.getFullYear(), d.getMonth(), 1);
            if (m < firstMonth) firstMonth = m;
          }
        });

        const months: Date[] = [];
        let m = new Date(firstMonth);
        while (m <= curMonth) {
          months.push(new Date(m));
          m.setMonth(m.getMonth() + 1);
        }
        if (months.length > 12) months.splice(0, months.length - 12);
        if (months.length < 2) {
          months.unshift(new Date(curMonth.getFullYear(), curMonth.getMonth() - 1, 1));
        }

        months.forEach((mon) => {
          const suffix = mon.getFullYear() !== now.getFullYear() ? ` '${String(mon.getFullYear() % 100).padStart(2, '0')}` : '';
          labels.push(`${monthNames[mon.getMonth()]}${suffix}`);
          const nextM = new Date(mon.getFullYear(), mon.getMonth() + 1, 1);
          const sum = billable
            .filter((c: any) => {
              const d = parseOrderDay(c.order_date || c.orderDate);
              return d !== null && d >= mon && d < nextM;
            })
            .reduce((s: number, c: any) => s + (Number(c.total) || 0), 0);
          values.push(sum);
        });
      } else {
        const checkpoints: Date[] = [];
        let cp = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        while (cp < today) {
          checkpoints.push(new Date(cp));
          cp.setDate(cp.getDate() + bucketDays);
        }
        checkpoints.push(new Date(today));

        for (let i = 0; i < checkpoints.length; i++) {
          const curCp = checkpoints[i];
          labels.push(formatShort(curCp));

          let from: Date;
          let to: Date;
          if (i === 0) {
            from = curCp;
            to = curCp;
          } else {
            const prevCp = checkpoints[i - 1];
            from = new Date(prevCp.getFullYear(), prevCp.getMonth(), prevCp.getDate() + 1);
            to = curCp;
          }

          const sum = billable
            .filter((c: any) => {
              const d = parseOrderDay(c.order_date || c.orderDate);
              return d !== null && d >= from && d <= to;
            })
            .reduce((s: number, c: any) => s + (Number(c.total) || 0), 0);

          values.push(sum);
        }
      }

      return {
        period,
        orderCount,
        grossSales,
        advanceCollected,
        outstandingBalance,
        topSellingSizes,
        statusBreakdown,
        salesTrajectory: {
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(today),
          labels,
          values,
          dailyData,
        },
      };
    },
  },
};
