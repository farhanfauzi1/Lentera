import { getStore, setStore } from './storage.js'
import { nasabahService } from './nasabah.js'

const KEY_TRX = 'transaksi'
const KEY_ITEM = 'item_setoran'

function pad(n, len = 4) {
  return String(n).padStart(len, '0')
}

function generateKode(tipe) {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  const existing = getTrxList().filter(
    t => t.kode.startsWith(tipe === 'setoran' ? 'STR' : 'WDR') &&
         t.kode.includes(dateStr)
  )
  const seq = existing.length + 1
  if (tipe === 'setoran') return `STR-${dateStr}-${pad(seq)}`
  return `WDR-${dateStr}-${pad(seq)}`
}

function getTrxList() {
  const data = getStore(KEY_TRX)
  if (!data) {
    seedTransaksi()
    return getStore(KEY_TRX) || []
  }
  return data
}

function getItemList() {
  return getStore(KEY_ITEM) || []
}

function saveTrx(list) {
  setStore(KEY_TRX, list)
}

function saveItems(list) {
  setStore(KEY_ITEM, list)
}

function seedTransaksi() {
  const now = new Date()
  const trxList = []
  const itemList = []

  const daysAgo = (n, hour = 10) => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }

  const setoranData = [
    { nasabahId: '1', nasabahNama: 'Siti Aminah', nasabahKode: 'NSB-0001', items: [{ jenisSampahId: '1', namaJenis: 'Botol Plastik', berat: 5, harga: 4000 }, { jenisSampahId: '2', namaJenis: 'Kardus', berat: 3, harga: 2000 }], hari: 1 },
    { nasabahId: '2', nasabahNama: 'Rudi Hartono', nasabahKode: 'NSB-0002', items: [{ jenisSampahId: '4', namaJenis: 'Besi', berat: 2, harga: 5000 }], hari: 2 },
    { nasabahId: '3', nasabahNama: 'Dewi Kusuma', nasabahKode: 'NSB-0003', items: [{ jenisSampahId: '5', namaJenis: 'Aluminium', berat: 1, harga: 12000 }], hari: 3 },
    { nasabahId: '5', nasabahNama: 'Sri Wahyuni', nasabahKode: 'NSB-0005', items: [{ jenisSampahId: '1', namaJenis: 'Botol Plastik', berat: 10, harga: 4000 }, { jenisSampahId: '7', namaJenis: 'Plastik Campur', berat: 5, harga: 1000 }], hari: 4 },
    { nasabahId: '1', nasabahNama: 'Siti Aminah', nasabahKode: 'NSB-0001', items: [{ jenisSampahId: '3', namaJenis: 'Kertas', berat: 8, harga: 1500 }], hari: 5 },
    { nasabahId: '2', nasabahNama: 'Rudi Hartono', nasabahKode: 'NSB-0002', items: [{ jenisSampahId: '6', namaJenis: 'Kaleng', berat: 4, harga: 3500 }], hari: 6 },
    { nasabahId: '3', nasabahNama: 'Dewi Kusuma', nasabahKode: 'NSB-0003', items: [{ jenisSampahId: '2', namaJenis: 'Kardus', berat: 6, harga: 2000 }], hari: 7 },
    { nasabahId: '5', nasabahNama: 'Sri Wahyuni', nasabahKode: 'NSB-0005', items: [{ jenisSampahId: '4', namaJenis: 'Besi', berat: 3, harga: 5000 }], hari: 10 },
  ]

  setoranData.forEach((sd, idx) => {
    const total = sd.items.reduce((s, it) => s + it.berat * it.harga, 0)
    const tanggal = daysAgo(sd.hari)
    const dateStr = tanggal.split('T')[0].replace(/-/g, '')
    const trxId = `trx_${idx + 1}`
    const kode = `STR-${dateStr}-${pad(idx + 1)}`

    trxList.push({
      id: trxId, kode, tipe: 'setoran', tanggal,
      nasabahId: sd.nasabahId, nasabahNama: sd.nasabahNama, nasabahKode: sd.nasabahKode,
      petugasId: '1', petugasNama: 'Administrator',
      total, status: 'selesai', alasanBatal: null,
    })

    sd.items.forEach((it, iIdx) => {
      itemList.push({
        id: `item_${idx}_${iIdx}`,
        transaksiId: trxId,
        jenisSampahId: it.jenisSampahId,
        namaJenis: it.namaJenis,
        berat: it.berat,
        harga: it.harga,
        subtotal: it.berat * it.harga,
      })
    })
  })

  const penarikanData = [
    { nasabahId: '1', nasabahNama: 'Siti Aminah', nasabahKode: 'NSB-0001', nominal: 50000, hari: 3 },
    { nasabahId: '2', nasabahNama: 'Rudi Hartono', nasabahKode: 'NSB-0002', nominal: 30000, hari: 5 },
    { nasabahId: '5', nasabahNama: 'Sri Wahyuni', nasabahKode: 'NSB-0005', nominal: 100000, hari: 8 },
  ]

  penarikanData.forEach((pd, idx) => {
    const tanggal = daysAgo(pd.hari, 14)
    const dateStr = tanggal.split('T')[0].replace(/-/g, '')
    trxList.push({
      id: `trx_w${idx + 1}`,
      kode: `WDR-${dateStr}-${pad(idx + 1)}`,
      tipe: 'penarikan', tanggal,
      nasabahId: pd.nasabahId, nasabahNama: pd.nasabahNama, nasabahKode: pd.nasabahKode,
      petugasId: '1', petugasNama: 'Administrator',
      total: pd.nominal, status: 'selesai', alasanBatal: null,
    })
  })

  setStore(KEY_TRX, trxList)
  setStore(KEY_ITEM, itemList)
}


export const transaksiService = {
  getAll(filters = {}) {
    let list = getTrxList()
    if (filters.tipe) list = list.filter(t => t.tipe === filters.tipe)
    if (filters.status) list = list.filter(t => t.status === filters.status)
    if (filters.nasabahId) list = list.filter(t => t.nasabahId === filters.nasabahId)
    if (filters.jenisSampahId) {
      const trxIds = getItemList().filter(i => i.jenisSampahId === filters.jenisSampahId).map(i => i.transaksiId)
      list = list.filter(t => trxIds.includes(t.id))
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(t => t.kode.toLowerCase().includes(q) || (t.nasabahNama && t.nasabahNama.toLowerCase().includes(q)))
    }
    if (filters.dateStart) list = list.filter(t => new Date(t.tanggal) >= new Date(filters.dateStart))
    if (filters.dateEnd) {
      const end = new Date(filters.dateEnd); end.setHours(23, 59, 59, 999)
      list = list.filter(t => new Date(t.tanggal) <= end)
    }
    return list.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  },

  getById(id) { return getTrxList().find(t => t.id === id) || null },
  getItemsByTrxId(transaksiId) { return getItemList().filter(i => i.transaksiId === transaksiId) },
  getByNasabahId(nasabahId) {
    return getTrxList().filter(t => t.nasabahId === nasabahId).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  },

  createSetoran(data) {
    const trxList = getTrxList(); const itemList = getItemList()
    const total = data.items.reduce((s, it) => s + it.subtotal, 0)
    const id = 'trx_' + Date.now()
    const trx = { id, kode: generateKode('setoran'), tipe: 'setoran', tanggal: new Date().toISOString(),
      nasabahId: data.nasabahId, nasabahNama: data.nasabahNama, nasabahKode: data.nasabahKode,
      petugasId: data.petugasId, petugasNama: data.petugasNama, total, status: 'selesai', alasanBatal: null }
    trxList.push(trx); saveTrx(trxList)
    const newItems = data.items.map((it, i) => ({ id: `item_${Date.now()}_${i}`, transaksiId: id, ...it }))
    itemList.push(...newItems); saveItems(itemList)
    nasabahService.updateSaldo(data.nasabahId, total)
    return { ...trx, items: newItems }
  },

  createPenarikan(data) {
    const nasabah = nasabahService.getById(data.nasabahId)
    if (!nasabah) throw new Error('Nasabah tidak ditemukan')
    if (nasabah.saldo < data.nominal) throw new Error('Saldo tidak mencukupi')
    const trxList = getTrxList(); const id = 'trx_' + Date.now()
    const trx = { id, kode: generateKode('penarikan'), tipe: 'penarikan', tanggal: new Date().toISOString(),
      nasabahId: data.nasabahId, nasabahNama: data.nasabahNama, nasabahKode: data.nasabahKode,
      petugasId: data.petugasId, petugasNama: data.petugasNama, total: data.nominal, status: 'selesai', alasanBatal: null }
    trxList.push(trx); saveTrx(trxList)
    nasabahService.updateSaldo(data.nasabahId, -data.nominal)
    return trx
  },

  cancelTransaction(id, alasan) {
    const trxList = getTrxList(); const idx = trxList.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Transaksi tidak ditemukan')
    const trx = trxList[idx]
    if (trx.status === 'dibatalkan') throw new Error('Transaksi sudah dibatalkan')
    if (trx.tipe === 'setoran') {
      const nasabah = nasabahService.getById(trx.nasabahId)
      if (!nasabah || nasabah.saldo < trx.total) throw new Error('Saldo tidak mencukupi untuk pembatalan')
      nasabahService.updateSaldo(trx.nasabahId, -trx.total)
    } else {
      nasabahService.updateSaldo(trx.nasabahId, trx.total)
    }
    trxList[idx] = { ...trx, status: 'dibatalkan', alasanBatal: alasan || 'Dibatalkan oleh admin' }
    saveTrx(trxList); return trxList[idx]
  },

  getStats() {
    const selesai = getTrxList().filter(t => t.status === 'selesai')
    const setoran = selesai.filter(t => t.tipe === 'setoran')
    const penarikan = selesai.filter(t => t.tipe === 'penarikan')
    const items = getItemList().filter(i => setoran.map(t => t.id).includes(i.transaksiId))
    return {
      totalSetoran: setoran.reduce((s, t) => s + t.total, 0),
      totalPenarikan: penarikan.reduce((s, t) => s + t.total, 0),
      totalSampah: items.reduce((s, i) => s + (i.berat || 0), 0)
    }
  },

  getChartData(period = '7hari') {
    const trxList = getTrxList().filter(t => t.tipe === 'setoran' && t.status === 'selesai')
    const now = new Date(); const labels = []; const data = []
    const count = period === '7hari' ? 7 : period === '30hari' ? 30 : 12
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now)
      if (period === '12bulan') { d.setMonth(d.getMonth() - i); labels.push(new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d)); data.push(trxList.filter(t => { const td = new Date(t.tanggal); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear() }).reduce((s, t) => s + t.total, 0)) }
      else { d.setDate(d.getDate() - i); labels.push(period === '7hari' ? new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d) : `${d.getDate()}/${d.getMonth() + 1}`); data.push(trxList.filter(t => new Date(t.tanggal).toDateString() === d.toDateString()).reduce((s, t) => s + t.total, 0)) }
    }
    return { labels, data }
  },

  getSampahKomposisi() {
    const setoranIds = getTrxList().filter(t => t.status === 'selesai' && t.tipe === 'setoran').map(t => t.id)
    const items = getItemList().filter(i => setoranIds.includes(i.transaksiId))
    const map = {}
    items.forEach(i => { map[i.namaJenis] = (map[i.namaJenis] || 0) + (i.berat || 0) })
    return Object.entries(map).map(([nama, berat]) => ({ nama, berat }))
  },
}

