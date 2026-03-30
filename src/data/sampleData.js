import { MACHINE_STATUS, PART_STATUS, SERVICE_ENTRY_TYPES } from '../utils/constants';
import { generateId, getTodayISO } from '../utils/helpers';

const today = getTodayISO();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
const lastWeek = new Date(Date.now() - 604800000).toISOString();

export const sampleMachines = [
  {
    id: generateId(),
    serialNumber: 'SN123456789',
    brand: 'HP',
    model: 'LaserJet Pro M404n',
    location: 'bench',
    locationDetail: 'Bench A3',
    entryDate: twoDaysAgo,
    problemDescription: 'Paper jam error persists even after clearing. Making unusual grinding noise.',
    status: MACHINE_STATUS.IN_REPAIR,
    isUrgent: true,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Machine received and initial inspection performed',
        partsUsed: [],
        timestamp: twoDaysAgo,
        createdBy: 'Technician'
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.NOTE,
        description: 'Found paper debris in fuser area. Need to disassemble for thorough cleaning.',
        partsUsed: [],
        timestamp: yesterday,
        createdBy: 'Technician'
      }
    ],
    createdAt: twoDaysAgo,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'CN987654321',
    brand: 'Canon',
    model: 'imageRUNNER C3226i',
    location: 'client',
    locationDetail: 'Accounting Dept - Floor 2',
    entryDate: lastWeek,
    problemDescription: 'Color prints have streaks. Cyan toner not registering properly.',
    status: MACHINE_STATUS.WAITING_PARTS,
    isUrgent: false,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Diagnosis completed - cyan drum unit faulty',
        partsUsed: [],
        timestamp: lastWeek,
        createdBy: 'Technician'
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.NOTE,
        description: 'Ordered replacement cyan drum unit (Part #C-EXV55C)',
        partsUsed: [],
        timestamp: yesterday,
        createdBy: 'Technician'
      }
    ],
    createdAt: lastWeek,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'EP555666777',
    brand: 'Epson',
    model: 'WorkForce Pro WF-C5790',
    location: 'sector',
    locationDetail: 'Sales Office',
    entryDate: yesterday,
    problemDescription: 'Scanner glass cracked. ADF not feeding properly.',
    status: MACHINE_STATUS.DIAGNOSIS,
    isUrgent: false,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Initial assessment - scanner assembly needs replacement',
        partsUsed: [],
        timestamp: yesterday,
        createdBy: 'Technician'
      }
    ],
    createdAt: yesterday,
    updatedAt: yesterday
  },
  {
    id: generateId(),
    serialNumber: 'BR111222333',
    brand: 'Brother',
    model: 'HL-L8360CDW',
    location: 'bench',
    locationDetail: 'Bench B1',
    entryDate: today,
    problemDescription: 'Network connectivity issues. Cannot connect to WiFi.',
    status: MACHINE_STATUS.RECEIVED,
    isUrgent: false,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Machine logged into system',
        partsUsed: [],
        timestamp: today,
        createdBy: 'Technician'
      }
    ],
    createdAt: today,
    updatedAt: today
  },
  {
    id: generateId(),
    serialNumber: 'XRX444555666',
    brand: 'Xerox',
    model: 'VersaLink C7020',
    location: 'client',
    locationDetail: 'Main Office - Reception',
    entryDate: lastWeek,
    problemDescription: 'Complete maintenance service due. Fuser life at 95%.',
    status: MACHINE_STATUS.COMPLETED,
    isUrgent: false,
    photos: [],
    serviceLog: [
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.ACTION,
        description: 'Full maintenance service performed',
        partsUsed: [
          { name: 'Fuser Unit 115R00115', quantity: 1 },
          { name: 'Transfer Roller', quantity: 1 },
          { name: 'Waste Toner Container', quantity: 1 }
        ],
        timestamp: twoDaysAgo,
        createdBy: 'Technician'
      },
      {
        id: generateId(),
        type: SERVICE_ENTRY_TYPES.TEST,
        description: 'Test prints successful. All functions working correctly.',
        partsUsed: [],
        timestamp: yesterday,
        createdBy: 'Technician'
      }
    ],
    createdAt: lastWeek,
    updatedAt: yesterday
  }
];

export const sampleParts = [
  {
    id: generateId(),
    name: 'HP Fuser Assembly RM2-5678',
    quantity: 2,
    status: PART_STATUS.IN_STOCK,
    machineId: null,
    requestedDate: null,
    arrivedDate: null
  },
  {
    id: generateId(),
    name: 'Canon C-EXV55C Cyan Drum',
    quantity: 1,
    status: PART_STATUS.REQUESTED,
    machineId: sampleMachines[1].id,
    requestedDate: yesterday,
    arrivedDate: null
  },
  {
    id: generateId(),
    name: 'Epson Scanner Assembly',
    quantity: 0,
    status: PART_STATUS.REQUESTED,
    machineId: sampleMachines[2].id,
    requestedDate: yesterday,
    arrivedDate: null
  },
  {
    id: generateId(),
    name: 'Brother Network Card',
    quantity: 3,
    status: PART_STATUS.IN_STOCK,
    machineId: null,
    requestedDate: null,
    arrivedDate: null
  },
  {
    id: generateId(),
    name: 'HP Pickup Roller',
    quantity: 10,
    status: PART_STATUS.IN_STOCK,
    machineId: null,
    requestedDate: null,
    arrivedDate: null
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
