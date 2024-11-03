import { Link, useLocation } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
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
    >
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

export default function Header() {
  const { theme, toggleTheme, showFavoritesOnly, toggleShowFavoritesOnly, favorites } = useTasks();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        {/* Logo → luôn dùng <Link>, KHÔNG dùng <a href> */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-sm font-bold text-slate-800 transition-colors hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-base font-extrabold text-white shadow-sm shadow-primary-600/30">
            K
          </span>
          <span className="hidden leading-tight sm:block">
            Kanban Lab
            <span className="block text-[11px] font-medium text-slate-400">MSSV 6651071076</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className={`hidden rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:block ${
              location.pathname === '/'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            Bảng công việc
          </Link>

          {/* Nút lọc Yêu thích */}
          <button
            type="button"
            onClick={toggleShowFavoritesOnly}
            aria-pressed={showFavoritesOnly}
            aria-label="Chỉ hiển thị công việc yêu thích"
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              showFavoritesOnly
                ? 'border-amber-400 bg-amber-50 text-amber-600 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-500/60 dark:hover:text-amber-300'
            }`}
          >
            <StarIcon filled={showFavoritesOnly} />
            <span className="hidden sm:inline">Yêu thích</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {favorites.length}
            </span>
          </button>

          {/* Toggle Dark/Light mode */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-primary-400 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:text-primary-400"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}