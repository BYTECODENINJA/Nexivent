import {Body, Controller, Get, Post, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginDto, RegisterDto} from "@app/common";
import {AuthGuard} from "@nestjs/passport";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }
}