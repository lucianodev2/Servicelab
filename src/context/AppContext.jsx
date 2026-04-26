import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId, getTodayISO } from '../utils/helpers';
import { machinesApi, tasksApi } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [machines, setMachines] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawals, setWithdrawals] = useLocalStorage('lab_withdrawals', []);

  useEffect(() => {
    Promise.all([machinesApi.list(), tasksApi.list()])
      .then(([machineData, taskData]) => {
        setMachines(machineData);
        setTasks(taskData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Machine operations
  const addMachine = useCallback(async (machineData) => {
    const newMachine = await machinesApi.create(machineData);
    try {
      const entry = await machinesApi.addServiceEntry(newMachine.id, {
        type: 'action',
        description: 'Máquina registrada no sistema',
        technician: machineData.technician || 'Técnico',
      });
      newMachine.serviceLog = [entry];
    } catch {}
    setMachines(prev => [newMachine, ...prev]);
    return newMachine;
  }, []);

  const updateMachine = useCallback(async (id, updates) => {
    const machine = machines.find(m => m.id === id);
    if (!machine) return;
    const updated = await machinesApi.update(id, { ...machine, ...updates });
    setMachines(prev => prev.map(m =>
      m.id === id
        ? { ...updated, serviceLog: m.serviceLog, photos: m.photos, tests: m.tests }
        : m
    ));
    return updated;
  }, [machines]);

  const deleteMachine = useCallback(async (id) => {
    await machinesApi.delete(id);
    setMachines(prev => prev.filter(m => m.id !== id));
  }, []);

  const addServiceEntry = useCallback(async (machineId, entry) => {
    const newEntry = await machinesApi.addServiceEntry(machineId, entry);
    setMachines(prev => prev.map(m =>
      m.id === machineId
        ? { ...m, serviceLog: [newEntry, ...(m.serviceLog || [])] }
        : m
    ));
    return newEntry;
  }, []);

  const loadMachineServices = useCallback(async (machineId) => {
    const services = await machinesApi.getServices(machineId);
    setMachines(prev => prev.map(m =>
      m.id === machineId ? { ...m, serviceLog: services } : m
    ));
  }, []);

  const addMachinePhoto = useCallback((machineId, photoData) => {
    const newPhoto = { id: generateId(), ...photoData, timestamp: getTodayISO() };
    setMachines(prev => prev.map(m =>
      m.id === machineId ? { ...m, photos: [...(m.photos || []), newPhoto] } : m
    ));
    return newPhoto;
  }, []);

  // Task operations
  const addTask = useCallback(async (taskData) => {
    const newTask = await tasksApi.create(taskData);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completingNow = updates.status === 'completed' && task.status !== 'completed';
    if (completingNow) {
      const updated = await tasksApi.complete(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    }
    const updated = await tasksApi.update(id, { ...task, ...updates });
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    await tasksApi.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.status !== 'completed') {
      const updated = await tasksApi.complete(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } else {
      const updated = await tasksApi.update(id, { ...task, completed: false });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    }
  }, [tasks]);

  // Withdrawal operations (localStorage only)
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

  const deleteWithdrawal = useCallback((id) => {
    setWithdrawals(prev => prev.filter(w => w.id !== id));
  }, [setWithdrawals]);

  const clearAllHistory = useCallback(() => {
    setMachines(prev => prev.map(machine => ({ ...machine, serviceLog: [] })));
  }, []);

  const getStats = useCallback(() => {
    return {
      totalMachines:     machines.length,
      inMaintenance:     machines.filter(m => m.status === 'maintenance').length,
      waitingParts:      machines.filter(m => m.status === 'waiting_parts').length,
      inTesting:         machines.filter(m => m.status === 'testing').length,
      ready:             machines.filter(m => m.status === 'ready').length,
      completed:         machines.filter(m => m.status === 'completed').length,
      pendingTasks:      tasks.filter(t => t.status === 'pending').length,
      highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
    };
  }, [machines, tasks]);

  const value = {
    machines,
    tasks,
    withdrawals,
    loading,
    error,
    addMachine,
    updateMachine,
    deleteMachine,
    addServiceEntry,
    addMachinePhoto,
    loadMachineServices,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearAllHistory,
    getStats,
    addWithdrawal,
    markWithdrawalReturned,
    deleteWithdrawal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
