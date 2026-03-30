import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleMachines, sampleParts, sampleTasks } from '../data/sampleData';
import { generateId, getTodayISO } from '../utils/helpers';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [machines, setMachines] = useLocalStorage('lab_machines', sampleMachines);
  const [parts, setParts] = useLocalStorage('lab_parts', sampleParts);
  const [tasks, setTasks] = useLocalStorage('lab_tasks', sampleTasks);

  // Machine operations
  const addMachine = useCallback((machineData) => {
    const newMachine = {
      ...machineData,
      id: generateId(),
      createdAt: getTodayISO(),
      updatedAt: getTodayISO(),
      serviceLog: [{
        id: generateId(),
        type: 'action',
        description: 'Machine registered in system',
        partsUsed: [],
        timestamp: getTodayISO(),
        createdBy: 'Technician'
      }]
    };
    setMachines(prev => [newMachine, ...prev]);
    return newMachine;
  }, [setMachines]);

  const updateMachine = useCallback((id, updates) => {
    setMachines(prev => prev.map(machine => 
      machine.id === id 
        ? { ...machine, ...updates, updatedAt: getTodayISO() }
        : machine
    ));
  }, [setMachines]);

  const deleteMachine = useCallback((id) => {
    setMachines(prev => prev.filter(machine => machine.id !== id));
  }, [setMachines]);

  const addServiceEntry = useCallback((machineId, entry) => {
    const newEntry = {
      ...entry,
      id: generateId(),
      timestamp: getTodayISO()
    };
    setMachines(prev => prev.map(machine => 
      machine.id === machineId 
        ? { 
            ...machine, 
            serviceLog: [newEntry, ...machine.serviceLog],
            updatedAt: getTodayISO()
          }
        : machine
    ));
    return newEntry;
  }, [setMachines]);

  const addMachinePhoto = useCallback((machineId, photoData) => {
    const newPhoto = {
      id: generateId(),
      ...photoData,
      timestamp: getTodayISO()
    };
    setMachines(prev => prev.map(machine => 
      machine.id === machineId 
        ? { 
            ...machine, 
            photos: [...machine.photos, newPhoto],
            updatedAt: getTodayISO()
          }
        : machine
    ));
    return newPhoto;
  }, [setMachines]);

  // Parts operations
  const addPart = useCallback((partData) => {
    const newPart = {
      ...partData,
      id: generateId()
    };
    setParts(prev => [newPart, ...prev]);
    return newPart;
  }, [setParts]);

  const updatePart = useCallback((id, updates) => {
    setParts(prev => prev.map(part => 
      part.id === id ? { ...part, ...updates } : part
    ));
  }, [setParts]);

  const deletePart = useCallback((id) => {
    setParts(prev => prev.filter(part => part.id !== id));
  }, [setParts]);

  // Task operations
  const addTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      id: generateId(),
      createdAt: getTodayISO(),
      completedAt: null
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            ...updates,
            completedAt: updates.status === 'completed' && task.status !== 'completed' 
              ? getTodayISO() 
              : updates.status === 'pending' 
                ? null 
                : task.completedAt
          }
        : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const toggleTaskStatus = useCallback((id) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            status: task.status === 'completed' ? 'pending' : 'completed',
            completedAt: task.status === 'completed' ? null : getTodayISO()
          }
        : task
    ));
  }, [setTasks]);

  // Statistics
  const getStats = useCallback(() => {
    const today = new Date().toDateString();
    return {
      totalMachines: machines.length,
      inProgress: machines.filter(m => 
        ['received', 'diagnosis', 'waiting_parts', 'in_repair'].includes(m.status)
      ).length,
      completed: machines.filter(m => m.status === 'completed').length,
      delivered: machines.filter(m => m.status === 'delivered').length,
      urgentMachines: machines.filter(m => m.isUrgent).length,
      pendingParts: parts.filter(p => p.status === 'requested').length,
      completedToday: machines.filter(m => {
        const completedEntry = m.serviceLog.find(e => 
          e.description.toLowerCase().includes('completed') || 
          e.description.toLowerCase().includes('finished')
        );
        return completedEntry && new Date(completedEntry.timestamp).toDateString() === today;
      }).length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
    };
  }, [machines, parts, tasks]);

  const value = {
    machines,
    parts,
    tasks,
    addMachine,
    updateMachine,
    deleteMachine,
    addServiceEntry,
    addMachinePhoto,
    addPart,
    updatePart,
    deletePart,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
