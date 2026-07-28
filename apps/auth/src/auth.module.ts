import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {KafkaModule} from "@app/kafka";
import {DatabaseModule} from "@app/database";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt"

@Module({
  imports: [
      KafkaModule.register('auth-service-group'),
      DatabaseModule,
      PassportModule,
      JwtModule.register({
          secret: process.env.JWT_SECRET || 'secret',
          signOptions: { expiresIn: '1h' },
      }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
