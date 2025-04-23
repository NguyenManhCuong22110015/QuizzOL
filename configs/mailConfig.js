import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


export default {
    async sendVerificationEmail(email, token) {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 587, 
            secure: false, 
            auth: {
              user: 'nmcuongg2004@gmail.com', 
              pass: 'xmfm pkrx upfk ipvy', 
            },
            tls: {
                rejectUnauthorized: false
              }
          });
        
        const verifyUrl = `${process.env.APP_URL}/auth/verify/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Quizz Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2>Thank you for registering with QUIZZ!</h2>
                    <p>Please click the button below to verify your account:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${verifyUrl}" style="background-color: #c00; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify my account</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                    <p>This link will expire in 1 hours.</p>
                    <p>If you did not request this verification, please ignore this email.</p>
                </div>
            `
        };
        
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }
}