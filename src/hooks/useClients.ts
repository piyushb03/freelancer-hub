import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/types';
import { useCallback } from 'react';

const STORAGE_KEY = 'crm-clients';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>(STORAGE_KEY, []);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, [setClients]);

  const updateClient = useCallback((id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, ...updates } : client
      )
    );
  }, [setClients]);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((client) => client.id !== id));
  }, [setClients]);

  const getClientById = useCallback((id: string) => {
    return clients.find((client) => client.id === id);
  }, [clients]);

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
  };
}
