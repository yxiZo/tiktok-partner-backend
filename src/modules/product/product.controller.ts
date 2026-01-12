import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductSearchParams, ProductCreateInput } from '../../types/tiktok.types';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * 搜索产品
   * POST /products/search
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: ProductSearchParams
   */
  @Post('search')
  async searchProducts(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Body() params: ProductSearchParams,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.productService.searchProducts(shopCipher, accessToken, params);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取产品详情
   * GET /products/:productId
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   */
  @Get(':productId')
  async getProductDetail(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('productId') productId: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const product = await this.productService.getProductDetail(shopCipher, accessToken, productId);

    return {
      success: true,
      data: { product },
    };
  }

  /**
   * 创建产品
   * POST /products
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: ProductCreateInput
   */
  @Post()
  async createProduct(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Body() productData: ProductCreateInput,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.productService.createProduct(shopCipher, accessToken, productData);

    return {
      success: true,
      message: 'Product created successfully',
      data: result,
    };
  }

  /**
   * 更新产品（全量更新）
   * PUT /products/:productId
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: Partial<ProductCreateInput>
   */
  @Put(':productId')
  async updateProduct(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('productId') productId: string,
    @Body() productData: Partial<ProductCreateInput>,
  ) {
    const accessToken = this.extractToken(authorization);
    await this.productService.updateProduct(shopCipher, accessToken, productId, productData);

    return {
      success: true,
      message: 'Product updated successfully',
    };
  }

  /**
   * 部分编辑产品
   * POST /products/:productId/partial-edit
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: Partial<ProductCreateInput>
   */
  @Post(':productId/partial-edit')
  async partialEditProduct(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('productId') productId: string,
    @Body() productData: Partial<ProductCreateInput>,
  ) {
    const accessToken = this.extractToken(authorization);
    await this.productService.partialEditProduct(shopCipher, accessToken, productId, productData);

    return {
      success: true,
      message: 'Product partially edited successfully',
    };
  }

  /**
   * 激活产品（上架）
   * POST /products/activate
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: { product_ids: string[] }
   */
  @Post('activate')
  async activateProducts(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Body('product_ids') productIds: string[],
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.productService.activateProducts(shopCipher, accessToken, productIds);

    return {
      success: true,
      message: 'Products activation completed',
      data: result,
    };
  }

  /**
   * 停用产品（下架）
   * POST /products/deactivate
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: { product_ids: string[] }
   */
  @Post('deactivate')
  async deactivateProducts(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Body('product_ids') productIds: string[],
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.productService.deactivateProducts(shopCipher, accessToken, productIds);

    return {
      success: true,
      message: 'Products deactivation completed',
      data: result,
    };
  }

  /**
   * 删除产品
   * DELETE /products
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: { product_ids: string[] }
   */
  @Delete()
  async deleteProducts(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Body('product_ids') productIds: string[],
  ) {
    const accessToken = this.extractToken(authorization);
    await this.productService.deleteProducts(shopCipher, accessToken, productIds);

    return {
      success: true,
      message: 'Products deleted successfully',
    };
  }

  /**
   * 更新产品库存
   * POST /products/:productId/inventory
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: { skus: Array<{ id: string, available_stock: number }> }
   */
  @Post(':productId/inventory')
  async updateInventory(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('productId') productId: string,
    @Body('skus') skus: Array<{ id: string; available_stock: number }>,
  ) {
    const accessToken = this.extractToken(authorization);
    await this.productService.updateInventory(shopCipher, accessToken, productId, skus);

    return {
      success: true,
      message: 'Inventory updated successfully',
    };
  }

  /**
   * 更新产品价格
   * POST /products/:productId/price
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: { skus: Array<{ id: string, price: { amount: string, currency: string } }> }
   */
  @Post(':productId/price')
  async updatePrice(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('productId') productId: string,
    @Body('skus') skus: Array<{ id: string; price: { amount: string; currency: string } }>,
  ) {
    const accessToken = this.extractToken(authorization);
    await this.productService.updatePrice(shopCipher, accessToken, productId, skus);

    return {
      success: true,
      message: 'Price updated successfully',
    };
  }

  /**
   * 获取分类列表
   * GET /products/categories
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { locale?: string }
   */
  @Get('metadata/categories')
  async getCategories(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('locale') locale?: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const categories = await this.productService.getCategories(shopCipher, accessToken, locale);

    return {
      success: true,
      data: { categories },
    };
  }

  /**
   * 获取分类属性
   * GET /products/categories/:categoryId/attributes
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   */
  @Get('metadata/categories/:categoryId/attributes')
  async getCategoryAttributes(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Param('categoryId') categoryId: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const attributes = await this.productService.getCategoryAttributes(
      shopCipher,
      accessToken,
      categoryId,
    );

    return {
      success: true,
      data: { attributes },
    };
  }

  /**
   * 获取品牌列表
   * GET /products/brands
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Query: { page_number?, page_size?, brand_name?, category_id? }
   */
  @Get('metadata/brands')
  async getBrands(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @Query('page_number') pageNumber?: number,
    @Query('page_size') pageSize?: number,
    @Query('brand_name') brandName?: string,
    @Query('category_id') categoryId?: string,
  ) {
    const accessToken = this.extractToken(authorization);
    const result = await this.productService.getBrands(shopCipher, accessToken, {
      page_number: pageNumber,
      page_size: pageSize,
      brand_name: brandName,
      category_id: categoryId,
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 上传产品图片
   * POST /products/images/upload
   * Headers: { Authorization: Bearer <access_token>, X-Shop-Cipher: <shop_cipher> }
   * Body: multipart/form-data with 'file' field
   */
  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Headers('authorization') authorization: string,
    @Headers('x-shop-cipher') shopCipher: string,
    @UploadedFile() file: any, // Changed from Express.Multer.File to any
  ) {
    const accessToken = this.extractToken(authorization);
    const imageInfo = await this.productService.uploadImage(
      shopCipher,
      accessToken,
      file.buffer,
    );

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: imageInfo,
    };
  }

  /**
   * 从Authorization header中提取token
   */
  private extractToken(authorization: string): string {
    if (!authorization) {
      throw new Error('Authorization header is required');
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }
}
