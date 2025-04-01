/**
 * Email service utility
 * Sends transactional emails using Resend API
 */

/**
 * Email options for sending email
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Environment with Resend API key
 */
export interface EmailEnv {
  RESEND_API_KEY?: string;
  [key: string]: unknown;
}

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend API
 * @param env - Environment variables with RESEND_API_KEY
 * @param options - Email options
 * @returns API response
 */
export async function sendEmail(
  env: EmailEnv,
  { to, subject, html, from = 'Codex <noreply@codex.silv.app>' }: EmailOptions
): Promise<EmailResult> {
  try {
    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in the environment');
      throw new Error('Email service not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send email:', errorData);
      throw new Error(
        `Email sending failed: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Email sent successfully to ${to}, ID: ${data.id}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email service error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Generate a random 6-digit verification code
 * @returns 6-digit code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get expiration time for verification code (30 minutes from now)
 * @returns ISO date string
 */
export function getVerificationCodeExpiry(): string {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30); // 30 minutes from now
  return expiryDate.toISOString();
}

/**
 * Send a verification email with a 6-digit code
 * @param env - Environment variables
 * @param email - Recipient email
 * @param username - User's username
 * @param code - 6-digit verification code
 * @returns Result of the send operation
 */
export async function sendVerificationEmail(
  env: EmailEnv,
  email: string,
  username: string,
  code: string
): Promise<EmailResult> {
  const subject = 'Verify your email for Codex';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #4F46E5; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Codex</h1>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>Thank you for registering with Codex. To complete your registration, please enter the verification code below:</p>
          
          <div class="code">${code}</div>
          
          <p>This code will expire in 30 minutes.</p>
          <p>If you did not create an account with Codex, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Codex. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(env, { to: email, subject, html });
}