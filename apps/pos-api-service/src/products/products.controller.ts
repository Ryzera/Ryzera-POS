import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  // ─── Product CRUD ─────────────────────────────────────────

  @Post()
  create(@Body() data: any) {
    return this.productService.createProduct(data);
  }

  @Get()
  findAll() {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.productService.updateProduct(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  // ─── Branch Stock ─────────────────────────────────────────

  // GET /products/branch/:branchId — all products with stock for a branch
  @Get('branch/:branchId')
  getByBranch(@Param('branchId') branchId: string) {
    return this.productService.getProductsByBranch(branchId);
  }

  // GET /products/branch/:branchId/low-stock — low stock products for a branch
  @Get('branch/:branchId/low-stock')
  lowStock(@Param('branchId') branchId: string) {
    return this.productService.getLowStockProducts(branchId);
  }

  // GET /products/:productId/branch/:branchId — single product stock in a branch
  @Get(':productId/branch/:branchId')
  getOneByBranch(
    @Param('productId') productId: string,
    @Param('branchId') branchId: string,
  ) {
    return this.productService.getProductByBranch(productId, branchId);
  }

  // POST /products/:productId/branch/:branchId — assign product to a branch
  @Post(':productId/branch/:branchId')
  addToBranch(
    @Param('productId') productId: string,
    @Param('branchId') branchId: string,
    @Body() data: { stockQty?: number },
  ) {
    return this.productService.addProductToBranch(
      productId,
      branchId,
      data.stockQty,
    );
  }

  // PATCH /products/:productId/branch/:branchId/stock — update stock in a branch
  @Patch(':productId/branch/:branchId/stock')
  updateStock(
    @Param('productId') productId: string,
    @Param('branchId') branchId: string,
    @Body() data: { stockQty: number },
  ) {
    return this.productService.updateBranchStock(
      productId,
      branchId,
      data.stockQty,
    );
  }
}
