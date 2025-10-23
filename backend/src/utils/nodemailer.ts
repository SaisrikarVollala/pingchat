import { Env } from "../config/env";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",     
  port: 465,
  secure: true,            
  auth: {
    user: Env.EMAIL_USER  ,
    pass: Env.EMAIL_PASS    
  },
});

export const sendMail = async (email: string, otp: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"PingChat" <${Env.EMAIL_USER}>`,
      to: email,
      subject: `OTP Verification for PingChat: ${otp}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
          <!-- Body -->
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333333;">Your PingChat OTP Verification</h2>
            <p style="color: #555555; font-size: 16px;">Use the following One-Time Password (OTP) to complete your registration. This OTP is valid for <strong>5 minutes</strong>.</p>
            
            <!-- OTP -->
            <div style="margin: 20px 0;">
              <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; background-color: #f1f1f1; border-radius: 6px; letter-spacing: 4px;">${otp}</span>
            </div>
            
            <p style="color: #999999; font-size: 14px;">If you did not request this, please ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f4f4f7; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            © 2025 PingChat. All rights reserved.
          </div>
        </div>
      </div>
      `
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending OTP email:", err);
  }
};
