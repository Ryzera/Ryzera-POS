export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  CASHIER: 'CASHIER',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
