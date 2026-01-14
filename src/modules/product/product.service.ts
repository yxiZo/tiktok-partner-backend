import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TikTokShopNodeApiClient } from '../../../sdk';
import { TIKTOK_CLIENT } from '../../config/tiktok-client.provider';
import {
  Product,
  ProductSearchParams,
  ProductCreateInput,
  ProductInventoryUpdate,
  ProductPriceUpdate,
  Category,
  CategoryAttribute,
  Brand,
  ProductImage,
} from '../../types/tiktok.types';

@Injectable()
export class ProductService {
  constructor(
    @Inject(TIKTOK_CLIENT)
    private readonly tikTokClient: TikTokShopNodeApiClient,
  ) {}

  /**
   * 搜索产品
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param params - 搜索参数
   * @returns 产品列表和分页信息
   */
  async searchProducts(
    shopCipher: string,
    accessToken: string,
    params?: ProductSearchParams,
  ) {
    if (!shopCipher || !accessToken) {
      throw new BadRequestException('Shop cipher and access token are required');
    }

    try {
      const searchRequest = {
        page_number: params?.page_number || 1,
        page_size: params?.page_size || 20,
        search_status: params?.search_status,
        title: params?.title,
        product_ids: params?.product_ids,
      };

      const result = await this.tikTokClient.api.ProductV202309Api.ProductsSearchPost(
        searchRequest.page_size || 20,
        accessToken,
        'application/json',
        undefined, // pageToken
        undefined, // categoryVersion
        shopCipher,
        searchRequest as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to search products',
        );
      }

      return {
        products: result.body.data?.products || [],
        total: result.body.data?.totalCount || 0,
        page_info: result.body.data?.nextPageToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to search products: ${error.message}`,
      );
    }
  }

  /**
   * 获取产品详情
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productId - 产品ID
   * @returns 产品详情
   */
  async getProductDetail(
    shopCipher: string,
    accessToken: string,
    productId: string,
  ): Promise<Product> {
    if (!shopCipher || !accessToken || !productId) {
      throw new BadRequestException('Shop cipher, access token and product ID are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsProductIdGet(
        productId,
        accessToken,
        'application/json',
        undefined, // returnUnderReviewVersion
        undefined, // returnDraftVersion
        undefined, // locale
        shopCipher,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get product detail',
        );
      }

      return result.body.data as any;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get product detail: ${error.message}`,
      );
    }
  }

  /**
   * 创建产品
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productData - 产品数据
   * @returns 产品ID和警告信息
   */
  async createProduct(
    shopCipher: string,
    accessToken: string,
    productData: ProductCreateInput,
  ) {
    if (!shopCipher || !accessToken) {
      throw new BadRequestException('Shop cipher and access token are required');
    }

    try {
      const createRequest = {
        product: productData,
      };

      const result = await this.tikTokClient.api.ProductV202309Api.ProductsPost(
        accessToken,
        'application/json',
        shopCipher,
        productData as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to create product',
        );
      }

      return {
        product_id: result.body.data?.productId || '',
        warnings: result.body.data?.warnings || [],
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create product: ${error.message}`,
      );
    }
  }

  /**
   * 更新产品（全量更新）
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productId - 产品ID
   * @param productData - 产品数据
   * @returns 是否成功
   */
  async updateProduct(
    shopCipher: string,
    accessToken: string,
    productId: string,
    productData: Partial<ProductCreateInput>,
  ): Promise<boolean> {
    if (!shopCipher || !accessToken || !productId) {
      throw new BadRequestException('Shop cipher, access token and product ID are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsProductIdPut(
        productId,
        accessToken,
        'application/json',
        shopCipher,
        productData as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to update product',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update product: ${error.message}`,
      );
    }
  }

  /**
   * 部分编辑产品
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productId - 产品ID
   * @param productData - 部分产品数据
   * @returns 是否成功
   */
  async partialEditProduct(
    shopCipher: string,
    accessToken: string,
    productId: string,
    productData: Partial<ProductCreateInput>,
  ): Promise<boolean> {
    if (!shopCipher || !accessToken || !productId) {
      throw new BadRequestException('Shop cipher, access token and product ID are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsProductIdPartialEditPost(
        productId,
        accessToken,
        'application/json',
        shopCipher,
        productData as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to partially edit product',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to partially edit product: ${error.message}`,
      );
    }
  }

  /**
   * 激活产品（上架）
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productIds - 产品ID列表
   * @returns 成功和失败数量
   */
  async activateProducts(
    shopCipher: string,
    accessToken: string,
    productIds: string[],
  ) {
    if (!shopCipher || !accessToken || !productIds || productIds.length === 0) {
      throw new BadRequestException('Shop cipher, access token and product IDs are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsActivatePost(
        accessToken,
        'application/json',
        shopCipher,
        { productIds },
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to activate products',
        );
      }

      const errors = result.body.data?.errors || [];
      return {
        success_count: productIds.length - errors.length,
        failed_count: errors.length,
        failed_list: errors,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to activate products: ${error.message}`,
      );
    }
  }

  /**
   * 停用产品（下架）
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productIds - 产品ID列表
   * @returns 成功和失败数量
   */
  async deactivateProducts(
    shopCipher: string,
    accessToken: string,
    productIds: string[],
  ) {
    if (!shopCipher || !accessToken || !productIds || productIds.length === 0) {
      throw new BadRequestException('Shop cipher, access token and product IDs are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsDeactivatePost(
        accessToken,
        'application/json',
        shopCipher,
        { productIds },
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to deactivate products',
        );
      }

      const errors = result.body.data?.errors || [];
      return {
        success_count: productIds.length - errors.length,
        failed_count: errors.length,
        failed_list: errors,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to deactivate products: ${error.message}`,
      );
    }
  }

  /**
   * 删除产品
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productIds - 产品ID列表
   * @returns 是否成功
   */
  async deleteProducts(
    shopCipher: string,
    accessToken: string,
    productIds: string[],
  ): Promise<boolean> {
    if (!shopCipher || !accessToken || !productIds || productIds.length === 0) {
      throw new BadRequestException('Shop cipher, access token and product IDs are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsDelete(
        accessToken,
        'application/json',
        shopCipher,
        { productIds } as any,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to delete products',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete products: ${error.message}`,
      );
    }
  }

  /**
   * 更新产品库存
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productId - 产品ID
   * @param skus - SKU库存更新列表
   * @returns 是否成功
   */
  async updateInventory(
    shopCipher: string,
    accessToken: string,
    productId: string,
    skus: ProductInventoryUpdate[],
  ): Promise<boolean> {
    if (!shopCipher || !accessToken || !productId || !skus || skus.length === 0) {
      throw new BadRequestException('All parameters are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsProductIdInventoryUpdatePost(
        productId,
        accessToken,
        'application/json',
        shopCipher,
        { skus },
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to update inventory',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update inventory: ${error.message}`,
      );
    }
  }

  /**
   * 更新产品价格
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param productId - 产品ID
   * @param skus - SKU价格更新列表
   * @returns 是否成功
   */
  async updatePrice(
    shopCipher: string,
    accessToken: string,
    productId: string,
    skus: ProductPriceUpdate[],
  ): Promise<boolean> {
    if (!shopCipher || !accessToken || !productId || !skus || skus.length === 0) {
      throw new BadRequestException('All parameters are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ProductsProductIdPricesUpdatePost(
        productId,
        accessToken,
        'application/json',
        shopCipher,
        { skus },
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to update price',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update price: ${error.message}`,
      );
    }
  }

  /**
   * 获取分类列表
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param locale - 语言（如 'en-US', 'zh-CN'）
   * @returns 分类列表
   */
  async getCategories(
    shopCipher: string,
    accessToken: string,
    locale?: string,
  ): Promise<Category[]> {
    if (!shopCipher || !accessToken) {
      throw new BadRequestException('Shop cipher and access token are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.CategoriesGet(
        accessToken,
        'application/json',
        locale,
        undefined, // keyword
        undefined, // categoryVersion
        undefined, // listingPlatform
        undefined, // includeProhibitedCategories
        shopCipher,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get categories',
        );
      }

      const categories = result.body.data?.categories || [];
      return categories.map((cat: any) => ({
        id: cat.id || '',
        parent_id: cat.parentId || '',
        local_name: cat.localName || '',
        is_leaf: cat.isLeaf || false,
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get categories: ${error.message}`,
      );
    }
  }

  /**
   * 获取分类属性
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param categoryId - 分类ID
   * @returns 分类属性列表
   */
  async getCategoryAttributes(
    shopCipher: string,
    accessToken: string,
    categoryId: string,
  ): Promise<CategoryAttribute[]> {
    if (!shopCipher || !accessToken || !categoryId) {
      throw new BadRequestException('Shop cipher, access token and category ID are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.CategoriesCategoryIdAttributesGet(
        categoryId,
        accessToken,
        'application/json',
        undefined, // locale
        undefined, // categoryVersion
        shopCipher,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get category attributes',
        );
      }

      const attributes = result.body.data?.attributes || [];
      return attributes.map((attr: any) => ({
        id: attr.id || '',
        name: attr.name || '',
        is_required: attr.isRequired || false,
        type: attr.type || '',
        values: attr.values || [],
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get category attributes: ${error.message}`,
      );
    }
  }

  /**
   * 获取品牌列表
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param params - 查询参数
   * @returns 品牌列表和总数
   */
  async getBrands(
    shopCipher: string,
    accessToken: string,
    params?: {
      page_number?: number;
      page_size?: number;
      brand_name?: string;
      category_id?: string;
    },
  ) {
    if (!shopCipher || !accessToken) {
      throw new BadRequestException('Shop cipher and access token are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.BrandsGet(
        params?.page_size || 20,
        accessToken,
        'application/json',
        params?.category_id,
        undefined, // isAuthorized
        params?.brand_name,
        undefined, // pageToken
        undefined, // categoryVersion
        shopCipher,
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to get brands',
        );
      }

      return {
        brands: result.body.data?.brands || [],
        total: result.body.data?.totalCount || 0,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get brands: ${error.message}`,
      );
    }
  }

  /**
   * 上传产品图片
   * @param shopCipher - 店铺Cipher
   * @param accessToken - Access Token
   * @param imageFile - 图片文件Buffer
   * @returns 图片信息
   */
  async uploadImage(
    shopCipher: string,
    accessToken: string,
    imageFile: Buffer,
  ): Promise<ProductImage> {
    if (!shopCipher || !accessToken || !imageFile) {
      throw new BadRequestException('Shop cipher, access token and image file are required');
    }

    try {
      const result = await this.tikTokClient.api.ProductV202309Api.ImagesUploadPost(
        accessToken,
        'multipart/form-data',
        { data: imageFile } as any,
        undefined, // useCase
      );

      if (result.body.code !== 0) {
        throw new BadRequestException(
          result.body.message || 'Failed to upload image',
        );
      }

      return {
        url: result.body.data?.url,
        uri: result.body.data?.uri,
        width: result.body.data?.width,
        height: result.body.data?.height,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to upload image: ${error.message}`,
      );
    }
  }
}
