/* =========================================================================
 * 6651071076 — LAB 2 — Utilities
 * Chứa toàn bộ type dùng chung + ĐÚNG 4 hàm tiện ích bắt buộc:
 *   1. formatDate()
 *   2. searchTasks()
 *   3. loadFromStorage()
 *   4. saveToStorage()
 * ========================================================================= */

/* ----------------------------- DOMAIN TYPES ----------------------------- */

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export type Theme = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  /** Định dạng ISO: YYYY-MM-DD */
  dueDate: string;
  /** Định dạng ISO datetime */
  createdAt: string;
  assignee: string;
}

/** Payload dùng cho form Thêm/Sửa (id & createdAt do hệ thống sinh) */
export type TaskInput = Omit<Task, 'id' | 'createdAt'>;

/* ----------------------------- CONSTANTS -------------------------------- */

export const STATUS_ORDER: readonly TaskStatus[] = ['todo', 'in-progress', 'done'];

export const STATUS_META: Record<TaskStatus, { label: string; dot: string; badge: string }> = {
  todo: {
    label: 'Cần làm',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  'in-progress': {
    label: 'Đang làm',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  done: {
    label: 'Hoàn thành',
    dot: 'bg-primary-600',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; badge: string }> = {
  low: {
    label: 'Thấp',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  medium: {
    label: 'Trung bình',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  high: {
    label: 'Cao',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
};

/* ============================ UTILITY #1 ================================ */

/**
 * Định dạng một chuỗi ngày (ISO) thành `DD/MM/YYYY`.
 * Dùng getUTC* để kết quả luôn tất định (deterministic) trong unit test.
 * Trả về '—' nếu chuỗi không hợp lệ.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '—';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

/* ============================ UTILITY #2 ================================ */

/**
 * Tìm kiếm công việc theo từ khóa (không phân biệt hoa/thường).
 * Khớp trên: title, description, assignee và từng tag.
 * Từ khóa rỗng -> trả về nguyên mảng gốc.
 */
export function searchTasks(tasks: Task[], keyword: string): Task[] {
  const needle = keyword.trim().toLowerCase();
  if (needle === '') return tasks;

  return tasks.filter((task) => {
    const haystack = [task.title, task.description, task.assignee, ...task.tags].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
}

/* ============================ UTILITY #3 ================================ */

/**
 * Đọc dữ liệu JSON từ localStorage một cách an toàn.
 * Trả về `fallback` nếu: không có window, key chưa tồn tại, JSON hỏng,
 * hoặc giá trị lưu là `null`.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;

  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    if (raw === null || raw === undefined) return fallback;
    return raw as T;
  } catch {
    return fallback;
  }
}

/* ============================ UTILITY #4 ================================ */

/**
 * Ghi dữ liệu vào localStorage dưới dạng JSON.
 * Bọc try/catch để không làm sập app khi gặp lỗi (quota, private mode...).
 * Trả về `true` nếu ghi thành công.
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}