const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

module.exports.getCountries = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    const result = {
      ...req.body,
      // tenantid,
      // userid,
    };
    const schema = Joi.object({
      countryid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Countryid ID must be a number or empty",
      }),
      // tenantid: Joi.number().required().messages({
      //   "any.required": "Tenant ID is required",
      //   "number.base": "Tenant ID must be a number",
      // }),
      // userid: Joi.number().required().messages({
      //   "any.required": "User ID is required",
      //   "number.base": "User ID must be a number",
      // }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getCountries(result);

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch countries",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to fetch countries data",
      response: [],
    });
  }
};

module.exports.getAllCountries = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    const result = {
      ...req.body,
      // tenantid,
      // userid,
    };
    // const schema = Joi.object({
    //   countryid: Joi.alternatives(
    //     Joi.number().allow(""),
    //     Joi.number()
    //   ).messages({
    //     "number.base": "Countryid ID must be a number or empty",
    //   }),
    //   // tenantid: Joi.number().required().messages({
    //   //   "any.required": "Tenant ID is required",
    //   //   "number.base": "Tenant ID must be a number",
    //   // }),
    //   // userid: Joi.number().required().messages({
    //   //   "any.required": "User ID is required",
    //   //   "number.base": "User ID must be a number",
    //   // }),
    // }).required();

    // const { error } = schema.validate(result);
    // if (error) {
    //   return res.status(400).send({
    //     status: false,
    //     message: error.details[0]?.message || "Validation error",
    //   });
    // }
    const response = await service.getAllCountries();

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch countries",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to fetch countries data",
      response: [],
    });
  }
};

module.exports.getStates = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    const result = {
      ...req.body,
      // tenantid,
      // userid,
    };
    const schema = Joi.object({
      countryid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Country ID must be a number or empty",
      }),
      // tenantid: Joi.number().required().messages({
      //   "any.required": "Tenant ID is required",
      //   "number.base": "Tenant ID must be a number",
      // }),
      // userid: Joi.number().required().messages({
      //   "any.required": "User ID is required",
      //   "number.base": "User ID must be a number",
      // }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getStates(result);

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch states",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to fetch states data",
      response: [],
    });
  }
};

module.exports.getCities = async (req, res) => {
  try {
    // const tenantid = req.headers["tenantid"];
    // const userid = req.headers["userid"];
    const result = {
      ...req.body,
      // tenantid,
      // userid,
    };
    const schema = Joi.object({
      countryid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Country ID must be a number or empty",
      }),
      stateid: Joi.alternatives(Joi.number().allow(""), Joi.number()).messages({
        "number.base": "State ID must be a number or empty",
      }),
      // tenantid: Joi.number().required().messages({
      //   "any.required": "Tenant ID is required",
      //   "number.base": "Tenant ID must be a number",
      // }),
      // userid: Joi.number().required().messages({
      //   "any.required": "User ID is required",
      //   "number.base": "User ID must be a number",
      // }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }
    const response = await service.getCities(result);

    // Safety check to ensure response object is properly structured
    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(200).send({
        status: false,
        message: "Unexpected error occurred while fetch cities",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: false,
      message: "Failed to fetch cities data",
      response: [],
    });
  }
};

