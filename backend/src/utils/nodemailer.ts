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

export const sendMail=async (email:string,otp:string) => {
  try {
    const info = await transporter.sendMail({
      from: `"PingChat"<${Env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification for registration",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error:", err);
  }
}

