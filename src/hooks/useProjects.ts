import { useLocalStorage } from './useLocalStorage';
import { Project } from '@/types';
import { useCallback } from 'react';

const STORAGE_KEY = 'crm-projects';

export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>(STORAGE_KEY, []);

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, [setProjects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find((project) => project.id === id);
  }, [projects]);

  const getProjectsByClientId = useCallback((clientId: string) => {
    return projects.filter((project) => project.clientId === clientId);
  }, [projects]);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByClientId,
  };
}
