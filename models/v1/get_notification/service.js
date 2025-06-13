module.exports.getNotification = async (props) => {
  const { id,
      studentid,
      message,
      status } = props;
  const db = global.dbConnection;
  try {
    let query = db("notification")
      .select("notification.*")      
   
    const response = await query;
    if (response.length > 0) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved notification data",
        response: response,
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No notification data found",
        response: [],
      };
    }
  } catch (err) {
    console.error("Error fetching notification data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch notification data",
      response: [],
    };
  }
};

module.exports.updateNotification = async (props) => {
  const { id   } = props;
  const db = global.dbConnection;
  try {
    const result = await db("notification")
      .where({ id })
      .update({ status: 1 });

    if (result > 0) {
      return {
        code: 200,
        status: true,
        message: "Notification status updated successfully",
        response: [],
      };
    } else {
      return {
        code: 404,
        status: false,
        message: "Notification not found",
        response: [],
      };
    }
  } catch (err) {
    console.error("Error updating notification status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update notification status",
      response: [],
    };
  }
};
