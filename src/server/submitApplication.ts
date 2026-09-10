import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { applicationServerSchema, type ApplicationServerData } from '@/schemas/applicationSchema';
import { AdminNotificationEmail } from '@/emails/AdminNotificationEmail';
import { ApplicantConfirmationEmail } from '@/emails/ApplicantConfirmationEmail';
import { ADMIN_EMAIL, FROM_EMAIL, MAX_APPLICATIONS_PER_DAY } from '@/constants/email';

// Simple in-memory rate limiting (would use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + dayInMs });
    return true;
  }

  if (record.count >= MAX_APPLICATIONS_PER_DAY) {
    return false;
  }

  record.count++;
  return true;
}

export type SubmitApplicationResult =
  | { success: true; message: string }
  | { success: false; error: string; field?: string };

export const submitApplication = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown): ApplicationServerData => applicationServerSchema.parse(data))
  .handler(async ({ data }): Promise<SubmitApplicationResult> => {
    try {
      // Check honeypot field
      if (data.website && data.website.length > 0) {
        // Silently reject spam but return success to not tip off bots
        return { success: true, message: 'Application submitted successfully!' };
      }

      // Rate limiting by client IP
      const forwardedFor = getRequestHeader('x-forwarded-for');
      const clientIp = forwardedFor?.split(',')[0]?.trim() || getRequestHeader('x-real-ip') || 'unknown';
      if (!checkRateLimit(clientIp)) {
        return {
          success: false,
          error: 'Too many applications. Please try again tomorrow.',
        };
      }

      // Initialize Resend
      const resendApiKey = env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY is not configured');
        return {
          success: false,
          error: 'Email service is not configured. Please contact support.',
        };
      }

      const resend = new Resend(resendApiKey);

      // Prepare photo attachments
      const attachments = data.photos.map((photo, index) => ({
        filename: photo.filename || `photo-${index + 1}.jpg`,
        content: photo.base64,
        contentType: photo.contentType,
      }));

      // Send admin notification email
      const adminEmailHtml = await render(
        AdminNotificationEmail({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            city: data.city,
            country: data.country,
            dateOfBirth: data.dateOfBirth,
            instagram: data.instagram,
            agency: data.agency,
            height: data.height,
            waist: data.waist,
            bust: data.bust,
            hips: data.hips,
            shoeSize: data.shoeSize,
            hairColor: data.hairColor,
            eyeColor: data.eyeColor,
          },
          photoCount: attachments.length,
        })
      );

      const adminEmailResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New Model Application: ${data.firstName} ${data.lastName}`,
        html: adminEmailHtml,
        attachments,
      });

      if (adminEmailResult.error) {
        console.error('Failed to send admin notification:', adminEmailResult.error);
        return {
          success: false,
          error: 'Failed to submit application. Please try again.',
        };
      }

      // Send confirmation email to applicant
      const confirmationEmailHtml = await render(
        ApplicantConfirmationEmail({ firstName: data.firstName })
      );

      const confirmationResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: 'Application Received - DSTRCT',
        html: confirmationEmailHtml,
      });

      if (confirmationResult.error) {
        console.error('Failed to send confirmation email:', confirmationResult.error);
        // Don't fail the whole submission if confirmation email fails
      }

      return { success: true, message: 'Application submitted successfully!' };
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  });
