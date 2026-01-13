import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { KafkaProducerService } from '../shared/kafka';
import { EventTopics, UserRegisteredEvent } from '../shared/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private kafkaProducer: KafkaProducerService,
  ) {}

  async registerUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        this.logger.warn(`User already exists: ${data.email}`);
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = this.userRepository.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role as any,
      });

      await this.userRepository.save(user);

      this.logger.log(`User registered successfully: ${user.email}`);

      // Publish user.registered event to Kafka
      const event: UserRegisteredEvent = {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      };

      await this.kafkaProducer.publishEvent(
        EventTopics.USER_REGISTERED,
        event,
        user.id,
      );

      this.logger.log(`Published ${EventTopics.USER_REGISTERED} event for user: ${user.id}`);
    } catch (error) {
      this.logger.error('Error registering user', error);
      throw error;
    }
  }

  async loginUser(data: { email: string; password: string }): Promise<any> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (!user) {
        this.logger.warn(`User not found: ${data.email}`);
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${data.email}`);
        throw new Error('Invalid credentials');
      }

      // Generate JWT
      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error('Error logging in user', error);
      throw error;
    }
  }
}
