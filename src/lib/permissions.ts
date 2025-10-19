import { User } from './auth'

export enum Permission {
  READ_PATIENTS = 'read:patients',
  WRITE_PATIENTS = 'write:patients',
  DELETE_PATIENTS = 'delete:patients',
  READ_BILLS = 'read:bills',
  WRITE_BILLS = 'write:bills',
  DELETE_BILLS = 'delete:bills',
  READ_INVENTORY = 'read:inventory',
  WRITE_INVENTORY = 'write:inventory',
  DELETE_INVENTORY = 'delete:inventory',
  READ_REVENUE = 'read:revenue',
  READ_EXPENSES = 'read:expenses',
  WRITE_EXPENSES = 'write:expenses',
  DELETE_EXPENSES = 'delete:expenses',
  ADMIN_ACCESS = 'admin:access',
}

export const rolePermissions = {
  admin: Object.values(Permission),
  doctor: [
    Permission.READ_PATIENTS,
    Permission.WRITE_PATIENTS,
    Permission.READ_BILLS,
    Permission.WRITE_BILLS,
    Permission.READ_INVENTORY,
    Permission.READ_REVENUE,
    Permission.READ_EXPENSES,
  ],
  staff: [
    Permission.READ_PATIENTS,
    Permission.READ_BILLS,
    Permission.READ_INVENTORY,
    Permission.READ_REVENUE,
    Permission.READ_EXPENSES,
  ],
}

export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission)
}

export function getUserPermissions(role: string): Permission[] {
  return rolePermissions[role as keyof typeof rolePermissions] || []
}
