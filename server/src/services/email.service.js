const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT, 10) || 2525,
    auth: {
      user: process.env.SMTP_USER || 'mock-user',
      pass: process.env.SMTP_PASS || 'mock-pass',
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Local Services Marketplace'}" <${process.env.EMAIL_FROM || 'noreply@marketplace.com'}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    // Non-blocking in development
    if (process.env.NODE_ENV === 'production') throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Welcome to ServeLocal, ${user.fullName}!</h2>
      <p>We are excited to have you join our marketplace platform.</p>
      <p>If you're a business owner, you can list your business and start receiving bookings. If you're a customer, feel free to browse categories and find local experts.</p>
      <p>Best regards,<br/>The ServeLocal Team</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Welcome to ServeLocal!', html });
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Please verify your email address</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Verify Email</a>
      <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Email Verification - ServeLocal', html });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Please click the button below to set a new password:</p>
      <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset Password</a>
      <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email. This link expires in 10 minutes.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Password Reset Request - ServeLocal', html });
};

const sendBookingConfirmationEmail = async (user, booking, businessName, serviceName) => {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Booking Confirmed!</h2>
      <p>Hi ${user.fullName}, your service booking has been confirmed.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Business:</strong> ${businessName}<br/>
        <strong>Service:</strong> ${serviceName}<br/>
        <strong>Date:</strong> ${new Date(booking.bookingDate).toDateString()}<br/>
        <strong>Time Slot:</strong> ${booking.timeSlot}<br/>
        <strong>Price:</strong> $${booking.price}
      </div>
      <p>Thank you for using ServeLocal!</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Booking Confirmation - ServeLocal', html });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};
