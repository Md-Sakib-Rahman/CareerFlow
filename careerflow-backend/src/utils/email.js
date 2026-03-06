const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to 'sendgrid', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * Sends an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text body
 * @param {string} [html] - Optional HTML body for formatted emails
 */
const sendNotificationEmail = async (to, subject, text, html = '') => {
  try {
    const mailOptions = {
      from: `"CareerFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }), // Include HTML only if it is provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} [ID: ${info.messageId}]`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

module.exports = { sendNotificationEmail };