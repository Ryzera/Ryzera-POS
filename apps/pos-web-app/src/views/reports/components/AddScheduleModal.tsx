
import { useState } from 'react';
import { useCreateSchedule } from '@/hooks/useReportsHub';
import { ReportType, ScheduleFrequency } from '@/types/reports-hub.types';
import { REPORT_TYPE_META, FREQUENCY_LABELS, ALL_BRANCHES_VALUE } from '../constants/report-type.constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateSchedulePayload } from "@/types/reports-hub.types";
import { useAuthStore } from "@/store/auth.store";
import { useBranches } from '@/hooks/useSalesReport';

// ─── Form Types ───────────────────────────────────────────────────────────────

interface ScheduleFormState {
    scheduleName:   string;
    reportType:     ReportType;
    frequency:      ScheduleFrequency;
    recipientEmail: string;
    branchId:       string;   // '' = All Branches (ADMIN only); otherwise a numeric string
}

type FormErrors = Partial<Record<keyof ScheduleFormState, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: ScheduleFormState = {
    scheduleName:   '',
    reportType:     ReportType.SALES,
    frequency:      ScheduleFrequency.WEEKLY,
    recipientEmail: '',
    branchId:       ALL_BRANCHES_VALUE,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    open:    boolean;
    onClose: () => void;
}

export function AddScheduleModal({ open, onClose }: Props) {
    const [form, setForm]     = useState<ScheduleFormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});

    const { mutate: createSchedule, isPending } = useCreateSchedule();
    const { user } = useAuthStore();
    const isAdmin = user?.roles?.includes("ADMIN") || user?.user_type === "ADMIN";    const { data: branches = [] }  = useBranches();

    // MANAGER is always locked to their own branch — resolve its display name.
    const ownBranchName =
      branches.find((b) => b.branchId === user?.branch_id)?.name ??
      "Your Branch";


  const validate = (): boolean => {
        const errs: FormErrors = {};

        if (form.scheduleName.trim().length < 3) {
            errs.scheduleName = 'Name must be at least 3 characters';
        }
        if (!EMAIL_REGEX.test(form.recipientEmail)) {
            errs.recipientEmail = 'Enter a valid email address';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        // ADMIN: whatever branch was picked in the dropdown (or undefined = All Branches).
        // MANAGER: always their own branch — the server also enforces this independently,
        // this just keeps the UI honest about what will actually be created.
        const branchId = isAdmin
          ? form.branchId !== ALL_BRANCHES_VALUE
            ? Number(form.branchId)
            : undefined
          : (user?.branch_id ?? undefined);

        const payload: CreateSchedulePayload = {
            scheduleName:   form.scheduleName.trim(),
            reportType:     form.reportType,
            frequency:      form.frequency,
            recipientEmail: form.recipientEmail.trim(),
            isActive:       true,
            branchId,
        };

        createSchedule(payload, {
            onSuccess: () => {
                setForm(INITIAL_FORM);
                setErrors({});
                onClose();
            },
        });
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        setErrors({});
        onClose();
    };

    // ─── Field helper ─────────────────────────────────────────────────────

    const field = (
        id:   keyof ScheduleFormState,
        label: string,
        children: React.ReactNode,
    ) => (
        <div>
            <label htmlFor={id} className="text-[12px] font-semibold text-gray-700">
                {label}
            </label>
            {children}
            {errors[id] && (
                <p className="text-[11px] text-red-500 mt-1">{errors[id]}</p>
            )}
        </div>
    );

    const inputCls = `mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5
                      text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500`;

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl p-6 border border-gray-100 z-[100] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold">
              Add Report Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {field(
              "scheduleName",
              "Schedule Name",
              <input
                id="scheduleName"
                type="text"
                placeholder="e.g. Weekly Sales Summary"
                value={form.scheduleName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, scheduleName: e.target.value }))
                }
                className={inputCls}
              />,
            )}

            {field(
              "reportType",
              "Report Type",
              <select
                id="reportType"
                value={form.reportType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reportType: e.target.value as ReportType,
                  }))
                }
                className={inputCls}
              >
                {REPORT_TYPE_META.map((m) => (
                  <option key={m.type} value={m.type}>
                    {m.label}
                  </option>
                ))}
              </select>,
            )}

            {field(
              "frequency",
              "Frequency",
              <select
                id="frequency"
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    frequency: e.target.value as ScheduleFrequency,
                  }))
                }
                className={inputCls}
              >
                {Object.values(ScheduleFrequency).map((freq) => (
                  <option key={freq} value={freq}>
                    {FREQUENCY_LABELS[freq] ?? freq}
                  </option>
                ))}
              </select>,
            )}

            {field(
              "branchId",
              "Branch",
              isAdmin ? (
                <select
                  id="branchId"
                  value={form.branchId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, branchId: e.target.value }))
                  }
                  className={inputCls}
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
                  id="branchId"
                  disabled
                  value={ownBranchName}
                  className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
                />
              ),
            )}

            {field(
              "recipientEmail",
              "Recipient Email",
              <input
                id="recipientEmail"
                type="email"
                placeholder="manager@example.com"
                value={form.recipientEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recipientEmail: e.target.value }))
                }
                className={inputCls}
              />,
            )}
          </div>

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
              {isPending ? "Creating…" : "Create Schedule"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
}
