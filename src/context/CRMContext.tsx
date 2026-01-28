import React, { createContext, useContext, ReactNode } from 'react';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useTheme } from '@/hooks/useTheme';
import { Client, Project, TimeSession, TimerState } from '@/types';

interface CRMContextType {
  // Clients
  clients: Client[];
  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;

  // Projects
  projects: Project[];
  addProject: (projectData: Omit<Project, 'id' | 'createdAt'>) => Project;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByClientId: (clientId: string) => Project[];

  // Time Tracking
  sessions: TimeSession[];
  timerState: TimerState;
  elapsedTime: number;
  startTimer: (projectId: string) => void;
  stopTimer: () => void;
  deleteSession: (id: string) => void;
  getSessionsByProjectId: (projectId: string) => TimeSession[];
  getTotalTimeForProject: (projectId: string) => number;
  getTodayTrackedTime: () => number;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const clientsHook = useClients();
  const projectsHook = useProjects();
  const timeTrackingHook = useTimeTracking();
  const themeHook = useTheme();

  const value: CRMContextType = {
    ...clientsHook,
    ...projectsHook,
    ...timeTrackingHook,
    theme: themeHook.theme,
    toggleTheme: themeHook.toggleTheme,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
