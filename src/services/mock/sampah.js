import { getStore, setStore } from './storage.js'

const KEY = 'jenis_sampah'

const SEED_JENIS = [
  { id: '1', nama: 'Botol Plastik', harga: 4000, satuan: 'Kg', status: 'aktif' },
  { id: '2', nama: 'Kardus', harga: 2000, satuan: 'Kg', status: 'aktif' },
  { id: '3', nama: 'Kertas', harga: 1500, satuan: 'Kg', status: 'aktif' },
  { id: '4', nama: 'Besi', harga: 5000, satuan: 'Kg', status: 'aktif' },
  { id: '5', nama: 'Aluminium', harga: 12000, satuan: 'Kg', status: 'aktif' },
  { id: '6', nama: 'Kaleng', harga: 3500, satuan: 'Kg', status: 'aktif' },
  { id: '7', nama: 'Plastik Campur', harga: 1000, satuan: 'Kg', status: 'aktif' },
]

function getJenis() {
  const data = getStore(KEY)
  if (!data) {
    setStore(KEY, SEED_JENIS)
    return SEED_JENIS
  }
  return data
}

function saveJenis(list) {
  setStore(KEY, list)
}

export const sampahService = {
  getAll(filters = {}) {
    let list = getJenis()
    if (filters.status) list = list.filter(j => j.status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(j => j.nama.toLowerCase().includes(q))
    }
    return list
  },

  getById(id) {
    return getJenis().find(j => j.id === id) || null
  },

  getAktif() {
    return getJenis().filter(j => j.status === 'aktif')
  },

  create(data) {
    const list = getJenis()
    const newJenis = {
      id: Date.now().toString(),
      satuan: 'Kg',
      status: 'aktif',
      ...data,
    }
    list.push(newJenis)
    saveJenis(list)
    return newJenis
  },

  update(id, data) {
    const list = getJenis()
    const idx = list.findIndex(j => j.id === id)
    if (idx === -1) throw new Error('Jenis sampah tidak ditemukan')
    list[idx] = { ...list[idx], ...data }
    saveJenis(list)
    return list[idx]
  },

  delete(id) {
    const list = getJenis()
    const filtered = list.filter(j => j.id !== id)
    saveJenis(filtered)
    return true
  },

  toggleStatus(id) {
    const list = getJenis()
    const idx = list.findIndex(j => j.id === id)
    if (idx === -1) throw new Error('Jenis sampah tidak ditemukan')
    list[idx].status = list[idx].status === 'aktif' ? 'nonaktif' : 'aktif'
    saveJenis(list)
    return list[idx]
  },
}
