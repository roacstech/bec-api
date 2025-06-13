const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const mailService = require("../../../../mail/mailService");
module.exports.createCourse = async (props) => {
  let {
    coursename,
    universityid,
    courseduration,
    courselevel,
    coursedescription,
    coursefees,
  } = props;

  const db = global.dbConnection;

  try {
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    console.log(
      "Received universityid:",
      universityid,
      "Type:",
      typeof universityid
    );

    // Ensure universityid is properly converted
    if (!universityid || isNaN(Number(universityid))) {
      return {
        code: 400,
        status: false,
        message: "Invalid university ID",
      };
    }

    universityid = Number(universityid);

    console.log(
      "Checking existing course for universityid:",
      universityid,
      "coursename:",
      coursename
    );

    // Check if the course already exists in the university
    const existingCourse = await db("courses")
      .where({ universityid, coursename })
      .first();

    if (existingCourse) {
      return {
        code: 200,
        status: false,
        message: "Course already exists in this university",
      };
    }

    console.log("Inserting new course...");

    // Insert the new course into the database
    const result = await db.transaction(async (trx) => {
      const inserted = await trx("courses")
        .insert({
          universityid,
          coursename,
          courseduration,
          courselevel,
          coursedescription,
          coursefees,
          createdat: createdAt,
        })
        .returning("id");

      if (!inserted || inserted.length === 0) {
        throw new Error("Failed to create course");
      }

      const courseid = inserted[0];
      console.log("Course created with ID:", courseid);

      return {
        code: 200,
        status: true,
        message: "Course created successfully",
        data: {
          courseid,
          coursename,
          universityid,
          courseduration,
          courselevel,
          coursedescription,
          coursefees,
        },
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating course:", err);
    return { code: 500, status: false, message: "Failed to create course" };
  }
};

module.exports.editCourse = async (props) => {
  const {
    courseid,
    universityid,
    coursename,
    courseduration,
    courselevel,
    coursedescription,
    coursefees,
  } = props;
  const db = global.dbConnection;

  try {
    // Check if the course exists
    const existingCourse = await db("courses")
      .where({ courseid: courseid }) // Corrected column name
      .first();

    if (!existingCourse) {
      return {
        code: 404,
        status: false,
        message: "Course not found",
      };
    }

    const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Update course details
    const updatedCount = await db("courses")
      .where({ courseid: courseid }) // Corrected column name
      .update({
        universityid: universityid || existingCourse.universityid,
        coursename: coursename || existingCourse.coursename,
        courseduration: courseduration || existingCourse.courseduration,
        courselevel: courselevel || existingCourse.courselevel,
        coursedescription:
          coursedescription || existingCourse.coursedescription,
        coursefees: coursefees || existingCourse.coursefees,
        updatedat: updatedAt, // Corrected column name
      });

    if (updatedCount === 0) {
      throw new Error("Failed to update course");
    }

    return {
      code: 200,
      status: true,
      message: "Course updated successfully",
    };
  } catch (err) {
    console.error("Error editing course:", err.message);
    return {
      code: 500,
      status: false,
      message: "Failed to update course due to an internal error",
    };
  }
};

module.exports.getCourse = async (props) => {
  const { courseid, universityid, coursename } = props;
  const db = global.dbConnection;

  try {
    let query = db("courses")
      .select("courses.*")
      .orderBy("courses.courseid", "DESC"); // Corrected column name

    // Check if courseid is provided
    if (courseid) {
      query = query.where({ "courses.courseid": courseid }); // Corrected alias
    }

    // Check if universityid is provided
    if (universityid) {
      query = query.where({ "courses.universityid": universityid }); // Corrected alias
    }

    // Check if coursename is provided
    if (coursename) {
      query = query.where("courses.coursename", "like", `%${coursename}%`); // Corrected alias
    }

    const response = await query;

    return {
      code: 200,
      status: response.length > 0,
      message:
        response.length > 0
          ? "Successfully retrieved course data"
          : "No course data found",
      response: response,
    };
  } catch (err) {
    console.error("Error fetching course data:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch course data",
      response: [],
    };
  }
};

module.exports.deleteCourse = async (props) => {
  const { courseid } = props; // Extract courseid from props
  const db = global.dbConnection;

  if (!courseid) {
    return {
      code: 400,
      status: false,
      message: "Course ID is required",
    };
  }

  try {
    // Corrected table name and column reference
    const deletedRows = await db("courses").where({ courseid: courseid }).del();

    if (deletedRows === 0) {
      return {
        code: 404,
        status: false,
        message: "Course not found or already deleted",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Course deleted successfully",
    };
  } catch (err) {
    console.error("Error deleting course:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to delete course due to an internal server error",
    };
  }
};

module.exports.updateCourseStatus = async (props) => {
  const { courseid, key } = props;
  const db = global.dbConnection;

  try {
    // Check if the course exists
    const checkCourseExist = await db("courses").where({ courseid });
    if (_.isEmpty(checkCourseExist)) {
      return { code: 200, status: false, message: "Course not found" };
    }

    const result = await db.transaction(async (trx) => {
      switch (key) {
        case 1: // Activate the course
          const checkInactive = await trx("courses")
            .where({ coursestatus: 2 }) // Changed from `status` to `coursestatus`
            .where({ courseid });

          if (_.isEmpty(checkInactive)) {
            return {
              code: 200,
              status: false,
              message: "This course is already active",
            };
          }

          const activateCourse = await trx("courses")
            .update({ coursestatus: 1 }) // Changed from `status` to `coursestatus`
            .where({ courseid });

          if (activateCourse > 0) {
            return {
              code: 200,
              status: true,
              message: "Course activated successfully",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to activate course",
            };
          }

        case 2: // Deactivate the course
          const checkActive = await trx("courses")
            .where({ coursestatus: 1 }) // Changed from `status` to `coursestatus`
            .where({ courseid });

          if (_.isEmpty(checkActive)) {
            return {
              code: 200,
              status: false,
              message: "This course is already inactive",
            };
          }

          const deactivateCourse = await trx("courses")
            .update({ coursestatus: 2 }) // Changed from `status` to `coursestatus`
            .where({ courseid });

          if (deactivateCourse > 0) {
            return {
              code: 200,
              status: true,
              message: "Course deactivated successfully",
            };
          } else {
            return {
              code: 200,
              status: false,
              message: "Failed to deactivate course",
            };
          }

        default:
          return {
            code: 400,
            status: false,
            message: "Invalid status key",
          };
      }
    });

    return result;
  } catch (err) {
    console.log("Error updating course status:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to update course status",
    };
  }
};
