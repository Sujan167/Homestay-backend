import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { log } from 'console';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    this.logger.log(`Login attempt for ${body.email}`);
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; role: Role },
  ) {
    log(`Register attempt for ${body.email}`);
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      body.role,
    );
  }
}
