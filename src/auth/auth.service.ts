import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { JwtPayload } from './dto/jwt-payload.interface';
import { CreateAuthDto } from './dto/create-auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is approved
    if (user.verificationStatus !== 'APPROVED') {
      throw new UnauthorizedException(
        'Account not approved. Please verify your account.',
      );
    }

    return user;
  }

  async generateTokens(user: { id: number; email: string; role: Role }) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_SECRET_EXPIRATION,
    });

    // Generate and hash refresh token
    const refreshToken = randomBytes(64).toString('hex');
    // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save hashed refresh token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateTokens(user);
  }

  async register(createAuthDto: CreateAuthDto) {
    const { email, password, name, role } = createAuthDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });
    // return this.generateTokens(user);
    return true;
  }

  async refreshToken(refreshToken: string) {
    // Find user by refresh token
    const user = await this.prisma.user.findFirst({
      where: { refreshToken: { not: null } },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate refresh token
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens and update refresh token in the database
    return this.generateTokens(user);
  }

  async logout(email: string) {
    await this.prisma.user.update({
      where: { email },
      data: { refreshToken: null },
    });
  }
}
