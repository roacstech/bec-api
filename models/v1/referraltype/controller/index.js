const service = require("../service/index");
const _ = require("lodash");
const Joi = require("joi");

module.exports.createReferralType = async (req, res) => {
  try {
    const db = global.dbConnection;

    // Define schema for validation
    const schema = Joi.object({
      referraltypename: Joi.string().required().messages({
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

    const response = await service.createReferralType(req.body);

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

module.exports.getReferralTypes = async (req, res) => {
  try {

    const response = await service.getReferralTypes(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response
    });
    
  } catch (err) {
    console.error("Error fetching referral types:", err);
    return res.status(500).send({ status: false, message: "Server error" });
  }
};

module.exports.editReferralType = async (req, res) => {
  try {

    // Validate request data
    const schema = Joi.object({
      referralTypeId: Joi.number().required().messages({
        "any.required": "Referral Type ID is required",
        "number.base": "Referral Type ID must be a number",
      }),
      referraltypename: Joi.string().required().messages({
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
  
    const response = await service.editReferralType(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
    
  } catch (err) {
    console.error("Error updating referral type:", err);
    return res.status(500).send({ status: false, message: "Server error" });
  }
};

module.exports.updateReferralTypeStatus = async (req, res) => {
  try {

     // Validate request data
     const schema = Joi.object({
      referralTypeId: Joi.number().required().messages({
        "any.required": "Referral Type ID is required",
        "number.base": "Referral Type ID must be a number",
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
    const response = await service.updateReferralTypeStatus(req.body);

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
    
  } catch (error) {
    console.error(
      "Error updating referral type status:",
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
