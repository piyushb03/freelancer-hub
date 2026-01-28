export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  createdAt: string;
}

export type ProjectStatus = 'in-progress' | 'completed' | 'postponed';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  hourlyRate: number;
  status: ProjectStatus;
  deadline: string;
  description: string;
  createdAt: string;
}

export interface TimeSession {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
}

export interface TimerState {
  projectId: string | null;
  startTime: string | null;
  isRunning: boolean;
}
