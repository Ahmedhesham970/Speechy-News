const nodemailer = require("nodemailer");
require("dotenv").config();
const express = require("express");
const generateOTP = require("./OTP-Generator");
// const OTP = Math.floor(100000 + Math.random() * 900000);
const sendVerificationMail = async (options) => {
  try {
    // Create a transporter object using SMTP transport
    const transporter = await nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.authEmail,
        pass: process.env.authPassword,
      },
    });

    const mailOptions = {
      from: `"Speechy News"<noreply@googreen2024>`,
      to: options.email,
      subject: "🔐 Verify Your Email Address",
      replyTo: "no-reply@googreen.com",
      text: `Your verification code is: <b>${generateOTP}<b>`,
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #555;">Hi there 👋,</p>
            <p style="font-size: 16px; color: #555;">Use the following One-Time Password (OTP)🔑 to verify your email address:</p>
            <div style="text-align: center; margin: 20px 0;">
            <span id="otpSpan"
    style="display:inline-block;padding:10px 16px;border-radius:8px;
           background:#f1f1f1;color:#333;font-weight:600;cursor:pointer;
           user-select:none;">
    ${generateOTP}
</span>

   </div>
   <p style="font-size: 14px; color: #888;">This code will be expired in 10 minutes 🔚.</p>
   <hr style="border: none; border-top: 1px solid #eee;" />
   <p style="font-size: 12px; color: #aaa; text-align: center;">If you didn’t request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
  console.log('from middleware',generateOTP);
  
};

module.exports = sendVerificationMail;
