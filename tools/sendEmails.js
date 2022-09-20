const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("inside : ", process.env.EMAILEE, process.env.EMAILEE_PASS);

const sendEmail = (email, subject, text, html) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAILGMAIL,
      pass: process.env.EMAILGMAIL_PASS,
    },
  });

  transporter
    .sendMail({
      from: process.env.EMAILGMAIL,
      to: email,
      subject: text,
      text: subject,
      html: html,
    })
    .then((info) => console.log("-->email sent :-) !!", info))
    .catch((error) => console.log("-->nodemailer error : ", error));
};

module.exports={sendEmail}