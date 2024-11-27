

const nodemailer = require('nodemailer');

// Create a mock transporter for testing
const transporter = {
  sendMail: async (mailOptions) => {
    console.log('Mock email sent:', mailOptions);
    return Promise.resolve({ response: 'Mock email sent successfully' });
  }
};

// Function to send password reset email
const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Password Reset for OmniFlow.Ai',
    html: `
      <p>You requested a password reset for your OmniFlow.Ai account.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Function to send verification email
const sendVerificationEmail = async (to, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Email Verification for OmniFlow.Ai',
    html: `
      <p>Thank you for registering with OmniFlow.Ai.</p>
      <p>Please click on the following link to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>If you didn't register for an account, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};

