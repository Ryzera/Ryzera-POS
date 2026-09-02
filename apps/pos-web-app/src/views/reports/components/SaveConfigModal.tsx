
import { useState } from 'react';
import { X } from 'lucide-react';
import { useSaveConfig } from '@/hooks/useReportsHub';
import { ReportType, ScheduleFrequency } from '@/types/reports-hub.types';
import { REPORT_TYPE_META, ALL_BRANCHES_VALUE } from '../constants/report-type.constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth.store";
import { useBranches } from '@/hooks/useSalesReport';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Today and 7 days ago in YYYY-MM-DD (no moment, no dayjs dependency)
function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    open:    boolean;
    onClose: () => void;
}

interface FormState {
    configName: string;
    reportType: ReportType;
    startDate:  string;
    endDate:    string;
    branchId:   string;   // '' = All Branches (ADMIN only); otherwise a numeric string
}

const INITIAL_FORM: FormState = {
    configName: '',
    reportType: ReportType.SALES,
    startDate:  daysAgoIso(7),
    endDate:    todayIso(),
    branchId:   ALL_BRANCHES_VALUE,
};

export function SaveConfigModal({ open, onClose }: Props) {
    const [form, setForm]     = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<Partial<FormState>>({});

    const { mutate: saveConfig, isPending } = useSaveConfig();
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes("ADMIN") || user?.user_type === "ADMIN";    const { data: branches = [] }  = useBranches();

    // MANAGER is always locked to their own branch — resolve its display name.
    const ownBranchName =
      branches.find((b) => b.branchId === user?.branch_id)?.name ??
      "Your Branch";

  // ─── Validation ────────────────────────────────────────────────────────

    const validate = (): boolean => {
        const errs: Partial<FormState> = {};

        if (form.configName.trim().length < 3) {
            errs.configName = 'Name must be at least 3 characters';
        }
        if (new Date(form.startDate) > new Date(form.endDate)) {
            errs.startDate = 'Start date must be before end date';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ─── Submit ────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        if (!validate()) return;

        // ADMIN: whatever branch was picked in the dropdown (or undefined = All Branches).
        // MANAGER: always their own branch — the server also enforces this independently,
        // this just keeps the UI honest about what will actually be saved.
        const branchId = isAdmin
          ? form.branchId !== ALL_BRANCHES_VALUE
            ? Number(form.branchId)
            : undefined
          : (user?.branch_id ?? undefined);

        saveConfig(
            {
                configName: form.configName.trim(),
                reportType: form.reportType,
                startDate:  form.startDate,
                endDate:    form.endDate,
                branchId,
            },
            {
                onSuccess: () => {
                    setForm(INITIAL_FORM);
                    setErrors({});
                    onClose();
                },
            },
        );
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        onClose();
    };

    // ─── Render ────────────────────────────────────────────────────────────

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl p-6 border border-gray-100 z-[100] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold">
              Save Report Configuration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Config Name */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700">
                Configuration Name
              </label>
              <input
                type="text"
                placeholder="e.g. Monday Dairy Check"
                value={form.configName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, configName: e.target.value }))
                }
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                       text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.configName && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.configName}
                </p>
              )}
            </div>

            {/* Report Type */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700">
                Report Type
              </label>
              <select
                value={form.reportType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reportType: e.target.value as ReportType,
                  }))
                }
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                       text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REPORT_TYPE_META.map((m) => (
                  <option key={m.type} value={m.type}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700">
                Branch
              </label>
              {isAdmin ? (
                <select
                  value={form.branchId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, branchId: e.target.value }))
                  }
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                           text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ALL_BRANCHES_VALUE}>All Branches</option>
                  {branches.map((b) => (
                    <option key={b.branchId} value={String(b.branchId)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  disabled
                  value={ownBranchName}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                           text-[13px] bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  max={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                           text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.startDate && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  max={todayIso()}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                                           text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5
                                   text-[13px] font-semibold text-gray-600 hover:bg-gray-50
                                   transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 bg-[#1B2559] hover:bg-[#232f6e] disabled:opacity-50
                                   text-white text-[13px] font-semibold rounded-xl py-2.5
                                   transition-colors"
            >
              {isPending ? "Saving…" : "Save Configuration"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
}
