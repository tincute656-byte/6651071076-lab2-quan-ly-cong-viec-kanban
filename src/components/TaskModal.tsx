import { useEffect, useRef, useState } from 'react';
import {
  STATUS_META,
  STATUS_ORDER,
  PRIORITY_META,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from '../utils';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
  /** null/undefined = chế độ Thêm mới */
  initialTask?: Task | null;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  /** Chuỗi tag, phân tách bằng dấu phẩy */
  tags: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  assignee: '',
  tags: '',
};

function toFormState(task: Task | null | undefined): FormState {
  if (!task) return EMPTY_FORM;
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignee: task.assignee,
    tags: task.tags.join(', '),
  };
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function TaskModal({ open, onClose, onSubmit, initialTask = null }: TaskModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialTask));

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  /* Giữ onClose trong ref để effect focus-trap không phụ thuộc vào identity của nó */
  const onCloseRef = useRef<() => void>(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* Đồng bộ form mỗi khi modal mở hoặc đổi task cần sửa */
  useEffect(() => {
    if (open) setForm(toFormState(initialTask));
  }, [open, initialTask]);

  /* Khoá scroll nền khi modal mở */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* ESC để đóng + Focus trap (Tab / Shift+Tab) */
  useEffect(() => {
    if (!open) return;

    const container = dialogRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const getFocusable = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      );
    };

    // Ưu tiên focus vào ô nhập tiêu đề
    (titleInputRef.current ?? getFocusable()[0])?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    if (trimmedTitle === '') return;

    const payload: TaskInput = {
      title: trimmedTitle,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      assignee: form.assignee.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
    };

    onSubmit(payload);
  };

  const isEditing = initialTask !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="w-full max-w-lg rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id="task-modal-title"
            className="text-lg font-bold text-slate-800 dark:text-slate-100"
          >
            {isEditing ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="field-label">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              required
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Ví dụ: Hoàn thiện trang chi tiết"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="field-label">
              Mô tả
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Mô tả ngắn gọn nội dung công việc..."
              className="field resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-status" className="field-label">
                Trạng thái
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(event) => update('status', event.target.value as TaskStatus)}
                className="field"
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="field-label">
                Độ ưu tiên
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={(event) => update('priority', event.target.value as TaskPriority)}
                className="field"
              >
                {(Object.keys(PRIORITY_META) as TaskPriority[]).map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_META[priority].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="field-label">
                Hạn chót
              </label>
              <input
                id="task-due-date"
                type="date"
                value={form.dueDate}
                onChange={(event) => update('dueDate', event.target.value)}
                className="field"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="field-label">
                Người phụ trách
              </label>
              <input
                id="task-assignee"
                type="text"
                value={form.assignee}
                onChange={(event) => update('assignee', event.target.value)}
                placeholder="Nguyễn Văn A"
                className="field"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-tags" className="field-label">
              Nhãn (phân tách bằng dấu phẩy)
            </label>
            <input
              id="task-tags"
              type="text"
              value={form.tags}
              onChange={(event) => update('tags', event.target.value)}
              placeholder="ui, feature, testing"
              className="field"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Huỷ
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Lưu thay đổi' : 'Thêm công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}