const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

// new requirement added to the customer projects and buildings
module.exports.createCourse = async (req, res) => {
  const db = global.dbConnection;

  console.log("Received request body:", req.body); // Debugging

  try {
    let {
      coursename,
      universityid,
      courseduration,
      courselevel,
      coursedescription,
      coursefees,
    } = req.body;

    console.log(
      "Raw universityid before validation:",
      universityid,
      "Type:",
      typeof universityid
    );

    // Convert universityid to a number
    universityid = Number(universityid);
    console.log(
      "Converted universityid:",
      universityid,
      "Type:",
      typeof universityid
    );

    // Ensure universityid is a valid number
    if (isNaN(universityid)) {
      return res.status(400).json({
        status: false,
        message: "Invalid university ID",
      });
    }

    // Define validation schema
    const schema = Joi.object({
      coursename: Joi.string().trim().required().messages({
        "any.required": "Course name is required",
        "string.base": "Course name must be a string",
      }),
      universityid: Joi.number().integer().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a number",
      }),
      courseduration: Joi.number().integer().positive().required().messages({
        "any.required": "Course duration is required",
        "number.base": "Course duration must be a valid number",
      }),
      courselevel: Joi.string()
        .valid("undergraduate", "postgraduate")
        .required()
        .messages({
          "any.required": "Course level is required",
          "string.base": "Course level must be a valid string",
        }),
      coursedescription: Joi.string().required().messages({
        "any.required": "Course description is required",
        "string.base": "Course description must be a string",
      }),
      coursefees: Joi.number().positive().required().messages({
        "any.required": "Course fees are required",
        "number.base": "Course fees must be a valid number",
      }),
    });

    // Validate input
    const { error } = schema.validate({
      coursename,
      universityid,
      courseduration,
      courselevel,
      coursedescription,
      coursefees,
    });
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0]?.message,
      });
    }

    // Check if university exists
    const university = await db("universities")
      .where("universityid", universityid) // Ensure column name matches DB schema
      .first();

    console.log("Found university:", university);

    if (!university) {
      return res.status(404).json({
        status: false,
        message: "University not found",
      });
    }

    // Prepare course data
    const courseData = {
      universityid, // Keep the same naming convention across DB & code
      coursename,
      courseduration,
      courselevel,
      coursedescription,
      coursefees,
    };

    console.log("Inserting course data:", courseData);

    // Insert course using service function
    const response = await service.createCourse(courseData);

    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Course created successfully",
      data: response.data || response,
    });
  } catch (error) {
    console.error("Error in createCourse:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.editCourse = async (req, res) => {
  try {
    const {
      courseid,
      universityid,
      coursename,
      courseduration,
      courselevel,
      coursedescription,
      coursefees,
    } = req.body;

    if (!courseid) {
      return res
        .status(400)
        .json({ status: false, message: "Course ID is required" });
    }

    // Define validation schema for the course fields
    const schema = Joi.object({
      courseid: Joi.number().integer().required().messages({
        "any.required": "Course ID is required",
        "number.base": "Course ID must be a valid number",
      }),
      universityid: Joi.number().integer().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a valid number",
      }),
      coursename: Joi.string().optional().messages({
        "string.base": "Course name must be a string",
      }),
      courseduration: Joi.number().integer().positive().optional().messages({
        "number.base": "courseduration must be a valid number",
        "number.positive": "courseduration must be a positive number",
      }),
      courselevel: Joi.string()
        .valid("undergraduate", "postgraduate")
        .optional()
        .messages({
          "string.base": "Course courselevel must be a valid string",
          "any.only":
            "Course courselevel must be either 'undergraduate' or 'postgraduate'",
        }),
      coursedescription: Joi.string().optional().messages({
        "string.base": "coursedescription must be a string",
      }),
      coursefees: Joi.number().positive().optional().messages({
        "number.base": "coursefees must be a valid number",
        "number.positive": "coursefees must be a positive number",
      }),
    });

    // Validate input
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0]?.message,
      });
    }

    // Call the service function to update the course
    const response = await service.editCourse(req.body); // Pass the whole req.body object

    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Course updated successfully",
      data: response.data || {},
    });
  } catch (error) {
    console.error("Error in editCourse:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.getCourse = async (req, res) => {
  try {
    // Extract query parameters for filtering (e.g., courseid, universityid, coursename)
    const { courseid, universityid, coursename } = req.body; // Ensure correct field names

    console.log("universityid", universityid);

    // Call the service to fetch courses with the filters, if provided
    const response = await service.getCourse({
      courseid,
      universityid,
      coursename,
    });

    if (!response || response.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No courses found matching the criteria",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Courses fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in getCourse:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.deleteCourse = async (req, res) => {
  try {
    const { courseid } = req.body; // Use correct field name

    if (!courseid) {
      return res.status(400).json({
        status: false,
        message: "Course ID is required",
      });
    }

    // Call the service function to delete the course
    const response = await service.deleteCourse({ courseid });

    if (response.code === 404) {
      return res.status(404).json({
        status: false,
        message: response.message,
      });
    }

    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.updateCourseStatus = async (req, res) => {
  try {
    const response = await service.updateCourseStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      data: response.data || null, // Ensure `data` is returned properly
    });
  } catch (error) {
    console.error("Error updating course status:", error);

    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
