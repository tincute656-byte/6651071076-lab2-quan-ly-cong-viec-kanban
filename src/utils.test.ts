import { beforeEach, describe, expect, it } from 'vitest';
import {
  formatDate,
  loadFromStorage,
  saveToStorage,
  searchTasks,
  type Task,
} from './utils';

/* ---------------------------- TEST FIXTURES ---------------------------- */

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-test',
    title: 'Kiểm thử đơn vị',
    description: 'Mô tả mặc định',
    status: 'todo',
    priority: 'medium',
    tags: ['test'],
    dueDate: '2024-09-05',
    createdAt: '2024-08-20T08:00:00.000Z',
    assignee: 'Nguyễn Văn A',
    ...overrides,
  };
}

/* -------------------------- 1. formatDate ------------------------------ */

describe('formatDate()', () => {
  it('định dạng ngày ISO thành DD/MM/YYYY', () => {
    expect(formatDate('2024-09-05')).toBe('05/09/2024');
  });

  it('xử lý đúng ngày cuối năm', () => {
    expect(formatDate('2024-12-31T17:00:00.000Z')).toBe('31/12/2024');
  });

  it('trả về "—" với chuỗi rỗng', () => {
    expect(formatDate('')).toBe('—');
  });

  it('trả về "—" với chuỗi không hợp lệ', () => {
    expect(formatDate('khong-phai-ngay')).toBe('—');
  });
});

/* -------------------------- 2. searchTasks ----------------------------- */

describe('searchTasks()', () => {
  const tasks: Task[] = [
    makeTask({ id: 'a', title: 'Thiết kế giao diện Kanban', tags: ['ui', 'design'] }),
    makeTask({ id: 'b', title: 'Viết unit test', assignee: 'Trần Thị B', tags: ['testing'] }),
    makeTask({ id: 'c', title: 'Triển khai Vercel', description: 'Cấu hình build' }),
  ];

  it('trả về nguyên mảng khi từ khóa rỗng', () => {
    expect(searchTasks(tasks, '')).toHaveLength(3);
    expect(searchTasks(tasks, '   ')).toHaveLength(3);
  });

  it('tìm theo tiêu đề, không phân biệt hoa thường', () => {
    const result = searchTasks(tasks, 'KANBAN');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('a');
  });

  it('tìm theo tag', () => {
    const result = searchTasks(tasks, 'testing');
    expect(result.map((t) => t.id)).toEqual(['b']);
  });

  it('tìm theo người phụ trách', () => {
    const result = searchTasks(tasks, 'trần thị b');
    expect(result.map((t) => t.id)).toEqual(['b']);
  });

  it('tìm theo mô tả', () => {
    const result = searchTasks(tasks, 'build');
    expect(result.map((t) => t.id)).toEqual(['c']);
  });

  it('trả về mảng rỗng khi không khớp', () => {
    expect(searchTasks(tasks, 'zzz-khong-ton-tai')).toEqual([]);
  });
});

/* ------------------- 3 & 4. saveToStorage / loadFromStorage ------------ */

describe('localStorage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saveToStorage() ghi được dữ liệu và trả về true', () => {
    expect(saveToStorage('demo-key', { a: 1 })).toBe(true);
    expect(window.localStorage.getItem('demo-key')).toBe('{"a":1}');
  });

  it('loadFromStorage() đọc lại đúng dữ liệu đã ghi (round-trip)', () => {
    const payload = ['task-1', 'task-2'];
    saveToStorage('favorites', payload);
    expect(loadFromStorage<string[]>('favorites', [])).toEqual(payload);
  });

  it('loadFromStorage() trả về fallback khi key chưa tồn tại', () => {
    expect(loadFromStorage<number[]>('missing', [])).toEqual([]);
    expect(loadFromStorage<string>('missing-2', 'mac-dinh')).toBe('mac-dinh');
  });

  it('loadFromStorage() trả về fallback khi JSON bị hỏng', () => {
    window.localStorage.setItem('broken', '{khong-phai-json}');
    expect(loadFromStorage<string>('broken', 'fallback')).toBe('fallback');
  });

  it('loadFromStorage() trả về fallback khi giá trị lưu là null', () => {
    window.localStorage.setItem('null-key', 'null');
    expect(loadFromStorage<boolean>('null-key', false)).toBe(false);
  });

  it('xử lý đúng mảng rỗng (không coi là "chưa có dữ liệu")', () => {
    saveToStorage('empty-list', []);
    expect(loadFromStorage<string[]>('empty-list', ['x'])).toEqual([]);
  });
});