import { getStore, setStore } from './storage.js'

const KEY = 'users'

const SEED_USERS = [
  {
    id: '1',
    nama: 'Administrator',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    telepon: '081234567890',
    status: 'aktif',
    foto: null,
  },
  {
    id: '2',
    nama: 'Budi Santoso',
    username: 'petugas',
    password: 'petugas123',
    role: 'petugas',
    telepon: '089876543210',
    status: 'aktif',
    foto: null,
  },
]

function getUsers() {
  const data = getStore(KEY)
  if (!data) {
    setStore(KEY, SEED_USERS)
    return SEED_USERS
  }
  return data
}

function saveUsers(users) {
  setStore(KEY, users)
}

export const authService = {
  login(username, password) {
    const users = getUsers()
    const user = users.find(
      u => (u.username === username || u.email === username) && u.password === password && u.status === 'aktif'
    )
    if (!user) throw new Error('Username atau password salah')
    const { password: _, ...safeUser } = user
    return safeUser
  },

  getAll() {
    return getUsers().map(({ password, ...u }) => u)
  },

  getById(id) {
    const user = getUsers().find(u => u.id === id)
    if (!user) return null
    const { password: _, ...safe } = user
    return safe
  },

  create(data) {
    const users = getUsers()
    const newUser = {
      id: Date.now().toString(),
      ...data,
      status: data.status || 'aktif',
      foto: data.foto || null,
    }
    users.push(newUser)
    saveUsers(users)
    const { password: _, ...safe } = newUser
    return safe
  },

  update(id, data) {
    const users = getUsers()
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Pengguna tidak ditemukan')
    users[idx] = { ...users[idx], ...data }
    saveUsers(users)
    const { password: _, ...safe } = users[idx]
    return safe
  },

  resetPassword(id, newPassword) {
    const users = getUsers()
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Pengguna tidak ditemukan')
    users[idx].password = newPassword
    saveUsers(users)
    return true
  },

  changePassword(id, oldPassword, newPassword) {
    const users = getUsers()
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Pengguna tidak ditemukan')
    if (users[idx].password !== oldPassword) throw new Error('Password lama tidak sesuai')
    users[idx].password = newPassword
    saveUsers(users)
    return true
  },

  delete(id) {
    const users = getUsers()
    const filtered = users.filter(u => u.id !== id)
    saveUsers(filtered)
    return true
  },
}
