const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

module.exports.createCheckList = async (req, res) => {
  // Log received body once to debug incoming request
  console.log("Received body:", req.body);

  try {
    const schema = Joi.object({
      checklistname: Joi.string().required().messages({
        "any.required": "Checklist name is required",
        "string.base": "Checklist name must be a string",
      }),
      universityid: Joi.number().integer().positive().required().messages({
        "any.required": "University ID is required",
        "number.base": "University ID must be a number",
        "number.integer": "University ID must be an integer",
        "number.positive": "University ID must be a positive number",
      }),
      checklist: Joi.array()
        .items(
          Joi.object({
            documenttypeid: Joi.number()
              .integer()
              .positive()
              .required()
              .messages({
                "any.required": "Document Type ID is required",
                "number.base": "Document Type ID must be a number",
                "number.integer": "Document Type ID must be an integer",
                "number.positive": "Document Type ID must be a positive number",
              }),
            documentid: Joi.number().integer().positive().required().messages({
              "any.required": "Document ID is required",
              "number.base": "Document ID must be a number",
              "number.integer": "Document ID must be an integer",
              "number.positive": "Document ID must be a positive number",
            }),
          })
        )
        .min(1)
        .required(),
    }).required();

    // Validate the request body against the schema
    const { error } = schema.validate(req.body);

    // If validation fails, send a 400 response with the error message
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    // Call the service function to create the checklist
    const response = await service.createCheckList(req.body);

    // Return the response from the service
    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      data: response.data || null,
    });
  } catch (error) {
    console.log("Error saving checklist data:", error);
    return res.status(500).send({
      status: false,
      message: "Server error",
    });
  }
};

module.exports.getchecklist = async (req, res) => {
  try {
    // Fetch all checklist items
    const response = await service.getchecklist(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.error("Error fetching checklist data:", err);
    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};

module.exports.editCheckList = async (req, res) => {
  try {
    // Validate the incoming request data using Joi

    // Joi schema to validate the request body
    const checklistValidationSchema = Joi.object({
      checklistid: Joi.number().required().messages({
        "number.base": "Checklist ID must be a number",
        "any.required": "Checklist ID is required",
      }),
      checklistname: Joi.string().min(1).max(255).required().messages({
        "string.base": "Checklist name must be a string",
        "string.empty": "Checklist name cannot be empty",
        "any.required": "Checklist name is required",
      }),
      universityid: Joi.number().required().messages({
        "number.base": "University ID must be a number",
        "any.required": "University ID is required",
      }),
      checklist: Joi.array()
        .items(
          Joi.object({
            documenttypeid: Joi.number().required().messages({
              "number.base": "Document Type ID must be a number",
              "any.required": "Document Type ID is required",
            }),
            documentid: Joi.number().required().messages({
              "number.base": "Document ID must be a number",
              "any.required": "Document ID is required",
            }),
          })
        )
        .required()
        .messages({
          "array.base": "Checklist items must be an array",
          "any.required": "Checklist items are required",
        }),
    });

    const { error } = checklistValidationSchema.validate(req.body);

    // If validation fails, send a 400 status with the error details
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
      });
    }

    // Destructure the validated request body
    const { checklistid, checklistname, universityid, checklist } = req.body;

    // Call the service to edit the checklist
    const response = await service.editCheckList({
      checklistid,
      checklistname,
      universityid,
      checklist,
    });

    // Return the response to the client
    return res.status(response.code).json({
      status: response.status,
      message: response.message,
      data: response.data,
    });
  } catch (err) {
    console.error("Error in controller:", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

module.exports.updateCheckListStatus = async (req, res) => {
  try {
    const response = await service.updateChecklistStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (error) {
    console.log("error", error);

    return res.send({
      status: false,
      message: "Internal server error!",
    });
  }
};
