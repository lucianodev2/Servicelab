import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  CheckSquare, 
  Clock,
  Activity,
  Wrench,
  Package,
  TestTube,
  Truck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/machines/StatusBadge';
import { PriorityBadge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';
import { formatRelativeTime, truncateText } from '../utils/helpers';

function StatCard({ title, value, subtitle, icon: Icon, color, onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { machines, tasks, getStats } = useApp();
  const stats = getStats();

  // Get high priority pending tasks
  const highPriorityTasks = tasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  // Get recent activity (last 5 service entries)
  const recentActivity = machines
    .flatMap(m => m.serviceLog.map(entry => ({ ...entry, machine: m })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-gray-500 mt-1">Visão geral das operações do seu laboratório</p>
      </div>

      {/* Stats Grid - Novos cards conforme solicitado */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Em Manutenção"
          value={stats.inMaintenance}
          subtitle="Reparos ativos"
          icon={Wrench}
          color="blue"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Aguardando Peça"
          value={stats.waitingParts}
          subtitle="Peças pendentes"
          icon={Package}
          color="yellow"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Em Teste"
          value={stats.inTesting}
          subtitle="Testando equipamentos"
          icon={TestTube}
          color="purple"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Prontas"
          value={stats.ready}
          subtitle="Para entrega"
          icon={Truck}
          color="green"
          onClick={() => navigate('/machines')}
        />
        <StatCard
          title="Tarefas"
          value={stats.pendingTasks}
          subtitle="Pendentes"
          icon={CheckSquare}
          color="purple"
          onClick={() => navigate('/tasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas de Hoje</h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Ver todas
            </button>
          </div>
          
          {highPriorityTasks.length > 0 ? (
            <div className="space-y-2">
              {highPriorityTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <PriorityBadge priority={task.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    {task.machineId && (
                      <p className="text-xs text-gray-500">
                        {machines.find(m => m.id === task.machineId)?.brand} {machines.find(m => m.id === task.machineId)?.model}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p>Tudo em dia!</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((entry, index) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/machines/${entry.machine.id}`)}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{entry.machine.brand} {entry.machine.model}</span>
                      {' - '}
                      {truncateText(entry.description, 40)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
