
import { useRouter } from 'next/navigation';
import type { ReportTypeMeta } from '../constants/report-type.constants';

interface Props {
    meta: ReportTypeMeta;
}

export function ReportTypeCard({ meta }: Props) {
    const router = useRouter();
    const Icon   = meta.icon;

    const handleGenerate = () => router.push(meta.route);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <p className="text-[13px] font-bold text-gray-900">{meta.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    {meta.description}
                </p>
            </div>
            <button
                onClick={handleGenerate}
                className="mt-auto w-full bg-[#1B2559] hover:bg-[#232f6e] transition-colors
                           text-white text-[12px] font-semibold rounded-xl py-2.5"
            >
                Generate
            </button>
        </div>
    );
}