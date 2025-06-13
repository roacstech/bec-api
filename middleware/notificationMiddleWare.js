const _ = require("lodash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const notificationController = require("../models/v1/notification/controller/index");
const {
  getStaff,
  getUser,
  getCustomer,
  getMultipleStaffs,
  getVisitData,
} = require("../models/v1/notification/service/index");

const verifyToken = async (accessToken) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    console.log("Token is valid:", decoded);
    return true; // Token is valid
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token has expired");
    } else {
      console.log("Invalid token:", error.message);
    }
    return false; // Token is invalid or expired
  }
};

const deleteExpiredToken = async (userid) => {
  const db = global.dbConnection;
  await db("fcmtokens").where({ userid }).del();
};

// Initialize the Firebase Admin SDK

module.exports.notificationMiddleWare = async (req, res, next) => {
  try {
    const fullendpoint = req.originalUrl.replace(
      /^\/api\/[^\/]+\/v1\/dev\//,
      ""
    );
    const mainendpoint = fullendpoint.split("/")[0];
    const subendpoint = fullendpoint.split("/")[1];

    // Retrieve the access token
    // const accesstoken = req.headers["auth"];
    // if (!accesstoken) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized: No access token provided" });
    // }

    // Decode the token
    // let decodedAccessToken;
    // try {
    //   decodedAccessToken = jwt.decode(accesstoken);
    // } catch (err) {
    //   return res.status(401).json({ message: "Unauthorized: Invalid token" });
    // }

    // Capture the response object for processing
    const originalSend = res.send;
    let responseObject;

    res.send = function (body) {
      try {
        responseObject = typeof body === "string" ? JSON.parse(body) : body;
      } catch (e) {
        responseObject = body;
      }
      return originalSend.apply(res, arguments);
    };

    res.on("finish", async () => {
      let notificationpayload = [];
      let staffnotificationpayload = [];
      let customernotificationpayload = [];

      const db = global.dbConnection;

      const superadminusers = await db("fcmtokens").where({
        roleid: 1,
        tenantid: 1,
      });

      try {
        if (responseObject?.status) {
          // console.log("fullendpoint:", fullendpoint);
          // console.log("mainendpoint:", mainendpoint);
          // console.log("subendpoint:", subendpoint);

          switch (mainendpoint) {
            case "auth":
              if (subendpoint === "registration") {
                notificationpayload.push({
                  title: `New Customer for request: ${responseObject?.notifydata?.customername}`,
                  body: `We are pleased to inform you that a new customer request, ${responseObject?.notifydata?.customername} (Customer ID: ${responseObject?.notifydata?.customeruniqueid}).`,
                });
              }
              break;

            case "visits":
              if (subendpoint === "createVisit") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                notificationpayload.push({
                  title: `The visit Created for [${customer?.customername}] [${responseObject?.notifydata?.visituniqueid}]!`,
                  body: `The visit has been successfully created for [${customer?.customername}].`,
                });



                responseObject?.notifydata?.tenantstaffid?.forEach(
                  (staffid) => {
                    // Push a notification specific to each staff into staffnotificationpayload
                    staffnotificationpayload.push({
                      title: `New Visit Task Assigned: [${responseObject?.notifydata?.visituniqueid}]`,
                      body: `The Visit Task [${responseObject?.notifydata?.visituniqueid}] has been assigned to you. This task is for our customer, [${customer?.customername}].`,
                      staffid, // Include staff ID for further identification
                    });
                  }
                );
              }
              if (subendpoint === "editVisit") {
                console.log("vistedddd");

                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                notificationpayload.push({
                  title: `The visit edited for [${customer?.customername}] [${responseObject?.notifydata?.visituniqueid}]!`,
                  body: `The visit has been successfully edited for [${customer?.customername}].`,
                });



                responseObject?.notifydata?.tenantstaffid?.forEach(
                  (staffid) => {
                    // Push a notification specific to each staff into staffnotificationpayload
                    staffnotificationpayload.push({
                      title: `New Visit Task Assigned: [${responseObject?.notifydata?.visituniqueid}]`,
                      body: `The Visit Task [${responseObject?.notifydata?.visituniqueid}] has been assigned to you. This task is for our customer, [${customer?.customername}].`,
                      staffid, // Include staff ID for further identification
                    });
                  }
                );
              }

              if (subendpoint === "siteVisitStatusByStaff") {
                console.log('Work started');
                
                const customer = await getCustomer(responseObject?.notifydata?.customerid);
                const staff = await getStaff(responseObject?.notifydata?.tenantstaffid);

                const orderId = responseObject?.notifydata?.visituniqueid;
                const customerName = customer?.customername || "Unknown Customer";
                const staffName = staff?.tenantstaffname || "Unknown Technician";

                if (responseObject?.notifydata?.key === 1) {
                  console.log("Work started");

                  notificationpayload.push({
                    title: `Technician started  work on the site visit complaint [${customerName}] [${orderId}]`,
                    body: `Technician [${staffName}] has started working on the site visit complaint [${orderId}].`,
                  });

                } else if (responseObject?.notifydata?.key === 2) {
                  console.log("Work completed");

                  notificationpayload.push({
                    title: `Technician completed work on the site visit complaint [${customerName}] [${orderId}]`,
                    body: `Technician [${staffName}] has completed the work on the site visit complaint [${orderId}].`,
                  });
                }
              }
              break;

            case "employee":
              if (subendpoint === "createEmployee") {
                notificationpayload.push({
                  title: `New Employee Added!`,
                  body: `Employee [${responseObject?.notifydata?.staffname}] has been successfully created with Employee ID [${responseObject?.notifydata?.staffuniqueid}].`,
                });
              }
              break;

            case "jobs":
              if (subendpoint === "createJob") {
                if (responseObject?.notifydata?.ordertype == 1) {
                  const customer = await getCustomer(
                    responseObject?.notifydata?.customerid
                  );

                  console.log("jon crteated", customer);

                  notificationpayload.push({
                    title: `The Job Created for [${customer?.customername}] [${responseObject?.notifydata?.orderuniqueid}]!`,
                    body: `The job has been successfully created for [${customer?.customername}].`,
                  });

                  customernotificationpayload.push({
                    title: `The Job Created for [${customer?.customername}] [${responseObject?.notifydata?.orderuniqueid}]!`,
                    body: `The job has been successfully created for [${customer?.customername}].`,
                    customerid: customer?.customerid,
                  });
                } else if (responseObject?.notifydata?.ordertype == 2) {
                  const customer = await getCustomer(
                    responseObject?.notifydata?.customerid
                  );

                  notificationpayload.push({
                    title: `The Schedule Job Created for [${customer?.customername}] [${responseObject?.notifydata?.orderuniqueid}]!`,
                    body: `The Schedule job has been successfully created for [${customer?.customername}].`,
                  });
                }
              }

              if (subendpoint === "assignEmployee") {
                responseObject?.notifydata?.tenantstaffid?.forEach(
                  (staffid) => {
                    // Push a notification specific to each staff into staffnotificationpayload
                    staffnotificationpayload.push({
                      title: `New Task Assigned: [${responseObject?.notifydata?.orderuniqueid}]`,
                      body: `The [${responseObject?.notifydata?.orderuniqueid}] has been assigned to you. This task is for our customer, [${responseObject?.notifydata?.customername}].`,
                      staffid: staffid
                    });
                  }
                );
              }

              if (subendpoint === "jobStatus") {
                console.log('Work started');
                
                const customer = await getCustomer(responseObject?.notifydata?.customerid);
                const staff = await getStaff(responseObject?.notifydata?.tenantstaffid);

                const orderId = responseObject?.notifydata?.orderuniqueid;
                const customerName = customer?.customername || "Unknown Customer";
                const staffName = staff?.tenantstaffname || "Unknown Technician";

                if (responseObject?.notifydata?.key === 1) {
                  console.log("Work started");

                  notificationpayload.push({
                    title: `Technician started work on the complaint [${customerName}] [${orderId}]`,
                    body: `Technician [${staffName}] has started working on the complaint [${orderId}].`,
                  });

                } else if (responseObject?.notifydata?.key === 2) {
                  console.log("Work completed");

                  notificationpayload.push({
                    title: `Technician completed work on the complaint [${customerName}] [${orderId}]`,
                    body: `Technician [${staffName}] has completed the work on the complaint [${orderId}].`,
                  });
                }
              }

              break;

            case "customer":
              if (subendpoint === "createCustomer") {
                notificationpayload.push({
                  title: `New Customer Registration Alert: ${responseObject?.notifydata?.customername}`,
                  body: `We are pleased to inform you that a new customer, ${responseObject?.notifydata?.customername} (Customer ID: ${responseObject?.notifydata?.customeruniqueid}), has successfully completed their registration.`,
                });
              }
              if (subendpoint === "loginApproval") {
                if (responseObject?.notifydata?.key === 1) {
                  notificationpayload.push({
                    title: `Login approved for this customer: ${responseObject?.notifydata?.customername}`,
                    body: `We are pleased to inform you that a new customer, ${responseObject?.notifydata?.customername} login has been approved.`,
                  });
                }
                if (responseObject?.notifydata?.key === 2) {
                  notificationpayload.push({
                    title: `Login rejected for this customer: ${responseObject?.notifydata?.customername}`,
                    body: `We are pleased to inform you that a customer, ${responseObject?.notifydata?.customername} login has been rejected.`,
                  });
                }
              }
              break;

            case "priorjobs":
              if (subendpoint === "createPriorJob") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("priorData", responseObject?.notifydata);

                notificationpayload.push({
                  title: `The Prior job created for [${customer?.customername}] [${responseObject?.notifydata?.priororderuniqueid}]!`,
                  body: `The Prior job has been successfully created for [${customer?.customername}].`,
                });

                customernotificationpayload.push({
                  title: `The Prior Job Created for [${customer?.customername}] [${responseObject?.notifydata?.orderuniqueid}]!`,
                  body: `The Prior job has been successfully created to you [${customer?.customername}].`,
                  customerid: customer?.customerid,
                });

                responseObject?.notifydata?.staffs?.forEach((staffid) => {
                  // Push a notification specific to each staff into staffnotificationpayload
                  staffnotificationpayload.push({
                    title: `New Task Assigned: [${responseObject?.notifydata?.priororderuniqueid}]`,
                    body: `The [${responseObject?.notifydata?.priororderuniqueid}] has been assigned to you. This task is for our customer, [${customer?.customername}].`,
                    staffid, // Include staff ID for further identification
                  });
                });
              }
              break;

            case "quotation":
              if (subendpoint === "createQuotation") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("quotation", responseObject?.notifydata);

                notificationpayload.push({
                  title: `The Quotation created for [${customer?.customername}] [${responseObject?.notifydata?.quotationuniqueid}]!`,
                  body: `The [${responseObject?.notifydata?.quotationuniqueid}] Quotation has been successfully created for [${customer?.customername}].`,
                });

                customernotificationpayload.push({
                  title: `Your Quotation [${responseObject?.notifydata?.quotationuniqueid}] created!`,
                  body: `Your [${responseObject?.notifydata?.quotationuniqueid}] kindly check the quotation and respond to us.`,
                  customerid: customer?.customerid,
                });
              }
              if (subendpoint === "editQuotation") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("quotation", responseObject?.notifydata);

                notificationpayload.push({
                  title: `The Quotation edited for [${customer?.customername}] [${responseObject?.notifydata?.quotationuniqueid}]!`,
                  body: `The [${responseObject?.notifydata?.quotationuniqueid}] Quotation has been successfully edited for [${customer?.customername}].`,
                });

                customernotificationpayload.push({
                  title: `Your Quotation [${responseObject?.notifydata?.quotationuniqueid}] edited!`,
                  body: `Your [${responseObject?.notifydata?.quotationuniqueid}] kindly check the quotation and respond to us.`,
                  customerid: customer?.customerid,
                });
              }
              if (subendpoint === "sendQuotationToCustomer") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("quotation", responseObject?.notifydata);

                customernotificationpayload.push({
                  title: `Your Quotation [${responseObject?.notifydata?.quotationuniqueid}] created!`,
                  body: `Your [${responseObject?.notifydata?.quotationuniqueid}] kindly check the quotation and respond to us.`,
                  customerid: customer?.customerid,
                });
              }
              if (subendpoint === "quotationApproval") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("quotation", responseObject?.notifydata);

                if (responseObject?.notifydata?.key === 1) {
                  notificationpayload.push({
                    title: `The Quotation Approved for [${customer?.customername}] [${responseObject?.notifydata?.quotationuniqueid}]!`,
                    body: `The [${responseObject?.notifydata?.quotationuniqueid}] Quotation has been approved by [${customer?.customername}].`,
                  });
                }

                if (responseObject?.notifydata?.key === 2) {
                  notificationpayload.push({
                    title: `The Quotation Rejected for [${customer?.customername}] [${responseObject?.notifydata?.quotationuniqueid}]!`,
                    body: `The [${responseObject?.notifydata?.quotationuniqueid}] Quotation has been Rejected by [${customer?.customername}].`,
                  });
                }

              

                
              }
              break;

            case "contracts":
              if (subendpoint === "createCustomerContract") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("priorData", responseObject?.notifydata);

                notificationpayload.push({
                  title: `The Customer Contract created for [${customer?.customername}] [${responseObject?.notifydata?.contractuniqueid}]!`,
                  body: `The [${responseObject?.notifydata?.contractuniqueid}] Customer Contract has been successfully created for [${customer?.customername}].`,
                });

                customernotificationpayload.push({
                  title: `Your Contract [${responseObject?.notifydata?.contractuniqueid}] Created for [${customer?.customername}]!`,
                  body: `Your Contract[${responseObject?.notifydata?.contractuniqueid}] has been successfully created to you [${customer?.customername}].`,
                  customerid: customer?.customerid,
                });
              }
              if (subendpoint === "customerContractCancel") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("priorData", responseObject?.notifydata);

                notificationpayload.push({
                  title: `The Customer Contract cancelled for [${customer?.customername}] [${responseObject?.notifydata?.customercontractuniqueid}]!`,
                  body: `The [${responseObject?.notifydata?.customercontractuniqueid}] Customer Contract has been cancelled for [${customer?.customername}]. Cancel Reason :[${responseObject?.notifydata?.cancelreason}]`,
                });

                customernotificationpayload.push({
                  title: `Your Contract [${responseObject?.notifydata?.customercontractuniqueid}] cancelled for [${customer?.customername}]!`,
                  body: `Your Contract[${responseObject?.notifydata?.customercontractuniqueid}] has been cancelled to you [${customer?.customername}]. Cancel Reason :[${responseObject?.notifydata?.cancelreason}]`,
                  customerid: customer?.customerid,
                });
              }
              break;

            case "servicerequest":

              if (subendpoint === "createServiceRequest") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );

                console.log("createServiceRequest", responseObject?.notifydata);

                notificationpayload.push({
                  title: `New Service Requested!`,
                  body: `New Service Requested! [${customer.customername}]!.`,
                });


              }

              if (subendpoint === "serviceApproval") {
                const customer = await getCustomer(
                  responseObject?.notifydata?.customerid
                );
                console.log(
                  "responseObject?.notifydata",
                  responseObject?.notifydata
                );

                if (responseObject?.notifydata?.type === "approved") {
                  const visit = getVisitData(
                    responseObject?.notifydata?.visitid
                  );

                  notificationpayload.push({
                    title: `Service Request [${responseObject?.notifydata?.visituniqueid}] for [${customer?.customername}] Approved!`,
                    body: `The service request [${responseObject?.notifydata?.visituniqueid}] has been approved for customer [${customer?.customername}].`,
                  });

                  customernotificationpayload.push({
                    title: `Your Service Request [${responseObject?.notifydata?.visituniqueid}] for [${customer?.customername}] Approved!`,
                    body: `The service request [${responseObject?.notifydata?.visituniqueid}] has been approved.`,
                    customerid: customer?.customerid,
                  });

                  responseObject?.notifydata?.staffs?.forEach((staffid) => {
                    // Push a notification specific to each staff into staffnotificationpayload
                    staffnotificationpayload.push({
                      title: `New Site Visit Task Assigned: [${responseObject?.notifydata?.visituniqueid}]`,
                      body: `The Site Visit Task [${responseObject?.notifydata?.visituniqueid}] has been assigned to you. This task is for our customer, [${customer?.customername}].`,
                      staffid, // Include staff ID for further identification
                    });
                  });
                }

                if (responseObject?.notifydata?.type === "rejected") {
                  notificationpayload.push({
                    title: `Service Request for [${customer?.customername}] Rejected!`,
                    body: `The service request has been Rejected for customer [${customer?.customername}].`,
                  });

                  customernotificationpayload.push({
                    title: `Your Service Request for [${customer?.customername}] Rejected!`,
                    body: `The service request has been Rejected.`,
                    customerid: customer?.customerid,
                  });
                }
              }

              break;

            case "foodorder":
              const customer = await getCustomer(
                responseObject?.notifydata?.customerid
              );

              if (subendpoint === "createFoodOrder") {
                notificationpayload.push({
                  title: `New Food Order Created!`,
                  body: `A new order has been placed with Order ID [${responseObject?.notifydata?.foodorderuniqueid}] by Customer [${customer.customername}].`,
                });
              }
              break;

            default:
              break;
          }
        }

        // Process staff notifications
        await Promise.all(
          staffnotificationpayload.map(async (data) => {
            const staffdata = await getStaff(data.staffid); // Fetch staff-specific data
            if (!staffdata) {
              console.error(
                `No staff data found for tenantstaffid: ${data.staffid}`
              );
              return;
            }

            let stafffcmtokens = await db("fcmtokens").where({
              roleid: 3,
              userid: staffdata.userid,
            });

            if (!stafffcmtokens || stafffcmtokens.length === 0) {
              console.log(
                `No FCM tokens found for userid: ${staffdata.userid}`
              );
              return;
            }

            await Promise.all(
              stafffcmtokens.map(async (token) => {
                const isTokenValid = await verifyToken(token.accesstoken);
                if (!isTokenValid) {
                  console.log(
                    `Access token expired or invalid. Deleting FCM token for userid: ${staffdata.userid}`
                  );
                  await deleteExpiredToken(staffdata.userid);
                } else {
                  console.log(
                    `Sending notification to staff ID: ${data.staffid}`
                  );
                  await notificationController.sendNotifcation({
                    title: data.title,
                    body: data.body,
                    fcmtoken: token.fcmtoken,
                    userid: staffdata.userid,
                    roleid: staffdata.roleid,
                    tenantid: staffdata.tenantid,
                  });
                }
              })
            );
          })
        );

        // Process superadmin notifications
        await Promise.all(
          superadminusers.map(async (sup) => {
            await Promise.all(
              notificationpayload.map(async (data) => {
                try {
                  const isTokenValid = await verifyToken(sup.accesstoken);
                  if (!isTokenValid) {
                    console.log(
                      `Access token expired or invalid. Deleting FCM token for userid: ${sup.userid}`
                    );
                    await deleteExpiredToken(sup.userid);
                  } else {
                    await notificationController.sendNotifcation({
                      title: data.title,
                      body: data.body,
                      fcmtoken: sup.fcmtoken,
                      userid: sup.userid,
                      tenantid: sup.tenantid,
                      roleid: 1,
                    });
                  }
                } catch (error) {
                  console.error(
                    `Error processing notification for userid: ${sup.userid}`,
                    error
                  );
                }
              })
            );
          })
        );

        // Process customer notification
        await Promise.all(
          customernotificationpayload.map(async (data) => {
            const customerdata = await getCustomer(data.customerid); // Fetch staff-specific data
            if (!customerdata) {
              console.error(
                `No customer data found for customerid: ${data.customerid}`
              );
              return;
            }

            let customerfcmtokens = await db("fcmtokens").where({
              roleid: 4,
              userid: customerdata.userid,
            });

            if (!customerfcmtokens || customerfcmtokens.length === 0) {
              console.log(
                `No FCM tokens found for userid: ${customerdata.userid}`
              );
              return;
            }

            await Promise.all(
              customerfcmtokens.map(async (token) => {
                const isTokenValid = await verifyToken(token.accesstoken);
                if (!isTokenValid) {
                  console.log(
                    `Access token expired or invalid. Deleting FCM token for userid: ${staffdata.userid}`
                  );
                  await deleteExpiredToken(staffdata.userid);
                } else {
                  console.log(
                    `Sending notification to staff ID: ${data.staffid}`
                  );
                  await notificationController.sendNotifcation({
                    title: data.title,
                    body: data.body,
                    fcmtoken: token.fcmtoken,
                    userid: customerdata.userid,
                    roleid: customerdata.roleid,
                    tenantid: customerdata.tenantid,
                  });
                }
              })
            );
          })
        );
      } catch (err) {
        console.error("Error in notification middleware:", err);
      }
    });
  } catch (err) {
    console.error("Error in notification middleware:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  // Proceed to the next middleware or route handler
  next();
};
