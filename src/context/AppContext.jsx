import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleMachines, sampleTasks } from '../data/sampleData';
import { generateId, getTodayISO } from '../utils/helpers';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [machines, setMachines] = useLocalStorage('lab_machines', sampleMachines);
  const [tasks, setTasks] = useLocalStorage('lab_tasks', sampleTasks);
  const [withdrawals, setWithdrawals] = useLocalStorage('lab_withdrawals', []);

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
        description: 'Máquina registrada no sistema',
        technician: machineData.technician || 'Técnico',
        timestamp: getTodayISO()
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

  // Withdrawal operations
  const addWithdrawal = useCallback((data) => {
    const year = new Date().getFullYear();
    const yearWithdrawals = withdrawals.filter(
      w => w.protocol && w.protocol.startsWith(`LAB-${year}-`)
    );
    const nextNum = yearWithdrawals.length + 1;
    const protocol = `LAB-${year}-${String(nextNum).padStart(3, '0')}`;
    const newWithdrawal = {
      ...data,
      id: generateId(),
      protocol,
      status: 'pending',
      returnedAt: null,
      createdAt: getTodayISO(),
    };
    setWithdrawals(prev => [newWithdrawal, ...prev]);
    return newWithdrawal;
  }, [setWithdrawals, withdrawals]);

  const markWithdrawalReturned = useCallback((id) => {
    setWithdrawals(prev => prev.map(w =>
      w.id === id ? { ...w, status: 'returned', returnedAt: getTodayISO() } : w
    ));
  }, [setWithdrawals]);

  const clearAllHistory = useCallback(() => {
    setMachines(prev => prev.map(machine => ({
      ...machine,
      serviceLog: [],
      updatedAt: getTodayISO(),
    })));
  }, [setMachines]);

  // Statistics
  const getStats = useCallback(() => {
    return {
      totalMachines: machines.length,
      inMaintenance: machines.filter(m => m.status === 'maintenance').length,
      waitingParts: machines.filter(m => m.status === 'waiting_parts').length,
      inTesting: machines.filter(m => m.status === 'testing').length,
      ready: machines.filter(m => m.status === 'ready').length,
      completed: machines.filter(m => m.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
    };
  }, [machines, tasks]);

  const value = {
    machines,
    tasks,
    withdrawals,
    addMachine,
    updateMachine,
    deleteMachine,
    addServiceEntry,
    addMachinePhoto,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearAllHistory,
    getStats,
    addWithdrawal,
    markWithdrawalReturned,
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
