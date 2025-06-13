const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: "roacstech@gmail.com",
    pass: "vtym kalz vfjd dzeh",
  },
});

module.exports = { transporter };
