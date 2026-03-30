import { MACHINE_STATUS, SERVICE_ENTRY_TYPES } from '../utils/constants';
import { generateId, getTodayISO } from '../utils/helpers';

const today = getTodayISO();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
const lastWeek = new Date(Date.now() - 604800000).toISOString();

// Novos modelos conforme solicitado
export const sampleMachines = [
  {
    id: generateId(),
    serialNumber: 'SN123456789',
    brand: 'Samsung',
    model: '4070',
    patrimony: 'PAT-001',
    location: 'Laboratório',
    technician: 'João Silva',
    entryDate: twoDaysAgo,
    problemDescription: 'Erro de atolamento de papel persiste mesmo após limpeza. Ruído de moagem incomum.',
    status: MACHINE_STATUS.MAINTENANCE,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Máquina recebida e inspeção inicial realizada',
        technician: 'João Silva',
        timestamp: twoDaysAgo
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.NOTE,
        description: 'Encontrado resíduo de papel na área do fusor. Necessário desmontar para limpeza completa.',
        technician: 'João Silva',
        timestamp: yesterday
      }
    ],
    createdAt: twoDaysAgo,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'CN987654321',
    brand: 'Kyocera',
    model: '3655',
    patrimony: 'PAT-002',
    location: 'Cliente - Contabilidade',
    technician: 'Maria Santos',
    entryDate: lastWeek,
    problemDescription: 'Impressões coloridas com listras. Toner ciano não registrando corretamente.',
    status: MACHINE_STATUS.WAITING_PARTS,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Diagnóstico concluído - unidade de cilindro ciano com defeito',
        technician: 'Maria Santos',
        timestamp: lastWeek
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.NOTE,
        description: 'Solicitado cilindro ciano de reposição',
        technician: 'Maria Santos',
        timestamp: yesterday
      }
    ],
    createdAt: lastWeek,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'HP555666777',
    brand: 'HP',
    model: '42540',
    patrimony: 'PAT-003',
    location: 'Setor - Vendas',
    technician: 'Pedro Costa',
    entryDate: yesterday,
    problemDescription: 'Vidro do scanner trincado. ADF não alimentando corretamente.',
    status: MACHINE_STATUS.TESTING,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Avaliação inicial - conjunto do scanner necessita substituição',
        technician: 'Pedro Costa',
        timestamp: yesterday
      }
    ],
    createdAt: yesterday,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'XRX111222333',
    brand: 'Xerox',
    model: '7025',
    patrimony: 'PAT-004',
    location: 'Laboratório',
    technician: 'Ana Paula',
    entryDate: today,
    problemDescription: 'Problemas de conectividade de rede. Não conecta ao WiFi.',
    status: MACHINE_STATUS.MAINTENANCE,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Máquina registrada no sistema',
        technician: 'Ana Paula',
        timestamp: today
      }
    ],
    createdAt: today,
    updatedAt: today
  },
  {
    id: generateId(),
    serialNumber: 'SAM444555666',
    brand: 'Samsung',
    model: '4080',
    patrimony: 'PAT-005',
    location: 'Cliente - Recepção',
    technician: 'João Silva',
    entryDate: lastWeek,
    problemDescription: 'Manutenção completa devida. Vida útil do fusor em 95%.',
    status: MACHINE_STATUS.READY,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Serviço de manutenção completo realizado',
        technician: 'João Silva',
        timestamp: twoDaysAgo
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.TEST,
        description: 'Testes de impressão bem-sucedidos. Todas as funções operando corretamente.',
        technician: 'João Silva',
        timestamp: yesterday
      }
    ],
    createdAt: lastWeek,
    updatedAt: yesterday
  }
];

export const sampleTasks = [
  {
    id: generateId(),
    title: 'Complete HP LaserJet repair',
    description: 'Finish disassembling and clean fuser area. Replace pickup roller.',
    priority: 'high',
    status: 'pending',
    dueDate: today,
    machineId: sampleMachines[0].id,
    createdAt: yesterday,
    completedAt: null
  },
  {
    id: generateId(),
    title: 'Follow up on Canon drum order',
    description: 'Check delivery status of cyan drum unit',
    priority: 'medium',
    status: 'pending',
    dueDate: today,
    machineId: sampleMachines[1].id,
    createdAt: yesterday,
    completedAt: null
  },
  {
    id: generateId(),
    title: 'Order Epson scanner assembly',
    description: 'Contact supplier for pricing and availability',
    priority: 'high',
    status: 'pending',
    dueDate: today,
    machineId: sampleMachines[2].id,
    createdAt: yesterday,
    completedAt: null
  },
  {
    id: generateId(),
    title: 'Deliver Xerox to reception',
    description: 'Machine ready for pickup - coordinate with client',
    priority: 'medium',
    status: 'completed',
    dueDate: today,
    machineId: sampleMachines[4].id,
    createdAt: twoDaysAgo,
    completedAt: today
  },
  {
    id: generateId(),
    title: 'Inventory check - toner supplies',
    description: 'Count remaining toner cartridges and update stock',
    priority: 'low',
    status: 'pending',
    dueDate: null,
    machineId: null,
    createdAt: today,
    completedAt: null
  }
];
