import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Interceptors ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Supports both 'access_token' (auth+inventory) and 'token' (billing)
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;

// ── User / Auth Helpers ──────────────────────────────────────────
export function getCurrentUserId(): string {
    if (typeof window === 'undefined') return '';
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) return '';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId ?? payload.id ?? payload.sub ?? '';
    } catch {
        return '';
    }
}

// ── Auth ─────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: string;
        companyId: number;
        branchId?: string;
    }) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
};

// ── Branches ─────────────────────────────────────────────────────
export const branchesApi = {
    getAll: (params?: object) => api.get('/branches', { params }),
    getById: (id: string | number) => api.get(`/branches/${id}`),
    create: (data: object) => api.post('/branches', data),
    update: (id: string | number, data: object) => api.put(`/branches/${id}`, data),
    deactivate: (id: string | number) => api.delete(`/branches/${id}`),
    reactivate: (id: string | number) => api.patch(`/branches/${id}/reactivate`),
};

// ── Categories ───────────────────────────────────────────────────
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    create: (data: object) => api.post('/categories', data),
    update: (id: string | number, data: object) => api.put(`/categories/${id}`, data),
    delete: (id: string | number) => api.delete(`/categories/${id}`),
};

// ── Products ─────────────────────────────────────────────────────
export const productsApi = {
    getAll: (params?: object) => api.get('/products', { params }),
    getById: (id: string | number) => api.get(`/products/${id}`),
    create: (data: object) => api.post('/products', data),
    update: (id: string | number, data: object) => api.put(`/products/${id}`, data),
    delete: (id: string | number) => api.delete(`/products/${id}`),
    search: (query: string) => api.get('/products/search', { params: { q: query } }),
    getByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),
};

// ── Suppliers ────────────────────────────────────────────────────
export const suppliersApi = {
    getAll: (params?: object) => api.get('/suppliers', { params }),
    getById: (id: string | number) => api.get(`/suppliers/${id}`),
    create: (data: object) => api.post('/suppliers', data),
    update: (id: string | number, data: object) => api.put(`/suppliers/${id}`, data),
    deactivate: (id: string | number) => api.delete(`/suppliers/${id}`),
};

// ── Inventory ────────────────────────────────────────────────────
export const inventoryApi = {
    getBranchProducts: (params?: object) => api.get('/inventory/branch-products', { params }),

    assignProduct: (data: { productId: string | number; branchId: string | number; stockQty: number }) =>
        api.post('/inventory/branch-products', data),

    adjustStock: (
        branchId: string | number,
        productId: string | number,
        data: { changeQty: number; action: string; description?: string },
    ) =>
        api.patch(`/inventory/branch-products/${branchId}/${productId}/adjust`, data, {
            params: { userId: getCurrentUserId() },
        }),

    getLogs: (params?: object) => api.get('/inventory/logs', { params }),
    getAlerts: (params?: object) => api.get('/inventory/alerts', { params }),
    markAlertSeen: (id: string | number) => api.patch(`/inventory/alerts/${id}/seen`),
    resolveAlert: (id: string | number) => api.patch(`/inventory/alerts/${id}/resolve`),
};

// ── Batches ──────────────────────────────────────────────────────
export const batchesApi = {
    getAll: (params?: object) => api.get('/batches', { params }),
    create: (data: object) => api.post('/batches', data),
    update: (id: string | number, data: object) => api.put(`/batches/${id}`, data),
    delete: (id: string | number) => api.delete(`/batches/${id}`),
};

// ── Purchase Orders ──────────────────────────────────────────────
export const purchaseOrdersApi = {
    getAll: (params?: object) => api.get('/purchase-orders', { params }),
    getById: (id: string | number) => api.get(`/purchase-orders/${id}`),

    create: (data: object) =>
        api.post('/purchase-orders', data, {
            params: { userId: getCurrentUserId() },
        }),

    updateStatus: (id: string | number, status: string) =>
        api.patch(`/purchase-orders/${id}/status`, {
            status,
            userId: getCurrentUserId(),
        }),

    createInvoice: (id: string | number, data: object) => api.post(`/purchase-orders/${id}/invoice`, data),

    payInvoice: (id: string | number) => api.patch(`/purchase-orders/${id}/invoice/pay`),
};

// ── Transfers ────────────────────────────────────────────────────
export const transfersApi = {
    getAll: (params?: object) => api.get('/transfers', { params }),
    getById: (id: string | number) => api.get(`/transfers/${id}`),

    create: (data: object) =>
        api.post('/transfers', data, {
            params: { userId: getCurrentUserId() },
        }),

    updateStatus: (id: string | number, status: string) =>
        api.patch(`/transfers/${id}/status`, {
            status,
            userId: getCurrentUserId(),
        }),
};

// ── Billing / Sales (Grouped) ────────────────────────────────────
export const billingApi = {
    getAll: (params?: object) => api.get('/billing/sales', { params }),
    getById: (id: string | number) => api.get(`/billing/sales/${id}`),
    create: (data: any) => api.post('/billing/sales', data),
    processPayment: (data: any) => api.post('/billing/sales/payment', data),
    cancel: (id: string | number) => api.patch(`/billing/sales/${id}/cancel`),
};

export const salesApi = billingApi; // Alias

// ── Returns (Grouped) ────────────────────────────────────────────
export const returnsApi = {
    getAll: (params?: object) => api.get('/returns', { params }),
    getById: (id: string | number) => api.get(`/returns/${id}`),
    process: (data: any) => api.post('/returns', data),
};

// ── Standalone Functions (Billing, Returns, Product Search) ───────
// IMPORTANT: createSale and processPayment must NEVER swallow errors and
// return fake/mock success data. Doing so previously caused PaymentModal
// to show "Payment Successful" and write a local-only sale even when the
// real backend call failed — meaning no Sale/Payment row, no stock
// deduction, and no InventoryLog entry, while the UI claimed success.
// These now rethrow so the caller's catch block (which shows a real
// error to the cashier) actually runs.
//
// createSale/processPayment now unwrap the response through extractItem()
// instead of returning res.data raw. The backend wraps single-object
// responses in an envelope (e.g. { success: true, data: { id, ... } }),
// so res.data.id was always undefined — PaymentModal's
// `sale?.sale_id ?? sale?.id` check never found an id even though the
// sale really was created, producing "Sale was not created — no sale id
// returned from server." extractItem() already existed in this file for
// exactly this shape; createSale/processPayment just weren't using it.
export async function createSale(data: any) {
    const res = await api.post('/billing/sales', data);
    return extractItem<any>(res.data);
}

export async function processPayment(data: any) {
    const res = await api.post('/billing/sales/payment', data);
    return extractItem<any>(res.data);
}

export async function getAllSales(params?: object) {
    const res = await api.get('/billing/sales', { params });
    return res.data;
}

export async function getSaleById(id: number | string) {
    const res = await api.get(`/billing/sales/${id}`);
    return res.data;
}

export async function cancelSale(id: number | string) {
    const res = await api.patch(`/billing/sales/${id}/cancel`);
    return res.data;
}

export async function processReturn(data: any) {
    const res = await api.post('/returns', data);
    return res.data;
}

export async function getAllReturns(params?: object) {
    const res = await api.get('/returns', { params });
    return res.data;
}

export async function getReturnById(id: number | string) {
    const res = await api.get(`/returns/${id}`);
    return res.data;
}

export async function searchProducts(query: string) {
    const res = await api.get('/products/search', { params: { q: query } });
    return res.data;
}

export async function getProductByBarcode(barcode: string) {
    const res = await api.get(`/products/barcode/${barcode}`);
    return res.data;
}

// ── Branch-scoped API helpers (for Manager / Staff) ─────────────
export function makeScopedApi(branchId: string | null) {
    const branch = branchId ?? undefined;
    return {
        getStock: (extra?: object) => inventoryApi.getBranchProducts({ branchId: branch, ...extra }),
        getLogs: (extra?: object) => inventoryApi.getLogs({ branchId: branch, ...extra }),
        getAlerts: (extra?: object) => inventoryApi.getAlerts({ branchId: branch, ...extra }),
        getBatches: (extra?: object) => batchesApi.getAll({ branchId: branch, ...extra }),
        getPurchaseOrders: (extra?: object) => purchaseOrdersApi.getAll({ branchId: branch, ...extra }),
        getTransfers: (extra?: object) => transfersApi.getAll({ branchId: branch, ...extra }),
        getProducts: (extra?: object) => productsApi.getAll({ ...extra }),
        getSales: (extra?: object) => billingApi.getAll({ branchId: branch, ...extra }),
        getReturns: (extra?: object) => returnsApi.getAll({ branchId: branch, ...extra }),
    };
}

// ── Helper: safely extract array from API response ──────────────
export function extractArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        if (Array.isArray(d.data)) return d.data as T[];
        if (Array.isArray(d.items)) return d.items as T[];
        if (Array.isArray(d.results)) return d.results as T[];

        if (d.data && typeof d.data === 'object') {
            const nested = d.data as Record<string, unknown>;
            if (Array.isArray(nested.items)) return nested.items as T[];
            if (Array.isArray(nested.results)) return nested.results as T[];
            if (Array.isArray(nested.data)) return nested.data as T[];
        }
    }
    return [];
}

// ── Helper: safely extract a single object from API response ────
export function extractItem<T>(data: unknown): T {
    if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) {
            const inner = d.data as Record<string, unknown>;
            if (inner.data && typeof inner.data === 'object' && !Array.isArray(inner.data)) {
                return inner.data as T;
            }
            return inner as T;
        }
    }
    return data as T;
}