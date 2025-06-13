const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const mailService = require("../../../../mail/mailService");
module.exports.createDepartment = async (props) => {
  const { universityid, courseid, departmentname, departmentdescription } =
    props;
  const db = global.dbConnection;

  try {
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Check if the course exists under the given university
    const existingCourse = await db("courses")
      .where({ universityid, courseid }) // ✅ Fixed the issue
      .first();

    if (!existingCourse) {
      return {
        code: 404,
        status: false,
        message: "Course not found under the given university",
      };
    }

    // Check if department already exists for the course
    const existingDepartment = await db("departments")
      .where({ universityid, courseid, departmentname })
      .first();

    if (existingDepartment) {
      return {
        code: 200,
        status: false,
        message: "Department already exists for this course in this university",
      };
    }

    // Insert the new department into the database
    const result = await db.transaction(async (trx) => {
      const [departmentid] = await trx("departments").insert({
        universityid,
        courseid,
        departmentname,
        departmentdescription,
        createdat: createdAt,
      });

      if (!departmentid) {
        throw new Error("Failed to create department");
      }

      return {
        code: 200,
        status: true,
        message: "Department created successfully",
        data: {
          departmentid,
          departmentname,
          universityid,
          courseid,
          departmentdescription,
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating department:", err);
    return { code: 500, status: false, message: "Failed to create department" };
  }
};

module.exports.editDepartment = async (props) => {
  const {
    departmentid,
    universityid,
    departmentname,
    departmentdescription,
    courseid,
  } = props;

  const db = global.dbConnection;

  try {
    // Check if the department exists
    const existingDepartment = await db("departments")
      .where({ departmentid })
      .first();

    if (!existingDepartment) {
      return {
        code: 404,
        status: false,
        message: "Department not found",
      };
    }

    // Check if the university exists
    const universityExists = await db("universities")
      .where({ universityid: universityid })
      .first();

    if (!universityExists) {
      return {
        code: 400,
        status: false,
        message: "University with the provided ID does not exist",
      };
    }

    const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Update the department in the database
    const updatedDepartmentCount = await db("departments")
      .where({ departmentid })
      .update({
        universityid: universityid,
        courseid: courseid,
        departmentname,
        departmentdescription,
        updatedat: updatedAt, // Set updated_at to current timestamp
      });

    if (updatedDepartmentCount > 0) {
      // Fetch the updated department to return the latest state
      const updatedDepartment = await db("departments")
        .where({ departmentid })
        .first();

      return {
        code: 200,
        status: true,
        message: "Department updated successfully",
        data: updatedDepartment,
      };
    } else {
      return {
        code: 500,
        status: false,
        message: "Failed to update department",
      };
    }
  } catch (error) {
    console.error("Error updating department:", error.message);
    return {
      code: 500,
      status: false,
      message: "Internal server error",
    };
  }
};

module.exports.getDepartment = async (props) => {
  const { departmentid, universityid, departmentname } = props;
  const db = global.dbConnection;

  try {
    let query = db("departments")
      .select(
        "departments.*",
        "universities.universityname",
        "courses.coursename"
      )
      .leftJoin(
        "universities",
        "departments.universityid",
        "universities.universityid"
      )
      .leftJoin("courses", "departments.courseid", "courses.courseid")
      .orderBy("departments.departmentid", "DESC");

    // Check if departmentid is provided
    if (departmentid) {
      query = query.where({ "departments.departmentid": departmentid });
    }

    // Check if universityid is provided
    if (universityid) {
      query = query.where({ "departments.universityid": universityid });
    }

    // Check if departmentname is provided
    if (departmentname) {
      query = query.where(
        "departments.departmentname",
        "like",
        `%${departmentname}%`
      );
    }

    const response = await query;

    return {
      code: 200,
      status: response.length > 0,
      message:
        response.length > 0
          ? "Successfully retrieved department data"
          : "No department data found",
      response: response,
    };
  } catch (err) {
    console.error("Error fetching department data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch department data",
      response: [],
    };
  }
};

// Service Layer - Delete Department Logic
module.exports.deleteDepartment = async (props) => {
  const { departmentid } = props; // Extract departmentid from props
  const db = global.dbConnection;

  if (!departmentid) {
    return {
      code: 400,
      status: false,
      message: "Department ID is required",
    };
  }

  try {
    // Delete the department from the department table
    const deletedRows = await db("departments").where({ departmentid }).del(); // Use 'id' for departmentid

    if (deletedRows === 0) {
      return {
        code: 404,
        status: false,
        message: "Department not found or already deleted",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Department deleted successfully",
    };
  } catch (err) {
    console.error("Error deleting department:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to delete department due to an internal server error",
    };
  }
};

module.exports.updateDepartmentStatus = async (props) => {
  console.log("Received props:", props); // Debugging line

  const { departmentid, key } = props;
  const db = global.dbConnection;

  if (!departmentid) {
    return { code: 400, status: false, message: "Missing departmentid" };
  }

  try {
    // Check if the department exists
    const checkDepartmentExist = await db("departments").where({
      departmentid,
    });

    if (_.isEmpty(checkDepartmentExist)) {
      return { code: 200, status: false, message: "Department not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1:
          const checkInactive = await trx("departments").where({
            departmentid,
            departmentstatus: 2,
          });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "This department is already active",
            };
          }

          const activateDepartment = await trx("departments")
            .update({ departmentstatus: 1 })
            .where({ departmentid });

          return activateDepartment > 0
            ? {
                code: 200,
                status: true,
                message: "Department activated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to activate department",
              };

        case 2:
          const checkActive = await trx("departments").where({
            departmentid,
            departmentstatus: 1,
          });

          if (_.isEmpty(checkActive)) {
            return {
              code: 200,
              status: false,
              message: "This department is already inactive",
            };
          }

          const deactivateDepartment = await trx("departments")
            .update({ departmentstatus: 2 })
            .where({ departmentid });

          return deactivateDepartment > 0
            ? {
                code: 200,
                status: true,
                message: "Department deactivated successfully",
              }
            : {
                code: 200,
                status: false,
                message: "Failed to deactivate department",
              };

        default:
          return { code: 400, status: false, message: "Invalid status key" };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating department status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update department status",
    };
  }
};
