import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { KafkaProducerService } from '../shared/kafka';
import { EventTopics, OrderCreatedEvent } from '../shared/types';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private kafkaProducer: KafkaProducerService,
  ) {}

  async createOrder(data: {
    userId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }): Promise<Order> {
    try {
      // Calculate total amount
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create order
      const order = this.orderRepository.create({
        userId: data.userId,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      // Create order items
      const orderItems = data.items.map((item) =>
        this.orderItemRepository.create({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          order,
        }),
      );

      order.items = orderItems;

      // Save order with items
      await this.orderRepository.save(order);

      this.logger.log(`Order created: ${order.id} for user: ${order.userId}`);

      // Publish order.created event to Kafka
      const event: OrderCreatedEvent = {
        orderId: order.id,
        userId: order.userId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      };

      await this.kafkaProducer.publishEvent(
        EventTopics.ORDER_CREATED,
        event,
        order.id,
      );

      this.logger.log(`Published ${EventTopics.ORDER_CREATED} event for order: ${order.id}`);

      return order;
    } catch (error) {
      this.logger.error('Error creating order', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      await this.orderRepository.save(order);

      this.logger.log(`Order ${orderId} status updated to: ${status}`);

      // Publish order.updated event
      await this.kafkaProducer.publishEvent(
        EventTopics.ORDER_UPDATED,
        {
          orderId: order.id,
          status: order.status,
          updatedAt: order.updatedAt.toISOString(),
        },
        order.id,
      );

      return order;
    } catch (error) {
      this.logger.error('Error updating order status', error);
      throw error;
    }
  }
}
