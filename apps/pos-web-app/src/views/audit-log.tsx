'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
    CalendarIcon,
    ClipboardList,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2,
    Lock,
    RotateCcw,
    ShieldCheck,
    Search,
} from 'lucide-react';
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useAuditLogs } from '@/hooks/useAuditLog';
import { downloadBlob, exportAuditLog } from '@/api/audit-log.api';
import { AUDIT_ACTION_OPTIONS, ACTION_BADGE_STYLES, AUDIT_LOG_PAGE_SIZE } from '@/constants/audit-log.constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { AuditAction, AuditLogExportFormat } from '@/types/audit-log.types';

const ALL_ACTIONS_VALUE = 'ALL_ACTIONS';

export default function AuditLogView() {
    const { isAdmin, isManager, loading: authLoading } = useAuth();
    const canViewAuditLog = isAdmin || isManager;

    const [username, setUsername]     = useState('');
    const [date, setDate]             = useState<Date | undefined>(undefined);
    const [action, setAction]         = useState<AuditAction | ''>('');
    const [reportType, setReportType] = useState('');
    const [page, setPage]             = useState(1);
    const [isExporting, setIsExporting] = useState<AuditLogExportFormat | null>(null);

    const filters = useMemo(() => ({
        username:   username.trim()   || undefined,
        date:       date ? format(date, 'yyyy-MM-dd') : undefined,
        action:     action || undefined,
        reportType: reportType.trim() || undefined,
        page,
        limit: AUDIT_LOG_PAGE_SIZE,
    }), [username, date, action, reportType, page]);

    const { data, isLoading, isFetching, isError, refetch } = useAuditLogs(filters, !authLoading && canViewAuditLog);
    const handleGenerate = () => setPage(1);

    const handleReset = () => {
        setUsername('');
        setDate(undefined);
        setAction('');
        setReportType('');
        setPage(1);
        refetch();
    };

    const handleExport = async (fmt: AuditLogExportFormat) => {
        setIsExporting(fmt);
        try {
            const blob = await exportAuditLog(fmt, {
                username:   filters.username,
                date:       filters.date,
                action:     filters.action,
                reportType: filters.reportType,
            });
            const stamp = new Date().toISOString().slice(0, 10);
            downloadBlob(blob, `audit-log-${stamp}.${fmt}`);
        } catch (err) {
            console.error('[AuditLog] export failed:', err);
            toast.error(`Failed to export audit log as ${fmt.toUpperCase()}`);
        } finally {
            setIsExporting(null);
        }
    };

    if (!authLoading && !canViewAuditLog) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[70vh]">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-amber-500" />
                    </div>
                    <h2 className="text-[15px] font-bold text-gray-800">Restricted Access</h2>
                    <p className="text-[13px] text-gray-500">
                        The Audit Log is only visible to Admin and Manager accounts.
                    </p>
                </div>
            </div>
        );
    }

    const rows       = data?.data ?? [];
    const pagination = data?.pagination;

    return (
      <div className="p-6 lg:p-8 flex flex-col gap-5 max-w-[1400px]">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">Audit Log</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {isAdmin
                ? "All report activity — every branch"
                : "Report activity for your branch"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold border border-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            {isAdmin ? "Admin" : "Manager"}
          </span>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[180px] flex-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Search by user
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="h-9 pl-8 text-[13px] rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-48 justify-start text-left font-normal text-[13px] rounded-lg border-gray-200"
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {date ? format(date, "MMMM do, yyyy") : "All dates"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Action
              </label>
              <Select
                value={action || ALL_ACTIONS_VALUE}
                onValueChange={(v) =>
                  setAction(v === ALL_ACTIONS_VALUE ? "" : (v as AuditAction))
                }
              >
                <SelectTrigger className="h-9 w-40 text-[13px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ACTIONS_VALUE}>All Actions</SelectItem>
                  {AUDIT_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Report Type
              </label>
              <Input
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                placeholder="All Report Types"
                className="h-9 text-[13px] rounded-lg"
              />
            </div>

            <div className="flex items-end gap-2 ml-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={handleReset}
                title="Reset filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isFetching}
                className="h-9 rounded-lg"
              >
                {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>
        </div>

        {/* ── Activity Log table ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <h3 className="text-[13px] font-bold text-gray-800">
                Activity Log
              </h3>
              {pagination && (
                <span className="text-[11px] text-gray-400">
                  ({pagination.totalRecords.toLocaleString()} records)
                </span>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={isExporting !== null}
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white text-gray-900 border border-gray-100 shadow-xl rounded-xl z-[200]">
                {" "}
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-2" /> Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="h-3.5 w-3.5 mr-2" /> Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-[13px] text-rose-600">
              Couldn&apos;t load audit log entries.
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-[13px] text-gray-400">
              No activity found for the selected filters.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      User
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Role
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Action
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Report Type
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Filters Used
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Branch
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400">
                      Date
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wide text-gray-400 text-right">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-[12.5px] font-medium text-gray-700">
                        {row.username}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-500">
                        {row.role}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                            ACTION_BADGE_STYLES[row.action],
                          )}
                        >
                          {row.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-600">
                        {row.reportType ?? "—"}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-500">
                        {row.filtersUsed || "—"}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-600">
                        {row.branchName ?? "All"}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-500">
                        {format(new Date(row.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-[12.5px] text-gray-500 text-right">
                        {row.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-[12px] text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
}
