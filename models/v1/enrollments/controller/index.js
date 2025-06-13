const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");
const passport = require("passport");

// module.exports.getEnrollments = async (req, res) => {
//   try {
//     const result = {
//       ...req.body,
//     };

//     // Validation schema
//     const schema = Joi.object({
//       studentid: Joi.number().optional().messages({
//         "number.base": "Student ID must be a number",
//       }),
//       adminid: Joi.number().optional().messages({
//         "number.base": "Admin ID must be a number",
//       }),
//       universityid: Joi.number().optional().messages({
//         "number.base": "University ID must be a number",
//       }),
//       courseid: Joi.number().optional().messages({
//         "number.base": "Course ID must be a number",
//       }),
//       departmentid: Joi.number().optional().messages({
//         "number.base": "Department ID must be a number",
//       }),
//       enrollmentstatus: Joi.number().optional().messages({
//         "number.base": "Enrollment Status ID must be a number",
//       }),
//       limit: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
//         "number.base": "Limit must be a number or empty",
//       }),
//       offset: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
//         "number.base": "Offset must be a number or empty",
//       }),
//     });

//     const { error } = schema.validate(result);

//     if (error) {
//       return res.status(400).send({
//         status: false,
//         message: error.details[0]?.message || "Validation error",
//       });
//     }

//     // Call service function
//     const response = await service.getEnrollments(result);

//     if (
//       !response ||
//       typeof response.code !== "number" ||
//       typeof response.status !== "boolean"
//     ) {
//       return res.status(500).send({
//         status: false,
//         message: "Unexpected error occurred while fetching student details",
//       });
//     }

//     return res.status(response.code).send({
//       status: response.status,
//       message: response.message,
//       response: response.response,
//       total: response.total || 0,
//     });
//   } catch (error) {
//     console.error("Error in getEnrollments:", error);
//     return res.status(500).send({
//       status: false,
//       message: "Internal server error: failed to fetch student details",
//     });
//   }
// };

module.exports.getEnrollments = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const roleid = req.headers["roleid"];

    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      studentid: Joi.number().allow("").messages({
        "number.base": "Student ID must be a number",
      }),
      adminid: Joi.number().allow("").messages({
        "number.base": "Admin ID must be a number",
      }),
      universityid: Joi.number().allow("").messages({
        "number.base": "University ID must be a number",
      }),
      courseid: Joi.number().allow("").messages({
        "number.base": "Course ID must be a number",
      }),
      departmentid: Joi.number().allow("").messages({
        "number.base": "Department ID must be a number",
      }),
      limit: Joi.any().allow("").messages({
        "number.base": "Limit must be a number",
      }),
      offset: Joi.number().allow("").messages({
        "number.base": "Offset must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      enrollmentstatusid: Joi.number().optional().messages({
        "any.required": "Enrollment Status ID is required",
        "number.base": "Enrollment Status ID must be a number",
      }),
      enrollmentid: Joi.number().optional().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
    });

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getEnrollments(result);
    const totalCount = await service.getEnrollmentsCount(result); // optional count fetch

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetching enrollment details",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
      count: totalCount || 0,
    });
  } catch (error) {
    console.error("Error in getEnrollments:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to fetch enrollment data",
    });
  }
};

module.exports.getCompletedEnrollment = async (req, res) => {
  try {
    const userid = req.headers["userid"];
    // You can add more filters from req.body if needed

    // Optionally validate userid
    if (!userid) {
      return res.status(400).send({
        status: false,
        message: "User ID header is required",
      });
    }

    // Call the service to get completed enrollment count
    const count = await service.getCompletedEnrollment({ userid });

    return res.status(200).send({
      status: true,
      message: "Completed enrollment count fetched successfully",
      count: count || 0,
    });
  } catch (error) {
    console.error("Error in getCompletedEnrollment:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to fetch completed enrollment count",
    });
  }
};

module.exports.selectUniversity = async (req, res) => {
  try {
    const userid = req.headers["userid"];

    // if (!userid) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "User ID header is required",
    //   });
    // }

    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      university: Joi.array()
        .items(
          Joi.object({
            universityid: Joi.number().required().messages({
              "any.required": "University id is required",
            }),
            courseid: Joi.number().required().messages({
              "any.required": "Course id is required",
            }),
            departmentid: Joi.number().required().messages({
              "any.required": "Department id is required",
            }),
          })
        )
        .required(),
      studentid: Joi.number().required().messages({
        "any.required": "Student id is required",
      }),
      userid: Joi.string().required().messages({
        "any.required": "User ID is required",
      }),
    }).unknown(false); // optional: disallow unknown fields

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const response = await service.selectUniversity(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while select university",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in selectUniversity:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to select university",
    });
  }
};

module.exports.assignAdmin = async (req, res) => {
  try {
    const userid = req.headers["userid"];

    // if (!userid) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "User ID header is required",
    //   });
    // }

    const result = {
      ...req.body,
      userid,
    };

    const schema = Joi.object({
      studentid: Joi.number().required().messages({
        "any.required": "Student id is required",
      }),
      adminid: Joi.number().required().messages({
        "any.required": "Student id is required",
      }),
      userid: Joi.string().required().messages({
        "any.required": "User ID is required",
      }),
    }).unknown(false); // optional: disallow unknown fields

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const response = await service.assignAdmin(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while select university",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in selectUniversity:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to select university",
    });
  }
};

module.exports.sendCheckList = async (req, res) => {
  try {
    const { enrollmentstatusid, enrollmentid, studentid, checklistid } =
      req.body;

    const result = {
      ...req.body,
    };

    const schema = Joi.object({
      studentid: Joi.number().required(),
      enrollmentstatusid: Joi.number().required(),
      enrollmentid: Joi.number().required(),
      checklistid: Joi.number().required(),
    }).unknown(true);

    const { error } = schema.validate(result, { abortEarly: false });
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    let response;

    switch (enrollmentstatusid) {
      case 1:
        response = await service.universityCheckList(result);
        break;

      case 3:
        response = await service.offerLetterCheckList(result);
        break;

      case 6:
        response = await service.visaCheckList(result);
        break;

      case 4:
        response = await service.coeCheckList(result);
        break;

      case 8:
        response = await service.preDepatureCheckList(result);
        break;

      default:
        return res.status(400).send({
          status: false,
          message: "Invalid enrollment status ID",
        });
    }

    return res.status(response.code || (response.status ? 200 : 400)).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in sendCheckList:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: failed to process checklist",
    });
  }
};

module.exports.sendOfferLetter = async (req, res) => {
  try {
    // Define Joi schema for validation
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
      studentid: Joi.number().required().messages({
        "any.required": "Student ID is required",
        "number.base": "Student ID must be a number",
      }),
      offerletterurl: Joi.string().uri().required().messages({
        "any.required": "Document URL is required",
        "string.uri": "Document URL must be a valid URL",
      }),
    });
    // Validate the request body against the schema
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // If validation fails, return a 400 Bad Request response
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }
    // Extract validated data
    const { enrollmentid, studentid, offerletterurl } = req.body;
    // Call the service function to handle the database logic
    const response = await service.SendOfferLetter({
      enrollmentid,
      studentid,
      offerletterurl,
    });
    // Respond based on the service function result
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in sendOfferLetter controller:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: Failed to process offer letter upload.",
    });
  }
};

module.exports.requestReceipt = async (req, res) => {
  try {
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
      studentid: Joi.number().required().messages({
        "any.required": "Student ID is required",
        "number.base": "Student ID must be a number",
      }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const { enrollmentid, studentid } = req.body;

    const response = await service.requestReceipt({ enrollmentid, studentid });

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in requestReceipt controller:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: Failed to request receipt.",
    });
  }
};

module.exports.uploadCoeDocument = async (req, res) => {
  try {
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
      studentid: Joi.number().required().messages({
        "any.required": "Student ID is required",
        "number.base": "Student ID must be a number",
      }),
      coeurl: Joi.string().uri().required().messages({
        "any.required": "COE URL is required",
        "string.uri": "COE URL must be a valid URL",
      }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const { enrollmentid, studentid, coeurl } = req.body;

    const response = await service.uploadCoeDocument({
      enrollmentid,
      studentid,
      coeurl,
    });

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      coeurl: response.coeurl,
    });
  } catch (error) {
    console.error("Error in uploadCoeDocument controller:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: Failed to upload COE document.",
    });
  }
};

module.exports.uploadVisaDocument = async (req, res) => {
  try {
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
      studentid: Joi.number().required().messages({
        "any.required": "Student ID is required",
        "number.base": "Student ID must be a number",
      }),
      visaurl: Joi.string().uri().required().messages({
        "any.required": "Visa URL is required",
        "string.uri": "Visa URL must be a valid URL",
      }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const { enrollmentid, studentid, visaurl } = req.body;

    const response = await service.uploadVisaDocument({
      enrollmentid,
      studentid,
      visaurl,
    });

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      visaurl: response.visaurl,
    });
  } catch (error) {
    console.error("Error in uploadVisaDocument controller:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: Failed to upload Visa document.",
    });
  }
};

module.exports.viewCheckListStatus = async (req, res) => {
  try {
    const result = {
      ...req.body
    }
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "any.required": "Enrollment ID is required",
        "number.base": "Enrollment ID must be a number",
      }),
      studentid: Joi.number().required().messages({
        "any.required": "Student ID is required",
        "number.base": "Student ID must be a number",
      }),
    });

    const { error } = schema.validate(result, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const response = await service.viewCheckListStatus(result);
    console.log("response", response);
    

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.error("Error in viewCheckListStatus controller:", error);
    return res.status(500).send({
      status: false,
      message: "Internal server error: Failed to get viewCheckListStatus",
    });
  }
};

module.exports.getCheckListData = async (req, res) => {
  try {
    const result = {
      ...req.body,
    };
    // 1. Validate the input with Joi
    const schema = Joi.object({
      enrollmentid: Joi.number().required().messages({
        "number.base": "enrollment ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);

    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }

    const response = await service.getCheckListData(result);

    return res.status(response.code || 500).json({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.error("Error in getCheckListDataController:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};
