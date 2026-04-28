'use client';

import { Product, useCartStore } from '@/store/cartstore';
import { Badge } from '@/components/ui/badge';

const EMOJI_MAP: Record<string, string> = {
    Groceries: '🌾', Dairy: '🧀', Clothing: '👕', Household: '🧹', Electronic: '📱',
};

export default function ProductGrid({ products }: { products: Product[] }) {
    const addItem = useCartStore(s => s.addItem);

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            {products.map(p => {
                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= 10;

                return (
                    <div
                        key={p.id}
                        onClick={() => !isOut && addItem(p)}
                        className={`
              relative bg-white border border-gray-200 rounded-xl p-3
              transition-all duration-150
              ${isOut
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer hover:shadow-md hover:border-blue-300'
                        }
            `}
                    >
                        {/* Stock badge */}
                        {isOut && (
                            <Badge className="absolute top-2 right-2 bg-orange-100 text-orange-600 border-0 text-[10px]">
                                Out
                            </Badge>
                        )}
                        {isLow && (
                            <Badge className="absolute top-2 right-2 bg-orange-100 text-orange-600 border-0 text-[10px]">
                                Low: {p.stock}
                            </Badge>
                        )}

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-2.5">
                            {EMOJI_MAP[p.category] ?? '📦'}
                        </div>

                        <p className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{p.name}</p>
                        <p className="text-xs text-gray-400 mb-2">{p.sku}</p>

                        <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-600">
                Rs. {p.price.toLocaleString()}
              </span>
                            {!isOut && (
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg leading-none">
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