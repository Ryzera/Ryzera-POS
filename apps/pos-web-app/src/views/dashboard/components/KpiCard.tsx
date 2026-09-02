
'use client';

import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
    label:     string;
    value:     string;
    icon:      LucideIcon;
    iconBg:    string;
    iconColor: string;
    trend?:    string;
}

export function KpiCard({ label, value, icon: Icon, iconBg, iconColor, trend }: KpiCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
            <div>
                <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
                <p className="text-[22px] font-bold text-gray-900">{value}</p>
                {trend && (
                    <p className="text-[11px] text-emerald-500 mt-1">{trend}</p>
                )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
        </div>
    );
}