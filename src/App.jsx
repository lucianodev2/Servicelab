import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { ServiceHistory } from './pages/ServiceHistory';
import { Tests } from './pages/Tests';
import { ToolWithdrawal } from './pages/ToolWithdrawal';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="machines" element={<Machines />} />
            <Route path="machines/:id" element={<MachineDetailPage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="history" element={<ServiceHistory />} />
            <Route path="tests" element={<Tests />} />
            <Route path="withdrawals" element={<ToolWithdrawal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
