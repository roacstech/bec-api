const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

module.exports.createLanguageTest = async (req, res) => {
  try {
    const db = global.dbConnection;

    // Define schema for validation
    const schema = Joi.object({
      languagetestname: Joi.string().required().messages({
        "any.required": "Referral type name is required",
        "string.base": "Referral type name must be a string",
      }),
    }).required();

    // Validate request data
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.createLanguageTest(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.error("Error saving referral type data:", err);
    return res.status(500).send({
      status: false,
      message: "Failed to save referral type data",
    });
  }
};

module.exports.getLanguageTests = async (req, res) => {
  try {
    const response = await service.getLanguageTests(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.error("Error fetching referral types:", err);
    return res.status(500).send({ status: false, message: "Server error" });
  }
};

module.exports.editLanguageTest = async (req, res) => {
  try {
    // Validate request data
    const schema = Joi.object({
      languagetestid: Joi.number().required().messages({
        "any.required": "Referral Type ID is required",
        "number.base": "Referral Type ID must be a number",
      }),
      languagetestname: Joi.string().required().messages({
        "any.required": "Referral Type Name is required",
        "string.base": "Referral Type Name must be a string",
      }),
    }).required();

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.editLanguageTest(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.error("Error updating referral type:", err);
    return res.status(500).send({ status: false, message: "Server error" });
  }
};

module.exports.updateLanguageTestStatus = async (req, res) => {
  console.log("req.body", req.body);

  try {
    // Validate request data
    const schema = Joi.object({
      languagetestid: Joi.number().required().messages({
        "any.required": "Language Test ID is required", // Changed message to reflect language test
        "number.base": "Language Test ID must be a number", // Changed message
      }),
      key: Joi.number().required().messages({
        "any.required": "Key is required",
        "number.base": "Key must be a number",
      }),
    }).required();

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    // Call service function
    const response = await service.updateLanguageTestStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (error) {
    console.error(
      "Error updating language test status:", // Updated log message
      error,
      "Request Data:",
      req.body
    );

    return res.status(500).send({
      status: false,
      message: "Internal server error!",
    });
  }
};
