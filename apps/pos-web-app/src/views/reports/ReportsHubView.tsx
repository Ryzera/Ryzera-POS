'use client';

import { REPORT_TYPE_META } from './constants/report-type.constants';
import { ReportTypeCard }        from './components/ReportTypeCard';
import { SavedConfigsSection }   from './components/SavedConfigsSection';
import { ScheduledReportsSection } from './components/ScheduledReportsSection';

export function ReportsHubView() {
    return (
        <div className="min-h-screen bg-gray-50 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Page Header */}
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900">
                        Reports & Analytics
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1">
                        Select a report type to generate insights
                    </p>
                </div>

                {/* Report Type Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {REPORT_TYPE_META.map(meta => (
                        <ReportTypeCard key={meta.type} meta={meta} />
                    ))}
                </div>

                {/* Saved Configurations */}
                <SavedConfigsSection />

                {/* Scheduled Reports + Delivery History */}
                <ScheduledReportsSection />

            </div>
        </div>
    );
}