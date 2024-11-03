import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TaskModal from '../components/TaskModal';
import { useTasks } from '../context/TaskContext';
import {
  PRIORITY_META,
  STATUS_META,
  formatDate,
  type TaskInput,
} from '../utils';

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { getTaskById, isFavorite, toggleFavorite, deleteTask, updateTask } = useTasks();

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const task = id !== undefined ? getTaskById(id) : undefined;

  const closeModal = useCallback((): void => setIsEditOpen(false), []);

  const handleUpdate = useCallback(
    (input: TaskInput): void => {
      if (task) updateTask(task.id, input);
      setIsEditOpen(false);
    },
    [task, updateTask],
  );

  /* ---------------------------- NOT FOUND ---------------------------- */
  if (!task) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-4xl">🔍</p>
        <h1 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
          Không tìm thấy công việc
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Mã công việc <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">{id ?? '—'}</code>{' '}
          không tồn tại hoặc đã bị xoá.
        </p>
        <Link to="/" className="btn-primary mt-6">
          ← Quay lại bảng công việc
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(task.id);
  const status = STATUS_META[task.status];
  const priority = PRIORITY_META[task.priority];

  const handleDelete = (): void => {
    deleteTask(task.id);
    navigate('/');
  };

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
        >
          ← Quay lại bảng công việc
        </Link>

        <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100">
              {task.title}
            </h1>

            <button
              type="button"
              onClick={() => toggleFavorite(task.id)}
              aria-pressed={favorite}
              aria-label={favorite ? 'Bỏ yêu thích công việc' : 'Đánh dấu yêu thích công việc'}
              className={`shrink-0 rounded-lg border p-2 transition ${
                favorite
                  ? 'border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-500/50 dark:bg-amber-500/10'
                  : 'border-slate-200 text-slate-300 hover:border-amber-300 hover:text-amber-400 dark:border-slate-800 dark:text-slate-600'
              }`}
            >
              <StarIcon filled={favorite} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${status.badge}`}>
              {status.label}
            </span>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${priority.badge}`}>
              Ưu tiên: {priority.label}
            </span>
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {task.description || 'Chưa có mô tả cho công việc này.'}
          </p>

          <dl className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Người phụ trách
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {task.assignee || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Hạn chót
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {formatDate(task.dueDate)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Ngày tạo
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {formatDate(task.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Mã công việc
              </dt>
              <dd className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                {task.id}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
            <button type="button" onClick={() => setIsEditOpen(true)} className="btn-primary">
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              Xoá công việc
            </button>
            <Link to="/" className="btn-ghost">
              Quay lại
            </Link>
          </div>
        </article>
      </div>

      <TaskModal
        open={isEditOpen}
        onClose={closeModal}
        onSubmit={handleUpdate}
        initialTask={task}
      />
    </>
  );
}