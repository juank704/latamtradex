import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '../shared/kafka';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './order.service';
import { KafkaListenerService } from './kafka-listener.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [Order, OrderItem],
        synchronize: true, // Only for development
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Order, OrderItem]),
    KafkaModule.register({
      clientId: 'order-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9093').split(','),
      groupId: process.env.KAFKA_GROUP_ID || 'order-service-group',
    }),
  ],
  providers: [OrderService, KafkaListenerService],
})
export class AppModule {}
