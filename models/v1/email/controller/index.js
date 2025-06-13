const { transporter } = require("../../../../config/mail");
const { createNodeMailTransporter } = require("../../../../config/nodemailer");
const service = require("../service/index");

module.exports.sendWebsiteMail = async (req, res) => {
  const { to, subject, html, from } = req.body;

  if (!to || !subject || !html) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
  }

  try {
    const mailOptions = {
      from: from || "Bec Contact <roacstech@gmail.com>",
      to,
      bcc: "roacstech@gmail.com",
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.sendConsultingFormMail = async (req, res) => {
  const {
    name,
    email,
    mobile,
    address,
    education,
    studyCountry,
    otherEducation,
    otherStudyCountry,
  } = req.body;

  try {
    // Ensure 'education' and 'studyCountry' are arrays
    const educationArray = Array.isArray(education) ? education : [];
    const studyCountryArray = Array.isArray(studyCountry) ? studyCountry : [];

    // Define the email content
    const mailOptions = {
      from: email || "Online Consulting Form <roacstech@gmail.com>", // Use user's email or fallback to a fixed one
      to: "bala@becgpl.com",
      bcc: "roacstech@gmail.com", // Add BCC recipient(s) here
      subject: "New Online Consulting Form Submission",
      text: `
        New consulting form submission:

        Full Name: ${name}
        Email: ${email}
        Mobile: ${mobile}
        Address: ${address}

        Education Background: ${educationArray.join(", ") || "N/A"}
        Other Education: ${otherEducation || "N/A"}

        Preferred Study Country: ${studyCountryArray.join(", ") || "N/A"}
        Other Study Country: ${otherStudyCountry || "N/A"}
      `,
    };

    // Send the email using the transporter (assuming transporter is already created)
    const info = await transporter.sendMail(mailOptions);

    // Send a success response
    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
};

module.exports.sendAdminEmail = async (props) => {
  try {
    // console.log("working sendAdminEmail")
    // console.log("props sendAdminEmail", props)
    const transporter = await createNodeMailTransporter({
      ...props,
      tenantid: 1,
    });

    // Send the email
    transporter.sendMail(props, (error, info) => {
      if (error) {
        console.log("Error:", error);
        if (callback) callback(error, null);
      } else {
        console.log("Email sent:", info.response);
        if (callback) callback(null, info);
      }
    });

    // if (response) {
    //   // After sending the notification, log and create the notification in the database
    //   // await service.createNotification(title, body, tenantid, userid, roleid);
    // }
  } catch (err) {
    // Log the error with details for debugging
    console.error("customerEmailController Err", err);
  }
};

module.exports.sendStaffEmail = async (props) => {
  try {
    const transporter = await createNodeMailTransporter({
      ...props,
      tenantid: 1,
    });

    // Send the email
    transporter.sendMail(props, (error, info) => {
      if (error) {
        console.log("Error:", error);
        if (callback) callback(error, null);
      } else {
        console.log("Email sent:", info.response);
        if (callback) callback(null, info);
      }
    });
  } catch (err) {
    console.error("customerEmailController Err", err);
  }
};

module.exports.sendCustomerEmail = async (props) => {
  try {
    const transporter = await createNodeMailTransporter({
      ...props,
      tenantid: 1,
    });

    // Send the email
    transporter.sendMail(props, (error, info) => {
      if (error) {
        console.log("Error:", error);
        if (callback) callback(error, null);
      } else {
        console.log("Email sent:", info.response);
        if (callback) callback(null, info);
      }
    });
  } catch (err) {
    console.error("customerEmailController Err", err);
  }
};

module.exports.sendEmail = async (props) => {
  const { title, body, fcmtoken } = props;

  try {
    console.log("sendEmailStaff", props);

    const payload = {
      notification: {
        title,
        body,
        image:
          "https://webnox.blr1.digitaloceanspaces.com/rythm_api/Rythmlogo.png",
      },
      token: fcmtoken,
    };

    const response = await admin.messaging().send(payload);

    if (response) {
      console.log("send fcm staff notification sentss");
    }
  } catch (err) {
    console.log("customerEmailController Err", err);
  }
};

module.exports.sendUserEmail = async (props) => {
  try {
    const transporter = await createNodeMailTransporter({
      ...props,
      tenantid: 1,
    });

    // Send the email
    transporter.sendMail(props, (error, info) => {
      if (error) {
        console.log("Error:", error);
        if (callback) callback(error, null);
      } else {
        console.log("Email sent:", info.response);
        if (callback) callback(null, info);
      }
    });
  } catch (err) {
    console.error("customerEmailController Err", err);
  }
};
