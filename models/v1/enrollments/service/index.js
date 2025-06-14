const _ = require("lodash");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { response } = require("express");

// module.exports.getEnrollments = async (props) => {
//   const db = global.dbConnection;

//   try {
//     const {
//       studentid,
//       universityid,
//       departmentid,
//       courseid,
//       enrollmentstatus,
//       limit,
//       offset,
//     } = props;

//     // Base query with joins
//     let baseQuery = db("enrollments")
//       .leftJoin(
//         "universities",
//         "universities.universityid",
//         "enrollments.universityid"
//       )
//       .leftJoin("courses", "courses.courseid", "enrollments.courseid")
//       .leftJoin(
//         "departments",
//         "departments.departmentid",
//         "enrollments.departmentid"
//       )
//       .leftJoin(
//         "enrollmentstatus",
//         "enrollmentstatus.enrollmentstatusid",
//         "enrollments.enrollmentstatusid"
//       );

//     // Apply filters
//     if (enrollmentstatus) {
//       baseQuery = baseQuery.where(
//         "enrollments.enrollmentstatusid",
//         enrollmentstatus
//       );
//     }
//     if (studentid)
//       baseQuery = baseQuery.where("enrollments.studentid", studentid);
//     if (universityid)
//       baseQuery = baseQuery.where("enrollments.universityid", universityid);
//     if (courseid) baseQuery = baseQuery.where("enrollments.courseid", courseid);
//     if (departmentid)
//       baseQuery = baseQuery.where("enrollments.departmentid", departmentid);

//     // Clone for count before adding limit/offset
//     const countQuery = baseQuery.clone().count("* as total").first();

//     // Apply pagination
//     if (limit) baseQuery.limit(Number(limit));
//     if (offset) baseQuery.offset(Number(offset));

//     const [enrollmentData, totalCount] = await Promise.all([
//       baseQuery.select("enrollments.*"),
//       countQuery,
//     ]);

//     // Fetch student and admin info
//     await Promise.all(
//       enrollmentData.map(async (enroll) => {
//         const student = await db("students")
//           .where("studentid", enroll.studentid)
//           .first();
//         enroll.student = student;

//         const admin = await db("admins")
//           .where("adminid", enroll.adminid)
//           .first();
//         enroll.admin = admin;
//       })
//     );

//     if (!enrollmentData.length) {
//       return { code: 200, status: false, message: "No enrollment found" };
//     }

//     return {
//       code: 200,
//       status: true,
//       message: "Enrollments fetched successfully",
//       response: enrollmentData,
//       total: totalCount?.total || 0,
//     };
//   } catch (err) {
//     console.error("Error fetching enrollments:", err);
//     return { code: 500, status: false, message: "Failed to fetch enrollments" };
//   }
// };

module.exports.getEnrollments = async (props) => {
  const {
    offset,
    limit,
    filters = {},
    adminid,
    studentid,
    enrollmentid,
    enrollmentstatusid,
  } = props;

  const db = global.dbConnection;

  try {
    // Build base query
    const enrollmentQuery = db("enrollments")
      .leftJoin(
        "universities",
        "universities.universityid",
        "enrollments.universityid"
      )
      .leftJoin("courses", "courses.courseid", "enrollments.courseid")
      .leftJoin(
        "departments",
        "departments.departmentid",
        "enrollments.departmentid"
      )
      .leftJoin(
        "enrollmentstatus",
        "enrollmentstatus.enrollmentstatusid",
        "enrollments.enrollmentstatusid"
      )
      .select(
        "enrollments.*",
        "universities.universityname",
        "courses.coursename",
        "departments.departmentname",
        "enrollmentstatus.enrollmentstatusname as enrollmentstatus"
      )
      .orderBy("enrollments.enrollmentid", "desc")
      .modify((query) => {
        if (studentid) query.where("enrollments.studentid", studentid);
        if (enrollmentid) query.where("enrollments.enrollmentid", enrollmentid);
        if (enrollmentstatusid)
          query.where("enrollments.enrollmentstatusid", enrollmentstatusid);
        if (adminid) query.where("enrollments.adminid", adminid);
        if (offset !== undefined) query.offset(Number(offset));
        if (limit !== undefined) query.limit(Number(limit));
      });

    const enrollments = await enrollmentQuery;

    await Promise.all(
      enrollments.map(async (enroll) => {
        const student = await db("students")
          .where({ studentid: enroll.studentid })
          .first();

        enroll.student = student || null;

        if (student) {
          const admin = await db("admins")
            .where({ adminid: student.adminid })
            .first();

          enroll.admin = admin || null;
        } else {
          enroll.admin = null;
        }
      })
    );

    return {
      code: 200,
      status: true,
      message: "Enrollments fetched successfully",
      response: enrollments,
    };
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch enrollments",
      response: [],
    };
  }
};

module.exports.getCompletedEnrollment = async ({ userid } = {}) => {
  const db = global.dbConnection;
  try {
    // If you want to filter by userid, uncomment the next line and add .where({ userid }) to the query
    // if (!userid) throw new Error("User ID is required");

    // Count enrollments with status 8 (completed)
    const completedQuery = db("enrollments").where({ enrollmentstatusid: 8 });

    // Count enrollments with status 5 (rejected)
    const rejectedQuery = db("enrollments").where({ enrollmentstatusid: 5 });

    // Count enrollments with status 1,2,3,4,6,7 (under process)
    const underProcessQuery = db("enrollments").whereIn("enrollmentstatusid", [1, 2, 3, 4, 6, 7]);

    // If you want to filter by userid, add: .andWhere({ userid })
    // if (userid) {
    //   completedQuery.andWhere({ userid });
    //   rejectedQuery.andWhere({ userid });
    //   underProcessQuery.andWhere({ userid });
    // }

    // Get the total count for under process statuses in a single query
    const [[{ count: completedCount }], 
         [{ count: rejectedCount }], 
         [{ count: underProcessCount }]] = await Promise.all([
      completedQuery.clone().count("* as count"),
      rejectedQuery.clone().count("* as count"),
      db("enrollments")
      .whereIn("enrollmentstatusid", [1, 2, 3, 4, 6, 7])
      .count("* as count")
    ]);

    return {
      code: 200,
      status: true,
      message: "Enrollment counts fetched successfully",
      completedCount: Number(completedCount) || 0,
      rejectedCount: Number(rejectedCount) || 0,
      underProcessCount: Number(underProcessCount) || 0,
    };
    // If you want to filter by userid, add: .andWhere({ userid })

    const [{ count }] = await query.count("* as count");

    return {
      code: 200,
      status: true,
      message: "Completed enrollments count fetched successfully",
      count: Number(count) || 0,
    };
  } catch (err) {
    console.error("Error fetching completed enrollments count:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to fetch completed enrollments count",
      error: err.message,
    };
  }
};

module.exports.getEnrollmentsCount = async (props) => {
  const { from, to, studentid, adminid } = props;
  const db = global.dbConnection;

  try {
    const result = await db.transaction(async (trx) => {
      // Get all possible statuses
      const allStatuses = await trx("enrollmentstatus").select(
        "enrollmentstatusid",
        "enrollmentstatusname"
      );

      // Initialize map
      const countMap = allStatuses.reduce((acc, status) => {
        acc[status.enrollmentstatusid] = {
          enrollmentstatusid: status.enrollmentstatusid,
          enrollmentstatus: status.enrollmentstatusname,
          count: 0,
        };
        return acc;
      }, {});

      // Query with filters, without ORDER BY
      
      let enrollQuery = trx("enrollments")
        .join(
          "enrollmentstatus",
          "enrollmentstatus.enrollmentstatusid",
          "enrollments.enrollmentstatusid"
        )
        .select(
          "enrollments.enrollmentstatusid",
          "enrollmentstatus.enrollmentstatusname"
        )
        .count("* as count")
        .groupBy(
          "enrollments.enrollmentstatusid",
          "enrollmentstatus.enrollmentstatusname"
        );

      if (studentid) {
        enrollQuery = enrollQuery.where("enrollments.studentid", studentid);
      }

      if (adminid) {
        enrollQuery = enrollQuery.where("enrollments.adminid", adminid);
      }

      if (from && to) {
        enrollQuery = enrollQuery.whereBetween(
          db.raw("DATE(enrollments.created)"),
          [from, to]
        );
      }

      const enrollments = await enrollQuery;

      // Populate results
      enrollments.forEach((enroll) => {
        if (countMap[enroll.enrollmentstatusid]) {
          countMap[enroll.enrollmentstatusid].count += parseInt(
            enroll.count,
            10
          );
        }
      });

      const resultArray = Object.values(countMap);
      const totalCount = resultArray.reduce((sum, item) => sum + item.count, 0);

      return [...resultArray];
    });

    return result;
  } catch (err) {
    console.error("Error in getEnrollmentsCount:", err);
    throw err;
  }
};

// module.exports.getEnrollmentsCount = async (props) => {
//   const { filters = {}, stageType, from, to } = props;

//   const db = global.dbConnection;

//   try {
//     const result = await db.transaction(async (trx) => {
//       const allStatuses = await trx("enrollmentstatus").select(
//         "enrollmentstatusid",
//         "enrollmentstatusname"
//       );

//       // Initialize counts
//       const countMap = allStatuses.reduce((acc, status) => {
//         acc[status.enrollmentstatusid] = {
//           enrollmentstatusid: status.enrollmentstatusid,
//           enrollmentstatus: status.enrollmentstatusname,
//           count: 0,
//         };
//         return acc;
//       }, {});

//       const groupedCounts = await trx("enrollments")
//         .select("enrollmentstatusid")
//         .count("enrollmentid as count")
//         .modify((query) => {
//           // Apply dynamic filters
//           Object.entries(filters).forEach(([key, value]) => {
//             if (Array.isArray(value)) {
//               query.whereIn(key, value);
//             } else {
//               query.where(key, value);
//             }
//           });

//           // Stage-based filtering
//           if (stageType && stageType !== "all") {
//             const statusMap = {
//               pending: [1],
//               cooling: [2],
//               approved: [4],
//               rejected: [5],
//               eoa: [6],
//             };
//             query.whereIn("enrollmentstatusid", statusMap[stageType] || []);
//           }

//           if (from && to) {
//             query.whereBetween(trx.raw("DATE(enrollmentdate)"), [from, to]);
//           }
//         })
//         .groupBy("enrollmentstatusid");

//       // Merge counts
//       groupedCounts.forEach(({ enrollmentstatusid, count }) => {
//         if (countMap[enrollmentstatusid]) {
//           countMap[enrollmentstatusid].count = parseInt(count, 10);
//         }
//       });

//       const resultArray = Object.values(countMap);
//       const total = resultArray.reduce((sum, r) => sum + r.count, 0);
//       const totalEntry = {
//         enrollmentstatusid: 0,
//         enrollmentstatus: "All",
//         count: total,
//       };

//       return [totalEntry, ...resultArray];
//     });

//     return result;
//   } catch (err) {
//     console.error("Error in getEnrollmentsCount:", err);
//     throw err;
//   }
// };

module.exports.selectUniversity = async (props) => {
  const db = global.dbConnection;

  try {
    const { university, studentid } = props;

    const checkStudent = await db("students")
      .where({
        studentid,
      })
      .first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found",
      };
    }

    const result = await db.transaction(async (trx) => {
      for (const univer of university) {
        const checkUniversity = await trx("universities")
          .where({
            universityid: univer.universityid,
          })
          .first();
        if (!checkUniversity) {
          return {
            code: 200,
            status: false,
            message: "University not found",
          };
        }
        const checkCourses = await trx("courses")
          .where({
            courseid: univer.courseid,
          })
          .first();
        if (!checkCourses) {
          return {
            code: 200,
            status: false,
            message: "Course not found",
          };
        }
        const checkDepartment = await trx("departments")
          .where({
            departmentid: univer.departmentid,
          })
          .first();
        if (!checkDepartment) {
          return {
            code: 200,
            status: false,
            message: "Department not found",
          };
        }

        const insertEnrollments = await trx("enrollments").insert({
          studentid,
          universityid: univer.universityid,
          courseid: univer.courseid,
          departmentid: univer.departmentid,
        });

        if (!insertEnrollments || insertEnrollments.length === 0) {
          throw new Error("Failed to insert an enrollment record");
        }
      }

      return {
        code: 200,
        status: true,
        message: "Student university selection saved successfully",
      };
    });

    return result;
  } catch (err) {
    console.error("Error creating student:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to create student",
    };
  }
};

module.exports.assignAdmin = async (props) => {
  const db = global.dbConnection;

  try {
    const { adminid, studentid } = props;

    // Check if student exists
    const checkStudent = await db("students").where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found",
      };
    }

    const checkAdmin = await db("admins").where({ adminid }).first();
    if (!checkAdmin) {
      return {
        code: 200,
        status: false,
        message: "Admin not found",
      };
    }

    const result = await db.transaction(async (trx) => {
      const adminAssigned = await trx("students")
        .update({ adminid })
        .where({ studentid });

      if (!adminAssigned) {
        throw new Error("Failed to assign admin to student");
      }

      return {
        code: 200,
        status: true,
        message: "Admin assigned to student successfully",
      };
    });

    return result;
  } catch (err) {
    console.error("Error in assignAdmin:", err);
    return {
      code: 500,
      status: false,
      message: err.message || "Failed to assign admin",
    };
  }
};

module.exports.universityCheckList = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentstatusid, studentid, checklistid, enrollmentid, userid } =
      props;

    // Check if student exists
    const checkStudent = await db("students").where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found for University checklist",
      };
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Insert into student_checklist and get the inserted ID
      const [studentchecklistid] = await trx("student_checklist")
        .insert({
          studentid,
          enrollmentid,
          checklistid,
        })
        .returning("studentchecklistid");

      // Fetch checklist items
      const checklistItems = await trx("check_list_items").where({
        checklistid,
      });

      if (!checklistItems.length) {
        throw new Error("No checklist items found for the given checklistid");
      }

      // Insert each item into check_list_data
      for (const item of checklistItems) {
        await trx("check_list_data").insert({
          studentchecklistid,
          checklistid,
          checklistitemid: item.checklistitemid,
          studentid,
          enrollmentstatusid,
          enrollmentid,
          documentid: item.documentid,
          documenttypeid: item.documenttypeid,
        });
      }

      // Update enrollment status
      const enrollmentUpdate = await trx("enrollments")
        .where({ studentid, enrollmentid })
        .update({ enrollmentstatusid: 2 });

      if (!enrollmentUpdate) {
        throw new Error("Enrollment table not updated");
      }
    });

    return {
      code: 200,
      status: true,
      message: "University checklist items assigned successfully",
    };
  } catch (err) {
    console.error("Error in universityCheckList:", err.message, err.stack);
    return {
      code: 500,
      status: false,
      message:
        err.message || "Failed to assign checklist items and update enrollment",
    };
  }
};

module.exports.offerLetterCheckList = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentstatusid, studentid, checklistid, enrollmentid } = props;

    // Fetch student details
    const student = await db("students").where({ studentid }).first();
    if (!student) {
      return {
        code: 404,
        status: false,
        message: "Student not found for sending checklist",
      };
    }

    // Check existing enrollment
    const existingEnrollment = await db("enrollments")
      .where({ studentid })
      .first();

    // If checklist and enrollment details are already up to date, no need to update
    if (
      existingEnrollment &&
      existingEnrollment.enrollmentstatusid === enrollmentstatusid &&
      existingEnrollment.checklistid === checklistid
    ) {
      return {
        code: 200,
        status: true,
        message: "Offer Letter Checklist already sent successfully",
      };
    }

    // Start a transaction to insert checklist items
    await db.transaction(async (trx) => {
      // Fetch checklist items related to the checklistid within the transaction
      const checklists = await trx("check_list_items").where({ checklistid });

      // Insert checklist items into the check_list_data table with upsert
      await Promise.all(
        checklists.map((item) =>
          trx("check_list_data")
            .insert({
              checklistid,
              checklistitemid: item.checklistitemid,
              studentid,
              enrollmentstatusid,
              documentid: item.documentid,
              documenttypeid: item.documenttypeid,
            })
            .onConflict(["studentid", "checklistid", "checklistitemid"])
            .merge({
              enrollmentstatusid,
              documentid: item.documentid,
              documenttypeid: item.documenttypeid,
            })
        )
      );

      // If there's an existing enrollment, update it. Otherwise, create a new one.
      if (existingEnrollment) {
        await trx("enrollments")
          .where({ studentid, enrollmentid })
          .update({
            enrollmentstatusid,
            checklistid,
            updated: trx.raw("CURRENT_TIMESTAMP"),
          });
      } else {
        await trx("enrollments").insert({
          studentid,
          enrollmentstatusid,
          checklistid,
          created: trx.raw("CURRENT_TIMESTAMP"),
        });
      }
    });

    return {
      code: 200,
      status: true,
      message: "Checklist items assigned and enrollment updated successfully",
    };
  } catch (err) {
    console.error("Error in offerLetterCheckList:", err);

    // Provide additional error context in the response
    return {
      code: 500,
      status: false,
      message:
        err.message || "Failed to assign checklist items and update enrollment",
    };
  }
};

module.exports.coeCheckList = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentstatusid, studentid, checklistid, enrollmentid, userid } =
      props;

    // Check if student exists
    const checkStudent = await db("students").where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found for University checklist",
      };
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Insert into student_checklist and get the inserted ID
      const [studentchecklistid] = await trx("student_checklist")
        .insert({
          studentid,
          enrollmentid,
          checklistid,
        })
        .returning("studentchecklistid");

      // Fetch checklist items
      const checklistItems = await trx("check_list_items").where({
        checklistid,
      });

      if (!checklistItems.length) {
        throw new Error("No checklist items found for the given checklistid");
      }

      // Insert each item into check_list_data
      for (const item of checklistItems) {
        await trx("check_list_data").insert({
          studentchecklistid,
          checklistid,
          checklistitemid: item.checklistitemid,
          studentid,
          enrollmentstatusid,
          enrollmentid,
          documentid: item.documentid,
          documenttypeid: item.documenttypeid,
        });
      }

      // Update enrollment status
      // const enrollmentUpdate = await trx("enrollments")
      //   .where({ studentid, enrollmentid })
      //   .update({ enrollmentstatusid: 2 });

      // if (!enrollmentUpdate) {
      //   throw new Error("Enrollment table not updated");
      // }
    });

    return {
      code: 200,
      status: true,
      message: "University checklist items assigned successfully",
    };
  } catch (err) {
    console.error("Error in coeCheckList:", err);
    return {
      code: 500,
      status: false,
      message:
        err.message || "Failed to assign COE checklist and update enrollment",
    };
  }
};

module.exports.visaCheckList = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentstatusid, studentid, checklistid, enrollmentid, userid } =
      props;

    // Check if student exists
    const checkStudent = await db("students").where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found for University checklist",
      };
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Insert into student_checklist and get the inserted ID
      const [studentchecklistid] = await trx("student_checklist")
        .insert({
          studentid,
          enrollmentid,
          checklistid,
        })
        .returning("studentchecklistid");

      // Fetch checklist items
      const checklistItems = await trx("check_list_items").where({
        checklistid,
      });

      if (!checklistItems.length) {
        throw new Error("No checklist items found for the given checklistid");
      }

      // Insert each item into check_list_data
      for (const item of checklistItems) {
        await trx("check_list_data").insert({
          studentchecklistid,
          checklistid,
          checklistitemid: item.checklistitemid,
          studentid,
          enrollmentstatusid,
          enrollmentid,
          documentid: item.documentid,
          documenttypeid: item.documenttypeid,
        });
      }

      // Update enrollment status
      const enrollmentUpdate = await trx("enrollments")
        .where({ studentid, enrollmentid })
        .update({ enrollmentstatusid: 7 });

      if (!enrollmentUpdate) {
        throw new Error("Enrollment table not updated");
      }
    });

    return {
      code: 200,
      status: true,
      message: "University checklist items assigned successfully",
    };
  } catch (err) {
    console.error("Error in visaCheckList:", err);
    return {
      code: 500,
      status: false,
      message: err.message || "Error assigning Visa checklist items",
    };
  }
};

module.exports.preDepatureCheckList = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentstatusid, studentid, checklistid } = props;

    const checkStudent = await db("students").where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: "Student not found for Pre-Departure checklist",
      };
    }

    await db.transaction(async (trx) => {
      const checklists = await trx("check_list_items").where({ checklistid });

      await Promise.all(
        checklists.map((checklist) =>
          trx("check_list_data").insert({
            checklistid,
            checklistitemid: checklist.checklistitemid,
            studentid,
            enrollmentstatusid,
            documentid: checklist.documentid,
            documenttypeid: checklist.documenttypeid,
          })
        )
      );
    });

    return {
      code: 200,
      status: true,
      message: "Pre-Departure checklist items assigned successfully",
    };
  } catch (err) {
    console.error("Error in preDepatureCheckList:", err);
    return {
      code: 500,
      status: false,
      message: err.message || "Error assigning Pre-Departure checklist items",
    };
  }
};

// module.exports.approvedChecklist = async (props) => {
//   const db = global.dbConnection;
//   const { studentid, enrollmentid } = props;

//   try {
//     // Log for debugging
//     console.log("studentid:", studentid);
//     console.log("enrollmentid:", enrollmentid); // Ensure enrollmentid is passed correctly

//     // Check if enrollmentid is undefined
//     if (!enrollmentid) {
//       throw new Error("enrollmentid is undefined");
//     }

//     // Before update
//     const currentEnrollment = await db("enrollments")
//       .where("enrollmentid", enrollmentid)
//       .andWhere("studentid", studentid)
//       .first();
//     console.log("Before update:", currentEnrollment);

//     if (!currentEnrollment) {
//       throw new Error(`No enrollment found with enrollmentid: ${enrollmentid}`);
//     }

//     const newStatus = 4;
//     // Check if update is needed
//     if (currentEnrollment.enrollmentstatusid === newStatus) {
//       console.log("No update needed. The status is already 'Accepted'.");
//       return {
//         status: false,
//         message: "No update needed. The status is already 'Accepted'.",
//       };
//     }

//     // Update operation
//     const result = await db("enrollments")
//       .where("enrollmentid", enrollmentid)
//       .andWhere("studentid", studentid)
//       .update({ enrollmentstatusid: newStatus });

//     if (result) {
//       return {
//         status: true,
//         message: "Enrollment status updated successfully to 'Accepted'.",
//       };
//     } else {
//       throw new Error("Failed to update enrollment status.");
//     }
//   } catch (error) {
//     console.error("Error updating enrollment status:", error);
//     return {
//       status: false,
//       message: `An error occurred while updating the enrollment status: ${error.message}`,
//     };
//   }
// };

// module.exports.rejectedChecklist = async (props) => {
//   const db = global.dbConnection;
//   const { studentid, enrollmentid } = props;

//   try {
//     // Log the input values for debugging
//     console.log(
//       "Rejected checklist processing for studentid:",
//       studentid,
//       "enrollmentid:",
//       enrollmentid
//     );

//     if (!studentid || !enrollmentid) {
//       return {
//         status: false,
//         message: "Invalid student ID or enrollment ID",
//       };
//     }

//     // Fetch current enrollment data
//     const currentEnrollment = await db("enrollments")
//       .where("enrollmentid", enrollmentid)
//       .andWhere("studentid", studentid)
//       .first();

//     if (!currentEnrollment) {
//       return {
//         status: false,
//         message: "Enrollment record not found",
//       };
//     }

//     // If the status is already 'Rejected', no update is needed
//     if (currentEnrollment.enrollmentstatusid === 5) {
//       console.log("No update needed, status already 'Rejected'.");
//       return {
//         status: false,
//         message: "No update needed. The status is already 'Rejected'.",
//       };
//     }

//     // Update the enrollment status to 'Rejected' (ID: 5)
//     const result = await db("enrollments")
//       .where("enrollmentid", enrollmentid)
//       .andWhere("studentid", studentid)
//       .update({ enrollmentstatusid: 5 });

//     // Return response
//     if (result) {
//       return {
//         status: true,
//         message: "Enrollment status updated successfully to 'Rejected'.",
//       };
//     } else {
//       return {
//         status: false,
//         message: "Failed to update enrollment status to 'Rejected'.",
//       };
//     }
//   } catch (error) {
//     console.error("Error processing rejected checklist:", error.stack);
//     return {
//       status: false,
//       message: "An error occurred while processing the rejected checklist.",
//     };
//   }
// };

module.exports.SendOfferLetter = async (props) => {
  const db = global.dbConnection;
  const { enrollmentid, studentid, offerletterurl } = props;

  try {
    // Check if the enrollment exists
    const existingEnrollment = await db("enrollments")
      .where({ enrollmentid, studentid })
      .first();

    if (!existingEnrollment) {
      throw new Error("Enrollment Not Found");
    }

    await db("enrollments")
      .where({ enrollmentid, studentid })
      .update({
        offerletterurl: offerletterurl,
        enrollmentstatusid: 3,
        updated: db.raw("CURRENT_TIMESTAMP"),
      });

    return {
      code: 200,
      status: true,
      message: "Offer Letter URL sent",
    };
  } catch (err) {
    console.error("Offer Letter Upload Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to save offer letter data to enrollments.",
      error: err.message,
    };
  }
};

module.exports.updateEnrollmentStatus = async (props) => {
  const db = global.dbConnection;
  const { studentid, enrollmentid, enrollmentstatusid } = props;

  if (!studentid || !enrollmentid || !enrollmentstatusid) {
    return {
      status: false,
      code: 400,
      message: "Missing student ID, enrollment ID, or status ID.",
    };
  }

  try {
    const currentEnrollment = await db("enrollments")
      .where({ enrollmentid, studentid })
      .first();

    if (!currentEnrollment) {
      return {
        status: false,
        code: 404,
        message: "Enrollment not found",
      };
    }

    if (currentEnrollment.enrollmentstatusid === enrollmentstatusid) {
      return {
        status: false,
        code: 200,
        message: "No update needed. Status is already set.",
      };
    }

    const result = await db("enrollments")
      .where({ enrollmentid, studentid })
      .update({ enrollmentstatusid });

    if (result) {
      return {
        status: true,
        code: 200,
        message: `Enrollment status updated successfully to '${enrollmentstatusid}'.`,
      };
    } else {
      return {
        status: false,
        code: 500,
        message: "Failed to update enrollment status.",
      };
    }
  } catch (error) {
    console.error("updateEnrollmentStatus error:", error);
    return {
      status: false,
      code: 500,
      message: `Internal error: ${error.message}`,
    };
  }
};

module.exports.requestReceipt = async (props) => {
  const db = global.dbConnection;
  const { enrollmentid, studentid } = props;

  try {
    // 1. Check if enrollment exists
    const existingEnrollment = await db("enrollments")
      .where({ enrollmentid, studentid })
      .first();

    if (!existingEnrollment) {
      return {
        code: 404,
        status: false,
        message: "Enrollment not found.",
      };
    }

    // 2. Get related checklist data
    const checklistRow = await db("check_list_data")
      .where({
        studentid,
        checklistid: existingEnrollment.checklistid,
      })
      .first();

    if (!checklistRow) {
      return {
        code: 404,
        status: false,
        message: "Checklist data not found for student and enrollment.",
      };
    }

    // 3. Check if receipt already requested
    if (checklistRow.receipturl) {
      return {
        code: 200,
        status: true,
        message: "Receipt already requested.",
        receipt: {
          receipturl: checklistRow.receipturl,
        },
      };
    }

    // 4. Create the receipt (URL null for now)
    const receipturl = null;

    await db("check_list_data")
      .where({ checklistdataid: checklistRow.checklistdataid })
      .update({
        receipturl,
        receiptstatus: "Requested", // <-- Only if this column exists
      });

    return {
      code: 200,
      status: true,
      message: "Receipt request initiated successfully.",
      receipt: {
        receipturl,
      },
    };
  } catch (err) {
    console.error("Receipt Request Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to request receipt.",
      error: err.message,
    };
  }
};

module.exports.uploadCoeDocument = async (props) => {
  const db = global.dbConnection;
  const { enrollmentid, studentid, coeurl } = props;

  try {
    const enrollment = await db("enrollments")
      .where({ enrollmentid, studentid })
      .first();

    if (!enrollment) {
      return {
        code: 404,
        status: false,
        message: "Enrollment not found.",
      };
    }

    await db("enrollments").where({ enrollmentid, studentid }).update({
      enrollmentstatusid: 6,
      coeurl,
    });

    return {
      code: 200,
      status: true,
      message:
        "COE document uploaded and enrollment status updated successfully.",
      coeurl,
    };
  } catch (err) {
    console.error("Upload COE Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to upload COE document and update enrollment status.",
      error: err.message,
    };
  }
};

module.exports.uploadVisaDocument = async (props) => {
  const db = global.dbConnection;
  const { enrollmentid, studentid, visaurl } = props;

  try {
    const enrollment = await db("enrollments")
      .where({ enrollmentid, studentid })
      .first();

    if (!enrollment) {
      return {
        code: 404,
        status: false,
        message: "Enrollment not found.",
      };
    }

    await db("enrollments").where({ enrollmentid, studentid }).update({
      enrollmentstatusid: 8,
      visaurl,
    });

    return {
      code: 200,
      status: true,
      message:
        "Visa document uploaded and enrollment status updated successfully.",
      visaurl,
    };
  } catch (err) {
    console.error("Upload Visa Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to upload Visa document and update enrollment status.",
      error: err.message,
    };
  }
};

module.exports.getCheckListData = async (props) => {
  const db = global.dbConnection;

  try {
    const { enrollmentid } = props;

    const studentCheckListData = await db("student_checklist")
      .leftJoin(
        "check_list",
        "check_list.checklistid",
        "student_checklist.checklistid"
      )
      .where({
        enrollmentid,
      });

    if (!studentCheckListData.length) {
      return {
        code: 200,
        status: false,
        message: "No student checklist found for the given enrollment",
      };
    }

    const checklistGroups = [];

    for (const stdCheckList of studentCheckListData) {
      const checkListItems = await db("check_list_data")
        .leftJoin(
          "app_document",
          "app_document.documentid",
          "check_list_data.documentid"
        )
        .where({
          studentchecklistid: stdCheckList.studentchecklistid,
        });

      if (checkListItems.length) {
        checklistGroups.push({
          checklistid: stdCheckList.checklistid,
          checklistname: stdCheckList.checklistname,
          studentchecklistid: stdCheckList.studentchecklistid,
          studentid: stdCheckList.studentid,
          enrollmentid: stdCheckList.enrollmentid,
          documents: checkListItems,
        });
      }
    }

    if (!checklistGroups.length) {
      return {
        code: 200,
        status: false,
        message: "No checklist data found for the given enrollment",
      };
    }

    return {
      code: 200,
      status: true,
      message: "Checklist data fetched successfully",
      response: checklistGroups,
    };
  } catch (err) {
    console.error("Error in getCheckListData:", err);
    return {
      code: 500,
      status: false,
      message: err.message || "Error fetching checklist data",
    };
  }
};

module.exports.viewCheckListStatus = async (props) => {
  const db = global.dbConnection;
  const { enrollmentid, studentid } = props;

  try {
    const enrollment = await db("student_checklist")
      .leftJoin(
        "check_list",
        "check_list.checklistid",
        "student_checklist.checklistid"
      )
      .where({ enrollmentid, studentid });

    if (!enrollment) {
      return {
        code: 404,
        status: false,
        message: "Enrollment not found.",
      };
    }

    return {
      code: 200,
      status: true,
      response: enrollment,
      message: "Successfully Fetched Checklist Status",
    };
  } catch (err) {
    console.error("Upload COE Error:", err);
    return {
      code: 500,
      status: false,
      message: "Failed to upload COE document and update enrollment status.",
    };
  }
};
