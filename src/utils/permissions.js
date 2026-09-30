/**
 * Definisi hak akses per role
 */
export const PERMISSIONS = {
  admin: {
    nasabah: ['view', 'create', 'edit', 'delete'],
    jenisSampah: ['view', 'create', 'edit', 'delete'],
    setoran: ['view', 'create', 'delete'],
    penarikan: ['view', 'create', 'delete'],
    transaksi: ['view', 'cancel'],
    laporan: ['view', 'export'],
    pengguna: ['view', 'create', 'edit', 'delete'],
    pengaturan: ['view', 'edit'],
  },
  petugas: {
    nasabah: ['view', 'create', 'edit'],
    jenisSampah: ['view'],
    setoran: ['view', 'create'],
    penarikan: ['view', 'create'],
    transaksi: ['view'],
    laporan: ['view_setoran', 'view_jumlah_sampah'],
    pengguna: [],
    pengaturan: ['view_profile', 'edit_profile'],
  },
}

/**
 * Cek apakah user punya permission
 * @param {string} role
 * @param {string} module
 * @param {string} action
 * @returns {boolean}
 */
export function can(role, module, action) {
  if (!role) return false
  const rolePermissions = PERMISSIONS[role]
  if (!rolePermissions) return false
  const modulePermissions = rolePermissions[module]
  if (!modulePermissions) return false
  return modulePermissions.includes(action)
}

/**
 * Cek apakah user adalah admin
 * @param {string} role
 * @returns {boolean}
 */
export function isAdmin(role) {
  return role === 'admin'
}
