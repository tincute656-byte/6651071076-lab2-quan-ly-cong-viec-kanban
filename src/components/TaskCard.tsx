import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import {
  PRIORITY_META,
  STATUS_META,
  STATUS_ORDER,
  formatDate,
  type Task,
  type TaskStatus,
} from '../utils';

interface TaskCardProps {
  task: Task;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
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

export default function TaskCard({ task }: TaskCardProps) {
  const { isFavorite, toggleFavorite, deleteTask, moveTask } = useTasks();

  const favorite = isFavorite(task.id);
  const priority = PRIORITY_META[task.priority];
  const status = STATUS_META[task.status];

  const statusIndex = STATUS_ORDER.indexOf(task.status);
  const prevStatus: TaskStatus | null = statusIndex > 0 ? STATUS_ORDER[statusIndex - 1] ?? null : null;
  const nextStatus: TaskStatus | null =
    statusIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[statusIndex + 1] ?? null : null;

  return (
    <article className="group relative flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500">
      {/* Title + Favorite */}
      <div className="flex items-start gap-2">
        <Link
          to={`/item/${task.id}`}
          className="flex-1 text-sm font-semibold leading-snug text-slate-800 transition-colors hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400"
        >
          {task.title}
        </Link>

        <button
          type="button"
          onClick={() => toggleFavorite(task.id)}
          aria-pressed={favorite}
          aria-label={favorite ? 'Bỏ yêu thích công việc' : 'Đánh dấu yêu thích công việc'}
          className={`-mr-1 -mt-1 shrink-0 rounded-md p-1.5 transition ${
            favorite
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400'
          }`}
        >
          <StarIcon filled={favorite} />
        </button>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {task.description}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${priority.badge}`}>
          {priority.label}
        </span>
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${status.badge}`}>
          {status.label}
        </span>
        <span className="ml-auto text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {formatDate(task.dueDate)}
        </span>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
        <span className="truncate text-[11px] text-slate-400 dark:text-slate-500">
          {task.assignee}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={prevStatus === null}
            onClick={() => prevStatus !== null && moveTask(task.id, prevStatus)}
            aria-label="Chuyển sang cột trước"
            className="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-primary-400"
          >
            ←
          </button>
          <button
            type="button"
            disabled={nextStatus === null}
            onClick={() => nextStatus !== null && moveTask(task.id, nextStatus)}
            aria-label="Chuyển sang cột sau"
            className="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-primary-400"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => deleteTask(task.id)}
            aria-label="Xoá công việc"
            className="rounded-md px-1.5 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}