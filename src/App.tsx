import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import { TaskProvider } from './context/TaskContext';
import DetailPage from './pages/DetailPage';
import ListPage from './pages/ListPage';

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-4xl">🧭</p>
      <h1 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
        Trang không tồn tại
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Đường dẫn bạn truy cập không khớp với bất kỳ route nào.
      </p>
      <Link to="/" className="btn-primary mt-6">
        ← Về bảng công việc
      </Link>
    </div>
  );
}

/** Layout dùng chung cho các trang con (ListPage đã tự render Header riêng) */
function DetailLayout() {
  return (
    <>
      <Header />
      <DetailPage />
    </>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-50 transition-colors dark:bg-slate-950">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
            <Routes>
              <Route path="/" element={<ListPage />} />
              <Route path="/item/:id" element={<DetailLayout />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-600">
            Lab 2 · MSSV 6651071076 · React 18 + TypeScript + Tailwind CSS
          </footer>
        </div>
      </BrowserRouter>
    </TaskProvider>
  );
}