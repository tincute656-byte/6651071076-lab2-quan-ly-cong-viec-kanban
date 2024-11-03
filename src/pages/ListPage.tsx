import { useCallback, useMemo, useState } from 'react';
import Header from '../components/Header';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import { useTasks } from '../context/TaskContext';
import { STATUS_ORDER, searchTasks, type Task, type TaskInput, type TaskStatus } from '../utils';

export default function ListPage() {
  const { tasks, favorites, showFavoritesOnly, addTask } = useTasks();

  const [query, setQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  /* Lọc theo favorites + tìm kiếm */
  const filteredTasks = useMemo<Task[]>(() => {
    const base = showFavoritesOnly
      ? tasks.filter((task) => favorites.includes(task.id))
      : tasks;
    return searchTasks(base, query);
  }, [tasks, favorites, showFavoritesOnly, query]);

  /* Nhóm task theo trạng thái cho 3 cột Kanban */
  const grouped = useMemo<Record<TaskStatus, Task[]>>(() => {
    const result: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    };
    for (const task of filteredTasks) {
      result[task.status].push(task);
    }
    return result;
  }, [filteredTasks]);

  const resetKey = `${query}::${showFavoritesOnly ? 'favorites' : 'all'}`;

  const closeModal = useCallback((): void => setIsModalOpen(false), []);

  const handleCreate = useCallback(
    (input: TaskInput): void => {
      addTask(input);
      setIsModalOpen(false);
    },
    [addTask],
  );

  return (
    <>
      <Header />

      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Bảng công việc Kanban
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {filteredTasks.length} / {tasks.length} công việc
              {showFavoritesOnly && ' · đang lọc theo yêu thích'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tiêu đề, nhãn..."
                aria-label="Tìm kiếm công việc"
                className="field w-full pl-8 sm:w-64"
              />
            </div>

            <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary whitespace-nowrap">
              + Thêm việc
            </button>
          </div>
        </div>

        {/* Empty state toàn cục */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-3xl">🗂️</p>
            <h2 className="mt-3 text-base font-semibold text-slate-700 dark:text-slate-200">
              Không có công việc nào
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {showFavoritesOnly
                ? 'Bạn chưa gắn sao công việc nào. Hãy bỏ bộ lọc yêu thích hoặc thêm việc mới.'
                : 'Thử đổi từ khóa tìm kiếm hoặc thêm một công việc mới để bắt đầu.'}
            </p>
            <button type="button" onClick={() => setIsModalOpen(true)} className="btn-primary mt-5">
              + Thêm công việc đầu tiên
            </button>
          </div>
        ) : (
          /* Kanban board: 3 cột, mỗi cột có infinite scroll riêng */
          <div className="grid gap-4 lg:grid-cols-3">
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={grouped[status]}
                resetKey={resetKey}
              />
            ))}
          </div>
        )}
      </div>

      <TaskModal open={isModalOpen} onClose={closeModal} onSubmit={handleCreate} />
    </>
  );
}