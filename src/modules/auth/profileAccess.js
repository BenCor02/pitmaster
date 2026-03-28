// PATCH: clean auth role helpers for the rebuilt app shell.

export function normalizeRoleSet(profile, roles = []) {
  return new Set([
    ...(Array.isArray(roles) ? roles : []),
    ...(profile?.role ? [profile.role] : []),
  ])
}

export function isAdminRole(profile, roles = []) {
  const set = normalizeRoleSet(profile, roles)
  return set.has('super_admin') || set.has('admin')
}

export function isEditorRole(profile, roles = []) {
  const set = normalizeRoleSet(profile, roles)
  return set.has('super_admin') || set.has('admin') || set.has('editor')
}
