const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const mailService = require("../../../../mail/mailService");

module.exports.createUniversity = async (props) => {
  const {
    universityname,
    universitylocation,
    universityyear,
    universitydescription,
  } = props;
  const db = global.dbConnection;
  try {
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " "); // Convert to "YYYY-MM-DD HH:MM:SS"
    // Check if the university already exists
    const existingUniversity = await db("universities")
      .where({ universityname, universitylocation })
      .first();
    if (existingUniversity) {
      return {
        code: 200,
        status: false,
        message:
          "University with this name and universitylocation already exists",
      };
    }
    const result = await db.transaction(async (trx) => {
      // Insert the new university (no need to specify universityid as it will auto-increment)
      const [universityid] = await trx("universities").insert({
        universityname,
        universitylocation,
        universityyear,
        universitydescription,
        createdat: createdAt,
      });
      if (!universityid) {
        throw new Error("Failed to create university");
      }
      return {
        code: 200,
        status: true,
        message: "University created successfully",
        data: {
          universityid, // Return the newly generated university ID
          universityname,
          universitylocation,
          universityyear,
          universitydescription,
        },
      };
    });
    return result;
  } catch (err) {
    console.error("Error creating university:", err);
    return { code: 500, status: false, message: "Failed to create university" };
  }
};
module.exports.editUniversity = async (props) => {
  const {
    universityid,
    universityname,
    universitylocation,
    universityyear,
    universitydescription,
  } = props;
  const db = global.dbConnection;
  try {
    // Check if the university exists
    const existingUniversity = await db("universities")
      .where({ universityid }) // Use universityid instead of id
      .first();
    if (!existingUniversity) {
      return {
        code: 404,
        status: false,
        message: "University not found",
      };
    }
    // Check if another university with the same name and universitylocation exists
    const duplicateUniversity = await db("universities")
      .where({ universityname, universitylocation })
      .whereNot({ universityid }) // Use universityid instead of id
      .first();
    if (duplicateUniversity) {
      return {
        code: 200,
        status: false,
        message:
          "Another university with this name and universitylocation already exists",
      };
    }

    const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " "); // Convert to MySQL format

    // Update university details
    const updatedCount = await db("universities")
      .update({
        universityname: universityname || existingUniversity.universityname,
        universitylocation:
          universitylocation || existingUniversity.universitylocation,
        universityyear: universityyear || existingUniversity.universityyear,
        universitydescription:
          universitydescription || existingUniversity.universitydescription,
        updatedat: updatedAt,
      })
      .where({ universityid }); // Use universityid instead of id
    if (updatedCount === 0) {
      throw new Error("Failed to update university");
    }
    return {
      code: 200,
      status: true,
      message: "University updated successfully",
    };
  } catch (err) {
    console.error("Error editing university:", err.message);
    return {
      code: 500,
      status: false,
      message: "Failed to update university due to an internal error",
    };
  }
};
module.exports.getUniversity = async (props) => {
  const { universityid, universitylocation, universityyear } = props;
  const db = global.dbConnection;
  try {
    let query = db("universities")
      .select("universities.*")
      .orderBy("universities.universityid", "DESC"); // Corrected column name to universityid
    if (universityid) {
      query = query.where({ "universities.universityid": universityid }); // Corrected column name to universityid
    }
    if (universitylocation) {
      query = query.where({
        "universities.universitylocation": universitylocation,
      });
    }
    if (universityyear) {
      query = query.where({ "universities.universityyear": universityyear });
    }
    const response = await query;
    if (response.length > 0) {
      return {
        code: 200,
        status: true,
        message: "Successfully retrieved university data",
        response: response,
      };
    } else {
      return {
        code: 200,
        status: true,
        message: "No university data found",
        response: [],
      };
    }
  } catch (err) {
    console.error("Error fetching university data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch university data",
      response: [],
    };
  }
};
module.exports.deleteUniversity = async (universityid) => {
  const db = global.dbConnection;

  if (!universityid) {
    return {
      code: 400,
      status: false,
      message: "University ID is required",
    };
  }

  try {
    // First, delete courses linked to this university
    await db("courses").where({ universityid }).del();

    // Now, delete the university
    const deletedRows = await db("universities").where({ universityid }).del();

    if (deletedRows === 0) {
      return {
        code: 404,
        status: false,
        message: "University not found or already deleted",
      };
    }

    return {
      code: 200,
      status: true,
      message: "University deleted successfully",
    };
  } catch (err) {
    console.error("Error deleting university:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to delete university due to an internal server error",
    };
  }
};

module.exports.updateUniversityStatus = async (props) => {
  console.log("Received props:", props); // Debugging line

  const { universityid, key } = props;
  const db = global.dbConnection;

  if (!universityid) {
    return { code: 400, status: false, message: "Missing universityid" };
  }

  try {
    // Check if the university exists
    const checkUniversityExist = await db("universities")
      .where({ universityid })
      .select("universitystatus")
      .first();

    if (!checkUniversityExist) {
      return { code: 200, status: false, message: "University not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Activate University
          if (checkUniversityExist.universitystatus === 1) {
            return {
              code: 200,
              status: false,
              message: "This university is already active",
            };
          }

          const activateUniversity = await trx("universities")
            .update({ universitystatus: 1 })
            .where({ universityid });

          return activateUniversity > 0
            ? {
                code: 200,
                status: true,
                message: "University activated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate university",
              };

        case 2: // Deactivate University
          if (checkUniversityExist.universitystatus === 2) {
            return {
              code: 200,
              status: false,
              message: "This university is already inactive",
            };
          }

          const deactivateUniversity = await trx("universities")
            .update({ universitystatus: 2 })
            .where({ universityid });

          return deactivateUniversity > 0
            ? {
                code: 200,
                status: true,
                message: "University deactivated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate university",
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating university status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update university status",
    };
  }
};
