import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { KafkaProducerService } from '../../../shared/kafka';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('catalog')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);

  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  @Post('products')
  @HttpCode(HttpStatus.ACCEPTED)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    this.logger.log(`Create product request: ${createProductDto.name}`);

    await this.kafkaProducer.publishEvent(
      'catalog.commands',
      {
        command: 'CREATE_PRODUCT',
        data: createProductDto,
      },
      createProductDto.sku,
    );

    return {
      message: 'Product creation request received',
      status: 'pending',
    };
  }

  @Get('products/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async getProduct(@Param('id') id: string) {
    this.logger.log(`Get product request: ${id}`);

    await this.kafkaProducer.publishEvent(
      'catalog.commands',
      {
        command: 'GET_PRODUCT',
        data: { productId: id },
      },
      id,
    );

    return {
      message: 'Product query request received',
      status: 'pending',
    };
  }
}
