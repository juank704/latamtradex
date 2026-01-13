import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaConsumerService } from '../shared/kafka';
import { AuthService } from './auth.service';

@Injectable()
export class KafkaListenerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaListenerService.name);

  constructor(
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    await this.kafkaConsumer.subscribe({
      topics: ['auth.commands'],
      fromBeginning: false,
    });

    this.kafkaConsumer.registerHandler('auth.commands', async (payload) => {
      const message = JSON.parse(payload.message.value.toString());
      this.logger.log(`Received command: ${message.command}`);

      try {
        switch (message.command) {
          case 'REGISTER_USER':
            await this.authService.registerUser(message.data);
            break;
          case 'LOGIN_USER':
            const result = await this.authService.loginUser(message.data);
            this.logger.log(`Login successful for: ${message.data.email}`);
            // In a real scenario, you would publish a response event or use request-reply pattern
            break;
          default:
            this.logger.warn(`Unknown command: ${message.command}`);
        }
      } catch (error) {
        this.logger.error(`Error processing command: ${message.command}`, error);
      }
    });

    await this.kafkaConsumer.consume();
    this.logger.log('Kafka listener started for auth.commands topic');
  }
}
