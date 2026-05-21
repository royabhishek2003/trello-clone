const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendSubscriptionEmail = async (toEmail, orgName, paymentId, amount) => {
  try {
    const mailOptions = {
      from: `"Taskify Pro" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: 'Welcome to Taskify Pro! Unlimited Boards Unlocked 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Subscription Activated!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to <strong>Taskify Pro</strong> for the workspace: <strong>${orgName}</strong>.</p>
          <p>You have successfully unlocked unlimited boards! Start collaborating with your team today.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h3 style="color: #0f172a;">Payment Receipt Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Payment ID:</strong> ${paymentId}</li>
            <li><strong>Amount Paid:</strong> Rs. ${amount / 100}</li>
            <li><strong>Subscription Status:</strong> Active</li>
          </ul>
          <p style="font-size: 0.875rem; color: #64748b; margin-top: 30px; text-align: center;">
            If you have any questions, feel free to reply directly to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send failure:', error.message);
    return false;
  }
};

module.exports = { sendSubscriptionEmail };
