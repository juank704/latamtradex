import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload, ConsumerSubscribeTopics } from 'kafkajs';
import { KafkaModuleOptions } from './kafka.module';

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;

@Injectable()
export class KafkaConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  constructor(
    @Inject('KAFKA_OPTIONS')
    private readonly options: KafkaModuleOptions,
  ) {
    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    if (!this.options.groupId) {
      throw new Error('groupId is required for Kafka Consumer');
    }

    this.consumer = this.kafka.consumer({
      groupId: this.options.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async subscribe(topics: ConsumerSubscribeTopics): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe(topics);
      this.logger.log(`Subscribed to topics: ${JSON.stringify(topics)}`);
    } catch (error) {
      this.logger.error('Failed to subscribe to topics', error);
      throw error;
    }
  }

  async consume(): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;

        this.logger.log(
          `Received message from topic: ${topic}, partition: ${partition}, offset: ${message.offset}`,
        );

        const handlers = this.messageHandlers.get(topic) || [];

        for (const handler of handlers) {
          try {
            await handler(payload);
          } catch (error) {
            this.logger.error(
              `Error processing message from topic ${topic}`,
              error,
            );
          }
        }
      },
    });
  }

  registerHandler(topic: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(topic) || [];
    handlers.push(handler);
    this.messageHandlers.set(topic, handlers);
    this.logger.log(`Handler registered for topic: ${topic}`);
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Kafka Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Consumer', error);
    }
  }
}
