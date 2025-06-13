const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

// new requirement added to the customer projects and buildings
module.exports.createDepartment = async (req, res) => {
  const db = global.dbConnection;

  try {
    const { departmentname, universityid, courseid, departmentdescription } =
      req.body;

    // Define validation schema for the department fields
    const schema = Joi.object({
      departmentname: Joi.string().required().messages({
        "any.required": "Department name is required",
        "string.base": "Department name must be a string",
      }),
      universityid: Joi.number().integer().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a number",
      }),
      courseid: Joi.number().integer().required().messages({
        "any.required": "Course ID is required",
        "number.base": "Course ID must be a number",
      }),
      departmentdescription: Joi.string().required().messages({
        "any.required": "Department description is required",
        "string.base": "Department description must be a string",
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

    // Check if the university exists by universityid
    const university = await db("universities")
      .where({ universityid: universityid }) // Use 'universityid' for consistency
      .first();

    if (!university) {
      return res.status(404).json({
        status: false,
        message: "University not found",
      });
    }

    // Check if the course exists under the given university
    const course = await db("courses")
      .where({ universityid: universityid, courseid: courseid }) // Ensure correct course under the university
      .first();

    if (!course) {
      return res.status(404).json({
        status: false,
        message: "Course not found for the specified university",
      });
    }

    // Create the department and link it to the university and course
    const departmentData = {
      universityid: university.universityid,
      courseid: course.courseid, // This should match the actual column name
      departmentname,
      departmentdescription,
    };

    // Call the service to create the department
    const response = await service.createDepartment(departmentData);

    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Department created successfully",
      data: response.data || response,
    });
  } catch (error) {
    console.error("Error in createDepartment:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.editDepartment = async (req, res) => {
  try {
    const {
      departmentid, // Department ID
      universityid, // University ID
      courseid,
      departmentname, // Department Name
      departmentdescription, // Department departmentdescription
    } = req.body;

    // Ensure departmentid is provided
    if (!departmentid) {
      return res
        .status(400)
        .json({ status: false, message: "Department ID is required" });
    }

    // Define validation schema for the department fields
    const schema = Joi.object({
      departmentid: Joi.number().integer().required().messages({
        "any.required": "Department ID is required",
        "number.base": "Department ID must be a valid number",
      }),
      universityid: Joi.number().integer().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a valid number",
      }),
      courseid: Joi.number().integer().required().messages({
        "any.required": "Course ID is required",
      }),
      departmentname: Joi.string().optional().messages({
        "string.base": "Department name must be a string",
      }),
      departmentdescription: Joi.string().optional().messages({
        "string.base": "departmentdescription must be a string",
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

    // Call the service function to update the department
    const response = await service.editDepartment(req.body); // Pass the whole req.body object

    // Return the response
    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Department updated successfully",
      data: response.data || {},
    });
  } catch (error) {
    console.error("Error in editDepartment:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.getDepartment = async (req, res) => {
  try {
    // Extract query parameters for filtering (e.g., departmentid, universityid, departmentname)
    const { departmentid, universityid, departmentname } = req.query;

    // Call the service to fetch departments with the filters, if provided
    const response = await service.getDepartment({
      departmentid,
      universityid,
      departmentname,
    });

    if (!response || response.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No departments found matching the criteria",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Departments fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in getDepartment:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentid } = req.body; // Get Department ID from request body

    // Validate the provided departmentid
    if (!departmentid) {
      return res.status(400).json({
        status: false,
        message: "Department ID is required",
      });
    }

    // Call the service function to delete the department
    const response = await service.deleteDepartment({ departmentid });

    // Check if the department was not found
    if (response.code === 404) {
      return res.status(404).json({
        status: false,
        message: response.message,
      });
    }

    // Return success message if deletion was successful
    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteDepartment:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.updateDepartmentStatus = async (req, res) => {
  try {
    const response = await service.updateDepartmentStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      data: response.data || null, // Ensure `data` is returned properly
    });
  } catch (error) {
    console.error("Error updating department status:", error);

    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
