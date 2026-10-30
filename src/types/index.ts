export type UserRole = 'admin' | 'staff';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';
export type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled';

export type ReminderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'pending' | 'completed' | 'overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface BusinessHour {
  day: string;
  hours: string;
}

export interface WorkshopSettings {
  id: string;
  business_name: string;
  tagline: string;
  business_phone: string;
  business_email: string;
  workshop_address: string;
  gstin: string;
  business_hours: BusinessHour[];
  data_retention_days?: number;
  auto_cleanup_enabled?: boolean;
  retention_target?: 'all' | 'photos_only';
  created_at?: string;
  updated_at?: string;
}

export interface FrameSizeMaster {
  code: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  category: string;
  orders_count: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerRow {
  id: string;
  name: string;
  city: string;
  phone: string;
  alt_phone: string;
  address: string;
  pincode: string;
  region?: string | null;
  priority?: string | null;
  frame_size_summary: string;
  frame_type_summary: string;
  qty: number;
  total: number;
  advance: number;
  balance: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  order_date: string;
  expected_delivery?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerPhotoRow {
  id: string;
  customer_id: string;
  file_name: string;
  file_url: string;
  thumbnail_url?: string | null;
  file_size_bytes: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
}

export interface CustomerFrameRow {
  id: string;
  customer_id: string;
  size: string;
  unit: string;
  custom_width: string;
  custom_height: string;
  frame_type: string;
  material: string;
  finish: string;
  orientation: string;
  qty: number;
  notes: string;
  photo_name?: string | null;
  photo_url?: string | null;
  created_at: string;
}

export interface ActivityLogRow {
  id: string;
  customer_id?: string | null;
  user_id?: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface CustomerFrameDTO {
  id?: string;
  size: string;
  unit?: string;
  customWidth?: string;
  customHeight?: string;
  frameType?: string;
  material?: string;
  finish?: string;
  orientation?: string;
  qty?: number;
  notes?: string;
  photoName?: string;
  photoUrl?: string;
}

export interface CustomerResponseDTO {
  id: string;
  name: string;
  city: string;
  phone: string;
  altPhone: string;
  address: string;
  pincode: string;
  region?: string;
  priority?: string;
  photoCount: number;
  photoNames: string[];
  photoUrls: string[];
  photoSizeLabels: string[];
  frameSize: string;
  frameType: string;
  qty: number;
  total: number;
  advance: number;
  balance: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  orderDate: string;
  expectedDelivery: string | null;
  frames: CustomerFrameDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  region?: string;
  priority?: string;
  timeFilter?: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCustomersResult {
  success: boolean;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    statusCounts: {
      all: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
  };
  data: CustomerResponseDTO[];
}

export interface DashboardStats {
  totalCustomers: number;
  totalRevenue: number;
  totalAdvance: number;
  pendingBalance: number;
  statusCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  recentOrders: Array<{
    id: string;
    name: string;
    phone: string;
    frameSize: string;
    frameType: string;
    qty: number;
    total: number;
    status: OrderStatus;
    orderDate: string;
  }>;
}

export interface ReportsSummary {
  period: string;
  orderCount: number;
  grossSales: number;
  advanceCollected: number;
  outstandingBalance: number;
  topSellingSizes: Array<{
    size: string;
    count: number;
    revenue: number;
  }>;
  statusBreakdown: {
    completed: number;
    inProgress: number;
    pending: number;
    cancelled?: number;
  };
  salesTrajectory?: {
    startDate: string;
    endDate: string;
    labels: string[];
    values: number[];
    dailyData: Array<{ date: string; revenue: number; orderCount: number }>;
  };
}

export interface ReminderRow {
  id: string;
  title: string;
  customer_name: string;
  customer_id: string;
  order_id: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  assigned_staff: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  completed_by?: string;
  completed_at?: string;
  notification_triggered: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderDTO {
  id: string;
  title: string;
  customerName: string;
  customerId: string;
  orderId?: string;
  description: string;
  reminderDate: string;
  reminderTime: string;
  assignedStaff: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  completedBy?: string;
  completedAt?: string;
  notificationTriggered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFilters {
  filter?: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
  search?: string;
  priority?: ReminderPriority;
  assignedStaff?: string;
  customerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReminderStats {
  all: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
  dueCount: number;
}
