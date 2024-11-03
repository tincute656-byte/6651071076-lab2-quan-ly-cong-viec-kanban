import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import rawTasks from '../data/tasks.json';
import {
  loadFromStorage,
  saveToStorage,
  type Task,
  type TaskInput,
  type TaskStatus,
  type Theme,
} from '../utils';

/* --------------------------- STORAGE KEYS ------------------------------- */

const TASKS_KEY = '6651071076:kanban:tasks';
const FAVORITES_KEY = '6651071076:kanban:favorites';
const THEME_KEY = '6651071076:kanban:theme';

/** Dữ liệu seed từ tasks.json (ép kiểu qua `unknown` — không dùng `any`) */
const SEED_TASKS = rawTasks as unknown as Task[];

/* ------------------------------ REDUCER --------------------------------- */

interface TaskState {
  tasks: Task[];
  favorites: string[];
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: { input: TaskInput } }
  | { type: 'UPDATE_TASK'; payload: { id: string; input: TaskInput } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'MOVE_TASK'; payload: { id: string; status: TaskStatus } }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string } };

function createTaskId(): string {
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload.input,
        id: createTaskId(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, tasks: [newTask, ...state.tasks] };
    }

    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.input } : task,
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
        favorites: state.favorites.filter((id) => id !== action.payload.id),
      };
    }

    case 'MOVE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, status: action.payload.status } : task,
        ),
      };
    }

    case 'TOGGLE_FAVORITE': {
      const { id } = action.payload;
      const isFav = state.favorites.includes(id);
      return {
        ...state,
        favorites: isFav
          ? state.favorites.filter((favId) => favId !== id)
          : [...state.favorites, id],
      };
    }

    default:
      return state;
  }
}

function createInitialState(): TaskState {
  const storedTasks = loadFromStorage<Task[] | null>(TASKS_KEY, null);
  const storedFavorites = loadFromStorage<string[]>(FAVORITES_KEY, []);

  return {
    // Mảng rỗng [] vẫn là dữ liệu hợp lệ (người dùng đã xoá hết task)
    tasks: Array.isArray(storedTasks) ? storedTasks : SEED_TASKS,
    favorites: Array.isArray(storedFavorites) ? storedFavorites : [],
  };
}

/* ------------------------------ CONTEXT --------------------------------- */

export interface TaskContextValue {
  tasks: Task[];
  favorites: string[];
  theme: Theme;
  showFavoritesOnly: boolean;

  isFavorite: (id: string) => boolean;
  getTaskById: (id: string) => Task | undefined;

  toggleFavorite: (id: string) => void;
  toggleTheme: () => void;
  toggleShowFavoritesOnly: () => void;

  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

/* ------------------------------ PROVIDER -------------------------------- */

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, undefined, createInitialState);

  const [theme, setTheme] = useState<Theme>(() =>
    loadFromStorage<Theme>(THEME_KEY, 'light'),
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  /* Persist: tasks */
  useEffect(() => {
    saveToStorage(TASKS_KEY, state.tasks);
  }, [state.tasks]);

  /* Persist: favorites */
  useEffect(() => {
    saveToStorage(FAVORITES_KEY, state.favorites);
  }, [state.favorites]);

  /* Persist + apply: theme */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    saveToStorage(THEME_KEY, theme);
  }, [theme]);

  /* ----------------------------- ACTIONS ------------------------------- */

  const isFavorite = useCallback(
    (id: string): boolean => state.favorites.includes(id),
    [state.favorites],
  );

  const getTaskById = useCallback(
    (id: string): Task | undefined => state.tasks.find((task) => task.id === id),
    [state.tasks],
  );

  const toggleFavorite = useCallback((id: string): void => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id } });
  }, []);

  const toggleTheme = useCallback((): void => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleShowFavoritesOnly = useCallback((): void => {
    setShowFavoritesOnly((current) => !current);
  }, []);

  const addTask = useCallback((input: TaskInput): void => {
    dispatch({ type: 'ADD_TASK', payload: { input } });
  }, []);

  const updateTask = useCallback((id: string, input: TaskInput): void => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, input } });
  }, []);

  const deleteTask = useCallback((id: string): void => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus): void => {
    dispatch({ type: 'MOVE_TASK', payload: { id, status } });
  }, []);

  /* ------------------------------ VALUE -------------------------------- */

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: state.tasks,
      favorites: state.favorites,
      theme,
      showFavoritesOnly,
      isFavorite,
      getTaskById,
      toggleFavorite,
      toggleTheme,
      toggleShowFavoritesOnly,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
    }),
    [
      state.tasks,
      state.favorites,
      theme,
      showFavoritesOnly,
      isFavorite,
      getTaskById,
      toggleFavorite,
      toggleTheme,
      toggleShowFavoritesOnly,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

/* -------------------------------- HOOK ---------------------------------- */

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (context === null) {
    throw new Error('useTasks() phải được dùng bên trong <TaskProvider>.');
  }
  return context;
}