import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {KafkaModule} from "@app/kafka";

@Module({
  imports: [KafkaModule.register('auth-service-group')],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
