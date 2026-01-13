import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '../shared/kafka';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrderModule } from './modules/order/order.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KafkaModule.register({
      clientId: 'api-gateway',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9093').split(','),
    }),
    AuthModule,
    CatalogModule,
    OrderModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
