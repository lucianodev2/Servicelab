const BASE_URL      = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TIMEOUT_MS    = 15_000

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (res.status === 204) return null
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || `Erro ${res.status}`)
    return data
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError')
      throw new Error('Tempo de resposta esgotado. Verifique sua conexão e tente novamente.')
    throw err
  }
}

function toPhoto(p) {
  return {
    id:        String(p.id),
    url:       p.url,
    caption:   p.caption || '',
    timestamp: p.created_at,
    filename:  p.filename,
  }
}

function toMachine(m) {
  return {
    id:                 String(m.id),
    serialNumber:       m.serial_number,
    brand:              m.brand,
    model:              m.model,
    patrimony:          m.patrimony || '',
    location:           m.location || '',
    technician:         m.technician || '',
    entryDate:          m.entry_date || m.created_at,
    problemDescription: m.problem_description || '',
    status:             m.status,
    urgent:             m.urgent,
    completionData:     m.completion_data ? JSON.parse(m.completion_data) : null,
    createdAt:          m.created_at,
    updatedAt:          m.updated_at || m.created_at,
    serviceLog:         [],
    photos:             (m.photos || []).map(toPhoto),
    tests:              [],
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
    id:          String(s.id),
    type:        s.entry_type || 'action',
    description: s.description,
    technician:  s.technician || 'Técnico',
    timestamp:   s.created_at,
    photos:      [],
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

  listStock: () =>
    request('/api/machines/stock').then(list => list.map(toMachine)),

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

  uploadPhoto: async (machineId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BASE_URL}/api/machines/${machineId}/photos`, {
      method: 'POST',
      body: formData,
    })
    if (res.status === 204) return null
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || `Erro ${res.status}`)
    return toPhoto(data)
  },

  listPhotos: (machineId) =>
    request(`/api/machines/${machineId}/photos`).then(list => list.map(toPhoto)),

  deletePhoto: (photoId) =>
    request(`/api/photos/${photoId}`, { method: 'DELETE' }),
}

function toPurchase(p) {
  return {
    id:          String(p.id),
    name:        p.name,
    description: p.description || '',
    quantity:    p.quantity,
    priority:    p.priority    || 'medium',
    status:      p.status      || 'pending',
    createdAt:   p.created_at,
  }
}

function fromPurchase(data) {
  return {
    name:        data.name,
    description: data.description || null,
    quantity:    data.quantity,
    priority:    data.priority || 'medium',
    status:      data.status   || 'pending',
  }
}

export const purchasesApi = {
  list: () =>
    request('/api/purchases').then(list => list.map(toPurchase)),

  create: (data) =>
    request('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(fromPurchase(data)),
    }).then(toPurchase),

  update: (id, data) =>
    request(`/api/purchases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fromPurchase(data)),
    }).then(toPurchase),

  delete: (id) =>
    request(`/api/purchases/${id}`, { method: 'DELETE' }),
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
