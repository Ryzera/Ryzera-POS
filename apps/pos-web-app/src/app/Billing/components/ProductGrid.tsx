'use client';

import { Product, useCartStore } from '@/store/cartstore';

const EMOJI_MAP: Record<string, string> = {
    Groceries:  '🌾',
    Dairy:      '🧀',
    Clothing:   '👕',
    Household:  '🧹',
    Electronic: '📱',
};

export default function ProductGrid({ products }: { products: Product[] }) {
    const addItem = useCartStore(s => s.addItem);

    return (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {products.map(p => {
                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= 10;

                return (
                    <div
                        key={p.id}
                        onClick={() => !isOut && addItem(p)}
                        className={`
                            relative bg-white border border-gray-200 rounded-xl p-3
                            transition-shadow duration-150
                            ${isOut
                            ? 'opacity-55 cursor-not-allowed'
                            : 'cursor-pointer hover:shadow-[0_2px_12px_rgba(37,99,235,0.12)]'
                        }
                        `}
                    >
                        {/* Stock badge */}
                        {isOut && (
                            <span className="absolute top-2.5 right-2.5 bg-orange-50 text-orange-500 border border-orange-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                                Out
                            </span>
                        )}
                        {isLow && !isOut && (
                            <span className="absolute top-2.5 right-2.5 bg-orange-50 text-orange-500 border border-orange-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                                Low: {p.stock}
                            </span>
                        )}

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-2">
                            {EMOJI_MAP[p.category] || '📦'}
                        </div>

                        {/* Name + SKU */}
                        <div className="text-[13px] font-semibold text-gray-900 mb-0.5 leading-snug">
                            {p.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mb-1.5">
                            {p.sku}
                        </div>

                        {/* Price + Add button */}
                        <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-blue-600">
                                Rs. {p.price.toLocaleString()}
                            </span>
                            {!isOut && (
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg leading-none">
                                    +
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}