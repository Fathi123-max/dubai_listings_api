import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

// Create a transport for sending emails
const createTransport = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration (using SendGrid)
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  // Development configuration (using Mailtrap)
  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525, // Can also use 25, 465, 587
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Enable STARTTLS if needed (for ports 25, 587)
    tls: {
      rejectUnauthorized: false // Only for development with self-signed certificates
    },
    // Specify authentication method (optional)
    authMethod: 'PLAIN' // Can be 'PLAIN', 'LOGIN', or 'CRAM-MD5'
  });
};

// Create email template
const createTemplate = (template, data) => {
  const templatePath = `src/views/emails/${template}.pug`;
  const html = pug.renderFile(templatePath, data);
  return htmlToText.fromString(html);
};

// Send email
const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = createTransport();

  // 2) Define email options
  const mailOptions = {
    from: `Dubai Listings <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export { sendEmail, createTemplate };
