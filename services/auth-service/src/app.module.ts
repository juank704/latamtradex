import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from '../shared/kafka';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
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
        entities: [User],
        synchronize: true, // Only for development
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    KafkaModule.register({
      clientId: 'auth-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9093').split(','),
      groupId: process.env.KAFKA_GROUP_ID || 'auth-service-group',
    }),
  ],
  providers: [AuthService, KafkaListenerService],
})
export class AppModule {}
