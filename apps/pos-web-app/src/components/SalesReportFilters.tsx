'use client';

import { useState, useEffect, useRef } from 'react';
import { format }                       from 'date-fns';
import { CalendarIcon, RefreshCw }      from 'lucide-react';
import { Button }                       from '@/components/ui/button';
import { Calendar }                     from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
}                                       from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                                       from '@/components/ui/select';
import { cn }                           from '@/lib/utils';
import { useCategories, useProducts }   from '@/hooks/useSalesReport';
import type { SalesReportFilters }      from '@/types/sales-report.types';
import {
    DEFAULT_DATE_FROM,
    DEFAULT_DATE_TO,
    ALL_CATEGORIES_VALUE,
    ALL_PRODUCTS_VALUE,
}                                       from '@/constants/sales-report.constants';

interface SalesReportFiltersProps {
    onGenerate: (filters: SalesReportFilters) => void;
    isLoading:  boolean;
}

export function SalesReportFilters({ onGenerate, isLoading }: SalesReportFiltersProps) {
    const [dateFrom,   setDateFrom]   = useState<Date>(new Date(DEFAULT_DATE_FROM));
    const [dateTo,     setDateTo]     = useState<Date>(new Date(DEFAULT_DATE_TO));
    const [categoryId, setCategoryId] = useState<string>(ALL_CATEGORIES_VALUE);
    const [productId,  setProductId]  = useState<string>(ALL_PRODUCTS_VALUE);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const { data: categories = [] } = useCategories();
    const { data: products   = [] } = useProducts(
        categoryId !== ALL_CATEGORIES_VALUE ? categoryId : undefined,
    );

    useEffect(() => { setProductId(ALL_PRODUCTS_VALUE); }, [categoryId]);

    const dateFromRef   = useRef(dateFrom);
    const dateToRef     = useRef(dateTo);
    const categoryIdRef = useRef(categoryId);
    const productIdRef  = useRef(productId);
    const categoriesRef = useRef(categories);
    const productsRef   = useRef(products);

    useEffect(() => { dateFromRef.current   = dateFrom;   }, [dateFrom]);
    useEffect(() => { dateToRef.current     = dateTo;     }, [dateTo]);
    useEffect(() => { categoryIdRef.current = categoryId; }, [categoryId]);
    useEffect(() => { productIdRef.current  = productId;  }, [productId]);
    useEffect(() => { categoriesRef.current = categories; }, [categories]);
    useEffect(() => { productsRef.current   = products;   }, [products]);

    const handleGenerate = () => {
        const currentCategoryId = categoryIdRef.current;
        const currentProductId  = productIdRef.current;
        const selectedCategory  = categoriesRef.current.find(c => c.id === currentCategoryId);
        const selectedProduct   = productsRef.current.find(p => p.id === currentProductId);

        onGenerate({
            dateFrom:   format(dateFromRef.current, 'yyyy-MM-dd'),
            dateTo:     format(dateToRef.current,   'yyyy-MM-dd'),
            categoryId: currentCategoryId !== ALL_CATEGORIES_VALUE ? selectedCategory?.name : undefined,
            productId:  currentProductId  !== ALL_PRODUCTS_VALUE   ? selectedProduct?.name  : undefined,
        });
    };

    const handleReset = () => {
        setDateFrom(new Date(DEFAULT_DATE_FROM));
        setDateTo(new Date(DEFAULT_DATE_TO));
        setCategoryId(ALL_CATEGORIES_VALUE);
        setProductId(ALL_PRODUCTS_VALUE);
    };

    const triggerClass = cn(
        'h-10 justify-start text-left font-normal text-[13px] rounded-xl',
        'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
        'shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
    );

    return (
        <div className="flex flex-wrap items-end gap-3 px-5 py-4
                        bg-white rounded-2xl border border-gray-100 shadow-sm">

            {/* Date From */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Date From
                </label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(triggerClass, 'w-44', !dateFrom && 'text-gray-400')}
                        >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                                {dateFrom ? format(dateFrom, 'MMM d, yyyy') : 'Pick a date'}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
                        align="start"
                        sideOffset={6}
                    >
                        <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={d => {
                                if (!d) return;
                                setDateFrom(d);
                                if (d > dateTo) setDateTo(d);
                            }}
                            disabled={(date) => date > today}
                            defaultMonth={dateFrom}
                            initialFocus
                            classNames={{
                                months:   'flex flex-col',
                                month:    'space-y-3 p-3',
                                caption:  'flex justify-center relative items-center h-8',
                                caption_label: 'text-sm font-semibold text-gray-800',
                                nav:      'flex items-center gap-1',
                                nav_button: 'h-7 w-7 bg-transparent hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors',
                                nav_button_previous: 'absolute left-1',
                                nav_button_next:     'absolute right-1',
                                table:    'w-full border-collapse',
                                head_row: 'flex',
                                head_cell:'text-gray-400 rounded-md w-9 font-medium text-[11px] text-center',
                                row:      'flex w-full mt-1',
                                cell:     'h-9 w-9 text-center text-sm relative',
                                day:      'h-9 w-9 p-0 font-normal rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors aria-selected:opacity-100',
                                day_selected: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold rounded-lg',
                                day_today:    'bg-gray-100 text-gray-900 font-semibold',
                                day_disabled: 'text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
                                day_outside:  'text-gray-300',
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Date To
                </label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(triggerClass, 'w-44', !dateTo && 'text-gray-400')}
                        >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                                {dateTo ? format(dateTo, 'MMM d, yyyy') : 'Pick a date'}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
                        align="start"
                        sideOffset={6}
                    >
                        <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={d => d && setDateTo(d)}
                            disabled={(date) => date < dateFrom || date > today}
                            defaultMonth={dateTo}
                            initialFocus
                            classNames={{
                                months:   'flex flex-col',
                                month:    'space-y-3 p-3',
                                caption:  'flex justify-center relative items-center h-8',
                                caption_label: 'text-sm font-semibold text-gray-800',
                                nav:      'flex items-center gap-1',
                                nav_button: 'h-7 w-7 bg-transparent hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors',
                                nav_button_previous: 'absolute left-1',
                                nav_button_next:     'absolute right-1',
                                table:    'w-full border-collapse',
                                head_row: 'flex',
                                head_cell:'text-gray-400 rounded-md w-9 font-medium text-[11px] text-center',
                                row:      'flex w-full mt-1',
                                cell:     'h-9 w-9 text-center text-sm relative',
                                day:      'h-9 w-9 p-0 font-normal rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors aria-selected:opacity-100',
                                day_selected: 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold rounded-lg',
                                day_today:    'bg-gray-100 text-gray-900 font-semibold',
                                day_disabled: 'text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
                                day_outside:  'text-gray-300',
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Category
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className={cn(triggerClass, 'w-48')}>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[200] max-h-64 overflow-y-auto
                                              border border-gray-100 shadow-xl bg-white">
                        <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Product
                </label>
                <Select value={productId} onValueChange={setProductId}>
                    <SelectTrigger className={cn(triggerClass, 'w-48')}>
                        <SelectValue placeholder="All Products" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[200] max-h-64 overflow-y-auto
                                              border border-gray-100 shadow-xl bg-white">
                        <SelectItem value={ALL_PRODUCTS_VALUE}>All Products</SelectItem>
                        {products.map(prod => (
                            <SelectItem key={prod.id} value={prod.id}>{prod.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2 ml-auto">
                <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="h-10 px-7 bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                               text-white font-semibold rounded-xl text-[13px]
                               shadow-sm shadow-blue-200/60 transition-all duration-150
                               disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white
                                             rounded-full animate-spin" />
                            Loading…
                        </span>
                    ) : 'Generate'}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                    title="Reset filters"
                    className="h-10 w-10 rounded-xl border-gray-200 bg-white
                               hover:bg-gray-50 text-gray-400 hover:text-gray-600
                               transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}