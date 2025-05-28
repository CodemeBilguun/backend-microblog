import nodemailer from "nodemailer";

// For testing purposes, use Ethereal
let testAccount: any = null;

// Initialize transporter (with test credentials)
async function getTransporter() {
  // Always use Ethereal for testing since the .env values are placeholders
  // In a real app, you'd check for valid credentials first
  try {
    // Create a test account for demonstration
    testAccount = await nodemailer.createTestAccount();

    console.log("Created Ethereal test account:", testAccount.user);

    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error("Failed to create test email account:", error);
    throw new Error("Failed to set up email transport");
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    const transporter = await getTransporter();

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5000"
    }/api/auth/verify/${token}`;

    const mailOptions = {
      from: '"Microblog" <noreply@microblog.com>',
      to: email,
      subject: "Please verify your email address",
      text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking on the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);

    // Log preview URL for testing
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  try {
    const transporter = await getTransporter();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5000"
    }/api/auth/reset-password/${token}`;

    const mailOptions = {
      from: '"Microblog" <noreply@microblog.com>',
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please click on the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);

    // Log preview URL for testing
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
