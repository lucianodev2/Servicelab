import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Wrench, Package, TestTube, Truck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { PriorityBadge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';

function StatCard({ title, value, subtitle, icon: Icon, colorClass, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-left
                 cursor-pointer hover:shadow-md hover:border-gray-300 active:scale-[0.97]
                 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { machines, tasks, getStats } = useApp();
  const stats = getStats();

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const priorityTasks = tasks
    .filter(t => t.status === 'pending')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-gray-500 mt-1">Visão geral das operações do laboratório</p>
      </div>

      {/* Cards de status — cada um navega filtrado */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Em Manutenção"
          value={stats.inMaintenance}
          subtitle="Reparos ativos"
          icon={Wrench}
          colorClass="bg-blue-50 text-blue-600"
          onClick={() => navigate('/machines?status=maintenance')}
        />
        <StatCard
          title="Aguardando Peça"
          value={stats.waitingParts}
          subtitle="Peças pendentes"
          icon={Package}
          colorClass="bg-yellow-50 text-yellow-600"
          onClick={() => navigate('/machines?status=waiting_parts')}
        />
        <StatCard
          title="Em Teste"
          value={stats.inTesting}
          subtitle="Testando"
          icon={TestTube}
          colorClass="bg-purple-50 text-purple-600"
          onClick={() => navigate('/tests')}
        />
        <StatCard
          title="Prontas"
          value={stats.ready}
          subtitle="Para entrega"
          icon={Truck}
          colorClass="bg-green-50 text-green-600"
          onClick={() => navigate('/machines?status=ready')}
        />
        <StatCard
          title="Tarefas"
          value={stats.pendingTasks}
          subtitle="Pendentes"
          icon={CheckSquare}
          colorClass="bg-violet-50 text-violet-600"
          onClick={() => navigate('/tasks')}
        />
      </div>

      {/* Tarefas prioritárias — "Atividade Recente" removida */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tarefas Prioritárias</h3>
          <button
            onClick={() => navigate('/tasks')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas
          </button>
        </div>

        {priorityTasks.length > 0 ? (
          <div className="space-y-2">
            {priorityTasks.map(task => {
              const machine = machines.find(m => m.id === task.machineId);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <PriorityBadge priority={task.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    {machine && (
                      <p className="text-xs text-gray-500 truncate">
                        {machine.brand} {machine.model}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 text-green-400" />
            <p className="font-medium">Tudo em dia!</p>
            <p className="text-sm mt-1">Nenhuma tarefa pendente.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
