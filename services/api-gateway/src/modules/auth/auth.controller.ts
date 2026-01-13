import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../../../shared/kafka';
import { EventTopics } from '../../../shared/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration request received for email: ${registerDto.email}`);

    // Publish command to Kafka - Auth service will handle it
    await this.kafkaProducer.publishEvent(
      'auth.commands',
      {
        command: 'REGISTER_USER',
        data: registerDto,
      },
      registerDto.email,
    );

    return {
      message: 'Registration request received. Please check your email.',
      status: 'pending',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login request received for email: ${loginDto.email}`);

    // Publish command to Kafka - Auth service will handle it
    await this.kafkaProducer.publishEvent(
      'auth.commands',
      {
        command: 'LOGIN_USER',
        data: loginDto,
      },
      loginDto.email,
    );

    return {
      message: 'Login request received. Processing...',
      status: 'pending',
    };
  }
}
