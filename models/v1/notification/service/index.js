const _ = require("lodash");
const moment = require("moment");

module.exports.createNotification = async (
  title,
  body,
  tenantid,
  userid,
  roleid
) => {
  const db = global.dbConnection;

  try {
    // Start a transaction to insert the notification
    const result = await db.transaction(async (trx) => {
      // Insert the notification
      const currentDateTime = moment().utc().toISOString();

      // Check if a similar notification already exists
      const existData = await trx("notifications").where({
        title,
        body,
      });

      // // If a similar notification exists, return null
      if (!_.isEmpty(existData)) {
        console.log("Notification already exists, skipping creation.");
        return null;
      }

      // Insert the new notification into the database
      const [notificationid] = await trx("notifications").insert({
        userid,
        roleid,
        title,
        body,
        tenantid,
        notificationdate: currentDateTime,
      });

      console.log("Notification created with ID:", notificationid);

      // Ensure that the notification ID is returned, if not, throw an error
      if (!notificationid) {
        throw new Error("Failed to create notification: No ID returned");
      }

      // Return the notification ID if creation was successful
      return notificationid > 0 ? notificationid : null;
    });

    // Return the result of the transaction
    return result;
  } catch (err) {
    // Enhanced error handling with detailed context
    console.error("Error in createNotification:", err.message || err);
    return null;
  }
};

//staff Data
module.exports.getStaff = async (id) => {
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const staffdata = await trx("tenantstaffs")
        .leftJoin("app_users", "app_users.userid", "tenantstaffs.userid")
        .where({
          "tenantstaffs.tenantstaffid": id,
        })
        .first();
      return staffdata ? staffdata : null;
    });

    return result;
  } catch (err) {
    console.log("getStaffById Err", err);
  }
};
//customer data
module.exports.getCustomer = async (id) => {
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const customerdata = await trx("customers")
        .leftJoin("app_users", "app_users.userid", "customers.userid")
        .where({
          "customers.customerid": id,
        })
        .first();
      return customerdata ? customerdata : null;
    });

    return result;
  } catch (err) {
    console.log("getCustomer Err", err);
  }
};
//user data
module.exports.getUser = async (id) => {
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      const userdata = await trx("app_users")
        .where({
          "app_users.userid": id,
        })
        .first();
      return userdata ? userdata : null;
    });

    return result;
  } catch (err) {
    console.log("getUser Err", err);
  }
};

module.exports.getMultipleStaffs = async (ids) => {
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      const staffdata = await trx("tenantstaffs")
        .leftJoin("app_users", "app_users.userid", "tenantstaffs.userid")
        .select("tenantstaffs.tenantstaffname")
        .whereIn("tenantstaffs.tenantstaffid", ids);

      // Extract the tenant staff names from the result
      return staffdata.map((staff) => staff.tenantstaffname) || [];
    });

    return result;
  } catch (err) {
    console.error("getMultipleStaffs Error:", err);
    throw err; // Propagate the error
  }
};

module.exports.getVisitData = async (id) => {
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const visitdata = await trx("visits")
        .where({
          "visits.visitid": id,
        })
        .first();
      return visitdata ? visitdata : null;
    });
    return result;
  } catch (err) {
    console.log('getVisitData Error', err);

  }
};



//notification api

module.exports.getAllNotification = async (props) => {
  const { tenantid, userid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const data = await trx("notifications")
        .where({
          "notifications.tenantid": tenantid,
          "notifications.userid": userid,
        })
        .orderBy("notifications.notificationid", "DESC");

      if (!_.isEmpty(data)) {
        return {
          code: 200,
          status: true,
          message: "Successfully data retrived",
          response: data,
        };
      }
      if (_.isEmpty(data)) {
        return {
          code: 200,
          status: true,
          message: "No data retrived",
          response: [],
        };
      }
    });
    return result;
  } catch (err) {
    console.log("getAllNotification Err", err);
    return {
      code: 200,
      status: false,
      message: "Failed to data retrived",
      response: [],
    };
  }
};

module.exports.readNotification = async (props) => {
  const { notificationid, userid, tenantid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Update notifications
      const readCount = await trx('notifications')
        .whereIn('notificationid', notificationid)
        .andWhere({
          tenantid: tenantid,
          userid: userid,
        })
        .update({
          readstatus: 2,
        });

      // Check if any rows were updated
      if (readCount > 0) {
        return {
          code: 200,
          status: true,
          message: "Successfully updated notifications",
          response: { updatedCount: readCount },
        };
      } else {
        return {
          code: 200,
          status: true,
          message: "No notifications found to update",
          response: [],
        };
      }
    });

    return result;

  } catch (err) {
    console.error('Error in readNotification:', err);
    return {
      code: 500,
      status: false,
      message: "Failed to update notifications",
      response: [],
    };
  }
};

module.exports.getAllUnReadNotification = async (props) => {
  const { tenantid, userid } = props;
  const db = global.dbConnection;
  try {
    const result = await db.transaction(async (trx) => {
      const data = await trx("notifications")
        .where({
          "notifications.tenantid": tenantid,
          "notifications.userid": userid,
          "notifications.readstatus": 1
        })
        .orderBy("notifications.notificationid", "DESC");

      if (!_.isEmpty(data)) {
        return {
          code: 200,
          status: true,
          message: "Successfully data retrived",
          response: data,
        };
      }
      if (_.isEmpty(data)) {
        return {
          code: 200,
          status: true,
          message: "No data retrived",
          response: [],
        };
      }
    });
    return result;
  } catch (err) {
    console.log("getAllNotification Err", err);
    return {
      code: 200,
      status: false,
      message: "Failed to data retrived",
      response: [],
    };
  }
};