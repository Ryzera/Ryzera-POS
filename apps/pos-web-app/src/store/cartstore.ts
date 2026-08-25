import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    discount: number;
    taxRate: number;
    paymentMethod: 'Cash' | 'Card' | 'Split';
    invoiceNo: string;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, qty: number) => void;
    setDiscount: (discount: number) => void;
    setTaxRate: (rate: number) => void;
    setPaymentMethod: (method: 'Cash' | 'Card' | 'Split') => void;
    setInvoiceNo: (invoiceNo: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getDiscountAmount: () => number;
    getTaxAmount: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    discount: 0,
    taxRate: 0,
    paymentMethod: 'Cash',
    invoiceNo: '',

    addItem: (product) => {
        const existing = get().items.find(i => i.product.id === product.id);
        if (existing) {
            set({ items: get().items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
            set({ items: [...get().items, { product, quantity: 1 }] });
        }
    },
    removeItem: (productId) => set({ items: get().items.filter(i => i.product.id !== productId) }),
    updateQuantity: (productId, qty) => {
        if (qty <= 0) { get().removeItem(productId); return; }
        set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity: qty } : i) });
    },
    setDiscount: (discount) => set({ discount }),
    setTaxRate: (taxRate) => set({ taxRate }),
    setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
    setInvoiceNo: (invoiceNo) => set({ invoiceNo }),
    clearCart: () => set({ items: [], discount: 0, taxRate: 0, paymentMethod: 'Cash', invoiceNo: '' }),
    getSubtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    getDiscountAmount: () => (get().getSubtotal() * get().discount) / 100,
    getTaxAmount: () => ((get().getSubtotal() - get().getDiscountAmount()) * get().taxRate) / 100,
    getTotal: () => get().getSubtotal() - get().getDiscountAmount() + get().getTaxAmount(),
}));

// ── Sales History Store ──────────────────────────────

export interface SaleItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface Sale {
    id: number;
    invoice_no: string;
    total_amount: number;
    discount_amount: number;
    tax_amount: number;
    payment_method: string;
    status: 'completed' | 'cancelled';
    created_at: string;
    cashier_name: string;
    items: SaleItem[];
}

interface SalesStore {
    sales: Sale[];
    addSale: (sale: Sale) => void;
    cancelSale: (id: number) => void;
}

export const useSalesStore = create<SalesStore>()(
    persist(
        (set, get) => ({
            sales: [],
            addSale: (sale) => set({ sales: [sale, ...get().sales] }),
            cancelSale: (id) => set({
                sales: get().sales.map(s => s.id === id ? { ...s, status: 'cancelled' } : s),
            }),
        }),
        { name: 'ryzera-sales' }
    )
);