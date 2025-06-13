const _ = require("lodash");
const nodemailer = require("../config/nodemailer");
const moment = require("moment");

module.exports.staffRegistrationMail = async (props, callback) => {
    const { customername, email, contact, password, tenantid } = props;

    try {
        const transporter = await nodemailer.createNodeMailTransporter(props);

        const db = global.dbConnection;
        const gettenant = await db("tenants").where({ tenantid: tenantid }).first();

        const mailOptions = {
            to: email,
            subject: "Welcome to Our One Touch Management Team!",
            html: ` <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #f4f4f4; 
                    }
                    .container { 
                        width: 100%; 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        background-color: #ffffff; 
                        border-radius: 8px; 
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                    }
                    .logo { 
                        display: block; 
                        margin: 0 auto 20px auto; 
                        text-align: center;
                    }
                    .logo img { 
                        width: 150px; 
                    }
                    .content { 
                        margin-top: 20px; 
                        text-align: center;
                    }
                    .info-card { 
                        border: none; 
                        border-radius: 12px; 
                        padding: 20px; 
                        background: linear-gradient(145deg, #e2e2e2, #ffffff); 
                        box-shadow: 4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.9); 
                        margin-top: 20px;
                        text-align: left;
                    }
                    .info-card h2 { 
                        margin-top: 0; 
                        font-size: 20px; 
                        color: #333; 
                        border-bottom: 2px solid #ddd; 
                        padding-bottom: 10px;
                    }
                    .info-card p { 
                        margin: 0; 
                        font-size: 16px; 
                        color: #555; 
                        padding: 10px 0; 
                        border-bottom: 1px solid #ddd;
                    }
                    .info-card p:last-of-type { 
                        border-bottom: none; 
                    }
                    h1 { 
                        color: #333; 
                        font-size: 24px; 
                        margin-top: 0; 
                    }
                    p { 
                        color: #555; 
                        font-size: 16px; 
                    }
                    .footer { 
                        margin-top: 20px; 
                        text-align: center; 
                        color: #777; 
                        font-size: 14px;
                    }
                    a { 
                        color: #007bff; 
                        text-decoration: none; 
                    }
                    a:hover { 
                        text-decoration: underline; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <img src=${gettenant?.tenantimage} alt="Company Logo">
                    </div>                   
                    <div class="content">
                        <h1>Welcome to Our Team!</h1>
                        <p>Dear Employee ${customername},</p>
                        <p>We are excited to have you join our team. Your registration is complete, and we look forward to working with you.</p>
                        <div class="info-card">
                            <h2>Login Credentials</h2>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Mobile: </strong> ${contact}
                            <p><strong>Password:</strong> ${password}</p>
                        </div>
                        <p>Best regards,<br>The Team</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
                    </div>
                </div>
            </body>
            </html>`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error:", error);
                if (callback) callback(error, null);
            } else {
                console.log("Email sent:", info.response);
                if (callback) callback(null, info);
            }
        });
    } catch (err) {
        console.log(err);
        if (callback) callback(err, null);
    }
};

module.exports.customerRegistrationMail = async (props, callback) => {
    const {
        customername,
        customerprimaryemail,
        customerprimarycontact,
        password,
        tenantid,
    } = props;

    try {
        const transporter = await nodemailer.createNodeMailTransporter(props);

        const db = global.dbConnection;
        const gettenant = await db("tenants").where({ tenantid: tenantid }).first();

        const mailOptions = {
            to: customerprimaryemail,
            subject: "Welcome to Our One Touch Management Team!",
            html: `<!DOCTYPE html>
              <html>
              <head>
                  <style>
                      body { 
                          font-family: Arial, sans-serif; 
                          margin: 0; 
                          padding: 0; 
                          background-color: #f9f9f9; 
                      }
                      .container { 
                          width: 100%; 
                          max-width: 600px; 
                          margin: 20px auto; 
                          padding: 20px; 
                          background-color: #ffffff; 
                          border-radius: 8px; 
                          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); 
                      }
                      .logo { 
                          display: block; 
                          margin: 0 auto 20px auto; 
                          text-align: center; 
                      }
                      .logo img { 
                          width: 150px; 
                          height: auto; 
                      }
                      .content { 
                          text-align: center; 
                          color: #333; 
                      }
                      .content h1 { 
                          font-size: 24px; 
                          color: #444; 
                      }
                      .content p { 
                          font-size: 16px; 
                          line-height: 1.5; 
                      }
                      .info-card { 
                          margin-top: 20px; 
                          padding: 15px; 
                          border-radius: 8px; 
                          background-color: #f7f7f7; 
                          text-align: left; 
                          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); 
                      }
                      .info-card h2 { 
                          font-size: 18px; 
                          color: #333; 
                          margin-bottom: 10px; 
                          border-bottom: 1px solid #ddd; 
                          padding-bottom: 5px; 
                      }
                      .info-card p { 
                          font-size: 14px; 
                          color: #555; 
                          margin: 5px 0; 
                      }
                      .footer { 
                          margin-top: 20px; 
                          font-size: 12px; 
                          color: #888; 
                          text-align: center; 
                      }
                      .footer a { 
                          color: #0066cc; 
                          text-decoration: none; 
                      }
                      .footer a:hover { 
                          text-decoration: underline; 
                      }
                      .next-steps { 
                          margin-top: 20px; 
                          text-align: left; 
                      }
                      .next-steps ul { 
                          padding-left: 20px; 
                          font-size: 14px; 
                          line-height: 1.6; 
                      }
                      .next-steps ul li { 
                          margin-bottom: 10px; 
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="logo">
                          <img src="${gettenant?.tenantimage}" alt="Company Logo">
                      </div>
                      <div class="content">
                          <h1>Welcome to Our Team!</h1>
                          <p>Dear <strong>${customername}</strong>,</p>
                          <p>We are thrilled to have you on board with our team at <strong>${gettenant?.tenantname}</strong>. Below are your registration details:</p>
                          <div class="info-card">
                              <h2>Login Credentials</h2>
                              <p><strong>Email:</strong> ${customerprimaryemail}</p>
                              <p><strong>Mobile:</strong> ${customerprimarycontact}</p>
                              <p><strong>Password:</strong> ${password}</p>
                          </div>
                          <div class="next-steps">
                              <h2>Next Steps</h2>
                              <ul>
                                  <li>Log in to your account using the credentials provided.</li>
                                  <li>Explore our platform and familiarize yourself with the features.</li>
                                  <li>Reach out to our support team if you have any questions or need assistance.</li>
                              </ul>
                          </div>
                          <p>We look forward to a productive and successful partnership!</p>
                          <p>Best regards,<br>The ${gettenant?.tenantname} Team</p>
                      </div>
                      <div class="footer">
                          <p>If you need assistance, contact us at <a href="mailto:support@${gettenant?.tenantdomain}">support@${gettenant?.tenantdomain}</a>.</p>
                      </div>
                  </div>
              </body>
              </html>`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error:", error);
                if (callback) callback(error, null);
            } else {
                console.log("Email sent:", info.response);
                if (callback) callback(null, info);
            }
        });
    } catch (err) {
        console.log(err);
        if (callback) callback(err, null);
    }
};

// email notification
module.exports.createCustomerMailToCustomer = async (props, callback) => {
    console.log("working ✌ createCustomer mailservice");
    console.log("props", props);

    const {
        customername,
        customerprimaryemail,
        customerprimarycontact,
        password,
        tenantid,
    } = props;

    try {
        const db = global.dbConnection;
        const gettenant = await db("tenants").where({ tenantid: tenantid }).first();

        const mailOptions = {
            to: customerprimaryemail,
            subject: "Welcome to Our One Touch Management Team!",
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${gettenant?.tenantname}</title>
    <style>
        /* Custom CSS */
        body {
            background-color: #f8f9fa;
            font-family: Arial, sans-serif;
            color:rgb(51, 51, 51);
            font-size: 18px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding-top: 50px;
        }

        .card {
            background-color: #ffffff;
            border: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        .card-body {
            padding: 30px;
        }

        .card-footer {
            padding: 20px;
            background-color: #ffffff;
            text-align: center;
        }

        .text-center {
            text-align: center;
        }

        .text-primary {
            color: #007bff;
        }

        .text-muted {
            color: #6c757d;
        }

        .text-secondary {
            color: #6c757d;
        }

        .bg-light {
            background-color: #f8f9fa;
            padding: 10px 20px;
        }

        .rounded-circle {
            border-radius: 50%;
        }

        .img-fluid {
            max-width: 100%;
            height: auto;
        }

        .btn {
            display: inline-block;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            border-radius: 50px;
            text-decoration: none;
        }

         a{
            text-decoration: none;
            color: white;
        }

        .btn-primary {
            background-color: #068E44;
            color: white;
            border: none;
        }

        .btn-primary:hover {
            background-color:rgb(0, 80, 36);
        }

        .list-group {
            list-style-type: none;
            padding-left: 0;
        }

        .list-group-item {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            padding: 10px 20px;
            margin-bottom: 10px;
            border-radius: 5px;
        }

        .small {
            font-size: 0.875rem;
        }

        hr {
            border: 0;
            border-top: 1px solid #dee2e6;
            margin: 20px 0;
        }

        /* Optional: Add some padding to the footer */
        .card-footer p {
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="card-body">
                <!-- Header Section -->
                <div class="text-center mb-4">
                    <img src="${gettenant?.tenantimage}" alt="Company Logo" class="img-fluid rounded-circle" style="max-width: 120px;">
                </div>
                <h2 class="text-center text-primary mb-3">Welcome to ${gettenant?.tenantname}!</h2>
                <p class="text-center text-muted">We're excited to have you as part of our community.</p>
                <hr>
                <!-- Customer Details Section -->
                <div class="my-4 p-4">
                    <h5 class="text-secondary">Your Account Details</h5>
                    <div class="bg-light p-3 rounded shadow-sm pt-4">
                        <p><strong>Name:</strong> ${customername}</p>
                        <p><strong>Email:</strong> ${customerprimaryemail}</p>
                        <p><strong>Mobile:</strong> ${customerprimarycontact}</p>
                        <p><strong>Password:</strong> ${password}</p>
                        <p class="text-muted small">Please log in and change your password for added security.</p>
                    </div>
                </div>
                <!-- Instructions Section -->
                <div class="my-4 p-4">
                    <h5 class="text-secondary">Next Steps</h5>
                    <ul class="list-group list-group-flush my-4">
                        <li class="list-group-item">Log in to your account using the credentials provided above.</li>
                        <li class="list-group-item">Change your password after your first login.</li>
                        <li class="list-group-item">Explore the features of your account.</li>
                        <li class="list-group-item">Reach out to our support team if you need assistance.</li>
                    </ul>
                </div>
                <!-- Login Button -->
                
                <hr>
                <!-- Closing Section -->
                <p class="text-center mt-4 text-muted">Thank you for choosing ${gettenant?.tenantname}. We're here to support you every step of the way!</p>
            </div>
            <!-- Footer -->
            <div class="card-footer">
                <p class="small text-muted">
                    Need help? Contact us at 
                    <a href="mailto:support@${gettenant?.tenantdomain}" class="text-primary">support@${gettenant?.tenantdomain}</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`,
        };

        return mailOptions;
    } catch (err) {
        console.log(err);
        if (callback) callback(err, null);
    }
};

module.exports.registrationMailToAdmin = async (props, callback) => {
    // console.log("working ✌ createCustomer mailservice");
    // console.log("props", props);

    const {
        tenantid,
        customerprimaryemail,
        customerprimarycontact,
        customername,
        customertype
    } = props;

    try {
        // const transporter = await nodemailer.createNodeMailTransporter(props);

        const db = global.dbConnection;
        const gettenant = await db("tenants").where({ tenantid: tenantid }).first();

        const mailOptions = {
            to: gettenant?.primaryemail,
            subject: "New Login Request",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${gettenant?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${gettenant?.tenantname || "Company Logo"}">
            <h2>New Login Request</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customername}</p>
            <p><strong>Primary Email:</strong> ${customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerprimarycontact
                }</p>
            <p><strong>Type:</strong> ${customertype === 1 ? "Business" : "Personal"}</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${gettenant?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;

        // Send the email
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log("Error:", error);
        //         if (callback) callback(error, null);
        //     } else {
        //         console.log("Email sent:", info.response);
        //         if (callback) callback(null, info);
        //     }
        // });
    } catch (err) {
        console.log(err);
        if (callback) callback(err, null);
    }
};

// site visit

module.exports.createVisitMailToAdmin = async (props, callback) => {
    const { visitid, customerid, staffDetails } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const visitData = await db("visits").where({ visitid: visitid }).first();
        const tenantData = await db("tenants")
            .where({ tenantid: customerData.tenantid })
            .first();

        const mailOptions = {
            subject: "New Site Visit Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Site Visit Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Site Visit Details</h2>
            <p><strong>Start Date:</strong> ${visitData.visitstartdate}</p>
            <p><strong>End Date:</strong> ${visitData.visitenddate}</p>
            <p><strong>Remarks:</strong> ${visitData.visitremarks || "Not Provided"
                }</p>
        </div>

        <div class="section">
            <h2>Assigned Employees</h2>
            ${staffDetails
                    .map(
                        (staff) => `
                <p><strong>Name:</strong> ${staff.tenantstaffname}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Contact:</strong> ${staff.contact}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
            `
                    )
                    .join("")}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.createVisitMailToStaffs = async (props, callback) => {
    const { visitid, customerid, staffDetails } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const visitData = await db("visits").where({ visitid: visitid }).first();
        const tenantData = await db("tenants")
            .where({ tenantid: customerData.tenantid })
            .first();

        const mailOptions = {
            subject: "New Site Visit Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>Welcome to ${tenantData?.tenantname || "Our Company"}</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Email:</strong> ${customerData.customeremail}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Site Visit Details</h2>
            <p><strong>Start Date:</strong> ${visitData.visitstartdate}</p>
            <p><strong>End Date:</strong> ${visitData.visitenddate}</p>
            <p><strong>Location:</strong> ${visitData.visitlocation || "Not Provided"
                }</p>
            <p><strong>Remarks:</strong> ${visitData.visitremarks || "Not Provided"
                }</p>
        </div>

        <div class="section">
            <h2>Assigned Employees</h2>
            ${staffDetails
                    .map(
                        (staff) => `
                <p><strong>Name:</strong> ${staff.tenantstaffname}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Contact:</strong> ${staff.contact}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
            `
                    )
                    .join("")}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

// service request
module.exports.serviceRequestMailToAdmin = async (props, callback) => {
    const { customerid } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: customerData.tenantid })
            .first();

        const mailOptions = {
            subject: "New Service Requested!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Service Request Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

// jobs

module.exports.createJobMailToAdmin = async (props, callback) => {
    const { id, tenantid, orderstartdate, customerid } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        const mailOptions = {
            subject: "New Job Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Job Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Job Details</h2>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Start Date:</strong> ${orderstartdate}</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.assignEmployeeJobMail = async (props, callback) => {
    const {
        orderheaderid,
        id,
        orderstartdate,
        customerid,
        staffDetails,
        tenantid,
    } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        const mailOptions = {
            subject: `Technician Assigned For Job! - Id: ${id}`,
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>Technician Assigned For Job - ${id}!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Job Details</h2>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Start Date:</strong> ${orderstartdate}</p>
        </div>

        <div class="section">
            <h2>Assigned Employees</h2>
            ${staffDetails
                    .map(
                        (staff) => `
                <p><strong>Name:</strong> ${staff.tenantstaffname}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Contact:</strong> ${staff.contact}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
            `
                    )
                    .join("")}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.jobStatusMailToAdmin = async (props, callback) => {
    const { key, starttime, endtime, orderheaderid, message, deliveryid } = props;

    try {
        const db = global.dbConnection;

        const JobData = await db("orders")
            .where({ orderheaderid: orderheaderid })
            .first();

        const customerData = await db("customers")
            .where({ customerid: JobData.customerid })
            .first();

        const tenantData = await db("tenants")
            .where({ tenantid: JobData.tenantid })
            .first();

        const deliveryData = await db("deliveries")
            .where({ deliveryid: deliveryid })
            .first();

        const mailOptions = {
            subject: `${message} For ${customerData.customername}! - Job Id: ${JobData.orderuniqueid}`,
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>${message} For ${customerData.customername}!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Job Details</h2>
            <p><strong>ID:</strong> ${JobData.orderuniqueid}</p>
            <p><strong>Date:</strong> ${JobData.orderstartdate}</p>
            <p><strong>Start Time:</strong> ${deliveryData.deliverystarttime || "-"
                }</p>
            <p><strong>End Time:</strong> ${deliveryData.deliveryendtime || "-"
                }</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

// quotation

module.exports.createQuotationToAdmin = async (props, callback) => {
    const { tenantid, customerid, id, totalamount } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        const mailOptions = {
            subject: "New Quotation Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Quotation Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Quotation Details</h2>
            <p><strong>Quotation ID:</strong> ${id}</p>
            <p><strong>Total Amount:</strong> ${totalamount}</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

//
module.exports.forgotPasswordOTPforCustomer = async (props, callback) => {
    const { email, otp } = props;

    try {
        const db = global.dbConnection;
        const userData = await db("app_users").where({ email: email }).first();
        const tenantData = await db("tenants").where({ tenantid: 1 }).first();

        if (!userData) throw new Error("User not found.");
        if (!tenantData) throw new Error("Tenant not found.");

        const mailOptions = {
            subject: "Your One-Time Password (OTP) for Account Access",
            html: `<!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Roboto', sans-serif; background-color: #f9f9f9; color: #333; }
                    .container { max-width: 600px; margin: auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header img { max-height: 80px; border-radius: 50%; }
                    .header h2 { color: #007bff; }
                    .section { margin: 20px 0; }
                    .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="${tenantData.tenantimage ||
                "https://via.placeholder.com/80"
                }" alt="${tenantData.tenantname || "Company Logo"}">
                        <h2>OTP Verification</h2>
                    </div>
                    <div class="section">
                        <p>Dear ${userData.username},</p>
                        <p>Your OTP for account access is:</p>
                        <h2>${otp}</h2>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${tenantData.tenantname || "Company Name"
                }. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`,
        };

        if (callback) callback(null, mailOptions);

        return mailOptions;
    } catch (err) {
        console.error("Error in forgotPasswordOTPforCustomer:", err);
        if (callback) callback(err, null);
    }
};

module.exports.quotationApprovalToAdmin = async (props, callback) => {
    const { message, tenantid, customerid, quotationid } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers").where({ customerid }).first();
        const tenantData = await db("tenants").where({ tenantid }).first();
        const quotationData = await db("quotation").where({ quotationid }).first();

        const mailOptions = {
            subject: `${message} - ${customerData.customername}`,
            html: `<!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
                background-color: #f9f9f9;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            .header img {
                max-height: 80px;
                border-radius: 50%;
            }
            .header h2 {
                font-family: 'Poppins', sans-serif;
                color: #d9534f;
                margin-top: 10px;
            }
            .section {
                margin: 20px 0;
            }
            .section h2 {
                font-family: 'Poppins', sans-serif;
                font-size: 18px;
                color: #007bff;
                margin-bottom: 10px;
            }
            .section p {
                font-size: 14px;
                line-height: 1.6;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #aaa;
                margin-top: 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #5cb85c;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: 500;
            }
            .button:hover {
                background-color: #4cae4c;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
                <h2>${message}</h2>
            </div>
    
            <div class="section">
                <p>Dear Admin,</p>
                <p>The quotation with the following details has been <strong>${message.split(" ")[1]
                }</strong>:</p>
            </div>
    
            <div class="section">
                <h2>Customer Details</h2>
                <p><strong>Name:</strong> ${customerData.customername}</p>
                <p><strong>Email:</strong> ${customerData.customerprimaryemail
                }</p>
                <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
                <p><strong>Company:</strong> ${customerData.customercompanyname
                }</p>
            </div>
    
            <div class="section">
                <h2>Quotation Details</h2>
                <p><strong>Quotation ID:</strong> ${quotationData.quotationuniqueid
                }</p>
                <p><strong>Total Amount:</strong> AED ${quotationData.totalamount
                }</p>
                <p><strong>Status:</strong> ${message.split(" ")[1]}</p>
            </div>
    
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error("Error in quotationApprovalToAdmin:", err);
        if (callback) callback(err, null);
    }
};

// prior jobs
module.exports.createPriorJobToAdmin = async (props, callback) => {
    const { tenantid, customerid, id, orderdate, orderremarks, staffDetails } =
        props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        const mailOptions = {
            subject: "New Prior Job Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Prior Job Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Prior Job Details</h2>
            <p><strong>Prior Job ID:</strong> ${id}</p>
            <p><strong>Date:</strong> ${orderdate}</p>
            <p><strong>Remarks:</strong> ${orderremarks}</p>
        </div>

        <div class="section">
            <h2>Assigned Employees</h2>
            ${staffDetails
                    .map(
                        (staff) => `
                <p><strong>Name:</strong> ${staff.tenantstaffname}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Contact:</strong> ${staff.contact}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
            `
                    )
                    .join("")}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.createPriorJobToCustomer = async (props, callback) => {
    const { tenantid, customerid, id, orderdate, orderremarks } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers").where({ customerid }).first();
        const tenantData = await db("tenants").where({ tenantid }).first();

        const mailOptions = {
            subject: "Your Prior job is Ready!",
            html: `<!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
                background-color: #f9f9f9;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            .header img {
                max-height: 80px;
                border-radius: 50%;
            }
            .header h2 {
                font-family: 'Poppins', sans-serif;
                color: #007bff;
                margin-top: 10px;
            }
            .section {
                margin: 20px 0;
            }
            .section h2 {
                font-family: 'Poppins', sans-serif;
                font-size: 18px;
                color: #007bff;
                margin-bottom: 10px;
            }
            .section p {
                font-size: 14px;
                line-height: 1.6;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #aaa;
                margin-top: 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 20px;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: 500;
            }
            .button:hover {
                background-color: #0056b3;
                color: #fff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
                <h2>Your Prior Job is Ready!</h2>
            </div>
    
            <div class="section">
                <p>Dear ${customerData.customername},</p>
                <p>We are delighted to inform you that your prior job has been successfully prepared. Please find the details below:</p>
            </div>
    
            <div class="section">
                <h2>Customer Details</h2>
                <p><strong>Name:</strong> ${customerData.customername}</p>
                <p><strong>Email:</strong> ${customerData.customerprimaryemail
                }</p>
                <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
                <p><strong>Company:</strong> ${customerData.customercompanyname
                }</p>
            </div>
    
            <div class="section">
                <h2>Prior Job Details</h2>
                <p><strong>Prior Job ID:</strong> ${id}</p>
                <p><strong>Date:</strong> ${orderdate}</p>
                <p><strong>Remarks:</strong> ${orderremarks}</p>
                <p>We are confident that this prior job meets your requirements. If you have any questions or need further assistance, please do not hesitate to contact us.</p>
            </div>
    
            <div class="section">
                <a href="#" class="button">View Your Prior Job</a>
            </div>
    
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error("Error in createPriorjobToCustomer:", err);
        if (callback) callback(err, null);
    }
};

module.exports.createPriorJobToStaffs = async (props, callback) => {
    const { tenantid, customerid, id, orderdate, orderremarks, staffDetails } =
        props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        const mailOptions = {
            subject: "New Prior Job Created!",
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${tenantData?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${tenantData?.tenantname || "Company Logo"}">
            <h2>New Prior Job Created!</h2>
        </div>

        <div class="section">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerData.customername}</p>
            <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail
                }</p>
            <p><strong>Contact:</strong> ${customerData.customerprimarycontact
                }</p>
            <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
        </div>

        <div class="section">
            <h2>Prior Job Details</h2>
            <p><strong>Prior Job ID:</strong> ${id}</p>
            <p><strong>Date:</strong> ${orderdate}</p>
            <p><strong>Remarks:</strong> ${orderremarks}</p>
        </div>

        <div class="section">
            <h2>Assigned Employees</h2>
            ${staffDetails
                    .map(
                        (staff) => `
                <p><strong>Name:</strong> ${staff.tenantstaffname}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Contact:</strong> ${staff.contact}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
            `
                    )
                    .join("")}
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.createFoodOrderToAdmin = async (props, callback) => {
    const {
        tenantid,
        customerid,
        foodorderuniqueid,
        totalprice,
        orderaddress,
        fooddetails,
    } = props;

    try {
        const db = global.dbConnection;
        const customerData = await db("customers")
            .where({ customerid: customerid })
            .first();
        const tenantData = await db("tenants")
            .where({ tenantid: tenantid })
            .first();

        if (!tenantData || !customerData) {
            throw new Error("Tenant or Customer data not found");
        }

        // Ensure fooddetails is not empty or null
        const foodDetailsHtml = fooddetails && fooddetails.length > 0
            ? `
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Food Name</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Food Price</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Food Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${fooddetails.map((det) => {
                return `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${det.foodname}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${det.foodprice}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${det.foodquantity}</td>
                  </tr>
                `;
            }).join('')}
            </tbody>
          </table>
        `
            : "<p>No food details available for this order.</p>";

        const mailOptions = {
            subject: `New ${foodorderuniqueid} Food order has been placed!`,
            html: `<!DOCTYPE html>
  <html>
  <head>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: 'Roboto', sans-serif;
              background-color: #f9f9f9;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
          }
          .header img {
              max-height: 80px;
              border-radius: 50%;
          }
          .header h2 {
              font-family: 'Poppins', sans-serif;
              color: #007bff;
              margin-top: 10px;
          }
          .section {
              margin: 20px 0;
          }
          .section h2 {
              font-family: 'Poppins', sans-serif;
              font-size: 18px;
              color: #007bff;
              margin-bottom: 10px;
          }
          .section p {
              font-size: 14px;
              line-height: 1.6;
          }
          .footer {
              text-align: center;
              font-size: 12px;
              color: #aaa;
              margin-top: 20px;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          th, td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: left;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="${tenantData?.tenantimage || 'https://via.placeholder.com/80'}" alt="${tenantData?.tenantname || 'Company Logo'}">
              <h2>New ${foodorderuniqueid} order placed successfully!</h2>
          </div>
  
          <div class="section">
              <h2>Customer Details</h2>
              <p><strong>Name:</strong> ${customerData.customername}</p>
              <p><strong>Primary Email:</strong> ${customerData.customerprimaryemail}</p>
              <p><strong>Contact:</strong> ${customerData.customerprimarycontact}</p>
              <p><strong>Company:</strong> ${customerData.customercompanyname}</p>
          </div>
  
          <div class="section">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${foodorderuniqueid}</p>
              <p><strong>Total Amount:</strong> ${totalprice}</p>
              <p><strong>Delivery Address:</strong> ${orderaddress}</p>
          </div>
  
          <div class="section">
              <h2>Food Details</h2>
              ${foodDetailsHtml}
          </div>
  
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${tenantData?.tenantname || "Company Name"}. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};

module.exports.expDateToAdmin = async (props, callback) => {
    const {
        visaexpdate, visanumber, email, tenantstaffname, tenantstaffid, gettenant, contact, title, interval, labourcontractexpdate
    } = props;
// console.log("?????", props);


    try {
        const mailOptions = {
            to: gettenant?.primaryemail,
            subject: `${title} Expiry Notification for ${tenantstaffname} `,
            html: `<!DOCTYPE html>
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img {
            max-height: 80px;
            border-radius: 50%;
        }
        .header h2 {
            font-family: 'Poppins', sans-serif;
            color: #007bff;
            margin-top: 10px;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 18px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .section p {
            font-size: 14px;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${gettenant?.tenantimage || "https://via.placeholder.com/80"
                }" alt="${gettenant?.tenantname || "Company Logo"}">
            <h2>${title} Expiry Notification for ${tenantstaffname} </h2>
        </div>

        <div class="section">
            <h2>Employee Details</h2>
            <p><strong>Name:</strong> ${tenantstaffname}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact:</strong> ${contact}</p>
        </div>

        <div class="section">
            <h2>${title} Details</h2>
            <p><strong>${title} Number:</strong> ${title == "Emirate" ? visanumber : "N/A"}</p>
            <p><strong>Expiry Date: ${title == "Emirate" ? moment(visaexpdate).format('DD-MM-YYYY') : moment(labourcontractexpdate).format('DD-MM-YYYY')}</strong></p>
            <p><strong>Expired In: ${interval}</strong></p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${gettenant?.tenantname || "Company Name"
                }. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
        };

        return mailOptions;
    } catch (err) {
        console.error(err);
        if (callback) callback(err, null);
    }
};



