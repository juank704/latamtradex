import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { KafkaProducerService } from '../shared/kafka';
import { EventTopics, OrderItem } from '../shared/types';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private kafkaProducer: KafkaProducerService,
  ) {}

  async createProduct(data: {
    name: string;
    description: string;
    sku: string;
    price: number;
    stock: number;
    category?: string;
    imageUrl?: string;
  }): Promise<Product> {
    try {
      const product = new this.productModel(data);
      await product.save();

      this.logger.log(`Product created: ${product.sku}`);
      return product;
    } catch (error) {
      this.logger.error('Error creating product', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<Product> {
    try {
      const product = await this.productModel.findById(productId);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      this.logger.error('Error getting product', error);
      throw error;
    }
  }

  async updateStock(items: OrderItem[]): Promise<void> {
    try {
      this.logger.log(`Updating stock for ${items.length} items`);

      for (const item of items) {
        const product = await this.productModel.findById(item.productId);

        if (!product) {
          this.logger.warn(`Product not found: ${item.productId}`);
          continue;
        }

        if (product.stock < item.quantity) {
          this.logger.warn(
            `Insufficient stock for product ${item.productId}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
          // In a real system, you might want to publish a stock.insufficient event
          continue;
        }

        product.stock -= item.quantity;
        await product.save();

        this.logger.log(
          `Stock updated for product ${item.productId}: ${product.stock + item.quantity} -> ${product.stock}`,
        );

        // Publish stock.updated event
        await this.kafkaProducer.publishEvent(
          EventTopics.STOCK_UPDATED,
          {
            productId: item.productId,
            quantity: item.quantity,
            operation: 'decrease' as const,
            updatedAt: new Date().toISOString(),
          },
          item.productId,
        );
      }

      this.logger.log('Stock update completed');
    } catch (error) {
      this.logger.error('Error updating stock', error);
      throw error;
    }
  }
}
