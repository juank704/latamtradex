import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '../shared/kafka';
import { CatalogService } from './catalog.service';
import { EventTopics, OrderCreatedEvent } from '../shared/types';

@Injectable()
export class KafkaListenerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaListenerService.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly catalogService: CatalogService,
  ) {}

  async onModuleInit() {
    // Subscribe to both command and event topics
    await this.kafkaConsumer.subscribe({
      topics: ['catalog.commands', EventTopics.ORDER_CREATED],
      fromBeginning: false,
    });

    // Handler for catalog commands
    this.kafkaConsumer.registerHandler('catalog.commands', async (payload) => {
      const message = JSON.parse(payload.message.value.toString());
      this.logger.log(`Received command: ${message.command}`);

      try {
        switch (message.command) {
          case 'CREATE_PRODUCT':
            await this.catalogService.createProduct(message.data);
            break;
          case 'GET_PRODUCT':
            const product = await this.catalogService.getProduct(message.data.productId);
            this.logger.log(`Product found: ${product.sku}`);
            break;
          default:
            this.logger.warn(`Unknown command: ${message.command}`);
        }
      } catch (error) {
        this.logger.error(`Error processing command: ${message.command}`, error);
      }
    });

    // Handler for order.created events - updates stock
    this.kafkaConsumer.registerHandler(EventTopics.ORDER_CREATED, async (payload) => {
      const event: OrderCreatedEvent = JSON.parse(payload.message.value.toString());
      this.logger.log(`Received ${EventTopics.ORDER_CREATED} event for order: ${event.orderId}`);

      try {
        await this.catalogService.updateStock(event.items);
        this.logger.log(`Stock updated successfully for order: ${event.orderId}`);
      } catch (error) {
        this.logger.error(`Error updating stock for order: ${event.orderId}`, error);
      }
    });

    await this.kafkaConsumer.consume();
    this.logger.log('Kafka listener started for catalog.commands and order.created topics');
  }
}
