import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { KafkaModuleOptions } from './kafka.module';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

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
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Producer', error);
    }
  }

  async produce(record: ProducerRecord): Promise<void> {
    try {
      await this.producer.send(record);
      this.logger.log(`Message sent to topic: ${record.topic}`);
    } catch (error) {
      this.logger.error(`Failed to send message to topic: ${record.topic}`, error);
      throw error;
    }
  }

  async publishEvent<T>(topic: string, event: T, key?: string): Promise<void> {
    const message = {
      key: key || Date.now().toString(),
      value: JSON.stringify(event),
      headers: {
        timestamp: Date.now().toString(),
        source: this.options.clientId,
      },
    };

    await this.produce({
      topic,
      messages: [message],
    });
  }
}
