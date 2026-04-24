import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Printer,
  CheckSquare,
  StickyNote,
  History,
  ClipboardCheck,
  PackageOpen,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/',            label: 'Painel',      icon: LayoutDashboard },
  { path: '/machines',    label: 'Máquinas',    icon: Printer },
  { path: '/tests',       label: 'Testes',      icon: ClipboardCheck },
  { path: '/history',     label: 'Histórico',   icon: History },
  { path: '/withdrawals', label: 'Ferramentas', icon: PackageOpen },
  { path: '/tasks',       label: 'Tarefas',     icon: CheckSquare },
  { path: '/notes',       label: 'Notas',       icon: StickyNote },
];

export function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — sempre fixed, sempre h-screen */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-64
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
            >
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">ServiceLab</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav — ocupa o espaço restante e rola se necessário */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Usuário — colado ao rodapé, sem posição absoluta */}
        <div className="shrink-0 border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}
            >
              <span className="text-sm font-semibold text-white leading-none select-none">L</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate min-w-0 flex-1">
              Luciano Martins - Auxiliar Tecnico
            </p>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
