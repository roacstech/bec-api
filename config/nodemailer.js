const nodemailer = require("nodemailer");

module.exports.createNodeMailTransporter = async (props) => {
  console.log("working createNodeMailTransporter");

  const db = global.dbConnection;

  const { tenantid } = props;

  const gettenant = await db("tenants").where({ tenantid: tenantid }).first();

  const transporter = nodemailer.createTransport({
    host: gettenant?.mail_host,
    port: gettenant?.mail_port,
    secure: true,
    service: gettenant?.mail_service,

    auth: {
      user: gettenant?.user_mail,
      pass: gettenant?.app_password,
    },
  });

  return transporter;
};
