'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  Target,
  Percent,
  PackageSearch,
  Bell,
  FileSliders,
  Lock,
  Loader2,
  Check,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useKpiSettings, useSaveAllKpiSettings } from '@/hooks/useKpiSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ALL_BRANCHES_ID,
    CHECK_FREQUENCY_OPTIONS,
    DATE_RANGE_OPTIONS,
    NOTIFICATION_RULE_FIELDS,
    ROLE_ACCESS_MATRIX,
} from '@/constants/kpi-settings.constants';
import type {
    CheckFrequencyMinutes,
    DefaultDateRange,
    KpiNotificationRules,
    KpiSalesTarget,
    SaveAllKpiSettingsPayload,
} from '@/types/kpi-settings.types';

// ─── Local editable form state ────────────────────────────────────────────────
interface SalesTargetsForm {
    monthlyByBranch: Record<number, string>; // branch_id -> amount string, 0 = All Branches
    weeklyAll:       string;
}

interface MarginForm {
    targetGrossMargin: string;
    targetNetMargin:   string;
}

interface InventoryForm {
    defaultReorderLevel: string;
    criticalStockLevel:  string;
    zeroSalesHours:      string;
}

type NotificationForm = Omit<KpiNotificationRules, 'id' | 'branch_id'>;

interface ReportDefaultsForm {
    defaultDateRange:   DefaultDateRange;
    defaultBranchView:  string;
    showTargetProgress: boolean;
}

const NOTIFICATION_DEFAULTS: NotificationForm = {
    daily_target_midday:        true,
    unusual_hourly_drop:        true,
    zero_sales_product:         true,
    low_stock_alert:            true,
    out_of_stock_alert:         true,
    daily_summary_notification: true,
    weekly_performance_summary: false,
    margin_below_target:        true,
    check_frequency_minutes:    5,
};

function toNumber(value: string, fallback = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function daysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// ─── Small reusable field wrapper — keeps every input consistent ─────────────
function Field({
                   label, sublabel, children,
               }: { label: string; sublabel?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-600">{label}</label>
            {children}
            {sublabel && <p className="text-[11px] text-gray-400">{sublabel}</p>}
        </div>
    );
}

function SectionCard({
                         icon: Icon, iconBg, iconColor, title, children,
                     }: {
    icon:      React.ElementType;
    iconBg:    string;
    iconColor: string;
    title:     string;
    children:  React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 mb-5 break-inside-avoid">            <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
                <h3 className="text-[13px] font-bold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );
}

export default function KpiSettingsView() {
    const { user, isAdmin, isManager, loading: authLoading } = useAuth();
    const canViewKpiSettings = isAdmin || isManager;

    // ADMIN always views/edits the "All Branches" (0) global settings screen,
    // with per-branch inputs alongside it. MANAGER is scoped to their own
    // branch — the backend re-pins branch_id server-side regardless of what
    // we send, but we request the right branch up front so the fetched data
    // (and the fields we render) match what they're actually allowed to see.
  const requestedBranchId = isAdmin
    ? ALL_BRANCHES_ID
    : (user?.branch_id ?? ALL_BRANCHES_ID);
    const { data, isLoading, isError, error } = useKpiSettings(requestedBranchId, !authLoading && canViewKpiSettings);
    const saveMutation = useSaveAllKpiSettings();

    const [hydrated, setHydrated] = useState(false);
    const [salesTargets, setSalesTargets]         = useState<SalesTargetsForm>({ monthlyByBranch: {}, weeklyAll: '' });
    const [margin, setMargin]                     = useState<MarginForm>({ targetGrossMargin: '', targetNetMargin: '' });
    const [inventory, setInventory]               = useState<InventoryForm>({ defaultReorderLevel: '', criticalStockLevel: '', zeroSalesHours: '' });
    const [notifications, setNotifications]       = useState<NotificationForm>(NOTIFICATION_DEFAULTS);
    const [reportDefaults, setReportDefaults]     = useState<ReportDefaultsForm>({
        defaultDateRange: 'LAST_30_DAYS', defaultBranchView: 'ALL', showTargetProgress: true,
    });

    // ADMIN edits every branch's target side by side. MANAGER only ever
    // edits their own branch — never another branch's row, never "All Branches".
    const branches = useMemo(() => {
        const all = data?.branches ?? [];
        return isAdmin ? all : all.filter((b) => b.id === user?.branch_id);
    }, [data, isAdmin, user?.branch_id]);

    const hydrateFromServer = () => {
        if (!data) return;

        const monthlyByBranch: Record<number, string> = { [ALL_BRANCHES_ID]: '' };
        branches.forEach((b) => { monthlyByBranch[b.id] = ''; });
        let weeklyAll = '';

        data.sales_targets.forEach((t) => {
            if (t.period_type === 'Monthly') {
                monthlyByBranch[t.branch_id] = String(t.target_amount);
            } else if (t.period_type === 'Weekly' && t.branch_id === ALL_BRANCHES_ID) {
                weeklyAll = String(t.target_amount);
            }
        });

        setSalesTargets({ monthlyByBranch, weeklyAll });

        setMargin({
            targetGrossMargin: data.margin_target ? String(data.margin_target.target_gross_margin) : '',
            targetNetMargin:   data.margin_target ? String(data.margin_target.target_net_margin)   : '',
        });

        setInventory({
            defaultReorderLevel: data.inventory_threshold ? String(data.inventory_threshold.default_reorder_level) : '',
            criticalStockLevel:  data.inventory_threshold ? String(data.inventory_threshold.critical_stock_level)  : '',
            zeroSalesHours:      data.inventory_threshold ? String(data.inventory_threshold.zero_sales_hours)      : '',
        });

        setNotifications(
            data.notification_rules
                ? {
                    daily_target_midday:        data.notification_rules.daily_target_midday,
                    unusual_hourly_drop:        data.notification_rules.unusual_hourly_drop,
                    zero_sales_product:         data.notification_rules.zero_sales_product,
                    low_stock_alert:            data.notification_rules.low_stock_alert,
                    out_of_stock_alert:         data.notification_rules.out_of_stock_alert,
                    daily_summary_notification: data.notification_rules.daily_summary_notification,
                    weekly_performance_summary: data.notification_rules.weekly_performance_summary,
                    margin_below_target:        data.notification_rules.margin_below_target,
                    check_frequency_minutes:    data.notification_rules.check_frequency_minutes,
                }
                : NOTIFICATION_DEFAULTS,
        );

        setReportDefaults({
            defaultDateRange:   data.report_defaults?.default_date_range  ?? 'LAST_30_DAYS',
            defaultBranchView:  data.report_defaults?.default_branch_view ?? 'ALL',
            showTargetProgress: data.report_defaults?.show_target_progress ?? true,
        });

        setHydrated(true);
    };

    useEffect(() => {
        if (data && !hydrated) hydrateFromServer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, hydrated]);

    const dailyAutoTarget = useMemo(() => {
        const monthlyAll = toNumber(salesTargets.monthlyByBranch[ALL_BRANCHES_ID] ?? '0');
        if (!monthlyAll) return 0;
        return Math.round(monthlyAll / daysInCurrentMonth());
    }, [salesTargets.monthlyByBranch]);

    const handleSaveAll = () => {
        const salesTargetRows: KpiSalesTarget[] = Object.entries(salesTargets.monthlyByBranch)
            .filter(([, value]) => value.trim() !== '')
            .map(([branchId, value]) => ({
                period_type:   'Monthly',
                target_amount: toNumber(value),
                branch_id:     Number(branchId),
            }));

        // "All Branches" weekly/daily targets are a global (branch_id = 0)
        // concept — only ADMIN manages them. MANAGER only ever submits their
        // own branch's monthly target via the loop above.
        if (isAdmin && salesTargets.weeklyAll.trim() !== '') {
            salesTargetRows.push({
                period_type:   'Weekly',
                target_amount: toNumber(salesTargets.weeklyAll),
                branch_id:     ALL_BRANCHES_ID,
            });
        }

        if (isAdmin && dailyAutoTarget > 0) {
            salesTargetRows.push({
                period_type:   'Daily',
                target_amount: dailyAutoTarget,
                branch_id:     ALL_BRANCHES_ID,
            });
        }

        if (salesTargetRows.length === 0) {
            return; // backend requires at least one sales target row
        }

        const payload: SaveAllKpiSettingsPayload = {
            sales_targets: salesTargetRows,
            margin_target: {
                target_gross_margin: toNumber(margin.targetGrossMargin),
                target_net_margin:   toNumber(margin.targetNetMargin),
                branch_id:            requestedBranchId,
            },
            inventory_threshold: {
                default_reorder_level: toNumber(inventory.defaultReorderLevel),
                critical_stock_level:  toNumber(inventory.criticalStockLevel),
                zero_sales_hours:      toNumber(inventory.zeroSalesHours),
                branch_id:              requestedBranchId,
            },
            notification_rules: {
                ...notifications,
                branch_id: requestedBranchId,
            },
            report_defaults: {
                default_date_range:   reportDefaults.defaultDateRange,
                default_branch_view:  reportDefaults.defaultBranchView,
                show_target_progress: reportDefaults.showTargetProgress,
                branch_id:             requestedBranchId,
            },
        };

        saveMutation.mutate(payload);
    };

    // ─── Access gate — matches @Roles(ROLES.ADMIN, ROLES.MANAGER) on KpiTargetsController ──
    if (!authLoading && !canViewKpiSettings) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[70vh]">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-amber-500" />
                    </div>
                    <h2 className="text-[15px] font-bold text-gray-800">Restricted Access</h2>
                    <p className="text-[13px] text-gray-500">
                        KPI Settings can only be viewed and edited by Admin and Manager accounts.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading || authLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[70vh]">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 lg:p-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <p className="text-[13px] text-rose-600 font-medium">
                        Couldn&apos;t load KPI settings. {(error as Error)?.message ?? ''}
                    </p>
                </div>
            </div>
        );
    }

    return (
      <div className="p-6 lg:p-8 flex flex-col gap-5 max-w-[1400px]">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">
              KPI Settings
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Configure sales targets, notification rules, and report
              preferences
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold border border-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isAdmin ? "Admin" : "Manager"}
          </span>
        </div>

        <div className="columns-1 lg:columns-2 gap-5">
          {/* ── Sales Targets ──────────────────────────────────────── */}
          <SectionCard
            icon={Target}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Sales Targets"
          >
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Monthly Targets
              </p>
              <div className="grid grid-cols-2 gap-3">
                {isAdmin && (
                  <Field label="All Branches (Monthly)">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={
                        salesTargets.monthlyByBranch[ALL_BRANCHES_ID] ?? ""
                      }
                      onChange={(e) =>
                        setSalesTargets((s) => ({
                          ...s,
                          monthlyByBranch: {
                            ...s.monthlyByBranch,
                            [ALL_BRANCHES_ID]: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                )}
                {branches.map((b) => (
                  <Field key={b.id} label={`${b.name} (Monthly)`}>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={salesTargets.monthlyByBranch[b.id] ?? ""}
                      onChange={(e) =>
                        setSalesTargets((s) => ({
                          ...s,
                          monthlyByBranch: {
                            ...s.monthlyByBranch,
                            [b.id]: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                ))}
              </div>

              {isAdmin && (
                <>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                    Weekly Targets
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="All Branches (Weekly)">
                      <Input
                        type="number"
                        inputMode="decimal"
                        value={salesTargets.weeklyAll}
                        onChange={(e) =>
                          setSalesTargets((s) => ({
                            ...s,
                            weeklyAll: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field
                      label="Daily Target (All)"
                      sublabel="Auto-calc from monthly"
                    >
                      <Input
                        type="text"
                        disabled
                        value={
                          dailyAutoTarget
                            ? dailyAutoTarget.toLocaleString()
                            : ""
                        }
                        className="bg-gray-50 text-gray-400"
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* ── Profit Margin Targets ──────────────────────────────── */}
          <SectionCard
            icon={Percent}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="Profit Margin Targets"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Gross Margin (%)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={margin.targetGrossMargin}
                  onChange={(e) =>
                    setMargin((m) => ({
                      ...m,
                      targetGrossMargin: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Target Net Margin (%)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={margin.targetNetMargin}
                  onChange={(e) =>
                    setMargin((m) => ({
                      ...m,
                      targetNetMargin: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── Inventory Thresholds ───────────────────────────────── */}
          <SectionCard
            icon={PackageSearch}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            title="Inventory Thresholds"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default Reorder Level">
                <Input
                  type="number"
                  value={inventory.defaultReorderLevel}
                  onChange={(e) =>
                    setInventory((v) => ({
                      ...v,
                      defaultReorderLevel: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field
                label="Critical Stock Level"
                sublabel="Triggers urgent alert"
              >
                <Input
                  type="number"
                  value={inventory.criticalStockLevel}
                  onChange={(e) =>
                    setInventory((v) => ({
                      ...v,
                      criticalStockLevel: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field
                label="Zero-Sales Alert (hours)"
                sublabel="Alert if product has no sales"
              >
                <Input
                  type="number"
                  value={inventory.zeroSalesHours}
                  onChange={(e) =>
                    setInventory((v) => ({
                      ...v,
                      zeroSalesHours: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── Notification Rules ─────────────────────────────────── */}
          <SectionCard
            icon={Bell}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            title="Notification Rules"
          >
            <div className="flex flex-col divide-y divide-gray-50">
              {NOTIFICATION_RULE_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0"
                >
                  <div>
                    <p className="text-[12.5px] font-medium text-gray-700">
                      {field.label}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {field.description}
                    </p>
                  </div>
                  <Switch
                    checked={
                      notifications[
                        field.key as keyof NotificationForm
                      ] as boolean
                    }
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({ ...n, [field.key]: checked }))
                    }
                  />
                </div>
              ))}

              <div className="pt-3 flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-gray-600">
                  Notification Check Frequency
                </label>
                <Select
                  value={String(notifications.check_frequency_minutes)}
                  onValueChange={(v) =>
                    setNotifications((n) => ({
                      ...n,
                      check_frequency_minutes: Number(
                        v,
                      ) as CheckFrequencyMinutes,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-100 shadow-xl rounded-xl z-[200]">
                    {CHECK_FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-400">
                  How often the system checks alert conditions
                </p>
              </div>
            </div>
          </SectionCard>

          {/* ── Report Default Settings ────────────────────────────── */}
          <SectionCard
            icon={FileSliders}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Report Default Settings"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default Date Range">
                <Select
                  value={reportDefaults.defaultDateRange}
                  onValueChange={(v) =>
                    setReportDefaults((r) => ({
                      ...r,
                      defaultDateRange: v as DefaultDateRange,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Default Branch View">
                <Select
                  value={reportDefaults.defaultBranchView}
                  onValueChange={(v) =>
                    setReportDefaults((r) => ({ ...r, defaultBranchView: v }))
                  }
                >
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin && (
                      <SelectItem value="ALL">All Branches</SelectItem>
                    )}
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-[12.5px] font-medium text-gray-700">
                  Show target progress on Dashboard
                </p>
                <p className="text-[11px] text-gray-400">
                  Display monthly target progress bar
                </p>
              </div>
              <Switch
                checked={reportDefaults.showTargetProgress}
                onCheckedChange={(checked) =>
                  setReportDefaults((r) => ({
                    ...r,
                    showTargetProgress: checked,
                  }))
                }
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Save / Cancel ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveAll}
            disabled={saveMutation.isPending}
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {saveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save All Changes
          </Button>
          <Button
            variant="outline"
            onClick={hydrateFromServer}
            disabled={saveMutation.isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
}
