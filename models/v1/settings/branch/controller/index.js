const service = require("../service/index");
const Joi = require("joi");
const _ = require("lodash");

module.exports.addBranch = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      branchname: Joi.string().required().messages({
        "any.required": "Branch name is required",
        "string.base": "Branch name must be a string",
      }),
      branchimage: Joi.string().allow("").uri().messages({
        "string.base": "Branch image must be a string",
        "string.uri": "Branch image must be a valid URL",
      }),
      branchaddress: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Branch Address must be a string or empty",
      }),
      gstno: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages({
        "string.base": "GST No be a string or empty",
      }),
      latitude: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages(
        {
          "string.base": "Latitude be a string or empty",
        }
      ),
      longitude: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Longitude be a string or empty",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.addBranch(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while creating branch",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to add branch",
    });
  }
};

module.exports.editBranch = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      branchid: Joi.number().required().messages({
        "any.required": "Branch ID is required",
        "number.base": "Branch ID must be a number",
      }),
      branchname: Joi.string().required().messages({
        "any.required": "Branch name is required",
        "string.base": "Branch name must be a string",
      }),
      branchimage: Joi.string().allow("").uri().messages({
        "string.base": "Branch image must be a string",
        "string.uri": "Branch image must be a valid URL",
      }),
      branchaddress: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Branch Address must be a string or empty",
      }),
      gstno: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages({
        "string.base": "GST No be a string or empty",
      }),
      latitude: Joi.alternatives(Joi.string().allow(""), Joi.string()).messages(
        {
          "string.base": "Latitude be a string or empty",
        }
      ),
      longitude: Joi.alternatives(
        Joi.string().allow(""),
        Joi.string()
      ).messages({
        "string.base": "Longitude be a string or empty",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.editBranch(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while editing branch",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to edit branch",
    });
  }
};

module.exports.getBranch = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      key: Joi.number().required().messages({
        "any.required": "Key ID is required",
        "number.base": "Key ID must be a number",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      branchid: Joi.alternatives(
        Joi.number().allow(""),
        Joi.number()
      ).messages({
        "number.base": "Branch ID must be a number or empty",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.getBranch(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while fetch branch",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
      response: response.response,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to retrieved branch data",
    });
  }
};

module.exports.updateBranchStatus = async (req, res) => {
  try {
    const tenantid = req.headers["tenantid"];
    const userid = req.headers["userid"];
    const result = {
      ...req.body,
      tenantid,
      userid,
    };

    const schema = Joi.object({
      key: Joi.number().required().messages({
        "any.required": "Key ID is required",
        "number.base": "Key ID must be a number",
      }),
      tenantid: Joi.number().required().messages({
        "any.required": "Tenant ID is required",
        "number.base": "Tenant ID must be a number",
      }),
      userid: Joi.number().required().messages({
        "any.required": "User ID is required",
        "number.base": "User ID must be a number",
      }),
      branchid: Joi.number().required().messages({
        "any.required": "Branch ID is required",
        "number.base": "Branch ID must be a number",
      }),
    }).required();

    const { error } = schema.validate(result);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0]?.message || "Validation error",
      });
    }

    const response = await service.updateBranchStatus(result);

    if (
      !response ||
      typeof response.code !== "number" ||
      typeof response.status !== "boolean"
    ) {
      return res.status(500).send({
        status: false,
        message: "Unexpected error occurred while updating branch status",
      });
    }

    return res.status(response.code).send({
      status: response.status,
      message: response.message,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: "Failed to update branch status",
    });
  }
};