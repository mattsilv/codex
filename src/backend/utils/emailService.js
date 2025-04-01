/**
 * Email service utility
 * Sends transactional emails using Resend API
 */

/**
 * Send an email using Resend API
 * @param {Object} env - Environment variables with RESEND_API_KEY
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.from="Codex <noreply@codex.silv.app>"] - Sender email
 * @returns {Promise<Object>} - API response
 */
export async function sendEmail(
  env,
  { to, subject, html, from = 'Codex <noreply@codex.silv.app>' }
) {
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
    return { success: false, error: error.message };
  }
}

/**
 * Generate a random 6-digit verification code
 * @returns {string} - 6-digit code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get expiration time for verification code (30 minutes from now)
 * @returns {string} - ISO date string
 */
export function getVerificationCodeExpiry() {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30); // 30 minutes from now
  return expiryDate.toISOString();
}

/**
 * Send a verification email with a 6-digit code
 * @param {Object} env - Environment variables
 * @param {string} email - Recipient email
 * @param {string} username - User's username
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} - Result of the send operation
 */
export async function sendVerificationEmail(env, email, username, code) {
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
