const admin = require("firebase-admin");
const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const knex = require('knex');


const serviceAccount = require("../../../../config/firebase/rythm-3b155-firebase-adminsdk-hdd81-23a3ac31cd.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports.sendNotifcation = async (props) => {
  const { title, body, fcmtoken, userid, tenantid, roleid } = props;

  try {
    if (!fcmtoken) {
      console.error("No FCM token provided, skipping notification");
      return; // Handle missing token case
    }

    console.log("sendNotifcation", props);

    const payload = {
      notification: {
        title,
        body,
        image: "https://webnox.blr1.digitaloceanspaces.com/rythm%20notify.png",
      },
      token: fcmtoken, // Ensure token is provided here
    };

    // Send the notification via Firebase Messaging
    const response = await admin.messaging().send(payload);

    if (response) {
      // After sending the notification, log and create the notification in the database
      await service.createNotification(title, body, tenantid, userid, roleid);
    }
  } catch (err) {
    // Log the error with details for debugging
    console.error("customerNotifcationController Err", err);
  }
};

module.exports.sendTestNotifcation = async (props) => {
  const { title, body, fcmtoken } = props;

  try {
    console.log("sendNotifcationStaff", props);

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
    console.log("customerNotifcationController Err", err);
  }
};

module.exports.getAllNotification = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getAllNotification(result);

    if (!_.isEmpty(response)) {
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(400).send({
      status: false,
      message: "Failed to retrieve data",
      response: [],
    });
  }
};

module.exports.readNotification = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      notificationid: Joi.array()
        .items(
          Joi.number().required().messages({
            "number.base": "Notification ID must be a number",
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "At least one Notification ID is required",
          "any.required": "Notification ID is required",
        }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.readNotification(result);

    if (!_.isEmpty(response)) {
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(400).send({
      status: false,
      message: "Failed to retrieve data",
      response: [],
    });
  }
};

module.exports.getAllUnReadNotification = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];

    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getAllUnReadNotification(result);

    if (!_.isEmpty(response)) {
      return res.status(response.code).send({
        status: response.status,
        message: response.message,
        response: response.response,
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(400).send({
      status: false,
      message: "Failed to retrieve data",
      response: [],
    });
  }
};

module.exports.expiryNotification = async (props) => {
  const { title, body, userid }= props
  global.dbConnection = knex({
      client: "mysql2",
      connection: {
          host: '143.110.248.227',
          user: 'meyeyajzma',
          password: 'R2uT8Pt6Bh',
          database: 'meyeyajzma',
      },
      debug: false
  });
  const db = global.dbConnection;
  try {

    console.log('userid', userid);
    

    //admin fcm tokens
    const superadminusers = await db("fcmtokens").where({
      userid: userid
    });

    console.log('superadminusers', superadminusers);
    

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

    await Promise.all(
      superadminusers.map(async (sup) => {
        const isTokenValid = await verifyToken(sup.accesstoken);

        if (!isTokenValid) {

          console.log(
            `Access token expired or invalid. Deleting FCM token for userid: ${sup.userid}`
          );
          await deleteExpiredToken(sup.userid);
        } else {
          
          await this.sendNotifcation({
            title: title,
            body: body,
            fcmtoken: sup.fcmtoken,
            userid: sup.userid,
            tenantid: sup.tenantid,
            roleid: sup.roleid
          });
        }
      })
    );

  } catch (err) {
    console.log('expiryNotification error', err);
  }
}