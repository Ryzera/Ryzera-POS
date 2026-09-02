import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ReturnsRepository } from './returns.repository.js';
import { CreateReturnDto } from './schema/create-return.schema.js';

@Injectable()
export class ReturnsService {
    constructor(private returnsRepository: ReturnsRepository) {}

    async processReturn(dto: CreateReturnDto) {
        const sale = await this.returnsRepository.findSaleById(dto.sale_id);

        if (!sale) throw new NotFoundException('Sale not found');

        const saleStatus = (sale.sale_status || '').toLowerCase();
        if (saleStatus !== 'completed') {
            throw new BadRequestException('Only completed sales can be returned');
        }

        const refund_amount = dto.items.reduce((sum, returnItem) => {
            const saleItem = sale.saleItems.find(
                (i) => i.id === returnItem.sale_item_id,
            );
            if (!saleItem) {
                throw new BadRequestException(
                    `Sale item #${returnItem.sale_item_id} not found`,
                );
            }
            if (returnItem.quantity_returned > Number(saleItem.quantity)) {
                throw new BadRequestException(
                    'Return quantity exceeds original purchased quantity',
                );
            }

            return (
                sum + Number(saleItem.unit_price) * returnItem.quantity_returned
            );
        }, 0);

        const return_type = dto.items.length === sale.saleItems.length ? 'Full' : 'Partial';

        return this.returnsRepository.processReturnTransaction({
            sale,
            dto,
            refund_amount,
            return_type,
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