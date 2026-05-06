import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { ServiceHistory } from './pages/ServiceHistory';
import { Tests } from './pages/Tests';
import { ToolWithdrawal } from './pages/ToolWithdrawal';
import { MachineStock } from './pages/MachineStock';
import { Purchases } from './pages/Purchases';
import { InternalRequisition } from './pages/InternalRequisition';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
        style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
      />
      <p className="text-sm font-medium text-gray-500">Conectando ao servidor...</p>
      <p className="text-xs text-gray-400">O servidor pode levar até 1 minuto para iniciar</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const { loading } = useApp();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <LoadingScreen />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="machines" element={<Machines />} />
              <Route path="machines/:id" element={<MachineDetailPage />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="notes" element={<Notes />} />
              <Route path="history" element={<ServiceHistory />} />
              <Route path="tests" element={<Tests />} />
              <Route path="withdrawals" element={<ToolWithdrawal />} />
              <Route path="stock" element={<MachineStock />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="requisitions" element={<InternalRequisition />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
