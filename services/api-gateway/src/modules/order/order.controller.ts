import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../../../shared/kafka';
import { EventTopics } from '../../../shared/types';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Create order request for user: ${createOrderDto.userId}`);

    await this.kafkaProducer.publishEvent(
      'order.commands',
      {
        command: 'CREATE_ORDER',
        data: createOrderDto,
      },
      createOrderDto.userId,
    );

    return {
      message: 'Order creation request received',
      status: 'pending',
    };
  }
}
