import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private resend: Resend;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Change this based on your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or App Password
      },
    });
  }

  // SMTP
  async sendEmailSMTP(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    try {
      const html = this.compileTemplate(templateName, context);

      const response = await this.resend.emails.send({
        from: process.env.SYSTEM_EMAIL || 'sujan@mandarix.com',
        to,
        subject,
        html,
      });

      console.log('Email sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private compileTemplate(templateName: string, context: any): string {
    // Always resolve the template path relative to the root folder, ignoring dist
    const rootDir = path.resolve(__dirname, '../../../src/email/templates'); // Adjusting to src/email/templates folder
    console.log('__dirname', __dirname);
    // Construct the full path to the template
    const filePath = path.join(rootDir, `${templateName}.hbs`);

    console.log('Resolved Template Path:', filePath); // Log the resolved path for debugging

    // Read the template content
    const templateContent = fs.readFileSync(filePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    return template(context);
  }
}
