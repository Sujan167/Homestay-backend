import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { JwtPayload } from './dto/jwt-payload.interface';
import { CreateAuthDto } from './dto/create-auth.dto';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
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

  // ✅ Step 1: Request password reset (Generate token & send email)
  async requestPasswordReset(email: string) {
    // Find the user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a secure token
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the token in the database
    await this.prisma.otp.upsert({
      where: { userId: user.id },
      update: { otpCode: token, expiresAt },
      create: { userId: user.id, otpCode: token, expiresAt },
    });

    // Send password reset email
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;
    await this.emailService.sendEmailSMTP(
      user.email,
      'Password Reset Request',
      `Click the link below to reset your password: ${resetLink}`,
      `<h2>Password Reset Request</h2>
     <p>Hello ${user.name},</p>
     <p>Click the button below to reset your password:</p>
     <a href="${resetLink}" style="background-color:blue; color:white; padding:10px 15px; text-decoration:none;">Reset Password</a>
     <p>If you did not request this, please ignore this email.</p>`,
    );

    return { message: 'Password reset link sent to your email' };
  }

  // ✅ Step 2: Verify token and reset password
  async resetPassword(token: string, newPassword: string) {
    // Find the token in DB
    const resetToken = await this.prisma.otp.findFirst({
      where: { otpCode: token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Check if the token is expired
    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token has expired');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete the token after successful reset
    await this.prisma.otp.delete({
      where: { id: resetToken.id },
    });

    return { message: 'Password successfully reset' };
  }
}
