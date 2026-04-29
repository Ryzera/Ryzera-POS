'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCategoryBranches } from '@/hooks/useCategoryPerformance';
import type { CategoryReportFilters } from '@/types/category-performance.types';
import {
    DEFAULT_DATE_FROM,
    DEFAULT_DATE_TO,
    ALL_BRANCHES_VALUE,
} from '@/constants/category-performance.constants';

interface CategoryReportFiltersProps {
    onGenerate: (filters: CategoryReportFilters) => void;
    isLoading: boolean;
}

export function CategoryReportFilters({ onGenerate, isLoading }: CategoryReportFiltersProps) {
    const { user, isSuperAdmin } = useAuth();

    const [dateFrom, setDateFrom] = useState<Date>(new Date(DEFAULT_DATE_FROM));
    const [dateTo, setDateTo] = useState<Date>(new Date(DEFAULT_DATE_TO));
    const [branchId, setBranchId] = useState<string>(ALL_BRANCHES_VALUE);

    const { data: branches = [] } = useCategoryBranches();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // For branch managers, lock to their branch
    useEffect(() => {
        if (!isSuperAdmin && user?.branchId) {
            setBranchId(String(user.branchId));
        }
    }, [isSuperAdmin, user?.branchId]);

    // Refs for latest values
    const dateFromRef = useRef(dateFrom);
    const dateToRef = useRef(dateTo);
    const branchIdRef = useRef(branchId);

    useEffect(() => { dateFromRef.current = dateFrom; }, [dateFrom]);
    useEffect(() => { dateToRef.current = dateTo; }, [dateTo]);
    useEffect(() => { branchIdRef.current = branchId; }, [branchId]);

    const handleGenerate = () => {
        const branchValue = branchIdRef.current;

        onGenerate({
            dateFrom: format(dateFromRef.current, 'yyyy-MM-dd'),
            dateTo: format(dateToRef.current, 'yyyy-MM-dd'),
            branchId: branchValue !== ALL_BRANCHES_VALUE ? branchValue : undefined,
        });
    };

    const handleReset = () => {
        setDateFrom(new Date(DEFAULT_DATE_FROM));
        setDateTo(new Date(DEFAULT_DATE_TO));
        if (isSuperAdmin) {
            setBranchId(ALL_BRANCHES_VALUE);
        }
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
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Branch Selector - Only for Super Admin */}
            {isSuperAdmin && (
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Branch
                    </label>
                    <select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-gray-200 bg-white
                                   text-[13px] text-gray-700 font-normal
                                   focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                   focus:border-blue-400 min-w-[160px] cursor-pointer"
                    >
                        <option value={ALL_BRANCHES_VALUE}>All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch.branchId} value={String(branch.branchId)}>
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

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