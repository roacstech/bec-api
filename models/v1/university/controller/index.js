const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");
// new requirement added to the customer projects and buildings
module.exports.createUniversity = async (req, res) => {
  try {
    const {
      universityname,
      universitylocation,
      universityyear,
      universitydescription,
    } = req.body;
    // Define validation schema
    const schema = Joi.object({
      universityname: Joi.string().required().messages({
        "any.required": "University name is required",
        "string.base": "University name must be a string",
      }),
      universitylocation: Joi.string().required().messages({
        "any.required": "universitylocation is required",
        "string.base": "universitylocation must be a string",
      }),
      universityyear: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .required()
        .messages({
          "any.required": "Established universityyear is required",
          "number.base": "Established universityyear must be a valid number",
          "number.min": "Established universityyear should be after 1800",
          "number.max": "Established universityyear cannot be in the future",
        }),
      universitydescription: Joi.string().required().messages({
        "any.required": "universitydescription is required",
        "string.base": "universitydescription must be a string",
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
    // Call the service function to create a university and await the response
    const response = await service.createUniversity(req.body);
    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "University created successfully",
      data: response.data || response,
    });
  } catch (error) {
    console.error("Error in createUniversity:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
module.exports.editUniversity = async (req, res) => {
  try {
    const {
      universityid,
      universityname,
      universitylocation,
      universityyear,
      universitydescription,
    } = req.body;
    if (!universityid) {
      return res
        .status(400)
        .json({ status: false, message: "University ID is required" });
    }
    // Define validation schema
    const schema = Joi.object({
      universityid: Joi.number().integer().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a valid number",
      }),
      universityname: Joi.string().optional().messages({
        "string.base": "University name must be a string",
      }),
      universitylocation: Joi.string().optional().messages({
        "string.base": "universitylocation must be a string",
      }),
      universityyear: Joi.number()
        .integer()
        .min(1800)
        .max(new Date().getFullYear())
        .optional()
        .messages({
          "number.base": "Established universityyear must be a valid number",
          "number.min": "Established universityyear should be after 1800",
          "number.max": "Established universityyear cannot be in the future",
        }),
      universitydescription: Joi.string().optional().messages({
        "string.base": "universitydescription must be a string",
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
    // Call the service function to update the university
    const response = await service.editUniversity(req.body); // Pass the whole req.body object
    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "University updated successfully",
      data: response.data || {},
    });
  } catch (error) {
    console.error("Error in editUniversity:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
module.exports.getUniversity = async (req, res) => {
  try {
    // Extract query parameters if they exist (for filtering purposes)
    const { universityid, universitylocation, universityyear } = req.query;
    // Call the service to fetch universities with the filters, if provided
    const response = await service.getUniversity({
      universityid,
      universitylocation,
      universityyear,
    });
    if (!response || response.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No universities found matching the criteria",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Universities fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error in getUniversity:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
module.exports.deleteUniversity = async (req, res) => {
  try {
    const { universityid } = req.body; // Get University ID from request body
    // Validate the provided ID
    if (!universityid) {
      return res.status(400).json({
        status: false,
        message: "University ID is required",
      });
    }
    // Call the service function to delete the university
    const response = await service.deleteUniversity(universityid);
    // Check if the university was not found
    if (response.code === 404) {
      return res.status(404).json({
        status: false,
        message: response.message,
      });
    }
    // Return success message if deletion was successful
    return res.status(response.code || 200).json({
      status: response.status || true,
      message: response.message || "University deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUniversity:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports.updateUniversityStatus = async (req, res) => {
  try {
    const response = await service.updateUniversityStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      data: response.data || null, // Ensure `data` is returned properly
    });
  } catch (error) {
    console.error("Error updating university status:", error);

    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
