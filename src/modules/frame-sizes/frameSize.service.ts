import { db } from '../../db/index.js';
import { FrameSizeMaster } from '../../types/index.js';

export class FrameSizeService {
  private static formatFrameSize(size: FrameSizeMaster) {
    return {
      code: size.code,
      name: size.name,
      width: Number(size.width),
      height: Number(size.height),
      unit: size.unit,
      category: size.category,
      orders: size.orders_count,
      ordersCount: size.orders_count,
      active: size.is_active,
      isActive: size.is_active,
      sortOrder: size.sort_order,
    };
  }

  static async list(activeOnly = false) {
    const list = await db.frameSizes.list(activeOnly);
    return list.map(this.formatFrameSize);
  }

  static async create(payload: any) {
    const existing = await db.frameSizes.findByCode(payload.code);
    if (existing) {
      throw { status: 409, message: `Frame size with code '${payload.code}' already exists.` };
    }

    const isActive = payload.active !== undefined ? payload.active : (payload.isActive ?? true);

    const size: FrameSizeMaster = {
      code: payload.code.toUpperCase().trim(),
      name: payload.name.trim(),
      width: Number(payload.width),
      height: Number(payload.height),
      unit: payload.unit || 'Inch',
      category: payload.category || 'Standard',
      orders_count: 0,
      is_active: isActive,
      sort_order: payload.sortOrder || 0,
    };

    const created = await db.frameSizes.create(size);
    return this.formatFrameSize(created);
  }

  static async update(code: string, payload: any) {
    const existing = await db.frameSizes.findByCode(code);
    if (!existing) {
      throw { status: 404, message: `Frame size with code '${code}' not found.` };
    }

    const isActive = payload.active !== undefined ? payload.active : payload.isActive;

    const updates: Partial<FrameSizeMaster> = {
      ...(payload.name && { name: payload.name.trim() }),
      ...(payload.width !== undefined && { width: Number(payload.width) }),
      ...(payload.height !== undefined && { height: Number(payload.height) }),
      ...(payload.unit && { unit: payload.unit }),
      ...(payload.category && { category: payload.category }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(payload.sortOrder !== undefined && { sort_order: Number(payload.sortOrder) }),
    };

    const updated = await db.frameSizes.update(code, updates);
    if (!updated) {
      throw { status: 500, message: 'Failed to update frame size.' };
    }
    return this.formatFrameSize(updated);
  }

  static async delete(code: string) {
    const existing = await db.frameSizes.findByCode(code);
    if (!existing) {
      throw { status: 404, message: `Frame size with code '${code}' not found.` };
    }

    await db.frameSizes.delete(code);
    return { message: `Frame size '${code}' deleted successfully.` };
  }
}
