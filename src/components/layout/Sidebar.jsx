import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Printer, 
  CheckSquare, 
  StickyNote,
  History,
  ClipboardCheck,
  Settings,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/machines', label: 'Máquinas', icon: Printer },
  { path: '/tests', label: 'Testes', icon: ClipboardCheck },
  { path: '/history', label: 'Histórico', icon: History },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/notes', label: 'Notas', icon: StickyNote },
];

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
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

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border-r-2 border-primary-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)' }}>
              <span className="text-sm font-medium text-white">T</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Técnico</p>
              <p className="text-xs text-gray-500">Gerente do Lab</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
