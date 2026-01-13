import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from '../shared/kafka';
import { Product, ProductSchema } from './schemas/product.schema';
import { CatalogService } from './catalog.service';
import { KafkaListenerService } from './kafka-listener.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
      }),
    }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    KafkaModule.register({
      clientId: 'catalog-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9093').split(','),
      groupId: process.env.KAFKA_GROUP_ID || 'catalog-service-group',
    }),
  ],
  providers: [CatalogService, KafkaListenerService],
})
export class AppModule {}
