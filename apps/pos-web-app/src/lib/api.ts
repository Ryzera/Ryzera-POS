import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Helper: get current userId from stored token (decoded)
// The backend requires ?userId= on POST/PATCH for inventory, POs, transfers.
// We decode the JWT locally — no extra API call needed.
function getCurrentUserId(): string {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("token");
    if (!token) return "";
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? "";
    } catch {
        return "";
    }
}

// Auth
export const authApi = {
    login: (email: string, password: string) =>
        api.post("/auth/login", { email, password }),
    register: (data: {
        name: string;
        email: string;
        password: string;
        role: string;
        branchId?: string;
    }) => api.post("/auth/register", data),
    me: () => api.get("/auth/me"),
};

// Branches
export const branchesApi = {
    getAll: (params?: object) => api.get("/branches", { params }),
    getById: (id: string) => api.get(`/branches/${id}`),
    create: (data: object) => api.post("/branches", data),
    update: (id: string, data: object) => api.put(`/branches/${id}`, data),
    deactivate: (id: string) => api.delete(`/branches/${id}`),          // ← soft-delete
    reactivate: (id: string) => api.patch(`/branches/${id}/reactivate`),
};

// Categories
export const categoriesApi = {
    getAll: () => api.get("/categories"),
    create: (data: object) => api.post("/categories", data),
    update: (id: string, data: object) => api.put(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

// Products
export const productsApi = {
    getAll: (params?: object) => api.get("/products", { params }),
    getById: (id: string) => api.get(`/products/${id}`),
    create: (data: object) => api.post("/products", data),
    update: (id: string, data: object) => api.put(`/products/${id}`, data),
    // deactivate = PUT with status: "INACTIVE" (no dedicated endpoint)
    // reactivate = PUT with status: "ACTIVE"
    delete: (id: string) => api.delete(`/products/${id}`),             // ← discontinued
};

// Suppliers
export const suppliersApi = {
    getAll: (params?: object) => api.get("/suppliers", { params }),
    getById: (id: string) => api.get(`/suppliers/${id}`),
    create: (data: object) => api.post("/suppliers", data),
    update: (id: string, data: object) => api.put(`/suppliers/${id}`, data),
    deactivate: (id: string) => api.delete(`/suppliers/${id}`),         // ← soft-delete
    // reactivate = PUT with isActive: true (no dedicated endpoint)
};

// Inventory
// Backend field contract (from inventory.controller.ts):
//   POST   /inventory/branch-products        → { productId, branchId, stockQty }
//   PATCH  /inventory/branch-products/:b/:p/adjust?userId=
//   → { changeQty, action, description? }
export const inventoryApi = {
    getBranchProducts: (params?: object) =>
        api.get("/inventory/branch-products", { params }),

    // FIX: backend expects `stockQty` not `quantity`, no minStock field
    assignProduct: (data: {
        productId: string;
        branchId: string;
        stockQty: number;        // ← correct field name
    }) => api.post("/inventory/branch-products", data),

    // FIX: backend expects `changeQty` + `action` + `description`, plus ?userId= query param
    adjustStock: (branchId: string, productId: string, data: {
        changeQty: number;       // ← was `quantity`
        action: string;          // ← was `type`
        description?: string;    // ← was `note`
    }) =>
        api.patch(
            `/inventory/branch-products/${branchId}/${productId}/adjust`,
            data,
            { params: { userId: getCurrentUserId() } }  // ← required query param
        ),

    getLogs: (params?: object) => api.get("/inventory/logs", { params }),
    getAlerts: (params?: object) => api.get("/inventory/alerts", { params }),
    markAlertSeen: (id: string) => api.patch(`/inventory/alerts/${id}/seen`),
    resolveAlert: (id: string) => api.patch(`/inventory/alerts/${id}/resolve`),
};

// ── Batches ───────────────────────────────────────────
export const batchesApi = {
    getAll: (params?: object) => api.get("/batches", { params }),
    create: (data: object) => api.post("/batches", data),
    update: (id: string, data: object) => api.put(`/batches/${id}`, data),
    delete: (id: string) => api.delete(`/batches/${id}`),
};

// Purchase Orders
// Backend contract (from purchase-orders.controller.ts):
//   POST   /purchase-orders?userId=          → { supplierId, branchId, items[{productId,quantity,unitCost}], notes? }
//   PATCH  /purchase-orders/:id/status       → { status, userId }   ← userId in BODY
//   POST   /purchase-orders/:id/invoice      → { invoiceNo, totalAmount, dueDate?, notes? }
//   PATCH  /purchase-orders/:id/invoice/pay  → (no body)
export const purchaseOrdersApi = {
    getAll: (params?: object) => api.get("/purchase-orders", { params }),
    getById: (id: string) => api.get(`/purchase-orders/${id}`),

    // FIX: needs ?userId= query param
    create: (data: object) =>
        api.post("/purchase-orders", data, {
            params: { userId: getCurrentUserId() },   // ← required
        }),

    // FIX: userId must be in the REQUEST BODY alongside status
    updateStatus: (id: string, status: string) =>
        api.patch(`/purchase-orders/${id}/status`, {
            status,
            userId: getCurrentUserId(),               // ← required in body
        }),

    createInvoice: (id: string, data: object) =>
        api.post(`/purchase-orders/${id}/invoice`, data),

    payInvoice: (id: string) =>
        api.patch(`/purchase-orders/${id}/invoice/pay`),
};

// Transfers
// Backend contract (from transfers.controller.ts):
//   POST   /transfers?userId=                → { sourceBranchId, destinationBranchId, items[{productId,quantity}], notes? }
//   PATCH  /transfers/:id/status             → { status, userId }   ← userId in BODY
export const transfersApi = {
    getAll: (params?: object) => api.get("/transfers", { params }),
    getById: (id: string) => api.get(`/transfers/${id}`),

    // FIX: needs ?userId= query param
    create: (data: object) =>
        api.post("/transfers", data, {
            params: { userId: getCurrentUserId() },   // ← required
        }),

    // FIX: userId must be in REQUEST BODY alongside status
    updateStatus: (id: string, status: string) =>
        api.patch(`/transfers/${id}/status`, {
            status,
            userId: getCurrentUserId(),               // ← required in body
        }),
};

// Branch-scoped API helpers (for Manager / Staff)
export function makeScopedApi(branchId: string | null) {
    const branch = branchId ?? undefined;
    return {
        getStock: (extra?: object) =>
            inventoryApi.getBranchProducts({ branchId: branch, ...extra }),
        getLogs: (extra?: object) =>
            inventoryApi.getLogs({ branchId: branch, ...extra }),
        getAlerts: (extra?: object) =>
            inventoryApi.getAlerts({ branchId: branch, ...extra }),
        getBatches: (extra?: object) =>
            batchesApi.getAll({ branchId: branch, ...extra }),
        getPurchaseOrders: (extra?: object) =>
            purchaseOrdersApi.getAll({ branchId: branch, ...extra }),
        getTransfers: (extra?: object) =>
            transfersApi.getAll({ branchId: branch, ...extra }),
        getProducts: (extra?: object) =>
            productsApi.getAll({ ...extra }),
    };
}

// Helper to safely extract array from API response
export function extractArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        if (Array.isArray(d.data)) return d.data as T[];
        if (Array.isArray(d.items)) return d.items as T[];
        if (Array.isArray(d.results)) return d.results as T[];
    }
    return [];
}