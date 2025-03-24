import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  Logger,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'This endpoint register new user in the system.',
  })
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('Register User for email: ', createAuthDto.email);
    // const { accessToken, refreshToken } =
    return await this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'This endpoint login user in the system.',
  })
  async login(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      email,
      password,
    );

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    this.logger.log(`Login successful for email: ${email}`);

    return { accessToken };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh the token',
    description: 'This endpoint refresh the access token on its expiration.',
  })
  async refreshToken(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken || body?.refreshToken;
    if (!refreshToken) {
      this.logger.warn('Refresh token is missing');
      throw new UnauthorizedException('Refresh token required');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    this.logger.log('Access token refreshed successfully');

    // Store new refresh token in HttpOnly cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Logout user',
    description: 'This endpoint Logout the user clearing token',
  })
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { email: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user || !req.user.email) {
      this.logger.warn(
        `User: ${req.user.email} not found during logout attempt`,
      );
      throw new UnauthorizedException('User not found');
    }

    await this.authService.logout(req.user.email);
    this.logger.log(`User ${req.user.email} logged out successfully`);

    // Clear refresh token from cookie
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully' };
  }

  // ✅ Step 1: Request password reset
  @Post('forgot-password')
  async requestPasswordReset(@Body('email') email: string) {
    return await this.authService.requestPasswordReset(email);
  }

  // ✅ Step 2: Reset password
  @Post('reset-password')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(token, newPassword);
  }
}
