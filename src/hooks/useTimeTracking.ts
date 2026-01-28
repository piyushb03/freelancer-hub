import { useLocalStorage } from './useLocalStorage';
import { TimeSession, TimerState } from '@/types';
import { useCallback, useEffect, useState } from 'react';

const SESSIONS_KEY = 'crm-time-sessions';
const TIMER_KEY = 'crm-timer-state';

export function useTimeTracking() {
  const [sessions, setSessions] = useLocalStorage<TimeSession[]>(SESSIONS_KEY, []);
  const [timerState, setTimerState] = useLocalStorage<TimerState>(TIMER_KEY, {
    projectId: null,
    startTime: null,
    isRunning: false,
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate elapsed time for running timer
  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      const calculateElapsed = () => {
        const start = new Date(timerState.startTime!).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      };

      calculateElapsed();
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [timerState.isRunning, timerState.startTime]);

  const startTimer = useCallback((projectId: string) => {
    // Stop any existing timer first
    if (timerState.isRunning && timerState.projectId && timerState.startTime) {
      const endTime = new Date().toISOString();
      const start = new Date(timerState.startTime).getTime();
      const end = new Date(endTime).getTime();
      const duration = Math.floor((end - start) / 1000);

      const session: TimeSession = {
        id: crypto.randomUUID(),
        projectId: timerState.projectId,
        startTime: timerState.startTime,
        endTime,
        duration,
      };
      setSessions((prev) => [...prev, session]);
    }

    setTimerState({
      projectId,
      startTime: new Date().toISOString(),
      isRunning: true,
    });
  }, [timerState, setTimerState, setSessions]);

  const stopTimer = useCallback(() => {
    if (!timerState.isRunning || !timerState.projectId || !timerState.startTime) {
      return;
    }

    const endTime = new Date().toISOString();
    const start = new Date(timerState.startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.floor((end - start) / 1000);

    const session: TimeSession = {
      id: crypto.randomUUID(),
      projectId: timerState.projectId,
      startTime: timerState.startTime,
      endTime,
      duration,
    };

    setSessions((prev) => [...prev, session]);
    setTimerState({
      projectId: null,
      startTime: null,
      isRunning: false,
    });
  }, [timerState, setTimerState, setSessions]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  }, [setSessions]);

  const getSessionsByProjectId = useCallback((projectId: string) => {
    return sessions.filter((session) => session.projectId === projectId);
  }, [sessions]);

  const getTotalTimeForProject = useCallback((projectId: string) => {
    const projectSessions = getSessionsByProjectId(projectId);
    let total = projectSessions.reduce((acc, session) => acc + session.duration, 0);
    
    // Add current running time if timer is for this project
    if (timerState.isRunning && timerState.projectId === projectId) {
      total += elapsedTime;
    }
    
    return total;
  }, [getSessionsByProjectId, timerState, elapsedTime]);

  const getTodayTrackedTime = useCallback(() => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (session) => new Date(session.startTime).toDateString() === today
    );
    let total = todaySessions.reduce((acc, session) => acc + session.duration, 0);
    
    // Add current running time if timer started today
    if (timerState.isRunning && timerState.startTime) {
      const timerStartDate = new Date(timerState.startTime).toDateString();
      if (timerStartDate === today) {
        total += elapsedTime;
      }
    }
    
    return total;
  }, [sessions, timerState, elapsedTime]);

  return {
    sessions,
    timerState,
    elapsedTime,
    startTimer,
    stopTimer,
    deleteSession,
    getSessionsByProjectId,
    getTotalTimeForProject,
    getTodayTrackedTime,
  };
}
