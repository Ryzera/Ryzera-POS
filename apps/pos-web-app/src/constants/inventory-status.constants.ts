
// Sentinel values for "no selection" in dropdowns
export const ALL_CATEGORIES_INV_VALUE = 'ALL';
export const ALL_STOCK_STATUS_VALUE   = 'ALL';

// Stock status display config
export const STOCK_STATUS_CONFIG: Record<
    string,
    { label: string; badgeClass: string; dotClass: string }
> = {
    InStock: {
        label:      'In Stock',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        dotClass:   'bg-emerald-500',
    },
    LowStock: {
        label:      'Low Stock',
        badgeClass: 'bg-amber-100 text-amber-700',
        dotClass:   'bg-amber-500',
    },
    OutOfStock: {
        label:      'Out of Stock',
        badgeClass: 'bg-red-100 text-red-700',
        dotClass:   'bg-red-500',
    },
};

// Stock status options for the dropdown filter
export const STOCK_STATUS_OPTIONS = [
    { value: 'InStock',    label: 'In Stock'     },
    { value: 'LowStock',   label: 'Low Stock'    },
    { value: 'OutOfStock', label: 'Out of Stock' },
] as const;

// KPI card icon theme config (matching sales report style)
export const INVENTORY_KPI_CONFIG = {
    totalProducts: { iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
    inStock:       { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    lowStock:      { iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'   },
    outOfStock:    { iconBg: 'bg-red-50',     iconColor: 'text-red-500'     },
    value:         { iconBg: 'bg-violet-50',  iconColor: 'text-violet-500'  },
} as const;