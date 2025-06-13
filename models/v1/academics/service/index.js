const _ = require("lodash");

module.exports.createAcademic = async (props) => {
  const { academicname } = props; // Get referral type name

  const db = global.dbConnection;

  try {
    // Check if referral type already exists
    const existingReferral = await db("academics")
      .where({ academicname })
      .first();

    if (existingReferral) {
      return {
        code: 200,
        status: false,
        message: "Referral type already exists",
      };
    }

    // Insert new record into `academics` table
    const [insertedId] = await db("academics").insert({ academicname });

    if (insertedId == 0) {
      return {
        code: 200,
        status: false,
        message: "Referral type added failed",
      };
    }

    return {
      code: 201,
      status: true,
      message: "Referral type added successfully",
    };
  } catch (err) {
    console.error("Error inserting referral type:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to insert referral type",
    };
  }
};

module.exports.getAcademics = async () => {
  try {
    const db = global.dbConnection;

    // Fetch all referral types from the `academics` table
    const academicsData = await db("academics").select("*");

    if (academicsData.length === 0) {
      return {
        code: 404,
        status: false,
        message: "No academics found",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Language test Fetched Successfully",
      response: academicsData,
    };
  } catch (err) {
    console.error("Error fetching academics:", err);
    return {
      code: 500,
      status: false,
      message: "Server error",
    };
  }
};

module.exports.editAcademic = async (props) => {
  const { academicname, academicid } = props;

  const db = global.dbConnection;

  try {
    // Check if referral type exists
    const existingReferral = await db("academics")
      .where({ academicid })
      .first();

    if (!existingReferral) {
      return {
        code: 404,
        status: false,
        message: "Referral Type not found",
      };
    }

    // Update the referral type record
    await db("academics").where({ academicid }).update({
      academicname,
    });

    return {
      code: 200,
      status: true,
      message: "Referral Type updated successfully",
    };
  } catch (err) {
    console.error("Error updating referral type:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update referral type",
    };
  }
};

module.exports.updateAcademicStatus = async (props) => {
  const { academicid, key } = props;
  const db = global.dbConnection;

  try {
    // Check if the academic record exists
    const checkAcademicExist = await db("academics")
      .where({ academicid })
      .select("academicStatus")
      .first();

    if (!checkAcademicExist) {
      return { code: 200, status: false, message: "Academic record not found" }; // Changed message to reflect academic record
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Activate Academic Record
          if (checkAcademicExist.academicStatus === 1) {
            return {
              code: 200,
              status: false,
              message: "This academic record is already active", // Changed message
            };
          }

          // Activate the academic record
          const activateAcademic = await trx("academics")
            .update({ academicStatus: 1 })
            .where({ academicid });

          return activateAcademic > 0
            ? {
                code: 200,
                status: true,
                message: "Academic record activated successfully", // Changed message
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate academic record", // Changed message
              };

        case 2: // Deactivate Academic Record
          if (checkAcademicExist.academicStatus === 2) {
            return {
              code: 200,
              status: false,
              message: "This academic record is already inactive", // Changed message
            };
          }

          // Deactivate the academic record
          const deactivateAcademic = await trx("academics")
            .update({ academicStatus: 2 })
            .where({ academicid });

          return deactivateAcademic > 0
            ? {
                code: 200,
                status: true,
                message: "Academic record deactivated successfully", // Changed message
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate academic record", // Changed message
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating academic status:", err); // Updated log message
    return {
      code: 500,
      status: false,
      message: "Failed to update academic status", // Changed message
    };
  }
};
