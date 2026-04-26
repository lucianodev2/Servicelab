const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Erro ${res.status}`)
  return data
}

function toMachine(m) {
  return {
    id: String(m.id),
    serialNumber: m.serial_number,
    brand: m.brand,
    model: m.model,
    patrimony: m.patrimony || '',
    location: m.location || '',
    technician: m.technician || '',
    entryDate: m.entry_date || m.created_at,
    problemDescription: m.problem_description || '',
    status: m.status,
    urgent: m.urgent,
    completionData: m.completion_data ? JSON.parse(m.completion_data) : null,
    createdAt: m.created_at,
    updatedAt: m.updated_at || m.created_at,
    serviceLog: [],
    photos: [],
    tests: [],
  }
}

function fromMachine(data) {
  return {
    serial_number:       data.serialNumber,
    brand:               data.brand,
    model:               data.model,
    patrimony:           data.patrimony   || null,
    location:            data.location    || null,
    technician:          data.technician  || null,
    entry_date:          data.entryDate   || null,
    problem_description: data.problemDescription || null,
    status:              data.status      || 'maintenance',
    urgent:              data.urgent      || false,
    completion_data:     data.completionData ? JSON.stringify(data.completionData) : null,
  }
}

function toServiceEntry(s) {
  return {
    id:         String(s.id),
    type:       s.entry_type || 'action',
    description: s.description,
    technician: s.technician || 'Técnico',
    timestamp:  s.created_at,
    photos:     [],
  }
}

function fromServiceEntry(entry, machineId) {
  return {
    machine_id:  parseInt(machineId),
    entry_type:  entry.type || 'action',
    description: entry.description,
    technician:  entry.technician || null,
  }
}

function toTask(t) {
  return {
    id:          String(t.id),
    title:       t.title,
    description: '',
    priority:    t.priority,
    status:      t.completed ? 'completed' : 'pending',
    completed:   t.completed,
    machineId:   t.machine_id ? String(t.machine_id) : null,
    dueDate:     t.due_date || null,
    createdAt:   t.created_at,
    completedAt: t.completed ? t.created_at : null,
    futureNote:  '',
  }
}

function fromTask(data) {
  const out = {
    title:      data.title,
    priority:   data.priority   || 'medium',
    machine_id: data.machineId  ? parseInt(data.machineId) : null,
    due_date:   data.dueDate    || null,
  }
  if (data.completed !== undefined) out.completed = data.completed
  return out
}

export const machinesApi = {
  list: () =>
    request('/api/machines').then(list => list.map(toMachine)),

  create: (data) =>
    request('/api/machines', {
      method: 'POST',
      body: JSON.stringify(fromMachine(data)),
    }).then(toMachine),

  update: (id, data) =>
    request(`/api/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fromMachine(data)),
    }).then(toMachine),

  delete: (id) =>
    request(`/api/machines/${id}`, { method: 'DELETE' }),

  getServices: (machineId) =>
    request(`/api/machines/${machineId}/services`).then(list => list.map(toServiceEntry)),

  addServiceEntry: (machineId, entry) =>
    request('/api/services', {
      method: 'POST',
      body: JSON.stringify(fromServiceEntry(entry, machineId)),
    }).then(toServiceEntry),
}

export const tasksApi = {
  list: () =>
    request('/api/tasks').then(list => list.map(toTask)),

  create: (data) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(fromTask(data)),
    }).then(toTask),

  update: (id, data) =>
    request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fromTask(data)),
    }).then(toTask),

  complete: (id) =>
    request(`/api/tasks/${id}/complete`, { method: 'PATCH' }).then(toTask),

  delete: (id) =>
    request(`/api/tasks/${id}`, { method: 'DELETE' }),
}
