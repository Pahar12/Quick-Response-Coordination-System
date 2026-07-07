const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP credentials aren't set, just log to console for development/testing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("---------------------------------------------------------");
        console.log(`[MOCK EMAIL] To: ${options.email}`);
        console.log(`[MOCK EMAIL] Subject: ${options.subject}`);
        console.log(`[MOCK EMAIL] Message: \n${options.message}`);
        console.log("---------------------------------------------------------");
        console.log("Note: Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to send real emails.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'QRCS Admin'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
};

module.exports = sendEmail;
