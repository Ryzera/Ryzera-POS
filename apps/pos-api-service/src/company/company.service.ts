import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto, UpdateCompanyDto } from '@ryzera/pos-schema';

@Injectable()
export class CompanyService {
    constructor(private readonly companyRepository: CompanyRepository) {}

    async findAll() {
        return this.companyRepository.findAll();
    }

    async findOne(id: number) {
        const company = await this.companyRepository.findById(id);
        if (!company) throw new NotFoundException(`Company #${id} not found`);
        return company;
    }

    async create(dto: CreateCompanyDto) {
        const existing = await this.companyRepository.findByCode(dto.code);
        if (existing) throw new ConflictException('Company code already exists');
        return this.companyRepository.create(dto);
    }

    async update(id: number, dto: UpdateCompanyDto) {
        await this.findOne(id);
        return this.companyRepository.update(id, dto);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.companyRepository.delete(id);
    }
}