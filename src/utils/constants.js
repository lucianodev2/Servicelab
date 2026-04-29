// Novos status conforme solicitado
export const MACHINE_STATUS = {
  MAINTENANCE: 'maintenance',
  WAITING_PARTS: 'waiting_parts',
  TESTING: 'testing',
  READY: 'ready',
  COMPLETED: 'completed'
};

export const MACHINE_STATUS_LABELS = {
  [MACHINE_STATUS.MAINTENANCE]: 'Em Manutenção',
  [MACHINE_STATUS.WAITING_PARTS]: 'Aguardando Peça',
  [MACHINE_STATUS.TESTING]: 'Em Teste',
  [MACHINE_STATUS.READY]: 'Pronta para Entrega',
  [MACHINE_STATUS.COMPLETED]: 'Finalizada'
};

export const MACHINE_STATUS_COLORS = {
  [MACHINE_STATUS.MAINTENANCE]: 'bg-blue-500 text-white',
  [MACHINE_STATUS.WAITING_PARTS]: 'bg-yellow-500 text-white',
  [MACHINE_STATUS.TESTING]: 'bg-purple-500 text-white',
  [MACHINE_STATUS.READY]: 'bg-green-500 text-white',
  [MACHINE_STATUS.COMPLETED]: 'bg-emerald-600 text-white'
};

export const LOCATION_OPTIONS = [
  { value: 'client', label: 'Cliente' },
  { value: 'sector', label: 'Setor' },
  { value: 'bench', label: 'Bancada' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' }
];

export const SERVICE_ENTRY_TYPES = {
  ACTION: 'action',
  PART_REPLACED: 'part_replaced',
  TEST: 'test',
  NOTE: 'note',
  PHOTO: 'photo'
};

export const SERVICE_ENTRY_TYPE_LABELS = {
  [SERVICE_ENTRY_TYPES.ACTION]: 'Ação Realizada',
  [SERVICE_ENTRY_TYPES.PART_REPLACED]: 'Peça Substituída',
  [SERVICE_ENTRY_TYPES.TEST]: 'Teste Realizado',
  [SERVICE_ENTRY_TYPES.NOTE]: 'Observação',
  [SERVICE_ENTRY_TYPES.PHOTO]: 'Foto Adicionada'
};

export const PART_STATUS = {
  IN_STOCK: 'in_stock',
  REQUESTED: 'requested',
  ARRIVED: 'arrived'
};

export const PART_STATUS_LABELS = {
  [PART_STATUS.IN_STOCK]: 'Em Estoque',
  [PART_STATUS.REQUESTED]: 'Solicitado',
  [PART_STATUS.ARRIVED]: 'Chegou'
};

export const PART_STATUS_COLORS = {
  [PART_STATUS.IN_STOCK]: 'bg-green-100 text-green-800',
  [PART_STATUS.REQUESTED]: 'bg-yellow-100 text-yellow-800',
  [PART_STATUS.ARRIVED]: 'bg-blue-100 text-blue-800'
};

// Modelos atualizados conforme solicitado
export const BRAND_MODELS = {
  'Samsung': ['4070', '4080'],
  'Kyocera': ['3040', '3655'],
  'HP': ['42540', '4003'],
  'Xerox': ['7025', '7030', '8030'],
  'Pamtum': ['P3300'],
};

// Lista de marcas para dropdown
export const BRAND_OPTIONS = Object.keys(BRAND_MODELS);

// Função para obter modelos de uma marca
export const getModelsByBrand = (brand) => BRAND_MODELS[brand] || [];
