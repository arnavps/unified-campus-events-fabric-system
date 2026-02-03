import nodemailer from 'nodemailer';

// Create a transporter using Ethereal (for testing)
// In production, use real SMTP credentials
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
    if (transporter) return;

    try {
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        console.log('Ethereal Email Configured');
        console.log('User:', testAccount.user);
        console.log('Pass:', testAccount.pass);
    } catch (error) {
        console.error('Failed to create Ethereal account, falling back to console log', error);
    }
};

// Initialize immediately
initTransporter();

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!transporter) {
        console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"UCEF System" <noreply@ucef.com>',
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return nodemailer.getTestMessageUrl(info);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendRegistrationConfirmation = async (to: string, userName: string, eventName: string) => {
    const subject = `Registration Confirmed: ${eventName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Registration Successful!</h2>
            <p>Hi ${userName},</p>
            <p>You have successfully registered for <strong>${eventName}</strong>.</p>
            <p>You can view your ticket and QR code in your dashboard.</p>
            <br>
            <p>See you there!</p>
            <p>The UCEF Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};

export const sendCertificateIssued = async (to: string, userName: string, eventName: string, certificateId: string) => {
    const subject = `Certificate Earned: ${eventName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Congratulations!</h2>
            <p>Hi ${userName},</p>
            <p>You have earned a certificate for attending <strong>${eventName}</strong>.</p>
            <p>Certificate ID: ${certificateId}</p>
            <p>You can download it from your dashboard.</p>
            <br>
            <p>Keep learning!</p>
            <p>The UCEF Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};

export const sendAnnouncementEmail = async (to: string, eventName: string, title: string, message: string) => {
    const subject = `Update for ${eventName}: ${title}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Event Update</h2>
            <p><strong>Event:</strong> ${eventName}</p>
            <hr />
            <h3>${title}</h3>
            <p>${message}</p>
            <br>
            <p>The UCEF Team</p>
        </div>
    `;
    return sendEmail(to, subject, html);
};
