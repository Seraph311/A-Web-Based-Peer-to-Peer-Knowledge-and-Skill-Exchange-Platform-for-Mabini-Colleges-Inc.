const transporter = require('../config/mailer');

async function sendOTP(targetEmail, otpCode) {
  await transporter.sendMail({
    from: `"StudyBridge" <${process.env.GMAIL_USER}>`,
    to: targetEmail,
    subject: 'StudyBridge - Verify your institutional email',
    html: `
      <h2>Welcome to StudyBridge</h2>
      <p>Your OTP verification code is:</p>
      <h1 style="letter-spacing: 8px">${otpCode}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not register for StudyBridge, ignore this email.</p>
    `,
  });
}

module.exports = sendOTP;
