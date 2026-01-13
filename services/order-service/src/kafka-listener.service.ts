import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '../shared/kafka';
import { OrderService } from './order.service';

@Injectable()
export class KafkaListenerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaListenerService.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly orderService: OrderService,
  ) {}

  async onModuleInit() {
    await this.kafkaConsumer.subscribe({
      topics: ['order.commands'],
      fromBeginning: false,
    });

    this.kafkaConsumer.registerHandler('order.commands', async (payload) => {
      const message = JSON.parse(payload.message.value.toString());
      this.logger.log(`Received command: ${message.command}`);

      try {
        switch (message.command) {
          case 'CREATE_ORDER':
            await this.orderService.createOrder(message.data);
            break;
          default:
            this.logger.warn(`Unknown command: ${message.command}`);
        }
      } catch (error) {
        this.logger.error(`Error processing command: ${message.command}`, error);
      }
    });

    await this.kafkaConsumer.consume();
    this.logger.log('Kafka listener started for order.commands topic');
  }
}
