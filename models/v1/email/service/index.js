const _ = require("lodash");

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
      // Check if a similar notification already exists
      const existData = await trx("notifications").where({
        userid,
        roleid,
        title,
        body,
        tenantid,
      });

      // If a similar notification exists, return null
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
