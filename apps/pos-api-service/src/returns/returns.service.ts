import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReturnsRepository } from './returns.repository';
import { CreateReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
    constructor(private returnsRepository: ReturnsRepository) {}

    async processReturn(dto: CreateReturnDto) {
        const sale = await this.returnsRepository.findSaleById(dto.sale_id);

        if (!sale) throw new NotFoundException('Sale not found');
        if (sale.sale_status !== 'Completed')
            throw new BadRequestException('Only completed sales can be returned');

        const refund_amount = dto.items.reduce((sum, returnItem) => {
            const saleItem = sale.sale_items.find(
                (i: any) => i.sale_item_id === returnItem.sale_item_id,
            );
            if (!saleItem) throw new BadRequestException(`Sale item ${returnItem.sale_item_id} not found`);
            if (returnItem.quantity_returned > saleItem.quantity)
                throw new BadRequestException(`Return quantity exceeds original quantity`);

            return sum + (saleItem.unit_price * returnItem.quantity_returned);
        }, 0);

        return this.returnsRepository.createReturn({
            data: {
                saleId: dto.sale_id,
                reason: dto.reason,
                refund_method: dto.refund_method,
                return_amount: refund_amount,
                status: 'Pending',
                return_type: dto.items.length === sale.sale_items.length ? 'Full' : 'Partial',
            },
        });
    }

    async getReturnById(return_id: number) {
        const ret = await this.returnsRepository.findReturnById(return_id);
        if (!ret) throw new NotFoundException('Return not found');
        return ret;
    }

    async getAllReturns() {
        return this.returnsRepository.findAllReturns();
    }
}