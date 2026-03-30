export const MACHINE_STATUS = {
  RECEIVED: 'received',
  DIAGNOSIS: 'diagnosis',
  WAITING_PARTS: 'waiting_parts',
  IN_REPAIR: 'in_repair',
  COMPLETED: 'completed',
  DELIVERED: 'delivered'
};

export const MACHINE_STATUS_LABELS = {
  [MACHINE_STATUS.RECEIVED]: 'Recebido',
  [MACHINE_STATUS.DIAGNOSIS]: 'Em Diagnóstico',
  [MACHINE_STATUS.WAITING_PARTS]: 'Aguardando Peças',
  [MACHINE_STATUS.IN_REPAIR]: 'Em Reparo',
  [MACHINE_STATUS.COMPLETED]: 'Concluído',
  [MACHINE_STATUS.DELIVERED]: 'Entregue'
};

export const MACHINE_STATUS_COLORS = {
  [MACHINE_STATUS.RECEIVED]: 'status-received',
  [MACHINE_STATUS.DIAGNOSIS]: 'status-diagnosis',
  [MACHINE_STATUS.WAITING_PARTS]: 'status-waiting',
  [MACHINE_STATUS.IN_REPAIR]: 'status-repair',
  [MACHINE_STATUS.COMPLETED]: 'status-completed',
  [MACHINE_STATUS.DELIVERED]: 'status-delivered'
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

export const BRAND_OPTIONS = [
  'HP',
  'Canon',
  'Epson',
  'Brother',
  'Lexmark',
  'Samsung',
  'Xerox',
  'Ricoh',
  'Kyocera',
  'Sharp',
  'Konica Minolta',
  'Other'
];
