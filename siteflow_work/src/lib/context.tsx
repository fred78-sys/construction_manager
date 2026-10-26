import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  UserRole,
  Project,
  Task,
  DailyLog,
  Expense,
  ProjectDocument,
  ActivityItem,
  TaskStatus,
} from './types';
import {
  DEMO_USERS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_DAILY_LOGS,
  INITIAL_EXPENSES,
  INITIAL_DOCUMENTS,
  INITIAL_ACTIVITY,
} from './seed-data';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  projects: Project[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  expenses: Expense[];
  documents: ProjectDocument[];
  activities: ActivityItem[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | null;
  switchUserRole: (role: UserRole) => void;
  setUser: (user: UserProfile) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (taskId: string, status: TaskStatus, blockReason?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => Promise<string>;
  deleteDailyLog: (id: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<string>;
  deleteExpense: (id: string) => Promise<void>;
  createDocument: (document: Omit<ProjectDocument, 'id' | 'uploadDate'>) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
  resetToSampleData: () => Promise<void>;
  isFirestoreLive: boolean;
  canAccessProject: (projectId: string) => boolean;
  visibleProjects: Project[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PREFIX = 'siteflow_state_';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(INITIAL_DAILY_LOGS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [documents, setDocuments] = useState<ProjectDocument[]>(INITIAL_DOCUMENTS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-riverside-01');
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const projectsSnap = await getDocs(collection(db, 'projects'));
        // Never seed demo records into a Firebase project. Production data is provisioned
        // through authenticated company-admin workflows after the security baseline is deployed.

        const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
          if (!snap.empty) {
            const list: Project[] = [];
            snap.forEach((d) => list.push(d.data() as Project));
            setProjects(list);
          }
        });

        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
          if (!snap.empty) {
            const list: Task[] = [];
            snap.forEach((d) => list.push(d.data() as Task));
            setTasks(list);
          }
        });

        const unsubLogs = onSnapshot(collection(db, 'daily_logs'), (snap) => {
          if (!snap.empty) {
            const list: DailyLog[] = [];
            snap.forEach((d) => list.push(d.data() as DailyLog));
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setDailyLogs(list);
          }
        });

        const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
          if (!snap.empty) {
            const list: Expense[] = [];
            snap.forEach((d) => list.push(d.data() as Expense));
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setExpenses(list);
          }
        });

        const unsubDocs = onSnapshot(collection(db, 'documents'), (snap) => {
          if (!snap.empty) {
            const list: ProjectDocument[] = [];
            snap.forEach((d) => list.push(d.data() as ProjectDocument));
            setDocuments(list);
          }
        });

        const unsubActivities = onSnapshot(collection(db, 'activities'), (snap) => {
          if (!snap.empty) {
            const list: ActivityItem[] = [];
            snap.forEach((d) => list.push(d.data() as ActivityItem));
            setActivities(list);
          }
        });

        setIsFirestoreLive(true);
        setIsInitialized(true);

        return () => {
          unsubProjects();
          unsubTasks();
          unsubLogs();
          unsubExpenses();
          unsubDocs();
          unsubActivities();
        };
      } catch (err) {
        console.warn('Firestore initial sync encountered an issue, using memory cache:', err);
        try {
          const localProj = localStorage.getItem(STORAGE_KEY_PREFIX + 'projects');
          if (localProj) setProjects(JSON.parse(localProj));
          const localTasks = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
          if (localTasks) setTasks(JSON.parse(localTasks));
          const localLogs = localStorage.getItem(STORAGE_KEY_PREFIX + 'logs');
          if (localLogs) setDailyLogs(JSON.parse(localLogs));
          const localExpenses = localStorage.getItem(STORAGE_KEY_PREFIX + 'expenses');
          if (localExpenses) setExpenses(JSON.parse(localExpenses));
          const localDocs = localStorage.getItem(STORAGE_KEY_PREFIX + 'docs');
          if (localDocs) setDocuments(JSON.parse(localDocs));
        } catch (e) {
          // ignore
        }
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'projects', JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'logs', JSON.stringify(dailyLogs));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'expenses', JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'docs', JSON.stringify(documents));
    } catch (e) {
      // ignore quota
    }
  }, [projects, tasks, dailyLogs, expenses, documents, isInitialized]);

  const switchUserRole = useCallback((role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(matched);

    if (role === 'client' || role === 'supervisor') {
      if (matched.assignedProjectIds.length > 0) {
        setSelectedProjectId(matched.assignedProjectIds[0]);
      }
    }
  }, []);

  const setUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'client' && user.assignedProjectIds.length > 0) {
      setSelectedProjectId(user.assignedProjectIds[0]);
    }
  }, []);

  const canAccessProject = useCallback(
    (projectId: string) => {
      if (currentUser.role === 'admin') return true;
      return currentUser.assignedProjectIds.includes(projectId);
    },
    [currentUser]
  );

  const visibleProjects = projects.filter((p) => {
    if (currentUser.role === 'admin') return true;
    return currentUser.assignedProjectIds.includes(p.id);
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || visibleProjects[0] || projects[0] || null;

  const logActivity = async (action: string, details: string, projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const newAct: ActivityItem = {
      id: 'act-' + Date.now(),
      projectId,
      projectName: proj?.name || 'Project',
      timestamp: 'Just now',
      userName: currentUser.name,
      role: currentUser.role,
      action,
      details,
    };
    setActivities((prev) => [newAct, ...prev]);
    try {
      await setDoc(doc(db, 'activities', newAct.id), newAct);
    } catch (e) {
      // fallback
    }
  };

  const createProject = async (data: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'proj-' + Date.now().toString(36);
    const newProject: Project = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    try {
      await setDoc(doc(db, 'projects', id), newProject);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    await logActivity('Created Project', `Added new project "${newProject.name}"`, id);
    return id;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await updateDoc(doc(db, 'projects', id), updates);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
    await logActivity('Updated Project', `Modified project parameters`, id);
  };

  const deleteProject = async (id: string) => {
    const target = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
    if (target) {
      await logActivity('Deleted Project', `Removed project "${target.name}"`, id);
    }
  };

  const createTask = async (data: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'task-' + Date.now().toString(36);
    const proj = projects.find((p) => p.id === data.projectId);
    const newTask: Task = {
      ...data,
      id,
      projectName: proj?.name || 'Project',
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    try {
      await setDoc(doc(db, 'tasks', id), newTask);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    await logActivity('Created Task', `Assigned task "${newTask.title}" (${newTask.trade})`, data.projectId);
    return id;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, blockReason?: string) => {
    const target = tasks.find((t) => t.id === taskId);
    const updates: Partial<Task> = {
      status,
      blockReason: status === 'blocked' ? blockReason : undefined,
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    try {
      await updateDoc(doc(db, 'tasks', taskId), updates);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    if (target) {
      await logActivity(
        'Task Status Changed',
        `Marked "${target.title}" as ${status.replace('_', ' ').toUpperCase()}${blockReason ? `: ${blockReason}` : ''}`,
        target.projectId
      );
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await updateDoc(doc(db, 'tasks', id), updates);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
    if (target) {
      await logActivity('Deleted Task', `Removed task "${target.title}"`, target.projectId);
    }
  };

  const createDailyLog = async (data: Omit<DailyLog, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'log-' + Date.now().toString(36);
    const proj = projects.find((p) => p.id === data.projectId);
    const newLog: DailyLog = {
      ...data,
      id,
      projectName: proj?.name || 'Project',
      createdAt: new Date().toISOString(),
    };

    setDailyLogs((prev) => [newLog, ...prev]);
    try {
      await setDoc(doc(db, 'daily_logs', id), newLog);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    await logActivity(
      'Logged Daily Site Report',
      `Submitted log for ${newLog.date}: ${newLog.crew.total} crew on site. ${newLog.photos?.length || 0} photos attached.`,
      data.projectId
    );
    return id;
  };

  const deleteDailyLog = async (id: string) => {
    setDailyLogs((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteDoc(doc(db, 'daily_logs', id));
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
  };

  const createExpense = async (data: Omit<Expense, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'exp-' + Date.now().toString(36);
    const proj = projects.find((p) => p.id === data.projectId);
    const newExpense: Expense = {
      ...data,
      id,
      projectName: proj?.name || 'Project',
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    try {
      await setDoc(doc(db, 'expenses', id), newExpense);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    await logActivity(
      'Recorded Expense',
      `Logged KES ${data.amount.toLocaleString('en-KE')} for ${data.category.toUpperCase()} (${data.vendor})`,
      data.projectId
    );
    return id;
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
  };

  const createDocument = async (data: Omit<ProjectDocument, 'id' | 'uploadDate'>): Promise<string> => {
    const id = 'doc-' + Date.now().toString(36);
    const proj = projects.find((p) => p.id === data.projectId);
    const newDoc: ProjectDocument = {
      ...data,
      id,
      projectName: proj?.name || 'Project',
      uploadDate: new Date().toISOString().split('T')[0],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    try {
      await setDoc(doc(db, 'documents', id), newDoc);
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }

    await logActivity('Uploaded Document', `Added ${newDoc.category.toUpperCase()}: "${newDoc.title}"`, data.projectId);
    return id;
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (e) {
      console.warn('Firestore write fallback', e);
    }
  };

  const resetToSampleData = async () => {
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setExpenses(INITIAL_EXPENSES);
    setDocuments(INITIAL_DOCUMENTS);
    setActivities(INITIAL_ACTIVITY);

    try {
      for (const proj of INITIAL_PROJECTS) {
        await setDoc(doc(db, 'projects', proj.id), proj);
      }
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', t.id), t);
      }
      for (const l of INITIAL_DAILY_LOGS) {
        await setDoc(doc(db, 'daily_logs', l.id), l);
      }
      for (const e of INITIAL_EXPENSES) {
        await setDoc(doc(db, 'expenses', e.id), e);
      }
      for (const d of INITIAL_DOCUMENTS) {
        await setDoc(doc(db, 'documents', d.id), d);
      }
      for (const a of INITIAL_ACTIVITY) {
        await setDoc(doc(db, 'activities', a.id), a);
      }
    } catch (e) {
      console.warn('Reset sample error', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        projects,
        tasks,
        dailyLogs,
        expenses,
        documents,
        activities,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        switchUserRole,
        setUser,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        createDailyLog,
        deleteDailyLog,
        createExpense,
        deleteExpense,
        createDocument,
        deleteDocument,
        resetToSampleData,
        isFirestoreLive,
        canAccessProject,
        visibleProjects,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
