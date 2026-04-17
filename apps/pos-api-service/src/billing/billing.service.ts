import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { BillingRepository } from './billing.repository';

@Injectable()
export class BillingService {
  constructor(private billingRepository: BillingRepository) {}

  async createSale(dto: CreateSaleDto) {
    const invoice_number = `INV-${Date.now()}`;

    const calculatedItems = dto.items.map((item) => {
      const subtotal = item.quantity * item.unit_price;
      const discount_percent = dto.discount_type === 'item' ? (item.discount_percent ?? 0)
          : 0;
      const tax_percent = item.tax_percent ?? 0;
      const discount_amount = (subtotal * discount_percent) / 100;
      const tax_amount = ((subtotal - discount_amount) * tax_percent) / 100;
      const total_amount = subtotal - discount_amount + tax_amount;

      return {
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        cost_price: item.cost_price,
        discount_percent: item.discount_percent,
        discount_amount,
        tax_percent: item.tax_percent,
        tax_amount,
        subtotal,
        total_amount,
      };
    });

    const subtotal = calculatedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const itemDiscounts = calculatedItems.reduce((sum, i) => sum + i.discount_amount, 0);
    const itemTaxes = calculatedItems.reduce((sum, i) => sum + i.tax_amount, 0);

    const bill_discount_amount = dto.discount_type === 'bill'
        ? subtotal * ((dto.bill_discount_percent ?? 0) / 100)
        : 0;
    const total_amount = subtotal - (itemDiscounts + bill_discount_amount) + itemTaxes;

    return this.billingRepository.createSale({
      data: {
        branch_id: dto.branch_id,
        user_id: dto.user_id,
        invoice_number,
        sale_status: 'Pending',
        payment_status: 'Pending',
        subtotal,
        discount_amount: itemDiscounts + bill_discount_amount,
        tax_amount: itemTaxes,
        total_amount,
        sale_items: { create: calculatedItems },
      },
      include: { sale_items: true },
    });
  }

  async processPayment(dto: ProcessPaymentDto) {
    const sale = await this.billingRepository.findSaleById(dto.sale_id);

    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.sale_status === 'Cancelled')
      throw new BadRequestException('Cannot pay for a cancelled sale');
    if (sale.payment_status === 'Paid')
      throw new BadRequestException('Sale already paid');
    if (dto.amount_paid < sale.total_amount)
      throw new BadRequestException(`Insufficient amount. Required: ${sale.total_amount}`);

    return this.billingRepository.processPaymentTransaction(dto, sale);
  }

  async cancelSale(sale_id: number) {
    const sale = await this.billingRepository.findSaleById(sale_id);

    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.sale_status === 'Completed')
      throw new BadRequestException('Cannot cancel a completed sale.');

    return this.billingRepository.updateSale(sale_id, {
      sale_status: 'Cancelled',
    });
  }

  async getSaleById(sale_id: number) {
    const sale = await this.billingRepository.findSaleById(sale_id);
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async getAllSales(branch_id?: string) {
    return this.billingRepository.findAllSales(branch_id);
  }
}
