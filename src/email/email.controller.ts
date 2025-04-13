// import { Controller, Post, Body } from '@nestjs/common';
// import { EmailService } from './email.service';

// @Controller('email')
// export class EmailController {
//   constructor(private readonly emailService: EmailService) {}

//   @Post('send-booking-confirmation')
//   async sendBookingConfirmation(
//     @Body() body: { to: string; bookingDetails: any },
//   ) {
//     return await this.emailService.sendEmail(
//       process.env.SYSTEM_EMAIL!, // Use non-null assertion operator
//       body.to,
//       'template-name',
//       body.bookingDetails,
//     );
//   }
// }
