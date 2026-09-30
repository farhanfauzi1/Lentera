import { getStore, setStore } from './storage.js'

const KEY = 'nasabah'

const SEED_NASABAH = [
  {
    id: '1',
    kode: 'NSB-0001',
    nama: 'Siti Aminah',
    nik: '3271234567890001',
    telepon: '081111111111',
    alamat: 'Jl. Mawar No. 5, Bandung',
    tanggalBergabung: '2025-01-15',
    saldo: 75000,
    status: 'aktif',
  },
  {
    id: '2',
    kode: 'NSB-0002',
    nama: 'Rudi Hartono',
    nik: '3271234567890002',
    telepon: '082222222222',
    alamat: 'Jl. Melati No. 10, Bandung',
    tanggalBergabung: '2025-02-01',
    saldo: 120000,
    status: 'aktif',
  },
  {
    id: '3',
    kode: 'NSB-0003',
    nama: 'Dewi Kusuma',
    nik: '3271234567890003',
    telepon: '083333333333',
    alamat: 'Jl. Anggrek No. 3, Bandung',
    tanggalBergabung: '2025-02-15',
    saldo: 45000,
    status: 'aktif',
  },
  {
    id: '4',
    kode: 'NSB-0004',
    nama: 'Ahmad Fauzi',
    nik: '3271234567890004',
    telepon: '084444444444',
    alamat: 'Jl. Dahlia No. 7, Bandung',
    tanggalBergabung: '2025-03-01',
    saldo: 0,
    status: 'nonaktif',
  },
  {
    id: '5',
    kode: 'NSB-0005',
    nama: 'Sri Wahyuni',
    nik: '3271234567890005',
    telepon: '085555555555',
    alamat: 'Jl. Kenanga No. 12, Bandung',
    tanggalBergabung: '2025-03-15',
    saldo: 200000,
    status: 'aktif',
  },
]

let seqCounter = null

function getNasabah() {
  const data = getStore(KEY)
  if (!data) {
    setStore(KEY, SEED_NASABAH)
    return SEED_NASABAH
  }
  return data
}

function saveNasabah(list) {
  setStore(KEY, list)
}

function getNextKode() {
  const list = getNasabah()
  if (seqCounter === null) {
    seqCounter = list.reduce((max, n) => {
      const num = parseInt(n.kode.split('-')[1] || '0', 10)
      return num > max ? num : max
    }, 0)
  }
  seqCounter++
  return `NSB-${String(seqCounter).padStart(4, '0')}`
}

export const nasabahService = {
  getAll(filters = {}) {
    let list = getNasabah()
    if (filters.status) list = list.filter(n => n.status === filters.status)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        n =>
          n.nama.toLowerCase().includes(q) ||
          n.kode.toLowerCase().includes(q) ||
          (n.telepon && n.telepon.includes(q))
      )
    }
    return list
  },

  getById(id) {
    return getNasabah().find(n => n.id === id) || null
  },

  getAktif() {
    return getNasabah().filter(n => n.status === 'aktif')
  },

  create(data) {
    const list = getNasabah()
    const newNasabah = {
      id: Date.now().toString(),
      kode: getNextKode(),
      saldo: 0,
      status: 'aktif',
      tanggalBergabung: new Date().toISOString().split('T')[0],
      ...data,
    }
    list.push(newNasabah)
    saveNasabah(list)
    return newNasabah
  },

  update(id, data) {
    const list = getNasabah()
    const idx = list.findIndex(n => n.id === id)
    if (idx === -1) throw new Error('Nasabah tidak ditemukan')
    list[idx] = { ...list[idx], ...data }
    saveNasabah(list)
    return list[idx]
  },

  updateSaldo(id, delta) {
    const list = getNasabah()
    const idx = list.findIndex(n => n.id === id)
    if (idx === -1) throw new Error('Nasabah tidak ditemukan')
    list[idx].saldo = (list[idx].saldo || 0) + delta
    saveNasabah(list)
    return list[idx]
  },

  delete(id) {
    const list = getNasabah()
    const filtered = list.filter(n => n.id !== id)
    saveNasabah(filtered)
    return true
  },

  toggleStatus(id) {
    const list = getNasabah()
    const idx = list.findIndex(n => n.id === id)
    if (idx === -1) throw new Error('Nasabah tidak ditemukan')
    list[idx].status = list[idx].status === 'aktif' ? 'nonaktif' : 'aktif'
    saveNasabah(list)
    return list[idx]
  },
}
