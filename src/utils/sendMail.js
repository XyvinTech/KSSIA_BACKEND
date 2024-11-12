require("dotenv").config();
const { NODE_MAILER_USER, NODE_MAILER_PASS } = process.env;
const nodemailer = require("nodemailer");

const sendMail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODE_MAILER_USER,
        pass: NODE_MAILER_PASS,
      },
    });

    const mailOptions = {
      from: NODE_MAILER_USER,
      to: data.to,
      subject: data.subject,
      text: data.text,
      attachments: data.attachments,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("🚀 ~ sendMail ~ error:", error);
      } else {
        console.log("🚀 ~ Email sent: ~ response: " + info.response);
      }
    });
  } catch (error) {
    console.log("🚀 ~ sendMail ~ error:", error);
  }
};

module.exports = sendMail;
