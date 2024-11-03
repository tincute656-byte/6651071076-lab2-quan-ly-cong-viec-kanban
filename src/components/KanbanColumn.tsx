import { useEffect, useRef, useState } from 'react';
import TaskCard from './TaskCard';
import { STATUS_META, type Task, type TaskStatus } from '../utils';

/** Số task hiển thị mỗi lần "tải thêm" (infinite scroll) */
const PAGE_SIZE = 4;

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  /** Đổi giá trị này để reset infinite scroll (khi search / lọc favorites) */
  resetKey: string;
}

export default function KanbanColumn({ status, tasks, resetKey }: KanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const meta = STATUS_META[status];
  const hasMore = visibleCount < tasks.length;
  const visibleTasks = tasks.slice(0, visibleCount);

  /* Reset khi bộ lọc / từ khóa tìm kiếm thay đổi */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [resetKey]);

  /* Infinite scroll: quan sát sentinel ở cuối cột.
   * Dependency `visibleCount` khiến observer được tạo lại sau mỗi lần tải,
   * nhờ đó nếu sentinel vẫn còn trong viewport thì sẽ tự động tải tiếp. */
  useEffect(() => {
    if (visibleCount >= tasks.length) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, tasks.length));
        }
      },
      { rootMargin: '160px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, tasks.length]);

  return (
    <section
      aria-label={`Cột ${meta.label}`}
      className="flex min-h-[260px] flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
    >
      {/* Column header */}
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{meta.label}</h2>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
          {tasks.length}
        </span>
      </header>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5">
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            Chưa có công việc nào
          </p>
        )}

        {/* Sentinel cho IntersectionObserver */}
        {hasMore && (
          <div
            ref={sentinelRef}
            aria-hidden="true"
            className="flex h-9 items-center justify-center"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
          </div>
        )}
      </div>
    </section>
  );
}