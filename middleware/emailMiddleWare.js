const _ = require("lodash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const emailController = require("../models/v1/email/controller/index");
const {
  createCustomerMailToCustomer,
  registrationMailToAdmin,
  createVisitMailToAdmin,
  createVisitMailToStaffs,
  createJobMailToAdmin,
  createJobMailToStaffs,
  assignEmployeeJobMail,
  jobStatusMailToAdmin,
  createQuotationToAdmin,
  createQuotationToCustomer,
  quotationApprovalToAdmin,
  createPriorJobToAdmin,
  createPriorJobToCustomer,
  createPriorJobToStaffs,
  serviceRequestMailToAdmin,
  forgotPasswordOTPforCustomer,
  createFoodOrderToAdmin,
} = require("../mail/mailService");

module.exports.emailMiddleWare = async (req, res, next) => {
  try {
    const fullEndpoint = req.originalUrl.replace(
      /^\/api\/[^\/]+\/v1\/dev\//,
      ""
    );
    const [mainEndpoint, subEndpoint] = fullEndpoint.split("/");

    console.log("Main Endpoint:", mainEndpoint);
    console.log("Sub Endpoint:", subEndpoint);

    // Intercept and capture the response object
    const originalSend = res.send;
    let responseObject;

    res.send = function (body) {
      try {
        responseObject = typeof body === "string" ? JSON.parse(body) : body;
      } catch (e) {
        responseObject = body; // Handle non-JSON response body
      }
      return originalSend.apply(res, arguments);
    };

    res.on("finish", async () => {
      const db = global.dbConnection;

      try {
        if (!responseObject?.status) return;

        const superAdminUsers = await db("app_users").where({
          roleid: 1,
          tenantid: 1,
        });

        const tenant = await db("tenants").where({ tenantid: 1 }).first();

        const mailProps = responseObject?.mailProps;
        const userData =
          mailProps?.userid &&
          (await db("app_users").where({ userid: mailProps.userid }).first());

        const emailPayloads = {
          admin: [],
          staff: [],
          customer: [],
          user: [],
        };

        switch (mainEndpoint) {
          case "visits":
            switch (subEndpoint) {
              case "createVisit":
                emailPayloads.admin.push(
                  await createVisitMailToAdmin(mailProps)
                );
                emailPayloads.staff.push(
                  await createVisitMailToStaffs(mailProps)
                );
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'visits': ${subEndpoint}`
                );
            }
            break;

          case "jobs":
            switch (subEndpoint) {
              case "createJob":
                emailPayloads.admin.push(await createJobMailToAdmin(mailProps));
                break;
              case "assignEmployee":
                emailPayloads.admin.push(
                  await assignEmployeeJobMail(mailProps)
                );
                emailPayloads.staff.push(
                  await assignEmployeeJobMail(mailProps)
                );
                break;
              case "jobStatus":
                emailPayloads.admin.push(await jobStatusMailToAdmin(mailProps));
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'jobs': ${subEndpoint}`
                );
            }
            break;

          case "servicerequest":
            switch (subEndpoint) {
              case "serviceApproval":
                emailPayloads.admin.push(
                  await createVisitMailToAdmin(mailProps)
                );
                emailPayloads.staff.push(
                  await createVisitMailToStaffs(mailProps)
                );
                break;
              case "createServiceRequest":
                emailPayloads.admin.push(
                  await serviceRequestMailToAdmin(mailProps)
                );
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'servicerequest': ${subEndpoint}`
                );
            }
            break;

          case "quotation":
            switch (subEndpoint) {
              case "createQuotation":
                emailPayloads.admin.push(
                  await createQuotationToAdmin(mailProps)
                );
                emailPayloads.customer.push(
                  await createQuotationToCustomer(mailProps)
                );
                break;
              case "quotationApproval":
                emailPayloads.admin.push(
                  await quotationApprovalToAdmin(mailProps)
                );
                // emailPayloads.customer.push(await createQuotationToCustomer(mailProps));
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'quotation': ${subEndpoint}`
                );
            }
            break;

          case "priorjobs":
            switch (subEndpoint) {
              case "createPriorJob":
                emailPayloads.admin.push(
                  await createPriorJobToAdmin(mailProps)
                );
                emailPayloads.customer.push(
                  await createPriorJobToCustomer(mailProps)
                );
                emailPayloads.staff.push(
                  await createPriorJobToStaffs(mailProps)
                );

                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'priorjobs': ${subEndpoint}`
                );
            }
            break;

          case "customer":
            switch (subEndpoint) {
              case "createCustomer":
                console.log("Processing 'createCustomer'");
                emailPayloads.customer.push(
                  await createCustomerMailToCustomer(mailProps)
                );
                break;
              case "loginApproval":
                console.log("Processing 'loginApproval'");
                emailPayloads.customer.push(
                  await createCustomerMailToCustomer(mailProps)
                );
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'customer': ${subEndpoint}`
                );
            }
            break;

          case "auth":
            switch (subEndpoint) {
              case "registration":
                console.log("Processing 'registration'");
                emailPayloads.admin.push(
                  await registrationMailToAdmin(mailProps)
                );
                break;
              case "validateUserEmail":
                console.log("Processing 'validateUserEmail'");
                emailPayloads.user.push(
                  await forgotPasswordOTPforCustomer(mailProps)
                );
                break;
              default:
                console.warn(
                  `Unhandled subendpoint for 'auth': ${subEndpoint}`
                );
            }
            break;

          case "foodorder":
            switch (subEndpoint) {
              case "createFoodOrder":
                console.log("Processing 'createFoodOrder'");
                emailPayloads.admin.push(
                  await createFoodOrderToAdmin(mailProps)
                );
                break;

              default:
                console.warn(
                  `Unhandled subendpoint for 'auth': ${subEndpoint}`
                );
            }
            break;

          default:
            console.warn(`Unhandled mainEndpoint: ${mainEndpoint}`);
        }

        const customerData =
          mailProps?.customerid &&
          (await db("customers")
            .where({ customerid: mailProps.customerid })
            .first());

        // Notify superadmin users, staff, and customers
        const notificationPromises = [
          ...superAdminUsers.map((user) =>
            Promise.all(
              emailPayloads.admin.map((emailData) =>
                emailController.sendAdminEmail({
                  to: user.authname,
                  subject: emailData.subject,
                  html: emailData.html,
                  tenantid: tenant.tenantid,
                })
              )
            )
          ),
          ...(mailProps?.staffDetails || []).map((staff) =>
            Promise.all(
              emailPayloads.staff.map((emailData) =>
                emailController.sendStaffEmail({
                  to: staff.email,
                  subject: emailData.subject,
                  html: emailData.html,
                  tenantid: tenant.tenantid,
                })
              )
            )
          ),
          ...(customerData
            ? emailPayloads.customer.map((emailData) =>
                emailController.sendCustomerEmail({
                  to: customerData.customerprimaryemail,
                  subject: emailData.subject,
                  html: emailData.html,
                  tenantid: tenant.tenantid,
                })
              )
            : []),
          ...(userData
            ? emailPayloads.user.map((emailData) =>
                emailController.sendUserEmail({
                  to: userData.email,
                  subject: emailData.subject,
                  html: emailData.html,
                  tenantid: tenant.tenantid,
                })
              )
            : []),
        ];

        await Promise.all(notificationPromises);
      } catch (err) {
        console.error("Error processing email middleware logic:", err);
      }
    });
  } catch (err) {
    console.error("Error in email middleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  next();
};
