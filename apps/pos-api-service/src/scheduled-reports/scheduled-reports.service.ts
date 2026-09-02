import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@ryzera/pos-database';

import { MailService } from '../mail/mail.service';
import { ProfitLossService } from '../profit-loss/profit-loss.service';
import { DailySummaryService } from '../daily-summary/daily-summary.service';
import { SalesReportService } from '../sales-report/sales-report.service';
import { CategoryPerformanceService } from '../category-performance/category-performance.service';
import { ProductPerformanceService } from '../product-performance/product-performance.service';
import { InventoryStatusService } from '../inventory-status/inventory-status.service';

import { ReportType } from '../modules/reports/enums/report-type.enum';
import {
  DeliveryStatus,
  ScheduleFrequency,
} from '../modules/reports/enums/delivery-status.enum';
import { JwtPayload } from '@ryzera/pos-schema';

// Minimal shape this service needs from a ReportSchedule row — Prisma's
// actual return type is a superset of this, so it's always compatible.
interface ScheduleLike {
  id: number;
  scheduleName: string;
  reportType: string;
  frequency: string;
  recipientEmail: string;
  branch_id: number | null;
  user_id: number;
}

@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly profitLossService: ProfitLossService,
    private readonly dailySummaryService: DailySummaryService,
    private readonly salesReportService: SalesReportService,
    private readonly categoryPerformanceService: CategoryPerformanceService,
    private readonly productPerformanceService: ProductPerformanceService,
    private readonly inventoryStatusService: InventoryStatusService,
  ) {}

  // Runs every 5 minutes:
  //  1. fires any schedule whose nextRunAt has passed
  //  2. retries any delivery a user reset to PENDING via the "Resend" button
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processDueWork() {
    await this.processDueSchedules();
    await this.processPendingResends();
  }

  // ─── 1. Due schedules ────────────────────────────────────────────────────

  private async processDueSchedules() {
    const due = await this.prisma.reportSchedule.findMany({
      where: { isActive: true, nextRunAt: { lte: new Date() } },
    });

    for (const schedule of due) {
      // Claim it immediately (advance nextRunAt) BEFORE sending, so a
      // slow generate/send can never be picked up twice by the next tick.
      const nextRunAt = this.calculateNextRunDate(schedule.frequency);
      await this.prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: { nextRunAt },
      });

      const { status, failureReason } = await this.deliverSchedule(schedule);

      await this.prisma.reportDelivery.create({
        data: {
          recipientEmail: schedule.recipientEmail,
          status,
          failureReason,
          schedule_id: schedule.id,
        },
      });

      this.logger.log(
        `Schedule "${schedule.scheduleName}" (#${schedule.id}) -> ${status}`,
      );
    }
  }

  // ─── 2. Manual resends (ReportsService.resendDelivery sets PENDING) ──────

  private async processPendingResends() {
    const pending = await this.prisma.reportDelivery.findMany({
      where: { status: DeliveryStatus.PENDING },
      include: { schedule: true },
    });

    for (const delivery of pending) {
      const { status, failureReason } = await this.deliverSchedule(
        delivery.schedule,
      );

      await this.prisma.reportDelivery.update({
        where: { id: delivery.id },
        data: { status, failureReason, sentAt: new Date() },
      });

      this.logger.log(`Resend of delivery #${delivery.id} -> ${status}`);
    }
  }

  // ─── Core send routine, shared by both paths above ───────────────────────

  private async deliverSchedule(
    schedule: ScheduleLike,
  ): Promise<{ status: DeliveryStatus; failureReason: string | null }> {
    try {
      const user = await this.resolveScheduleOwner(
        schedule.user_id,
        schedule.branch_id,
      );
      const { dateFrom, dateTo } = this.computeDateRange(schedule.frequency);
      const branchId = schedule.branch_id ?? undefined;

      const pdfBuffer = await this.generateReportBuffer(
        schedule.reportType,
        dateFrom,
        dateTo,
        branchId,
        user,
      );

      const filename = `${schedule.reportType}_${dateFrom}_${dateTo}.pdf`;

      await this.mailService.sendMail({
        to: schedule.recipientEmail,
        subject: `${schedule.scheduleName} — ${dateFrom} to ${dateTo}`,
        text:
          `Attached is your scheduled "${schedule.scheduleName}" report, ` +
          `covering ${dateFrom} to ${dateTo}.\n\n— Ryzera POS`,
        attachments: [
          { filename, content: pdfBuffer, contentType: 'application/pdf' },
        ],
      });

      return { status: DeliveryStatus.DELIVERED, failureReason: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unknown error while generating/sending the report';
      this.logger.error(
        `Delivery failed for schedule #${schedule.id}: ${message}`,
      );
      return { status: DeliveryStatus.FAILED, failureReason: message };
    }
  }

  // Builds a JwtPayload for the schedule's creator, so the reused export
  // methods can audit-log the way they normally do for a manual export.
  private async resolveScheduleOwner(
    userId: number,
    scheduleBranchId: number | null,
  ): Promise<JwtPayload> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    const roles = dbUser?.userRoles?.map((ur) => ur.role.name) ?? ['ADMIN'];

    return {
      userId,
      companyId: dbUser?.company_id ?? 1,
      branchId: scheduleBranchId ?? dbUser?.branch_id ?? null,
      roles,
      userType: (dbUser?.user_type as any) ?? 'ADMIN',
    };
  }

  // Delegates to each report type's existing exportPdf/exportToPdf method —
  // no PDF-generation logic is duplicated here.
  private async generateReportBuffer(
    reportType: string,
    dateFrom: string,
    dateTo: string,
    branchId: number | undefined,
    user: JwtPayload,
  ): Promise<Buffer> {
    switch (reportType) {
      case ReportType.SALES:
        return this.salesReportService.exportToPdf(
          { dateFrom, dateTo, branchId, page: 1, limit: 999_999 },
          user,
        );

      case ReportType.PRODUCT_PERFORMANCE:
        return this.productPerformanceService.exportToPdf(
          {
            dateFrom,
            dateTo,
            branchId,
            resolvedBranchId: branchId,
            page: 1,
            limit: 999_999,
          },
          user,
        );

      case ReportType.INVENTORY_STATUS:
        return this.inventoryStatusService.exportPdf({ branchId }, user);

      case ReportType.PROFIT_AND_LOSS:
        return this.profitLossService.exportPdf(
          { dateFrom, dateTo, branchId },
          user,
        );

      case ReportType.CATEGORY_PERFORMANCE:
        return this.categoryPerformanceService.exportPdf(
          { dateFrom, dateTo, branchId },
          user,
        );

      case ReportType.DAILY_SUMMARY:
        return this.dailySummaryService.exportPdf(
          { date: dateTo, branchId },
          user,
        );

      default:
        throw new Error(
          `Unsupported report type for scheduled delivery: ${reportType}`,
        );
    }
  }

  // ─── Date range per frequency ─────────────────────────────────────────────
  private computeDateRange(frequency: string): {
    dateFrom: string;
    dateTo: string;
  } {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    switch (frequency) {
      case ScheduleFrequency.WEEKLY: {
        const from = new Date(yesterday);
        from.setDate(from.getDate() - 6);
        return { dateFrom: fmt(from), dateTo: fmt(yesterday) };
      }
      case ScheduleFrequency.MONTHLY: {
        const now = new Date();
        const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastOfPrevMonth = new Date(
          firstOfThisMonth.getTime() - 86_400_000,
        );
        const firstOfPrevMonth = new Date(
          lastOfPrevMonth.getFullYear(),
          lastOfPrevMonth.getMonth(),
          1,
        );
        return {
          dateFrom: fmt(firstOfPrevMonth),
          dateTo: fmt(lastOfPrevMonth),
        };
      }
      case ScheduleFrequency.DAILY:
      default:
        return { dateFrom: fmt(yesterday), dateTo: fmt(yesterday) };
    }
  }

  private calculateNextRunDate(frequency: string): Date {
    const next = new Date();
    switch (frequency) {
      case ScheduleFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case ScheduleFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case ScheduleFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next;
  }
}
