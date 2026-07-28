import {Body, Controller, Get, Post} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('register')

  register(@Body() body: {email: string}){
    return this.authService.simulateUserRegistration(body.email)
  }
}
