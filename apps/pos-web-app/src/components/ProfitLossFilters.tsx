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
import { cn }                           from '@/lib/utils';
import {
    PL_DEFAULT_DATE_FROM,
    PL_DEFAULT_DATE_TO,
}                                       from '@/constants/profit-loss.constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfitLossFiltersShape {
    dateFrom: string;   // 'YYYY-MM-DD'
    dateTo:   string;   // 'YYYY-MM-DD'
}

interface ProfitLossFiltersProps {
    onGenerate: (filters: ProfitLossFiltersShape) => void;
    isLoading:  boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfitLossFilters({ onGenerate, isLoading }: ProfitLossFiltersProps) {
    const [dateFrom, setDateFrom] = useState<Date>(new Date(PL_DEFAULT_DATE_FROM));
    const [dateTo,   setDateTo]   = useState<Date>(new Date(PL_DEFAULT_DATE_TO));

    // Cap calendar to today — future P&L data does not exist
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // ── Refs keep handleGenerate stable without needing it in useCallback deps ──
    const dateFromRef = useRef(dateFrom);
    const dateToRef   = useRef(dateTo);

    useEffect(() => { dateFromRef.current = dateFrom; }, [dateFrom]);
    useEffect(() => { dateToRef.current   = dateTo;   }, [dateTo]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleGenerate = () => {
        onGenerate({
            dateFrom: format(dateFromRef.current, 'yyyy-MM-dd'),
            dateTo:   format(dateToRef.current,   'yyyy-MM-dd'),
        });
    };

    const handleReset = () => {
        setDateFrom(new Date(PL_DEFAULT_DATE_FROM));
        setDateTo(new Date(PL_DEFAULT_DATE_TO));
    };

    // ── Shared trigger style ───────────────────────────────────────────────────

    const triggerClass = cn(
        'h-10 justify-start text-left font-normal text-[13px] rounded-xl',
        'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700',
        'shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
        'transition-colors duration-150',
    );

    // ── Shared calendar classNames ─────────────────────────────────────────────

    const calendarClassNames = {
        months:              'flex flex-col',
        month:               'space-y-3 p-3',
        caption:             'flex justify-center relative items-center h-8',
        caption_label:       'text-sm font-semibold text-gray-800',
        nav:                 'flex items-center gap-1',
        nav_button:          'h-7 w-7 bg-transparent hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors',
        nav_button_previous: 'absolute left-1',
        nav_button_next:     'absolute right-1',
        table:               'w-full border-collapse',
        head_row:            'flex',
        head_cell:           'text-gray-400 rounded-md w-9 font-medium text-[11px] text-center',
        row:                 'flex w-full mt-1',
        cell:                'h-9 w-9 text-center text-sm relative',
        day:                 'h-9 w-9 p-0 font-normal rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors aria-selected:opacity-100',
        day_selected:        'bg-blue-600 text-white hover:bg-blue-600 hover:text-white font-semibold rounded-lg',
        day_today:           'bg-gray-100 text-gray-900 font-semibold',
        day_disabled:        'text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
        day_outside:         'text-gray-300',
    };

    // ── Render ─────────────────────────────────────────────────────────────────

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
                            classNames={calendarClassNames}
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
                            classNames={calendarClassNames}
                        />
                    </PopoverContent>
                </Popover>
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